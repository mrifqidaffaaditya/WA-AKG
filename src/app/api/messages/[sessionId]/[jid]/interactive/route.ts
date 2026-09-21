import { NextResponse, NextRequest } from "next/server";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";
import { ChatService } from "@/modules/whatsapp/chat.service";

/**
 * POST /api/messages/[sessionId]/[jid]/interactive
 * Send rich interactive message (Native Flow buttons, single_select, URL, call, copy)
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
        const { title, body: bodyText, footer, header, buttons, contextInfo, externalAdReply, nativeFlowMessage } = body;

        const mainText = bodyText || title;
        if (!mainText && !header) {
            return NextResponse.json(
                { status: false, message: "Either 'body', 'title', or 'header' is required", error: "Missing message content" },
                { status: 400 }
            );
        }

        const payload = {
            title: title || "",
            body: mainText || "",
            footer: footer || "",
            header: header || undefined,
            buttons: Array.isArray(buttons) ? buttons : [],
            contextInfo,
            externalAdReply,
            nativeFlowMessage
        };

        const sendResult = await ChatService.sendInteractiveMessage(sessionId, jid, payload);

        return NextResponse.json({
            status: true,
            message: "Interactive message sent successfully",
            data: sendResult
        });
    } catch (error: any) {
        console.error("Send interactive message error:", error);
        return NextResponse.json(
            { status: false, message: error.message || "Failed to send interactive message", error: error.message },
            { status: 500 }
        );
    }
}
