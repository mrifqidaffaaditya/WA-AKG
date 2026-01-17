import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

// PUT: Archive or unarchive chat
export async function PUT(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { sessionId, jid, archive } = body;

        if (!sessionId || !jid || archive === undefined) {
            return NextResponse.json({ 
                error: "sessionId, jid, and archive (boolean) are required" 
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

        // Archive or unarchive chat
        // Note: lastMessages is required by Baileys but can be empty array
        await instance.socket.chatModify(
            { archive: archive, lastMessages: [] },
            jid
        );

        return NextResponse.json({ 
            success: true,
            message: archive ? "Chat archived" : "Chat unarchived"
        });

    } catch (error) {
        console.error("Archive chat error:", error);
        return NextResponse.json({ error: "Failed to archive/unarchive chat" }, { status: 500 });
    }
}
