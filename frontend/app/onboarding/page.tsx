'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import WelcomeStep from '@/components/onboarding/WelcomeStep';
import RoleSelectionStep from '@/components/onboarding/RoleSelectionStep';
import WorkspaceStep from '@/components/onboarding/WorkspaceStep';
import PersonalizationStep from '@/components/onboarding/PersonalizationStep';
import SecurityStep from '@/components/onboarding/SecurityStep';
import CompletionStep from '@/components/onboarding/CompletionStep';

import AccountTypeStep from '@/components/onboarding/AccountTypeStep';
import InviteMembersStep from '@/components/onboarding/InviteMembersStep';

export type OnboardingData = {
    accountType: 'personal' | 'team' | null;
    role: string | null;
    workspaceMode: 'create' | 'join' | null;
    workspaceName?: string;
    workspaceCode?: string;
    invitedMembers: string[];
    theme: string;
    avatar: string | null;
    notifications: boolean;
    compactMode: boolean;
    security2FA: boolean;
};

export default function OnboardingPage() {
    const [step, setStep] = useState(1);
    const [data, setData] = useState<OnboardingData>({
        accountType: null,
        role: null,
        workspaceMode: null,
        invitedMembers: [],
        theme: 'default',
        avatar: null,
        notifications: true,
        compactMode: false,
        security2FA: false,
    });

    const updateData = (updates: Partial<OnboardingData>) => {
        setData((prev) => ({ ...prev, ...updates }));
    };

    const nextStep = () => {
        setStep((prev) => {
            // Skip Invite Members step if Account Type is Personal
            if (prev === 4 && data.accountType === 'personal') {
                return 6;
            }
            return prev + 1;
        });
    };

    const prevStep = () => {
        setStep((prev) => {
            // Skip Invite Members step if Account Type is Personal
            if (prev === 6 && data.accountType === 'personal') {
                return 4;
            }
            return Math.max(1, prev - 1);
        });
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return <WelcomeStep onNext={nextStep} />;
            case 2:
                return <AccountTypeStep onNext={nextStep} onBack={prevStep} data={data} updateData={updateData} />;
            case 3:
                return <RoleSelectionStep onNext={nextStep} onBack={prevStep} data={data} updateData={updateData} />;
            case 4:
                return <WorkspaceStep onNext={nextStep} onBack={prevStep} data={data} updateData={updateData} />;
            case 5:
                return <InviteMembersStep onNext={nextStep} onBack={prevStep} data={data} updateData={updateData} />;
            case 6:
                return <PersonalizationStep onNext={nextStep} onBack={prevStep} data={data} updateData={updateData} />;
            case 7:
                return <SecurityStep onNext={nextStep} onBack={prevStep} data={data} updateData={updateData} />;
            case 8:
                return <CompletionStep data={data} />;
            default:
                return <WelcomeStep onNext={nextStep} />;
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <AnimatePresence mode="wait">
                <motion.div
                    key={step}
                    initial={{ opacity: 0, y: 20, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, y: -20, filter: 'blur(10px)' }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="w-full"
                >
                    {renderStep()}
                </motion.div>
            </AnimatePresence>

            {/* Progress Indicators */}
            <div className="fixed bottom-8 left-0 right-0 flex justify-center gap-2 z-20">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                    <div
                        key={s}
                        className={`h-1 rounded-full transition-all duration-300 ${s === step ? 'w-8 bg-white' : s < step ? 'w-2 bg-white/50' : 'w-2 bg-white/10'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
