import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

// PUT: Update profile picture
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { sessionId } = await params;

        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const formData = await request.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "file is required" }, { status: 400 });
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

        // Get own JID
        const meJid = instance.socket.user?.id;
        if (!meJid) {
            return NextResponse.json({ error: "Unable to get own JID" }, { status: 500 });
        }

        // Convert File to Buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        // Update profile picture
        await instance.socket.updateProfilePicture(meJid, buffer);

        return NextResponse.json({ 
            success: true,
            message: "Profile picture updated successfully"
        });

    } catch (error) {
        console.error("Update profile picture error:", error);
        return NextResponse.json({ error: "Failed to update profile picture" }, { status: 500 });
    }
}

// DELETE: Remove profile picture
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { sessionId } = await params;

        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

        // Get own JID
        const meJid = instance.socket.user?.id;
        if (!meJid) {
            return NextResponse.json({ error: "Unable to get own JID" }, { status: 500 });
        }

        // Remove profile picture
        await instance.socket.removeProfilePicture(meJid);

        return NextResponse.json({ 
            success: true,
            message: "Profile picture removed successfully"
        });

    } catch (error) {
        console.error("Remove profile picture error:", error);
        return NextResponse.json({ error: "Failed to remove profile picture" }, { status: 500 });
    }
}
