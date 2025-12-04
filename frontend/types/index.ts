export interface User {
  id: string;
  email: string;
  name: string;
  bio?: string;
  phone?: string;
  location?: string;
  avatarUrl?: string;
  twoFactorEnabled?: boolean;
  hasCompletedOnboarding?: boolean;
  deletedAt?: string;
  scheduledDeletionAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  role?: "OWNER" | "EDITOR" | "VIEWER";
}

export interface Document {
  id: string;
  title: string;
  projectId: string;
  updatedAt: string;
  project?: {
    id: string;
    name: string;
  };
}

export interface Activity {
  id: string;
  type: string;
  description: string;
  metadata?: any;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  ownerId: string;
  inviteCode?: string;
  createdAt: string;
  updatedAt: string;
  owner?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
  };
  memberStatus?: "PENDING" | "ACTIVE";
  memberRole?: "OWNER" | "ADMIN" | "MEMBER" | "GUEST";
  _count?: {
    members: number;
    projects: number;
  };
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: "OWNER" | "ADMIN" | "MEMBER" | "GUEST";
  status: "PENDING" | "ACTIVE";
  joinedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    createdAt?: string;
  };
}
