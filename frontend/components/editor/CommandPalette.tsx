'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';

interface CommandPaletteProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Command {
    id: string;
    label: string;
    description: string;
    icon: React.ReactNode;
    action: () => void;
    keywords: string[];
    category: string;
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
    const [search, setSearch] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);

    const commands: Command[] = [
        {
            id: 'save',
            label: 'Save Document',
            description: 'Save current changes',
            category: 'File',
            keywords: ['save', 'write'],
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />,
            action: () => console.log('Save')
        },
        {
            id: 'export',
            label: 'Export Document',
            description: 'Export as PDF, Markdown, or HTML',
            category: 'File',
            keywords: ['export', 'download', 'pdf', 'markdown'],
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />,
            action: () => console.log('Export')
        },
        {
            id: 'share',
            label: 'Share Document',
            description: 'Invite collaborators',
            category: 'Collaboration',
            keywords: ['share', 'invite', 'collaborate'],
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />,
            action: () => console.log('Share')
        },
        {
            id: 'comments',
            label: 'Show Comments',
            description: 'Toggle comments panel',
            category: 'View',
            keywords: ['comments', 'feedback', 'panel'],
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />,
            action: () => console.log('Comments')
        },
        {
            id: 'outline',
            label: 'Show Outline',
            description: 'Toggle document outline',
            category: 'View',
            keywords: ['outline', 'structure', 'toc'],
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />,
            action: () => console.log('Outline')
        },
        {
            id: 'versions',
            label: 'Version History',
            description: 'View past versions',
            category: 'History',
            keywords: ['version', 'history', 'revisions'],
            icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
            action: () => console.log('Versions')
        },
    ];

    const filteredCommands = commands.filter(cmd =>
        cmd.label.toLowerCase().includes(search.toLowerCase()) ||
        cmd.description.toLowerCase().includes(search.toLowerCase()) ||
        cmd.keywords.some(k => k.includes(search.toLowerCase()))
    );

    const groupedCommands = filteredCommands.reduce((acc, cmd) => {
        if (!acc[cmd.category]) acc[cmd.category] = [];
        acc[cmd.category].push(cmd);
        return acc;
    }, {} as Record<string, Command[]>);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!isOpen) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
                break;
            case 'Enter':
                e.preventDefault();
                if (filteredCommands[selectedIndex]) {
                    filteredCommands[selectedIndex].action();
                    onClose();
                }
                break;
            case 'Escape':
                e.preventDefault();
                onClose();
                break;
        }
    }, [isOpen, selectedIndex, filteredCommands, onClose]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [search]);

    useEffect(() => {
        if (isOpen) {
            setSearch('');
            setSelectedIndex(0);
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            transition={{ duration: 0.2 }}
                            className="w-full max-w-2xl glass-strong rounded-2xl shadow-2xl overflow-hidden"
                        >
                            {/* Search Input */}
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Search commands..."
                                        className="flex-1 bg-transparent text-lg focus:outline-none text-gray-900 dark:text-white placeholder-gray-400"
                                        autoFocus
                                    />
                                    <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-mono text-gray-500 bg-white/50 dark:bg-black/20 rounded">
                                        Esc
                                    </kbd>
                                </div>
                            </div>

                            {/* Commands List */}
                            <div className="max-h-96 overflow-y-auto p-2">
                                {Object.keys(groupedCommands).length > 0 ? (
                                    Object.entries(groupedCommands).map(([category, cmds]) => (
                                        <div key={category} className="mb-4 last:mb-0">
                                            <div className="px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                                {category}
                                            </div>
                                            <div className="space-y-0.5">
                                                {cmds.map((cmd, index) => {
                                                    const globalIndex = filteredCommands.indexOf(cmd);
                                                    return (
                                                        <button
                                                            key={cmd.id}
                                                            onClick={() => {
                                                                cmd.action();
                                                                onClose();
                                                            }}
                                                            onMouseEnter={() => setSelectedIndex(globalIndex)}
                                                            className={`w-full px-3 py-2.5 rounded-lg flex items-center gap-3 transition-colors ${globalIndex === selectedIndex
                                                                    ? 'bg-violet-500/10 border-l-2 border-violet-500'
                                                                    : 'hover:bg-white/30 dark:hover:bg-white/5 border-l-2 border-transparent'
                                                                }`}
                                                        >
                                                            <svg className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                {cmd.icon}
                                                            </svg>
                                                            <div className="flex-1 text-left">
                                                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                                    {cmd.label}
                                                                </div>
                                                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                                                    {cmd.description}
                                                                </div>
                                                            </div>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-12 text-center">
                                        <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">No commands found</p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                                <div className="flex items-center gap-4">
                                    <span className="flex items-center gap-1">
                                        <kbd className="px-1.5 py-0.5 rounded bg-white/50 dark:bg-black/20 font-mono">↑↓</kbd>
                                        Navigate
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <kbd className="px-1.5 py-0.5 rounded bg-white/50 dark:bg-black/20 font-mono">↵</kbd>
                                        Execute
                                    </span>
                                </div>
                                <span className="hidden sm:inline">
                                    Press <kbd className="px-1.5 py-0.5 rounded bg-white/50 dark:bg-black/20 font-mono">⌘K</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-white/50 dark:bg-black/20 font-mono">Ctrl+K</kbd> to open
                                </span>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
