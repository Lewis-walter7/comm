'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import api from '@/services/api';
import ProtectedRoute from '@/components/ProtectedRoute';

interface WorkspaceMember {
    id: string;
    role: string;
    status?: 'PENDING' | 'ACTIVE';
    user: {
        id: string;
        name: string;
        email: string;
        avatarUrl?: string;
    };
}

interface Project {
    id: string;
    name: string;
    description?: string;
    updatedAt: string;
    _count?: {
        members: number;
        documents: number;
    };
}

interface WorkspaceDetails {
    id: string;
    name: string;
    description?: string;
    inviteCode?: string;
    createdAt: string;
    owner: {
        id: string;
        name: string;
        email: string;
    };
    members: WorkspaceMember[];
    projects: Project[];
}

export default function WorkspaceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const workspaceId = params?.id as string;
    const [workspace, setWorkspace] = useState<WorkspaceDetails | null>(null);
    const [pendingMembers, setPendingMembers] = useState<WorkspaceMember[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [inviteTab, setInviteTab] = useState<'email' | 'code'>('code');
    const [inviteEmail, setInviteEmail] = useState('');
    const [copied, setCopied] = useState(false);
    const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);

    useEffect(() => {
        if (workspaceId) {
            fetchWorkspace();
        }
    }, [workspaceId]);

    const fetchWorkspace = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/workspaces/${workspaceId}`);
            setWorkspace(response.data);

            // Determine current user role
            const currentUser = response.data.members.find((m: any) => m.userId === response.data.currentUserId); // Assuming backend returns currentUserId or we get it from context
            // Actually, we can check if the user can see pending members by trying to fetch them
            // Or we can rely on the role if we had the current user ID. 
            // For now, let's try to fetch pending members and if it fails (403), we know we're not admin/owner.

            fetchPendingMembers();
        } catch (err: any) {
            console.error('Failed to fetch workspace:', err);
            setError(err.response?.data?.message || 'Failed to load workspace');
        } finally {
            setLoading(false);
        }
    };

    const fetchPendingMembers = async () => {
        try {
            const response = await api.get(`/workspaces/${workspaceId}/pending-members`);
            setPendingMembers(response.data);
        } catch (error) {
            // Ignore error if user doesn't have permission
            console.log('User does not have permission to view pending members or none exist');
        }
    };

    const handleAcceptMember = async (memberId: string) => {
        try {
            await api.post(`/workspaces/${workspaceId}/members/${memberId}/accept`);
            // Refresh data
            fetchWorkspace();
            fetchPendingMembers();
        } catch (error) {
            console.error('Failed to accept member:', error);
            alert('Failed to accept member request');
        }
    };

    const handleRejectMember = async (memberId: string) => {
        try {
            await api.post(`/workspaces/${workspaceId}/members/${memberId}/reject`);
            // Refresh data
            fetchPendingMembers();
        } catch (error) {
            console.error('Failed to reject member:', error);
            alert('Failed to reject member request');
        }
    };

    const generateInviteCode = async () => {
        try {
            // Generate code in XXX-YYY-ZZZ format (9 characters total)
            const code =
                Math.random().toString(36).substring(2, 5).toUpperCase() + '-' +
                Math.random().toString(36).substring(2, 5).toUpperCase() + '-' +
                Math.random().toString(36).substring(2, 5).toUpperCase();
            await api.patch(`/workspaces/${workspaceId}`, { inviteCode: code });
            if (workspace) {
                setWorkspace({ ...workspace, inviteCode: code });
            }
        } catch (error) {
            console.error('Failed to generate invite code', error);
        }
    };

    const copyInviteCode = () => {
        if (workspace?.inviteCode) {
            navigator.clipboard.writeText(workspace.inviteCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleEmailInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post(`/workspaces/${workspaceId}/invite`, { email: inviteEmail });
            alert('Invitation sent successfully!');
            setInviteEmail('');
            setShowInviteModal(false);
        } catch (error) {
            console.error('Failed to send invitation', error);
            alert('Failed to send invitation');
        }
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="flex justify-center items-center py-20">
                    <div className="relative w-16 h-16">
                        <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-white/10"></div>
                        <div className="absolute inset-0 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (error || !workspace) {
        const isPendingError = error?.includes('pending approval');

        return (
            <ProtectedRoute>
                <div className="text-center py-20">
                    <div className={`w-20 h-20 ${isPendingError ? 'bg-yellow-100 dark:bg-yellow-900/20' : 'bg-red-100 dark:bg-red-900/20'} rounded-full flex items-center justify-center mx-auto mb-6`}>
                        {isPendingError ? (
                            <svg className="w-10 h-10 text-yellow-600 dark:text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        ) : (
                            <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        )}
                    </div>
                    <h2 className={`text-2xl font-bold ${isPendingError ? 'text-yellow-900 dark:text-yellow-100' : 'text-gray-900 dark:text-white'} mb-3`}>
                        {isPendingError ? 'Pending Approval' : 'Error'}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                        {isPendingError
                            ? 'Your request to join this workspace is pending approval from the workspace owner. You\'ll receive a notification once your request is reviewed.'
                            : error || 'Workspace not found'}
                    </p>
                    <button
                        onClick={() => router.push('/dashboard')}
                    >
                        Back to Dashboard
                    </button>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div>
                {/* Header */}
                <div className="mb-10">
                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-4">
                        <Link href="/dashboard" className="hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                            Dashboard
                        </Link>
                        <span>/</span>
                        <span className="text-gray-900 dark:text-white">Workspaces</span>
                        <span>/</span>
                        <span className="text-gray-900 dark:text-white">{workspace.name}</span>
                    </div>

                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg shadow-primary-500/20">
                                <span className="text-2xl font-bold text-white">
                                    {workspace.name.charAt(0)}
                                </span>
                            </div>
                            <div>
                                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                                    {workspace.name}
                                </h1>
                                <p className="text-gray-500 dark:text-gray-400 mt-2">
                                    {workspace.description || 'No description provided'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 bg-white/70 dark:bg-white/5 rounded-2xl border border-gray-200/50 dark:border-white/5 backdrop-blur-sm"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
                                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Members</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{workspace.members.length}</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-6 bg-white/70 dark:bg-white/5 rounded-2xl border border-gray-200/50 dark:border-white/5 backdrop-blur-sm"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-500/10 flex items-center justify-center">
                                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Projects</p>
                                <p className="text-2xl font-bold text-gray-900 dark:text-white">{workspace.projects.length}</p>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="p-6 bg-white/70 dark:bg-white/5 rounded-2xl border border-gray-200/50 dark:border-white/5 backdrop-blur-sm"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center">
                                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <div>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Owner</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white truncate">{workspace.owner.name}</p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Members List */}
                    <div className="bg-white/70 dark:bg-white/5 rounded-2xl border border-gray-200/50 dark:border-white/5 backdrop-blur-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Members</h2>
                            <button
                                onClick={() => setShowInviteModal(true)}
                                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                                Invite Members
                            </button>
                        </div>

                        {/* Pending Members Section */}
                        {pendingMembers.length > 0 && (
                            <div className="mb-6 pb-6 border-b border-gray-200 dark:border-white/10">
                                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                                    Pending Requests ({pendingMembers.length})
                                </h3>
                                <div className="space-y-3">
                                    {pendingMembers.map((member) => (
                                        <div
                                            key={member.id}
                                            className="flex items-center justify-between p-4 bg-yellow-50/50 dark:bg-yellow-900/10 border border-yellow-100 dark:border-yellow-900/20 rounded-xl"
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-500 to-orange-600 flex items-center justify-center text-white font-bold">
                                                    {member.user.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 dark:text-white">{member.user.name}</p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">{member.user.email}</p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleRejectMember(member.id)}
                                                    className="px-3 py-1.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    Reject
                                                </button>
                                                <button
                                                    onClick={() => handleAcceptMember(member.id)}
                                                    className="px-3 py-1.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition-colors shadow-sm"
                                                >
                                                    Accept
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="space-y-3">
                            {workspace.members.map((member) => (
                                <div
                                    key={member.id}
                                    className="flex items-center justify-between p-4 bg-gray-50/50 dark:bg-white/5 rounded-xl hover:bg-gray-100/50 dark:hover:bg-white/10 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-white font-bold">
                                            {member.user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-white">{member.user.name}</p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{member.user.email}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-medium px-3 py-1 rounded-full bg-primary-100 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400">
                                        {member.role}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Projects List */}
                    <div className="bg-white/70 dark:bg-white/5 rounded-2xl border border-gray-200/50 dark:border-white/5 backdrop-blur-sm p-6">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Projects</h2>
                        <div className="space-y-3">
                            {workspace.projects.length === 0 ? (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                                    No projects in this workspace yet
                                </p>
                            ) : (
                                workspace.projects.map((project) => (
                                    <Link
                                        key={project.id}
                                        href={`/dashboard/projects/${project.id}`}
                                        className="block p-4 bg-gray-50/50 dark:bg-white/5 rounded-xl hover:bg-gray-100/50 dark:hover:bg-white/10 transition-colors group"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                                    {project.name}
                                                </h3>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 mt-1">
                                                    {project.description || 'No description'}
                                                </p>
                                            </div>
                                            <svg className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                {/* Invite Modal */}
                {showInviteModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 w-full max-w-md">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Invite Members</h2>

                            {/* Tabs */}
                            <div className="flex gap-2 mb-6 p-1 bg-gray-100 dark:bg-gray-900 rounded-lg">
                                <button
                                    onClick={() => setInviteTab('code')}
                                    className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${inviteTab === 'code'
                                        ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                        }`}
                                >
                                    Invite Code
                                </button>
                                <button
                                    onClick={() => setInviteTab('email')}
                                    className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${inviteTab === 'email'
                                        ? 'bg-white dark:bg-gray-700 text-primary-600 dark:text-primary-400'
                                        : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                                        }`}
                                >
                                    Email Invite
                                </button>
                            </div>

                            {/* Code Tab */}
                            {inviteTab === 'code' && (
                                <div className="space-y-4">
                                    <p className="text-sm text-gray-600 dark:text-gray-400">
                                        Share this code with team members to let them join your workspace.
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-900 rounded-lg font-mono text-lg font-bold text-gray-900 dark:text-white">
                                            {workspace.inviteCode || 'Generating...'}
                                        </div>
                                        <button
                                            onClick={copyInviteCode}
                                            className="px-4 py-3 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                            title="Copy code"
                                        >
                                            {copied ? (
                                                <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        This is your workspace's permanent invite code. Keep it secure!
                                    </p>
                                </div>
                            )}

                            {/* Email Tab */}
                            {inviteTab === 'email' && (
                                <form onSubmit={handleEmailInvite} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Email Address
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={inviteEmail}
                                            onChange={(e) => setInviteEmail(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white"
                                            placeholder="colleague@example.com"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
                                    >
                                        Send Invitation
                                    </button>
                                </form>
                            )}

                            <button
                                onClick={() => {
                                    setShowInviteModal(false);
                                    setInviteEmail('');
                                }}
                                className="w-full mt-4 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
