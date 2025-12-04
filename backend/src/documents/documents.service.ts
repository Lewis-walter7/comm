import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateDocumentDto, UpdateDocumentDto } from './dto/document.dto';
import { ProjectRole } from '@prisma/client';

@Injectable()
export class DocumentsService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, dto: CreateDocumentDto) {
        // Check if user has permission in project
        await this.checkPermission(userId, dto.projectId, [ProjectRole.OWNER, ProjectRole.EDITOR]);

        // Fetch the project to get the workspaceId
        const project = await this.prisma.project.findUnique({
            where: { id: dto.projectId },
            select: { workspaceId: true },
        });

        if (!project) {
            throw new NotFoundException('Project not found');
        }

        return this.prisma.document.create({
            data: {
                title: dto.title,
                projectId: dto.projectId,
                workspaceId: project.workspaceId,
                createdById: userId,
                encryptedContent: '', // Initial empty content
            },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
    }

    async findAll(userId: string, projectId?: string) {
        if (projectId) {
            // Check if user has access to project
            await this.checkPermission(userId, projectId, [ProjectRole.OWNER, ProjectRole.EDITOR, ProjectRole.VIEWER]);

            return this.prisma.document.findMany({
                where: { projectId },
                include: {
                    createdBy: {
                        select: {
                            id: true,
                            name: true,
                        },
                    },
                },
                orderBy: {
                    updatedAt: 'desc',
                },
            });
        }

        // Fetch all documents from projects where user is a member
        return this.prisma.document.findMany({
            where: {
                project: {
                    members: {
                        some: {
                            userId,
                        },
                    },
                },
            },
            include: {
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                project: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });
    }

    async findOne(userId: string, id: string) {
        const document = await this.prisma.document.findUnique({
            where: { id },
            include: {
                project: {
                    include: {
                        members: true,
                    },
                },
            },
        });

        if (!document) {
            throw new NotFoundException('Document not found');
        }

        // Check permission
        if (document.project) {
            const member = document.project.members.find((m) => m.userId === userId);
            if (!member) {
                throw new ForbiddenException('Access denied');
            }
        } else if (document.createdById !== userId) {
            // If no project association, only creator can access
            throw new ForbiddenException('Access denied');
        }

        return document;
    }

    async update(userId: string, id: string, dto: UpdateDocumentDto) {
        const document = await this.findOne(userId, id);

        // Check permission (Editor or Owner)
        // Check permission (Editor or Owner)
        if (document.projectId) {
            await this.checkPermission(userId, document.projectId, [ProjectRole.OWNER, ProjectRole.EDITOR]);
        }

        return this.prisma.document.update({
            where: { id },
            data: {
                title: dto.title,
            },
        });
    }

    async remove(userId: string, id: string) {
        const document = await this.findOne(userId, id);

        // Check permission (Owner only for deletion?) Or Editor too? Let's say Owner and Editor.
        // Check permission (Owner only for deletion?) Or Editor too? Let's say Owner and Editor.
        if (document.projectId) {
            await this.checkPermission(userId, document.projectId, [ProjectRole.OWNER, ProjectRole.EDITOR]);
        }

        return this.prisma.document.delete({
            where: { id },
        });
    }

    async saveContent(id: string, encryptedContent: string) {
        return this.prisma.document.update({
            where: { id },
            data: {
                encryptedContent,
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
