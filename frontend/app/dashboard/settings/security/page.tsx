'use client';

import { useState } from 'react';
import ProtectedRoute from '@/components/ProtectedRoute';
import { TwoFactorSetup } from '@/components/settings/TwoFactorSetup';

export default function SecuritySettingsPage() {
    const [show2FASetup, setShow2FASetup] = useState(false);
    const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

    return (
        <ProtectedRoute>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
                    Security Settings
                </h1>

                {/* Two-Factor Authentication Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                Two-Factor Authentication
                            </h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                Add an extra layer of security to your account by requiring a verification code when you sign in.
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
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                            Enable Two-Factor Authentication
                        </button>
                    )}

                    {twoFactorEnabled && (
                        <div className="space-y-3">
                            <button
                                className="px-6 py-2 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                            >
                                Regenerate Recovery Codes
                            </button>
                            <button
                                className="ml-3 px-6 py-2 text-red-600 dark:text-red-400 border border-red-300 dark:border-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                            >
                                Disable 2FA
                            </button>
                        </div>
                    )}
                </div>

                {/* 2FA Setup Modal/Section */}
                {show2FASetup && (
                    <TwoFactorSetup
                        onComplete={() => {
                            setShow2FASetup(false);
                            setTwoFactorEnabled(true);
                        }}
                        onCancel={() => setShow2FASetup(false)}
                    />
                )}

                {/* Additional Security Settings */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                        Password
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Change your password to keep your account secure.
                    </p>
                    <button className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium">
                        Change Password
                    </button>
                </div>
            </div>
        </ProtectedRoute>
    );
}
