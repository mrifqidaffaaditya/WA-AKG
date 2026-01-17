import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

/**
 * @deprecated This endpoint is deprecated. Use PUT /api/chat/{sessionId}/{jid}/pin instead.
 * This endpoint will be removed in a future version.
 */
// PUT: Pin or unpin a chat
export async function PUT(request: NextRequest) {
    console.warn('[DEPRECATED] PUT /api/chat/pin is deprecated. Use PUT /api/chat/{sessionId}/{jid}/pin instead.');
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { sessionId, jid, pin } = body;

        if (!sessionId || !jid || pin === undefined) {
            return NextResponse.json({ 
                error: "sessionId, jid, and pin (boolean) are required" 
            }, { status: 400 });
        }
        
        const decodedJid = decodeURIComponent(jid);

        // Check if user can access this session
        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ error: "Forbidden - Cannot access this session" }, { status: 403 });
        }

        const instance = waManager.getInstance(sessionId);
        if (!instance?.socket) {
            return NextResponse.json({ error: "Session not ready" }, { status: 503 });
        }

        // Pin or unpin chat
        await instance.socket.chatModify(
            { 
                pin: pin,
                lastMessages: []
            },
            decodedJid
        );

        return NextResponse.json({ 
            success: true,
            message: pin ? "Chat pinned successfully" : "Chat unpinned successfully"
        });

    } catch (error) {
        console.error("Pin chat error:", error);
        return NextResponse.json({ error: "Failed to pin/unpin chat" }, { status: 500 });
    }
}
