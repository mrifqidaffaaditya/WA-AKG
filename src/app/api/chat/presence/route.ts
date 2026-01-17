import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

// POST: Send presence (typing, recording, online)
export async function POST(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { sessionId, jid, presence } = body;

        if (!sessionId || !jid || !presence) {
            return NextResponse.json({ 
                error: "sessionId, jid, and presence are required" 
            }, { status: 400 });
        }

        const validPresences = ['composing', 'recording', 'paused', 'available', 'unavailable'];
        if (!validPresences.includes(presence)) {
            return NextResponse.json({ 
                error: `Invalid presence. Must be one of: ${validPresences.join(', ')}` 
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

        // Send presence update
        await instance.socket.sendPresenceUpdate(presence as any, jid);

        return NextResponse.json({ 
            success: true,
            message: `Presence '${presence}' sent to ${jid}`
        });

    } catch (error) {
        console.error("Send presence error:", error);
        return NextResponse.json({ error: "Failed to send presence" }, { status: 500 });
    }
}
