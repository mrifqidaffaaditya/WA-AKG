import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { createGroupSchema } from "@/lib/validations";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

/**
 * @deprecated This endpoint is deprecated. Use POST /api/groups/{sessionId}/create instead.
 * This endpoint will be removed in a future version.
 */
export async function POST(request: NextRequest) {
    console.warn('[DEPRECATED] POST /api/groups/create is deprecated. Use POST /api/groups/{sessionId}/create instead.');
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        
        const parseResult = createGroupSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({ error: parseResult.error.flatten() }, { status: 400 });
        }

        const { subject, participants, sessionId } = parseResult.data;

        // Check if user can access this session
        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ error: "Forbidden - Cannot access this session" }, { status: 403 });
        }

        const instance = waManager.getInstance(sessionId);
        if (!instance?.socket) {
            return NextResponse.json({ error: "Session not ready" }, { status: 503 });
        }

        const group = await instance.socket.groupCreate(subject, participants);
        
        return NextResponse.json({ success: true, group });

    } catch (e) {
        console.error("Create group error", e);
        return NextResponse.json({ error: "Failed to create group" }, { status: 500 });
    }
}
