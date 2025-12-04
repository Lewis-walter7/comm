import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { CreateWorkspaceDto } from './dto/create-workspace.dto.ts';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto.ts';
import { WorkspaceRole, MemberStatus } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class WorkspacesService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) { }

  async create(userId: string, createWorkspaceDto: CreateWorkspaceDto) {
    // Create workspace and add creator as OWNER
    const workspace = await this.prisma.workspace.create({
      data: {
        name: createWorkspaceDto.name,
        description: createWorkspaceDto.description,
        ownerId: userId,
        members: {
          create: {
            userId,
            role: WorkspaceRole.OWNER,
          },
        },
        activities: {
          create: {
            userId,
            type: 'WORKSPACE_CREATED',
            description: `Created workspace "${createWorkspaceDto.name}"`,
          },
        },
      },
      include: {
        members: true,
      },
    });

    return workspace;
  }

  async findAllForUser(userId: string) {
    const workspaces = await this.prisma.workspace.findMany({
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
            email: true,
            avatarUrl: true,
          },
        },
        members: {
          where: { userId },
          select: {
            status: true,
            role: true,
          },
        },
        _count: {
          select: {
            members: true,
            projects: true,
          },
        },
      },
    });

    // Add member status to each workspace
    return workspaces.map(workspace => ({
      ...workspace,
      memberStatus: workspace.members[0]?.status,
      memberRole: workspace.members[0]?.role,
    }));
  }

  async findOne(id: string, userId: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
              },
            },
          },
        },
        projects: {
          include: {
            _count: {
              select: {
                members: true,
                documents: true,
              },
            },
          },
        },
      },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    // Check if user is a member
    const isMember = workspace.members.some((m) => m.userId === userId);
    if (!isMember) {
      throw new ForbiddenException('You do not have access to this workspace');
    }

    // Generate invite code if it doesn't exist
    if (!workspace.inviteCode) {
      const code =
        Math.random().toString(36).substring(2, 5).toUpperCase() + '-' +
        Math.random().toString(36).substring(2, 5).toUpperCase() + '-' +
        Math.random().toString(36).substring(2, 5).toUpperCase();

      await this.prisma.workspace.update({
        where: { id },
        data: { inviteCode: code },
      });

      workspace.inviteCode = code;
    }

    return workspace;
  }

  async update(id: string, userId: string, updateWorkspaceDto: UpdateWorkspaceDto) {
    await this.checkPermission(id, userId, [WorkspaceRole.OWNER, WorkspaceRole.ADMIN]);

    return this.prisma.workspace.update({
      where: { id },
      data: updateWorkspaceDto,
    });
  }

  async remove(id: string, userId: string) {
    await this.checkPermission(id, userId, [WorkspaceRole.OWNER]);

    return this.prisma.workspace.delete({
      where: { id },
    });
  }

  async addMember(workspaceId: string, userId: string, email: string, role: WorkspaceRole = WorkspaceRole.MEMBER) {
    await this.checkPermission(workspaceId, userId, [WorkspaceRole.OWNER, WorkspaceRole.ADMIN]);

    const userToAdd = await this.prisma.user.findUnique({ where: { email } });
    if (!userToAdd) {
      throw new NotFoundException('User not found');
    }

    // Check if already member
    const existingMember = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: userToAdd.id,
        },
      },
    });

    if (existingMember) {
      return existingMember;
    }

    return this.prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId: userToAdd.id,
        role,
      },
    });
  }

  private async checkPermission(workspaceId: string, userId: string, allowedRoles: WorkspaceRole[]) {
    const member = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    if (!member || !allowedRoles.includes(member.role)) {
      throw new ForbiddenException('Insufficient permissions');
    }
  }

  async joinByCode(userId: string, inviteCode: string) {
    // Find workspace by invite code
    const workspace = await this.prisma.workspace.findUnique({
      where: { inviteCode },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!workspace) {
      throw new NotFoundException('Invalid invite code');
    }

    // Check if user is already a member
    const existingMember = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: workspace.id,
          userId,
        },
      },
    });

    if (existingMember) {
      if (existingMember.status === MemberStatus.PENDING) {
        return { message: 'Your request to join is pending approval', workspace, status: 'pending' };
      }
      return { message: 'Already a member of this workspace', workspace, status: 'active' };
    }

    // Get user info for notification
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true, email: true },
    });

    // Add user as PENDING member
    await this.prisma.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId,
        role: WorkspaceRole.MEMBER,
        status: MemberStatus.PENDING,
      },
    });

    // Create activity log
    await this.prisma.activity.create({
      data: {
        userId,
        workspaceId: workspace.id,
        type: 'WORKSPACE_JOIN_REQUEST',
        description: `${user?.name} requested to join "${workspace.name}"`,
      },
    });

    // Notify workspace owner
    await this.notificationsService.createNotification({
      userId: workspace.ownerId,
      type: 'WORKSPACE_JOIN_REQUEST',
      title: 'New Join Request',
      message: `${user?.name} (${user?.email}) requested to join "${workspace.name}"`,
      link: `/dashboard/workspaces/${workspace.id}?tab=members`,
      metadata: {
        workspaceId: workspace.id,
        requestingUserId: userId,
        requestingUserName: user?.name,
        requestingUserEmail: user?.email,
      },
    });

    return {
      message: 'Join request sent successfully. Waiting for owner approval.',
      workspace,
      status: 'pending',
    };
  }

  async verifyInviteCode(inviteCode: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { inviteCode },
      select: {
        id: true,
        name: true,
        description: true,
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            members: true,
          },
        },
      },
    });

    if (!workspace) {
      throw new NotFoundException('Invalid invite code');
    }

    return workspace;
  }

  async inviteByEmail(workspaceId: string, userId: string, email: string) {
    // Verify user has permission to invite
    await this.checkPermission(workspaceId, userId, [WorkspaceRole.OWNER, WorkspaceRole.ADMIN]);

    const workspace = await this.prisma.workspace.findUnique({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    // TODO: Implement email sending logic here
    // For now, just return success
    // In production, you would send an email with a link containing the invite code

    return {
      message: 'Invitation sent successfully',
      email,
      inviteCode: workspace.inviteCode,
    };
  }

  async getPendingMembers(workspaceId: string, userId: string) {
    // Check if user has permission to view pending members
    await this.checkPermission(workspaceId, userId, [WorkspaceRole.OWNER, WorkspaceRole.ADMIN]);

    return this.prisma.workspaceMember.findMany({
      where: {
        workspaceId,
        status: MemberStatus.PENDING,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        joinedAt: 'desc',
      },
    });
  }

  async acceptMemberRequest(workspaceId: string, memberId: string, userId: string) {
    // Check if user has permission to accept members
    await this.checkPermission(workspaceId, userId, [WorkspaceRole.OWNER, WorkspaceRole.ADMIN]);

    // Get the pending member
    const member = await this.prisma.workspaceMember.findUnique({
      where: { id: memberId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Member request not found');
    }

    if (member.workspaceId !== workspaceId) {
      throw new ForbiddenException('Member does not belong to this workspace');
    }

    if (member.status !== MemberStatus.PENDING) {
      throw new ForbiddenException('Member is not pending approval');
    }

    // Update member status to ACTIVE
    const updatedMember = await this.prisma.workspaceMember.update({
      where: { id: memberId },
      data: { status: MemberStatus.ACTIVE },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
      },
    });

    // Create activity log
    await this.prisma.activity.create({
      data: {
        userId: member.userId,
        workspaceId,
        type: 'MEMBER_ADDED',
        description: `${member.user.name} joined "${member.workspace.name}"`,
      },
    });

    // Notify the user that they were accepted
    await this.notificationsService.createNotification({
      userId: member.userId,
      type: 'WORKSPACE_INVITE',
      title: 'Join Request Accepted',
      message: `Your request to join "${member.workspace.name}" has been accepted!`,
      link: `/dashboard/workspaces/${workspaceId}`,
      metadata: {
        workspaceId,
        workspaceName: member.workspace.name,
      },
    });

    return updatedMember;
  }

  async rejectMemberRequest(workspaceId: string, memberId: string, userId: string) {
    // Check if user has permission to reject members
    await this.checkPermission(workspaceId, userId, [WorkspaceRole.OWNER, WorkspaceRole.ADMIN]);

    // Get the pending member
    const member = await this.prisma.workspaceMember.findUnique({
      where: { id: memberId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        workspace: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!member) {
      throw new NotFoundException('Member request not found');
    }

    if (member.workspaceId !== workspaceId) {
      throw new ForbiddenException('Member does not belong to this workspace');
    }

    if (member.status !== MemberStatus.PENDING) {
      throw new ForbiddenException('Member is not pending approval');
    }

    // Delete the pending member record
    await this.prisma.workspaceMember.delete({
      where: { id: memberId },
    });

    // Notify the user that they were rejected
    await this.notificationsService.createNotification({
      userId: member.userId,
      type: 'WORKSPACE_INVITE',
      title: 'Join Request Declined',
      message: `Your request to join "${member.workspace.name}" was declined.`,
      link: '/dashboard',
      metadata: {
        workspaceId,
        workspaceName: member.workspace.name,
      },
    });

    return { message: 'Member request rejected' };
  }
}
