import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { ChatService } from "./chat.service";
import { GroupChatService } from "./group-chat.service";
import {
  JoinRoomDto,
  TypingDto,
  WebSocketMessageDto,
  UpdatePresenceDto,
  CreateGroupChatDto,
  AddGroupMemberDto,
  UpdateGroupMemberRoleDto,
  RemoveGroupMemberDto,
  PinMessageDto,
  MentionMessageDto,
} from "./dto/chat.dto";
import { Logger } from "@nestjs/common";

interface AuthenticatedSocket extends Socket {
  data: {
    user: {
      sub: string;
      email: string;
    };
  };
}

@WebSocketGateway({
  cors: {
    origin: "*",
    credentials: true,
  },
  namespace: "chat",
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private typingUsers = new Map<string, Set<string>>(); // conversationId -> Set of userIds
  private userSockets = new Map<string, Set<string>>(); // userId -> Set of socketIds
  private userWorkspaces = new Map<string, string>(); // userId -> workspaceId

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private chatService: ChatService,
    private groupChatService: GroupChatService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = this.extractToken(client);
      if (!token) {
        this.logger.warn(`Client ${client.id} disconnected: No token provided`);
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get("jwt.secret"),
      });

      client.data.user = payload;

      // Track user socket
      const userId = payload.sub;
      if (!this.userSockets.has(userId)) {
        this.userSockets.set(userId, new Set());
      }
      this.userSockets.get(userId)!.add(client.id);

      this.logger.log(`Chat client connected: ${client.id}, User: ${userId}`);

      // Send connection success
      client.emit("connection", { status: "connected", userId });
    } catch (error) {
      this.logger.warn(`Client ${client.id} disconnected: Invalid token`);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    const userId = client.data?.user?.sub;
    if (userId) {
      // Remove from user sockets tracking
      const userSocketSet = this.userSockets.get(userId);
      if (userSocketSet) {
        userSocketSet.delete(client.id);
        if (userSocketSet.size === 0) {
          this.userSockets.delete(userId);
          // Update presence to offline if no more sockets
          this.handleUserOffline(userId);
        }
      }

      // Remove from typing indicators
      this.typingUsers.forEach((userSet, conversationId) => {
        if (userSet.has(userId)) {
          userSet.delete(userId);
          this.server
            .to(`conversation:${conversationId}`)
            .emit("typing", { userId, isTyping: false });
        }
      });

      // Clean up workspace tracking
      this.userWorkspaces.delete(userId);
    }

    this.logger.log(`Chat client disconnected: ${client.id}`);
  }

  @SubscribeMessage("join_workspace")
  async handleJoinWorkspace(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { workspaceId: string },
  ) {
    const userId = client.data.user.sub;
    const { workspaceId } = data;

    // Prevent duplicate joins
    const currentWorkspace = this.userWorkspaces.get(userId);
    if (currentWorkspace === workspaceId) {
      this.logger.debug(`User ${userId} already in workspace ${workspaceId}`);
      return { status: "ok", message: "Already in workspace" };
    }

    try {
      // Verify workspace access
      await this.chatService.updatePresence(userId, workspaceId, "online");

      // Leave previous workspace if any
      if (currentWorkspace) {
        await client.leave(`workspace:${currentWorkspace}`);
      }

      // Join workspace room
      await client.join(`workspace:${workspaceId}`);
      this.userWorkspaces.set(userId, workspaceId);

      // Get user's conversations and join those rooms
      const conversations = await this.chatService.getConversations(userId, {
        workspaceId,
        page: 1,
        limit: 100,
      });

      for (const conversation of conversations) {
        await client.join(`conversation:${conversation.id}`);
      }

      // Broadcast presence update to workspace
      const presence = await this.chatService.getPresence(userId, workspaceId);
      this.server.to(`workspace:${workspaceId}`).emit("presence_update", {
        userId,
        status: "online",
        workspaceId,
      });

      this.logger.log(`User ${userId} joined workspace ${workspaceId}`);

      return { status: "ok", conversations };
    } catch (error) {
      this.logger.error(
        `Failed to join workspace ${workspaceId} for user ${userId}:`,
        (error as Error).message,
      );
      return { status: "error", message: "Failed to join workspace" };
    }
  }

  @SubscribeMessage("join_conversation")
  async handleJoinConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = client.data.user.sub;
    const { conversationId } = data;

    try {
      // Verify conversation access
      const conversation = await this.chatService.getConversation(
        userId,
        conversationId,
      );

      // Join conversation room
      await client.join(`conversation:${conversationId}`);

      this.logger.log(`User ${userId} joined conversation ${conversationId}`);

      return { status: "ok", conversation };
    } catch (error) {
      this.logger.error(
        `Failed to join conversation ${conversationId} for user ${userId}:`,
        (error as Error).message,
      );
      return { status: "error", message: "Failed to join conversation" };
    }
  }

  @SubscribeMessage("leave_conversation")
  async handleLeaveConversation(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    const { conversationId } = data;
    await client.leave(`conversation:${conversationId}`);
    return { status: "ok" };
  }

  @SubscribeMessage("send_message")
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() dto: WebSocketMessageDto,
  ) {
    const userId = client.data.user.sub;

    try {
      const message = await this.chatService.sendMessage(userId, {
        conversationId: dto.conversationId,
        content: dto.content,
        replyToId: dto.replyToId,
        attachments: dto.attachments,
      });

      // Stop typing indicator for this user
      this.handleStopTyping(userId, dto.conversationId);

      // Broadcast message to conversation room
      this.server.to(`conversation:${dto.conversationId}`).emit("message:new", {
        message,
        conversationId: dto.conversationId,
      });

      // Update conversation in workspace
      const conversation = await this.chatService.getConversation(
        userId,
        dto.conversationId,
      );

      this.server
        .to(`workspace:${conversation.workspaceId}`)
        .emit("conversation:updated", {
          conversationId: dto.conversationId,
          lastMessage: message,
          updatedAt: new Date(),
        });

      this.logger.log(
        `Message sent by ${userId} in conversation ${dto.conversationId}`,
      );

      return { status: "ok", data: message };
    } catch (error) {
      this.logger.error(
        `Failed to send message for user ${userId}:`,
        (error as Error).message,
      );
      return { status: "error", message: "Failed to send message" };
    }
  }

  @SubscribeMessage("edit_message")
  async handleEditMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { messageId: string; content: string },
  ) {
    const userId = client.data.user.sub;
    const { messageId, content } = data;

    try {
      const message = await this.chatService.editMessage(userId, messageId, {
        content,
      });

      // Broadcast edit to conversation room
      this.server
        .to(`conversation:${message.conversationId}`)
        .emit("message:edit", {
          message,
        });

      return { status: "ok", data: message };
    } catch (error) {
      this.logger.error(
        `Failed to edit message ${messageId} for user ${userId}:`,
        (error as Error).message,
      );
      return { status: "error", message: "Failed to edit message" };
    }
  }

  @SubscribeMessage("delete_message")
  async handleDeleteMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { messageId: string; conversationId: string },
  ) {
    const userId = client.data.user.sub;
    const { messageId, conversationId } = data;

    try {
      await this.chatService.deleteMessage(userId, messageId);

      // Broadcast delete to conversation room
      this.server.to(`conversation:${conversationId}`).emit("message:delete", {
        messageId,
        conversationId,
      });

      return { status: "ok" };
    } catch (error) {
      this.logger.error(
        `Failed to delete message ${messageId} for user ${userId}:`,
        (error as Error).message,
      );
      return { status: "error", message: "Failed to delete message" };
    }
  }

  @SubscribeMessage("add_reaction")
  async handleAddReaction(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    data: { messageId: string; emoji: string; conversationId: string },
  ) {
    const userId = client.data.user.sub;
    const { messageId, emoji, conversationId } = data;

    try {
      const message = await this.chatService.addReaction(userId, messageId, {
        emoji,
      });

      // Broadcast reaction to conversation room
      this.server
        .to(`conversation:${conversationId}`)
        .emit("message:reaction", {
          message,
        });

      return { status: "ok", data: message };
    } catch (error) {
      this.logger.error(
        `Failed to add reaction for user ${userId}:`,
        (error as Error).message,
      );
      return { status: "error", message: "Failed to add reaction" };
    }
  }

  @SubscribeMessage("typing_start")
  async handleTypingStart(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: TypingDto,
  ) {
    const userId = client.data.user.sub;
    const { conversationId } = data;

    // Add user to typing set
    if (!this.typingUsers.has(conversationId)) {
      this.typingUsers.set(conversationId, new Set());
    }
    this.typingUsers.get(conversationId)!.add(userId);

    // Broadcast typing to others in conversation (exclude sender)
    client.to(`conversation:${conversationId}`).emit("typing:start", {
      userId,
      conversationId,
    });

    // Auto-stop typing after 3 seconds
    setTimeout(() => {
      this.handleStopTyping(userId, conversationId);
    }, 3000);

    return { status: "ok" };
  }

  @SubscribeMessage("typing_stop")
  async handleTypingStop(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: TypingDto,
  ) {
    const userId = client.data.user.sub;
    const { conversationId } = data;

    this.handleStopTyping(userId, conversationId);

    return { status: "ok" };
  }

  @SubscribeMessage("mark_as_read")
  async handleMarkAsRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string; messageId?: string },
  ) {
    const userId = client.data.user.sub;
    const { conversationId, messageId } = data;

    try {
      await this.chatService.markAsRead(userId, conversationId, messageId);

      // Broadcast read receipt to conversation
      this.server.to(`conversation:${conversationId}`).emit("message:read", {
        userId,
        conversationId,
        messageId,
        readAt: new Date(),
      });

      return { status: "ok" };
    } catch (error) {
      this.logger.error(
        `Failed to mark as read for user ${userId}:`,
        (error as Error).message,
      );
      return { status: "error", message: "Failed to mark as read" };
    }
  }

  @SubscribeMessage("update_presence")
  async handleUpdatePresence(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() dto: UpdatePresenceDto,
  ) {
    const userId = client.data.user.sub;

    try {
      const presence = await this.chatService.updatePresence(
        userId,
        dto.workspaceId,
        dto.status,
      );

      // Broadcast presence update to workspace
      this.server.to(`workspace:${dto.workspaceId}`).emit("presence_update", {
        userId,
        status: dto.status,
        workspaceId: dto.workspaceId,
        lastSeen: presence.lastSeen,
      });

      return { status: "ok", data: presence };
    } catch (error) {
      this.logger.error(
        `Failed to update presence for user ${userId}:`,
        (error as Error).message,
      );
      return { status: "error", message: "Failed to update presence" };
    }
  }

  // Group Chat Events
  @SubscribeMessage("group_chat:create")
  async handleCreateGroupChat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() dto: CreateGroupChatDto,
  ) {
    const userId = client.data.user.sub;

    try {
      const groupChat = await this.groupChatService.createGroupChat(
        userId,
        dto,
      );

      // Join creator to group room
      await client.join(`conversation:${groupChat.id}`);

      // Notify workspace about new group
      this.server
        .to(`workspace:${dto.workspaceId}`)
        .emit("group_chat:created", {
          groupChat,
        });

      // Notify each member
      groupChat.members.forEach((member) => {
        if (member.userId !== userId) {
          this.emitToUser(member.userId, "group_chat:invited", {
            groupChat,
            inviterId: userId,
          });
        }
      });

      this.logger.log(`Group chat created: ${groupChat.id} by ${userId}`);

      return { status: "ok", data: groupChat };
    } catch (error) {
      this.logger.error(
        `Failed to create group chat for user ${userId}:`,
        (error as Error).message,
      );
      return { status: "error", message: "Failed to create group chat" };
    }
  }

  @SubscribeMessage("group_chat:update")
  async handleUpdateGroupChat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string; updates: any },
  ) {
    const userId = client.data.user.sub;
    const { conversationId, updates } = data;

    try {
      const groupChat = await this.groupChatService.updateGroupChat(
        userId,
        conversationId,
        updates,
      );

      // Broadcast update to all members
      this.server
        .to(`conversation:${conversationId}`)
        .emit("group_chat:updated", {
          conversationId,
          updates: groupChat,
        });

      return { status: "ok", data: groupChat };
    } catch (error) {
      this.logger.error(
        `Failed to update group chat ${conversationId}:`,
        (error as Error).message,
      );
      return { status: "error", message: "Failed to update group chat" };
    }
  }

  @SubscribeMessage("group_chat:add_members")
  async handleAddGroupMembers(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string; dto: AddGroupMemberDto },
  ) {
    const userId = client.data.user.sub;
    const { conversationId, dto } = data;

    try {
      const newMembers = await this.groupChatService.addMembers(
        userId,
        conversationId,
        dto,
      );

      // Broadcast to existing members
      this.server
        .to(`conversation:${conversationId}`)
        .emit("group_chat:members_added", {
          conversationId,
          members: newMembers,
          addedBy: userId,
        });

      // Notify new members
      newMembers.forEach((member) => {
        this.emitToUser(member.userId, "group_chat:added_to_group", {
          conversationId,
          addedBy: userId,
        });
      });

      return { status: "ok", data: newMembers };
    } catch (error) {
      this.logger.error(
        `Failed to add members to group chat ${conversationId}:`,
        (error as Error).message,
      );
      return { status: "error", message: "Failed to add members" };
    }
  }

  @SubscribeMessage("group_chat:remove_member")
  async handleRemoveGroupMember(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string; dto: RemoveGroupMemberDto },
  ) {
    const userId = client.data.user.sub;
    const { conversationId, dto } = data;

    try {
      await this.groupChatService.removeMember(userId, conversationId, dto);

      // Broadcast to group
      this.server
        .to(`conversation:${conversationId}`)
        .emit("group_chat:member_removed", {
          conversationId,
          userId: dto.userId,
          removedBy: userId,
        });

      // Notify removed member
      this.emitToUser(dto.userId, "group_chat:removed_from_group", {
        conversationId,
        removedBy: userId,
      });

      return { status: "ok" };
    } catch (error) {
      this.logger.error(
        `Failed to remove member from group chat ${conversationId}:`,
        (error as Error).message,
      );
      return { status: "error", message: "Failed to remove member" };
    }
  }

  @SubscribeMessage("group_chat:update_role")
  async handleUpdateMemberRole(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody()
    data: { conversationId: string; dto: UpdateGroupMemberRoleDto },
  ) {
    const userId = client.data.user.sub;
    const { conversationId, dto } = data;

    try {
      const updatedMember = await this.groupChatService.updateMemberRole(
        userId,
        conversationId,
        dto,
      );

      // Broadcast role change
      this.server
        .to(`conversation:${conversationId}`)
        .emit("group_chat:role_changed", {
          conversationId,
          member: updatedMember,
          changedBy: userId,
        });

      // Notify affected user
      this.emitToUser(dto.userId, "group_chat:your_role_changed", {
        conversationId,
        newRole: dto.role,
        changedBy: userId,
      });

      return { status: "ok", data: updatedMember };
    } catch (error) {
      this.logger.error(
        `Failed to update member role in group chat ${conversationId}:`,
        (error as Error).message,
      );
      return { status: "error", message: "Failed to update role" };
    }
  }

  @SubscribeMessage("group_chat:pin_message")
  async handlePinMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string; dto: PinMessageDto },
  ) {
    const userId = client.data.user.sub;
    const { conversationId, dto } = data;

    try {
      await this.groupChatService.pinMessage(userId, conversationId, dto);

      // Broadcast pin to group
      this.server.to(`conversation:${conversationId}`).emit("message:pinned", {
        conversationId,
        messageId: dto.messageId,
        pinnedBy: userId,
      });

      return { status: "ok" };
    } catch (error) {
      this.logger.error(
        `Failed to pin message in group chat ${conversationId}:`,
        (error as Error).message,
      );
      return { status: "error", message: "Failed to pin message" };
    }
  }

  @SubscribeMessage("group_chat:unpin_message")
  async handleUnpinMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string; messageId: string },
  ) {
    const userId = client.data.user.sub;
    const { conversationId, messageId } = data;

    try {
      await this.groupChatService.unpinMessage(
        userId,
        conversationId,
        messageId,
      );

      // Broadcast unpin to group
      this.server
        .to(`conversation:${conversationId}`)
        .emit("message:unpinned", {
          conversationId,
          messageId,
          unpinnedBy: userId,
        });

      return { status: "ok" };
    } catch (error) {
      this.logger.error(
        `Failed to unpin message in group chat ${conversationId}:`,
        (error as Error).message,
      );
      return { status: "error", message: "Failed to unpin message" };
    }
  }

  @SubscribeMessage("group_chat:send_mention")
  async handleSendMention(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() dto: MentionMessageDto,
  ) {
    const userId = client.data.user.sub;

    try {
      const message = await this.groupChatService.sendMentionMessage(
        userId,
        dto,
      );

      // Stop typing indicator
      this.handleStopTyping(userId, dto.conversationId);

      // Broadcast message to group
      this.server.to(`conversation:${dto.conversationId}`).emit("message:new", {
        message,
        conversationId: dto.conversationId,
      });

      // Send mention notifications
      dto.mentions.forEach((mentionedUserId) => {
        this.emitToUser(mentionedUserId, "message:mentioned", {
          message,
          conversationId: dto.conversationId,
          mentionedBy: userId,
        });
      });

      return { status: "ok", data: message };
    } catch (error) {
      this.logger.error(
        `Failed to send mention message:`,
        (error as Error).message,
      );
      return { status: "error", message: "Failed to send message" };
    }
  }

  @SubscribeMessage("group_chat:get_members")
  async handleGetGroupMembers(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = client.data.user.sub;
    const { conversationId } = data;

    try {
      const members = await this.groupChatService.getGroupMembers(
        userId,
        conversationId,
      );

      return { status: "ok", data: members };
    } catch (error) {
      this.logger.error(
        `Failed to get group members for ${conversationId}:`,
        (error as Error).message,
      );
      return { status: "error", message: "Failed to get members" };
    }
  }

  @SubscribeMessage("group_chat:get_pinned")
  async handleGetPinnedMessages(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { conversationId: string },
  ) {
    const userId = client.data.user.sub;
    const { conversationId } = data;

    try {
      const pinnedMessages = await this.groupChatService.getPinnedMessages(
        userId,
        conversationId,
      );

      return { status: "ok", data: pinnedMessages };
    } catch (error) {
      this.logger.error(
        `Failed to get pinned messages for ${conversationId}:`,
        (error as Error).message,
      );
      return { status: "error", message: "Failed to get pinned messages" };
    }
  }

  // Emit events from external services
  async emitNewConversation(workspaceId: string, conversation: any) {
    this.server.to(`workspace:${workspaceId}`).emit("conversation:new", {
      conversation,
    });
  }

  async emitConversationUpdate(conversationId: string, updates: any) {
    this.server
      .to(`conversation:${conversationId}`)
      .emit("conversation:updated", {
        conversationId,
        updates,
      });
  }

  async emitMemberJoined(conversationId: string, member: any) {
    this.server.to(`conversation:${conversationId}`).emit("member:joined", {
      conversationId,
      member,
    });
  }

  async emitMemberLeft(conversationId: string, userId: string) {
    this.server.to(`conversation:${conversationId}`).emit("member:left", {
      conversationId,
      userId,
    });
  }

  // Group Chat specific emitters
  async emitGroupChatCreated(workspaceId: string, groupChat: any) {
    this.server.to(`workspace:${workspaceId}`).emit("group_chat:created", {
      groupChat,
    });
  }

  async emitGroupChatUpdated(conversationId: string, updates: any) {
    this.server
      .to(`conversation:${conversationId}`)
      .emit("group_chat:updated", {
        conversationId,
        updates,
      });
  }

  async emitMemberAdded(
    conversationId: string,
    members: any[],
    addedBy: string,
  ) {
    this.server
      .to(`conversation:${conversationId}`)
      .emit("group_chat:members_added", {
        conversationId,
        members,
        addedBy,
      });
  }

  async emitMemberRemoved(
    conversationId: string,
    userId: string,
    removedBy: string,
  ) {
    this.server
      .to(`conversation:${conversationId}`)
      .emit("group_chat:member_removed", {
        conversationId,
        userId,
        removedBy,
      });
  }

  async emitRoleChanged(
    conversationId: string,
    member: any,
    changedBy: string,
  ) {
    this.server
      .to(`conversation:${conversationId}`)
      .emit("group_chat:role_changed", {
        conversationId,
        member,
        changedBy,
      });
  }

  async emitMessagePinned(
    conversationId: string,
    messageId: string,
    pinnedBy: string,
  ) {
    this.server.to(`conversation:${conversationId}`).emit("message:pinned", {
      conversationId,
      messageId,
      pinnedBy,
    });
  }

  async emitMessageUnpinned(
    conversationId: string,
    messageId: string,
    unpinnedBy: string,
  ) {
    this.server.to(`conversation:${conversationId}`).emit("message:unpinned", {
      conversationId,
      messageId,
      unpinnedBy,
    });
  }

  async emitMentionNotification(
    userId: string,
    message: any,
    conversationId: string,
    mentionedBy: string,
  ) {
    this.emitToUser(userId, "message:mentioned", {
      message,
      conversationId,
      mentionedBy,
    });
  }

  // Private helper method to emit to specific user
  private emitToUser(userId: string, event: string, data: any) {
    const userSocketSet = this.userSockets.get(userId);
    if (userSocketSet) {
      userSocketSet.forEach((socketId) => {
        this.server.to(socketId).emit(event, data);
      });
    }
  }

  // Private helper methods
  private handleStopTyping(userId: string, conversationId: string) {
    const typingSet = this.typingUsers.get(conversationId);
    if (typingSet && typingSet.has(userId)) {
      typingSet.delete(userId);

      // Broadcast stop typing to conversation
      this.server.to(`conversation:${conversationId}`).emit("typing:stop", {
        userId,
        conversationId,
      });

      // Clean up empty sets
      if (typingSet.size === 0) {
        this.typingUsers.delete(conversationId);
      }
    }
  }

  private async handleUserOffline(userId: string) {
    // Update presence to offline for all workspaces
    // This would need to get all workspaces the user is in
    // For now, we'll let the presence update via API or periodic cleanup
    this.logger.log(`User ${userId} went offline`);
  }

  private extractToken(client: Socket): string | undefined {
    // Try Authorization header first
    const authHeader = client.handshake.headers.authorization;
    if (authHeader && authHeader.split(" ")[0] === "Bearer") {
      return authHeader.split(" ")[1];
    }

    // Try query parameter
    const queryToken = client.handshake.query.token;
    if (typeof queryToken === "string") {
      return queryToken;
    }

    // Try auth object
    const auth = client.handshake.auth;
    if (auth && auth.token) {
      return auth.token;
    }

    return undefined;
  }
}
