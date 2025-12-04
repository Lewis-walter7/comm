'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { TwoFactorSetup } from '@/components/settings/TwoFactorSetup';
import { ChangePasswordModal } from '@/components/settings/ChangePasswordModal';
import api from '../../../services/api';

export default function SecurityPage() {
    const { user } = useAuth();
    const [show2FASetup, setShow2FASetup] = useState(false);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
    const [sessions, setSessions] = useState<any[]>([]);
    const [loadingSessions, setLoadingSessions] = useState(false);

    const fetchSessions = async () => {
        setLoadingSessions(true);
        try {
            const response = await api.get('/auth/sessions');
            setSessions(response.data);
        } catch (error) {
            console.error('Failed to fetch sessions:', error);
        } finally {
            setLoadingSessions(false);
        }
    };

    const handleRevokeSession = async (sessionId: string) => {
        try {
            await api.delete(`/auth/sessions/${sessionId}`);
            setSessions(sessions.filter(s => s.id !== sessionId));
        } catch (error) {
            console.error('Failed to revoke session:', error);
        }
    };

    useEffect(() => {
        if (user) {
            setTwoFactorEnabled(user.twoFactorEnabled || false);
        }
        fetchSessions();
    }, [user]);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Security</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">Manage your account security settings</p>
            </div>

            <div className="space-y-6">
                {/* Two-Factor Authentication */}
                <div className="p-8 rounded-3xl bg-white/60 dark:bg-white/5 backdrop-blur-lg border border-white/20 shadow-lg">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                Two-Factor Authentication
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                Add an extra layer of security to your account.
                            </p>
                        </div>
                        <div>
                            {twoFactorEnabled ? (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200">
                                    ✓ Enabled
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-200">
                                    Not Enabled
                                </span>
                            )}
                        </div>
                    </div>

                    {!twoFactorEnabled && !show2FASetup && (
                        <button
                            onClick={() => setShow2FASetup(true)}
                            className="px-6 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition font-medium"
                        >
                            Enable Two-Factor Authentication
                        </button>
                    )}

                    {twoFactorEnabled && (
                        <div className="flex gap-3">
                            <button className="px-6 py-2.5 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition">
                                Regenerate Recovery Codes
                            </button>
                            <button className="px-6 py-2.5 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-600 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                                Disable 2FA
                            </button>
                        </div>
                    )}

                    {show2FASetup && (
                        <div className="mt-6">
                            <TwoFactorSetup
                                onComplete={() => {
                                    setShow2FASetup(false);
                                    setTwoFactorEnabled(true);
                                }}
                                onCancel={() => setShow2FASetup(false)}
                            />
                        </div>
                    )}
                </div>

                {/* Password */}
                <div className="p-8 rounded-3xl bg-white/60 dark:bg-white/5 backdrop-blur-lg border border-white/20 shadow-lg">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Password
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Change your password to keep your account secure.
                    </p>
                    <button
                        onClick={() => setShowPasswordModal(true)}
                        className="px-6 py-2.5 bg-gray-600 text-white rounded-xl hover:bg-gray-700 transition font-medium"
                    >
                        Change Password
                    </button>
                </div>

                {/* Active Sessions */}
                <div className="p-8 rounded-3xl bg-white/60 dark:bg-white/5 backdrop-blur-lg border border-white/20 shadow-lg">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Active Sessions
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                        Manage and log out of active sessions on other devices.
                    </p>
                    <div className="space-y-4">
                        {/* Current Session */}
                        {sessions.map((session) => (
                            <div key={session.id} className="flex items-center justify-between p-4 rounded-xl bg-white dark:bg-white/10 border border-gray-200 dark:border-white/10">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${session.deviceInfo.includes('Chrome') ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                                        session.deviceInfo.includes('Firefox') ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' :
                                            session.deviceInfo.includes('Safari') ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
                                                'bg-gray-100 dark:bg-gray-900/30 text-gray-600 dark:text-gray-400'
                                        }`}>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {session.deviceInfo || 'Unknown Device'}
                                        </p>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {session.location || 'Unknown Location'} • {new Date(session.lastActive).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {/* We can't easily identify "current" session without ID in token, so just show Revoke for all for now */}
                                    <button
                                        onClick={() => handleRevokeSession(session.id)}
                                        className="text-sm text-red-600 dark:text-red-400 hover:underline"
                                    >
                                        Revoke
                                    </button>
                                </div>
                            </div>
                        ))}

                        {sessions.length === 0 && !loadingSessions && (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                                No active sessions found.
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <ChangePasswordModal
                isOpen={showPasswordModal}
                onClose={() => setShowPasswordModal(false)}
            />
        </div>
    );
}
