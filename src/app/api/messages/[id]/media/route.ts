import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

// GET: Download media from message
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: messageId } = await params;

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

        // Find message in database
        const message = await prisma.message.findUnique({
            where: { id: messageId },
        });

        if (!message) {
            return NextResponse.json({ error: "Message not found" }, { status: 404 });
        }

        if (message.sessionId !== sessionId) {
            return NextResponse.json({ error: "Message does not belong to this session" }, { status: 403 });
        }

        if (!message.mediaUrl) {
            return NextResponse.json({ error: "Message has no media" }, { status: 404 });
        }

        // If mediaUrl is a local path, return it
        // If it's external URL, redirect to it
        if (message.mediaUrl.startsWith('http')) {
            return NextResponse.redirect(message.mediaUrl);
        }

        // For local files, read and return
        const fs = require('fs');
        const path = require('path');
        
        const filePath = path.join(process.cwd(), message.mediaUrl);
        
        if (!fs.existsSync(filePath)) {
            return NextResponse.json({ error: "Media file not found on disk" }, { status: 404 });
        }

        const fileBuffer = fs.readFileSync(filePath);
        const mimeType = message.type === 'IMAGE' ? 'image/jpeg' 
            : message.type === 'VIDEO' ? 'video/mp4'
            : message.type === 'AUDIO' ? 'audio/mpeg'
            : message.type === 'DOCUMENT' ? 'application/pdf'
            : 'application/octet-stream';

        // Extract filename from path
        const fileName = path.basename(message.mediaUrl);

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': mimeType,
                'Content-Disposition': `attachment; filename="${fileName}"`,
            },
        });

    } catch (error) {
        console.error("Download media error:", error);
        return NextResponse.json({ error: "Failed to download media" }, { status: 500 });
    }
}
