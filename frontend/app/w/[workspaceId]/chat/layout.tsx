"use client";

import { ChatProvider } from "../../../../context/chat/ChatContext";

export default function ChatLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
}) {
  return (
    <ChatProvider>
      <div className="h-screen w-screen overflow-hidden bg-gradient-to-br from-gray-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative z-10 w-full h-full">{children}</div>
      </div>
    </ChatProvider>
  );
}
