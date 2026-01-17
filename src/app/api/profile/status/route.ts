import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

/**
 * @deprecated This endpoint is deprecated. Use PUT /api/profile/{sessionId}/status instead.
 * This endpoint will be removed in a future version.
 */
// PUT: Update profile status/about
export async function PUT(request: NextRequest) {
    console.warn('[DEPRECATED] PUT /api/profile/status is deprecated. Use PUT /api/profile/{sessionId}/status instead.');
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { sessionId, status } = body;

        if (!sessionId || status === undefined) {
            return NextResponse.json({ error: "sessionId and status are required" }, { status: 400 });
        }

        if (status.length > 139) {
            return NextResponse.json({ error: "Status must be 139 characters or less" }, { status: 400 });
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

        // Update profile status
        await instance.socket.updateProfileStatus(status);

        return NextResponse.json({ 
            success: true,
            message: "Profile status updated successfully",
            status
        });

    } catch (error) {
        console.error("Update profile status error:", error);
        return NextResponse.json({ error: "Failed to update profile status" }, { status: 500 });
    }
}
