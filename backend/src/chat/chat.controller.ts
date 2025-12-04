import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from "@nestjs/common";
import { ChatService } from "./chat.service";
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
  UpdatePresenceDto,
} from "./dto/chat.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@Controller("chat")
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  // Health check endpoint (no auth required)
  @Get("health")
  health() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "chat",
    };
  }

  // Conversation Management
  @Post("conversations")
  @UseGuards(JwtAuthGuard)
  async createConversation(
    @CurrentUser() user: any,
    @Body() dto: CreateConversationDto,
  ) {
    return this.chatService.createConversation(user.id, dto);
  }

  @Get("conversations")
  @UseGuards(JwtAuthGuard)
  async getConversations(
    @CurrentUser() user: any,
    @Query() query: GetConversationsQueryDto,
  ) {
    return this.chatService.getConversations(user.id, query);
  }

  @Get("conversations/:conversationId")
  @UseGuards(JwtAuthGuard)
  async getConversation(
    @CurrentUser() user: any,
    @Param("conversationId") conversationId: string,
  ) {
    return this.chatService.getConversation(user.id, conversationId);
  }

  @Put("conversations/:conversationId")
  @UseGuards(JwtAuthGuard)
  async updateConversation(
    @CurrentUser() user: any,
    @Param("conversationId") conversationId: string,
    @Body() dto: UpdateConversationDto,
  ) {
    return this.chatService.updateConversation(user.id, conversationId, dto);
  }

  @Delete("conversations/:conversationId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async deleteConversation(
    @CurrentUser() user: any,
    @Param("conversationId") conversationId: string,
  ) {
    await this.chatService.deleteConversation(user.id, conversationId);
  }

  // Message Management
  @Post("conversations/:conversationId/messages")
  @UseGuards(JwtAuthGuard)
  async sendMessage(
    @CurrentUser() user: any,
    @Param("conversationId") conversationId: string,
    @Body() dto: Omit<SendMessageDto, "conversationId">,
  ) {
    return this.chatService.sendMessage(user.id, {
      ...dto,
      conversationId,
    });
  }

  @Get("conversations/:conversationId/messages")
  @UseGuards(JwtAuthGuard)
  async getMessages(
    @CurrentUser() user: any,
    @Param("conversationId") conversationId: string,
    @Query() query: Omit<GetMessagesQueryDto, "conversationId">,
  ) {
    return this.chatService.getMessages(user.id, {
      ...query,
      conversationId,
    });
  }

  @Put("messages/:messageId")
  @UseGuards(JwtAuthGuard)
  async editMessage(
    @CurrentUser() user: any,
    @Param("messageId") messageId: string,
    @Body() dto: EditMessageDto,
  ) {
    return this.chatService.editMessage(user.id, messageId, dto);
  }

  @Delete("messages/:messageId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async deleteMessage(
    @CurrentUser() user: any,
    @Param("messageId") messageId: string,
  ) {
    await this.chatService.deleteMessage(user.id, messageId);
  }

  @Post("messages/:messageId/reactions")
  @UseGuards(JwtAuthGuard)
  async addReaction(
    @CurrentUser() user: any,
    @Param("messageId") messageId: string,
    @Body() dto: AddReactionDto,
  ) {
    return this.chatService.addReaction(user.id, messageId, dto);
  }

  // Member Management
  @Post("conversations/:conversationId/members")
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(JwtAuthGuard)
  async addMember(
    @CurrentUser() user: any,
    @Param("conversationId") conversationId: string,
    @Body() dto: AddMemberDto,
  ) {
    await this.chatService.addMember(user.id, conversationId, dto);
  }

  @Delete("conversations/:conversationId/members/:memberId")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async removeMember(
    @CurrentUser() user: any,
    @Param("conversationId") conversationId: string,
    @Param("memberId") memberId: string,
  ) {
    await this.chatService.removeMember(user.id, conversationId, memberId);
  }

  @Put("conversations/:conversationId/members/:memberId/role")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async updateMemberRole(
    @CurrentUser() user: any,
    @Param("conversationId") conversationId: string,
    @Param("memberId") memberId: string,
    @Body() dto: UpdateMemberRoleDto,
  ) {
    await this.chatService.updateMemberRole(
      user.id,
      conversationId,
      memberId,
      dto,
    );
  }

  @Post("conversations/:conversationId/read")
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  async markAsRead(
    @CurrentUser() user: any,
    @Param("conversationId") conversationId: string,
    @Body() data: { messageId?: string },
  ) {
    await this.chatService.markAsRead(user.id, conversationId, data.messageId);
  }

  // Presence Management
  @Put("presence")
  @UseGuards(JwtAuthGuard)
  async updatePresence(
    @CurrentUser() user: any,
    @Body() dto: UpdatePresenceDto,
  ) {
    return this.chatService.updatePresence(
      user.id,
      dto.workspaceId,
      dto.status,
    );
  }

  @Get("presence/:workspaceId")
  @UseGuards(JwtAuthGuard)
  async getPresence(
    @CurrentUser() user: any,
    @Param("workspaceId") workspaceId: string,
  ) {
    return this.chatService.getPresence(user.id, workspaceId);
  }

  // Search
  @Get("search")
  @UseGuards(JwtAuthGuard)
  async searchMessages(
    @CurrentUser() user: any,
    @Query() query: SearchMessagesQueryDto,
  ) {
    return this.chatService.searchMessages(user.id, query);
  }

  // Utility endpoints
  @Get("conversations/:conversationId/threads/:threadId")
  @UseGuards(JwtAuthGuard)
  async getThread(
    @CurrentUser() user: any,
    @Param("conversationId") conversationId: string,
    @Param("threadId") threadId: string,
    @Query() query: Omit<GetMessagesQueryDto, "conversationId" | "threadId">,
  ) {
    return this.chatService.getMessages(user.id, {
      ...query,
      conversationId,
      threadId,
    });
  }

  @Get("workspaces/:workspaceId/unread-count")
  @UseGuards(JwtAuthGuard)
  async getUnreadCount(
    @CurrentUser() user: any,
    @Param("workspaceId") workspaceId: string,
  ) {
    const conversations = await this.chatService.getConversations(user.id, {
      workspaceId,
      page: 1,
      limit: 1000, // Get all conversations for unread count
    });

    const totalUnread = conversations.reduce(
      (sum, conv) => sum + (conv.unreadCount || 0),
      0,
    );

    return { totalUnread, conversations: conversations.length };
  }
}
