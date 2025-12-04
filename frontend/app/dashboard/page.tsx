'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ProtectedRoute from '../../components/ProtectedRoute';
import api from '../../services/api';
import { Project } from '../../types';

export default function DashboardPage() {
    const [projects, setProjects] = useState<Project[]>([]);
    const [workspaces, setWorkspaces] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newProject, setNewProject] = useState({ name: '', description: '', workspaceId: '' });
    const [createNewWorkspace, setCreateNewWorkspace] = useState(false);
    const [newWorkspaceName, setNewWorkspaceName] = useState('');

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const response = await api.get('/projects');
            setProjects(response.data);
        } catch (error) {
            console.error('Failed to fetch projects', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchWorkspaces = async () => {
        try {
            const response = await api.get('/workspaces');
            setWorkspaces(response.data);
        } catch (error) {
            console.error('Failed to fetch workspaces', error);
        }
    };

    const handleOpenCreateModal = () => {
        fetchWorkspaces();
        setShowCreateModal(true);
    };

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            let workspaceId = newProject.workspaceId;

            // If creating new workspace
            if (createNewWorkspace && newWorkspaceName) {
                const workspaceResponse = await api.post('/workspaces', {
                    name: newWorkspaceName,
                    description: 'Created with project',
                });
                workspaceId = workspaceResponse.data.id;
            }

            await api.post('/projects', {
                ...newProject,
                workspaceId: workspaceId || undefined,
            });

            setNewProject({ name: '', description: '', workspaceId: '' });
            setNewWorkspaceName('');
            setCreateNewWorkspace(false);
            setShowCreateModal(false);
            fetchProjects();
        } catch (error) {
            console.error('Failed to create project', error);
        }
    };

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
    };

    return (
        <ProtectedRoute>
            <div>
                <div className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400">
                            Projects
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">
                            Manage and collaborate on your secure projects
                        </p>
                    </div>
                    <button
                        onClick={handleOpenCreateModal}
                        className="px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl hover:shadow-lg hover:shadow-primary-500/25 hover:scale-[1.02] transition-all duration-200 font-medium flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        New Project
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="relative w-16 h-16">
                            <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-white/10"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
                        </div>
                    </div>
                ) : projects.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20 bg-white/50 dark:bg-white/5 rounded-3xl border border-gray-200/50 dark:border-white/5 backdrop-blur-sm"
                    >
                        <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No projects yet</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                            Get started by creating your first secure project. Invite team members and collaborate in real-time.
                        </p>
                        <button
                            onClick={handleOpenCreateModal}
                            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium hover:underline"
                        >
                            Create your first project
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {projects.map((project) => (
                            <motion.div key={project.id} variants={item}>
                                <Link
                                    href={`/dashboard/projects/${project.id}`}
                                    className="group block p-6 bg-white/70 dark:bg-white/5 rounded-2xl border border-gray-200/50 dark:border-white/5 hover:border-primary-500/30 dark:hover:border-primary-500/30 hover:shadow-xl hover:shadow-primary-500/5 backdrop-blur-sm transition-all duration-300 relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 via-primary-500/0 to-primary-500/0 group-hover:from-primary-500/5 group-hover:via-purple-500/5 group-hover:to-blue-500/5 transition-all duration-500" />

                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-primary-50 dark:bg-white/5 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                                <svg className="w-6 h-6 text-primary-600 dark:text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                                </svg>
                                            </div>
                                            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                                                Active
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                            {project.name}
                                        </h3>
                                        <p className="text-gray-600 dark:text-gray-400 line-clamp-2 text-sm leading-relaxed mb-4">
                                            {project.description || 'No description provided for this project.'}
                                        </p>

                                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-500 pt-4 border-t border-gray-100 dark:border-white/5">
                                            <span>Updated recently</span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}

                        {/* Pending Workspaces Section */}
                        {workspaces.filter((w: any) => w.memberStatus === 'PENDING').map((workspace: any) => (
                            <motion.div key={workspace.id} variants={item}>
                                <div className="group block p-6 bg-gray-50 dark:bg-white/5 rounded-2xl border border-gray-200 dark:border-white/5 opacity-70 relative overflow-hidden cursor-not-allowed">
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-gray-200 dark:bg-white/10 rounded-xl">
                                                <svg className="w-6 h-6 text-gray-500 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                            </div>
                                            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                                                Pending Approval
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold text-gray-500 dark:text-gray-400 mb-2">
                                            {workspace.name}
                                        </h3>
                                        <p className="text-gray-500 dark:text-gray-500 line-clamp-2 text-sm leading-relaxed mb-4">
                                            {workspace.description || 'No description provided.'}
                                        </p>

                                        <div className="flex items-center text-xs text-gray-400 dark:text-gray-500 pt-4 border-t border-gray-200 dark:border-white/5">
                                            <span>Waiting for owner to accept request</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}

                {/* Create Project Modal */}
                <AnimatePresence>
                    {showCreateModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowCreateModal(false)}
                                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                                className="relative bg-white dark:bg-[#1a1a1a] rounded-2xl p-8 w-full max-w-md shadow-2xl border border-gray-200 dark:border-white/10"
                            >
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                    Create New Project
                                </h2>
                                <form onSubmit={handleCreateProject}>
                                    <div className="space-y-5">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Project Name
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white transition-all outline-none"
                                                placeholder="e.g. Q4 Marketing Campaign"
                                                value={newProject.name}
                                                onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Description
                                            </label>
                                            <textarea
                                                rows={3}
                                                className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white transition-all outline-none resize-none"
                                                placeholder="Briefly describe your project..."
                                                value={newProject.description}
                                                onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Workspace
                                            </label>
                                            {!createNewWorkspace ? (
                                                <div className="space-y-2">
                                                    <select
                                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white transition-all outline-none"
                                                        value={newProject.workspaceId}
                                                        onChange={(e) => setNewProject({ ...newProject, workspaceId: e.target.value })}
                                                    >
                                                        <option value="">Select a workspace (or use default)</option>
                                                        {workspaces
                                                            .filter((w: any) => w.memberStatus !== 'PENDING')
                                                            .map((workspace) => (
                                                                <option key={workspace.id} value={workspace.id}>
                                                                    {workspace.name}
                                                                </option>
                                                            ))}
                                                    </select>
                                                    <button
                                                        type="button"
                                                        onClick={() => setCreateNewWorkspace(true)}
                                                        className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
                                                    >
                                                        + Create new workspace
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="space-y-2">
                                                    <input
                                                        type="text"
                                                        required
                                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:text-white transition-all outline-none"
                                                        placeholder="New workspace name"
                                                        value={newWorkspaceName}
                                                        onChange={(e) => setNewWorkspaceName(e.target.value)}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setCreateNewWorkspace(false);
                                                            setNewWorkspaceName('');
                                                        }}
                                                        className="text-sm text-gray-600 dark:text-gray-400 hover:underline"
                                                    >
                                                        ← Select existing workspace
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-3 mt-8">
                                        <button
                                            type="button"
                                            onClick={() => setShowCreateModal(false)}
                                            className="px-5 py-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/5 rounded-xl transition-colors font-medium"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="px-5 py-2.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors font-medium shadow-lg shadow-primary-500/20"
                                        >
                                            Create Project
                                        </button>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </ProtectedRoute>
    );
}
