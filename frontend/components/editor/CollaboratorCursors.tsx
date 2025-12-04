'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { User } from '@/types/editor';

interface CollaboratorCursorsProps {
    collaborators: User[];
}

export default function CollaboratorCursors({ collaborators }: CollaboratorCursorsProps) {
    return (
        <AnimatePresence>
            {collaborators.map((user) => {
                if (!user.cursor || !user.isActive) return null;

                return (
                    <motion.div
                        key={user.id}
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                        className="absolute pointer-events-none z-50"
                        style={{
                            // Position would be calculated based on cursor.position
                            // For now, this is a placeholder
                            top: 0,
                            left: 0,
                        }}
                    >
                        {/* Cursor SVG */}
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                            style={{ color: user.color }}
                        >
                            <path
                                d="M5.5 3L19.5 11.5L12 13.5L9 21L5.5 3Z"
                                fill="currentColor"
                                stroke="white"
                                strokeWidth="1.5"
                                strokeLinejoin="round"
                            />
                        </svg>

                        {/* Username label */}
                        <motion.div
                            initial={{ opacity: 0, x: -5 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="ml-5 -mt-1 px-2 py-1 rounded text-xs font-semibold text-white whitespace-nowrap shadow-lg"
                            style={{ backgroundColor: user.color }}
                        >
                            {user.name}
                        </motion.div>
                    </motion.div>
                );
            })}
        </AnimatePresence>
    );
}
