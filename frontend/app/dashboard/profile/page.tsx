'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { motion } from 'framer-motion';
import api from '../../../services/api';

interface Stats {
    projects: number;
    documents: number;
    teamMembers: number;
}

interface Activity {
    id: string;
    type: string;
    description: string;
    createdAt: string;
}

export default function ProfilePage() {
    const { user } = useAuth();
    const [stats, setStats] = useState<Stats>({ projects: 0, documents: 0, teamMembers: 0 });
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [statsRes, activityRes] = await Promise.all([
                    api.get('/users/me/stats'),
                    api.get('/users/me/activity?limit=4'),
                ]);
                setStats(statsRes.data);
                setActivities(activityRes.data);
            } catch (error) {
                console.error('Error fetching profile data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const formatTimeAgo = (date: string) => {
        const now = new Date();
        const then = new Date(date);
        const diffMs = now.getTime() - then.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) return `${diffMins} minute${diffMins !== 1 ? 's' : ''} ago`;
        if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
        return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    };

    const getActivityIcon = (type: string) => {
        const icons: Record<string, string> = {
            PROJECT_CREATED: '🚀',
            PROJECT_UPDATED: '📝',
            DOCUMENT_CREATED: '📄',
            DOCUMENT_UPDATED: '✏️',
            MEMBER_ADDED: '👋',
            USER_LOGIN: '🔓',
        };
        return icons[type] || '📌';
    };

    return (
        <div className="space-y-8">
            {/* Header / Hero Section */}
            <div className="relative overflow-hidden rounded-3xl bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-purple-500/10 dark:from-primary-500/20 dark:to-purple-500/20" />

                <div className="relative p-8 md:p-12 flex flex-col md:flex-row items-center md:items-end gap-8">
                    {/* Avatar */}
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5 }}
                        className="relative group"
                    >
                        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-primary-400 to-purple-600 p-1 shadow-xl shadow-primary-500/30">
                            {user?.avatarUrl ? (
                                <img
                                    src={user.avatarUrl}
                                    alt={user.name}
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full rounded-full bg-white dark:bg-gray-900 flex items-center justify-center text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-primary-500 to-purple-600">
                                    {user?.name?.charAt(0) || 'U'}
                                </div>
                            )}
                        </div>
                        <div className="absolute bottom-2 right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-gray-900" title="Online" />
                    </motion.div>

                    {/* User Info */}
                    <div className="flex-1 text-center md:text-left space-y-2 mb-2">
                        <motion.h1
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white"
                        >
                            {user?.name}
                        </motion.h1>
                        <motion.p
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-lg text-gray-600 dark:text-gray-300"
                        >
                            {user?.email}
                        </motion.p>
                        <motion.div
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="flex items-center justify-center md:justify-start gap-3 pt-2"
                        >
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700 dark:bg-primary-500/20 dark:text-primary-300 border border-primary-200 dark:border-primary-500/30">
                                Pro Plan
                            </span>
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30">
                                Admin
                            </span>
                        </motion.div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <a href="/dashboard/settings" className="px-6 py-2.5 rounded-xl bg-white dark:bg-white/10 text-gray-700 dark:text-white font-medium hover:bg-gray-50 dark:hover:bg-white/20 transition-colors border border-gray-200 dark:border-white/10 shadow-sm">
                            Edit Profile
                        </a>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Projects', value: stats.projects },
                    { label: 'Documents', value: stats.documents },
                    { label: 'Team Members', value: stats.teamMembers },
                ].map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 + index * 0.1 }}
                        className="p-6 rounded-2xl bg-white/60 dark:bg-white/5 backdrop-blur-lg border border-white/20 shadow-lg hover:shadow-xl transition-shadow"
                    >
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{stat.label}</p>
                        <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">
                            {loading ? '...' : stat.value}
                        </p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* About Section */}
                <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="lg:col-span-2 space-y-6"
                >
                    <div className="p-8 rounded-3xl bg-white/60 dark:bg-white/5 backdrop-blur-lg border border-white/20 shadow-lg">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">About</h2>
                        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                            {user?.bio || 'No bio added yet. Click "Edit Profile" to add one!'}
                        </p>

                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Contact Information</h3>
                                <ul className="space-y-3">
                                    <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                        {user?.email}
                                    </li>
                                    {user?.phone && (
                                        <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            {user.phone}
                                        </li>
                                    )}
                                    {user?.location && (
                                        <li className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            {user.location}
                                        </li>
                                    )}
                                </ul>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="space-y-6"
                >
                    <div className="p-6 rounded-3xl bg-white/60 dark:bg-white/5 backdrop-blur-lg border border-white/20 shadow-lg h-full">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Activity</h2>
                        {loading ? (
                            <p className="text-gray-500 dark:text-gray-400">Loading activity...</p>
                        ) : activities.length === 0 ? (
                            <p className="text-gray-500 dark:text-gray-400">No recent activity</p>
                        ) : (
                            <div className="space-y-6">
                                {activities.map((activity, index) => (
                                    <div key={activity.id} className="relative pl-6 pb-6 last:pb-0 border-l border-gray-200 dark:border-white/10 last:border-0">
                                        <div className="absolute left-0 top-0 -translate-x-1/2 w-3 h-3 rounded-full bg-primary-500 ring-4 ring-white dark:ring-[#1a1a1a]" />
                                        <div className="flex flex-col gap-1">
                                            <p className="text-sm text-gray-900 dark:text-white font-medium">
                                                {getActivityIcon(activity.type)} {activity.description}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {formatTimeAgo(activity.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
