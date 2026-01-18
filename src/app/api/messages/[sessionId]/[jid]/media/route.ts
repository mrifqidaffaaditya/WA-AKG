
import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

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
        const formData = await request.formData();
        const file = formData.get("file") as File;
        const type = formData.get("type") as string; // image, video, audio, document
        const caption = formData.get("caption") as string || "";
        
        if (!file) {
             return NextResponse.json({ error: "file is required" }, { status: 400 });
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

        // Convert File to Buffer
        const buffer = Buffer.from(await file.arrayBuffer());

        const mimetype = file.type;
        
        const messageOptions: any = {};
        if (caption) messageOptions.caption = caption;
        messageOptions.mimetype = mimetype;
        
        // Handle different types
        let content: any = {};

        if (type === 'image') {
            content = { image: buffer, ...messageOptions };
        } else if (type === 'video') {
             content = { video: buffer, ...messageOptions };
        } else if (type === 'audio') {
             content = { audio: buffer, mimetype: 'audio/mp4', ptt: false }; // ptt depends on needs
        } else if (type === 'voice') {
             content = { audio: buffer, mimetype: 'audio/mp4', ptt: true };
        } else if (type === 'document') {
             content = { document: buffer, mimetype, fileName: file.name, ...messageOptions };
        } else {
             // Default to document logic if unknown, or maybe image if implicit?
             // Let's assume generic file is document
             content = { document: buffer, mimetype, fileName: file.name, ...messageOptions };
        }

        const sent = await instance.socket.sendMessage(decodedJid, content);

        return NextResponse.json({ success: true, data: sent });

    } catch (e) {
        console.error("Media send error", e);
        return NextResponse.json({ error: "Failed to send media" }, { status: 500 });
    }
}
