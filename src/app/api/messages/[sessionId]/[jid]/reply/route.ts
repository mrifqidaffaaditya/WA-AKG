import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

/**
 * POST /api/messages/{sessionId}/{jid}/reply
 * Reply to a message with messageId provided in the request body
 * Uses same request format as /send: { message, mentions }
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string; jid: string }> }
) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { sessionId, jid: rawJid } = await params;
        const jid = decodeURIComponent(rawJid);

        const body = await request.json();
        const { messageId, message, mentions, fromMe } = body;

        if (!messageId) {
            return NextResponse.json({ error: "messageId is required" }, { status: 400 });
        }

        if (!message) {
            return NextResponse.json({ error: "message is required" }, { status: 400 });
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

        // Construct the quoted message key
        const quotedMsg = {
            key: {
                remoteJid: jid,
                fromMe: fromMe === true,
                id: messageId
            },
            message: {}
        };

        // Process message payload (same as /send)
        let msgPayload = message;

        if (msgPayload.text && mentions && Array.isArray(mentions)) {
            msgPayload.mentions = mentions;
        }

        // Send the reply with quoted reference
        await instance.socket.sendMessage(jid, msgPayload, {
            quoted: quotedMsg as any
        });

        return NextResponse.json({ success: true, message: "Message sent successfully" });

    } catch (error) {
        console.error("Reply message error:", error);
        return NextResponse.json({ error: "Failed to send reply" }, { status: 500 });
    }
}
