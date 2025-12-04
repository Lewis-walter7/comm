"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useChat } from "../../../../../context/chat/ChatContext";
import ChatWindow from "../../../../../components/chat/ChatWindow";
import ThreadPanel from "../../../../../components/chat/ThreadPanel";
import { ArrowLeft, MessageCircle } from "lucide-react";

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.workspaceId as string;
  const conversationId = params.conversationId as string;
  const { state, setWorkspace, selectConversation } = useChat();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeConversation = async () => {
      try {
        // Set workspace if not already set
        if (state.currentWorkspace !== workspaceId) {
          await setWorkspace(workspaceId);
        }

        // Find and select the conversation
        let conversation = state.conversations.find(
          (c) => c.id === conversationId,
        );

        // If conversation not found in current list, try to fetch it directly
        if (!conversation) {
          // In a real implementation, you might need to fetch the conversation by ID
          // For now, we'll redirect back to chat home
          setError("Conversation not found");
          return;
        }

        await selectConversation(conversation);
      } catch (err) {
        console.error("Failed to initialize conversation:", err);
        setError("Failed to load conversation");
      } finally {
        setIsLoading(false);
      }
    };

    if (workspaceId && conversationId) {
      initializeConversation();
    }
  }, [
    workspaceId,
    conversationId,
    state.currentWorkspace,
    state.conversations,
    setWorkspace,
    selectConversation,
  ]);

  const handleBackToChat = () => {
    router.push(`/w/${workspaceId}/chat`);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-500">Loading conversation...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <MessageCircle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">{error}</h3>
            <p className="text-gray-500 mt-1">
              The conversation you're looking for doesn't exist or you don't
              have access to it.
            </p>
            <button
              onClick={handleBackToChat}
              className="mt-4 inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Chat</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!state.isConnected) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4 text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <MessageCircle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              Connection Error
            </h3>
            <p className="text-gray-500 mt-1">
              Unable to connect to chat service
            </p>
            <div className="flex space-x-3 mt-4">
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Retry
              </button>
              <button
                onClick={handleBackToChat}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Back to Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (
    !state.activeConversation ||
    state.activeConversation.id !== conversationId
  ) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="text-gray-500">Loading conversation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Mobile back button */}
        <div className="md:hidden flex items-center p-2 border-b border-gray-200 bg-white">
          <button
            onClick={handleBackToChat}
            className="inline-flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </button>
        </div>

        <ChatWindow />
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
