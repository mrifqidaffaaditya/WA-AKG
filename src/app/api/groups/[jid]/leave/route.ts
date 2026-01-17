import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

// POST: Leave group
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ jid: string }> }
) {
    const { jid } = await params;
    const decodedJid = decodeURIComponent(jid);

    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { sessionId } = body;

        if (!sessionId) {
            return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
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

        // Leave group
        await instance.socket.groupLeave(decodedJid);

        return NextResponse.json({ 
            success: true,
            message: "Successfully left the group"
        });

    } catch (error: any) {
        console.error("Leave group error:", error);
        return NextResponse.json({ error: "Failed to leave group" }, { status: 500 });
    }
}
