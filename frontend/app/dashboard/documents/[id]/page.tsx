'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ProtectedRoute from '../../../../components/ProtectedRoute';
import api from '../../../../services/api';
import { getDocumentSocket } from '../../../../services/socket';
import { Block, User, Comment, Version, EditorState } from '@/types/editor';

// Editor Components
import EditorCanvas from '@/components/editor/EditorCanvas';
import EditorBackground from '@/components/editor/EditorBackground';
import AutosaveIndicator from '@/components/editor/AutosaveIndicator';
import SecurityBadge from '@/components/editor/SecurityBadge';
import ActiveUsers from '@/components/editor/ActiveUsers';
import CollaboratorCursors from '@/components/editor/CollaboratorCursors';
import DocumentOutline from '@/components/editor/DocumentOutline';
import RightPanel from '@/components/editor/RightPanel';
import CommandPalette from '@/components/editor/CommandPalette';

export default function DocumentEditorPage() {
    const params = useParams();
    const router = useRouter();
    const documentId = params.id as string;

    const [document, setDocument] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [editorState, setEditorState] = useState<EditorState>({
        blocks: [],
        selection: { blockId: null, offset: 0, isCollapsed: true },
        collaborators: [],
        activeComments: [],
        versions: [],
        isSaving: false,
        lastSaved: null
    });
    const [showCommandPalette, setShowCommandPalette] = useState(false);
    const [showLeftSidebar, setShowLeftSidebar] = useState(true);
    const [showRightPanel, setShowRightPanel] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'saving' | 'saved' | 'offline' | 'error'>('saved');

    // Mock current user
    const currentUser: User = {
        id: 'current-user',
        name: 'Current User',
        email: 'user@example.com',
        color: '#8b5cf6',
        isActive: true,
        lastSeen: new Date()
    };

    // Mock collaborators for demo
    const mockCollaborators: User[] = [
        {
            id: '1',
            name: 'Alice Chen',
            email: 'alice@example.com',
            color: '#3b82f6',
            isActive: true,
            lastSeen: new Date()
        },
        {
            id: '2',
            name: 'Bob Smith',
            email: 'bob@example.com',
            color: '#10b981',
            isActive: true,
            lastSeen: new Date()
        }
    ];

    useEffect(() => {
        fetchDocument();
        const socket = getDocumentSocket();

        // Join document room
        socket.emit('join', { documentId });

        // Listen for updates
        socket.on('update', (data: any) => {
            console.log('Received update:', data);
        });

        socket.on('user-joined', (data: any) => {
            console.log('User joined:', data.userId);
        });

        socket.on('user-left', (data: any) => {
            console.log('User left:', data.userId);
        });

        // Command palette keyboard shortcut
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setShowCommandPalette(true);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            socket.emit('leave', { documentId });
            socket.off('update');
            socket.off('user-joined');
            socket.off('user-left');
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [documentId]);

    const fetchDocument = async () => {
        try {
            const response = await api.get(`/documents/${documentId}`);
            setDocument(response.data);

            // Initialize blocks from content
            let initialBlocks: Block[] = [];
            if (response.data.encryptedContent) {
                try {
                    // Simulate decryption
                    initialBlocks = JSON.parse(response.data.encryptedContent);
                } catch (e) {
                    console.error('Failed to parse document content', e);
                    initialBlocks = [{ id: '1', type: 'paragraph', content: '', order: 0 }];
                }
            } else {
                initialBlocks = [{ id: '1', type: 'paragraph', content: '', order: 0 }];
            }

            setEditorState(prev => ({
                ...prev,
                blocks: initialBlocks,
                collaborators: mockCollaborators
            }));
        } catch (error) {
            console.error('Failed to fetch document', error);
        } finally {
            setLoading(false);
        }
    };

    const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (loading || isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const saveDocument = async () => {
            try {
                setSaveStatus('saving');
                // Simulate encryption by stringifying
                const encryptedContent = JSON.stringify(editorState.blocks);

                await api.put(`/documents/${documentId}/content`, {
                    encryptedContent
                });

                setSaveStatus('saved');
                setEditorState(prev => ({ ...prev, lastSaved: new Date() }));
            } catch (error) {
                console.error('Failed to save document', error);
                setSaveStatus('error');
            }
        };

        // Debounce save
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        setSaveStatus('saving');
        saveTimeoutRef.current = setTimeout(saveDocument, 1000);

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [editorState.blocks, documentId, loading]);

    const handleBlockChange = (blockId: string, content: string) => {
        setEditorState(prev => ({
            ...prev,
            blocks: prev.blocks.map(block =>
                block.id === blockId ? { ...block, content } : block
            )
        }));
    };

    const handleBlockAdd = (afterBlockId: string, type: Block['type']) => {
        const afterBlock = editorState.blocks.find(b => b.id === afterBlockId);
        if (!afterBlock) return;

        const newBlock: Block = {
            id: Date.now().toString(),
            type,
            content: '',
            order: afterBlock.order + 1
        };

        setEditorState(prev => ({
            ...prev,
            blocks: [
                ...prev.blocks.slice(0, afterBlock.order + 1),
                newBlock,
                ...prev.blocks.slice(afterBlock.order + 1).map(b => ({ ...b, order: b.order + 1 }))
            ]
        }));
    };

    const handleBlockDelete = (blockId: string) => {
        setEditorState(prev => ({
            ...prev,
            blocks: prev.blocks.filter(b => b.id !== blockId)
        }));
    };

    const handleBlockReorder = (blockId: string, newOrder: number) => {
        // Implementation for drag-and-drop reordering
        console.log('Reorder block', blockId, newOrder);
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-500" />
                        <p className="text-sm text-gray-400">Loading document...</p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (!document) {
        return (
            <ProtectedRoute>
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <p className="text-gray-400 mb-4">Document not found</p>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            {/* Full-screen overlay for immersive editor */}
            <div className="fixed inset-0 bg-[#050505] text-white overflow-hidden z-50">
                {/* Background Effects */}
                <EditorBackground opacity={0.15} />

                {/* Editor Header Bar (replaces dashboard navbar) */}
                <div className="absolute top-0 left-0 right-0 z-40 glass border-b border-white/5">
                    <div className="flex items-center justify-between px-6 py-3">
                        {/* Left: Navigation */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => router.push(`/dashboard/projects/${document.projectId}`)}
                                className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Back
                            </button>

                            <div className="w-px h-6 bg-gray-700" />

                            <button
                                onClick={() => setShowLeftSidebar(!showLeftSidebar)}
                                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                                title="Toggle outline"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                                </svg>
                            </button>
                        </div>

                        {/* Center: Document Status */}
                        <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
                            <AutosaveIndicator status={saveStatus} lastSaved={editorState.lastSaved} />
                            <SecurityBadge isEncrypted={document.isEncrypted} />
                        </div>

                        {/* Right: Collaboration & Actions */}
                        <div className="flex items-center gap-4">
                            <ActiveUsers users={editorState.collaborators} />

                            <div className="w-px h-6 bg-gray-700" />

                            <button
                                onClick={() => setShowRightPanel(!showRightPanel)}
                                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                                title="Toggle panel"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                </svg>
                            </button>

                            <button
                                className="px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white text-sm font-medium rounded-lg transition-colors"
                                title="Share document"
                            >
                                Share
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Editor Layout */}
                <div className="absolute top-14 bottom-0 left-0 right-0 flex">
                    {/* Left Sidebar - Document Outline - Always visible */}
                    <div className="w-72 flex-shrink-0 p-4">
                        <DocumentOutline
                            blocks={editorState.blocks}
                            projectName={document.project?.name}
                            projectId={document.projectId}
                            documentName={document.title}
                            onNavigate={(blockId) => console.log('Navigate to', blockId)}
                        />
                    </div>

                    {/* Center - Editor Canvas */}
                    <div className="flex-1 relative overflow-hidden">
                        <EditorCanvas
                            blocks={editorState.blocks}
                            documentTitle={document.title}
                            onBlockChange={handleBlockChange}
                            onBlockAdd={handleBlockAdd}
                            onBlockDelete={handleBlockDelete}
                            onBlockReorder={handleBlockReorder}
                        />

                        {/* Collaborator Cursors Overlay */}
                        <CollaboratorCursors collaborators={editorState.collaborators} />
                    </div>

                    {/* Right Panel - Comments/Versions */}
                    <AnimatePresence>
                        {showRightPanel && (
                            <motion.div
                                initial={{ width: 0, opacity: 0 }}
                                animate={{ width: 360, opacity: 1 }}
                                exit={{ width: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="flex-shrink-0 p-4 overflow-hidden"
                            >
                                <RightPanel
                                    comments={editorState.activeComments}
                                    versions={editorState.versions}
                                    currentUser={currentUser}
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Command Palette */}
                <CommandPalette
                    isOpen={showCommandPalette}
                    onClose={() => setShowCommandPalette(false)}
                />
            </div>
        </ProtectedRoute>
    );
}
