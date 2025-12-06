import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../database/prisma.service";
import {
  CreateConversationDto,
  UpdateConversationDto,
  SendMessageDto,
  EditMessageDto,
  AddReactionDto,
  AddMemberDto,
  UpdateMemberRoleDto,
  GetConversationsQueryDto,
  GetMessagesQueryDto,
  SearchMessagesQueryDto,
  ConversationDto,
  MessageDto,
  PresenceDto,
} from "./dto/chat.dto";
import {
  ConversationType,
  ConversationRole,
  WorkspaceRole,
  Prisma,
} from "@prisma/client";
import * as CryptoJS from "crypto-js";

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) { }

  // Conversation Management
  async createConversation(
    userId: string,
    dto: CreateConversationDto,
  ): Promise<ConversationDto> {
    // Check workspace access
    await this.checkWorkspaceAccess(userId, dto.workspaceId);

    // For GROUP conversations, check if workspace has more than one member
    if (dto.type === ConversationType.GROUP) {
      const workspaceMembers = await this.prisma.workspaceMember.count({
        where: {
          workspaceId: dto.workspaceId,
        },
      });

      if (workspaceMembers < 2) {
        throw new BadRequestException(
          "Cannot create group conversations in a workspace with only one member",
        );
      }
    }

    // For DMs, validate that only 2 members are specified
    if (dto.type === ConversationType.DM) {
      if (!dto.memberIds || dto.memberIds.length !== 1) {
        throw new BadRequestException(
          "DM conversations must have exactly one other member",
        );
      }

      // Check if DM already exists
      const existingDM = await this.findExistingDM(
        dto.workspaceId,
        userId,
        dto.memberIds[0],
      );
      if (existingDM) {
        return this.formatConversation(existingDM);
      }
    }

    // Create conversation
    const conversation = await this.prisma.conversation.create({
      data: {
        workspaceId: dto.workspaceId,
        type: dto.type,
        name: dto.name,
        description: dto.description,
        icon: dto.icon,
        createdById: userId,
        documentId: dto.documentId,
        isEncrypted: dto.isEncrypted || dto.type === ConversationType.DM,
        members: {
          create: [
            // Creator is always an admin
            {
              userId: userId,
              role:
                dto.type === ConversationType.DM
                  ? ConversationRole.MEMBER
                  : ConversationRole.ADMIN,
            },
            // Add other members
            ...(dto.memberIds || []).map((memberId) => ({
              userId: memberId,
              role: ConversationRole.MEMBER,
            })),
          ],
        },
      },
      include: this.conversationInclude,
    });

    return this.formatConversation(conversation);
  }

  async getConversations(
    userId: string,
    query: GetConversationsQueryDto,
  ): Promise<ConversationDto[]> {
    if (query.workspaceId) {
      await this.checkWorkspaceAccess(userId, query.workspaceId);
    }

    const whereClause: Prisma.ConversationWhereInput = {
      members: {
        some: {
          userId: userId,
        },
      },
    };

    if (query.workspaceId) {
      whereClause.workspaceId = query.workspaceId;
    }

    if (query.type) {
      whereClause.type = query.type;
    }

    if (query.documentId) {
      whereClause.documentId = query.documentId;
    }

    const conversations = await this.prisma.conversation.findMany({
      where: whereClause,
      include: {
        ...this.conversationInclude,
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
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
      orderBy: {
        updatedAt: "desc",
      },
      skip: ((query.page || 1) - 1) * (query.limit || 20),
      take: query.limit,
    });

    return Promise.all(
      conversations.map(async (conv) => {
        const formatted = this.formatConversation(conv);
        if (conv.messages.length > 0) {
          formatted.lastMessage = this.formatMessage(conv.messages[0]);
        }

        // Get unread count
        const member = conv.members.find((m) => m.userId === userId);
        if (member && member.lastReadAt) {
          const unreadCount = await this.prisma.message.count({
            where: {
              conversationId: conv.id,
              createdAt: {
                gt: member.lastReadAt,
              },
              userId: {
                not: userId,
              },
            },
          });
          formatted.unreadCount = unreadCount;
        }

        return formatted;
      }),
    );
  }

  async getConversation(
    userId: string,
    conversationId: string,
  ): Promise<ConversationDto> {
    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        members: {
          some: {
            userId: userId,
          },
        },
      },
      include: this.conversationInclude,
    });

    if (!conversation) {
      throw new NotFoundException("Conversation not found");
    }

    return this.formatConversation(conversation);
  }

  async updateConversation(
    userId: string,
    conversationId: string,
    dto: UpdateConversationDto,
  ): Promise<ConversationDto> {
    await this.checkConversationAdminAccess(userId, conversationId);

    const conversation = await this.prisma.conversation.update({
      where: { id: conversationId },
      data: dto,
      include: this.conversationInclude,
    });

    return this.formatConversation(conversation);
  }

  async deleteConversation(
    userId: string,
    conversationId: string,
  ): Promise<void> {
    await this.checkConversationAdminAccess(userId, conversationId);

    await this.prisma.conversation.delete({
      where: { id: conversationId },
    });
  }

  // Message Management
  async sendMessage(userId: string, dto: SendMessageDto): Promise<MessageDto> {
    await this.checkConversationAccess(userId, dto.conversationId);

    const conversation = await this.prisma.conversation.findUnique({
      where: { id: dto.conversationId },
      select: { isEncrypted: true, encryptionKey: true },
    });

    let content = dto.content;
    if (conversation?.isEncrypted) {
      content = this.encryptMessage(
        dto.content,
        conversation.encryptionKey || undefined,
      );
    }

    const message = await this.prisma.message.create({
      data: {
        conversationId: dto.conversationId,
        userId: userId,
        content: content,
        replyToId: dto.replyToId,
        attachments: dto.attachments
          ? JSON.stringify(dto.attachments)
          : undefined,
      },
      include: this.messageInclude,
    });

    // Update conversation updatedAt
    await this.prisma.conversation.update({
      where: { id: dto.conversationId },
      data: { updatedAt: new Date() },
    });

    return this.formatMessage(message, conversation?.isEncrypted);
  }

  async getMessages(
    userId: string,
    query: GetMessagesQueryDto,
  ): Promise<MessageDto[]> {
    await this.checkConversationAccess(userId, query.conversationId);

    const conversation = await this.prisma.conversation.findUnique({
      where: { id: query.conversationId },
      select: { isEncrypted: true, encryptionKey: true },
    });

    const whereClause: Prisma.MessageWhereInput = {
      conversationId: query.conversationId,
      deletedAt: null,
    };

    if (query.before) {
      whereClause.createdAt = { lt: new Date(query.before) };
    }

    if (query.after) {
      whereClause.createdAt = { gt: new Date(query.after) };
    }

    if (query.threadId) {
      whereClause.replyToId = query.threadId;
    }

    const messages = await this.prisma.message.findMany({
      where: whereClause,
      include: this.messageInclude,
      orderBy: { createdAt: "asc" },
      skip: ((query.page || 1) - 1) * (query.limit || 50),
      take: query.limit ? Number(query.limit) : 50,
    });

    return messages.map((message) =>
      this.formatMessage(message, conversation?.isEncrypted),
    );
  }

  async editMessage(
    userId: string,
    messageId: string,
    dto: EditMessageDto,
  ): Promise<MessageDto> {
    const message = await this.prisma.message.findFirst({
      where: {
        id: messageId,
        userId: userId,
      },
      include: {
        conversation: {
          select: { isEncrypted: true, encryptionKey: true },
        },
      },
    });

    if (!message) {
      throw new NotFoundException("Message not found or access denied");
    }

    let content = dto.content;
    if (message.conversation.isEncrypted) {
      content = this.encryptMessage(
        dto.content,
        message.conversation.encryptionKey || undefined,
      );
    }

    const updatedMessage = await this.prisma.message.update({
      where: { id: messageId },
      data: {
        content: content,
        editedAt: new Date(),
      },
      include: this.messageInclude,
    });

    return this.formatMessage(updatedMessage, message.conversation.isEncrypted);
  }

  async deleteMessage(userId: string, messageId: string): Promise<void> {
    const message = await this.prisma.message.findFirst({
      where: {
        id: messageId,
        userId: userId,
      },
    });

    if (!message) {
      throw new NotFoundException("Message not found or access denied");
    }

    await this.prisma.message.update({
      where: { id: messageId },
      data: { deletedAt: new Date() },
    });
  }

  async addReaction(
    userId: string,
    messageId: string,
    dto: AddReactionDto,
  ): Promise<MessageDto> {
    const message = await this.prisma.message.findFirst({
      where: {
        id: messageId,
      },
      include: {
        conversation: {
          select: { isEncrypted: true, encryptionKey: true },
        },
      },
    });

    if (!message || !message.conversation) {
      throw new NotFoundException("Message not found or access denied");
    }

    const reactions = (message.reactions as Record<string, string[]>) || {};
    const emoji = dto.emoji;

    if (!reactions[emoji]) {
      reactions[emoji] = [];
    }

    if (reactions[emoji].includes(userId)) {
      // Remove reaction
      reactions[emoji] = reactions[emoji].filter((id) => id !== userId);
      if (reactions[emoji].length === 0) {
        delete reactions[emoji];
      }
    } else {
      // Add reaction
      reactions[emoji].push(userId);
    }

    const updatedMessage = await this.prisma.message.update({
      where: { id: messageId },
      data: { reactions: JSON.stringify(reactions) },
      include: this.messageInclude,
    });

    return this.formatMessage(
      updatedMessage,
      message.conversation?.isEncrypted,
    );
  }

  // Member Management
  async addMember(
    userId: string,
    conversationId: string,
    dto: AddMemberDto,
  ): Promise<void> {
    await this.checkConversationAdminAccess(userId, conversationId);

    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { type: true, workspaceId: true },
    });

    if (conversation?.type === ConversationType.DM) {
      throw new BadRequestException("Cannot add members to DM conversations");
    }

    // Check if user is in workspace
    await this.checkWorkspaceAccess(dto.userId, conversation!.workspaceId);

    // Check if already a member
    const existingMember = await this.prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId: conversationId,
          userId: dto.userId,
        },
      },
    });

    if (existingMember) {
      throw new BadRequestException("User is already a member");
    }

    await this.prisma.conversationMember.create({
      data: {
        conversationId: conversationId,
        userId: dto.userId,
        role: dto.role,
      },
    });
  }

  async removeMember(
    userId: string,
    conversationId: string,
    memberId: string,
  ): Promise<void> {
    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { type: true, createdById: true },
    });

    if (!conversation) {
      throw new NotFoundException("Conversation not found");
    }

    if (conversation.type === ConversationType.DM) {
      throw new BadRequestException(
        "Cannot remove members from DM conversations",
      );
    }

    // Can remove self, or admins can remove others
    if (userId !== memberId) {
      await this.checkConversationAdminAccess(userId, conversationId);
    }

    // Cannot remove conversation creator
    if (memberId === conversation.createdById) {
      throw new BadRequestException("Cannot remove conversation creator");
    }

    await this.prisma.conversationMember.delete({
      where: {
        conversationId_userId: {
          conversationId: conversationId,
          userId: memberId,
        },
      },
    });
  }

  async updateMemberRole(
    userId: string,
    conversationId: string,
    memberId: string,
    dto: UpdateMemberRoleDto,
  ): Promise<void> {
    await this.checkConversationAdminAccess(userId, conversationId);

    const conversation = await this.prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { createdById: true },
    });

    // Cannot change role of conversation creator
    if (memberId === conversation?.createdById) {
      throw new BadRequestException(
        "Cannot change role of conversation creator",
      );
    }

    await this.prisma.conversationMember.update({
      where: {
        conversationId_userId: {
          conversationId: conversationId,
          userId: memberId,
        },
      },
      data: { role: dto.role },
    });
  }

  async markAsRead(
    userId: string,
    conversationId: string,
    messageId?: string,
  ): Promise<void> {
    await this.checkConversationAccess(userId, conversationId);

    const readAt = new Date();

    // Update member's last read timestamp
    await this.prisma.conversationMember.update({
      where: {
        conversationId_userId: {
          conversationId: conversationId,
          userId: userId,
        },
      },
      data: { lastReadAt: readAt },
    });

    // If specific message provided, create read receipt
    if (messageId) {
      await this.prisma.messageReadReceipt.upsert({
        where: {
          messageId_userId: {
            messageId: messageId,
            userId: userId,
          },
        },
        update: { readAt: readAt },
        create: {
          messageId: messageId,
          conversationId: conversationId,
          userId: userId,
          readAt: readAt,
        },
      });
    }
  }

  // Presence Management
  async updatePresence(
    userId: string,
    workspaceId: string,
    status: string,
  ): Promise<PresenceDto> {
    await this.checkWorkspaceAccess(userId, workspaceId);

    const presence = await this.prisma.presenceStatus.upsert({
      where: {
        userId_workspaceId: {
          userId: userId,
          workspaceId: workspaceId,
        },
      },
      update: {
        status: status,
        lastSeen: new Date(),
      },
      create: {
        userId: userId,
        workspaceId: workspaceId,
        status: status,
        lastSeen: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    return {
      userId: presence.userId,
      workspaceId: presence.workspaceId,
      status: presence.status,
      lastSeen: presence.lastSeen,
      user: presence.user,
    };
  }

  async getPresence(
    userId: string,
    workspaceId: string,
  ): Promise<PresenceDto[]> {
    await this.checkWorkspaceAccess(userId, workspaceId);

    const presences = await this.prisma.presenceStatus.findMany({
      where: { workspaceId: workspaceId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
          },
        },
      },
    });

    return presences.map((p) => ({
      userId: p.userId,
      workspaceId: p.workspaceId,
      status: p.status,
      lastSeen: p.lastSeen,
      user: p.user,
    }));
  }

  // Search
  async searchMessages(
    userId: string,
    query: SearchMessagesQueryDto,
  ): Promise<MessageDto[]> {
    await this.checkWorkspaceAccess(userId, query.workspaceId);

    const whereClause: Prisma.MessageWhereInput = {
      conversation: {
        workspaceId: query.workspaceId,
        members: {
          some: {
            userId: userId,
          },
        },
      },
      content: {
        contains: query.query,
        mode: "insensitive",
      },
      deletedAt: null,
    };

    if (query.conversationId) {
      whereClause.conversationId = query.conversationId;
    }

    const messages = await this.prisma.message.findMany({
      where: whereClause,
      include: this.messageInclude,
      orderBy: { createdAt: "desc" },
      skip: ((query.page || 1) - 1) * (query.limit || 20),
      take: query.limit,
    });

    return messages.map((message) => this.formatMessage(message));
  }

  // Private helper methods
  private async checkWorkspaceAccess(
    userId: string,
    workspaceId: string,
  ): Promise<void> {
    const member = await this.prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: workspaceId,
          userId: userId,
        },
      },
    });

    if (!member) {
      throw new ForbiddenException("Access denied to workspace");
    }
  }

  private async checkConversationAccess(
    userId: string,
    conversationId: string,
  ): Promise<void> {
    const member = await this.prisma.conversationMember.findUnique({
      where: {
        conversationId_userId: {
          conversationId: conversationId,
          userId: userId,
        },
      },
    });

    if (!member) {
      throw new ForbiddenException("Access denied to conversation");
    }
  }

  private async checkConversationAdminAccess(
    userId: string,
    conversationId: string,
  ): Promise<void> {
    const member = await this.prisma.conversationMember.findFirst({
      where: {
        conversationId: conversationId,
        userId: userId,
        role: ConversationRole.ADMIN,
      },
    });

    if (!member) {
      // Check if user is workspace admin/owner
      const conversation = await this.prisma.conversation.findUnique({
        where: { id: conversationId },
        select: { workspaceId: true },
      });

      if (conversation) {
        const workspaceMember = await this.prisma.workspaceMember.findFirst({
          where: {
            workspaceId: conversation.workspaceId,
            userId: userId,
            role: {
              in: [WorkspaceRole.OWNER, WorkspaceRole.ADMIN],
            },
          },
        });

        if (!workspaceMember) {
          throw new ForbiddenException("Admin access required");
        }
      } else {
        throw new NotFoundException("Conversation not found");
      }
    }
  }

  private async findExistingDM(
    workspaceId: string,
    userId1: string,
    userId2: string,
  ): Promise<any> {
    return this.prisma.conversation.findFirst({
      where: {
        workspaceId: workspaceId,
        type: ConversationType.DM,
        members: {
          every: {
            userId: {
              in: [userId1, userId2],
            },
          },
        },
      },
      include: this.conversationInclude,
    });
  }

  private encryptMessage(content: string, encryptionKey?: string): string {
    if (!encryptionKey) return content;
    return CryptoJS.AES.encrypt(content, encryptionKey).toString();
  }

  private decryptMessage(content: string, encryptionKey?: string): string {
    if (!encryptionKey) return content;
    try {
      const bytes = CryptoJS.AES.decrypt(content, encryptionKey);
      return bytes.toString(CryptoJS.enc.Utf8);
    } catch {
      return content; // Return original if decryption fails
    }
  }

  private formatConversation(conversation: any): ConversationDto {
    return {
      id: conversation.id,
      workspaceId: conversation.workspaceId,
      type: conversation.type,
      name: conversation.name,
      description: conversation.description,
      icon: conversation.icon,
      createdById: conversation.createdById,
      documentId: conversation.documentId,
      isEncrypted: conversation.isEncrypted,
      createdAt: conversation.createdAt,
      updatedAt: conversation.updatedAt,
      members: conversation.members.map((member: any) => ({
        id: member.id,
        userId: member.userId,
        role: member.role,
        joinedAt: member.joinedAt,
        lastReadAt: member.lastReadAt,
        user: {
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          avatarUrl: member.user.avatarUrl,
        },
      })),
    };
  }

  private formatMessage(message: any, isEncrypted?: boolean): MessageDto {
    let content = message.content;
    if (isEncrypted && message.conversation?.encryptionKey) {
      content = this.decryptMessage(
        content,
        message.conversation.encryptionKey,
      );
    }

    return {
      id: message.id,
      conversationId: message.conversationId,
      userId: message.userId,
      content: content,
      attachments: message.attachments ? JSON.parse(message.attachments) : null,
      replyToId: message.replyToId,
      editedAt: message.editedAt,
      deletedAt: message.deletedAt,
      reactions: message.reactions ? JSON.parse(message.reactions) : null,
      createdAt: message.createdAt,
      user: {
        id: message.user.id,
        name: message.user.name,
        email: message.user.email,
        avatarUrl: message.user.avatarUrl,
      },
      replyTo: message.replyTo
        ? this.formatMessage(message.replyTo, isEncrypted)
        : undefined,
      readReceipts:
        message.readReceipts?.map((receipt: any) => ({
          id: receipt.id,
          userId: receipt.userId,
          readAt: receipt.readAt,
          user: {
            id: receipt.user.id,
            name: receipt.user.name,
            avatarUrl: receipt.user.avatarUrl,
          },
        })) || [],
    };
  }

  private get conversationInclude() {
    return {
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
    };
  }

  private get messageInclude() {
    return {
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
      readReceipts: {
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
    };
  }
}
