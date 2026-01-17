import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ jid: string }> }
) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        
        const resolvedParams = await params;
        const jid = decodeURIComponent(resolvedParams.jid);
        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get("sessionId");

        if (!sessionId) {
            return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
        }

        // Check verification
        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
             return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const instance = waManager.getInstance(sessionId);
        if (!instance?.socket) {
             return NextResponse.json({ error: "Session not ready" }, { status: 503 });
        }

        // Fetch Group Metadata
        let metadata;
        try {
            metadata = await instance.socket.groupMetadata(jid);
        } catch (e) {
            console.error("Failed to fetch group metadata:", e);
             return NextResponse.json({ error: "Failed to fetch group metadata. Ensure the bot is in the group." }, { status: 404 });
        }

        // Fetch Profile Picture
        let ppUrl = null;
        try {
            ppUrl = await instance.socket.profilePictureUrl(jid, 'image');
        } catch (e) {
            // Ignore error if no PP
        }

        return NextResponse.json({
            ...metadata,
            pictureUrl: ppUrl
        });

    } catch (error) {
        console.error("Get group details error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
