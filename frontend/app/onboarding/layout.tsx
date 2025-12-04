'use client';

import { BackgroundScene } from '@/components/background';

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-black text-white font-sans selection:bg-primary-500/30 overflow-hidden relative">
            {/* 3D Background Scene */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <BackgroundScene
                    opacity={0.4}
                    intensity={0.6}
                    speed={0.4}
                    particleCount={80}
                    networkNodes={3}
                    enableParallax={true}
                />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col min-h-screen">
                <main className="flex-1 flex items-center justify-center p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
