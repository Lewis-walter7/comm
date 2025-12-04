'use client';

import { motion } from 'framer-motion';
import { Comment, Reply, User } from '@/types/editor';
import { useState } from 'react';

interface CommentThreadProps {
    comment: Comment;
    onReply?: (text: string) => void;
    onResolve?: () => void;
    currentUser: User;
}

export default function CommentThread({ comment, onReply, onResolve, currentUser }: CommentThreadProps) {
    const [replyText, setReplyText] = useState('');
    const [showReplyInput, setShowReplyInput] = useState(false);

    const handleReply = () => {
        if (replyText.trim() && onReply) {
            onReply(replyText);
            setReplyText('');
            setShowReplyInput(false);
        }
    };

    const formatDate = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - new Date(date).getTime();
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}d ago`;
        if (hours > 0) return `${hours}h ago`;
        if (minutes > 0) return `${minutes}m ago`;
        return 'just now';
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-strong rounded-xl p-4 shadow-xl max-w-sm"
        >
            {/* Main Comment */}
            <div className="flex gap-3 mb-3">
                <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                    style={{ backgroundColor: comment.author.color }}
                >
                    {comment.author.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-1">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {comment.author.name}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatDate(comment.createdAt)}
                        </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 break-words">
                        {comment.text}
                    </p>
                </div>
            </div>

            {/* Thread Replies */}
            {comment.thread.length > 0 && (
                <div className="ml-11 space-y-3 mb-3 border-l-2 border-gray-200 dark:border-gray-700 pl-3">
                    {comment.thread.map((reply) => (
                        <div key={reply.id} className="flex gap-2">
                            <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                style={{ backgroundColor: reply.author.color }}
                            >
                                {reply.author.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-baseline gap-2 mb-0.5">
                                    <span className="text-xs font-semibold text-gray-900 dark:text-white">
                                        {reply.author.name}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                        {formatDate(reply.createdAt)}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-700 dark:text-gray-300 break-words">
                                    {reply.text}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Reply Input */}
            {showReplyInput && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    className="ml-11 mb-3"
                >
                    <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Write a reply..."
                        className="w-full px-3 py-2 text-sm bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                        rows={2}
                        autoFocus
                    />
                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={handleReply}
                            className="px-3 py-1 text-xs font-medium text-white bg-violet-500 hover:bg-violet-600 rounded-lg transition-colors"
                        >
                            Reply
                        </button>
                        <button
                            onClick={() => {
                                setShowReplyInput(false);
                                setReplyText('');
                            }}
                            className="px-3 py-1 text-xs font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </motion.div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 text-xs">
                <button
                    onClick={() => setShowReplyInput(!showReplyInput)}
                    className="font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
                >
                    Reply
                </button>
                {!comment.resolved && onResolve && (
                    <button
                        onClick={onResolve}
                        className="font-medium text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 transition-colors"
                    >
                        Resolve
                    </button>
                )}
                {comment.resolved && (
                    <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Resolved
                    </span>
                )}
            </div>
        </motion.div>
    );
}
