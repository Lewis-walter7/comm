"use client";

import { useParams } from "next/navigation";
import GroupSettingsPage from "../../../../../../components/chat/GroupSettingsPage";

export default function ConversationSettingsPage() {
    const params = useParams();
    const conversationId = params.conversationId as string;
    const workspaceId = params.workspaceId as string;

    return (
        <div className="flex h-full">
            <GroupSettingsPage
                conversationId={conversationId}
                workspaceId={workspaceId}
            />
        </div>
    );
}
