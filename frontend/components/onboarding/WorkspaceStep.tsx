'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { OnboardingData } from '@/app/onboarding/page';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useState } from 'react';

interface WorkspaceStepProps {
    onNext: () => void;
    onBack: () => void;
    data: OnboardingData;
    updateData: (updates: Partial<OnboardingData>) => void;
}

export default function WorkspaceStep({ onNext, onBack, data, updateData }: WorkspaceStepProps) {
    const { verifyInviteCode } = useWorkspace();
    const [verifying, setVerifying] = useState(false);
    const [verificationStatus, setVerificationStatus] = useState<'idle' | 'valid' | 'invalid'>('idle');
    const [verifiedWorkspaceName, setVerifiedWorkspaceName] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleVerify = async () => {
        if (!data.workspaceCode) return;

        setVerifying(true);
        setError(null);
        setVerificationStatus('idle');

        try {
            const workspace = await verifyInviteCode(data.workspaceCode);
            setVerifiedWorkspaceName(workspace.name);
            setVerificationStatus('valid');
        } catch (err) {
            setVerificationStatus('invalid');
            setError('Invalid invite code. Please check and try again.');
            setVerifiedWorkspaceName(null);
        } finally {
            setVerifying(false);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto">
            <div className="text-center mb-10">
                <h2 className="text-3xl font-bold mb-3">Set Up Your Workspace</h2>
                <p className="text-gray-400">Create a new space for your team or join an existing one.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* Create Workspace Card */}
                <motion.div
                    onClick={() => updateData({ workspaceMode: 'create' })}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-8 rounded-2xl border cursor-pointer transition-all duration-200 ${data.workspaceMode === 'create'
                        ? 'bg-white/10 border-primary-500 ring-1 ring-primary-500 shadow-[0_0_30px_rgba(59,130,246,0.2)]'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                >
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary-500 to-blue-600 flex items-center justify-center mb-6 shadow-lg shadow-primary-500/20">
                        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Create New Workspace</h3>
                    <p className="text-gray-400 text-sm">Start fresh with a new team and projects.</p>
                </motion.div>

                {/* Join Workspace Card */}
                <motion.div
                    onClick={() => updateData({ workspaceMode: 'join' })}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-8 rounded-2xl border cursor-pointer transition-all duration-200 ${data.workspaceMode === 'join'
                        ? 'bg-white/10 border-purple-500 ring-1 ring-purple-500 shadow-[0_0_30px_rgba(168,85,247,0.2)]'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                >
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20">
                        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Join Existing Workspace</h3>
                    <p className="text-gray-400 text-sm">Enter a code to join your team.</p>
                </motion.div>
            </div>

            <motion.div
                initial={false}
                animate={{ height: data.workspaceMode ? 'auto' : 0, opacity: data.workspaceMode ? 1 : 0 }}
                className="overflow-hidden"
            >
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
                    {data.workspaceMode === 'create' ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Workspace Name</label>
                                <input
                                    type="text"
                                    value={data.workspaceName || ''}
                                    onChange={(e) => updateData({ workspaceName: e.target.value })}
                                    placeholder="e.g., Acme Corp Engineering"
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-2">Description (Optional)</label>
                                <textarea
                                    rows={3}
                                    placeholder="Briefly describe your workspace..."
                                    className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all resize-none"
                                />
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-2">Workspace Code</label>
                            <div className="flex gap-3 mb-2">
                                <input
                                    type="text"
                                    value={data.workspaceCode || ''}
                                    onChange={(e) => {
                                        updateData({ workspaceCode: e.target.value });
                                        setVerificationStatus('idle');
                                        setError(null);
                                    }}
                                    placeholder="e.g., WK-8392-XJ"
                                    className={`flex-1 bg-black/20 border rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-1 transition-all font-mono tracking-wider uppercase ${verificationStatus === 'valid'
                                            ? 'border-green-500/50 focus:border-green-500 focus:ring-green-500'
                                            : verificationStatus === 'invalid'
                                                ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500'
                                                : 'border-white/10 focus:border-purple-500 focus:ring-purple-500'
                                        }`}
                                />
                                <button
                                    onClick={handleVerify}
                                    disabled={!data.workspaceCode || verifying}
                                    className="px-6 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium transition-colors min-w-[100px] flex items-center justify-center"
                                >
                                    {verifying ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        'Verify'
                                    )}
                                </button>
                            </div>

                            <AnimatePresence mode="wait">
                                {verificationStatus === 'valid' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 p-3 rounded-lg border border-green-500/20"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Valid code! You'll be joining <strong>{verifiedWorkspaceName}</strong></span>
                                    </motion.div>
                                )}
                                {verificationStatus === 'invalid' && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>{error}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </motion.div>

            <div className="flex justify-between items-center">
                <button
                    onClick={onBack}
                    className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
                >
                    Back
                </button>
                <button
                    onClick={onNext}
                    disabled={!data.workspaceMode || (data.workspaceMode === 'create' && !data.workspaceName) || (data.workspaceMode === 'join' && !data.workspaceCode)}
                    className={`px-8 py-3 rounded-xl font-semibold transition-all duration-300 ${!data.workspaceMode || (data.workspaceMode === 'create' && !data.workspaceName) || (data.workspaceMode === 'join' && !data.workspaceCode)
                        ? 'bg-white/10 text-gray-500 cursor-not-allowed'
                        : 'bg-white text-black hover:shadow-[0_0_20px_rgba(255,255,255,0.3)]'
                        }`}
                >
                    Continue
                </button>
            </div>
        </div>
    );
}
