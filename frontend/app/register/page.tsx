'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';

export default function RegisterPage() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            setLoading(false);
            return;
        }

        try {
            const response = await api.post('/auth/register', { name, email, password });
            login(response.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create account');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Image/Branding */}
            <div className="hidden lg:block lg:flex-1 relative bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative h-full flex items-center justify-center p-12">
                    <div className="max-w-md text-white">
                        <h1 className="text-4xl font-bold mb-6">
                            Start collaborating securely today
                        </h1>
                        <p className="text-lg text-white/90 mb-8">
                            Create your free account and experience the future of secure team collaboration.
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-white/10 backdrop-blur-sm">
                                        <span className="text-2xl">🚀</span>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-semibold">Quick Setup</h3>
                                    <p className="text-white/80">Get started in less than 2 minutes</p>
                                </div>
                            </div>
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-white/10 backdrop-blur-sm">
                                        <span className="text-2xl">🎯</span>
                                    </div>
                                </div>
                                <div className="ml-4">
                                    <h3 className="text-lg font-semibold">Forever Free</h3>
                                    <p className="text-white/80">No credit card required to start</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Side - Form */}
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
                            Create your account
                        </h2>
                        <p className="mt-2 text-gray-600 dark:text-gray-400">
                            Join thousands of teams collaborating securely
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Full name
                            </label>
                            <input
                                id="name"
                                type="text"
                                required
                                autoComplete="name"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="John Doe"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

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
                                autoComplete="new-password"
                                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="At least 8 characters"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                Must be at least 8 characters
                            </p>
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
                                    Creating account...
                                </span>
                            ) : (
                                'Create account'
                            )}
                        </button>

                        <div className="text-center">
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                Already have an account?{' '}
                                <Link href="/login" className="font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                                    Sign in
                                </Link>
                            </p>
                        </div>

                        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                            By creating an account, you agree to our{' '}
                            <a href="#" className="underline hover:text-gray-700 dark:hover:text-gray-300">
                                Terms of Service
                            </a>{' '}
                            and{' '}
                            <a href="#" className="underline hover:text-gray-700 dark:hover:text-gray-300">
                                Privacy Policy
                            </a>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    );
}
