"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useChat } from "../../../../../../context/chat/ChatContext";
import ChatWindow from "../../../../../../components/chat/ChatWindow";
import ThreadPanel from "../../../../../../components/chat/ThreadPanel";
import { FileText, MessageCircle } from "lucide-react";
import Image from "next/image";

export default function DocumentChatPage() {
  const params = useParams();
  const workspaceId = params.workspaceId as string;
  const docId = params.docId as string;
  const { state, setWorkspace, createConversation, selectConversation } =
    useChat();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeDocumentChat = async () => {
      try {
        // Set workspace if not already set
        if (state.currentWorkspace !== workspaceId) {
          await setWorkspace(workspaceId);
        }

        // Try to find existing document conversation
        let documentConversation = state.conversations.find(
          (c: any) => c.type === "DOCUMENT" && c.documentId === docId,
        );

        // If no document conversation exists, create one
        if (!documentConversation) {
          // In a real implementation, you'd first fetch document info
          // For now, we'll create with basic info
          const newConversation = await createConversation({
            type: "DOCUMENT",
            name: `Document Chat`,
            description: `Discussion about document`,
            workspaceId,
            documentId: docId,
          });

          if (!newConversation) {
            setError("Failed to create document chat");
            return;
          }

          documentConversation = newConversation;
        }

        await selectConversation(documentConversation);
      } catch (err) {
        console.error("Failed to initialize document chat:", err);
        setError("Failed to load document chat");
      } finally {
        setIsLoading(false);
      }
    };

    if (workspaceId && docId) {
      initializeDocumentChat();
    }
  }, [
    workspaceId,
    docId,
    state.currentWorkspace,
    state.conversations,
    setWorkspace,
    createConversation,
    selectConversation,
  ]);

  if (isLoading) {
    return (
      <div className="flex h-screen">
        {/* Document Chat Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Document Chat</h3>
                <p className="text-sm text-gray-500">Loading...</p>
              </div>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-500">
                Initializing document chat...
              </p>
            </div>
          </div>
        </div>

        {/* Main Area */}
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen">
        {/* Document Chat Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-red-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Document Chat</h3>
                <p className="text-sm text-gray-500">Error loading</p>
              </div>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-6 w-6 text-red-600" />
              </div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Failed to Load
              </h4>
              <p className="text-xs text-gray-500 mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>

        {/* Main Area */}
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">
              Unable to load document chat
            </h3>
            <p className="text-gray-500 mt-1">Please try refreshing the page</p>
          </div>
        </div>
      </div>
    );
  }

  if (!state.isConnected) {
    return (
      <div className="flex h-screen">
        {/* Document Chat Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                <FileText className="h-4 w-4 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Document Chat</h3>
                <p className="text-sm text-gray-500">Disconnected</p>
              </div>
            </div>
          </div>

          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-6 w-6 text-yellow-600" />
              </div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Connection Lost
              </h4>
              <p className="text-xs text-gray-500 mb-4">
                Reconnecting to chat service...
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>

        {/* Main Area */}
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900">
              Connection Error
            </h3>
            <p className="text-gray-500 mt-1">
              Unable to connect to chat service
            </p>
          </div>
        </div>
      </div>
    );
  }

  const documentConversation = state.activeConversation;

  return (
    <div className="flex h-screen">
      {/* Document Chat Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3 mb-3">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">Document Chat</h3>
              <p className="text-sm text-gray-500">
                {documentConversation?.members.length || 0} participant
                {(documentConversation?.members.length || 0) !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Document Info */}
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <div className="flex items-start space-x-3">
              <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-blue-900 text-sm truncate">
                  Document Discussion
                </h4>
                <p className="text-xs text-blue-700 mt-1">
                  Chat about this document with team members. Comments and
                  discussions will appear here.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Guidelines */}
        <div className="p-4 space-y-3">
          <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Chat Guidelines
          </div>

          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5"></div>
              <p className="text-xs text-gray-600">
                Ask questions about document content
              </p>
            </div>

            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5"></div>
              <p className="text-xs text-gray-600">
                Suggest improvements or changes
              </p>
            </div>

            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-1.5"></div>
              <p className="text-xs text-gray-600">
                Share related resources or links
              </p>
            </div>

            <div className="flex items-start space-x-2">
              <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5"></div>
              <p className="text-xs text-gray-600">
                Collaborate on document sections
              </p>
            </div>
          </div>
        </div>

        {/* Participants */}
        {documentConversation && documentConversation.members.length > 0 && (
          <div className="border-t border-gray-200 p-4">
            <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
              Participants ({documentConversation.members.length})
            </div>

            <div className="space-y-2">
              {documentConversation.members.slice(0, 5).map((member: any) => (
                <div key={member.id} className="flex items-center space-x-2">
                  {member.user.avatarUrl ? (
                    <Image
                      src={member.user.avatarUrl}
                      alt={member.user.name}
                      className="h-6 w-6 rounded-full"
                    />
                  ) : (
                    <div className="h-6 w-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-medium">
                      {member.user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {member.user.name}
                    </p>
                    {member.role === "ADMIN" && (
                      <span className="text-xs text-blue-600">Admin</span>
                    )}
                  </div>

                  {/* Presence indicator */}
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              ))}

              {documentConversation.members.length > 5 && (
                <p className="text-xs text-gray-500 pt-1">
                  +{documentConversation.members.length - 5} more
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {documentConversation ? (
          <ChatWindow />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center max-w-sm">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Document Chat
              </h3>
              <p className="text-gray-500 mb-6">
                Start discussing this document with your team members. Share
                insights, ask questions, and collaborate effectively.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Thread Panel */}
      {state.showThreadPanel && (
        <div className="w-96 bg-white border-l border-gray-200">
          <ThreadPanel />
        </div>
      )}
    </div>
  );
}
