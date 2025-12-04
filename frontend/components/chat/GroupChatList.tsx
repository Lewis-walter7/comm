"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Users,
  Hash,
  Lock,
  MoreVertical,
  UserPlus,
  Settings,
  LogOut,
  Trash2,
  Pin,
  Bell,
  BellOff,
  CheckCircle,
} from "lucide-react";
import { GroupChat } from "../../services/chat/groupChatApi";
import { formatDistanceToNow } from "date-fns";
import { ConversationRole } from "../../services/chat/chatApi";

interface GroupChatListProps {
  groupChats: GroupChat[];
  activeGroupChatId?: string;
  workspaceId: string;
  currentUserId: string;
  onCreateGroup?: () => void;
  onGroupSelect?: (groupChat: GroupChat) => void;
  onLeaveGroup?: (groupChatId: string) => void;
  onDeleteGroup?: (groupChatId: string) => void;
  onUpdatePreferences?: (groupChatId: string, muted: boolean) => void;
  isLoading?: boolean;
}

interface GroupChatItemProps {
  groupChat: GroupChat;
  isActive: boolean;
  currentUserId: string;
  onSelect: () => void;
  onLeave: () => void;
  onDelete: () => void;
  onToggleMute: () => void;
}

function GroupChatItem({
  groupChat,
  isActive,
  currentUserId,
  onSelect,
  onLeave,
  onDelete,
  onToggleMute,
}: GroupChatItemProps) {
  const [showMenu, setShowMenu] = useState(false);

  const currentMember = groupChat.members.find(
    (m) => m.userId === currentUserId,
  );
  const isAdmin = currentMember?.role === ConversationRole.ADMIN;
  const isMuted = currentMember?.muteNotifications || false;
  const isCreator = groupChat.createdById === currentUserId;

  const getLastActivity = () => {
    if (groupChat.lastMessage) {
      return formatDistanceToNow(new Date(groupChat.lastMessage.createdAt), {
        addSuffix: true,
      });
    }
    return formatDistanceToNow(new Date(groupChat.lastActivity), {
      addSuffix: true,
    });
  };

  const getLastMessagePreview = () => {
    if (!groupChat.lastMessage) return "No messages yet";

    const message = groupChat.lastMessage;
    const prefix = message.user?.name ? `${message.user.name}: ` : "Someone: ";
    const content =
      message.content.length > 40
        ? message.content.substring(0, 40) + "..."
        : message.content;

    return prefix + content;
  };

  return (
    <div
      className={`group relative p-4 rounded-xl cursor-pointer transition-all duration-200 ${
        isActive
          ? "glass-strong border border-violet-200 dark:border-violet-500/30 neon-glow-violet"
          : "glass hover:glass-strong hover:scale-[1.02]"
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1 min-w-0">
          {/* Group Icon */}
          <div
            className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
              isActive
                ? "bg-gradient-to-br from-violet-400 to-blue-500 neon-glow-blue"
                : "glass-strong"
            }`}
          >
            {groupChat.icon || "💬"}
          </div>

          {/* Group Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2 mb-1">
              <h4 className="font-bold text-gray-900 dark:text-white truncate">
                {groupChat.name}
              </h4>
              {groupChat.isPrivate && (
                <Lock className="h-3 w-3 text-gray-500 flex-shrink-0" />
              )}
              {isMuted && (
                <BellOff className="h-3 w-3 text-gray-500 flex-shrink-0" />
              )}
            </div>

            {/* Last Message */}
            <p className="text-sm text-gray-600 dark:text-gray-300 truncate mb-1">
              {getLastMessagePreview()}
            </p>

            {/* Meta Info */}
            <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <Users className="h-3 w-3" />
                <span>{groupChat.memberCount}</span>
              </div>
              {groupChat.onlineMembers > 0 && (
                <div className="flex items-center space-x-1 text-green-500">
                  <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>{groupChat.onlineMembers} online</span>
                </div>
              )}
              <span>{getLastActivity()}</span>
            </div>
          </div>
        </div>

        {/* Unread Badge & Menu */}
        <div className="flex flex-col items-end space-y-2 ml-2">
          {groupChat.unreadCount > 0 && (
            <div className="bg-gradient-to-r from-violet-500 to-blue-500 text-white text-xs font-bold rounded-full px-2 py-1 min-w-[24px] text-center neon-glow-violet">
              {groupChat.unreadCount > 99 ? "99+" : groupChat.unreadCount}
            </div>
          )}

          {/* Context Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-1.5 glass-strong rounded-lg hover:neon-glow-blue transition-all duration-200 opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="h-4 w-4 text-gray-600 dark:text-gray-300" />
            </button>

            {showMenu && (
              <>
                {/* Backdrop to close menu */}
                <div
                  className="fixed inset-0 z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                  }}
                />

                {/* Menu */}
                <div className="absolute right-0 top-full mt-1 w-48 glass-strong rounded-xl border border-white/20 shadow-lg z-20 py-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleMute();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-white/10 transition-colors flex items-center space-x-2"
                  >
                    {isMuted ? (
                      <>
                        <Bell className="h-4 w-4" />
                        <span>Unmute</span>
                      </>
                    ) : (
                      <>
                        <BellOff className="h-4 w-4" />
                        <span>Mute</span>
                      </>
                    )}
                  </button>

                  {isAdmin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-white/10 transition-colors flex items-center space-x-2"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onLeave();
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-200 hover:bg-white/10 transition-colors flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Leave Group</span>
                  </button>

                  {isCreator && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors flex items-center space-x-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete Group</span>
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GroupChatList({
  groupChats,
  activeGroupChatId,
  workspaceId,
  currentUserId,
  onCreateGroup,
  onGroupSelect,
  onLeaveGroup,
  onDeleteGroup,
  onUpdatePreferences,
  isLoading,
}: GroupChatListProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "admin" | "muted">("all");

  // Filter and search group chats
  const filteredGroupChats = useMemo(() => {
    let filtered = [...groupChats];

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (chat) =>
          chat.name.toLowerCase().includes(query) ||
          chat.description?.toLowerCase().includes(query),
      );
    }

    // Apply filter
    if (filter === "admin") {
      filtered = filtered.filter((chat) => {
        const member = chat.members.find((m) => m.userId === currentUserId);
        return member?.role === ConversationRole.ADMIN;
      });
    } else if (filter === "muted") {
      filtered = filtered.filter((chat) => {
        const member = chat.members.find((m) => m.userId === currentUserId);
        return member?.muteNotifications;
      });
    }

    // Sort by last activity
    return filtered.sort(
      (a, b) =>
        new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime(),
    );
  }, [groupChats, searchQuery, filter, currentUserId]);

  const handleGroupSelect = (groupChat: GroupChat) => {
    if (onGroupSelect) {
      onGroupSelect(groupChat);
    } else {
      router.push(`/w/${workspaceId}/chat/${groupChat.id}`);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            <Users className="h-6 w-6 text-violet-500" />
            <span>Group Chats</span>
          </h2>
          {onCreateGroup && (
            <button
              onClick={onCreateGroup}
              className="p-2.5 bg-gradient-to-r from-violet-500 to-blue-500 rounded-xl hover:neon-glow-violet transition-all duration-200 transform hover:scale-105"
              title="Create new group"
            >
              <UserPlus className="h-5 w-5 text-white" />
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 glass-strong rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:neon-glow-violet transition-all duration-200"
          />
        </div>

        {/* Filters */}
        <div className="flex space-x-2">
          {[
            { key: "all", label: "All", icon: Hash },
            { key: "admin", label: "Admin", icon: CheckCircle },
            { key: "muted", label: "Muted", icon: BellOff },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setFilter(key as any)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === key
                  ? "bg-linear-to-r from-violet-500 to-blue-500 text-white neon-glow-violet"
                  : "glass-strong text-gray-700 dark:text-gray-200 hover:glass"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Group List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="glass rounded-2xl p-8 flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-transparent bg-linear-to-r from-violet-500 to-blue-500"></div>
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-300 border-t-transparent absolute top-0"></div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 font-medium">
                Loading groups...
              </p>
            </div>
          </div>
        ) : filteredGroupChats.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <div className="glass rounded-2xl p-12 text-center max-w-md">
              <div className="w-20 h-20 bg-linear-to-br from-violet-100 to-blue-100 dark:from-violet-500/20 dark:to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="h-10 w-10 text-violet-600 dark:text-violet-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {searchQuery
                  ? "No groups found"
                  : filter !== "all"
                    ? `No ${filter} groups`
                    : "No group chats yet"}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {searchQuery
                  ? "Try a different search term"
                  : "Create your first group chat to start collaborating with your team"}
              </p>
              {onCreateGroup && !searchQuery && (
                <button
                  onClick={onCreateGroup}
                  className="px-6 py-3 bg-linear-to-r from-violet-500 to-blue-500 text-white rounded-xl hover:neon-glow-violet transition-all duration-200 font-semibold transform hover:scale-105 inline-flex items-center space-x-2"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>Create Group Chat</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          filteredGroupChats.map((groupChat) => (
            <GroupChatItem
              key={groupChat.id}
              groupChat={groupChat}
              isActive={groupChat.id === activeGroupChatId}
              currentUserId={currentUserId}
              onSelect={() => handleGroupSelect(groupChat)}
              onLeave={() => onLeaveGroup?.(groupChat.id)}
              onDelete={() => onDeleteGroup?.(groupChat.id)}
              onToggleMute={() => {
                const member = groupChat.members.find(
                  (m) => m.userId === currentUserId,
                );
                onUpdatePreferences?.(groupChat.id, !member?.muteNotifications);
              }}
            />
          ))
        )}
      </div>

      {/* Summary Footer */}
      {!isLoading && filteredGroupChats.length > 0 && (
        <div className="p-4 border-t border-white/20 glass-strong">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
            <span>
              {filteredGroupChats.length}{" "}
              {filteredGroupChats.length === 1 ? "group" : "groups"}
            </span>
            <span>
              {filteredGroupChats.reduce(
                (sum, chat) => sum + chat.unreadCount,
                0,
              )}{" "}
              unread
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
