import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

// POST: Unblock a contact
export async function POST(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { sessionId, jid } = body;

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

        // Unblock contact
        await instance.socket.updateBlockStatus(jid, "unblock");

        return NextResponse.json({ 
            success: true,
            message: "Contact unblocked successfully"
        });

    } catch (error) {
        console.error("Unblock contact error:", error);
        return NextResponse.json({ error: "Failed to unblock contact" }, { status: 500 });
    }
}
