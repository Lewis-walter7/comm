'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

export default function TopNavbar() {
    return (
        <div className="sticky top-0 z-20 w-full h-16 px-4 flex items-center justify-between bg-white/70 dark:bg-[#050505]/70 backdrop-blur-xl border-b border-gray-200/50 dark:border-white/5">
            {/* Left: Context/Project Selector */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/5 transition-colors cursor-pointer group">
                <span className="text-lg font-semibold text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    SecureRealTime
                </span>
                <svg className="w-4 h-4 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {/* Center: Upgrade CTA (Hidden on mobile, visible on larger screens) */}
            <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <button className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-indigo-600/90 to-purple-600/90 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-medium rounded-full shadow-lg shadow-indigo-500/20 transition-all hover:shadow-indigo-500/30 hover:scale-105 group">
                    <svg className="w-3.5 h-3.5 text-indigo-200 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                    Upgrade to Pro
                    <span className="ml-1 text-indigo-200 hover:text-white cursor-pointer">×</span>
                </button>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-1">
                <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    <span className="hidden sm:inline">Share</span>
                </button>

                <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <span className="hidden sm:inline">Add people</span>
                </button>

                <button className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
