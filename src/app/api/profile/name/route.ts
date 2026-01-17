import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

// PUT: Update profile name
export async function PUT(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { sessionId, name } = body;

        if (!sessionId || !name) {
            return NextResponse.json({ error: "sessionId and name are required" }, { status: 400 });
        }

        if (name.length > 25) {
            return NextResponse.json({ error: "Name must be 25 characters or less" }, { status: 400 });
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

        // Update profile name
        await instance.socket.updateProfileName(name);

        return NextResponse.json({ 
            success: true,
            message: "Profile name updated successfully",
            name
        });

    } catch (error) {
        console.error("Update profile name error:", error);
        return NextResponse.json({ error: "Failed to update profile name" }, { status: 500 });
    }
}
