import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { broadcastSchema } from "@/lib/validations";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";
import type { AnyMessageContent } from "@whiskeysockets/baileys";

/**
 * @deprecated This endpoint is deprecated. Use POST /api/messages/{sessionId}/broadcast instead.
 * This endpoint will be removed in a future version.
 */
export async function POST(request: NextRequest) {
    console.warn('[DEPRECATED] POST /api/messages/broadcast is deprecated. Use POST /api/messages/{sessionId}/broadcast instead.');
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const parseResult = broadcastSchema.safeParse(body);
        if (!parseResult.success) {
             return NextResponse.json({ error: parseResult.error.flatten() }, { status: 400 });
        }
        
        const { sessionId, recipients, message, delay } = parseResult.data;

        // Check if user can access this session
        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ error: "Forbidden - Cannot access this session" }, { status: 403 });
        }

        const instance = waManager.getInstance(sessionId);
        if (!instance?.socket) {
            return NextResponse.json({ error: "Session not ready" }, { status: 503 });
        }

        // Convert string message to AnyMessageContent object
        const messageContent: AnyMessageContent = { text: message };

        // Process in background to avoid timeout
        (async () => {
             for (const jid of recipients) {
                 try {
                     await instance.socket!.sendMessage(jid, messageContent);
                     
                     // Random delay between 10-20 seconds per message
                     const randomDelay = Math.floor(Math.random() * 10000) + 10000;
                     console.log(`Waiting ${randomDelay / 1000}s before next broadcast message`);
                     await new Promise(r => setTimeout(r, randomDelay));
                 } catch (e) {
                     console.error(`Failed to send broadcast to ${jid}`, e);
                 }
             }
             console.log(`Broadcast completed for ${recipients.length} recipients`);
        })();
        
        return NextResponse.json({ success: true, message: "Broadcast started in background" });

    } catch (e) {
        console.error("Broadcast error", e);
        return NextResponse.json({ error: "Failed to start broadcast" }, { status: 500 });
    }
}
