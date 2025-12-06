"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useChat } from "../../context/chat/ChatContext";
import { useAuth } from "../../context/AuthContext";
import { MessageDto } from "../../services/chat/chatApi";
import Message from "./Message";
import GroupSettingsPage from "./GroupSettingsPage";
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
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight} px`;
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
            ` and ${remaining} other${remaining > 1 ? "s" : ""} `}{" "}
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
  const [showSettings, setShowSettings] = useState(false);
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
              {conversation.description && ` • ${conversation.description} `}
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
          <button
            onClick={() => {
              if (conversation.type === "GROUP") {
                setShowSettings(true);
              }
            }}
            className="p-3 glass-strong rounded-xl hover:neon-glow-blue text-gray-600 dark:text-gray-300 hover:text-violet-600 transition-all duration-200 transform hover:scale-105"
          >
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

      {/* Settings Slide-in Panel */}
      {showSettings && conversation.type === "GROUP" && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
            onClick={() => setShowSettings(false)}
          />

          {/* Slide-in Panel */}
          <div className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-white dark:bg-gray-900 z-50 shadow-2xl animate-slide-in-right overflow-hidden">
            <GroupSettingsPage
              conversationId={conversation.id}
              workspaceId={conversation.workspaceId}
              onBack={() => setShowSettings(false)}
            />
          </div>
        </>
      )}
    </div>
  );
}
