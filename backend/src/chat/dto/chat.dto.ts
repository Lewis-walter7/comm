import {
  IsString,
  IsOptional,
  IsUUID,
  IsEnum,
  IsBoolean,
  IsArray,
  ValidateNested,
  IsDateString,
} from "class-validator";
import { Transform, Type } from "class-transformer";
import { ConversationType, ConversationRole } from "@prisma/client";

// Base DTOs
export class CreateConversationDto {
  @IsEnum(ConversationType)
  type: ConversationType;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsUUID()
  workspaceId: string;

  @IsOptional()
  @IsUUID()
  documentId?: string;

  @IsOptional()
  @IsArray()
  @IsUUID("4", { each: true })
  memberIds?: string[];

  @IsOptional()
  @IsBoolean()
  isEncrypted?: boolean;
}

export class UpdateConversationDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;
}

export class SendMessageDto {
  @IsUUID()
  conversationId: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsUUID()
  replyToId?: string;

  @IsOptional()
  @IsArray()
  attachments?: AttachmentDto[];
}

export class EditMessageDto {
  @IsString()
  content: string;
}

export class AttachmentDto {
  @IsString()
  fileName: string;

  @IsString()
  filePath: string;

  @IsString()
  mimeType: string;

  @IsString()
  fileSize: string;

  @IsOptional()
  @IsBoolean()
  isEncrypted?: boolean;
}

// Enhanced Group Chat DTOs
export class CreateGroupChatDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsUUID()
  workspaceId: string;

  @IsArray()
  @IsUUID("4", { each: true })
  initialMembers: string[];

  @IsOptional()
  @IsBoolean()
  isPrivate?: boolean;

  @IsOptional()
  @IsBoolean()
  allowMemberInvite?: boolean;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  maxMembers?: number;
}

export class UpdateGroupChatDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  icon?: string;

  @IsOptional()
  @IsBoolean()
  allowMemberInvite?: boolean;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  maxMembers?: number;
}

export class AddGroupMemberDto {
  @IsArray()
  @IsUUID("4", { each: true })
  userIds: string[];

  @IsOptional()
  @IsString()
  inviteMessage?: string;
}

export class UpdateGroupMemberRoleDto {
  @IsUUID()
  userId: string;

  @IsEnum(ConversationRole)
  role: ConversationRole;
}

export class RemoveGroupMemberDto {
  @IsUUID()
  userId: string;

  @IsOptional()
  @IsString()
  reason?: string;
}

export class GroupMemberPreferencesDto {
  @IsOptional()
  @IsBoolean()
  muteNotifications?: boolean;

  @IsOptional()
  @IsString()
  customNickname?: string;
}

export class PinMessageDto {
  @IsUUID()
  messageId: string;
}

export class SearchGroupMessagesDto {
  @IsString()
  query: string;

  @IsOptional()
  @IsUUID()
  conversationId?: string;

  @IsOptional()
  @IsUUID()
  authorId?: string;

  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @IsOptional()
  @IsDateString()
  toDate?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 20;
}

export class MentionMessageDto extends SendMessageDto {
  @IsArray()
  @IsUUID("4", { each: true })
  mentions: string[];
}

// Response DTOs
export class GroupChatMemberDto {
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

export class GroupChatDto extends ConversationDto {
  isPrivate: boolean;
  maxMembers: number;
  allowMemberInvite: boolean;
  pinnedMessageIds: string[];
  memberCount: number;
  onlineMembers: number;
  lastActivity: Date;
}

export class GroupChatInviteDto {
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

export class AddReactionDto {
  @IsString()
  emoji: string;
}

export class AddMemberDto {
  @IsUUID()
  userId: string;

  @IsOptional()
  @IsEnum(ConversationRole)
  role?: ConversationRole = ConversationRole.MEMBER;
}

export class UpdateMemberRoleDto {
  @IsEnum(ConversationRole)
  role: ConversationRole;
}

export class UpdatePresenceDto {
  @IsString()
  status: "online" | "away" | "busy" | "offline";

  @IsUUID()
  workspaceId: string;
}

// Response DTOs
export class ConversationDto {
  id: string;
  workspaceId: string;
  type: ConversationType;
  name: string | null;
  description: string | null;
  icon: string | null;
  createdById: string;
  documentId: string | null;
  isEncrypted: boolean;
  createdAt: Date;
  updatedAt: Date;
  members: ConversationMemberDto[];
  lastMessage?: MessageDto;
  unreadCount?: number;
}

export class ConversationMemberDto {
  id: string;
  userId: string;
  role: ConversationRole;
  joinedAt: Date;
  lastReadAt: Date | null;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
}

export class MessageDto {
  id: string;
  conversationId: string;
  userId: string;
  content: string;
  attachments: any[] | null;
  replyToId: string | null;
  editedAt: Date | null;
  deletedAt: Date | null;
  reactions: Record<string, string[]> | null;
  createdAt: Date;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
  replyTo?: MessageDto;
  readReceipts: MessageReadReceiptDto[];
}

export class MessageReadReceiptDto {
  id: string;
  userId: string;
  readAt: Date;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export class PresenceDto {
  userId: string;
  workspaceId: string;
  status: string;
  lastSeen: Date;
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

// WebSocket DTOs
export class JoinRoomDto {
  @IsUUID()
  workspaceId: string;

  @IsOptional()
  @IsUUID()
  conversationId?: string;
}

export class TypingDto {
  @IsUUID()
  conversationId: string;

  @IsBoolean()
  isTyping: boolean;
}

export class WebSocketMessageDto {
  @IsUUID()
  conversationId: string;

  @IsString()
  content: string;

  @IsOptional()
  @IsUUID()
  replyToId?: string;

  @IsOptional()
  attachments?: AttachmentDto[];
}

// Query DTOs
export class GetConversationsQueryDto {
  @IsOptional()
  @IsUUID()
  workspaceId?: string;

  @IsOptional()
  @IsEnum(ConversationType)
  type?: ConversationType;

  @IsOptional()
  @IsUUID()
  documentId?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 20;
}

export class GetMessagesQueryDto {
  @IsUUID()
  conversationId: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 50;

  @IsOptional()
  @IsDateString()
  before?: string;

  @IsOptional()
  @IsDateString()
  after?: string;

  @IsOptional()
  @IsUUID()
  threadId?: string;
}

export class SearchMessagesQueryDto {
  @IsUUID()
  workspaceId: string;

  @IsString()
  query: string;

  @IsOptional()
  @IsUUID()
  conversationId?: string;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number = 20;
}
