import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

// PUT: Update profile status/about
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { sessionId } = await params;

        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { status } = body;

        if (status === undefined) {
            return NextResponse.json({ status: false, message: "status is required", error: "status is required" }, { status: 400 });
        }

        if (status.length > 139) {
            return NextResponse.json({ status: false, message: "Status must be 139 characters or less", error: "Status must be 139 characters or less" }, { status: 400 });
        }

        // Check if user can access this session
        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Forbidden - Cannot access this session", error: "Forbidden - Cannot access this session" }, { status: 403 });
        }

        const instance = waManager.getInstance(sessionId);
        if (!instance?.socket) {
            return NextResponse.json({ status: false, message: "Session not ready", error: "Session not ready" }, { status: 503 });
        }

        // Update profile status
        await instance.socket.updateProfileStatus(status);

        return NextResponse.json({ 
            success: true,
            message: "Profile status updated successfully",
            status
        });

    } catch (error) {
        console.error("Update profile status error:", error);
        return NextResponse.json({ status: false, message: "Failed to update profile status", error: "Failed to update profile status" }, { status: 500 });
    }
}
