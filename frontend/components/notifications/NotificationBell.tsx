'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/services/api';

interface Notification {
    id: string;
    type: string;
    title: string;
    message: string;
    link?: string;
    read: boolean;
    createdAt: string;
}

export function NotificationBell() {
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchUnreadCount();

        // TODO: Set up Socket.IO listener for real-time notifications
        // socket.on('notification:new', handleNewNotification);
        // socket.on('notification:unread-count', (data) => setUnreadCount(data.count));
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const response = await api.get('/notifications/unread-count');
            setUnreadCount(response.data.count);
        } catch (error) {
            console.error('Failed to fetch unread count', error);
        }
    };

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const response = await api.get('/notifications?limit=5');
            setNotifications(response.data.notifications);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleDropdown = () => {
        if (!showDropdown) {
            fetchNotifications();
        }
        setShowDropdown(!showDropdown);
    };

    const handleMarkAsRead = async (id: string) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
            setUnreadCount(Math.max(0, unreadCount - 1));
        } catch (error) {
            console.error('Failed to mark as read', error);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={handleToggleDropdown}
                className="relative p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                aria-label="Notifications"
            >
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full">
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                )}
            </button>

            {showDropdown && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50">
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                Notifications
                            </h3>
                            <Link
                                href="/dashboard/notifications"
                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                onClick={() => setShowDropdown(false)}
                            >
                                View all
                            </Link>
                        </div>
                    </div>

                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="p-8 text-center">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                No notifications
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                                        }`}
                                    onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                                >
                                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                                        {notification.title}
                                    </h4>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                        {notification.message}
                                    </p>
                                    <span className="text-xs text-gray-500 dark:text-gray-500">
                                        {new Date(notification.createdAt).toLocaleString()}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {showDropdown && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowDropdown(false)}
                />
            )}
        </div>
    );
}
