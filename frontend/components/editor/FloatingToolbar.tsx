'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { ToolbarAction } from '@/types/editor';

interface FloatingToolbarProps {
    onAction: (action: ToolbarAction) => void;
    visible: boolean;
    position?: { top: number; left: number };
}

export default function FloatingToolbar({ onAction, visible, position }: FloatingToolbarProps) {
    const [activeFormats, setActiveFormats] = useState<Set<ToolbarAction>>(new Set());

    const toolbarButtons: Array<{
        action: ToolbarAction;
        icon: React.ReactNode;
        label: string;
        group?: string;
    }> = [
            {
                action: 'bold',
                label: 'Bold',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4h8a4 4 0 014 4 4 4 0 01-4 4H6V4zm0 8h9a4 4 0 110 8H6v-8z" />
            },
            {
                action: 'italic',
                label: 'Italic',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 4h4M10 20h4M14 4l-4 16" />
            },
            {
                action: 'underline',
                label: 'Underline',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v8a5 5 0 0010 0V4M5 20h14" />
            },
            {
                action: 'heading1',
                label: 'Heading 1',
                group: 'heading',
                icon: <text x="4" y="18" fontSize="16" fontWeight="bold">H1</text>
            },
            {
                action: 'heading2',
                label: 'Heading 2',
                group: 'heading',
                icon: <text x="4" y="18" fontSize="14" fontWeight="bold">H2</text>
            },
            {
                action: 'heading3',
                label: 'Heading 3',
                group: 'heading',
                icon: <text x="4" y="18" fontSize="12" fontWeight="bold">H3</text>
            },
            {
                action: 'bulletList',
                label: 'Bullet List',
                icon: (
                    <>
                        <circle cx="6" cy="8" r="1.5" />
                        <circle cx="6" cy="16" r="1.5" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 8h8M10 16h8" />
                    </>
                )
            },
            {
                action: 'numberedList',
                label: 'Numbered List',
                icon: <text x="3" y="18" fontSize="12" fontWeight="bold">1.</text>
            },
            {
                action: 'code',
                label: 'Inline Code',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            },
            {
                action: 'highlight',
                label: 'Highlight',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            },
        ];

    const handleAction = (action: ToolbarAction) => {
        onAction(action);
        // Toggle active state
        setActiveFormats(prev => {
            const next = new Set(prev);
            if (next.has(action)) {
                next.delete(action);
            } else {
                next.add(action);
            }
            return next;
        });
    };

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="fixed z-50"
                    style={position ? { top: position.top, left: position.left } : undefined}
                >
                    <div className="glass-strong rounded-xl shadow-2xl p-1.5 flex items-center gap-0.5 animate-fade-in-up">
                        {toolbarButtons.map((button, index) => (
                            <div key={button.action} className="flex items-center">
                                {index > 0 &&
                                    (button.group !== toolbarButtons[index - 1].group) &&
                                    button.group !== toolbarButtons[index - 1].group && (
                                        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
                                    )}
                                <button
                                    onClick={() => handleAction(button.action)}
                                    className={`p-2 rounded-lg transition-all hover:bg-white/50 dark:hover:bg-white/10 ${activeFormats.has(button.action)
                                            ? 'bg-violet-500/20 text-violet-600 dark:text-violet-400'
                                            : 'text-gray-700 dark:text-gray-300'
                                        }`}
                                    title={button.label}
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        {button.icon}
                                    </svg>
                                </button>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
