import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

// POST: Send spam messages
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string; jid: string }> }
) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { sessionId, jid } = await params;
        const body = await request.json();
        const { message, count = 10, delay = 500 } = body; 
        
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

        const decodedJid = decodeURIComponent(jid);

        // Run in background
        (async () => {
             for (let i = 0; i < count; i++) {
                 try {
                     await instance.socket!.sendMessage(decodedJid, { text: message });
                     await new Promise(r => setTimeout(r, delay));
                 } catch (e) {
                     console.error(`Spam failed ${i}`, e);
                 }
             }
        })();
        
        return NextResponse.json({ success: true, message: `Bombing ${count} messages started` });

    } catch (e) {
        console.error("Spam error", e);
        return NextResponse.json({ error: "Failed to start spam" }, { status: 500 });
    }
}
