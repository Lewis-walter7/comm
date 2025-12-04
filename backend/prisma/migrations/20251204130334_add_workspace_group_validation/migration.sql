-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "allowMemberInvite" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isPrivate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "maxMembers" INTEGER DEFAULT 100,
ADD COLUMN     "muteNotifications" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "pinnedMessageIds" TEXT[];

-- AlterTable
ALTER TABLE "ConversationMember" ADD COLUMN     "customNickname" TEXT,
ADD COLUMN     "leftAt" TIMESTAMP(3),
ADD COLUMN     "muteNotifications" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "notificationSettings" JSONB;

-- AlterTable
ALTER TABLE "DailyAnalytics" ADD COLUMN     "groupChatsCreated" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "contentVector" TEXT,
ADD COLUMN     "isPinned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mentions" TEXT[],
ADD COLUMN     "messageType" TEXT NOT NULL DEFAULT 'text',
ADD COLUMN     "metadata" JSONB,
ADD COLUMN     "searchKeywords" TEXT[];

-- CreateTable
CREATE TABLE "GroupChatInvite" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "inviterId" TEXT NOT NULL,
    "inviteeId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GroupChatInvite_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageSearchIndex" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "workspaceId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "keywords" TEXT[],
    "authorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageSearchIndex_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GroupChatInvite_conversationId_idx" ON "GroupChatInvite"("conversationId");

-- CreateIndex
CREATE INDEX "GroupChatInvite_inviterId_idx" ON "GroupChatInvite"("inviterId");

-- CreateIndex
CREATE INDEX "GroupChatInvite_inviteeId_idx" ON "GroupChatInvite"("inviteeId");

-- CreateIndex
CREATE INDEX "GroupChatInvite_workspaceId_idx" ON "GroupChatInvite"("workspaceId");

-- CreateIndex
CREATE INDEX "GroupChatInvite_status_idx" ON "GroupChatInvite"("status");

-- CreateIndex
CREATE INDEX "GroupChatInvite_expiresAt_idx" ON "GroupChatInvite"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "GroupChatInvite_conversationId_inviteeId_key" ON "GroupChatInvite"("conversationId", "inviteeId");

-- CreateIndex
CREATE UNIQUE INDEX "MessageSearchIndex_messageId_key" ON "MessageSearchIndex"("messageId");

-- CreateIndex
CREATE INDEX "MessageSearchIndex_workspaceId_idx" ON "MessageSearchIndex"("workspaceId");

-- CreateIndex
CREATE INDEX "MessageSearchIndex_conversationId_idx" ON "MessageSearchIndex"("conversationId");

-- CreateIndex
CREATE INDEX "MessageSearchIndex_keywords_idx" ON "MessageSearchIndex"("keywords");

-- CreateIndex
CREATE INDEX "MessageSearchIndex_authorId_idx" ON "MessageSearchIndex"("authorId");

-- CreateIndex
CREATE INDEX "MessageSearchIndex_createdAt_idx" ON "MessageSearchIndex"("createdAt");

-- CreateIndex
CREATE INDEX "Conversation_isPrivate_idx" ON "Conversation"("isPrivate");

-- CreateIndex
CREATE INDEX "ConversationMember_leftAt_idx" ON "ConversationMember"("leftAt");

-- CreateIndex
CREATE INDEX "Message_mentions_idx" ON "Message"("mentions");

-- CreateIndex
CREATE INDEX "Message_messageType_idx" ON "Message"("messageType");

-- CreateIndex
CREATE INDEX "Message_isPinned_idx" ON "Message"("isPinned");

-- CreateIndex
CREATE INDEX "Message_searchKeywords_idx" ON "Message"("searchKeywords");

-- AddForeignKey
ALTER TABLE "GroupChatInvite" ADD CONSTRAINT "GroupChatInvite_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupChatInvite" ADD CONSTRAINT "GroupChatInvite_inviterId_fkey" FOREIGN KEY ("inviterId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupChatInvite" ADD CONSTRAINT "GroupChatInvite_inviteeId_fkey" FOREIGN KEY ("inviteeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GroupChatInvite" ADD CONSTRAINT "GroupChatInvite_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageSearchIndex" ADD CONSTRAINT "MessageSearchIndex_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageSearchIndex" ADD CONSTRAINT "MessageSearchIndex_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageSearchIndex" ADD CONSTRAINT "MessageSearchIndex_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "Workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;
