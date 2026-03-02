import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

// PUT: Update profile name
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
        const { name } = body;

        if (!name) {
            return NextResponse.json({ status: false, message: "name is required", error: "name is required" }, { status: 400 });
        }

        if (name.length > 25) {
            return NextResponse.json({ status: false, message: "Name must be 25 characters or less", error: "Name must be 25 characters or less" }, { status: 400 });
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

        // Update profile name
        await instance.socket.updateProfileName(name);

        return NextResponse.json({ 
            success: true,
            message: "Profile name updated successfully",
            name
        });

    } catch (error) {
        console.error("Update profile name error:", error);
        return NextResponse.json({ status: false, message: "Failed to update profile name", error: "Failed to update profile name" }, { status: 500 });
    }
}
