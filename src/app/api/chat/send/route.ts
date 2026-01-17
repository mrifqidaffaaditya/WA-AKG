import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";
import Sticker from "wa-sticker-formatter";

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { sessionId, jid, message } = body;

        if (!sessionId || !jid || !message) {
            return NextResponse.json({ error: "sessionId, jid, and message are required" }, { status: 400 });
        }

        // Check if user can access this session
        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ error: "Forbidden - Cannot access this session" }, { status: 403 });
        }

        const instance = waManager.getInstance(sessionId);
        if (!instance) {
            return NextResponse.json({ error: "Session not found or disconnected" }, { status: 404 });
        }

        const socket = instance.socket;
        if (!socket) {
             return NextResponse.json({ error: "Socket not ready" }, { status: 503 });
        }

        // Process Message
        let msgPayload = message;

        // Custom Handler for Sticker URL
        if (msgPayload.sticker && (msgPayload.sticker.url || typeof msgPayload.sticker === 'string')) {
            const url = msgPayload.sticker.url || msgPayload.sticker;
            
            try {
                const res = await fetch(url);
                if (!res.ok) throw new Error(`Failed to fetch sticker media: ${res.statusText}`);
                const buffer = await res.arrayBuffer();
                
                const sticker = new Sticker(Buffer.from(buffer), {
                    pack: msgPayload.sticker.pack || "WA-AKG Bot",
                    author: msgPayload.sticker.author || "WA-AKG",
                    type: "full",
                    quality: 50
                });

                const stickerBuffer = await sticker.toBuffer();
                msgPayload = { sticker: stickerBuffer };

            } catch (e) {
                console.error("Sticker generation from URL failed:", e);
                return NextResponse.json({ error: `Failed to generate sticker from URL: ${(e as any).message}` }, { status: 400 });
            }
        }

        // Send Message
        await socket.sendMessage(jid, msgPayload);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Send message error:", error);
        return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
    }
}
