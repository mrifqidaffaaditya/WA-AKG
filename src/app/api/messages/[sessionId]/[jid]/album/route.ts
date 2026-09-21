import { NextResponse, NextRequest } from "next/server";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";
import { ChatService } from "@/modules/whatsapp/chat.service";

/**
 * POST /api/messages/[sessionId]/[jid]/album
 * Send WhatsApp Album message (multiple images/videos)
 */
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string; jid: string }> }
) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        const { sessionId, jid: rawJid } = await params;
        const jid = decodeURIComponent(rawJid);

        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Forbidden - Cannot access this session", error: "Forbidden - Cannot access this session" }, { status: 403 });
        }

        const body = await request.json();
        const { items, caption } = body;

        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json(
                { status: false, message: "'items' array with at least one image or video is required", error: "Invalid items" },
                { status: 400 }
            );
        }

        const sendResult = await ChatService.sendAlbumMessage(sessionId, jid, items, { caption });

        return NextResponse.json({
            status: true,
            message: "Album message sent successfully",
            data: sendResult
        });
    } catch (error: any) {
        console.error("Send album message error:", error);
        return NextResponse.json(
            { status: false, message: error.message || "Failed to send album message", error: error.message },
            { status: 500 }
        );
    }
}
