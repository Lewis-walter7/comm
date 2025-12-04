'use client';

import { motion } from 'framer-motion';

interface WelcomeStepProps {
    onNext: () => void;
}

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
    return (
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mb-8 relative"
            >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-primary-500/30 mb-6 mx-auto">
                    <span className="text-white font-bold text-4xl">S</span>
                </div>
                <div className="absolute -inset-4 bg-primary-500/20 blur-3xl rounded-full -z-10" />
            </motion.div>

            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60 mb-6 tracking-tight"
            >
                Welcome to SecureRealTime
            </motion.h1>

            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="text-xl text-gray-400 mb-12 leading-relaxed max-w-lg"
            >
                The future of secure, real-time collaboration. <br />
                Experience a workspace designed for speed and clarity.
            </motion.p>

            <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onNext}
                className="group relative px-8 py-4 bg-white text-black rounded-full font-semibold text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all duration-300"
            >
                <span className="relative z-10 flex items-center gap-2">
                    Get Started
                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                </span>
            </motion.button>
        </div>
    );
}
