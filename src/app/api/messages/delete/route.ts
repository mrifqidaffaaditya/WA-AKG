import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

// DELETE: Delete message for everyone
export async function DELETE(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { sessionId, jid, messageId } = body;

        if (!sessionId || !jid || !messageId) {
            return NextResponse.json({ 
                error: "sessionId, jid, and messageId are required" 
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

        // Delete message for everyone
        await instance.socket.sendMessage(jid, { delete: {
            remoteJid: jid,
            fromMe: true,
            id: messageId,
            participant: undefined
        }});

        return NextResponse.json({ 
            success: true,
            message: "Message deleted for everyone"
        });

    } catch (error: any) {
        console.error("Delete message error:", error);
        
        if (error.message?.includes("too old") || error.message?.includes("time limit")) {
            return NextResponse.json({ 
                error: "Cannot delete message older than 7 minutes" 
            }, { status: 400 });
        }
        
        return NextResponse.json({ error: "Failed to delete message" }, { status: 500 });
    }
}
