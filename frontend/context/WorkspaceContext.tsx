'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '../services/api';
import { useAuth } from './AuthContext';
import { Workspace, WorkspaceMember } from '../types';

interface WorkspaceContextType {
    workspaces: Workspace[];
    currentWorkspace: Workspace | null;
    isLoading: boolean;
    createWorkspace: (name: string, description?: string) => Promise<void>;
    joinWorkspace: (inviteCode: string) => Promise<{ status: 'active' | 'pending'; message: string }>;
    verifyInviteCode: (inviteCode: string) => Promise<any>;
    switchWorkspace: (workspaceId: string) => void;
    refreshWorkspaces: () => Promise<void>;
    getPendingMembers: (workspaceId: string) => Promise<WorkspaceMember[]>;
    acceptMemberRequest: (workspaceId: string, memberId: string) => Promise<void>;
    rejectMemberRequest: (workspaceId: string, memberId: string) => Promise<void>;
}



const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();
    const router = useRouter();

    const fetchWorkspaces = async () => {
        if (!user) return;
        try {
            const response = await api.get('/workspaces');
            setWorkspaces(response.data);

            // Restore selected workspace from local storage or default to first
            const savedWorkspaceId = localStorage.getItem('currentWorkspaceId');
            const savedWorkspace = response.data.find((w: Workspace) => w.id === savedWorkspaceId);

            if (savedWorkspace) {
                setCurrentWorkspace(savedWorkspace);
            } else if (response.data.length > 0) {
                setCurrentWorkspace(response.data[0]);
                localStorage.setItem('currentWorkspaceId', response.data[0].id);
            }
        } catch (error) {
            console.error('Failed to fetch workspaces:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (user) {
            fetchWorkspaces();
        } else {
            setWorkspaces([]);
            setCurrentWorkspace(null);
            setIsLoading(false);
        }
    }, [user]);

    const createWorkspace = async (name: string, description?: string) => {
        try {
            const response = await api.post('/workspaces', { name, description });
            await fetchWorkspaces();
            switchWorkspace(response.data.id);
        } catch (error) {
            console.error('Failed to create workspace:', error);
            throw error;
        }
    };

    const joinWorkspace = async (inviteCode: string) => {
        try {
            const response = await api.post('/workspaces/join', { inviteCode });
            await fetchWorkspaces();

            if (response.data.status === 'active') {
                switchWorkspace(response.data.workspace.id);
            }

            return {
                status: response.data.status || 'active',
                message: response.data.message
            };
        } catch (error) {
            console.error('Failed to join workspace:', error);
            throw error;
        }
    };

    const verifyInviteCode = async (inviteCode: string) => {
        try {
            const response = await api.get(`/workspaces/verify/${inviteCode}`);
            return response.data;
        } catch (error) {
            console.error('Failed to verify invite code:', error);
            throw error;
        }
    };

    const switchWorkspace = (workspaceId: string) => {
        const workspace = workspaces.find((w) => w.id === workspaceId);
        if (workspace) {
            setCurrentWorkspace(workspace);
            localStorage.setItem('currentWorkspaceId', workspaceId);
            router.refresh();
        }
    };

    const getPendingMembers = async (workspaceId: string): Promise<WorkspaceMember[]> => {
        try {
            const response = await api.get(`/workspaces/${workspaceId}/pending-members`);
            return response.data;
        } catch (error) {
            console.error('Failed to fetch pending members:', error);
            throw error;
        }
    };

    const acceptMemberRequest = async (workspaceId: string, memberId: string) => {
        try {
            await api.post(`/workspaces/${workspaceId}/members/${memberId}/accept`);
            await fetchWorkspaces();
        } catch (error) {
            console.error('Failed to accept member request:', error);
            throw error;
        }
    };

    const rejectMemberRequest = async (workspaceId: string, memberId: string) => {
        try {
            await api.post(`/workspaces/${workspaceId}/members/${memberId}/reject`);
            await fetchWorkspaces();
        } catch (error) {
            console.error('Failed to reject member request:', error);
            throw error;
        }
    };

    return (
        <WorkspaceContext.Provider
            value={{
                workspaces,
                currentWorkspace,
                isLoading,
                createWorkspace,
                joinWorkspace,
                verifyInviteCode,
                switchWorkspace,
                refreshWorkspaces: fetchWorkspaces,
                getPendingMembers,
                acceptMemberRequest,
                rejectMemberRequest,
            }}
        >
            {children}
        </WorkspaceContext.Provider>
    );
}

export function useWorkspace() {
    const context = useContext(WorkspaceContext);
    if (context === undefined) {
        throw new Error('useWorkspace must be used within a WorkspaceProvider');
    }
    return context;
}
