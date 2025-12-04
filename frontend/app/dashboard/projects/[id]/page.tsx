'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import api from '../../../../services/api';
import { Project, Document } from '../../../../types';

export default function ProjectDetailPage() {
    const params = useParams();
    const router = useRouter();
    const projectId = params.id as string;

    const [project, setProject] = useState<Project | null>(null);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateDoc, setShowCreateDoc] = useState(false);
    const [newDocTitle, setNewDocTitle] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteConfirmation, setDeleteConfirmation] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState('');
    const [editedDescription, setEditedDescription] = useState('');

    useEffect(() => {
        fetchProject();
        fetchDocuments();
    }, [projectId]);

    const fetchProject = async () => {
        try {
            const response = await api.get(`/projects/${projectId}`);
            setProject(response.data);
        } catch (error) {
            console.error('Failed to fetch project', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDocuments = async () => {
        try {
            const response = await api.get(`/documents?projectId=${projectId}`);
            setDocuments(response.data);
        } catch (error) {
            console.error('Failed to fetch documents', error);
        }
    };

    const handleCreateDocument = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await api.post('/documents', {
                title: newDocTitle,
                projectId,
            });
            setNewDocTitle('');
            setShowCreateDoc(false);
            router.push(`/dashboard/documents/${response.data.id}`);
        } catch (error) {
            console.error('Failed to create document', error);
        }
    };

    const handleDeleteProject = async () => {
        if (deleteConfirmation !== project?.name) {
            alert('Project name does not match!');
            return;
        }

        try {
            setIsDeleting(true);
            await api.delete(`/projects/${projectId}`);
            router.push('/dashboard');
        } catch (error) {
            console.error('Failed to delete project', error);
            alert('Failed to delete project. You must be the owner to delete.');
            setIsDeleting(false);
        }
    };

    const startEditing = () => {
        setEditedName(project?.name || '');
        setEditedDescription(project?.description || '');
        setIsEditing(true);
    };

    const cancelEditing = () => {
        setIsEditing(false);
        setEditedName('');
        setEditedDescription('');
    };

    const saveChanges = async () => {
        try {
            await api.patch(`/projects/${projectId}`, {
                name: editedName,
                description: editedDescription,
            });
            setIsEditing(false);
            fetchProject();
        } catch (error) {
            console.error('Failed to update project', error);
            alert('Failed to update project');
        }
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
                </div>
            </ProtectedRoute>
        );
    }

    if (!project) {
        return (
            <ProtectedRoute>
                <div className="text-center py-12">
                    <p className="text-gray-500">Project not found</p>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div>
                <div className="mb-6">
                    <Link href="/dashboard" className="text-primary-600 hover:text-primary-700">
                        ← Back to Projects
                    </Link>
                </div>

                <div className="flex items-start justify-between mb-8">
                    <div className="flex-1">
                        {isEditing ? (
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    value={editedName}
                                    onChange={(e) => setEditedName(e.target.value)}
                                    className="text-3xl font-bold text-gray-900 dark:text-white bg-transparent border-b-2 border-primary-500 focus:outline-none w-full"
                                    placeholder="Project name"
                                />
                                <textarea
                                    value={editedDescription}
                                    onChange={(e) => setEditedDescription(e.target.value)}
                                    className="text-gray-600 dark:text-gray-400 bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-primary-500 w-full resize-none"
                                    placeholder="Project description"
                                    rows={2}
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={saveChanges}
                                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                                    >
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Save
                                    </button>
                                    <button
                                        onClick={cancelEditing}
                                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {project.name}
                                    </h1>
                                    <button
                                        onClick={startEditing}
                                        className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                                        title="Edit project"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                    </button>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400">{project.description}</p>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setShowDeleteModal(true)}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2 ml-4"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete Project
                    </button>
                </div>

                {/* Documents Section */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Documents</h2>
                        <button
                            onClick={() => setShowCreateDoc(true)}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                        >
                            + New Document
                        </button>
                    </div>

                    {documents.length === 0 ? (
                        <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <p className="text-gray-500 dark:text-gray-400">No documents yet</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {documents.map((doc) => (
                                <Link
                                    key={doc.id}
                                    href={`/dashboard/documents/${doc.id}`}
                                    className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
                                >
                                    <h3 className="font-medium text-gray-900 dark:text-white mb-1">
                                        {doc.title}
                                    </h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Updated {new Date(doc.updatedAt).toLocaleDateString()}
                                    </p>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Chat Section */}
                <div>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Chat</h2>
                    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                        <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                            Chat feature coming soon...
                        </p>
                    </div>
                </div>

                {/* Create Document Modal */}
                {showCreateDoc && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                                Create New Document
                            </h2>
                            <form onSubmit={handleCreateDocument}>
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Document Title
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 dark:bg-gray-700 dark:text-white"
                                        value={newDocTitle}
                                        onChange={(e) => setNewDocTitle(e.target.value)}
                                    />
                                </div>
                                <div className="flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowCreateDoc(false)}
                                        className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                                    >
                                        Create
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Delete Project Modal */}
                {showDeleteModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md border-2 border-red-500">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                                    <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                                        Delete Project
                                    </h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">This action cannot be undone</p>
                                </div>
                            </div>

                            <div className="mb-4">
                                <p className="text-gray-700 dark:text-gray-300 mb-4">
                                    This will permanently delete the project <strong>{project.name}</strong>, all its documents, and chat messages.
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    To confirm, type the project name: <strong>{project.name}</strong>
                                </p>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 dark:bg-gray-700 dark:text-white"
                                    placeholder="Type project name to confirm"
                                    value={deleteConfirmation}
                                    onChange={(e) => setDeleteConfirmation(e.target.value)}
                                />
                            </div>

                            <div className="flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setDeleteConfirmation('');
                                    }}
                                    disabled={isDeleting}
                                    className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDeleteProject}
                                    disabled={deleteConfirmation !== project.name || isDeleting}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {isDeleting ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                            </svg>
                                            Deleting...
                                        </>
                                    ) : (
                                        'Delete Project'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ProtectedRoute>
    );
}
