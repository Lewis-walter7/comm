'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { BackgroundScene } from '@/components/background';
import TopNavbar from '@/components/dashboard/TopNavbar';
import api from '../../services/api';

interface Workspace {
    id: string;
    name: string;
    description?: string;
    _count?: {
        members: number;
        projects: number;
    };
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
    const { user, logout } = useAuth();
    const pathname = usePathname();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [loadingWorkspaces, setLoadingWorkspaces] = useState(true);

    useEffect(() => {
        fetchWorkspaces();
    }, []);

    const fetchWorkspaces = async () => {
        try {
            const response = await api.get('/workspaces');
            setWorkspaces(response.data);
        } catch (error) {
            console.error('Failed to fetch workspaces:', error);
        } finally {
            setLoadingWorkspaces(false);
        }
    };

    const isActive = (path: string) => pathname === path;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#050505] text-gray-900 dark:text-gray-100 font-sans selection:bg-primary-500/30">
            {/* 3D Background Scene */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <BackgroundScene
                    opacity={0.3}
                    intensity={0.5}
                    speed={0.5}
                    particleCount={100}
                    networkNodes={4}
                    enableParallax={true}
                />
            </div>

            {/* Glass Sidebar */}
            <div className="fixed inset-y-0 left-0 w-72 bg-white/70 dark:bg-black/40 backdrop-blur-xl border-r border-gray-200/50 dark:border-white/5 z-20 shadow-2xl shadow-black/5">
                <div className="flex flex-col h-full">
                    {/* Logo - Fixed at top */}
                    <div className="flex-shrink-0 p-6 pb-4">
                        <div className="flex items-center gap-3 px-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
                                <span className="text-white font-bold text-lg">S</span>
                            </div>
                            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                                SecureRealTime
                            </h1>
                        </div>
                    </div>

                    {/* Scrollable Navigation + Workspaces */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar px-6">
                        {/* Navigation */}
                        <nav className="space-y-2 mb-6">
                            <Link
                                href="/dashboard"
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive('/dashboard')
                                    ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium shadow-sm border border-primary-500/10'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                <svg className={`w-5 h-5 ${isActive('/dashboard') ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                                Projects
                            </Link>

                            <Link
                                href="/dashboard/documents"
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive('/dashboard/documents')
                                    ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium shadow-sm border border-primary-500/10'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                <svg className={`w-5 h-5 ${isActive('/dashboard/documents') ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Documents
                            </Link>

                            <Link
                                href="/dashboard/files"
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive('/dashboard/files')
                                    ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium shadow-sm border border-primary-500/10'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                <svg className={`w-5 h-5 ${isActive('/dashboard/files') ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                                </svg>
                                Files
                            </Link>

                            <Link
                                href="/dashboard/chat"
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive('/dashboard/chat')
                                    ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium shadow-sm border border-primary-500/10'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                <svg className={`w-5 h-5 ${isActive('/dashboard/chat') ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                Chat
                            </Link>

                            <Link
                                href="/dashboard/security"
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive('/dashboard/security')
                                    ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium shadow-sm border border-primary-500/10'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                <svg className={`w-5 h-5 ${isActive('/dashboard/security') ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                Security
                            </Link>

                            <Link
                                href="/dashboard/activity"
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive('/dashboard/activity')
                                    ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium shadow-sm border border-primary-500/10'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100/50 dark:hover:bg-white/5 hover:text-gray-900 dark:hover:text-white'
                                    }`}
                            >
                                <svg className={`w-5 h-5 ${isActive('/dashboard/activity') ? 'text-primary-500' : 'text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Activity
                            </Link>
                        </nav>

                        {/* Workspaces Section */}
                        <div className="border-t border-gray-200/50 dark:border-white/5 pt-6 pb-6">
                            <div className="flex items-center justify-between px-2 mb-3">
                                <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Workspaces
                                </h3>
                            </div>
                            <div className="space-y-1">
                                {loadingWorkspaces ? (
                                    <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                                        Loading...
                                    </div>
                                ) : workspaces.length === 0 ? (
                                    <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
                                        No workspaces
                                    </div>
                                ) : (
                                    workspaces.map((workspace) => (
                                        <Link
                                            key={workspace.id}
                                            href={`/dashboard/workspaces/${workspace.id}`}
                                            className="block px-3 py-2 rounded-lg hover:bg-gray-100/50 dark:hover:bg-white/5 transition-colors group"
                                        >
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded bg-primary-100 dark:bg-primary-500/10 flex items-center justify-center flex-shrink-0">
                                                    <span className="text-xs font-bold text-primary-600 dark:text-primary-400">
                                                        {workspace.name.charAt(0)}
                                                    </span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                                        {workspace.name}
                                                    </p>
                                                    {workspace._count && (
                                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                                            {workspace._count.members} members · {workspace._count.projects} projects
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* User Profile & Menu - Fixed at bottom */}
                    <div className="flex-shrink-0 p-6 pt-4 border-t border-gray-200/50 dark:border-white/5 relative">
                        <AnimatePresence>
                            {showUserMenu && (
                                <>
                                    <div
                                        className="fixed inset-0 z-30"
                                        onClick={() => setShowUserMenu(false)}
                                    />
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute bottom-full left-0 w-full mb-4 bg-white/90 dark:bg-[#1a1a1a]/90 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-white/10 shadow-2xl overflow-hidden z-40"
                                    >
                                        <div className="p-2 space-y-1">
                                            <Link href="/dashboard/profile" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors">
                                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                My Profile
                                            </Link>
                                            <Link href="/dashboard/settings" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors">
                                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                Settings
                                            </Link>
                                            <Link href="/dashboard/personalization" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors">
                                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                                                </svg>
                                                Personalization
                                            </Link>
                                            <div className="h-px bg-gray-200/50 dark:bg-white/10 my-1" />
                                            <Link href="/dashboard/upgrade" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-xl transition-colors font-medium">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                                </svg>
                                                Upgrade Plan
                                            </Link>
                                            <Link href="/help" onClick={() => setShowUserMenu(false)} className="flex items-center gap-3 px-3 py-2.5 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl transition-colors">
                                                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Help & Support
                                            </Link>
                                            <div className="h-px bg-gray-200/50 dark:bg-white/10 my-1" />
                                            <button
                                                onClick={logout}
                                                className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                            >
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                                Logout
                                            </button>
                                        </div>
                                    </motion.div>
                                </>
                            )}
                        </AnimatePresence>

                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="w-full flex items-center cursor-pointer gap-3 p-3 rounded-xl bg-gray-50/50 dark:bg-white/5 border border-gray-200/50 dark:border-white/5 backdrop-blur-sm hover:bg-white/80 dark:hover:bg-white/10 transition-all duration-200 group"
                        >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center text-sm font-bold text-gray-600 dark:text-gray-300 border border-white/10 group-hover:scale-105 transition-transform">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {user?.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {user?.email}
                                </p>
                            </div>
                            <svg
                                className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${showUserMenu ? 'rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="ml-72 relative z-10 flex flex-col min-h-screen">
                <TopNavbar />
                <main className="flex-1 p-8 max-w-7xl mx-auto w-full">{children}</main>
            </div>
        </div>
    );
}
