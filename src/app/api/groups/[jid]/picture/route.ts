import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

// PUT: Update group picture
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

        const formData = await request.formData();
        const sessionId = formData.get("sessionId") as string;
        const file = formData.get("file") as File;

        if (!sessionId || !file) {
            return NextResponse.json({ error: "sessionId and file are required" }, { status: 400 });
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

        // Convert File to Buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // Update group picture
        await instance.socket.updateProfilePicture(decodedJid, buffer);

        return NextResponse.json({ success: true, message: "Group picture updated successfully" });

    } catch (error: any) {
        console.error("Update group picture error:", error);
        
        // Handle specific errors
        if (error.message?.includes("not-admin") || error.message?.includes("forbidden")) {
            return NextResponse.json({ error: "Bot must be admin to update group picture" }, { status: 403 });
        }
        
        return NextResponse.json({ error: "Failed to update group picture" }, { status: 500 });
    }
}

// DELETE: Remove group picture
export async function DELETE(
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

        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get("sessionId");

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

        // Remove group picture
        await instance.socket.removeProfilePicture(decodedJid);

        return NextResponse.json({ success: true, message: "Group picture removed successfully" });

    } catch (error: any) {
        console.error("Remove group picture error:", error);
        
        if (error.message?.includes("not-admin") || error.message?.includes("forbidden")) {
            return NextResponse.json({ error: "Bot must be admin to remove group picture" }, { status: 403 });
        }
        
        return NextResponse.json({ error: "Failed to remove group picture" }, { status: 500 });
    }
}
