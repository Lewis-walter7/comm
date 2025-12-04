'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { OnboardingData } from '@/app/onboarding/page';

interface InviteMembersStepProps {
    onNext: () => void;
    onBack: () => void;
    data: OnboardingData;
    updateData: (updates: Partial<OnboardingData>) => void;
}

export default function InviteMembersStep({ onNext, onBack, data, updateData }: InviteMembersStepProps) {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');

    const handleAddMember = (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) return;

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setError('Please enter a valid email address');
            return;
        }

        if (data.invitedMembers.includes(email)) {
            setError('This email has already been invited');
            return;
        }

        updateData({ invitedMembers: [...data.invitedMembers, email] });
        setEmail('');
        setError('');
    };

    const removeMember = (emailToRemove: string) => {
        updateData({
            invitedMembers: data.invitedMembers.filter((m) => m !== emailToRemove),
        });
    };

    return (
        <div className="w-full max-w-3xl mx-auto">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold mb-3">Invite Your Team</h2>
                <p className="text-gray-400">Collaboration is better with others. Invite them now.</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 mb-8">
                <form onSubmit={handleAddMember} className="mb-6">
                    <label className="block text-sm font-medium text-gray-400 mb-2">Email Address</label>
                    <div className="flex gap-3">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                setError('');
                            }}
                            placeholder="colleague@company.com"
                            className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                        />
                        <button
                            type="submit"
                            disabled={!email}
                            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Add
                        </button>
                    </div>
                    {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
                </form>

                <div className="space-y-3">
                    <AnimatePresence>
                        {data.invitedMembers.length === 0 && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center text-gray-500 py-4 italic"
                            >
                                No invitations sent yet.
                            </motion.p>
                        )}
                        {data.invitedMembers.map((member) => (
                            <motion.div
                                key={member}
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center text-xs font-bold">
                                        {member.charAt(0).toUpperCase()}
                                    </div>
                                    <span className="text-gray-200">{member}</span>
                                </div>
                                <button
                                    onClick={() => removeMember(member)}
                                    className="text-gray-500 hover:text-red-400 transition-colors p-2"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
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
                        Skip for now
                    </button>
                    <button
                        onClick={onNext}
                        className="px-8 py-3 bg-white text-black rounded-xl font-semibold hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300"
                    >
                        Continue
                    </button>
                </div>
            </div>
        </div>
    );
}
