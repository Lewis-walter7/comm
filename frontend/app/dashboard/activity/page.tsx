'use client';

import { useState, useEffect } from 'react';
import api from '../../../services/api';
import { Activity } from '../../../types';

export default function ActivityPage() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loadingActivities, setLoadingActivities] = useState(false);

    const fetchActivities = async () => {
        setLoadingActivities(true);
        try {
            const response = await api.get('/users/me/activity');
            setActivities(response.data);
        } catch (error) {
            console.error('Failed to fetch activities:', error);
        } finally {
            setLoadingActivities(false);
        }
    };

    useEffect(() => {
        fetchActivities();
    }, []);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Activity Log</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">View your recent actions and security events</p>
            </div>

            <div className="p-8 rounded-3xl bg-white/60 dark:bg-white/5 backdrop-blur-lg border border-white/20 shadow-lg">
                <div className="space-y-4">
                    {activities.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10">
                            <div className="mt-1 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                                {/* Icon based on activity type */}
                                {activity.type === 'USER_LOGIN' ? '🔑' :
                                    activity.type === 'PROJECT_CREATED' ? '📁' :
                                        activity.type === 'DOCUMENT_CREATED' ? '📄' : '📝'}
                            </div>
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {activity.description}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                    {new Date(activity.createdAt).toLocaleString()}
                                </p>
                                {activity.metadata && (
                                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-black/20 p-2 rounded-lg font-mono">
                                        {/* Only show relevant metadata if needed, or format it nicely */}
                                        {/* For now, just showing IP if available for login events */}
                                        {activity.type === 'USER_LOGIN' && activity.metadata?.ipAddress ? `IP: ${activity.metadata.ipAddress}` : ''}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {activities.length === 0 && !loadingActivities && (
                        <div className="text-center py-12">
                            <div className="text-4xl mb-4">📝</div>
                            <p className="text-gray-500 dark:text-gray-400">No recent activity found.</p>
                        </div>
                    )}

                    {loadingActivities && (
                        <div className="text-center py-12">
                            <p className="text-gray-500 dark:text-gray-400">Loading activity log...</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
