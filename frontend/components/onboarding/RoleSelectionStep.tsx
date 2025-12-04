'use client';

import { motion } from 'framer-motion';
import { OnboardingData } from '@/app/onboarding/page';

interface RoleSelectionStepProps {
    onNext: () => void;
    onBack: () => void;
    data: OnboardingData;
    updateData: (updates: Partial<OnboardingData>) => void;
}

const roles = [
    {
        id: 'admin',
        title: 'Admin',
        description: 'Manage workspace settings and users',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
        ),
    },
    {
        id: 'manager',
        title: 'Manager',
        description: 'Oversee projects and team progress',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
        ),
    },
    {
        id: 'developer',
        title: 'Developer',
        description: 'Build and contribute to codebases',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
            </svg>
        ),
    },
    {
        id: 'analyst',
        title: 'Analyst',
        description: 'Analyze data and generate reports',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
        ),
    },
    {
        id: 'guest',
        title: 'Guest',
        description: 'View-only access to specific projects',
        icon: (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
        ),
    },
];

export default function RoleSelectionStep({ onNext, onBack, data, updateData }: RoleSelectionStepProps) {
    return (
        <div className="w-full max-w-3xl mx-auto">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold mb-3">Choose Your Role</h2>
                <p className="text-gray-400">How will you be using SecureRealTime?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
                {roles.map((role) => (
                    <motion.button
                        key={role.id}
                        onClick={() => updateData({ role: role.id })}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative p-6 rounded-2xl border text-left transition-all duration-200 group ${data.role === role.id
                                ? 'bg-white/10 border-primary-500 ring-1 ring-primary-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]'
                                : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20'
                            }`}
                    >
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-colors ${data.role === role.id ? 'bg-primary-500 text-white' : 'bg-white/10 text-gray-400 group-hover:text-white'
                            }`}>
                            {role.icon}
                        </div>
                        <h3 className="text-lg font-semibold mb-1">{role.title}</h3>
                        <p className="text-sm text-gray-400 group-hover:text-gray-300">{role.description}</p>

                        {data.role === role.id && (
                            <motion.div
                                layoutId="role-check"
                                className="absolute top-4 right-4 w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center"
                            >
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </motion.div>
                        )}
                    </motion.button>
                ))}
            </div>

            <div className="flex justify-between items-center">
                <button
                    onClick={onBack}
                    className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
                >
                    Back
                </button>
                <div className="flex gap-4">
                    <button
                        onClick={onNext}
                        className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
                    >
                        Skip
                    </button>
                    <button
                        onClick={onNext}
                        disabled={!data.role}
                        className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${data.role
                                ? 'bg-white text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                                : 'bg-white/10 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
}
