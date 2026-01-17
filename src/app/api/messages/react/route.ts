import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

// POST: Send reaction to message
export async function POST(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { sessionId, jid, messageId, emoji } = body;

        if (!sessionId || !jid || !messageId || emoji === undefined) {
            return NextResponse.json({ 
                error: "sessionId, jid, messageId, and emoji are required" 
            }, { status: 400 });
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

        // Send reaction (empty string removes reaction)
        await instance.socket.sendMessage(jid, {
            react: {
                text: emoji, // empty string to remove reaction
                key: {
                    remoteJid: jid,
                    fromMe: false,
                    id: messageId
                }
            }
        });

        return NextResponse.json({ 
            success: true,
            message: emoji ? "Reaction sent" : "Reaction removed"
        });

    } catch (error) {
        console.error("Send reaction error:", error);
        return NextResponse.json({ error: "Failed to send reaction" }, { status: 500 });
    }
}
