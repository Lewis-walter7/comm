'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface SecurityBadgeProps {
    isEncrypted: boolean;
    encryptionDetails?: string;
}

export default function SecurityBadge({ isEncrypted, encryptionDetails }: SecurityBadgeProps) {
    const [showTooltip, setShowTooltip] = useState(false);

    if (!isEncrypted) return null;

    return (
        <div className="relative">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass neon-glow-violet cursor-pointer"
            >
                <svg className="w-3.5 h-3.5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <span className="text-xs font-semibold text-violet-600 dark:text-violet-400">
                    E2E Encrypted
                </span>
            </motion.div>

            {showTooltip && (
                <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-3 py-2 glass-strong rounded-lg shadow-xl z-50 w-64"
                >
                    <div className="flex items-start gap-2">
                        <svg className="w-4 h-4 text-violet-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                            <p className="text-xs font-semibold text-gray-900 dark:text-white mb-1">
                                End-to-End Encryption
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                                {encryptionDetails || 'Your document is encrypted with AES-256. Only you and invited collaborators can access the content.'}
                            </p>
                        </div>
                    </div>
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-white/90 dark:bg-[#1a1a1a]/90 border-t border-l border-gray-200/50 dark:border-white/10" />
                </motion.div>
            )}
        </div>
    );
}
