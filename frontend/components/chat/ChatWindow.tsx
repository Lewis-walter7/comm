"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useChat } from "../../context/chat/ChatContext";
import { MessageDto } from "../../services/chat/chatApi";
import {
  Send,
  Smile,
  Paperclip,
  MoreHorizontal,
  Reply,
  Edit2,
  Trash2,
  Copy,
  Hash,
  Users,
  Settings,
  Phone,
  Video,
  Info,
  FileText,
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

function Message({
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
  const { state } = useChat();

  const isOwn = message.userId === state.currentWorkspace; // This should be current user ID
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
    <div className="group py-3 px-4 mx-2 rounded-xl glass hover:glass-strong hover:neon-glow-blue transition-all duration-200 relative">
      {message.replyTo && (
        <div className="mb-4 p-3 glass-strong rounded-xl border-l-4 border-violet-500">
          <div className="flex items-center space-x-2 text-sm text-violet-600 dark:text-violet-400 mb-2">
            <Reply className="h-4 w-4" />
            <span className="font-semibold">
              Replying to {message.replyTo.user.name}
            </span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
            {message.replyTo.content.substring(0, 100)}
            {message.replyTo.content.length > 100 ? "..." : ""}
          </p>
        </div>
      )}

      <div className="flex items-start space-x-3">
        {showAvatar ? (
          <div className="flex-shrink-0">
            {message.user.avatarUrl ? (
              <img
                src={message.user.avatarUrl}
                alt={message.user.name}
                className="h-10 w-10 rounded-full ring-2 ring-violet-200 dark:ring-violet-500/30"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-400 to-blue-500 flex items-center justify-center text-sm font-bold text-white shadow-lg">
                {message.user.name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        ) : (
          <div className="w-10 flex-shrink-0" />
        )}

        <div className="flex-1 min-w-0">
          {isFirst && (
            <div className="flex items-center space-x-3 mb-2">
              <span className="font-bold text-gray-900 dark:text-white">
                {message.user.name}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                {formatMessageTime(message.createdAt)}
              </span>
              {isEdited && (
                <span className="text-xs text-amber-500 bg-amber-100 dark:bg-amber-500/20 px-2 py-1 rounded-full">
                  (edited)
                </span>
              )}
            </div>
          )}

          <div className="prose prose-sm max-w-none">
            <p className="text-gray-900 whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </div>

          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-2">
              {message.attachments.map((attachment: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 p-2 bg-gray-100 rounded border"
                >
                  <Paperclip className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium">
                    {attachment.fileName}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({(attachment.fileSize / 1024).toFixed(1)} KB)
                  </span>
                </div>
              ))}
            </div>
          )}

          {Object.keys(reactions).length > 0 && (
            <div className="flex items-center space-x-2 mt-2">
              {Object.entries(reactions).map(
                ([emoji, userIds]: [string, any]) => (
                  <button
                    key={emoji}
                    onClick={() => onReaction(message.id, emoji)}
                    className="flex items-center space-x-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded-full text-sm transition-colors"
                  >
                    <span>{emoji}</span>
                    <span className="text-blue-600 font-medium">
                      {userIds.length}
                    </span>
                  </button>
                ),
              )}
            </div>
          )}

          {message.readReceipts && message.readReceipts.length > 0 && (
            <div className="mt-1 flex items-center space-x-1">
              <span className="text-xs text-gray-400">
                Seen by {message.readReceipts.length} member
                {message.readReceipts.length !== 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        {/* Message Actions */}
        <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-1 transition-opacity">
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title="Add reaction"
          >
            <Smile className="h-4 w-4" />
          </button>

          <button
            onClick={() => onReply(message)}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title="Reply in thread"
          >
            <Reply className="h-4 w-4" />
          </button>

          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="absolute top-full right-4 z-10">
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
        <div className="absolute top-full right-4 mt-1 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-10">
          <button
            onClick={() => {
              onReply(message);
              setShowMenu(false);
            }}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
          >
            <Reply className="h-4 w-4" />
            <span>Reply in thread</span>
          </button>

          <button
            onClick={() => {
              navigator.clipboard.writeText(message.content);
              setShowMenu(false);
            }}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
          >
            <Copy className="h-4 w-4" />
            <span>Copy text</span>
          </button>

          {isOwn && (
            <>
              <button
                onClick={() => {
                  onEdit(message);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
              >
                <Edit2 className="h-4 w-4" />
                <span>Edit message</span>
              </button>

              <button
                onClick={() => {
                  onDelete(message.id);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 text-red-600 flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete message</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

interface MessageInputProps {
  onSend: (content: string, replyToId?: string) => void;
  replyTo?: MessageDto | null;
  onCancelReply?: () => void;
  disabled?: boolean;
}

function MessageInput({
  onSend,
  replyTo,
  onCancelReply,
  disabled,
}: MessageInputProps) {
  const [content, setContent] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { startTyping, stopTyping, state } = useChat();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || disabled) return;

    onSend(content.trim(), replyTo?.id);
    setContent("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }

    // Handle typing indicators
    if (value.trim() && state.activeConversation) {
      startTyping(state.activeConversation.id);
    } else if (state.activeConversation) {
      stopTyping(state.activeConversation.id);
    }
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (content.trim() && state.activeConversation) {
      timeout = setTimeout(() => {
        stopTyping(state.activeConversation!.id);
      }, 1000);
    }
    return () => clearTimeout(timeout);
  }, [content, state.activeConversation, stopTyping]);

  return (
    <div className="border-t border-white/20 glass-strong backdrop-blur-xl">
      {replyTo && (
        <div className="p-4 glass border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-1.5 bg-violet-100 dark:bg-violet-500/20 rounded-lg">
                <Reply className="h-4 w-4 text-violet-600 dark:text-violet-400" />
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-200">
                Replying to{" "}
                <strong className="text-violet-600 dark:text-violet-400">
                  {replyTo.user.name}
                </strong>
              </span>
            </div>
            <button
              onClick={onCancelReply}
              className="p-1.5 glass-strong rounded-lg hover:neon-glow-violet text-gray-500 hover:text-red-500 transition-all duration-200 transform hover:scale-105"
            >
              ×
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 truncate bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
            {replyTo.content}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="p-6">
        <div className="flex items-end space-x-4">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={content}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={`Message ${state.activeConversation?.name || "conversation"}...`}
              className="w-full min-h-[52px] max-h-32 px-4 py-3 glass-strong rounded-xl resize-none focus:ring-2 focus:ring-violet-500 focus:neon-glow-violet transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500 border-0"
              disabled={disabled}
              rows={1}
            />
          </div>

          <div className="flex items-center space-x-2">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-3 glass-strong rounded-xl hover:neon-glow-blue text-gray-600 dark:text-gray-300 hover:text-violet-600 transition-all duration-200 transform hover:scale-105"
                title="Add emoji"
              >
                <Smile className="h-5 w-5" />
              </button>

              {showEmojiPicker && (
                <div className="absolute bottom-full right-0 mb-2 glass-strong rounded-2xl overflow-hidden border border-white/20">
                  <EmojiPicker
                    onEmojiClick={(emojiObject) => {
                      setContent((prev) => prev + emojiObject.emoji);
                      setShowEmojiPicker(false);
                      textareaRef.current?.focus();
                    }}
                    height={300}
                    width={280}
                  />
                </div>
              )}
            </div>

            <button
              type="button"
              className="p-3 glass-strong rounded-xl hover:neon-glow-blue text-gray-600 dark:text-gray-300 hover:text-violet-600 transition-all duration-200 transform hover:scale-105"
              title="Attach file"
            >
              <Paperclip className="h-5 w-5" />
            </button>

            <button
              type="submit"
              disabled={!content.trim() || disabled}
              className="p-3 bg-gradient-to-r from-violet-500 to-blue-500 text-white rounded-xl hover:neon-glow-violet disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 font-semibold"
              title="Send message"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function TypingIndicator() {
  const { state } = useChat();

  if (!state.activeConversation) return null;

  const typingUsers = state.typingUsers[state.activeConversation.id];
  if (!typingUsers || typingUsers.size === 0) return null;

  const userNames = Array.from(typingUsers).slice(0, 3); // Show max 3 names
  const remaining = typingUsers.size - userNames.length;

  return (
    <div className="mx-4 mb-4">
      <div className="glass rounded-xl p-3 inline-flex items-center space-x-3">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"></div>
          <div
            className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          ></div>
          <div
            className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          ></div>
        </div>
        <span className="text-sm text-gray-700 dark:text-gray-200 font-medium">
          {userNames.join(", ")}
          {remaining > 0 &&
            ` and ${remaining} other${remaining > 1 ? "s" : ""}`}{" "}
          {typingUsers.size === 1 ? "is" : "are"} typing...
        </span>
      </div>
    </div>
  );
}

export default function ChatWindow() {
  const {
    state,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    openThread,
    markAsRead,
  } = useChat();

  const [editingMessage, setEditingMessage] = useState<MessageDto | null>(null);
  const [replyTo, setReplyTo] = useState<MessageDto | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const conversation = state.activeConversation;
  const messages = conversation ? state.messages[conversation.id] || [] : [];
  const isLoadingMessages = conversation
    ? state.loadingMessages[conversation.id] || false
    : false;

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Mark messages as read when conversation changes
  useEffect(() => {
    if (conversation && messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      markAsRead(conversation.id, lastMessage.id);
    }
  }, [conversation, messages, markAsRead]);

  const handleSendMessage = async (content: string, replyToId?: string) => {
    if (!conversation) return;
    await sendMessage(conversation.id, content, replyToId);
    setReplyTo(null);
  };

  const handleEditMessage = async (messageId: string, content: string) => {
    await editMessage(messageId, content);
    setEditingMessage(null);
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!conversation) return;
    if (confirm("Are you sure you want to delete this message?")) {
      await deleteMessage(messageId, conversation.id);
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!conversation) return;
    await addReaction(messageId, emoji, conversation.id);
  };

  const getConversationIcon = () => {
    if (!conversation) return null;

    if (conversation.icon) {
      return <span className="text-xl">{conversation.icon}</span>;
    }

    switch (conversation.type) {
      case "DM":
        return <Users className="h-5 w-5" />;
      case "GROUP":
        return <Hash className="h-5 w-5" />;
      case "DOCUMENT":
        return <FileText className="h-5 w-5" />;
      default:
        return <Hash className="h-5 w-5" />;
    }
  };

  const getConversationName = () => {
    if (!conversation) return "";

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

  if (!conversation) {
    return null;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/20 glass-strong backdrop-blur-xl">
        <div className="flex items-center space-x-4">
          <div className="p-3 glass rounded-xl neon-glow-blue">
            {getConversationIcon()}
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
              {getConversationName()}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
              {conversation.members.length} member
              {conversation.members.length !== 1 ? "s" : ""}
              {conversation.description && ` • ${conversation.description}`}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button className="p-3 glass-strong rounded-xl hover:neon-glow-blue text-gray-600 dark:text-gray-300 hover:text-violet-600 transition-all duration-200 transform hover:scale-105">
            <Phone className="h-5 w-5" />
          </button>
          <button className="p-3 glass-strong rounded-xl hover:neon-glow-blue text-gray-600 dark:text-gray-300 hover:text-violet-600 transition-all duration-200 transform hover:scale-105">
            <Video className="h-5 w-5" />
          </button>
          <button className="p-3 glass-strong rounded-xl hover:neon-glow-blue text-gray-600 dark:text-gray-300 hover:text-violet-600 transition-all duration-200 transform hover:scale-105">
            <Info className="h-5 w-5" />
          </button>
          <button className="p-3 glass-strong rounded-xl hover:neon-glow-blue text-gray-600 dark:text-gray-300 hover:text-violet-600 transition-all duration-200 transform hover:scale-105">
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4">
        {isLoadingMessages ? (
          <div className="flex items-center justify-center py-12">
            <div className="glass rounded-2xl p-8 flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-transparent bg-gradient-to-r from-violet-500 to-blue-500 rounded-full"></div>
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-violet-300 border-t-transparent absolute top-0"></div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 font-medium">
                Loading messages...
              </p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="glass rounded-2xl p-12 text-center max-w-md">
              <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-blue-100 dark:from-violet-500/20 dark:to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 neon-glow-violet">
                {getConversationIcon()}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Start the conversation
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Be the first to send a message in {getConversationName()}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {messages.map((message, index) => {
              const prevMessage = messages[index - 1];
              const showAvatar =
                !prevMessage ||
                prevMessage.userId !== message.userId ||
                new Date(message.createdAt).getTime() -
                  new Date(prevMessage.createdAt).getTime() >
                  5 * 60 * 1000;

              const isFirst =
                !prevMessage ||
                prevMessage.userId !== message.userId ||
                new Date(message.createdAt).getTime() -
                  new Date(prevMessage.createdAt).getTime() >
                  5 * 60 * 1000;

              return (
                <Message
                  key={message.id}
                  message={message}
                  showAvatar={showAvatar}
                  isFirst={isFirst}
                  onReply={(msg) => {
                    openThread(msg);
                  }}
                  onEdit={setEditingMessage}
                  onDelete={handleDeleteMessage}
                  onReaction={handleReaction}
                />
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <TypingIndicator />

      {/* Message Input */}
      <MessageInput
        onSend={handleSendMessage}
        replyTo={replyTo}
        onCancelReply={() => setReplyTo(null)}
        disabled={state.sendingMessage}
      />
    </div>
  );
}
