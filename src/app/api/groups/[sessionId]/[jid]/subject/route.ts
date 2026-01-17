import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

// PUT: Update group subject/name
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string; jid: string }> }
) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { sessionId, jid } = await params;
        const decodedJid = decodeURIComponent(jid);
        const body = await request.json();
        const { subject } = body;

        if (!subject) {
            return NextResponse.json({ error: "subject is required" }, { status: 400 });
        }

        if (subject.length > 100) {
            return NextResponse.json({ error: "Subject must be 100 characters or less" }, { status: 400 });
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

        // Update group subject
        await instance.socket.groupUpdateSubject(decodedJid, subject);

        return NextResponse.json({ 
            success: true, 
            message: "Group subject updated successfully",
            subject 
        });

    } catch (error: any) {
        console.error("Update group subject error:", error);
        
        // Handle specific errors
        if (error.message?.includes("not-admin") || error.message?.includes("forbidden")) {
            return NextResponse.json({ error: "Bot must be admin to update group subject" }, { status: 403 });
        }
        
        return NextResponse.json({ error: "Failed to update group subject" }, { status: 500 });
    }
}
