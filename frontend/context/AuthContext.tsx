'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../services/api';
import { User, AuthResponse } from '../types';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (data: AuthResponse) => void;
    logout: () => void;
    updateUser: (user: User) => void;
    completeOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            const response = await api.get('/users/me');
            setUser(response.data);
        } catch (error) {
            console.error('Auth check failed', error);
            logout();
        } finally {
            setIsLoading(false);
        }
    };

    const login = (data: AuthResponse) => {
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        setUser(data.user);

        // Redirect to onboarding if not completed, else to dashboard
        if (data.user.hasCompletedOnboarding === false) {
            router.push('/onboarding');
        } else {
            router.push('/dashboard');
        }
    };

    const logout = () => {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        setUser(null);
        router.push('/login');
    };

    const updateUser = (updatedUser: User) => {
        setUser(updatedUser);
    };

    const completeOnboarding = async () => {
        try {
            const response = await api.post('/users/me/complete-onboarding');
            setUser(response.data);
            router.push('/dashboard');
        } catch (error) {
            console.error('Failed to complete onboarding:', error);
            throw error;
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated: !!user,
                isLoading,
                login,
                logout,
                updateUser,
                completeOnboarding,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
