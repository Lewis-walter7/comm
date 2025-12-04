'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../context/chat/ChatContext';
import { MessageDto } from '../../services/chat/chatApi';
import {
  X,
  Send,
  Smile,
  Reply,
  MoreHorizontal,
  Edit2,
  Trash2,
  Copy
} from 'lucide-react';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import EmojiPicker from 'emoji-picker-react';

interface ThreadMessageProps {
  message: MessageDto;
  isParent?: boolean;
  onEdit: (message: MessageDto) => void;
  onDelete: (messageId: string) => void;
  onReaction: (messageId: string, emoji: string) => void;
}

function ThreadMessage({ message, isParent = false, onEdit, onDelete, onReaction }: ThreadMessageProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const { state } = useChat();

  const isOwn = message.userId === state.currentWorkspace; // This should be current user ID
  const isEdited = message.editedAt !== null;
  const isDeleted = message.deletedAt !== null;

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'HH:mm')}`;
    } else {
      return format(date, 'MMM d, HH:mm');
    }
  };

  const reactions = message.reactions ? JSON.parse(JSON.stringify(message.reactions)) : {};

  if (isDeleted) {
    return (
      <div className="py-2 px-3">
        <div className="flex items-center space-x-2 text-gray-400 italic text-sm">
          <Trash2 className="h-3 w-3" />
          <span>This message was deleted</span>
          <span className="text-xs">{formatMessageTime(message.createdAt)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`group py-2 px-3 hover:bg-gray-50 relative ${isParent ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {message.user.avatarUrl ? (
            <img
              src={message.user.avatarUrl}
              alt={message.user.name}
              className="h-6 w-6 rounded-full"
            />
          ) : (
            <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
              {message.user.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-sm text-gray-900">{message.user.name}</span>
            <span className="text-xs text-gray-500">
              {formatMessageTime(message.createdAt)}
            </span>
            {isEdited && (
              <span className="text-xs text-gray-400">(edited)</span>
            )}
            {isParent && (
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                Original
              </span>
            )}
          </div>

          <div className="prose prose-sm max-w-none">
            <p className="text-gray-900 text-sm whitespace-pre-wrap break-words">
              {message.content}
            </p>
          </div>

          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-1">
              {message.attachments.map((attachment: any, index: number) => (
                <div key={index} className="flex items-center space-x-2 p-2 bg-gray-100 rounded border text-sm">
                  <span className="font-medium">{attachment.fileName}</span>
                  <span className="text-gray-500">
                    ({(attachment.fileSize / 1024).toFixed(1)} KB)
                  </span>
                </div>
              ))}
            </div>
          )}

          {Object.keys(reactions).length > 0 && (
            <div className="flex items-center space-x-1 mt-2">
              {Object.entries(reactions).map(([emoji, userIds]: [string, any]) => (
                <button
                  key={emoji}
                  onClick={() => onReaction(message.id, emoji)}
                  className="flex items-center space-x-1 px-2 py-0.5 bg-blue-50 hover:bg-blue-100 rounded-full text-xs transition-colors"
                >
                  <span>{emoji}</span>
                  <span className="text-blue-600 font-medium">{userIds.length}</span>
                </button>
              ))}
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
            <Smile className="h-3 w-3" />
          </button>

          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            <MoreHorizontal className="h-3 w-3" />
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
            height={250}
            width={250}
          />
        </div>
      )}

      {/* Context Menu */}
      {showMenu && (
        <div className="absolute top-full right-4 mt-1 bg-white border border-gray-200 rounded-md shadow-lg py-1 z-10">
          <button
            onClick={() => {
              navigator.clipboard.writeText(message.content);
              setShowMenu(false);
            }}
            className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 flex items-center space-x-2"
          >
            <Copy className="h-3 w-3" />
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
                <Edit2 className="h-3 w-3" />
                <span>Edit message</span>
              </button>

              <button
                onClick={() => {
                  onDelete(message.id);
                  setShowMenu(false);
                }}
                className="w-full px-3 py-2 text-left text-sm hover:bg-gray-100 text-red-600 flex items-center space-x-2"
              >
                <Trash2 className="h-3 w-3" />
                <span>Delete message</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

interface ThreadInputProps {
  onSend: (content: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

function ThreadInput({ onSend, placeholder = "Reply to thread...", disabled }: ThreadInputProps) {
  const [content, setContent] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || disabled) return;

    onSend(content.trim());
    setContent('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-3 border-t border-gray-200">
      <div className="flex items-end space-x-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full min-h-[36px] max-h-24 px-3 py-2 text-sm border border-gray-300 rounded resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={disabled}
            rows={1}
          />
        </div>

        <div className="flex items-center space-x-1">
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
              title="Add emoji"
            >
              <Smile className="h-4 w-4" />
            </button>

            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-2">
                <EmojiPicker
                  onEmojiClick={(emojiObject) => {
                    setContent(prev => prev + emojiObject.emoji);
                    setShowEmojiPicker(false);
                    textareaRef.current?.focus();
                  }}
                  height={250}
                  width={250}
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!content.trim() || disabled}
            className="p-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Send reply"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </form>
  );
}

export default function ThreadPanel() {
  const {
    state,
    closeThread,
    sendMessage,
    editMessage,
    deleteMessage,
    addReaction,
    loadMessages
  } = useChat();

  const [threadMessages, setThreadMessages] = useState<MessageDto[]>([]);
  const [loadingThread, setLoadingThread] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const parentMessage = state.activeThread;
  const conversation = state.activeConversation;

  // Load thread messages when parent message changes
  useEffect(() => {
    if (parentMessage && conversation) {
      setLoadingThread(true);
      // In a real implementation, you'd call an API to get thread messages
      // For now, we'll filter existing messages
      const replies = (state.messages[conversation.id] || []).filter(
        (msg) => msg.replyToId === parentMessage.id
      );
      setThreadMessages(replies);
      setLoadingThread(false);
    }
  }, [parentMessage, conversation, state.messages]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [threadMessages]);

  const handleSendReply = async (content: string) => {
    if (!conversation || !parentMessage) return;
    await sendMessage(conversation.id, content, parentMessage.id);
  };

  const handleEditMessage = async (messageId: string, content: string) => {
    await editMessage(messageId, content);
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!conversation) return;
    if (confirm('Are you sure you want to delete this message?')) {
      await deleteMessage(messageId, conversation.id);
    }
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    if (!conversation) return;
    await addReaction(messageId, emoji, conversation.id);
  };

  if (!parentMessage || !conversation) {
    return null;
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Reply className="h-5 w-5 text-gray-500" />
          <h3 className="font-semibold text-gray-900">Thread</h3>
        </div>
        <button
          onClick={closeThread}
          className="p-1 hover:bg-gray-100 rounded transition-colors"
          title="Close thread"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Thread Messages */}
      <div className="flex-1 overflow-y-auto">
        {loadingThread ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div>
            {/* Parent Message */}
            <ThreadMessage
              message={parentMessage}
              isParent={true}
              onEdit={(msg) => {}} // Handle edit if needed
              onDelete={handleDeleteMessage}
              onReaction={handleReaction}
            />

            {/* Divider */}
            {threadMessages.length > 0 && (
              <div className="px-3 py-2">
                <div className="flex items-center space-x-3">
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="text-xs text-gray-500 font-medium">
                    {threadMessages.length} repl{threadMessages.length === 1 ? 'y' : 'ies'}
                  </span>
                  <div className="flex-1 h-px bg-gray-200"></div>
                </div>
              </div>
            )}

            {/* Thread Replies */}
            <div className="pb-4">
              {threadMessages.map((message) => (
                <ThreadMessage
                  key={message.id}
                  message={message}
                  onEdit={(msg) => {}} // Handle edit if needed
                  onDelete={handleDeleteMessage}
                  onReaction={handleReaction}
                />
              ))}
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}
      </div>

      {/* Thread Input */}
      <ThreadInput
        onSend={handleSendReply}
        placeholder={`Reply to ${parentMessage.user.name}...`}
        disabled={state.sendingMessage}
      />
    </div>
  );
}
