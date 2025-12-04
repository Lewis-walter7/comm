import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface ConversationType {
  DM: "DM";
  GROUP: "GROUP";
  DOCUMENT: "DOCUMENT";
}

export interface ConversationRole {
  ADMIN: "ADMIN";
  MEMBER: "MEMBER";
}

export interface CreateConversationDto {
  type: "DM" | "GROUP" | "DOCUMENT";
  name?: string;
  description?: string;
  icon?: string;
  workspaceId: string;
  documentId?: string;
  memberIds?: string[];
  isEncrypted?: boolean;
}

export interface UpdateConversationDto {
  name?: string;
  description?: string;
  icon?: string;
}

export interface SendMessageDto {
  content: string;
  replyToId?: string;
  attachments?: AttachmentDto[];
}

export interface EditMessageDto {
  content: string;
}

export interface AttachmentDto {
  fileName: string;
  filePath: string;
  mimeType: string;
  fileSize: string;
  isEncrypted?: boolean;
}

export interface AddReactionDto {
  emoji: string;
}

export interface AddMemberDto {
  userId: string;
  role?: "ADMIN" | "MEMBER";
}

export interface UpdateMemberRoleDto {
  role: "ADMIN" | "MEMBER";
}

export interface UpdatePresenceDto {
  status: "online" | "away" | "busy" | "offline";
  workspaceId: string;
}

export interface ConversationDto {
  id: string;
  workspaceId: string;
  type: "DM" | "GROUP" | "DOCUMENT";
  name: string | null;
  description: string | null;
  icon: string | null;
  createdById: string;
  documentId: string | null;
  isEncrypted: boolean;
  createdAt: string;
  updatedAt: string;
  members: ConversationMemberDto[];
  lastMessage?: MessageDto;
  unreadCount?: number;
}

export interface ConversationMemberDto {
  id: string;
  userId: string;
  role: "ADMIN" | "MEMBER";
  joinedAt: string;
  lastReadAt: string | null;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
}

export interface MessageDto {
  id: string;
  conversationId: string;
  userId: string;
  content: string;
  attachments: any[] | null;
  replyToId: string | null;
  editedAt: string | null;
  deletedAt: string | null;
  reactions: Record<string, string[]> | null;
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
  replyTo?: MessageDto;
  readReceipts: MessageReadReceiptDto[];
}

export interface MessageReadReceiptDto {
  id: string;
  userId: string;
  readAt: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export interface PresenceDto {
  userId: string;
  workspaceId: string;
  status: string;
  lastSeen: string;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export interface GetConversationsQuery {
  workspaceId?: string;
  type?: "DM" | "GROUP" | "DOCUMENT";
  documentId?: string;
  page?: number;
  limit?: number;
}

export interface GetMessagesQuery {
  page?: number;
  limit?: number;
  before?: string;
  after?: string;
  threadId?: string;
}

export interface SearchMessagesQuery {
  workspaceId: string;
  query: string;
  conversationId?: string;
  page?: number;
  limit?: number;
}

class ChatApi {
  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken");
  }

  private getHeaders() {
    const token = this.getAuthToken();
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Conversation Management
  async createConversation(
    dto: CreateConversationDto,
  ): Promise<ConversationDto> {
    const response = await axios.post(
      `${API_BASE_URL}/chat/conversations`,
      dto,
      { headers: this.getHeaders() },
    );
    return response.data;
  }

  async getConversations(
    query: GetConversationsQuery = {},
  ): Promise<ConversationDto[]> {
    const response = await axios.get(`${API_BASE_URL}/chat/conversations`, {
      headers: this.getHeaders(),
      params: query,
    });
    return response.data;
  }

  async getConversation(conversationId: string): Promise<ConversationDto> {
    const response = await axios.get(
      `${API_BASE_URL}/chat/conversations/${conversationId}`,
      { headers: this.getHeaders() },
    );
    return response.data;
  }

  async updateConversation(
    conversationId: string,
    dto: UpdateConversationDto,
  ): Promise<ConversationDto> {
    const response = await axios.put(
      `${API_BASE_URL}/chat/conversations/${conversationId}`,
      dto,
      { headers: this.getHeaders() },
    );
    return response.data;
  }

  async deleteConversation(conversationId: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/chat/conversations/${conversationId}`, {
      headers: this.getHeaders(),
    });
  }

  // Message Management
  async sendMessage(
    conversationId: string,
    dto: SendMessageDto,
  ): Promise<MessageDto> {
    const response = await axios.post(
      `${API_BASE_URL}/chat/conversations/${conversationId}/messages`,
      dto,
      { headers: this.getHeaders() },
    );
    return response.data;
  }

  async getMessages(
    conversationId: string,
    query: GetMessagesQuery = {},
  ): Promise<MessageDto[]> {
    const response = await axios.get(
      `${API_BASE_URL}/chat/conversations/${conversationId}/messages`,
      {
        headers: this.getHeaders(),
        params: query,
      },
    );
    return response.data;
  }

  async editMessage(
    messageId: string,
    dto: EditMessageDto,
  ): Promise<MessageDto> {
    const response = await axios.put(
      `${API_BASE_URL}/chat/messages/${messageId}`,
      dto,
      { headers: this.getHeaders() },
    );
    return response.data;
  }

  async deleteMessage(messageId: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/chat/messages/${messageId}`, {
      headers: this.getHeaders(),
    });
  }

  async addReaction(
    messageId: string,
    dto: AddReactionDto,
  ): Promise<MessageDto> {
    const response = await axios.post(
      `${API_BASE_URL}/chat/messages/${messageId}/reactions`,
      dto,
      { headers: this.getHeaders() },
    );
    return response.data;
  }

  // Member Management
  async addMember(conversationId: string, dto: AddMemberDto): Promise<void> {
    await axios.post(
      `${API_BASE_URL}/chat/conversations/${conversationId}/members`,
      dto,
      { headers: this.getHeaders() },
    );
  }

  async removeMember(conversationId: string, memberId: string): Promise<void> {
    await axios.delete(
      `${API_BASE_URL}/chat/conversations/${conversationId}/members/${memberId}`,
      { headers: this.getHeaders() },
    );
  }

  async updateMemberRole(
    conversationId: string,
    memberId: string,
    dto: UpdateMemberRoleDto,
  ): Promise<void> {
    await axios.put(
      `${API_BASE_URL}/chat/conversations/${conversationId}/members/${memberId}/role`,
      dto,
      { headers: this.getHeaders() },
    );
  }

  async markAsRead(conversationId: string, messageId?: string): Promise<void> {
    await axios.post(
      `${API_BASE_URL}/chat/conversations/${conversationId}/read`,
      { messageId },
      { headers: this.getHeaders() },
    );
  }

  // Presence Management
  async updatePresence(dto: UpdatePresenceDto): Promise<PresenceDto> {
    const response = await axios.put(`${API_BASE_URL}/chat/presence`, dto, {
      headers: this.getHeaders(),
    });
    return response.data;
  }

  async getPresence(workspaceId: string): Promise<PresenceDto[]> {
    const response = await axios.get(
      `${API_BASE_URL}/chat/presence/${workspaceId}`,
      { headers: this.getHeaders() },
    );
    return response.data;
  }

  // Search
  async searchMessages(query: SearchMessagesQuery): Promise<MessageDto[]> {
    const response = await axios.get(`${API_BASE_URL}/chat/search`, {
      headers: this.getHeaders(),
      params: query,
    });
    return response.data;
  }

  // Threads
  async getThread(
    conversationId: string,
    threadId: string,
    query: GetMessagesQuery = {},
  ): Promise<MessageDto[]> {
    const response = await axios.get(
      `${API_BASE_URL}/chat/conversations/${conversationId}/threads/${threadId}`,
      {
        headers: this.getHeaders(),
        params: query,
      },
    );
    return response.data;
  }

  // Utility
  async getUnreadCount(
    workspaceId: string,
  ): Promise<{ totalUnread: number; conversations: number }> {
    const response = await axios.get(
      `${API_BASE_URL}/chat/workspaces/${workspaceId}/unread-count`,
      { headers: this.getHeaders() },
    );
    return response.data;
  }
}

export const chatApi = new ChatApi();
