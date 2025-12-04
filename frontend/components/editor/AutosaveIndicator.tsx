'use client';

import { motion } from 'framer-motion';

interface AutosaveIndicatorProps {
    status: 'saving' | 'saved' | 'offline' | 'error';
    lastSaved?: Date | null;
}

export default function AutosaveIndicator({ status, lastSaved }: AutosaveIndicatorProps) {
    const getStatusDisplay = () => {
        switch (status) {
            case 'saving':
                return {
                    icon: (
                        <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                    ),
                    text: 'Saving...',
                    color: 'text-blue-500'
                };
            case 'saved':
                return {
                    icon: (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    ),
                    text: lastSaved ? `Saved ${getRelativeTime(lastSaved)}` : 'Saved',
                    color: 'text-green-500 dark:text-green-400'
                };
            case 'offline':
                return {
                    icon: (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414" />
                        </svg>
                    ),
                    text: 'Offline',
                    color: 'text-orange-500 dark:text-orange-400'
                };
            case 'error':
                return {
                    icon: (
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    ),
                    text: 'Save failed',
                    color: 'text-red-500 dark:text-red-400'
                };
        }
    };

    const getRelativeTime = (date: Date) => {
        const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        if (seconds < 60) return 'just now';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        return `${hours}h ago`;
    };

    const { icon, text, color } = getStatusDisplay();

    return (
        <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-1.5 text-xs font-medium"
        >
            <span className={color}>{icon}</span>
            <span className={`${color} select-none`}>{text}</span>
        </motion.div>
    );
}

function getRelativeTime(date: Date) {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
}
