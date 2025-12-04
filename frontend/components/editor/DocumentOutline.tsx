'use client';

import { Block } from '@/types/editor';
import { motion } from 'framer-motion';
import { useMemo } from 'react';
import Link from 'next/link';

interface Heading {
    id: string;
    level: number;
    text: string;
    order: number;
}

interface DocumentOutlineProps {
    blocks: Block[];
    onNavigate: (blockId: string) => void;
    projectName?: string;
    projectId?: string;
    documentName?: string;
}

export default function DocumentOutline({
    blocks,
    onNavigate,
    projectName = 'My Project',
    projectId,
    documentName = 'Untitled Document'
}: DocumentOutlineProps) {
    const headings = useMemo(() => {
        return blocks
            .filter(block => ['heading1', 'heading2', 'heading3'].includes(block.type))
            .map(block => ({
                id: block.id,
                level: block.type === 'heading1' ? 1 : block.type === 'heading2' ? 2 : 3,
                text: block.content || 'Untitled',
                order: block.order
            }));
    }, [blocks]);

    const getIndentClass = (level: number) => {
        switch (level) {
            case 1: return 'ml-0 text-sm font-semibold';
            case 2: return 'ml-4 text-xs font-medium';
            case 3: return 'ml-8 text-xs';
            default: return 'ml-0';
        }
    };

    return (
        <div className="h-full flex flex-col glass-strong rounded-xl p-4 overflow-hidden">
            {/* Breadcrumbs */}
            <div className="mb-6">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium uppercase tracking-wider">
                    Navigation
                </div>
                <nav className="flex items-center space-x-2 text-sm">
                    <Link
                        href="/dashboard"
                        className="text-gray-600 dark:text-gray-400 hover:text-violet-500 dark:hover:text-violet-400 transition-colors"
                    >
                        Dashboard
                    </Link>
                    <span className="text-gray-400 dark:text-gray-600">/</span>
                    {projectId ? (
                        <>
                            <Link
                                href={`/dashboard/projects/${projectId}`}
                                className="text-gray-600 dark:text-gray-400 hover:text-violet-500 dark:hover:text-violet-400 transition-colors truncate max-w-[120px]"
                                title={projectName}
                            >
                                {projectName}
                            </Link>
                            <span className="text-gray-400 dark:text-gray-600">/</span>
                        </>
                    ) : null}
                    <span className="text-gray-800 dark:text-gray-200 font-medium truncate max-w-[120px]" title={documentName}>
                        {documentName}
                    </span>
                </nav>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent mb-6" />

            {/* Page Structure */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                    <div className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider">
                        Page Structure
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-600">
                        {headings.length} {headings.length === 1 ? 'section' : 'sections'}
                    </span>
                </div>

                {/* Document Tree */}
                <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
                        <svg className="w-4 h-4 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            Current Document
                        </span>
                    </div>
                </div>
            </div>

            {/* Document Outline */}
            <div className="flex-1 overflow-hidden flex flex-col">
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-3">
                    Table of Contents
                </div>

                <div className="flex-1 overflow-y-auto space-y-1 pr-2 scrollbar-thin">
                    {headings.length > 0 ? (
                        headings.map((heading, index) => (
                            <motion.button
                                key={heading.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                                onClick={() => onNavigate(heading.id)}
                                className={`
                  ${getIndentClass(heading.level)}
                  w-full text-left px-3 py-2 rounded-lg
                  text-gray-700 dark:text-gray-300
                  hover:bg-white/50 dark:hover:bg-white/5
                  hover:text-violet-600 dark:hover:text-violet-400
                  transition-all duration-200
                  border border-transparent hover:border-violet-500/20
                  group
                `}
                            >
                                <div className="flex items-center gap-2">
                                    {/* Level indicator */}
                                    <div className={`
                    w-1.5 h-1.5 rounded-full
                    ${heading.level === 1 ? 'bg-violet-500' :
                                            heading.level === 2 ? 'bg-blue-500' :
                                                'bg-gray-400'}
                    group-hover:scale-125 transition-transform
                  `} />
                                    <span className="truncate flex-1">{heading.text}</span>
                                </div>
                            </motion.button>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-400 dark:text-gray-600 text-sm">
                            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p>No headings yet</p>
                            <p className="text-xs mt-1">Add headings to see the outline</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="grid grid-cols-2 gap-2">
                    <button className="p-2 text-xs rounded-lg glass hover:bg-white/30 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Section
                    </button>
                    <button className="p-2 text-xs rounded-lg glass hover:bg-white/30 dark:hover:bg-white/5 transition-colors flex items-center justify-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                        Expand All
                    </button>
                </div>
            </div>
        </div>
    );
}
