import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import {
  CreateGroupChatDto,
  UpdateGroupChatDto,
  AddGroupMemberDto,
  UpdateGroupMemberRoleDto,
  RemoveGroupMemberDto,
  GroupMemberPreferencesDto,
  PinMessageDto,
  SearchGroupMessagesDto,
  MentionMessageDto,
  GroupChatDto,
  GroupChatMemberDto,
  GroupChatInviteDto,
} from "./dto/chat.dto";
import {
  ConversationType,
  ConversationRole,
  WorkspaceRole,
  Prisma,
} from "@prisma/client";
import { ChatService } from "./chat.service";

@Injectable()
export class GroupChatService {
  constructor(
    private prisma: PrismaService,
    private chatService: ChatService,
  ) {}

  // Group Chat Creation
  async createGroupChat(
    userId: string,
    dto: CreateGroupChatDto,
  ): Promise<GroupChatDto> {
    // Check workspace access
    await this.checkWorkspaceAccess(userId, dto.workspaceId);

    // Validate workspace has more than 2 members
    await this.validateWorkspaceMinimumMembers(dto.workspaceId);

    // Validate initial members are workspace members
    await this.validateWorkspaceMembers(dto.workspaceId, dto.initialMembers);

    // Check maximum members limit
    if (dto.maxMembers && dto.initialMembers.length + 1 > dto.maxMembers) {
      throw new BadRequestException(
        `Cannot create group with more than ${dto.maxMembers} members`,
      );
    }

    // Create the group chat
    const groupChat = await this.prisma.conversation.create({
      data: {
        workspaceId: dto.workspaceId,
        type: ConversationType.GROUP,
        name: dto.name,
        description: dto.description,
        icon: dto.icon,
        createdById: userId,
        isPrivate: dto.isPrivate || false,
        maxMembers: dto.maxMembers || 100,
        allowMemberInvite: dto.allowMemberInvite !== false,
        members: {
          create: [
            // Creator is always an admin
            {
              userId: userId,
              role: ConversationRole.ADMIN,
            },
            // Add initial members
            ...dto.initialMembers.map((memberId) => ({
              userId: memberId,
              role: ConversationRole.MEMBER,
            })),
          ],
        },
      },
      include: this.getGroupChatInclude(),
    });

    // Create system message about group creation
    await this.createSystemMessage(
      groupChat.id,
      userId,
      `${groupChat.createdBy.name} created the group "${dto.name}"`,
      { type: "group_created", memberIds: dto.initialMembers },
    );

    return this.formatGroupChat(groupChat);
  }

  // Group Chat Management
  async getGroupChats(
    userId: string,
    workspaceId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<{ chats: GroupChatDto[]; total: number; hasMore: boolean }> {
    await this.checkWorkspaceAccess(userId, workspaceId);

    // Ensure workspace is valid for group chats
    await this.validateWorkspaceMinimumMembers(workspaceId);

    const skip = (page - 1) * limit;

    const [chats, total] = await Promise.all([
      this.prisma.conversation.findMany({
        where: {
          workspaceId: workspaceId,
          type: ConversationType.GROUP,
          members: {
            some: {
              userId: userId,
              leftAt: null,
            },
          },
        },
        include: this.getGroupChatInclude(),
        orderBy: [
          {
            messages: {
              _count: "desc",
            },
          },
          { updatedAt: "desc" },
        ],
        skip,
        take: limit,
      }),
      this.prisma.conversation.count({
        where: {
          workspaceId: workspaceId,
          type: ConversationType.GROUP,
          members: {
            some: {
              userId: userId,
              leftAt: null,
            },
          },
        },
      }),
    ]);

    return {
      chats: chats.map((chat) => this.formatGroupChat(chat)),
      total,
      hasMore: total > skip + chats.length,
    };
  }

  async getGroupChat(
    userId: string,
    conversationId: string,
  ): Promise<GroupChatDto> {
    await this.checkGroupChatAccess(userId, conversationId);

    const groupChat = await this.prisma.conversation.findUnique({
      where: { id: conversationId, type: ConversationType.GROUP },
      include: this.getGroupChatInclude(),
    });

    if (!groupChat) {
      throw new NotFoundException("Group chat not found");
    }

    return this.formatGroupChat(groupChat);
  }

  async updateGroupChat(
    userId: string,
    conversationId: string,
    dto: UpdateGroupChatDto,
  ): Promise<GroupChatDto> {
    await this.checkGroupChatAdminAccess(userId, conversationId);

    const updatedChat = await this.prisma.conversation.update({
      where: { id: conversationId },
      data: {
        name: dto.name,
        description: dto.description,
        icon: dto.icon,
        allowMemberInvite: dto.allowMemberInvite,
        maxMembers: dto.maxMembers,
        updatedAt: new Date(),
      },
      include: this.getGroupChatInclude(),
    });

    // Create system message about group update
    const changes = [];
    if (dto.name) changes.push(`name to "${dto.name}"`);
    if (dto.description) changes.push("description");
    if (dto.icon) changes.push("icon");
    if (changes.length > 0) {
      await this.createSystemMessage(
        conversationId,
        userId,
        `${updatedChat.createdBy.name} updated ${changes.join(", ")}`,
        { type: "group_updated", changes: dto },
      );
    }

    return this.formatGroupChat(updatedChat);
  }

  async deleteGroupChat(userId: string, conversationId: string): Promise<void> {
    const groupChat = await this.prisma.conversation.findUnique({
      where: { id: conversationId, type: ConversationType.GROUP },
      select: { createdById: true, workspaceId: true },
    });

    if (!groupChat) {
      throw new NotFoundException("Group chat not found");
    }

    // Only creator or workspace admin can delete
    if (groupChat.createdById !== userId) {
      await this.checkWorkspaceAdminAccess(userId, groupChat.workspaceId);
    }

    // Soft delete - mark all messages as deleted and remove all members
    await this.prisma.$transaction(async (tx) => {
      // Mark all messages as deleted
      await tx.message.updateMany({
        where: { conversationId },
        data: { deletedAt: new Date() },
      });

      // Remove all members
      await tx.conversationMember.updateMany({
        where: { conversationId },
        data: { leftAt: new Date() },
      });

      // Mark conversation as deleted by updating name
      await tx.conversation.update({
        where: { id: conversationId },
        data: { name: "[Deleted]", deletedAt: new Date() },
      });
    });
  }

  // Member Management
  async addMembers(
    userId: string,
    conversationId: string,
    dto: AddGroupMemberDto,
  ): Promise<GroupChatMemberDto[]> {
    const groupChat = await this.checkGroupChatMemberAccess(
      userId,
      conversationId,
    );

    // Check if member invites are allowed or user is admin
    if (!groupChat.allowMemberInvite) {
      await this.checkGroupChatAdminAccess(userId, conversationId);
    }

    // Validate workspace still meets minimum requirements
    await this.validateWorkspaceMinimumMembers(groupChat.workspaceId);

    // Validate all users are workspace members
    await this.validateWorkspaceMembers(groupChat.workspaceId, dto.userIds);

    // Check max members limit
    const currentMemberCount = await this.prisma.conversationMember.count({
      where: { conversationId, leftAt: null },
    });

    if (
      groupChat.maxMembers &&
      currentMemberCount + dto.userIds.length > groupChat.maxMembers
    ) {
      throw new BadRequestException(
        `Cannot exceed maximum of ${groupChat.maxMembers} members`,
      );
    }

    // Check for existing members
    const existingMembers = await this.prisma.conversationMember.findMany({
      where: {
        conversationId,
        userId: { in: dto.userIds },
        leftAt: null,
      },
      select: { userId: true },
    });

    const existingUserIds = existingMembers.map((m) => m.userId);
    const newUserIds = dto.userIds.filter(
      (id) => !existingUserIds.includes(id),
    );

    if (newUserIds.length === 0) {
      throw new BadRequestException("All specified users are already members");
    }

    // Add new members
    await this.prisma.conversationMember.createMany({
      data: newUserIds.map((userId) => ({
        conversationId,
        userId,
        role: ConversationRole.MEMBER,
      })),
    });

    // Create system message
    const addedUsers = await this.prisma.user.findMany({
      where: { id: { in: newUserIds } },
      select: { name: true },
    });

    await this.createSystemMessage(
      conversationId,
      userId,
      `${addedUsers.map((u) => u.name).join(", ")} ${
        addedUsers.length === 1 ? "was" : "were"
      } added to the group`,
      { type: "members_added", userIds: newUserIds },
    );

    // Return new members
    return this.getGroupMembers(userId, conversationId, newUserIds);
  }

  async removeMember(
    userId: string,
    conversationId: string,
    dto: RemoveGroupMemberDto,
  ): Promise<void> {
    const groupChat = await this.prisma.conversation.findUnique({
      where: { id: conversationId, type: ConversationType.GROUP },
      select: { createdById: true, workspaceId: true },
    });

    if (!groupChat) {
      throw new NotFoundException("Group chat not found");
    }

    // Cannot remove creator
    if (dto.userId === groupChat.createdById) {
      throw new BadRequestException("Cannot remove group creator");
    }

    // Can remove self, or admins can remove others
    if (userId !== dto.userId) {
      await this.checkGroupChatAdminAccess(userId, conversationId);
    }

    const member = await this.prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: dto.userId,
        },
      },
      include: { user: { select: { name: true } } },
    });

    if (!member || member.leftAt) {
      throw new NotFoundException("Member not found");
    }

    // Mark member as left
    await this.prisma.conversationMember.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId: dto.userId,
        },
      },
      data: { leftAt: new Date() },
    });

    // Create system message
    const action = userId === dto.userId ? "left" : "was removed from";
    await this.createSystemMessage(
      conversationId,
      userId,
      `${member.user.name} ${action} the group`,
      { type: "member_removed", userId: dto.userId, reason: dto.reason },
    );
  }

  async updateMemberRole(
    userId: string,
    conversationId: string,
    dto: UpdateGroupMemberRoleDto,
  ): Promise<GroupChatMemberDto> {
    await this.checkGroupChatAdminAccess(userId, conversationId);

    const groupChat = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { createdById: true },
    });

    // Cannot change creator's role
    if (dto.userId === groupChat?.createdById) {
      throw new BadRequestException("Cannot change creator's role");
    }

    const updatedMember = await this.prisma.conversationMember.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId: dto.userId,
        },
      },
      data: { role: dto.role },
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

    // Create system message
    await this.createSystemMessage(
      conversationId,
      userId,
      `${updatedMember.user.name} was ${
        dto.role === ConversationRole.ADMIN ? "promoted to" : "demoted from"
      } admin`,
      { type: "role_changed", userId: dto.userId, newRole: dto.role },
    );

    return this.formatGroupMember(updatedMember);
  }

  async updateMemberPreferences(
    userId: string,
    conversationId: string,
    dto: GroupMemberPreferencesDto,
  ): Promise<GroupChatMemberDto> {
    await this.checkGroupChatAccess(userId, conversationId);

    const updatedMember = await this.prisma.conversationMember.update({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
      data: {
        muteNotifications: dto.muteNotifications,
        customNickname: dto.customNickname,
      },
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

    return this.formatGroupMember(updatedMember);
  }

  async getGroupMembers(
    userId: string,
    conversationId: string,
    userIds?: string[],
  ): Promise<GroupChatMemberDto[]> {
    await this.checkGroupChatAccess(userId, conversationId);

    const members = await this.prisma.conversationMember.findMany({
      where: {
        conversationId,
        leftAt: null,
        ...(userIds && { userId: { in: userIds } }),
      },
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
      orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
    });

    return members.map((member) => this.formatGroupMember(member));
  }

  // Message Features
  async sendMentionMessage(
    userId: string,
    dto: MentionMessageDto,
  ): Promise<any> {
    await this.checkGroupChatAccess(userId, dto.conversationId);

    // Validate mentioned users are group members
    if (dto.mentions.length > 0) {
      const members = await this.prisma.conversationMember.findMany({
        where: {
          conversationId: dto.conversationId,
          userId: { in: dto.mentions },
          leftAt: null,
        },
        select: { userId: true },
      });

      const validMentions = members.map((m) => m.userId);
      dto.mentions = dto.mentions.filter((id) => validMentions.includes(id));
    }

    // Send message with mentions
    const message = await this.prisma.message.create({
      data: {
        conversationId: dto.conversationId,
        userId,
        content: dto.content,
        replyToId: dto.replyToId,
        attachments: dto.attachments ? JSON.stringify(dto.attachments) : null,
        mentions: dto.mentions,
        messageType: "text",
        searchKeywords: this.extractKeywords(dto.content),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        replyTo: {
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
      },
    });

    // Create search index
    if (dto.content.trim()) {
      await this.createMessageSearchIndex(message);
    }

    return message;
  }

  async pinMessage(
    userId: string,
    conversationId: string,
    dto: PinMessageDto,
  ): Promise<void> {
    await this.checkGroupChatAdminAccess(userId, conversationId);

    // Update message as pinned
    await this.prisma.message.update({
      where: { id: dto.messageId, conversationId },
      data: { isPinned: true },
    });

    // Add to conversation pinned messages
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { pinnedMessageIds: true },
    });

    const pinnedIds = conversation?.pinnedMessageIds || [];
    if (!pinnedIds.includes(dto.messageId)) {
      await this.prisma.conversation.update({
        where: { id: conversationId },
        data: {
          pinnedMessageIds: [...pinnedIds, dto.messageId],
        },
      });
    }
  }

  async unpinMessage(
    userId: string,
    conversationId: string,
    messageId: string,
  ): Promise<void> {
    await this.checkGroupChatAdminAccess(userId, conversationId);

    // Update message as unpinned
    await this.prisma.message.update({
      where: { id: messageId, conversationId },
      data: { isPinned: false },
    });

    // Remove from conversation pinned messages
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { pinnedMessageIds: true },
    });

    const pinnedIds = (conversation?.pinnedMessageIds || []).filter(
      (id) => id !== messageId,
    );

    await this.prisma.conversation.update({
      where: { id: conversationId },
      data: { pinnedMessageIds: pinnedIds },
    });
  }

  async getPinnedMessages(
    userId: string,
    conversationId: string,
  ): Promise<any[]> {
    await this.checkGroupChatAccess(userId, conversationId);

    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { pinnedMessageIds: true },
    });

    if (!conversation?.pinnedMessageIds.length) {
      return [];
    }

    const messages = await this.prisma.message.findMany({
      where: {
        id: { in: conversation.pinnedMessageIds },
        deletedAt: null,
      },
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
      orderBy: { createdAt: "desc" },
    });

    return messages;
  }

  // Search Features
  async searchGroupMessages(
    userId: string,
    workspaceId: string,
    dto: SearchGroupMessagesDto,
  ): Promise<{
    messages: any[];
    total: number;
    hasMore: boolean;
  }> {
    await this.checkWorkspaceAccess(userId, workspaceId);

    const skip = ((dto.page || 1) - 1) * (dto.limit || 20);
    const take = dto.limit || 20;

    // Build search conditions
    const searchConditions: any = {
      workspaceId,
      content: {
        search: dto.query,
      },
    };

    if (dto.conversationId) {
      searchConditions.conversationId = dto.conversationId;
    }

    if (dto.authorId) {
      searchConditions.authorId = dto.authorId;
    }

    if (dto.fromDate || dto.toDate) {
      searchConditions.createdAt = {};
      if (dto.fromDate) {
        searchConditions.createdAt.gte = new Date(dto.fromDate);
      }
      if (dto.toDate) {
        searchConditions.createdAt.lte = new Date(dto.toDate);
      }
    }

    const [searchResults, total] = await Promise.all([
      this.prisma.messageSearchIndex.findMany({
        where: searchConditions,
        include: {
          message: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  avatarUrl: true,
                },
              },
              conversation: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take,
      }),
      this.prisma.messageSearchIndex.count({
        where: searchConditions,
      }),
    ]);

    return {
      messages: searchResults
        .map((result) => result.message)
        .filter((message) => message.deletedAt === null),
      total,
      hasMore: total > skip + searchResults.length,
    };
  }

  // Group Chat Invites
  async createGroupInvite(
    userId: string,
    conversationId: string,
    inviteeIds: string[],
  ): Promise<GroupChatInviteDto[]> {
    const groupChat = await this.checkGroupChatMemberAccess(
      userId,
      conversationId,
    );

    if (!groupChat.allowMemberInvite) {
      await this.checkGroupChatAdminAccess(userId, conversationId);
    }

    // Validate workspace still meets minimum requirements
    await this.validateWorkspaceMinimumMembers(groupChat.workspaceId);

    // Validate invitees are workspace members
    await this.validateWorkspaceMembers(groupChat.workspaceId, inviteeIds);

    // Create invites
    const invites = await Promise.all(
      inviteeIds.map(async (inviteeId) => {
        const existingInvite = await this.prisma.groupChatInvite.findUnique({
          where: {
            conversationId_inviteeId: {
              conversationId,
              inviteeId,
            },
          },
        });

        if (existingInvite && existingInvite.status === "pending") {
          throw new ConflictException(
            `User ${inviteeId} already has a pending invite`,
          );
        }

        return this.prisma.groupChatInvite.create({
          data: {
            conversationId,
            inviterId: userId,
            inviteeId,
            workspaceId: groupChat.workspaceId,
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
          },
          include: {
            conversation: {
              select: {
                id: true,
                name: true,
                icon: true,
                members: { where: { leftAt: null } },
              },
            },
            inviter: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        });
      }),
    );

    return invites.map((invite) => ({
      id: invite.id,
      conversationId: invite.conversationId,
      inviterId: invite.inviterId,
      inviteeId: invite.inviteeId,
      workspaceId: invite.workspaceId,
      status: invite.status,
      expiresAt: invite.expiresAt,
      createdAt: invite.createdAt,
      conversation: {
        id: invite.conversation.id,
        name: invite.conversation.name!,
        icon: invite.conversation.icon,
        memberCount: invite.conversation.members.length,
      },
      inviter: invite.inviter,
    }));
  }

  async acceptGroupInvite(
    userId: string,
    inviteId: string,
  ): Promise<GroupChatDto> {
    const invite = await this.prisma.groupChatInvite.findUnique({
      where: { id: inviteId, inviteeId: userId, status: "pending" },
      include: {
        conversation: {
          include: this.getGroupChatInclude().include,
        },
      },
    });

    if (!invite) {
      throw new NotFoundException("Invite not found or expired");
    }

    if (invite.expiresAt < new Date()) {
      throw new BadRequestException("Invite has expired");
    }

    // Add user to group
    await this.prisma.$transaction(async (tx) => {
      await tx.groupChatInvite.update({
        where: { id: inviteId },
        data: { status: "accepted" },
      });

      await tx.conversationMember.create({
        data: {
          conversationId: invite.conversationId,
          userId,
          role: ConversationRole.MEMBER,
        },
      });
    });

    return this.formatGroupChat(invite.conversation);
  }

  async declineGroupInvite(userId: string, inviteId: string): Promise<void> {
    await this.prisma.groupChatInvite.update({
      where: { id: inviteId, inviteeId: userId, status: "pending" },
      data: { status: "declined" },
    });
  }

  // Helper Methods
  private async checkWorkspaceAccess(
    userId: string,
    workspaceId: string,
  ): Promise<void> {
    const membership = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    if (!membership) {
      throw new ForbiddenException("Not a workspace member");
    }
  }

  private async checkWorkspaceAdminAccess(
    userId: string,
    workspaceId: string,
  ): Promise<void> {
    const membership = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    });

    if (
      !membership ||
      ![WorkspaceRole.OWNER, WorkspaceRole.ADMIN].includes(membership.role)
    ) {
      throw new ForbiddenException("Workspace admin access required");
    }
  }

  private async checkGroupChatAccess(
    userId: string,
    conversationId: string,
  ): Promise<void> {
    const member = await this.prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    });

    if (!member || member.leftAt) {
      throw new ForbiddenException("Not a group member");
    }
  }

  private async checkGroupChatAdminAccess(
    userId: string,
    conversationId: string,
  ): Promise<void> {
    const member = await this.prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId,
        },
      },
    });

    if (!member || member.leftAt || member.role !== ConversationRole.ADMIN) {
      throw new ForbiddenException("Group admin access required");
    }
  }

  private async checkGroupChatMemberAccess(
    userId: string,
    conversationId: string,
  ): Promise<any> {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId, type: ConversationType.GROUP },
      include: {
        members: {
          where: { userId, leftAt: null },
        },
      },
    });

    if (!conversation || conversation.members.length === 0) {
      throw new ForbiddenException("Not a group member");
    }

    return conversation;
  }

  private async validateWorkspaceMinimumMembers(
    workspaceId: string,
  ): Promise<void> {
    const memberCount = await this.prisma.workspaceMember.count({
      where: {
        workspaceId,
        status: "ACTIVE",
      },
    });

    if (memberCount <= 2) {
      throw new BadRequestException(
        `Group chats require more than 2 workspace members. Current workspace has ${memberCount} member(s).`,
      );
    }
  }

  async getWorkspaceInfo(
    userId: string,
    workspaceId: string,
  ): Promise<{
    id: string;
    name: string;
    memberCount: number;
    canCreateGroups: boolean;
    groupCount: number;
  }> {
    await this.checkWorkspaceAccess(userId, workspaceId);

    const [workspace, memberCount, groupCount] = await Promise.all([
      this.prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { id: true, name: true },
      }),
      this.prisma.workspaceMember.count({
        where: { workspaceId, status: "ACTIVE" },
      }),
      this.prisma.conversation.count({
        where: {
          workspaceId,
          type: ConversationType.GROUP,
        },
      }),
    ]);

    if (!workspace) {
      throw new NotFoundException("Workspace not found");
    }

    return {
      id: workspace.id,
      name: workspace.name,
      memberCount,
      canCreateGroups: memberCount > 2,
      groupCount,
    };
  }

  private async validateWorkspaceMembers(
    workspaceId: string,
    userIds: string[],
  ): Promise<void> {
    const members = await this.prisma.workspaceMember.findMany({
      where: {
        workspaceId,
        userId: { in: userIds },
        status: "ACTIVE",
      },
      select: { userId: true },
    });

    const validUserIds = members.map((m) => m.userId);
    const invalidUserIds = userIds.filter((id) => !validUserIds.includes(id));

    if (invalidUserIds.length > 0) {
      throw new BadRequestException(
        `Users ${invalidUserIds.join(", ")} are not workspace members`,
      );
    }
  }

  private async createSystemMessage(
    conversationId: string,
    userId: string,
    content: string,
    metadata: any = {},
  ): Promise<void> {
    await this.prisma.message.create({
      data: {
        conversationId,
        userId,
        content,
        messageType: "system",
        metadata: JSON.stringify(metadata),
      },
    });
  }

  private async createMessageSearchIndex(message: any): Promise<void> {
    const keywords = this.extractKeywords(message.content);

    await this.prisma.messageSearchIndex.create({
      data: {
        messageId: message.id,
        conversationId: message.conversationId,
        workspaceId: message.conversation?.workspaceId || "",
        content: message.content,
        keywords,
        authorId: message.userId,
        createdAt: message.createdAt,
      },
    });
  }

  private extractKeywords(content: string): string[] {
    // Simple keyword extraction - can be enhanced with NLP libraries
    const words = content
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .split(/\s+/)
      .filter((word) => word.length > 2);

    return [...new Set(words)]; // Remove duplicates
  }

  private getGroupChatInclude() {
    return {
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        members: {
          where: { leftAt: null },
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
          orderBy: [{ role: "asc" }, { joinedAt: "asc" }],
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatarUrl: true,
              },
            },
          },
        },
        presence: {
          where: { status: "online" },
        },
      },
    };
  }

  private formatGroupChat(conversation: any): GroupChatDto {
    const activeMembers = conversation.members.filter((m: any) => !m.leftAt);
    const onlineMembers = conversation.presence?.length || 0;
    const lastMessage = conversation.messages?.[0];

    return {
      id: conversation.id,
      workspaceId: conversation.workspaceId,
      type: conversation.type,
      name: conversation.name,
      description: conversation.description,
      icon: conversation.icon,
      createdById: conversation.createdById,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      isPrivate: conversation.isPrivate,
      maxMembers: conversation.maxMembers,
      allowMemberInvite: conversation.allowMemberInvite,
      pinnedMessageIds: conversation.pinnedMessageIds || [],
      memberCount: activeMembers.length,
      onlineMembers,
      lastActivity: lastMessage?.createdAt || conversation.updatedAt,
      members: activeMembers.map((m: any) => this.formatGroupMember(m)),
      lastMessage: lastMessage || null,
      unreadCount: 0, // Will be calculated separately
    } as any;
  }

  private formatGroupMember(member: any): GroupChatMemberDto {
    return {
      id: member.id,
      userId: member.userId,
      role: member.role,
      joinedAt: member.joinedAt,
      lastReadAt: member.lastReadAt,
      leftAt: member.leftAt,
      muteNotifications: member.muteNotifications,
      customNickname: member.customNickname,
      user: {
        id: member.user.id,
        name: member.user.name,
        email: member.user.email,
        avatarUrl: member.user.avatarUrl,
      },
    };
  }

  // Analytics and Stats
  async getGroupChatStats(
    userId: string,
    conversationId: string,
  ): Promise<any> {
    await this.checkGroupChatAccess(userId, conversationId);

    const [messageCount, memberCount, activeToday] = await Promise.all([
      this.prisma.message.count({
        where: { conversationId, deletedAt: null },
      }),
      this.prisma.conversationMember.count({
        where: { conversationId, leftAt: null },
      }),
      this.prisma.message.count({
        where: {
          conversationId,
          deletedAt: null,
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      totalMessages: messageCount,
      totalMembers: memberCount,
      messagesLast24h: activeToday,
    };
  }
}
