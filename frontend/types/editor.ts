// Editor Type Definitions

export interface Block {
    id: string;
    type: 'paragraph' | 'heading1' | 'heading2' | 'heading3' | 'bulletList' | 'numberedList' | 'code' | 'image' | 'file' | 'table' | 'checklist';
    content: string;
    metadata?: {
        language?: string; // for code blocks
        url?: string; // for images/files
        checked?: boolean; // for checklists
        level?: number; // for headings
        items?: string[]; // for lists
    };
    order: number;
}

export interface Cursor {
    userId: string;
    position: {
        blockId: string;
        offset: number;
    };
    selection?: {
        start: { blockId: string; offset: number };
        end: { blockId: string; offset: number };
    };
}

export interface User {
    id: string;
    name: string;
    email: string;
    color: string; // hex color for cursor
    avatar?: string;
    cursor?: Cursor;
    isActive: boolean;
    lastSeen: Date;
}

export interface Comment {
    id: string;
    text: string;
    author: User;
    createdAt: Date;
    updatedAt: Date;
    blockId: string;
    position: {
        start: number;
        end: number;
    };
    thread: Reply[];
    resolved: boolean;
    mentions: string[]; // user IDs
}

export interface Reply {
    id: string;
    text: string;
    author: User;
    createdAt: Date;
    mentions: string[];
}

export interface Version {
    id: string;
    timestamp: Date;
    author: User;
    snapshot: Block[];
    description?: string;
}

export interface EditorState {
    blocks: Block[];
    selection: {
        blockId: string | null;
        offset: number;
        isCollapsed: boolean;
    };
    collaborators: User[];
    activeComments: Comment[];
    versions: Version[];
    isSaving: boolean;
    lastSaved: Date | null;
}

export interface DocumentMetadata {
    id: string;
    title: string;
    projectId: string;
    createdAt: Date;
    updatedAt: Date;
    owner: User;
    collaborators: User[];
    isEncrypted: boolean;
    encryptionKey?: string;
}

export type ToolbarAction =
    | 'bold'
    | 'italic'
    | 'underline'
    | 'heading1'
    | 'heading2'
    | 'heading3'
    | 'bulletList'
    | 'numberedList'
    | 'code'
    | 'highlight'
    | 'alignLeft'
    | 'alignCenter'
    | 'alignRight';

export type SlashCommand = {
    id: string;
    label: string;
    description: string;
    icon: string;
    blockType: Block['type'];
    keywords: string[];
};
