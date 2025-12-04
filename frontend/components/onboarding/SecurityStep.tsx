'use client';

import { motion } from 'framer-motion';
import { OnboardingData } from '@/app/onboarding/page';

interface SecurityStepProps {
    onNext: () => void;
    onBack: () => void;
    data: OnboardingData;
    updateData: (updates: Partial<OnboardingData>) => void;
}

export default function SecurityStep({ onNext, onBack, data, updateData }: SecurityStepProps) {
    return (
        <div className="w-full max-w-3xl mx-auto">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold mb-3">Secure Your Account</h2>
                <p className="text-gray-400">Add an extra layer of protection to your workspace.</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
                <div className="space-y-6">
                    {/* 2FA Toggle */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center text-green-400">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Two-Factor Authentication</h3>
                                <p className="text-sm text-gray-400">Protect your account with 2FA.</p>
                            </div>
                        </div>
                        <button
                            onClick={() => updateData({ security2FA: !data.security2FA })}
                            className={`w-14 h-8 rounded-full p-1 transition-colors duration-200 ${data.security2FA ? 'bg-green-500' : 'bg-white/20'
                                }`}
                        >
                            <div className={`w-6 h-6 rounded-full bg-white shadow-sm transition-transform duration-200 ${data.security2FA ? 'translate-x-6' : 'translate-x-0'
                                }`} />
                        </button>
                    </div>

                    {/* Email Verification (Mock) */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 opacity-80">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="font-semibold text-lg">Email Verification</h3>
                                <p className="text-sm text-gray-400">Verified as lewis@example.com</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-green-400 bg-green-500/10 px-3 py-1 rounded-full text-sm font-medium">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Verified
                        </div>
                    </div>

                    {/* Recovery Phone (Optional) */}
                    <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h3 className="font-semibold text-lg">Recovery Phone</h3>
                                <input
                                    type="tel"
                                    placeholder="Add phone number (optional)"
                                    className="bg-transparent border-none p-0 text-sm text-white placeholder-gray-500 focus:ring-0 w-full"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center">
                <button
                    onClick={onBack}
                    className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
                >
                    Back
                </button>
                <button
                    onClick={onNext}
                    className="px-8 py-3 bg-white text-black rounded-xl font-semibold hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300"
                >
                    Finish Setup
                </button>
            </div>
        </div>
    );
}
