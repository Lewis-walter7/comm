'use client';

import { motion } from 'framer-motion';
import { User } from '@/types/editor';
import { useState } from 'react';

interface ActiveUsersProps {
    users: User[];
    maxVisible?: number;
}

export default function ActiveUsers({ users, maxVisible = 5 }: ActiveUsersProps) {
    const [hoveredUser, setHoveredUser] = useState<string | null>(null);
    const activeUsers = users.filter(u => u.isActive);
    const visibleUsers = activeUsers.slice(0, maxVisible);
    const remainingCount = Math.max(0, activeUsers.length - maxVisible);

    if (activeUsers.length === 0) return null;

    return (
        <div className="flex items-center gap-2">
            <div className="flex items-center -space-x-2">
                {visibleUsers.map((user, index) => (
                    <motion.div
                        key={user.id}
                        initial={{ opacity: 0, scale: 0.5, x: -20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.5, x: 20 }}
                        transition={{ delay: index * 0.05 }}
                        onMouseEnter={() => setHoveredUser(user.id)}
                        onMouseLeave={() => setHoveredUser(null)}
                        className="relative group"
                    >
                        {/* Avatar */}
                        <div
                            className="w-8 h-8 rounded-full border-2 border-white dark:border-[#050505] flex items-center justify-center text-xs font-bold text-white cursor-pointer transition-transform hover:scale-110 hover:z-10"
                            style={{ backgroundColor: user.color }}
                        >
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                user.name.charAt(0).toUpperCase()
                            )}
                        </div>

                        {/* Online indicator */}
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white dark:border-[#050505] rounded-full animate-pulse-glow" />

                        {/* Tooltip */}
                        {hoveredUser === user.id && (
                            <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 glass-strong rounded-lg shadow-xl z-50 whitespace-nowrap"
                            >
                                <p className="text-xs font-semibold text-gray-900 dark:text-white">
                                    {user.name}
                                </p>
                                <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {user.email}
                                </p>
                                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-white/90 dark:bg-[#1a1a1a]/90 border-t border-l border-gray-200/50 dark:border-white/10" />
                            </motion.div>
                        )}
                    </motion.div>
                ))}

                {remainingCount > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-8 h-8 rounded-full border-2 border-white dark:border-[#050505] flex items-center justify-center text-xs font-bold bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                    >
                        +{remainingCount}
                    </motion.div>
                )}
            </div>

            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {activeUsers.length} {activeUsers.length === 1 ? 'person' : 'people'} editing
            </span>
        </div>
    );
}
