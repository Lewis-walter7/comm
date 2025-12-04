'use client';

import { motion } from 'framer-motion';
import { OnboardingData } from '@/app/onboarding/page';

interface AccountTypeStepProps {
    onNext: () => void;
    onBack: () => void;
    data: OnboardingData;
    updateData: (updates: Partial<OnboardingData>) => void;
}

export default function AccountTypeStep({ onNext, onBack, data, updateData }: AccountTypeStepProps) {
    return (
        <div className="w-full max-w-3xl mx-auto">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold mb-3">How will you use SecureRealTime?</h2>
                <p className="text-gray-400">Choose the account type that best fits your needs.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                {/* Personal Account */}
                <motion.div
                    onClick={() => updateData({ accountType: 'personal' })}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-8 rounded-2xl border cursor-pointer transition-all duration-200 ${data.accountType === 'personal'
                            ? 'bg-white/10 border-primary-500 ring-1 ring-primary-500 shadow-[0_0_30px_rgba(59,130,246,0.2)]'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                >
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20">
                        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Personal</h3>
                    <p className="text-gray-400 text-sm mb-4">For freelancers, students, and individual developers.</p>
                    <ul className="space-y-2 text-sm text-gray-300">
                        <li className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Free forever
                        </li>
                        <li className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Up to 3 projects
                        </li>
                    </ul>
                </motion.div>

                {/* Team Account */}
                <motion.div
                    onClick={() => updateData({ accountType: 'team' })}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-8 rounded-2xl border cursor-pointer transition-all duration-200 ${data.accountType === 'team'
                            ? 'bg-white/10 border-purple-500 ring-1 ring-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.2)]'
                            : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                >
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20">
                        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Team</h3>
                    <p className="text-gray-400 text-sm mb-4">For startups, agencies, and growing companies.</p>
                    <ul className="space-y-2 text-sm text-gray-300">
                        <li className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Unlimited projects
                        </li>
                        <li className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Advanced collaboration
                        </li>
                    </ul>
                </motion.div>
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
                    disabled={!data.accountType}
                    className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${data.accountType
                            ? 'bg-white text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                            : 'bg-white/10 text-gray-500 cursor-not-allowed'
                        }`}
                >
                    Continue
                </button>
            </div>
        </div>
    );
}
