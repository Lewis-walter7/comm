"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useChat } from "../../../../context/chat/ChatContext";
import ChatSidebar from "../../../../components/chat/ChatSidebar";
import ChatWindow from "../../../../components/chat/ChatWindow";
import ThreadPanel from "../../../../components/chat/ThreadPanel";
import {
  MessageCircle,
  Users,
  Hash,
  FileText,
  AlertTriangle,
  Wifi,
  WifiOff,
  RefreshCw,
  CheckCircle,
  XCircle,
  Home,
  LogIn,
} from "lucide-react";

export default function ChatPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const { state, setWorkspace } = useChat();
  const [isLoading, setIsLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [connectionTest, setConnectionTest] = useState<any>(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  useEffect(() => {
    // Prevent multiple initializations
    if (hasInitialized) return;

    const initializeChat = async () => {
      if (workspaceId && typeof workspaceId === "string") {
        setHasInitialized(true);
        try {
          // Check if we have a token
          const token = localStorage.getItem("accessToken");
          console.log("Token exists:", !!token);

          // Comprehensive connection testing
          const tests = {
            hasToken: !!token,
            backendReachable: false,
            authValid: false,
            socketConnectable: false,
            workspaceAccess: false,
          };

          // Test 1: Backend reachability
          try {
            const healthCheck = await fetch(
              "http://localhost:4000/chat/health",
            );
            if (healthCheck.ok) {
              tests.backendReachable = true;
              console.log("✅ Backend reachable");
            }
          } catch (error) {
            console.log("❌ Backend not reachable:", error);
          }

          // Test 2: Auth validation
          if (token) {
            try {
              const authTest = await fetch("http://localhost:4000/users/me", {
                headers: { Authorization: `Bearer ${token}` },
              });
              if (authTest.ok) {
                tests.authValid = true;
                console.log("✅ Auth valid");
              } else {
                console.log("❌ Auth invalid:", authTest.status);
                // If auth is invalid, remove bad token
                if (authTest.status === 401) {
                  localStorage.removeItem("accessToken");
                  localStorage.removeItem("refreshToken");
                }
              }
            } catch (error) {
              console.log("❌ Auth test failed:", error);
            }
          }

          // Test 3: Workspace access
          if (tests.authValid) {
            try {
              const workspaceTest = await fetch(
                `http://localhost:4000/workspaces/${workspaceId}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                },
              );
              if (workspaceTest.ok) {
                tests.workspaceAccess = true;
                console.log("✅ Workspace accessible");
              } else {
                console.log(
                  "❌ Workspace not accessible:",
                  workspaceTest.status,
                );
              }
            } catch (error) {
              console.log("❌ Workspace test failed:", error);
            }
          }

          setConnectionTest(tests);

          setDebugInfo({
            hasToken: !!token,
            workspaceId,
            timestamp: new Date().toISOString(),
            tests,
          });

          // Auto-redirect if authentication failed
          if (!tests.authValid && tests.hasToken) {
            setTimeout(() => {
              localStorage.removeItem("accessToken");
              localStorage.removeItem("refreshToken");
              window.location.href = "/login";
            }, 3000);
            return;
          }

          // Only proceed if authentication is valid
          if (tests.authValid && tests.workspaceAccess) {
            await setWorkspace(workspaceId);
          }
        } catch (error) {
          console.error("Chat initialization error:", error);
          const hasToken = !!localStorage.getItem("accessToken");

          setDebugInfo({
            hasToken,
            backendHealth: null,
            error: error.message,
            workspaceId,
            timestamp: new Date().toISOString(),
            tests: {
              hasToken,
              backendReachable: false,
              authValid: false,
              socketConnectable: false,
              workspaceAccess: false,
            },
          });
          setConnectionTest({
            hasToken,
            backendReachable: false,
            authValid: false,
            socketConnectable: false,
            workspaceAccess: false,
          });

          // Auto-redirect if no token
          if (!hasToken) {
            setTimeout(() => {
              window.location.href = "/login";
            }, 2000);
          }
        } finally {
          setIsLoading(false);
        }
      }
    };

    initializeChat();
  }, [workspaceId, setWorkspace, hasInitialized]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="glass rounded-2xl p-8 flex flex-col items-center space-y-6 max-w-md w-full">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-transparent bg-gradient-to-r from-violet-500 to-blue-500 rounded-full"></div>
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-violet-300 border-t-transparent absolute top-0"></div>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Initializing Chat
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Connecting to your workspace and loading conversations...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!state.isConnected) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="glass rounded-2xl p-8 text-center max-w-2xl w-full">
          <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-500/20 dark:to-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-6 neon-glow-violet">
            <WifiOff className="h-10 w-10 text-red-500 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              Connection Error
            </h3>
            <p className="text-gray-600 dark:text-gray-300 text-lg mb-6">
              {connectionTest && !connectionTest.hasToken
                ? "Please log in to access chat"
                : connectionTest && !connectionTest.authValid
                  ? "Authentication expired - please log in again"
                  : connectionTest && !connectionTest.backendReachable
                    ? "Backend server is not running"
                    : "Unable to connect to chat service"}
            </p>

            {debugInfo && (
              <div className="mt-6 glass-strong rounded-xl p-6 text-left">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-500" />
                  Connection Diagnostics
                </h4>

                {connectionTest && (
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2">
                      {connectionTest.hasToken ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span>Authentication Token</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {connectionTest.backendReachable ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span>Backend Server (Port 4000)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {connectionTest.authValid ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span>Authentication Valid</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {connectionTest.workspaceAccess ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span>Workspace Access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {state.isConnected ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-600" />
                      )}
                      <span>WebSocket Connection</span>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-gray-300 dark:border-gray-600 text-xs text-gray-500 dark:text-gray-400">
                  <div>Workspace ID: {workspaceId}</div>
                  <div>Timestamp: {debugInfo.timestamp}</div>
                  {debugInfo.error && (
                    <div className="text-red-600 mt-1">
                      Error: {debugInfo.error}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              {/* Primary action based on issue */}
              {connectionTest && !connectionTest.hasToken ? (
                <button
                  onClick={() => {
                    window.location.href = "/login";
                  }}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <LogIn className="h-5 w-5" />
                  Go to Login
                </button>
              ) : connectionTest && !connectionTest.authValid ? (
                <button
                  onClick={() => {
                    localStorage.removeItem("accessToken");
                    localStorage.removeItem("refreshToken");
                    window.location.href = "/login";
                  }}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
                >
                  <LogIn className="h-5 w-5" />
                  Re-authenticate
                </button>
              ) : (
                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <RefreshCw className="h-5 w-5" />
                  Retry Connection
                </button>
              )}

              {/* Secondary actions */}
              <button
                onClick={() => {
                  window.location.href = "/dashboard";
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                <Home className="h-4 w-4" />
                Back to Dashboard
              </button>
            </div>

            {/* Help information based on specific issues */}
            {connectionTest && !connectionTest.backendReachable && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <p className="text-sm text-red-600 dark:text-red-400 font-medium">
                    Backend Server Not Running
                  </p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  The backend server needs to be running on port 4000 for the
                  chat system to work.
                </p>
                <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded text-sm">
                  <code>cd backend && bun run dev</code>
                </div>
              </div>
            )}

            {connectionTest && !connectionTest.hasToken && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-2">
                  <LogIn className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                    Authentication Required
                  </p>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  You need to be logged in to access the chat system. The
                  typical flow is:
                </p>
                <ol className="text-sm text-gray-600 dark:text-gray-400 space-y-1 list-decimal list-inside">
                  <li>
                    Go to{" "}
                    <span className="font-mono bg-gray-200 dark:bg-gray-700 px-1 rounded">
                      /dashboard/chat
                    </span>
                  </li>
                  <li>Select your workspace</li>
                  <li>Access team chat features</li>
                </ol>
              </div>
            )}

            {connectionTest &&
              connectionTest.hasToken &&
              !connectionTest.authValid && (
                <div className="mt-6 glass-strong rounded-xl p-6 border border-amber-200 dark:border-amber-800">
                  <div className="flex items-center gap-3 mb-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    <p className="font-semibold text-amber-700 dark:text-amber-300">
                      Session Expired
                    </p>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300">
                    Your login session has expired. Please log in again to
                    continue using the chat system.
                  </p>
                </div>
              )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full gap-4 p-4">
      {/* Sidebar */}
      {state.showSidebar && (
        <div className="w-80 glass rounded-2xl flex flex-col overflow-hidden">
          <ChatSidebar />
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {state.activeConversation ? (
          <div className="glass rounded-2xl h-full overflow-hidden">
            <ChatWindow />
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="glass rounded-2xl p-12 text-center max-w-lg w-full">
              <div className="w-20 h-20 bg-gradient-to-br from-violet-100 to-blue-100 dark:from-violet-500/20 dark:to-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-6 neon-glow-blue">
                <MessageCircle className="h-10 w-10 text-violet-600 dark:text-violet-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Welcome to Chat
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-8 text-lg">
                Select a conversation from the sidebar to start chatting, or
                create a new one.
              </p>

              <div className="space-y-4">
                <div className="glass-strong rounded-xl p-4 flex items-center text-gray-700 dark:text-gray-200">
                  <Users className="h-5 w-5 mr-3 text-violet-500" />
                  <span>Create group channels for team discussions</span>
                </div>
                <div className="glass-strong rounded-xl p-4 flex items-center text-gray-700 dark:text-gray-200">
                  <MessageCircle className="h-5 w-5 mr-3 text-blue-500" />
                  <span>Start direct messages with team members</span>
                </div>
                <div className="glass-strong rounded-xl p-4 flex items-center text-gray-700 dark:text-gray-200">
                  <FileText className="h-5 w-5 mr-3 text-emerald-500" />
                  <span>Chat about specific documents</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Thread Panel */}
      {state.showThreadPanel && (
        <div className="w-96 glass rounded-2xl overflow-hidden">
          <ThreadPanel />
        </div>
      )}
    </div>
  );
}
