'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated, isLoading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (!isLoading) {
            // If not authenticated, redirect to login
            if (!isAuthenticated) {
                router.push('/login');
                return;
            }

            // If authenticated but hasn't completed onboarding (and not already on onboarding page), redirect to onboarding
            if (user && user.hasCompletedOnboarding === false && !pathname?.startsWith('/onboarding')) {
                router.push('/onboarding');
                return;
            }
        }
    }, [isAuthenticated, isLoading, user, router, pathname]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    // Check onboarding status before rendering children
    if (user && user.hasCompletedOnboarding === false && !pathname?.startsWith('/onboarding')) {
        return null;
    }

    return <>{children}</>;
}
