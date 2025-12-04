'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { OnboardingData } from '@/app/onboarding/page';
import { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { useWorkspace } from '@/context/WorkspaceContext';
import { useAuth } from '@/context/AuthContext';

interface CompletionStepProps {
    data: OnboardingData;
}

export default function CompletionStep({ data }: CompletionStepProps) {
    const [mounted, setMounted] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const { createWorkspace, joinWorkspace } = useWorkspace();
    const { completeOnboarding } = useAuth();
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
        // Trigger confetti
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);

        return () => clearInterval(interval);
    }, []);

    const handleEnterWorkspace = async () => {
        try {
            setIsCreating(true);

            // Create workspace if needed
            if (data.workspaceMode === 'create' && data.workspaceName) {
                await createWorkspace(data.workspaceName, data.accountType === 'team' ? 'Team Workspace' : 'Personal Workspace');
                await completeOnboarding();
            } else if (data.workspaceMode === 'join' && data.workspaceCode) {
                const result = await joinWorkspace(data.workspaceCode);
                await completeOnboarding();

                if (result.status === 'pending') {
                    // Show pending message and redirect to dashboard
                    // The dashboard will show the pending state
                    router.push('/dashboard');
                    return;
                }
            } else {
                // Just complete onboarding
                await completeOnboarding();
            }
        } catch (error) {
            console.error('Failed to complete onboarding:', error);
            setIsCreating(false);
            // Handle error (maybe show toast)
        }
    };

    return (
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
                className="w-24 h-24 rounded-full bg-green-500 flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(34,197,94,0.4)]"
            >
                <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
            </motion.div>

            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-4xl md:text-5xl font-bold text-white mb-6"
            >
                You're All Set!
            </motion.h1>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 w-full max-w-md mb-10 text-left"
            >
                <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-4">Summary</h3>
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-300">Account Type</span>
                        <span className="font-semibold capitalize">{data.accountType}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-300">Role</span>
                        <span className="font-semibold capitalize">{data.role}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-300">Workspace</span>
                        <span className="font-semibold">{data.workspaceMode === 'create' ? data.workspaceName : 'Joined via Code'}</span>
                    </div>
                    {data.accountType === 'team' && (
                        <div className="flex justify-between items-center">
                            <span className="text-gray-300">Team Members</span>
                            <span className="font-semibold">{data.invitedMembers.length} Invited</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center">
                        <span className="text-gray-300">Theme</span>
                        <div className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: data.theme === 'default' ? '#3b82f6' : data.theme === 'purple' ? '#8b5cf6' : data.theme === 'green' ? '#10b981' : data.theme === 'orange' ? '#f59e0b' : '#737373' }}
                            />
                            <span className="font-semibold capitalize">{data.theme}</span>
                        </div>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-300">Security</span>
                        <span className={`font-semibold ${data.security2FA ? 'text-green-400' : 'text-gray-400'}`}>
                            {data.security2FA ? '2FA Enabled' : 'Standard'}
                        </span>
                    </div>
                </div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
            >
                <button
                    onClick={handleEnterWorkspace}
                    disabled={isCreating}
                    className="group relative px-10 py-4 bg-white text-black rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_rgba(255,255,255,0.5)] transition-all duration-300 inline-flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isCreating ? 'Creating Workspace...' : 'Enter Workspace'}
                    {!isCreating && (
                        <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                    )}
                </button>
            </motion.div>
        </div>
    );
}
