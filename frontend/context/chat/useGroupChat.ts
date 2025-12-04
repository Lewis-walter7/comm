import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import groupChatApi, {
  GroupChat,
  GroupChatMember,
  CreateGroupChatDto,
  UpdateGroupChatDto,
  AddGroupMemberDto,
  UpdateGroupMemberRoleDto,
  RemoveGroupMemberDto,
  GroupMemberPreferencesDto,
  PinMessageDto,
  SearchGroupMessagesDto,
  MentionMessageDto,
  GroupChatInvite,
  GroupChatStats,
  WorkspaceInfo,
} from "../../services/chat/groupChatApi";
import { ConversationRole } from "../../services/chat/chatApi";

interface UseGroupChatOptions {
  workspaceId?: string;
  conversationId?: string;
  autoLoad?: boolean;
}

interface GroupChatState {
  groupChats: GroupChat[];
  currentGroupChat: GroupChat | null;
  members: GroupChatMember[];
  pinnedMessages: any[];
  invites: GroupChatInvite[];
  stats: GroupChatStats | null;
  searchResults: any[];
  workspaceInfo: WorkspaceInfo | null;
  isLoading: boolean;
  isLoadingMembers: boolean;
  isLoadingMessages: boolean;
  isSending: boolean;
  error: string | null;
  permissions: {
    isMember: boolean;
    isAdmin: boolean;
    canInvite: boolean;
    canPin: boolean;
  };
}

export const useGroupChat = (options: UseGroupChatOptions = {}) => {
  const { workspaceId, conversationId, autoLoad = true } = options;
  const router = useRouter();

  const [state, setState] = useState<GroupChatState>({
    groupChats: [],
    currentGroupChat: null,
    members: [],
    pinnedMessages: [],
    invites: [],
    stats: null,
    searchResults: [],
    workspaceInfo: null,
    isLoading: false,
    isLoadingMembers: false,
    isLoadingMessages: false,
    isSending: false,
    error: null,
    permissions: {
      isMember: false,
      isAdmin: false,
      canInvite: false,
      canPin: false,
    },
  });

  // Helper to update state
  const updateState = useCallback((updates: Partial<GroupChatState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  // Load Workspace Info
  const loadWorkspaceInfo = useCallback(
    async (wsId: string) => {
      updateState({ isLoading: true, error: null });

      try {
        const info = await groupChatApi.getWorkspaceInfo(wsId);
        updateState({
          workspaceInfo: info,
          isLoading: false,
        });
        return info;
      } catch (error: any) {
        const errorMsg =
          error.response?.data?.message || "Failed to load workspace info";
        updateState({ error: errorMsg, isLoading: false });
        toast.error(errorMsg);
        throw error;
      }
    },
    [updateState],
  );

  // Load Group Chats for Workspace
  const loadGroupChats = useCallback(
    async (page: number = 1, limit: number = 50) => {
      if (!workspaceId) return;

      updateState({ isLoading: true, error: null });

      try {
        const response = await groupChatApi.getGroupChats(
          workspaceId,
          page,
          limit,
        );
        updateState({
          groupChats: response.chats,
          isLoading: false,
        });
        return response;
      } catch (error: any) {
        const errorMsg =
          error.response?.data?.message || "Failed to load group chats";
        updateState({ error: errorMsg, isLoading: false });
        toast.error(errorMsg);
        throw error;
      }
    },
    [workspaceId, updateState],
  );

  // Load Single Group Chat
  const loadGroupChat = useCallback(
    async (chatId: string) => {
      updateState({ isLoading: true, error: null });

      try {
        const groupChat = await groupChatApi.getGroupChat(chatId);
        updateState({
          currentGroupChat: groupChat,
          isLoading: false,
        });
        return groupChat;
      } catch (error: any) {
        const errorMsg =
          error.response?.data?.message || "Failed to load group chat";
        updateState({ error: errorMsg, isLoading: false });
        toast.error(errorMsg);
        throw error;
      }
    },
    [updateState],
  );

  // Create Group Chat
  const createGroupChat = useCallback(
    async (dto: CreateGroupChatDto) => {
      // Check if workspace can create groups
      if (state.workspaceInfo && !state.workspaceInfo.canCreateGroups) {
        const errorMsg = `Cannot create group chats in this workspace. Workspace requires more than 2 members (currently has ${state.workspaceInfo.memberCount}).`;
        toast.error(errorMsg);
        throw new Error(errorMsg);
      }

      updateState({ isLoading: true, error: null });

      try {
        const groupChat = await groupChatApi.createGroupChat(dto);
        updateState({
          groupChats: [groupChat, ...state.groupChats],
          currentGroupChat: groupChat,
          isLoading: false,
        });
        toast.success(`Group chat "${dto.name}" created successfully`);
        return groupChat;
      } catch (error: any) {
        const errorMsg =
          error.response?.data?.message || "Failed to create group chat";
        updateState({ error: errorMsg, isLoading: false });
        toast.error(errorMsg);
        throw error;
      }
    },
    [state.groupChats, state.workspaceInfo, updateState],
  );

  // Update Group Chat
  const updateGroupChat = useCallback(
    async (chatId: string, dto: UpdateGroupChatDto) => {
      updateState({ isLoading: true, error: null });

      try {
        const updatedChat = await groupChatApi.updateGroupChat(chatId, dto);
        updateState({
          groupChats: state.groupChats.map((chat) =>
            chat.id === chatId ? updatedChat : chat,
          ),
          currentGroupChat:
            state.currentGroupChat?.id === chatId
              ? updatedChat
              : state.currentGroupChat,
          isLoading: false,
        });
        toast.success("Group chat updated successfully");
        return updatedChat;
      } catch (error: any) {
        const errorMsg =
          error.response?.data?.message || "Failed to update group chat";
        updateState({ error: errorMsg, isLoading: false });
        toast.error(errorMsg);
        throw error;
      }
    },
    [state.groupChats, state.currentGroupChat, updateState],
  );

  // Delete Group Chat
  const deleteGroupChat = useCallback(
    async (chatId: string) => {
      if (
        !confirm(
          "Are you sure you want to delete this group chat? This action cannot be undone.",
        )
      ) {
        return;
      }

      updateState({ isLoading: true, error: null });

      try {
        await groupChatApi.deleteGroupChat(chatId);
        updateState({
          groupChats: state.groupChats.filter((chat) => chat.id !== chatId),
          currentGroupChat:
            state.currentGroupChat?.id === chatId
              ? null
              : state.currentGroupChat,
          isLoading: false,
        });
        toast.success("Group chat deleted successfully");
        router.push(`/w/${workspaceId}/chat`);
      } catch (error: any) {
        const errorMsg =
          error.response?.data?.message || "Failed to delete group chat";
        updateState({ error: errorMsg, isLoading: false });
        toast.error(errorMsg);
        throw error;
      }
    },
    [
      state.groupChats,
      state.currentGroupChat,
      workspaceId,
      router,
      updateState,
    ],
  );

  // Member Management
  const loadMembers = useCallback(
    async (chatId: string) => {
      updateState({ isLoadingMembers: true, error: null });

      try {
        const members = await groupChatApi.getGroupMembers(chatId);
        updateState({
          members,
          isLoadingMembers: false,
        });
        return members;
      } catch (error: any) {
        const errorMsg =
          error.response?.data?.message || "Failed to load members";
        updateState({ error: errorMsg, isLoadingMembers: false });
        toast.error(errorMsg);
        throw error;
      }
    },
    [updateState],
  );

  const addMembers = useCallback(
    async (chatId: string, dto: AddGroupMemberDto) => {
      updateState({ isLoadingMembers: true, error: null });

      try {
        const newMembers = await groupChatApi.addMembers(chatId, dto);
        updateState({
          members: [...state.members, ...newMembers],
          isLoadingMembers: false,
        });
        toast.success(`${newMembers.length} member(s) added successfully`);
        return newMembers;
      } catch (error: any) {
        const errorMsg =
          error.response?.data?.message || "Failed to add members";
        updateState({ error: errorMsg, isLoadingMembers: false });
        toast.error(errorMsg);
        throw error;
      }
    },
    [state.members, updateState],
  );

  const removeMember = useCallback(
    async (chatId: string, dto: RemoveGroupMemberDto) => {
      updateState({ isLoadingMembers: true, error: null });

      try {
        await groupChatApi.removeMember(chatId, dto);
        updateState({
          members: state.members.filter((m) => m.userId !== dto.userId),
          isLoadingMembers: false,
        });
        toast.success("Member removed successfully");
      } catch (error: any) {
        const errorMsg =
          error.response?.data?.message || "Failed to remove member";
        updateState({ error: errorMsg, isLoadingMembers: false });
        toast.error(errorMsg);
        throw error;
      }
    },
    [state.members, updateState],
  );

  const updateMemberRole = useCallback(
    async (chatId: string, dto: UpdateGroupMemberRoleDto) => {
      updateState({ isLoadingMembers: true, error: null });

      try {
        const updatedMember = await groupChatApi.updateMemberRole(chatId, dto);
        updateState({
          members: state.members.map((m) =>
            m.userId === dto.userId ? updatedMember : m,
          ),
          isLoadingMembers: false,
        });
        const roleText =
          dto.role === ConversationRole.ADMIN ? "Admin" : "Member";
        toast.success(`Member role updated to ${roleText}`);
        return updatedMember;
      } catch (error: any) {
        const errorMsg =
          error.response?.data?.message || "Failed to update member role";
        updateState({ error: errorMsg, isLoadingMembers: false });
        toast.error(errorMsg);
        throw error;
      }
    },
    [state.members, updateState],
  );

  const updateMemberPreferences = useCallback(
    async (chatId: string, dto: GroupMemberPreferencesDto) => {
      try {
        const updatedMember = await groupChatApi.updateMemberPreferences(
          chatId,
          dto,
        );
        updateState({
          members: state.members.map((m) =>
            m.userId === updatedMember.userId ? updatedMember : m,
          ),
        });
        toast.success("Preferences updated successfully");
        return updatedMember;
      } catch (error: any) {
        const errorMsg =
          error.response?.data?.message || "Failed to update preferences";
        toast.error(errorMsg);
        throw error;
      }
    },
    [state.members, updateState],
  );

  const leaveGroup = useCallback(
    async (chatId: string) => {
      if (!confirm("Are you sure you want to leave this group?")) {
        return;
      }

      updateState({ isLoading: true, error: null });

      try {
        await groupChatApi.leaveGroup(chatId);
        updateState({
          groupChats: state.groupChats.filter((chat) => chat.id !== chatId),
          currentGroupChat:
            state.currentGroupChat?.id === chatId
              ? null
              : state.currentGroupChat,
          isLoading: false,
        });
        toast.success("You have left the group");
        router.push(`/w/${workspaceId}/chat`);
      } catch (error: any) {
        const errorMsg =
          error.response?.data?.message || "Failed to leave group";
        updateState({ error: errorMsg, isLoading: false });
        toast.error(errorMsg);
        throw error;
      }
    },
    [
      state.groupChats,
      state.currentGroupChat,
      workspaceId,
      router,
      updateState,
    ],
  );

  // Message Features
  const sendMentionMessage = useCallback(
    async (dto: MentionMessageDto) => {
      updateState({ isSending: true, error: null });

      try {
        const message = await groupChatApi.sendMentionMessage(dto);
        updateState({ isSending: false });
        return message;
      } catch (error: any) {
        const errorMsg =
          error.response?.data?.message || "Failed to send message";
        updateState({ error: errorMsg, isSending: false });
        toast.error(errorMsg);
        throw error;
      }
    },
    [updateState],
  );

  const pinMessage = useCallback(
    async (chatId: string, dto: PinMessageDto) => {
      try {
        await groupChatApi.pinMessage(chatId, dto);
        updateState({
          pinnedMessages: [...state.pinnedMessages, dto.messageId],
        });
        toast.success("Message pinned successfully");
      } catch (error: any) {
        const errorMsg =
          error.response?.data?.message || "Failed to pin message";
        toast.error(errorMsg);
        throw error;
      }
    },
    [state.pinnedMessages, updateState],
  );

  const unpinMessage = useCallback(
    async (chatId: string, messageId: string) => {
      try {
        await groupChatApi.unpinMessage(chatId, messageId);
        updateState({
          pinnedMessages: state.pinnedMessages.filter((id) => id !== messageId),
        });
        toast.success("Message unpinned successfully");
      } catch (error: any) {
        const errorMsg =
          error.response?.data?.message || "Failed to unpin message";
        toast.error(errorMsg);
        throw error;
      }
    },
    [state.pinnedMessages, updateState],
  );

  const loadPinnedMessages = useCallback(
    async (chatId: string) => {
      updateState({ isLoadingMessages: true, error: null });

      try {
        const messages = await groupChatApi.getPinnedMessages(chatId);
        updateState({
          pinnedMessages: messages,
          isLoadingMessages: false,
        });
        return messages;
      } catch (error: any) {
        const errorMsg =
          error.response?.data?.message || "Failed to load pinned messages";
        updateState({ error: errorMsg, isLoadingMessages: false });
        toast.error(errorMsg);
        throw error;
      }
    },
    [updateState],
  );

  // Search Features
  const searchMessages = useCallback(
    async (dto: SearchGroupMessagesDto) => {
      if (!workspaceId) return;

      updateState({ isLoadingMessages: true, error: null });

      try {
        const response = await groupChatApi.searchGroupMessages(
          workspaceId,
          dto,
        );
        updateState({
          searchResults: response.messages,
          isLoadingMessages: false,
        });
        return response;
      } catch (error: any) {
        const errorMsg =
          error.response?.data?.message || "Failed to search messages";
        updateState({ error: errorMsg, isLoadingMessages: false });
        toast.error(errorMsg);
        throw error;
      }
    },
    [workspaceId, updateState],
  );

  const clearSearchResults = useCallback(() => {
    updateState({ searchResults: [] });
  }, [updateState]);

  // Invites Management
  const createInvite = useCallback(
    async (chatId: string, inviteeIds: string[]) => {
      try {
        const invites = await groupChatApi.createGroupInvite(
          chatId,
          inviteeIds,
        );
        toast.success(`${invites.length} invite(s) sent successfully`);
        return invites;
      } catch (error: any) {
        const errorMsg =
          error.response?.data?.message || "Failed to create invites";
        toast.error(errorMsg);
        throw error;
      }
    },
    [],
  );

  const acceptInvite = useCallback(
    async (inviteId: string) => {
      updateState({ isLoading: true, error: null });

      try {
        const groupChat = await groupChatApi.acceptGroupInvite(inviteId);
        updateState({
          groupChats: [groupChat, ...state.groupChats],
          isLoading: false,
        });
        toast.success("Invite accepted! Welcome to the group");
        return groupChat;
      } catch (error: any) {
        const errorMsg =
          error.response?.data?.message || "Failed to accept invite";
        updateState({ error: errorMsg, isLoading: false });
        toast.error(errorMsg);
        throw error;
      }
    },
    [state.groupChats, updateState],
  );

  const declineInvite = useCallback(async (inviteId: string) => {
    try {
      await groupChatApi.declineGroupInvite(inviteId);
      toast.success("Invite declined");
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "Failed to decline invite";
      toast.error(errorMsg);
      throw error;
    }
  }, []);

  // Stats
  const loadStats = useCallback(
    async (chatId: string) => {
      try {
        const stats = await groupChatApi.getGroupChatStats(chatId);
        updateState({ stats });
        return stats;
      } catch (error: any) {
        const errorMsg =
          error.response?.data?.message || "Failed to load stats";
        toast.error(errorMsg);
        throw error;
      }
    },
    [updateState],
  );

  // Check Permissions
  const checkPermissions = useCallback(
    async (chatId: string, userId: string) => {
      try {
        const permissions = await groupChatApi.checkUserPermission(
          chatId,
          userId,
        );
        updateState({ permissions });
        return permissions;
      } catch (error: any) {
        console.error("Failed to check permissions:", error);
        return {
          isMember: false,
          isAdmin: false,
          canInvite: false,
          canPin: false,
        };
      }
    },
    [updateState],
  );

  // Auto-load on mount
  useEffect(() => {
    if (autoLoad && workspaceId) {
      loadWorkspaceInfo(workspaceId);
      loadGroupChats();
    }
  }, [autoLoad, workspaceId, loadWorkspaceInfo, loadGroupChats]);

  useEffect(() => {
    if (autoLoad && conversationId) {
      loadGroupChat(conversationId);
      loadMembers(conversationId);
      loadPinnedMessages(conversationId);
    }
  }, [
    autoLoad,
    conversationId,
    loadGroupChat,
    loadMembers,
    loadPinnedMessages,
  ]);

  return {
    // State
    ...state,

    // Workspace Operations
    loadWorkspaceInfo,

    // Group Chat Operations
    loadGroupChats,
    loadGroupChat,
    createGroupChat,
    updateGroupChat,
    deleteGroupChat,

    // Member Operations
    loadMembers,
    addMembers,
    removeMember,
    updateMemberRole,
    updateMemberPreferences,
    leaveGroup,

    // Message Operations
    sendMentionMessage,
    pinMessage,
    unpinMessage,
    loadPinnedMessages,

    // Search Operations
    searchMessages,
    clearSearchResults,

    // Invite Operations
    createInvite,
    acceptInvite,
    declineInvite,

    // Stats and Permissions
    loadStats,
    checkPermissions,

    // Utility
    refreshGroupChat: () => conversationId && loadGroupChat(conversationId),
    refreshMembers: () => conversationId && loadMembers(conversationId),
  };
};

export default useGroupChat;
