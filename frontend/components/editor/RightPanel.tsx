'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import { Comment, Version, User } from '@/types/editor';
import CommentThread from './CommentThread';

interface RightPanelProps {
    comments: Comment[];
    versions: Version[];
    attachments?: Array<{ id: string; name: string; size: number; type: string; url: string }>;
    currentUser: User;
    onAddComment?: (text: string) => void;
    onReplyComment?: (commentId: string, text: string) => void;
    onResolveComment?: (commentId: string) => void;
    onRestoreVersion?: (versionId: string) => void;
}

type Tab = 'comments' | 'attachments' | 'history';

export default function RightPanel({
    comments,
    versions,
    attachments = [],
    currentUser,
    onAddComment,
    onReplyComment,
    onResolveComment,
    onRestoreVersion
}: RightPanelProps) {
    const [activeTab, setActiveTab] = useState<Tab>('comments');
    const [showResolved, setShowResolved] = useState(false);

    const activeComments = showResolved ? comments : comments.filter(c => !c.resolved);

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const formatDate = (date: Date) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="h-full flex flex-col glass-strong rounded-xl overflow-hidden">
            {/* Tab Headers */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
                {[
                    { id: 'comments', label: 'Comments', count: comments.length },
                    { id: 'attachments', label: 'Files', count: attachments.length },
                    { id: 'history', label: 'History', count: versions.length }
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as Tab)}
                        className={`flex-1 px-4 py-3 text-sm font-medium transition-colors relative ${activeTab === tab.id
                                ? 'text-violet-600 dark:text-violet-400'
                                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                            }`}
                    >
                        {tab.label}
                        {tab.count > 0 && (
                            <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${activeTab === tab.id
                                    ? 'bg-violet-500/20 text-violet-600 dark:text-violet-400'
                                    : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                }`}>
                                {tab.count}
                            </span>
                        )}
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTab"
                                className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500"
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4">
                {/* Comments Tab */}
                {activeTab === 'comments' && (
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                                {activeComments.length} {activeComments.length === 1 ? 'Comment' : 'Comments'}
                            </h3>
                            <button
                                onClick={() => setShowResolved(!showResolved)}
                                className="text-xs font-medium text-violet-600 dark:text-violet-400 hover:underline"
                            >
                                {showResolved ? 'Hide' : 'Show'} resolved
                            </button>
                        </div>

                        {activeComments.length > 0 ? (
                            activeComments.map(comment => (
                                <CommentThread
                                    key={comment.id}
                                    comment={comment}
                                    currentUser={currentUser}
                                    onReply={(text) => onReplyComment?.(comment.id, text)}
                                    onResolve={() => onResolveComment?.(comment.id)}
                                />
                            ))
                        ) : (
                            <div className="py-12 text-center">
                                <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                </svg>
                                <p className="text-sm text-gray-500 dark:text-gray-400">No comments yet</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Attachments Tab */}
                {activeTab === 'attachments' && (
                    <div className="space-y-2">
                        {attachments.length > 0 ? (
                            attachments.map(file => (
                                <motion.div
                                    key={file.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-3 rounded-lg bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-white/5 transition-colors cursor-pointer"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center flex-shrink-0">
                                            <svg className="w-5 h-5 text-violet-600 dark:text-violet-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                {file.name}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {formatFileSize(file.size)}
                                            </p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="py-12 text-center">
                                <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                <p className="text-sm text-gray-500 dark:text-gray-400">No attachments</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Version History Tab */}
                {activeTab === 'history' && (
                    <div className="space-y-4">
                        <div className="mb-4">
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                                Version History
                            </h3>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                View and restore previous versions
                            </p>
                        </div>

                        {versions.length > 0 ? (
                            <div className="relative">
                                {/* Timeline line */}
                                <div className="absolute left-4 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />

                                <div className="space-y-4">
                                    {versions.map((version, index) => (
                                        <motion.div
                                            key={version.id}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="relative pl-10"
                                        >
                                            {/* Timeline dot */}
                                            <div className="absolute left-2.5 top-2 w-3 h-3 rounded-full bg-violet-500 border-2 border-white dark:border-[#050505]" />

                                            <div className="p-3 rounded-lg bg-white/50 dark:bg-black/20 hover:bg-white/80 dark:hover:bg-white/5 transition-colors">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                            {version.description || 'Auto-saved'}
                                                        </p>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            By {version.author.name} • {formatDate(version.timestamp)}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => onRestoreVersion?.(version.id)}
                                                    className="text-xs font-medium text-violet-600 dark:text-violet-400 hover:underline"
                                                >
                                                    Restore this version
                                                </button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-sm text-gray-500 dark:text-gray-400">No version history</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Security Badge */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-xs">
                    <svg className="w-4 h-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span className="text-violet-600 dark:text-violet-400 font-semibold">
                        End-to-End Encrypted
                    </span>
                </div>
            </div>
        </div>
    );
}
