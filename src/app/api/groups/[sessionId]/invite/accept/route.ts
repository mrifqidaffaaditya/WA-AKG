import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

// POST: Accept group invite
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { sessionId } = await params;
        const body = await request.json();
        const { inviteCode } = body;

        if (!inviteCode) {
            return NextResponse.json({ error: "inviteCode is required" }, { status: 400 });
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

        // Accept group invite
        const result = await instance.socket.groupAcceptInvite(inviteCode);

        return NextResponse.json({  
            success: true,
            message: "Group invite accepted successfully",
            groupJid: result
        });

    } catch (error: any) {
        console.error("Accept group invite error:", error);
        
        if (error.message?.includes("invalid") || error.message?.includes("expired")) {
            return NextResponse.json({ error: "Invalid or expired invite code" }, { status: 400 });
        }
        
        return NextResponse.json({ error: "Failed to accept group invite" }, { status: 500 });
    }
}
