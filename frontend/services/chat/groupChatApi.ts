import axios from "axios";
import { ConversationType, ConversationRole } from "../chat/chatApi";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Types
export interface CreateGroupChatDto {
  name: string;
  description?: string;
  icon?: string;
  workspaceId: string;
  initialMembers: string[];
  isPrivate?: boolean;
  allowMemberInvite?: boolean;
  maxMembers?: number;
}

export interface UpdateGroupChatDto {
  name?: string;
  description?: string;
  icon?: string;
  allowMemberInvite?: boolean;
  maxMembers?: number;
}

export interface AddGroupMemberDto {
  userIds: string[];
  inviteMessage?: string;
}

export interface UpdateGroupMemberRoleDto {
  userId: string;
  role: ConversationRole;
}

export interface RemoveGroupMemberDto {
  userId: string;
  reason?: string;
}

export interface GroupMemberPreferencesDto {
  muteNotifications?: boolean;
  customNickname?: string;
}

export interface PinMessageDto {
  messageId: string;
}

export interface SearchGroupMessagesDto {
  query: string;
  conversationId?: string;
  authorId?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  limit?: number;
}

export interface MentionMessageDto {
  conversationId: string;
  content: string;
  mentions: string[];
  replyToId?: string;
  attachments?: any[];
}

export interface GroupChatMember {
  id: string;
  userId: string;
  role: ConversationRole;
  joinedAt: Date;
  lastReadAt?: Date;
  leftAt?: Date;
  muteNotifications: boolean;
  customNickname?: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
}

export interface GroupChat {
  id: string;
  workspaceId: string;
  type: ConversationType;
  name: string;
  description?: string;
  icon?: string;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  isPrivate: boolean;
  maxMembers: number;
  allowMemberInvite: boolean;
  pinnedMessageIds: string[];
  memberCount: number;
  onlineMembers: number;
  lastActivity: Date;
  members: GroupChatMember[];
  lastMessage?: any;
  unreadCount: number;
}

export interface GroupChatInvite {
  id: string;
  conversationId: string;
  inviterId: string;
  inviteeId: string;
  workspaceId: string;
  status: string;
  expiresAt: Date;
  createdAt: Date;
  conversation: {
    id: string;
    name: string;
    icon?: string;
    memberCount: number;
  };
  inviter: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
}

export interface GroupChatStats {
  totalMessages: number;
  totalMembers: number;
  messagesLast24h: number;
}

export interface WorkspaceInfo {
  id: string;
  name: string;
  memberCount: number;
  canCreateGroups: boolean;
  groupCount: number;
}

// API Client
class GroupChatAPI {
  private getHeaders() {
    const token = localStorage.getItem("accessToken");
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }

  // Group Chat Management
  async createGroupChat(dto: CreateGroupChatDto): Promise<GroupChat> {
    const response = await axios.post(`${API_BASE_URL}/group-chats`, dto, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async getGroupChats(
    workspaceId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<{ chats: GroupChat[]; total: number; hasMore: boolean }> {
    const response = await axios.get(
      `${API_BASE_URL}/group-chats/workspace/${workspaceId}`,
      {
        headers: this.getHeaders(),
        params: { page, limit },
      },
    );
    return response.data;
  }

  async getGroupChat(conversationId: string): Promise<GroupChat> {
    const response = await axios.get(
      `${API_BASE_URL}/group-chats/${conversationId}`,
      { headers: this.getHeaders() },
    );
    return response.data;
  }

  async updateGroupChat(
    conversationId: string,
    dto: UpdateGroupChatDto,
  ): Promise<GroupChat> {
    const response = await axios.put(
      `${API_BASE_URL}/group-chats/${conversationId}`,
      dto,
      { headers: this.getHeaders() },
    );
    return response.data;
  }

  async deleteGroupChat(conversationId: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/group-chats/${conversationId}`, {
      headers: this.getHeaders(),
    });
  }

  // Member Management
  async addMembers(
    conversationId: string,
    dto: AddGroupMemberDto,
  ): Promise<GroupChatMember[]> {
    const response = await axios.post(
      `${API_BASE_URL}/group-chats/${conversationId}/members`,
      dto,
      { headers: this.getHeaders() },
    );
    return response.data;
  }

  async getGroupMembers(conversationId: string): Promise<GroupChatMember[]> {
    const response = await axios.get(
      `${API_BASE_URL}/group-chats/${conversationId}/members`,
      { headers: this.getHeaders() },
    );
    return response.data;
  }

  async removeMember(
    conversationId: string,
    dto: RemoveGroupMemberDto,
  ): Promise<void> {
    await axios.delete(
      `${API_BASE_URL}/group-chats/${conversationId}/members`,
      {
        headers: this.getHeaders(),
        data: dto,
      },
    );
  }

  async updateMemberRole(
    conversationId: string,
    dto: UpdateGroupMemberRoleDto,
  ): Promise<GroupChatMember> {
    const response = await axios.put(
      `${API_BASE_URL}/group-chats/${conversationId}/members/role`,
      dto,
      { headers: this.getHeaders() },
    );
    return response.data;
  }

  async updateMemberPreferences(
    conversationId: string,
    dto: GroupMemberPreferencesDto,
  ): Promise<GroupChatMember> {
    const response = await axios.put(
      `${API_BASE_URL}/group-chats/${conversationId}/members/preferences`,
      dto,
      { headers: this.getHeaders() },
    );
    return response.data;
  }

  async leaveGroup(conversationId: string): Promise<void> {
    await axios.post(
      `${API_BASE_URL}/group-chats/${conversationId}/leave`,
      {},
      { headers: this.getHeaders() },
    );
  }

  // Message Features
  async sendMentionMessage(dto: MentionMessageDto): Promise<any> {
    const response = await axios.post(
      `${API_BASE_URL}/group-chats/${dto.conversationId}/messages/mention`,
      dto,
      { headers: this.getHeaders() },
    );
    return response.data;
  }

  async pinMessage(conversationId: string, dto: PinMessageDto): Promise<void> {
    await axios.post(
      `${API_BASE_URL}/group-chats/${conversationId}/messages/pin`,
      dto,
      { headers: this.getHeaders() },
    );
  }

  async unpinMessage(conversationId: string, messageId: string): Promise<void> {
    await axios.delete(
      `${API_BASE_URL}/group-chats/${conversationId}/messages/${messageId}/pin`,
      { headers: this.getHeaders() },
    );
  }

  async getPinnedMessages(conversationId: string): Promise<any[]> {
    const response = await axios.get(
      `${API_BASE_URL}/group-chats/${conversationId}/messages/pinned`,
      { headers: this.getHeaders() },
    );
    return response.data;
  }

  // Search Features
  async searchGroupMessages(
    workspaceId: string,
    dto: SearchGroupMessagesDto,
  ): Promise<{ messages: any[]; total: number; hasMore: boolean }> {
    const response = await axios.get(
      `${API_BASE_URL}/group-chats/workspace/${workspaceId}/search`,
      {
        headers: this.getHeaders(),
        params: dto,
      },
    );
    return response.data;
  }

  // Group Invites
  async createGroupInvite(
    conversationId: string,
    inviteeIds: string[],
  ): Promise<GroupChatInvite[]> {
    const response = await axios.post(
      `${API_BASE_URL}/group-chats/${conversationId}/invites`,
      { inviteeIds },
      { headers: this.getHeaders() },
    );
    return response.data;
  }

  async acceptGroupInvite(inviteId: string): Promise<GroupChat> {
    const response = await axios.post(
      `${API_BASE_URL}/group-chats/invites/${inviteId}/accept`,
      {},
      { headers: this.getHeaders() },
    );
    return response.data;
  }

  async declineGroupInvite(inviteId: string): Promise<void> {
    await axios.post(
      `${API_BASE_URL}/group-chats/invites/${inviteId}/decline`,
      {},
      { headers: this.getHeaders() },
    );
  }

  // Stats and Analytics
  async getGroupChatStats(conversationId: string): Promise<GroupChatStats> {
    const response = await axios.get(
      `${API_BASE_URL}/group-chats/${conversationId}/stats`,
      { headers: this.getHeaders() },
    );
    return response.data;
  }

  async getWorkspaceInfo(workspaceId: string): Promise<WorkspaceInfo> {
    const response = await axios.get(
      `${API_BASE_URL}/group-chats/workspace/${workspaceId}/info`,
      { headers: this.getHeaders() },
    );
    return response.data;
  }

  // Utility Methods
  async checkUserPermission(
    conversationId: string,
    userId: string,
  ): Promise<{
    isMember: boolean;
    isAdmin: boolean;
    canInvite: boolean;
    canPin: boolean;
  }> {
    try {
      const members = await this.getGroupMembers(conversationId);
      const member = members.find((m) => m.userId === userId);

      if (!member || member.leftAt) {
        return {
          isMember: false,
          isAdmin: false,
          canInvite: false,
          canPin: false,
        };
      }

      const isAdmin = member.role === ConversationRole.ADMIN;
      const groupChat = await this.getGroupChat(conversationId);

      return {
        isMember: true,
        isAdmin,
        canInvite: isAdmin || groupChat.allowMemberInvite,
        canPin: isAdmin,
      };
    } catch (error) {
      return {
        isMember: false,
        isAdmin: false,
        canInvite: false,
        canPin: false,
      };
    }
  }

  async getUnreadCount(
    conversationId: string,
    userId: string,
  ): Promise<number> {
    try {
      const members = await this.getGroupMembers(conversationId);
      const member = members.find((m) => m.userId === userId);

      if (!member || !member.lastReadAt) {
        return 0;
      }

      // This would typically be calculated on the backend
      // For now, return 0 as placeholder
      return 0;
    } catch (error) {
      return 0;
    }
  }

  // Batch Operations
  async batchAddMembers(
    conversationId: string,
    userIds: string[],
    batchSize: number = 10,
  ): Promise<GroupChatMember[]> {
    const batches = [];
    for (let i = 0; i < userIds.length; i += batchSize) {
      batches.push(userIds.slice(i, i + batchSize));
    }

    const results: GroupChatMember[] = [];
    for (const batch of batches) {
      const members = await this.addMembers(conversationId, {
        userIds: batch,
      });
      results.push(...members);
    }

    return results;
  }

  // Message Pagination Helper
  async loadMoreMessages(
    conversationId: string,
    lastMessageId: string,
    limit: number = 50,
  ): Promise<any[]> {
    // This would integrate with the existing chat API
    // Placeholder implementation
    return [];
  }

  // Export Group Chat Data
  async exportGroupChatData(conversationId: string): Promise<Blob> {
    const response = await axios.get(
      `${API_BASE_URL}/group-chats/${conversationId}/export`,
      {
        headers: this.getHeaders(),
        responseType: "blob",
      },
    );
    return response.data;
  }
}

export const groupChatApi = new GroupChatAPI();
export default groupChatApi;
