"use client";

import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { MessageDto } from "../../services/chat/chatApi";
import {
    Smile,
    Paperclip,
    MoreHorizontal,
    Reply,
    Edit2,
    Trash2,
    Copy,
    Info,
} from "lucide-react";
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";
import EmojiPicker from "emoji-picker-react";

interface MessageProps {
    message: MessageDto;
    showAvatar: boolean;
    isFirst: boolean;
    onReply: (message: MessageDto) => void;
    onEdit: (message: MessageDto) => void;
    onDelete: (messageId: string) => void;
    onReaction: (messageId: string, emoji: string) => void;
}

export default function Message({
    message,
    showAvatar,
    isFirst,
    onReply,
    onEdit,
    onDelete,
    onReaction,
}: MessageProps) {
    const [showMenu, setShowMenu] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showMessageInfo, setShowMessageInfo] = useState(false);
    const { user: currentUser } = useAuth();

    const isOwn = message.userId === currentUser?.id;
    const isEdited = message.editedAt !== null;
    const isDeleted = message.deletedAt !== null;

    const formatMessageTime = (timestamp: string) => {
        const date = new Date(timestamp);
        if (isToday(date)) {
            return format(date, "HH:mm");
        } else if (isYesterday(date)) {
            return `Yesterday ${format(date, "HH:mm")}`;
        } else {
            return format(date, "MMM d, HH:mm");
        }
    };

    const reactions = message.reactions
        ? JSON.parse(JSON.stringify(message.reactions))
        : {};

    if (isDeleted) {
        return (
            <div className="group py-3 px-4 mx-2 rounded-xl glass hover:glass-strong transition-all duration-200">
                <div className="flex items-center space-x-3 text-gray-500 dark:text-gray-400 italic">
                    <div className="p-1.5 bg-red-100 dark:bg-red-500/20 rounded-lg">
                        <Trash2 className="h-4 w-4 text-red-500" />
                    </div>
                    <span className="font-medium">This message was deleted</span>
                    <span className="text-xs opacity-70">
                        {formatMessageTime(message.createdAt)}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className={`group py-2 px-4 flex ${isOwn ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[70%] flex flex-col ${isOwn ? "items-end" : "items-start"}`}>
                {message.replyTo && (
                    <div className="mb-2 p-2 glass-strong rounded-lg border-l-4 border-violet-500 w-full">
                        <div className="flex items-center space-x-2 text-xs text-violet-600 dark:text-violet-400 mb-1">
                            <Reply className="h-3 w-3" />
                            <span className="font-semibold">
                                Replying to {message.replyTo.user.name}
                            </span>
                        </div>
                        <p className="text-xs text-gray-700 dark:text-gray-300 truncate">
                            {message.replyTo.content.substring(0, 100)}
                            {message.replyTo.content.length > 100 ? "..." : ""}
                        </p>
                    </div>
                )}

                <div className={`flex ${isOwn ? "flex-row-reverse" : "flex-row"} items-start space-x-2 ${isOwn ? "space-x-reverse" : ""} w-full`}>
                    {showAvatar ? (
                        <div className="flex-shrink-0">
                            {message.user.avatarUrl ? (
                                <img
                                    src={message.user.avatarUrl}
                                    alt={message.user.name}
                                    className="h-8 w-8 rounded-full ring-2 ring-violet-200 dark:ring-violet-500/30"
                                />
                            ) : (
                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-400 to-blue-500 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                                    {message.user.name.charAt(0).toUpperCase()}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="w-8 flex-shrink-0" />
                    )}

                    <div className="relative flex-1 min-w-0">
                        {isFirst && (
                            <div className={`flex items-center space-x-2 mb-1 ${isOwn ? "justify-end" : "justify-start"}`}>
                                <span className="text-xs font-semibold text-gray-900 dark:text-white">
                                    {message.user.name}
                                </span>
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {formatMessageTime(message.createdAt)}
                                </span>
                                {isEdited && (
                                    <span className="text-xs text-amber-500">(edited)</span>
                                )}
                            </div>
                        )}

                        <div className={`relative inline-block group/bubble ${isOwn ? "float-right" : "float-left"}`}>
                            <div
                                className={`px-4 py-2 rounded-2xl ${isOwn
                                    ? "bg-gray-800 dark:bg-gray-700 text-white"
                                    : "glass-strong text-gray-900 dark:text-white"
                                    } break-words`}
                            >
                                <p className="text-sm whitespace-pre-wrap">{message.content}</p>

                                {message.attachments && message.attachments.length > 0 && (
                                    <div className="mt-2 space-y-1">
                                        {message.attachments.map((attachment: any, index: number) => (
                                            <div
                                                key={index}
                                                className="flex items-center space-x-2 p-2 bg-black/10 rounded"
                                            >
                                                <Paperclip className="h-3 w-3" />
                                                <span className="text-xs font-medium">
                                                    {attachment.fileName}
                                                </span>
                                                <span className="text-xs opacity-70">
                                                    ({(attachment.fileSize / 1024).toFixed(1)} KB)
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Message Actions */}
                            <div
                                className={`absolute top-0 ${isOwn ? "left-0 -translate-x-full" : "right-0 translate-x-full"
                                    } opacity-0 group-hover/bubble:opacity-100 flex items-center space-x-1 transition-opacity px-2`}
                            >
                                <button
                                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                                    title="Add reaction"
                                >
                                    <Smile className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                                </button>

                                <button
                                    onClick={() => onReply(message)}
                                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                                    title="Reply in thread"
                                >
                                    <Reply className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                                </button>

                                <button
                                    onClick={() => setShowMenu(!showMenu)}
                                    className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                                >
                                    <MoreHorizontal className="h-3.5 w-3.5 text-gray-600 dark:text-gray-400" />
                                </button>
                            </div>

                            {/* Emoji Picker */}
                            {showEmojiPicker && (
                                <div className="absolute top-full right-0 z-10 mt-2">
                                    <EmojiPicker
                                        onEmojiClick={(emojiObject) => {
                                            onReaction(message.id, emojiObject.emoji);
                                            setShowEmojiPicker(false);
                                        }}
                                        height={300}
                                        width={280}
                                    />
                                </div>
                            )}

                            {/* Context Menu */}
                            {showMenu && (
                                <div
                                    className={`absolute ${isOwn ? "right-0" : "left-0"
                                        } top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg py-1 z-10 min-w-[160px]`}
                                >
                                    <button
                                        onClick={() => {
                                            onReply(message);
                                            setShowMenu(false);
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 text-gray-700 dark:text-gray-200"
                                    >
                                        <Reply className="h-4 w-4" />
                                        <span>Reply in thread</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            navigator.clipboard.writeText(message.content);
                                            setShowMenu(false);
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 text-gray-700 dark:text-gray-200"
                                    >
                                        <Copy className="h-4 w-4" />
                                        <span>Copy text</span>
                                    </button>

                                    <button
                                        onClick={() => {
                                            setShowMessageInfo(true);
                                            setShowMenu(false);
                                        }}
                                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 text-gray-700 dark:text-gray-200"
                                    >
                                        <Info className="h-4 w-4" />
                                        <span>Message Info</span>
                                    </button>

                                    {isOwn && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    onEdit(message);
                                                    setShowMenu(false);
                                                }}
                                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center space-x-2 text-gray-700 dark:text-gray-200"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                                <span>Edit message</span>
                                            </button>

                                            <button
                                                onClick={() => {
                                                    onDelete(message.id);
                                                    setShowMenu(false);
                                                }}
                                                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-gray-700 text-red-600 dark:text-red-400 flex items-center space-x-2"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                                <span>Delete message</span>
                                            </button>
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Clear float */}
                        <div className="clear-both"></div>

                        {/* Reactions */}
                        {Object.keys(reactions).length > 0 && (
                            <div className={`flex items-center space-x-1 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}>
                                {Object.entries(reactions).map(
                                    ([emoji, userIds]: [string, any]) => (
                                        <button
                                            key={emoji}
                                            onClick={() => onReaction(message.id, emoji)}
                                            className="flex items-center space-x-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-full text-xs transition-colors"
                                        >
                                            <span>{emoji}</span>
                                            <span className="text-blue-600 dark:text-blue-400 font-medium">
                                                {userIds.length}
                                            </span>
                                        </button>
                                    ),
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Message Info Modal */}
                {showMessageInfo && (
                    <div
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
                        onClick={() => setShowMessageInfo(false)}
                    >
                        <div
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 max-w-md w-full mx-4 border border-gray-200 dark:border-gray-700"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    Message Info
                                </h3>
                                <button
                                    onClick={() => setShowMessageInfo(false)}
                                    className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                                >
                                    ×
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Sent</p>
                                    <p className="text-sm text-gray-900 dark:text-white">
                                        {format(new Date(message.createdAt), "MMM d, yyyy HH:mm")}
                                    </p>
                                </div>

                                {message.editedAt && (
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Edited</p>
                                        <p className="text-sm text-gray-900 dark:text-white">
                                            {format(new Date(message.editedAt), "MMM d, yyyy HH:mm")}
                                        </p>
                                    </div>
                                )}

                                {message.readReceipts && message.readReceipts.length > 0 && (
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                            Read by {message.readReceipts.length} member
                                            {message.readReceipts.length !== 1 ? "s" : ""}
                                        </p>
                                        <div className="space-y-2 max-h-40 overflow-y-auto">
                                            {message.readReceipts.map((receipt: any) => (
                                                <div key={receipt.userId} className="flex items-center space-x-2">
                                                    {receipt.user.avatarUrl ? (
                                                        <img
                                                            src={receipt.user.avatarUrl}
                                                            alt={receipt.user.name}
                                                            className="h-6 w-6 rounded-full"
                                                        />
                                                    ) : (
                                                        <div className="h-6 w-6 rounded-full bg-gradient-to-br from-violet-400 to-blue-500 flex items-center justify-center text-xs font-bold text-white">
                                                            {receipt.user.name.charAt(0).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm text-gray-900 dark:text-white truncate">
                                                            {receipt.user.name}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {formatDistanceToNow(new Date(receipt.readAt), {
                                                                addSuffix: true,
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
