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
import { GroupChatService } from "./group-chat.service";
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
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@Controller("group-chats")
@UseGuards(JwtAuthGuard)
export class GroupChatController {
  constructor(private readonly groupChatService: GroupChatService) {}

  // Group Chat Management
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async createGroupChat(
    @CurrentUser() user: any,
    @Body() dto: CreateGroupChatDto,
  ): Promise<GroupChatDto> {
    return this.groupChatService.createGroupChat(user.sub, dto);
  }

  @Get("workspace/:workspaceId")
  async getGroupChats(
    @CurrentUser() user: any,
    @Param("workspaceId") workspaceId: string,
    @Query("page") page?: number,
    @Query("limit") limit?: number,
  ): Promise<{ chats: GroupChatDto[]; total: number; hasMore: boolean }> {
    return this.groupChatService.getGroupChats(
      user.sub,
      workspaceId,
      page ? parseInt(String(page)) : 1,
      limit ? parseInt(String(limit)) : 50,
    );
  }

  @Get(":conversationId")
  async getGroupChat(
    @CurrentUser() user: any,
    @Param("conversationId") conversationId: string,
  ): Promise<GroupChatDto> {
    return this.groupChatService.getGroupChat(user.sub, conversationId);
  }

  @Put(":conversationId")
  async updateGroupChat(
    @CurrentUser() user: any,
    @Param("conversationId") conversationId: string,
    @Body() dto: UpdateGroupChatDto,
  ): Promise<GroupChatDto> {
    return this.groupChatService.updateGroupChat(user.sub, conversationId, dto);
  }

  @Delete(":conversationId")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteGroupChat(
    @CurrentUser() user: any,
    @Param("conversationId") conversationId: string,
  ): Promise<void> {
    return this.groupChatService.deleteGroupChat(user.sub, conversationId);
  }

  // Member Management
  @Post(":conversationId/members")
  async addMembers(
    @CurrentUser() user: any,
    @Param("conversationId") conversationId: string,
    @Body() dto: AddGroupMemberDto,
  ): Promise<GroupChatMemberDto[]> {
    return this.groupChatService.addMembers(user.sub, conversationId, dto);
  }

  @Get(":conversationId/members")
  async getGroupMembers(
    @CurrentUser() user: any,
    @Param("conversationId") conversationId: string,
  ): Promise<GroupChatMemberDto[]> {
    return this.groupChatService.getGroupMembers(user.sub, conversationId);
  }

  @Delete(":conversationId/members")
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeMember(
    @CurrentUser() user: any,
    @Param("conversationId") conversationId: string,
    @Body() dto: RemoveGroupMemberDto,
  ): Promise<void> {
    return this.groupChatService.removeMember(user.sub, conversationId, dto);
  }

  @Put(":conversationId/members/role")
  async updateMemberRole(
    @CurrentUser() user: any,
    @Param("conversationId") conversationId: string,
    @Body() dto: UpdateGroupMemberRoleDto,
  ): Promise<GroupChatMemberDto> {
    return this.groupChatService.updateMemberRole(
      user.sub,
      conversationId,
      dto,
    );
  }

  @Put(":conversationId/members/preferences")
  async updateMemberPreferences(
    @CurrentUser() user: any,
    @Param("conversationId") conversationId: string,
    @Body() dto: GroupMemberPreferencesDto,
  ): Promise<GroupChatMemberDto> {
    return this.groupChatService.updateMemberPreferences(
      user.sub,
      conversationId,
      dto,
    );
  }

  // Message Features
  @Post(":conversationId/messages/mention")
  async sendMentionMessage(
    @CurrentUser() user: any,
    @Body() dto: MentionMessageDto,
  ): Promise<any> {
    return this.groupChatService.sendMentionMessage(user.sub, dto);
  }

  @Post(":conversationId/messages/pin")
  @HttpCode(HttpStatus.NO_CONTENT)
  async pinMessage(
    @CurrentUser() user: any,
    @Param("conversationId") conversationId: string,
    @Body() dto: PinMessageDto,
  ): Promise<void> {
    return this.groupChatService.pinMessage(user.sub, conversationId, dto);
  }

  @Delete(":conversationId/messages/:messageId/pin")
  @HttpCode(HttpStatus.NO_CONTENT)
  async unpinMessage(
    @CurrentUser() user: any,
    @Param("conversationId") conversationId: string,
    @Param("messageId") messageId: string,
  ): Promise<void> {
    return this.groupChatService.unpinMessage(
      user.sub,
      conversationId,
      messageId,
    );
  }

  @Get(":conversationId/messages/pinned")
  async getPinnedMessages(
    @CurrentUser() user: any,
    @Param("conversationId") conversationId: string,
  ): Promise<any[]> {
    return this.groupChatService.getPinnedMessages(user.sub, conversationId);
  }

  // Workspace Info
  @Get("workspace/:workspaceId/info")
  async getWorkspaceInfo(
    @CurrentUser() user: any,
    @Param("workspaceId") workspaceId: string,
  ): Promise<{
    id: string;
    name: string;
    memberCount: number;
    canCreateGroups: boolean;
    groupCount: number;
  }> {
    return this.groupChatService.getWorkspaceInfo(user.sub, workspaceId);
  }

  // Search Features
  @Get("workspace/:workspaceId/search")
  async searchGroupMessages(
    @CurrentUser() user: any,
    @Param("workspaceId") workspaceId: string,
    @Query() dto: SearchGroupMessagesDto,
  ): Promise<{
    messages: any[];
    total: number;
    hasMore: boolean;
  }> {
    return this.groupChatService.searchGroupMessages(
      user.sub,
      workspaceId,
      dto,
    );
  }

  // Group Invites
  @Post(":conversationId/invites")
  async createGroupInvite(
    @CurrentUser() user: any,
    @Param("conversationId") conversationId: string,
    @Body() body: { inviteeIds: string[] },
  ): Promise<GroupChatInviteDto[]> {
    return this.groupChatService.createGroupInvite(
      user.sub,
      conversationId,
      body.inviteeIds,
    );
  }

  @Post("invites/:inviteId/accept")
  async acceptGroupInvite(
    @CurrentUser() user: any,
    @Param("inviteId") inviteId: string,
  ): Promise<GroupChatDto> {
    return this.groupChatService.acceptGroupInvite(user.sub, inviteId);
  }

  @Post("invites/:inviteId/decline")
  @HttpCode(HttpStatus.NO_CONTENT)
  async declineGroupInvite(
    @CurrentUser() user: any,
    @Param("inviteId") inviteId: string,
  ): Promise<void> {
    return this.groupChatService.declineGroupInvite(user.sub, inviteId);
  }

  // Stats and Analytics
  @Get(":conversationId/stats")
  async getGroupChatStats(
    @CurrentUser() user: any,
    @Param("conversationId") conversationId: string,
  ): Promise<any> {
    return this.groupChatService.getGroupChatStats(user.sub, conversationId);
  }

  // Leave Group
  @Post(":conversationId/leave")
  @HttpCode(HttpStatus.NO_CONTENT)
  async leaveGroup(
    @CurrentUser() user: any,
    @Param("conversationId") conversationId: string,
  ): Promise<void> {
    return this.groupChatService.removeMember(user.sub, conversationId, {
      userId: user.sub,
    });
  }
}
