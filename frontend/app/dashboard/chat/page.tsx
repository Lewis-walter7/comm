"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  ArrowRight,
  Loader2,
  Users,
  Hash,
  Plus,
  Sparkles,
} from "lucide-react";
import ProtectedRoute from "../../../components/ProtectedRoute";
import api from "../../../services/api";
import { Workspace } from "../../../types";

export default function DashboardChatPage() {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadWorkspaces();
  }, []);

  const loadWorkspaces = async () => {
    try {
      const response = await api.get("/workspaces");
      const userWorkspaces = response.data;
      setWorkspaces(userWorkspaces);

      // If user has only one workspace, redirect directly
      if (userWorkspaces.length === 1) {
        router.replace(`/w/${userWorkspaces[0].id}/chat`);
        return;
      }

      // If user has a preferred workspace in localStorage, redirect there
      const preferredWorkspace = localStorage.getItem("preferredWorkspace");
      if (
        preferredWorkspace &&
        userWorkspaces.find((w: Workspace) => w.id === preferredWorkspace)
      ) {
        router.replace(`/w/${preferredWorkspace}/chat`);
        return;
      }
    } catch (err: any) {
      setError("Failed to load workspaces");
      console.error("Error loading workspaces:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkspaceSelect = (workspaceId: string) => {
    // Save as preferred workspace
    localStorage.setItem("preferredWorkspace", workspaceId);
    router.push(`/w/${workspaceId}/chat`);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "OWNER":
        return "text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-500/10";
      case "ADMIN":
        return "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10";
      case "MEMBER":
        return "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-500/10";
      default:
        return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-500/10";
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="relative min-h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-purple-50 dark:from-gray-900 dark:to-purple-900/20" />

          <div className="relative z-10 flex items-center justify-center min-h-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center space-y-4 bg-white/70 dark:bg-black/40 backdrop-blur-xl rounded-3xl p-12 border border-gray-200/50 dark:border-white/10 shadow-2xl"
            >
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Loading Chat Workspaces
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Preparing your collaborative spaces...
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="relative min-h-full">
          <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-red-900/20" />

          <div className="relative z-10 flex items-center justify-center min-h-full">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center bg-white/70 dark:bg-black/40 backdrop-blur-xl rounded-3xl p-12 border border-gray-200/50 dark:border-white/10 shadow-2xl max-w-md mx-4"
            >
              <div className="w-16 h-16 bg-red-100 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Unable to Load Chat
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl hover:from-primary-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              >
                Try Again
              </button>
            </motion.div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="relative min-h-full">
        {/* Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 to-purple-50 dark:from-gray-900 dark:to-purple-900/20" />

        <div className="relative z-10 p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            {/* Header */}
            <div className="text-center mb-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="w-20 h-20 bg-gradient-to-br from-primary-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-primary-500/20"
              >
                <MessageCircle className="h-10 w-10 text-white" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-400 mb-4"
              >
                Team Chat
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto"
              >
                Select a workspace to access your team conversations,
                collaborate in real-time, and stay connected with your
                colleagues.
              </motion.p>
            </div>

            {/* Workspaces Grid */}
            {workspaces.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 }}
                className="text-center py-20 bg-white/50 dark:bg-white/5 rounded-3xl border border-gray-200/50 dark:border-white/5 backdrop-blur-sm"
              >
                <div className="w-20 h-20 bg-gray-100 dark:bg-white/5 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-10 h-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No workspaces found
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  You don't have access to any workspaces yet. Create or join a
                  workspace to start collaborating.
                </p>
                <button
                  onClick={() => router.push("/dashboard/workspaces")}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl hover:from-primary-700 hover:to-purple-700 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
                >
                  <Plus className="h-5 w-5" />
                  Create Workspace
                </button>
              </motion.div>
            ) : (
              <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid gap-4 md:gap-6"
              >
                {workspaces.map((workspace) => (
                  <motion.button
                    key={workspace.id}
                    variants={item}
                    onClick={() => handleWorkspaceSelect(workspace.id)}
                    className="group w-full p-6 text-left bg-white/70 dark:bg-black/40 backdrop-blur-xl rounded-2xl border border-gray-200/50 dark:border-white/10 hover:border-primary-300 dark:hover:border-primary-500/50 transition-all duration-200 shadow-lg hover:shadow-2xl hover:scale-[1.02] transform"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                            {workspace.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-white dark:border-gray-900 flex items-center justify-center">
                            <Sparkles className="w-3 h-3 text-white" />
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                              {workspace.name}
                            </h3>
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-medium ${getRoleColor(workspace.memberRole || "MEMBER")}`}
                            >
                              {workspace.memberRole?.toLowerCase() || "member"}
                            </span>
                          </div>

                          {workspace.description && (
                            <p className="text-gray-500 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                              {workspace.description}
                            </p>
                          )}

                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            {workspace._count && (
                              <>
                                <div className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  <span>
                                    {workspace._count.members} members
                                  </span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Hash className="w-4 h-4" />
                                  <span>
                                    {workspace._count.projects} projects
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center">
                        <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center group-hover:bg-primary-100 dark:group-hover:bg-primary-500/20 transition-colors">
                          <ArrowRight className="h-6 w-6 text-primary-600 dark:text-primary-400 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </motion.div>
            )}

            {/* Footer Actions */}
            {workspaces.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-12 text-center"
              >
                <div className="inline-flex items-center gap-4 px-6 py-3 bg-white/50 dark:bg-white/5 rounded-2xl border border-gray-200/50 dark:border-white/10 backdrop-blur-sm">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Need to create a new workspace?
                  </p>
                  <button
                    onClick={() => router.push("/dashboard/workspaces")}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    <Plus className="h-4 w-4" />
                    Manage Workspaces
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
