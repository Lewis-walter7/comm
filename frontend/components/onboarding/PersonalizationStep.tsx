'use client';

import { motion } from 'framer-motion';
import { OnboardingData } from '@/app/onboarding/page';

interface PersonalizationStepProps {
    onNext: () => void;
    onBack: () => void;
    data: OnboardingData;
    updateData: (updates: Partial<OnboardingData>) => void;
}

const themes = [
    { id: 'default', color: '#3b82f6', name: 'Default Blue' },
    { id: 'purple', color: '#8b5cf6', name: 'Neon Purple' },
    { id: 'green', color: '#10b981', name: 'Emerald' },
    { id: 'orange', color: '#f59e0b', name: 'Amber' },
    { id: 'monochrome', color: '#737373', name: 'Monochrome' },
];

const avatars = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Zack',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Sara',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Milo',
];

export default function PersonalizationStep({ onNext, onBack, data, updateData }: PersonalizationStepProps) {
    return (
        <div className="w-full max-w-3xl mx-auto">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold mb-3">Make It Yours</h2>
                <p className="text-gray-400">Customize your workspace experience.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                {/* Theme Selection */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold mb-4">Color Theme</h3>
                    <div className="flex flex-wrap gap-4">
                        {themes.map((theme) => (
                            <button
                                key={theme.id}
                                onClick={() => updateData({ theme: theme.id })}
                                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${data.theme === theme.id ? 'ring-2 ring-white ring-offset-2 ring-offset-black scale-110' : 'hover:scale-105 opacity-70 hover:opacity-100'
                                    }`}
                                style={{ backgroundColor: theme.color }}
                                title={theme.name}
                            >
                                {data.theme === theme.id && (
                                    <svg className="w-5 h-5 text-white drop-shadow-md" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Avatar Selection */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold mb-4">Choose Avatar</h3>
                    <div className="flex flex-wrap gap-3">
                        {avatars.map((avatar, index) => (
                            <button
                                key={index}
                                onClick={() => updateData({ avatar })}
                                className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all duration-200 ${data.avatar === avatar ? 'border-primary-500 scale-110' : 'border-transparent hover:border-white/30'
                                    }`}
                            >
                                <img src={avatar} alt="Avatar" className="w-full h-full object-cover bg-white/10" />
                            </button>
                        ))}
                        <button className="w-12 h-12 rounded-full border-2 border-dashed border-white/20 flex items-center justify-center hover:border-white/50 hover:bg-white/5 transition-all">
                            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Preferences */}
                <div className="md:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
                    <h3 className="text-lg font-semibold mb-4">Preferences</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-medium">Notifications</p>
                                    <p className="text-sm text-gray-400">Get updates about project activity</p>
                                </div>
                            </div>
                            <button
                                onClick={() => updateData({ notifications: !data.notifications })}
                                className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${data.notifications ? 'bg-primary-500' : 'bg-white/20'
                                    }`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${data.notifications ? 'translate-x-6' : 'translate-x-0'
                                    }`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                </div>
                                <div>
                                    <p className="font-medium">Compact Mode</p>
                                    <p className="text-sm text-gray-400">Denser layout for more content</p>
                                </div>
                            </div>
                            <button
                                onClick={() => updateData({ compactMode: !data.compactMode })}
                                className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 ${data.compactMode ? 'bg-primary-500' : 'bg-white/20'
                                    }`}
                            >
                                <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${data.compactMode ? 'translate-x-6' : 'translate-x-0'
                                    }`} />
                            </button>
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
                    Continue
                </button>
            </div>
        </div>
    );
}
