'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import api from '@/services/api';

interface TwoFactorSetupProps {
    onComplete?: () => void;
    onCancel?: () => void;
}

interface SetupState {
    step: 'password' | 'qr' | 'verify' | 'recovery' | 'complete';
    password: string;
    secret: string;
    qrCodeUrl: string;
    token: string;
    recoveryCodes: string[];
    error: string;
    loading: boolean;
}

export function TwoFactorSetup({ onComplete, onCancel }: TwoFactorSetupProps) {
    const [state, setState] = useState<SetupState>({
        step: 'password',
        password: '',
        secret: '',
        qrCodeUrl: '',
        token: '',
        recoveryCodes: [],
        error: '',
        loading: false,
    });

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setState({ ...state, loading: true, error: '' });

        try {
            const response = await api.post('/auth/2fa/enable', {
                password: state.password,
            });

            setState({
                ...state,
                step: 'qr',
                secret: response.data.secret,
                qrCodeUrl: response.data.qrCodeUrl,
                loading: false,
            });
        } catch (error: any) {
            setState({
                ...state,
                error: error.response?.data?.message || 'Failed to enable 2FA',
                loading: false,
            });
        }
    };

    const handleVerifySubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setState({ ...state, loading: true, error: '' });

        try {
            const response = await api.post('/auth/2fa/verify-setup', {
                token: state.token,
                secret: state.secret,
            });

            setState({
                ...state,
                step: 'recovery',
                recoveryCodes: response.data.recoveryCodes,
                loading: false,
            });
        } catch (error: any) {
            setState({
                ...state,
                error: error.response?.data?.message || 'Invalid verification code',
                loading: false,
            });
        }
    };

    const handleDownloadRecoveryCodes = () => {
        const text = state.recoveryCodes.join('\n');
        const blob = new Blob([text], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'securerealtime-recovery-codes.txt';
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleComplete = () => {
        setState({ ...state, step: 'complete' });
        if (onComplete) {
            onComplete();
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white dark:bg-gray-800 rounded-xl p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Enable Two-Factor Authentication
            </h2>

            {/* Step: Password Confirmation */}
            {state.step === 'password' && (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        To enable two-factor authentication, please confirm your password.
                    </p>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            required
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                            value={state.password}
                            onChange={(e) => setState({ ...state, password: e.target.value })}
                        />
                    </div>

                    {state.error && (
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-lg text-sm">
                            {state.error}
                        </div>
                    )}

                    <div className="flex gap-3 justify-end">
                        {onCancel && (
                            <button
                                type="button"
                                onClick={onCancel}
                                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                            >
                                Cancel
                            </button>
                        )}
                        <button
                            type="submit"
                            disabled={state.loading}
                            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                        >
                            {state.loading ? 'Processing...' : 'Continue'}
                        </button>
                    </div>
                </form>
            )}

            {/* Step: QR Code */}
            {state.step === 'qr' && (
                <div className="space-y-6">
                    <div className="text-center">
                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                            Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
                        </p>

                        <div className="inline-block p-6 bg-white rounded-lg border-2 border-gray-200">
                            <QRCodeSVG value={state.qrCodeUrl} size={200} />
                        </div>

                        <div className="mt-6">
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                Or enter this key manually:
                            </p>
                            <code className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded text-sm font-mono">
                                {state.secret}
                            </code>
                        </div>
                    </div>

                    <button
                        onClick={() => setState({ ...state, step: 'verify' })}
                        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                    >
                        I've Scanned the Code
                    </button>
                </div>
            )}

            {/* Step: Verification */}
            {state.step === 'verify' && (
                <form onSubmit={handleVerifySubmit} className="space-y-4">
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Enter the 6-digit code from your authenticator app to verify setup.
                    </p>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Verification Code
                        </label>
                        <input
                            type="text"
                            required
                            maxLength={6}
                            pattern="[0-9]{6}"
                            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white text-center text-2xl tracking-widest font-mono"
                            value={state.token}
                            onChange={(e) => setState({ ...state, token: e.target.value.replace(/\D/g, '') })}
                            placeholder="000000"
                        />
                    </div>

                    {state.error && (
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-lg text-sm">
                            {state.error}
                        </div>
                    )}

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setState({ ...state, step: 'qr', token: '', error: '' })}
                            className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            disabled={state.loading || state.token.length !== 6}
                            className="flex-1 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                        >
                            {state.loading ? 'Verifying...' : 'Verify'}
                        </button>
                    </div>
                </form>
            )}

            {/* Step: Recovery Codes */}
            {state.step === 'recovery' && (
                <div className="space-y-6">
                    <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                        <div className="flex items-start gap-3">
                            <span className="text-2xl">⚠️</span>
                            <div>
                                <h3 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                                    Save Your Recovery Codes
                                </h3>
                                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                                    Store these recovery codes in a safe place. You can use them to access your account if you lose your
                                    authenticator device. Each code can only be used once.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                        <div className="grid grid-cols-2 gap-3">
                            {state.recoveryCodes.map((code, index) => (
                                <code key={index} className="px-3 py-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700 text-center font-mono text-sm">
                                    {code}
                                </code>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button
                            onClick={handleDownloadRecoveryCodes}
                            className="flex-1 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition font-medium"
                        >
                            Download Codes
                        </button>
                        <button
                            onClick={handleComplete}
                            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                        >
                            I've Saved My Codes
                        </button>
                    </div>
                </div>
            )}

            {/* Step: Complete */}
            {state.step === 'complete' && (
                <div className="text-center space-y-4">
                    <div className="text-6xl">✅</div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        Two-Factor Authentication Enabled!
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400">
                        Your account is now more secure. You'll be asked for a code from your authenticator app when you log in.
                    </p>
                </div>
            )}
        </div>
    );
}
