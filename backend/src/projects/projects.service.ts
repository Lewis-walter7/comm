import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateProjectDto, UpdateProjectDto, AddMemberDto, UpdateMemberRoleDto } from './dto/project.dto';
import { ProjectRole, MemberStatus } from '@prisma/client';

@Injectable()
export class ProjectsService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, dto: CreateProjectDto) {
        let workspaceId: string;

        // If workspaceId is provided, use it (after verifying user has access)
        if (dto.workspaceId) {
            const workspace = await this.prisma.workspace.findFirst({
                where: {
                    id: dto.workspaceId,
                    members: {
                        some: {
                            userId,
                            status: MemberStatus.ACTIVE,
                        },
                    },
                },
            });

            if (!workspace) {
                throw new ForbiddenException('Access denied to workspace or workspace not found (pending approval?)');
            }

            workspaceId = dto.workspaceId;
        } else {
            // Find or create a default workspace for the user
            let workspace = await this.prisma.workspace.findFirst({
                where: {
                    members: {
                        some: {
                            userId,
                        },
                    },
                },
            });

            // If user has no workspace, create a default one
            if (!workspace) {
                workspace = await this.prisma.workspace.create({
                    data: {
                        name: 'My Workspace',
                        description: 'Default workspace',
                        ownerId: userId,
                        members: {
                            create: {
                                userId,
                                role: 'OWNER',
                            },
                        },
                    },
                });
            }

            workspaceId = workspace.id;
        }

        return this.prisma.project.create({
            data: {
                name: dto.name,
                description: dto.description,
                ownerId: userId,
                workspaceId,
                members: {
                    create: {
                        userId,
                        role: ProjectRole.OWNER,
                    },
                },
            },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
            },
        });
    }

    async findAll(userId: string) {
        return this.prisma.project.findMany({
            where: {
                members: {
                    some: {
                        userId,
                    },
                },
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                _count: {
                    select: {
                        members: true,
                        documents: true,
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });
    }

    async findOne(userId: string, id: string) {
        const project = await this.prisma.project.findUnique({
            where: { id },
            include: {
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                            },
                        },
                    },
                },
                documents: {
                    select: {
                        id: true,
                        title: true,
                        updatedAt: true,
                    },
                },
            },
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        // Check if user is a member
        const isMember = project.members.some((member) => member.userId === userId);
        if (!isMember) {
            throw new ForbiddenException('Access denied');
        }

        return project;
    }

    async update(userId: string, id: string, dto: UpdateProjectDto) {
        await this.checkPermission(userId, id, [ProjectRole.OWNER, ProjectRole.EDITOR]);

        return this.prisma.project.update({
            where: { id },
            data: dto,
        });
    }

    async remove(userId: string, id: string) {
        await this.checkPermission(userId, id, [ProjectRole.OWNER]);

        return this.prisma.project.delete({
            where: { id },
        });
    }

    async addMember(userId: string, projectId: string, dto: AddMemberDto) {
        await this.checkPermission(userId, projectId, [ProjectRole.OWNER]);

        // Check if user exists
        const userToAdd = await this.prisma.user.findUnique({
            where: { id: dto.userId },
        });

        if (!userToAdd) {
            throw new NotFoundException('User to add not found');
        }

        return this.prisma.projectMember.create({
            data: {
                projectId,
                userId: dto.userId,
                role: dto.role || ProjectRole.VIEWER,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }

    async removeMember(userId: string, projectId: string, memberId: string) {
        await this.checkPermission(userId, projectId, [ProjectRole.OWNER]);

        // Prevent removing self if owner (should delete project instead)
        // But here memberId is the ID of the user to remove, or the ID of the membership?
        // Let's assume memberId is the userId to remove for simplicity in API, or the membership ID.
        // The API usually takes userId to remove from project.
        // Let's assume memberId is the userId to remove.

        const project = await this.prisma.project.findUnique({
            where: { id: projectId },
        });

        if (project?.ownerId === memberId) {
            throw new ForbiddenException('Cannot remove owner from project');
        }

        // We need to find the membership record
        const membership = await this.prisma.projectMember.findUnique({
            where: {
                projectId_userId: {
                    projectId,
                    userId: memberId,
                },
            },
        });

        if (!membership) {
            throw new NotFoundException('Member not found in project');
        }

        return this.prisma.projectMember.delete({
            where: {
                id: membership.id,
            },
        });
    }

    private async checkPermission(userId: string, projectId: string, roles: ProjectRole[]) {
        const member = await this.prisma.projectMember.findUnique({
            where: {
                projectId_userId: {
                    projectId,
                    userId,
                },
            },
        });

        if (!member || !roles.includes(member.role)) {
            throw new ForbiddenException('Insufficient permissions');
        }
    }
}
