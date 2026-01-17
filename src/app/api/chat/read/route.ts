import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

/**
 * @deprecated This endpoint is deprecated. Use PUT /api/chat/{sessionId}/{jid}/read instead.
 * This endpoint will be removed in a future version.
 */
// PUT: Mark messages as read
export async function PUT(request: NextRequest) {
    console.warn('[DEPRECATED] PUT /api/chat/read is deprecated. Use PUT /api/chat/{sessionId}/{jid}/read instead.');
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { sessionId, jid, messageIds } = body;

        if (!sessionId || !jid) {
            return NextResponse.json({ 
                error: "sessionId and jid are required" 
            }, { status: 400 });
        }

        // Check if user can access this session
        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ error: "Forbidden - Cannot access this session" }, { status: 403 });
        }

        const instance = waManager.getInstance(sessionId);
        if (!instance?.socket) {
            return NextResponse.json({ error: "Session not ready" }, { status: 503 });
        }

        // If specific message IDs provided, mark those as read
        // Otherwise, mark entire chat as read
        if (messageIds && Array.isArray(messageIds) && messageIds.length > 0) {
            for (const messageId of messageIds) {
                await instance.socket.readMessages([{
                    remoteJid: jid,
                    id: messageId,
                    participant: undefined
                }]);
            }
        } else {
            // Mark all messages in chat as read
            // Note: lastMessages is required by Baileys but can be empty array
            await instance.socket.chatModify(
                { markRead: true, lastMessages: [] },
                jid
            );
        }

        return NextResponse.json({ 
            success: true,
            message: "Messages marked as read"
        });

    } catch (error) {
        console.error("Mark as read error:", error);
        return NextResponse.json({ error: "Failed to mark messages as read" }, { status: 500 });
    }
}
