'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useCallback } from 'react';
import { SlashCommand } from '@/types/editor';

interface SlashMenuProps {
    visible: boolean;
    onSelect: (command: SlashCommand) => void;
    onClose: () => void;
    position?: { top: number; left: number };
}

const SLASH_COMMANDS: SlashCommand[] = [
    { id: 'text', label: 'Text', description: 'Plain text block', icon: '📝', blockType: 'paragraph', keywords: ['text', 'paragraph', 'p'] },
    { id: 'h1', label: 'Heading 1', description: 'Large section heading', icon: 'H1', blockType: 'heading1', keywords: ['heading', 'h1', 'title'] },
    { id: 'h2', label: 'Heading 2', description: 'Medium section heading', icon: 'H2', blockType: 'heading2', keywords: ['heading', 'h2', 'subtitle'] },
    { id: 'h3', label: 'Heading 3', description: 'Small section heading', icon: 'H3', blockType: 'heading3', keywords: ['heading', 'h3'] },
    { id: 'bullet', label: 'Bullet List', description: 'Unordered list', icon: '•', blockType: 'bulletList', keywords: ['bullet', 'list', 'ul'] },
    { id: 'numbered', label: 'Numbered List', description: 'Ordered list', icon: '1.', blockType: 'numberedList', keywords: ['numbered', 'list', 'ol', 'ordered'] },
    { id: 'code', label: 'Code Block', description: 'Syntax highlighted code', icon: '<>', blockType: 'code', keywords: ['code', 'snippet', 'pre'] },
    { id: 'image', label: 'Image', description: 'Upload or embed image', icon: '🖼️', blockType: 'image', keywords: ['image', 'picture', 'photo', 'img'] },
    { id: 'file', label: 'File', description: 'Attach a file', icon: '📎', blockType: 'file', keywords: ['file', 'attachment', 'upload'] },
    { id: 'table', label: 'Table', description: 'Insert a table', icon: '⊞', blockType: 'table', keywords: ['table', 'grid'] },
    { id: 'checklist', label: 'Checklist', description: 'To-do list', icon: '☑', blockType: 'checklist', keywords: ['checklist', 'todo', 'task', 'checkbox'] },
];

export default function SlashMenu({ visible, onSelect, onClose, position }: SlashMenuProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    const filteredCommands = SLASH_COMMANDS.filter(cmd =>
        cmd.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cmd.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        cmd.keywords.some(k => k.includes(searchQuery.toLowerCase()))
    );

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (!visible) return;

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
                    onSelect(filteredCommands[selectedIndex]);
                }
                break;
            case 'Escape':
                e.preventDefault();
                onClose();
                break;
        }
    }, [visible, selectedIndex, filteredCommands, onSelect, onClose]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [searchQuery]);

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: 5, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 5, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="fixed z-50 w-80"
                    style={position ? { top: position.top, left: position.left } : undefined}
                >
                    <div className="glass-strong rounded-xl shadow-2xl overflow-hidden">
                        {/* Header */}
                        <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex items-center gap-2">
                                <span className="text-violet-500 font-mono text-sm">/</span>
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search blocks..."
                                    className="flex-1 bg-transparent text-sm focus:outline-none text-gray-900 dark:text-white"
                                    autoFocus
                                />
                            </div>
                        </div>

                        {/* Commands List */}
                        <div className="max-h-80 overflow-y-auto py-1">
                            {filteredCommands.length > 0 ? (
                                filteredCommands.map((cmd, index) => (
                                    <button
                                        key={cmd.id}
                                        onClick={() => onSelect(cmd)}
                                        onMouseEnter={() => setSelectedIndex(index)}
                                        className={`w-full px-4 py-2.5 flex items-center gap-3 transition-colors ${index === selectedIndex
                                                ? 'bg-violet-500/10 border-l-2 border-violet-500'
                                                : 'hover:bg-white/30 dark:hover:bg-white/5 border-l-2 border-transparent'
                                            }`}
                                    >
                                        <span className="text-lg w-6 text-center flex-shrink-0">{cmd.icon}</span>
                                        <div className="flex-1 text-left">
                                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                                                {cmd.label}
                                            </div>
                                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                                {cmd.description}
                                            </div>
                                        </div>
                                    </button>
                                ))
                            ) : (
                                <div className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400">
                                    No blocks found
                                </div>
                            )}
                        </div>

                        {/* Footer hint */}
                        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 rounded bg-white/50 dark:bg-black/20 font-mono">↑↓</kbd>
                                Navigate
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 rounded bg-white/50 dark:bg-black/20 font-mono">↵</kbd>
                                Select
                            </span>
                            <span className="flex items-center gap-1">
                                <kbd className="px-1.5 py-0.5 rounded bg-white/50 dark:bg-black/20 font-mono">Esc</kbd>
                                Close
                            </span>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
