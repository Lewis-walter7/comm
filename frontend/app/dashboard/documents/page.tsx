'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ProtectedRoute from '../../../components/ProtectedRoute';
import api from '../../../services/api';
import { Document } from '../../../types';

export default function DocumentsPage() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const response = await api.get('/documents');
            setDocuments(response.data);
        } catch (error) {
            console.error('Failed to fetch documents', error);
        } finally {
            setLoading(false);
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
                            Documents
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-2">
                            Access and manage all your secure documents
                        </p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="relative w-16 h-16">
                            <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-white/10"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-primary-500 border-t-transparent animate-spin"></div>
                        </div>
                    </div>
                ) : documents.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-20 bg-white/50 dark:bg-white/5 rounded-3xl border border-gray-200/50 dark:border-white/5 backdrop-blur-sm"
                    >
                        <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No documents found</h3>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                            You haven't created any documents yet. Go to a project to create one.
                        </p>
                        <Link
                            href="/dashboard"
                            className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 font-medium hover:underline"
                        >
                            Go to Projects
                        </Link>
                    </motion.div>
                ) : (
                    <motion.div
                        variants={container}
                        initial="hidden"
                        animate="show"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {documents.map((doc) => (
                            <motion.div key={doc.id} variants={item}>
                                <Link
                                    href={`/dashboard/documents/${doc.id}`}
                                    className="group block p-6 bg-white/70 dark:bg-white/5 rounded-2xl border border-gray-200/50 dark:border-white/5 hover:border-primary-500/30 dark:hover:border-primary-500/30 hover:shadow-xl hover:shadow-primary-500/5 backdrop-blur-sm transition-all duration-300 relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/0 via-primary-500/0 to-primary-500/0 group-hover:from-primary-500/5 group-hover:via-purple-500/5 group-hover:to-blue-500/5 transition-all duration-500" />

                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300">
                                                Document
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                            {doc.title}
                                        </h3>

                                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                            </svg>
                                            <span>{doc.project?.name || `Project ID: ${doc.projectId.substring(0, 8)}...`}</span>
                                        </div>

                                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-500 pt-4 border-t border-gray-100 dark:border-white/5">
                                            <span>Updated {new Date(doc.updatedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </ProtectedRoute>
    );
}
