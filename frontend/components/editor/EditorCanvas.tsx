'use client';

import { motion } from 'framer-motion';
import { Block, ToolbarAction, SlashCommand } from '@/types/editor';
import { useState, useRef, useEffect } from 'react';
import FloatingToolbar from './FloatingToolbar';
import SlashMenu from './SlashMenu';

interface EditorCanvasProps {
    blocks: Block[];
    documentTitle?: string;
    onBlockChange: (blockId: string, content: string) => void;
    onBlockAdd: (afterBlockId: string, type: Block['type']) => void;
    onBlockDelete: (blockId: string) => void;
    onBlockReorder: (blockId: string, newOrder: number) => void;
}

export default function EditorCanvas({
    blocks,
    documentTitle,
    onBlockChange,
    onBlockAdd,
    onBlockDelete,
    onBlockReorder
}: EditorCanvasProps) {
    const [focusedBlockId, setFocusedBlockId] = useState<string | null>(null);
    const [showToolbar, setShowToolbar] = useState(false);
    const [toolbarPosition, setToolbarPosition] = useState({ top: 0, left: 0 });
    const [showSlashMenu, setShowSlashMenu] = useState(false);
    const [slashMenuPosition, setSlashMenuPosition] = useState({ top: 0, left: 0 });
    const [slashMenuBlockId, setSlashMenuBlockId] = useState<string | null>(null);
    const blockRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    const handleTextSelection = () => {
        const selection = window.getSelection();
        if (selection && selection.toString().length > 0) {
            const range = selection.getRangeAt(0);
            const rect = range.getBoundingClientRect();
            setToolbarPosition({
                top: rect.top - 50,
                left: rect.left + rect.width / 2
            });
            setShowToolbar(true);
        } else {
            setShowToolbar(false);
        }
    };

    const handleInput = (e: React.FormEvent<HTMLDivElement>, blockId: string) => {
        const content = e.currentTarget.textContent || '';
        onBlockChange(blockId, content);
    };

    const handleKeyDown = (e: React.KeyboardEvent, blockId: string, index: number) => {
        const content = e.currentTarget.textContent || '';

        // Enter key creates new paragraph block
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onBlockAdd(blockId, 'paragraph');
            // Focus the next block after a short delay
            setTimeout(() => {
                const nextBlock = blocks[index + 1];
                if (nextBlock && blockRefs.current[nextBlock.id]) {
                    blockRefs.current[nextBlock.id]?.focus();
                }
            }, 50);
        }

        // Backspace on empty block deletes it
        if (e.key === 'Backspace' && content === '' && blocks.length > 1) {
            e.preventDefault();
            onBlockDelete(blockId);
            // Focus previous block
            if (index > 0) {
                const prevBlock = blocks[index - 1];
                if (prevBlock && blockRefs.current[prevBlock.id]) {
                    blockRefs.current[prevBlock.id]?.focus();
                    // Move cursor to end
                    const range = document.createRange();
                    const sel = window.getSelection();
                    const prevEl = blockRefs.current[prevBlock.id];
                    if (prevEl && sel) {
                        range.selectNodeContents(prevEl);
                        range.collapse(false);
                        sel.removeAllRanges();
                        sel.addRange(range);
                    }
                }
            }
        }

        // Detect slash at start to show menu
        if (e.key === '/' && content === '') {
            e.preventDefault();
            const target = e.target as HTMLElement;
            const rect = target.getBoundingClientRect();
            setSlashMenuPosition({
                top: rect.bottom + 5,
                left: rect.left
            });
            setSlashMenuBlockId(blockId);
            setShowSlashMenu(true);
        }
    };

    const handleSlashCommand = (command: SlashCommand) => {
        if (slashMenuBlockId) {
            // Find the block and change its type
            const blockIndex = blocks.findIndex(b => b.id === slashMenuBlockId);
            if (blockIndex >= 0) {
                // Change block type by updating content
                const blockEl = blockRefs.current[slashMenuBlockId];
                if (blockEl) {
                    blockEl.textContent = '';
                }
                onBlockChange(slashMenuBlockId, '');
                // Note: In a real implementation, you'd have a callback to change block type
                // For now, we can add a new block of the desired type
                onBlockAdd(slashMenuBlockId, command.blockType);
                onBlockDelete(slashMenuBlockId);
            }
        }
        setShowSlashMenu(false);
        setSlashMenuBlockId(null);
    };

    const handleToolbarAction = (action: ToolbarAction) => {
        // Apply formatting using document.execCommand (deprecated but still works)
        document.execCommand(action === 'bold' ? 'bold' :
            action === 'italic' ? 'italic' :
                action === 'underline' ? 'underline' :
                    action === 'code' ? 'formatBlock' : 'formatBlock', false);
    };

    const getPlaceholder = (type: Block['type'], index: number) => {
        switch (type) {
            case 'heading1': return 'Heading 1';
            case 'heading2': return 'Heading 2';
            case 'heading3': return 'Heading 3';
            case 'code': return '// Code';
            case 'bulletList': return 'List item';
            case 'numberedList': return 'List item';
            default: return 'Start writing or type / for commands';
        }
    };

    const renderBlock = (block: Block, index: number) => {
        const commonClasses = "w-full bg-transparent focus:outline-none text-gray-900 dark:text-white transition-colors";
        const isEmpty = !block.content || block.content.trim() === '';

        switch (block.type) {
            case 'heading1':
                return (
                    <div
                        key={block.id}
                        ref={(el) => {
                            blockRefs.current[block.id] = el;
                            if (el && el.textContent !== block.content) {
                                el.textContent = block.content;
                            }
                        }}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={(e) => handleInput(e, block.id)}
                        onFocus={() => setFocusedBlockId(block.id)}
                        onKeyDown={(e) => handleKeyDown(e, block.id, index)}
                        onMouseUp={handleTextSelection}
                        className={`${commonClasses} text-4xl font-bold mb-4 leading-tight min-h-[3rem] ${isEmpty ? 'text-gray-400 dark:text-gray-600' : ''}`}
                        data-placeholder={getPlaceholder(block.type, index)}
                    />
                );
            case 'heading2':
                return (
                    <div
                        key={block.id}
                        ref={(el) => {
                            blockRefs.current[block.id] = el;
                            if (el && el.textContent !== block.content) {
                                el.textContent = block.content;
                            }
                        }}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={(e) => handleInput(e, block.id)}
                        onFocus={() => setFocusedBlockId(block.id)}
                        onKeyDown={(e) => handleKeyDown(e, block.id, index)}
                        onMouseUp={handleTextSelection}
                        className={`${commonClasses} text-3xl font-bold mb-3 leading-tight min-h-[2.5rem] ${isEmpty ? 'text-gray-400 dark:text-gray-600' : ''}`}
                        data-placeholder={getPlaceholder(block.type, index)}
                    />
                );
            case 'heading3':
                return (
                    <div
                        key={block.id}
                        ref={(el) => {
                            blockRefs.current[block.id] = el;
                            if (el && el.textContent !== block.content) {
                                el.textContent = block.content;
                            }
                        }}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={(e) => handleInput(e, block.id)}
                        onFocus={() => setFocusedBlockId(block.id)}
                        onKeyDown={(e) => handleKeyDown(e, block.id, index)}
                        onMouseUp={handleTextSelection}
                        className={`${commonClasses} text-2xl font-bold mb-2 leading-tight min-h-[2rem] ${isEmpty ? 'text-gray-400 dark:text-gray-600' : ''}`}
                        data-placeholder={getPlaceholder(block.type, index)}
                    />
                );
            case 'code':
                return (
                    <div
                        key={block.id}
                        ref={(el) => {
                            blockRefs.current[block.id] = el;
                            if (el && el.textContent !== block.content) {
                                el.textContent = block.content;
                            }
                        }}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={(e) => handleInput(e, block.id)}
                        onFocus={() => setFocusedBlockId(block.id)}
                        onKeyDown={(e) => handleKeyDown(e, block.id, index)}
                        className={`${commonClasses} font-mono text-sm bg-gray-100 dark:bg-gray-900 p-4 rounded-lg mb-3 overflow-x-auto min-h-[3rem] ${isEmpty ? 'text-gray-400 dark:text-gray-600' : ''}`}
                        data-placeholder={getPlaceholder(block.type, index)}
                    />
                );
            case 'bulletList':
                return (
                    <div key={block.id} className="flex items-start gap-3 mb-2 group">
                        <span className="text-violet-500 mt-2 select-none">•</span>
                        <div
                            ref={(el) => {
                                blockRefs.current[block.id] = el;
                                if (el && el.textContent !== block.content) {
                                    el.textContent = block.content;
                                }
                            }}
                            contentEditable
                            suppressContentEditableWarning
                            onInput={(e) => handleInput(e, block.id)}
                            onFocus={() => setFocusedBlockId(block.id)}
                            onKeyDown={(e) => handleKeyDown(e, block.id, index)}
                            onMouseUp={handleTextSelection}
                            className={`${commonClasses} flex-1 min-h-[1.5rem] ${isEmpty ? 'text-gray-400 dark:text-gray-600' : ''}`}
                            data-placeholder={getPlaceholder(block.type, index)}
                        />
                    </div>
                );
            case 'numberedList':
                // Calculate the list number based on consecutive numbered list blocks
                let listNumber = 1;
                for (let i = index - 1; i >= 0; i--) {
                    if (blocks[i].type === 'numberedList') {
                        listNumber++;
                    } else {
                        break;
                    }
                }
                return (
                    <div key={block.id} className="flex items-start gap-3 mb-2 group">
                        <span className="text-violet-500 font-medium select-none min-w-[1.5rem]">{listNumber}.</span>
                        <div
                            ref={(el) => {
                                blockRefs.current[block.id] = el;
                                if (el && el.textContent !== block.content) {
                                    el.textContent = block.content;
                                }
                            }}
                            contentEditable
                            suppressContentEditableWarning
                            onInput={(e) => handleInput(e, block.id)}
                            onFocus={() => setFocusedBlockId(block.id)}
                            onKeyDown={(e) => handleKeyDown(e, block.id, index)}
                            onMouseUp={handleTextSelection}
                            className={`${commonClasses} flex-1 min-h-[1.5rem] ${isEmpty ? 'text-gray-400 dark:text-gray-600' : ''}`}
                            data-placeholder={getPlaceholder(block.type, index)}
                        />
                    </div>
                );
            default:
                return (
                    <div
                        key={block.id}
                        ref={(el) => {
                            blockRefs.current[block.id] = el;
                            if (el && el.textContent !== block.content) {
                                el.textContent = block.content;
                            }
                        }}
                        contentEditable
                        suppressContentEditableWarning
                        onInput={(e) => handleInput(e, block.id)}
                        onFocus={() => setFocusedBlockId(block.id)}
                        onKeyDown={(e) => handleKeyDown(e, block.id, index)}
                        onMouseUp={handleTextSelection}
                        className={`${commonClasses} text-base leading-relaxed mb-3 min-h-[1.5rem] ${isEmpty ? 'text-gray-400 dark:text-gray-600' : ''}`}
                        data-placeholder={getPlaceholder(block.type, index)}
                    />
                );
        }
    };

    return (
        <div className="h-full flex flex-col">
            {/* Main Editor Surface */}
            <div className="flex-1 overflow-y-auto px-20 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-4xl mx-auto"
                >
                    {/* Page-like surface */}
                    <div className="glass-strong rounded-2xl shadow-2xl p-12 min-h-[800px]">
                        {/* Document Title - Non-editable */}
                        {documentTitle && (
                            <>
                                <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white leading-tight">
                                    {documentTitle}
                                </h1>
                                <div className="h-px bg-gradient-to-r from-violet-500/20 via-violet-500/50 to-violet-500/20 mb-6" />
                            </>
                        )}

                        {/* Editable Content */}
                        {blocks.map((block, index) => renderBlock(block, index))}
                    </div>
                </motion.div>
            </div>

            {/* Floating Toolbar */}
            <FloatingToolbar
                visible={showToolbar}
                position={toolbarPosition}
                onAction={handleToolbarAction}
            />

            {/* Slash Menu */}
            <SlashMenu
                visible={showSlashMenu}
                position={slashMenuPosition}
                onSelect={handleSlashCommand}
                onClose={() => setShowSlashMenu(false)}
            />

            <style jsx global>{`
        [contenteditable]:empty:before {
          content: attr(data-placeholder);
          color: inherit;
          opacity: 1;
          pointer-events: none;
          position: absolute;
        }
        [contenteditable]:focus:empty:before {
          content: attr(data-placeholder);
        }
        [contenteditable]:not(:empty):before {
          content: none;
        }
      `}</style>
        </div>
    );
}
