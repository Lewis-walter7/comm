'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [twoFactorToken, setTwoFactorToken] = useState('');
    const [showTwoFactor, setShowTwoFactor] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/login', { email, password });

            // Check if 2FA is required
            if (response.data.requiresTwoFactor) {
                setShowTwoFactor(true);
                setLoading(false);
                return;
            }

            login(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    const handle2FASubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await api.post('/auth/login/2fa', {
                email,
                password,
                token: twoFactorToken,
            });
            login(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid verification code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Form */}
            <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-20 xl:px-24 bg-white dark:bg-gray-900">
                <div className="w-full max-w-sm">
                    <div className="mb-10">
                        <Link href="/" className="flex items-center space-x-2 mb-8">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                                <span className="text-white font-bold text-xl">S</span>
                            </div>
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                SecureRealTime
                            </span>
                        </Link>
                        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                            Welcome back
                        </h2>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Sign in to your account to continue
                        </p>
                    </div>


                    {!showTwoFactor ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Email address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    autoComplete="email"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="name@company.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    required
                                    autoComplete="current-password"
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>

                            {error && (
                                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Signing in...
                                    </span>
                                ) : (
                                    'Sign in'
                                )}
                            </button>

                            <div className="text-center">
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Don't have an account?{' '}
                                    <Link href="/register" className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                        Create account
                                    </Link>
                                </p>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handle2FASubmit} className="space-y-6">
                            <div className="mb-6">
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                                    Two-Factor Authentication
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Enter the 6-digit code from your authenticator app or use a recovery code.
                                </p>
                            </div>

                            <div>
                                <label htmlFor="token" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Verification Code
                                </label>
                                <input
                                    id="token"
                                    type="text"
                                    required
                                    maxLength={8}
                                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center text-2xl tracking-widest font-mono"
                                    placeholder="000000"
                                    value={twoFactorToken}
                                    onChange={(e) => setTwoFactorToken(e.target.value.toUpperCase())}
                                />
                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    Enter 6-digit code or 8-character recovery code
                                </p>
                            </div>

                            {error && (
                                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                                </div>
                            )}

                            <div className="space-y-3">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Verifying...
                                        </span>
                                    ) : (
                                        'Verify and Sign In'
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowTwoFactor(false);
                                        setTwoFactorToken('');
                                        setError('');
                                    }}
                                    className="w-full py-2 px-4 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition"
                                >
                                    Back to Login
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* Right Side - Image/Branding */}
            <div className="hidden lg:block lg:flex-1 relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative h-full flex items-center justify-center p-12">
                    <div className="max-w-md text-white">
                        <h1 className="text-4xl font-bold mb-6">
                            Secure collaboration made simple
                        </h1>
                        <p className="text-lg text-white/90 mb-8">
                            Join thousands of teams using SecureRealTime for encrypted, real-time collaboration.
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-white/10 backdrop-blur-sm">
                                        <span className="text-2xl">🔒</span>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-semibold">End-to-End Encrypted</h3>
                                    <p className="text-white/80">Your data is protected with military-grade encryption</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-white/10 backdrop-blur-sm">
                                        <span className="text-2xl">⚡</span>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-semibold">Real-Time Sync</h3>
                                    <p className="text-white/80">Collaborate seamlessly with instant updates</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
