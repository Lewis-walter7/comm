"use client";

import React, { useState, useCallback } from "react";
import { useChat } from "../../context/chat/ChatContext";
import { ConversationDto } from "../../services/chat/chatApi";
import {
  Plus,
  Search,
  Hash,
  MessageCircle,
  Users,
  FileText,
  MoreHorizontal,
  Settings,
  Bell,
  BellOff,
  Edit2,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface CreateConversationModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
}

function CreateConversationModal({
  isOpen,
  onClose,
  workspaceId,
}: CreateConversationModalProps) {
  const { createConversation } = useChat();
  const [type, setType] = useState<"DM" | "GROUP" | "DOCUMENT">("GROUP");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() && type !== "DM") return;

    setIsCreating(true);
    try {
      await createConversation({
        type,
        name: type === "DM" ? null : name.trim(),
        description: description.trim() || null,
        workspaceId,
      });
      onClose();
      setName("");
      setDescription("");
    } catch (error) {
      console.error("Failed to create conversation:", error);
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="glass-strong rounded-2xl p-8 w-full max-w-md mx-4 border border-white/20">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Create New Conversation
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Type
            </label>
            <select
              value={type}
              onChange={(e) =>
                setType(e.target.value as "DM" | "GROUP" | "DOCUMENT")
              }
              className="w-full px-4 py-3 glass-strong rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:neon-glow-violet transition-all duration-200"
            >
              <option value="GROUP">Group Channel</option>
              <option value="DM">Direct Message</option>
              <option value="DOCUMENT">Document Chat</option>
            </select>
          </div>

          {type !== "DM" && (
            <div>
              <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={
                  type === "GROUP"
                    ? "general, random, dev-team..."
                    : "Document name"
                }
                className="w-full px-4 py-3 glass-strong rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:neon-glow-violet transition-all duration-200"
                required
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">
              Description (optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What's this conversation about?"
              className="w-full px-4 py-3 glass-strong rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:neon-glow-violet transition-all duration-200 h-24 resize-none"
            />
          </div>

          <div className="flex justify-end space-x-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 glass text-gray-700 dark:text-gray-200 hover:glass-strong rounded-xl transition-all duration-200 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating || (type !== "DM" && !name.trim())}
              className="px-6 py-3 bg-gradient-to-r from-violet-500 to-blue-500 text-white rounded-xl hover:neon-glow-violet disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold transform hover:scale-105 disabled:hover:scale-100"
            >
              {isCreating ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

interface ConversationItemProps {
  conversation: ConversationDto;
  isActive: boolean;
  onSelect: (conversation: ConversationDto) => void;
}

function ConversationItem({
  conversation,
  isActive,
  onSelect,
}: ConversationItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const { state } = useChat();

  const getConversationIcon = () => {
    if (conversation.icon) {
      return <span className="text-lg">{conversation.icon}</span>;
    }

    switch (conversation.type) {
      case "DM":
        return <MessageCircle className="h-4 w-4" />;
      case "GROUP":
        return <Hash className="h-4 w-4" />;
      case "DOCUMENT":
        return <FileText className="h-4 w-4" />;
      default:
        return <Hash className="h-4 w-4" />;
    }
  };

  const getConversationName = () => {
    if (conversation.name) {
      return conversation.name;
    }

    if (conversation.type === "DM") {
      const otherMember = conversation.members.find(
        (m) => m.userId !== state.currentWorkspace,
      );
      return otherMember?.user?.name || "Direct Message";
    }

    return "Untitled Conversation";
  };

  const getLastActivity = () => {
    if (conversation.lastMessage) {
      return formatDistanceToNow(new Date(conversation.lastMessage.createdAt), {
        addSuffix: true,
      });
    }
    return formatDistanceToNow(new Date(conversation.updatedAt), {
      addSuffix: true,
    });
  };

  const getLastMessagePreview = () => {
    if (!conversation.lastMessage) return null;

    const message = conversation.lastMessage;
    const prefix = message.user.name + ": ";
    const content =
      message.content.length > 50
        ? message.content.substring(0, 50) + "..."
        : message.content;

    return prefix + content;
  };

  return (
    <div
      className={`group relative p-4 rounded-xl cursor-pointer transition-all duration-200 ${isActive
          ? "glass-strong border border-violet-200 dark:border-violet-500/30 neon-glow-violet"
          : "glass hover:glass-strong hover:scale-[1.02] text-gray-700 dark:text-gray-200"
        }`}
      onClick={() => onSelect(conversation)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <div
            className={`flex-shrink-0 ${isActive ? "text-blue-600" : "text-gray-500"}`}
          >
            {getConversationIcon()}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="font-medium truncate">{getConversationName()}</h4>

              {conversation.unreadCount && conversation.unreadCount > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5 ml-2">
                  {conversation.unreadCount > 99
                    ? "99+"
                    : conversation.unreadCount}
                </span>
              )}
            </div>

            {getLastMessagePreview() && (
              <p className="text-sm text-gray-500 truncate mt-0.5">
                {getLastMessagePreview()}
              </p>
            )}

            <p className="text-xs text-gray-400 mt-1">{getLastActivity()}</p>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(!showMenu);
          }}
          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-opacity"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      </div>

      {/* Context Menu */}
      {showMenu && (
        <div className="absolute right-2 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-1 z-10">
          <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 text-gray-700 dark:text-gray-200">
            <Bell className="h-4 w-4" />
            <span>Notifications</span>
          </button>
          <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 text-gray-700 dark:text-gray-200">
            <Edit2 className="h-4 w-4" />
            <span>Edit</span>
          </button>
          <button className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 flex items-center space-x-2">
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default function ChatSidebar() {
  const { state, selectConversation, searchMessages, dispatch } = useChat();
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "DM" | "GROUP" | "DOCUMENT"
  >("all");

  const handleSearch = useCallback(
    async (query: string) => {
      setSearchQuery(query);
      if (query.trim() && state.currentWorkspace) {
        await searchMessages(query, state.currentWorkspace);
      } else {
        dispatch({ type: "CLEAR_SEARCH" });
      }
    },
    [searchMessages, state.currentWorkspace, dispatch],
  );

  const filteredConversations = state.conversations.filter((conversation) => {
    if (selectedFilter !== "all" && conversation.type !== selectedFilter) {
      return false;
    }

    if (searchQuery.trim()) {
      const name = conversation.name || "";
      return name.toLowerCase().includes(searchQuery.toLowerCase());
    }

    return true;
  });

  const groupedConversations = {
    DM: filteredConversations.filter((c) => c.type === "DM"),
    GROUP: filteredConversations.filter((c) => c.type === "GROUP"),
    DOCUMENT: filteredConversations.filter((c) => c.type === "DOCUMENT"),
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Chat
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-2.5 glass-strong rounded-xl hover:neon-glow-blue transition-all duration-200"
            title="Create new conversation"
          >
            <Plus className="h-5 w-5 text-violet-600 dark:text-violet-400" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 glass-strong rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:neon-glow-violet transition-all duration-200"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 mt-3">
          {[
            { key: "all", label: "All", icon: null },
            { key: "DM", label: "DMs", icon: MessageCircle },
            { key: "GROUP", label: "Channels", icon: Hash },
            { key: "DOCUMENT", label: "Docs", icon: FileText },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setSelectedFilter(key as any)}
              className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm transition-colors ${selectedFilter === key
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                }`}
            >
              {Icon && <Icon className="h-3 w-3" />}
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {state.loadingConversations ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchQuery ? "No conversations found" : "No conversations yet"}
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {selectedFilter === "all" ? (
              <>
                {groupedConversations.DM.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">
                      Direct Messages
                    </h3>
                    {groupedConversations.DM.map((conversation) => (
                      <ConversationItem
                        key={conversation.id}
                        conversation={conversation}
                        isActive={
                          state.activeConversation?.id === conversation.id
                        }
                        onSelect={selectConversation}
                      />
                    ))}
                  </div>
                )}

                {groupedConversations.GROUP.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">
                      Channels
                    </h3>
                    {groupedConversations.GROUP.map((conversation) => (
                      <ConversationItem
                        key={conversation.id}
                        conversation={conversation}
                        isActive={
                          state.activeConversation?.id === conversation.id
                        }
                        onSelect={selectConversation}
                      />
                    ))}
                  </div>
                )}

                {groupedConversations.DOCUMENT.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-3 py-2">
                      Documents
                    </h3>
                    {groupedConversations.DOCUMENT.map((conversation) => (
                      <ConversationItem
                        key={conversation.id}
                        conversation={conversation}
                        isActive={
                          state.activeConversation?.id === conversation.id
                        }
                        onSelect={selectConversation}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : (
              filteredConversations.map((conversation) => (
                <ConversationItem
                  key={conversation.id}
                  conversation={conversation}
                  isActive={state.activeConversation?.id === conversation.id}
                  onSelect={selectConversation}
                />
              ))
            )}
          </div>
        )}
      </div>

      <CreateConversationModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        workspaceId={state.currentWorkspace || ""}
      />
    </div>
  );
}
