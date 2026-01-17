import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

// PUT: Update group description
export async function PUT(
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
        const { sessionId, description } = body;

        if (!sessionId) {
            return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
        }

        // Description can be empty string to remove
        if (description && description.length > 512) {
            return NextResponse.json({ error: "Description must be 512 characters or less" }, { status: 400 });
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

        // Update group description
        await instance.socket.groupUpdateDescription(decodedJid, description || "");

        return NextResponse.json({ 
            success: true, 
            message: description ? "Group description updated successfully" : "Group description removed",
            description: description || null
        });

    } catch (error: any) {
        console.error("Update group description error:", error);
        
        // Handle specific errors
        if (error.message?.includes("not-admin") || error.message?.includes("forbidden")) {
            return NextResponse.json({ error: "Bot must be admin to update group description" }, { status: 403 });
        }
        
        return NextResponse.json({ error: "Failed to update group description" }, { status: 500 });
    }
}
