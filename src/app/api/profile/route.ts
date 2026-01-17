import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

/**
 * @deprecated This endpoint is deprecated. Use GET /api/profile/{sessionId} instead.
 * This endpoint will be removed in a future version.
 */
// GET: Fetch own profile
export async function GET(request: NextRequest) {
    console.warn('[DEPRECATED] GET /api/profile is deprecated. Use GET /api/profile/{sessionId} instead.');
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

        // Get own JID
        const meJid = instance.socket.user?.id;
        if (!meJid) {
            return NextResponse.json({ error: "Unable to get own JID" }, { status: 500 });
        }

        // Fetch profile status
        try {
            const statusInfo = await instance.socket.fetchStatus(meJid);
            
            return NextResponse.json({ 
                success: true,
                jid: meJid,
                status: statusInfo || null
            });
        } catch (error) {
            // If status fetch fails, return basic info
            return NextResponse.json({ 
                success: true,
                jid: meJid,
                status: null
            });
        }

    } catch (error) {
        console.error("Fetch profile error:", error);
        return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
    }
}
