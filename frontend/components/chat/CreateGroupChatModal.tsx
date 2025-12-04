"use client";

import React, { useState, useEffect } from "react";
import { X, Users, Hash, Lock, Settings, Search, Check } from "lucide-react";
import { useGroupChat } from "../../context/chat/useGroupChat";
import {
  CreateGroupChatDto,
  WorkspaceInfo,
} from "../../services/chat/groupChatApi";

interface CreateGroupChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  workspaceId: string;
  workspaceInfo?: WorkspaceInfo | null;
  workspaceMembers?: Array<{
    id: string;
    userId: string;
    user: {
      id: string;
      name: string;
      email: string;
      avatarUrl?: string;
    };
  }>;
}

const ICON_OPTIONS = [
  "💬",
  "🎯",
  "🚀",
  "💡",
  "🎨",
  "📊",
  "🔧",
  "🎮",
  "📚",
  "🎵",
  "🏆",
  "💼",
  "🌟",
  "🔥",
  "⚡",
  "🌈",
  "🎭",
  "🎪",
  "🎬",
  "📱",
];

export default function CreateGroupChatModal({
  isOpen,
  onClose,
  workspaceId,
  workspaceInfo,
  workspaceMembers = [],
}: CreateGroupChatModalProps) {
  const { createGroupChat, isLoading } = useGroupChat({ workspaceId });

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "💬",
    isPrivate: false,
    allowMemberInvite: true,
    maxMembers: 100,
  });

  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: "",
        description: "",
        icon: "💬",
        isPrivate: false,
        allowMemberInvite: true,
        maxMembers: 100,
      });
      setSelectedMembers([]);
      setSearchQuery("");
      setShowAdvanced(false);
      setErrors({});
    }
  }, [isOpen]);

  // Filter members based on search query
  const filteredMembers = workspaceMembers.filter((member) => {
    const query = searchQuery.toLowerCase();
    return (
      member.user.name.toLowerCase().includes(query) ||
      member.user.email.toLowerCase().includes(query)
    );
  });

  // Toggle member selection
  const toggleMember = (userId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  // Validate form
  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Group name is required";
    } else if (formData.name.length < 3) {
      newErrors.name = "Group name must be at least 3 characters";
    } else if (formData.name.length > 50) {
      newErrors.name = "Group name must be less than 50 characters";
    }

    if (formData.description && formData.description.length > 200) {
      newErrors.description = "Description must be less than 200 characters";
    }

    if (selectedMembers.length === 0) {
      newErrors.members = "Select at least one member";
    }

    if (formData.maxMembers < 2) {
      newErrors.maxMembers = "Maximum members must be at least 2";
    } else if (formData.maxMembers > 1000) {
      newErrors.maxMembers = "Maximum members cannot exceed 1000";
    }

    if (selectedMembers.length + 1 > formData.maxMembers) {
      newErrors.maxMembers = `Cannot exceed maximum of ${formData.maxMembers} members (including you)`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check workspace requirements
    if (workspaceInfo && !workspaceInfo.canCreateGroups) {
      setErrors({
        ...errors,
        members: `Workspace requires more than 2 members to create groups (currently has ${workspaceInfo.memberCount})`,
      });
      return;
    }

    if (!validate()) {
      return;
    }

    try {
      const dto: CreateGroupChatDto = {
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        icon: formData.icon,
        workspaceId,
        initialMembers: selectedMembers,
        isPrivate: formData.isPrivate,
        allowMemberInvite: formData.allowMemberInvite,
        maxMembers: formData.maxMembers,
      };

      await createGroupChat(dto);
      onClose();
    } catch (error) {
      console.error("Failed to create group chat:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="glass-strong rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-white/20 animate-fade-in-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-violet-500 to-blue-500 rounded-xl">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Create Group Chat
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                Start a new conversation with your team
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 glass-strong rounded-xl hover:neon-glow-violet transition-all duration-200 transform hover:scale-105"
          >
            <X className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* Content */}
        <form
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]"
        >
          <div className="space-y-6">
            {/* Workspace Requirements Warning */}
            {workspaceInfo && !workspaceInfo.canCreateGroups && (
              <div className="glass-strong rounded-xl p-4 border border-amber-200 dark:border-amber-800">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-lg">
                    <Users className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-1">
                      Workspace Requirements Not Met
                    </h4>
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      This workspace needs more than 2 members to create group
                      chats. Currently has {workspaceInfo.memberCount}{" "}
                      member(s). Invite more people to your workspace first.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Workspace Info */}
            {workspaceInfo && workspaceInfo.canCreateGroups && (
              <div className="glass rounded-xl p-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                    <Users className="h-4 w-4" />
                    <span>{workspaceInfo.memberCount} workspace members</span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                    <Hash className="h-4 w-4" />
                    <span>{workspaceInfo.groupCount} existing groups</span>
                  </div>
                </div>
              </div>
            )}
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                <Hash className="h-5 w-5 text-violet-500" />
                <span>Basic Information</span>
              </h3>

              {/* Group Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Group Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="general, team-chat, project-updates..."
                  className={`w-full px-4 py-3 glass-strong rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:neon-glow-violet transition-all duration-200 ${
                    errors.name ? "ring-2 ring-red-500" : ""
                  }`}
                  maxLength={50}
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              {/* Icon Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Group Icon
                </label>
                <div className="grid grid-cols-10 gap-2">
                  {ICON_OPTIONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({ ...formData, icon })}
                      className={`p-2 glass-strong rounded-lg hover:neon-glow-blue transition-all duration-200 transform hover:scale-110 text-2xl ${
                        formData.icon === icon
                          ? "ring-2 ring-violet-500 neon-glow-violet scale-110"
                          : ""
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="What's this group about?"
                  className={`w-full px-4 py-3 glass-strong rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:neon-glow-violet transition-all duration-200 resize-none h-24 ${
                    errors.description ? "ring-2 ring-red-500" : ""
                  }`}
                  maxLength={200}
                />
                <div className="flex justify-between mt-1">
                  {errors.description && (
                    <p className="text-sm text-red-500">{errors.description}</p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                    {formData.description.length}/200
                  </p>
                </div>
              </div>
            </div>

            {/* Member Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-500" />
                <span>Add Members</span>
                <span className="text-sm font-normal text-gray-600 dark:text-gray-300">
                  ({selectedMembers.length} selected)
                </span>
              </h3>

              {/* Search Members */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search members..."
                  className="w-full pl-12 pr-4 py-3 glass-strong rounded-xl text-gray-900 dark:text-white placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:neon-glow-violet transition-all duration-200"
                />
              </div>

              {/* Members List */}
              <div className="glass rounded-xl p-4 max-h-64 overflow-y-auto space-y-2">
                {filteredMembers.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                    No members found
                  </p>
                ) : (
                  filteredMembers.map((member) => (
                    <div
                      key={member.userId}
                      onClick={() => toggleMember(member.userId)}
                      className={`flex items-center space-x-3 p-3 glass-strong rounded-xl cursor-pointer transition-all duration-200 transform hover:scale-[1.02] ${
                        selectedMembers.includes(member.userId)
                          ? "ring-2 ring-violet-500 neon-glow-violet"
                          : "hover:glass-strong"
                      }`}
                    >
                      <div className="relative">
                        {member.user.avatarUrl ? (
                          <img
                            src={member.user.avatarUrl}
                            alt={member.user.name}
                            className="h-10 w-10 rounded-full ring-2 ring-violet-200 dark:ring-violet-500/30"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-400 to-blue-500 flex items-center justify-center text-sm font-bold text-white shadow-lg">
                            {member.user.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        {selectedMembers.includes(member.userId) && (
                          <div className="absolute -top-1 -right-1 bg-violet-500 rounded-full p-0.5">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                          {member.user.name}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                          {member.user.email}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {errors.members && (
                <p className="text-sm text-red-500">{errors.members}</p>
              )}
            </div>

            {/* Advanced Settings */}
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
              >
                <Settings className="h-5 w-5" />
                <span className="font-semibold">Advanced Settings</span>
                <span className="text-xs">
                  {showAdvanced ? "(Hide)" : "(Show)"}
                </span>
              </button>

              {showAdvanced && (
                <div className="glass rounded-xl p-4 space-y-4">
                  {/* Private Group */}
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <Lock className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          Private Group
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          New members won't see previous messages
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.isPrivate}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          isPrivate: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-violet-500 rounded focus:ring-2 focus:ring-violet-500"
                    />
                  </label>

                  {/* Allow Member Invites */}
                  <label className="flex items-center justify-between cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <Users className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          Allow Member Invites
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Members can invite others to the group
                        </p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formData.allowMemberInvite}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          allowMemberInvite: e.target.checked,
                        })
                      }
                      className="w-5 h-5 text-violet-500 rounded focus:ring-2 focus:ring-violet-500"
                    />
                  </label>

                  {/* Max Members */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">
                      Maximum Members
                    </label>
                    <input
                      type="number"
                      value={formData.maxMembers}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          maxMembers: parseInt(e.target.value) || 100,
                        })
                      }
                      min={2}
                      max={1000}
                      className={`w-full px-4 py-3 glass-strong rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:neon-glow-violet transition-all duration-200 ${
                        errors.maxMembers ? "ring-2 ring-red-500" : ""
                      }`}
                    />
                    {errors.maxMembers && (
                      <p className="mt-2 text-sm text-red-500">
                        {errors.maxMembers}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-white/10">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-3 glass text-gray-700 dark:text-gray-200 hover:glass-strong rounded-xl transition-all duration-200 font-semibold disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={
              isLoading || (workspaceInfo && !workspaceInfo.canCreateGroups)
            }
            className="px-6 py-3 bg-gradient-to-r from-violet-500 to-blue-500 text-white rounded-xl hover:neon-glow-violet disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-semibold transform hover:scale-105 disabled:hover:scale-100 flex items-center space-x-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                <span>Creating...</span>
              </>
            ) : (
              <>
                <Users className="h-5 w-5" />
                <span>Create Group Chat</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
