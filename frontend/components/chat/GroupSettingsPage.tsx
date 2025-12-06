"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Users,
    Settings,
    Bell,
    BellOff,
    LogOut,
    Trash2,
    Crown,
    UserPlus,
    Edit2,
    Save,
    X,
    Image as ImageIcon,
    Loader2,
} from "lucide-react";
import {
    groupChatApi,
    GroupChat,
    GroupChatMember,
} from "../../services/chat/groupChatApi";
import { ConversationRole } from "../../services/chat/chatApi";
import { useAuth } from "../../context/AuthContext";

interface GroupSettingsPageProps {
    conversationId: string;
    workspaceId: string;
    onBack?: () => void;
}

export default function GroupSettingsPage({
    conversationId,
    workspaceId,
    onBack,
}: GroupSettingsPageProps) {
    const router = useRouter();
    const { user } = useAuth();
    const [groupChat, setGroupChat] = useState<GroupChat | null>(null);
    const [members, setMembers] = useState<GroupChatMember[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Edit form state
    const [editName, setEditName] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editIcon, setEditIcon] = useState("");

    // Current user's membership
    const currentMember = members.find((m) => m.userId === user?.id);
    const isAdmin = currentMember?.role === ConversationRole.ADMIN;
    const isCreator = groupChat?.createdById === user?.id;
    const isMuted = currentMember?.muteNotifications || false;

    useEffect(() => {
        loadGroupData();
    }, [conversationId]);

    const loadGroupData = async () => {
        try {
            setIsLoading(true);
            const [chatData, membersData] = await Promise.all([
                groupChatApi.getGroupChat(conversationId),
                groupChatApi.getGroupMembers(conversationId),
            ]);

            setGroupChat(chatData);
            setMembers(membersData);
            setEditName(chatData.name);
            setEditDescription(chatData.description || "");
            setEditIcon(chatData.icon || "");
        } catch (error) {
            console.error("Error loading group data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveChanges = async () => {
        if (!groupChat) return;

        try {
            setIsSaving(true);
            const updated = await groupChatApi.updateGroupChat(conversationId, {
                name: editName,
                description: editDescription,
                icon: editIcon,
            });

            setGroupChat(updated);
            setIsEditing(false);
        } catch (error) {
            console.error("Error updating group:", error);
            alert("Failed to update group settings");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelEdit = () => {
        if (groupChat) {
            setEditName(groupChat.name);
            setEditDescription(groupChat.description || "");
            setEditIcon(groupChat.icon || "");
        }
        setIsEditing(false);
    };

    const handleToggleMute = async () => {
        try {
            await groupChatApi.updateMemberPreferences(conversationId, {
                muteNotifications: !isMuted,
            });
            await loadGroupData();
        } catch (error) {
            console.error("Error toggling mute:", error);
            alert("Failed to update notification settings");
        }
    };

    const handleLeaveGroup = async () => {
        if (
            !confirm(
                "Are you sure you want to leave this group? You'll need to be re-invited to join again.",
            )
        ) {
            return;
        }

        try {
            await groupChatApi.leaveGroup(conversationId);
            router.push(`/w/${workspaceId}/chat`);
        } catch (error) {
            console.error("Error leaving group:", error);
            alert("Failed to leave group");
        }
    };

    const handleDeleteGroup = async () => {
        if (
            !confirm(
                "Are you sure you want to delete this group? This action cannot be undone and all messages will be lost.",
            )
        ) {
            return;
        }

        try {
            await groupChatApi.deleteGroupChat(conversationId);
            router.push(`/w/${workspaceId}/chat`);
        } catch (error) {
            console.error("Error deleting group:", error);
            alert("Failed to delete group");
        }
    };

    const handleBackClick = () => {
        if (onBack) {
            onBack();
        } else {
            router.push(`/w/${workspaceId}/chat/${conversationId}`);
        }
    };

    if (isLoading) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="glass rounded-2xl p-8 flex flex-col items-center space-y-4">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-12 w-12 border-2 border-transparent bg-gradient-to-r from-violet-500 to-blue-500"></div>
                        <div className="animate-spin rounded-full h-12 w-12 border-2 border-violet-300 border-t-transparent absolute top-0"></div>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 font-medium">
                        Loading group settings...
                    </p>
                </div>
            </div>
        );
    }

    if (!groupChat) {
        return (
            <div className="flex-1 flex items-center justify-center p-8">
                <div className="glass rounded-2xl p-8 text-center">
                    <p className="text-gray-600 dark:text-gray-300">Group not found</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-white/20 glass-strong backdrop-blur-xl">
                <div className="flex items-center justify-between">
                    <button
                        onClick={handleBackClick}
                        className="p-2 glass-strong rounded-xl hover:neon-glow-blue text-gray-600 dark:text-gray-300 hover:text-violet-600 transition-all duration-200 transform hover:scale-105"
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </button>

                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                        <Settings className="h-6 w-6 text-violet-500" />
                        <span>Group Settings</span>
                    </h1>

                    <div className="w-10"></div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* Group Info Section */}
                <div className="glass-strong rounded-2xl p-6 border border-white/20">
                    <div className="flex items-start justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                            Group Information
                        </h2>
                        {isAdmin && !isEditing && (
                            <button
                                onClick={() => setIsEditing(true)}
                                className="p-2 glass rounded-lg hover:neon-glow-blue text-gray-600 dark:text-gray-300 hover:text-violet-600 transition-all duration-200"
                            >
                                <Edit2 className="h-4 w-4" />
                            </button>
                        )}
                    </div>

                    {/* Group Icon/Picture */}
                    <div className="flex items-start space-x-6 mb-6">
                        <div className="flex-shrink-0">
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-violet-400 to-blue-500 flex items-center justify-center text-4xl neon-glow-blue">
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editIcon}
                                        onChange={(e) => setEditIcon(e.target.value)}
                                        placeholder="📱"
                                        maxLength={2}
                                        className="w-full h-full bg-transparent text-center text-4xl outline-none"
                                    />
                                ) : (
                                    groupChat.icon || "💬"
                                )}
                            </div>
                            {isEditing && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                                    Enter emoji
                                </p>
                            )}
                        </div>

                        <div className="flex-1 space-y-4">
                            {/* Group Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Group Name
                                </label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full px-4 py-2 glass-strong rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:neon-glow-violet transition-all duration-200"
                                    />
                                ) : (
                                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {groupChat.name}
                                    </p>
                                )}
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Description
                                </label>
                                {isEditing ? (
                                    <textarea
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                        rows={3}
                                        className="w-full px-4 py-2 glass-strong rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-violet-500 focus:neon-glow-violet transition-all duration-200 resize-none"
                                        placeholder="Add a description..."
                                    />
                                ) : (
                                    <p className="text-gray-600 dark:text-gray-300">
                                        {groupChat.description || "No description"}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Edit Actions */}
                    {isEditing && (
                        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-white/10">
                            <button
                                onClick={handleCancelEdit}
                                className="px-4 py-2 glass-strong rounded-xl text-gray-700 dark:text-gray-200 hover:bg-white/10 transition-all duration-200 flex items-center space-x-2"
                            >
                                <X className="h-4 w-4" />
                                <span>Cancel</span>
                            </button>
                            <button
                                onClick={handleSaveChanges}
                                disabled={isSaving || !editName.trim()}
                                className="px-4 py-2 bg-gradient-to-r from-violet-500 to-blue-500 text-white rounded-xl hover:neon-glow-violet disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
                            >
                                {isSaving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Save className="h-4 w-4" />
                                )}
                                <span>Save Changes</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Members Section */}
                <div className="glass-strong rounded-2xl p-6 border border-white/20">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                            <Users className="h-5 w-5 text-violet-500" />
                            <span>Members ({members.length})</span>
                        </h2>
                        {(isAdmin || groupChat.allowMemberInvite) && (
                            <button className="px-4 py-2 bg-gradient-to-r from-violet-500 to-blue-500 text-white rounded-xl hover:neon-glow-violet transition-all duration-200 flex items-center space-x-2 text-sm">
                                <UserPlus className="h-4 w-4" />
                                <span>Add Members</span>
                            </button>
                        )}
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {members.map((member) => (
                            <div
                                key={member.id}
                                className="flex items-center justify-between p-4 glass rounded-xl hover:glass-strong transition-all duration-200"
                            >
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-blue-500 flex items-center justify-center text-white font-semibold">
                                        {member.user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {member.user.name}
                                            {member.userId === user?.id && (
                                                <span className="text-xs text-gray-500 ml-2">(You)</span>
                                            )}
                                        </p>
                                        <p className="text-sm text-gray-600 dark:text-gray-300">
                                            {member.user.email}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    {member.role === ConversationRole.ADMIN && (
                                        <div className="px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1">
                                            <Crown className="h-3 w-3" />
                                            <span>Admin</span>
                                        </div>
                                    )}
                                    {member.userId === groupChat.createdById && (
                                        <div className="px-3 py-1 glass-strong rounded-lg text-xs font-semibold text-violet-600 dark:text-violet-400">
                                            Creator
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Preferences Section */}
                <div className="glass-strong rounded-2xl p-6 border border-white/20">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                        Preferences
                    </h2>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-4 glass rounded-xl">
                            <div className="flex items-center space-x-3">
                                {isMuted ? (
                                    <BellOff className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                                ) : (
                                    <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                                )}
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                        Notifications
                                    </p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">
                                        {isMuted ? "Muted" : "Enabled"}
                                    </p>
                                </div>
                            </div>

                            <button
                                onClick={handleToggleMute}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isMuted
                                        ? "bg-gray-300 dark:bg-gray-600"
                                        : "bg-gradient-to-r from-violet-500 to-blue-500"
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isMuted ? "translate-x-1" : "translate-x-6"
                                        }`}
                                />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Actions Section */}
                <div className="glass-strong rounded-2xl p-6 border border-white/20">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                        Actions
                    </h2>

                    <div className="space-y-3">
                        <button
                            onClick={handleLeaveGroup}
                            className="w-full p-4 glass rounded-xl hover:bg-orange-500/10 text-orange-600 dark:text-orange-400 transition-all duration-200 flex items-center space-x-3 font-medium"
                        >
                            <LogOut className="h-5 w-5" />
                            <span>Leave Group</span>
                        </button>

                        {isCreator && (
                            <button
                                onClick={handleDeleteGroup}
                                className="w-full p-4 glass rounded-xl hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-all duration-200 flex items-center space-x-3 font-medium"
                            >
                                <Trash2 className="h-5 w-5" />
                                <span>Delete Group</span>
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
