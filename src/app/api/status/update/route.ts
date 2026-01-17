import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

export async function POST(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { sessionId, content, type = "TEXT", mediaUrl, backgroundColor, font, mentions } = body; 
        
        if (!sessionId || !content) {
             return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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

        // Get database session ID for foreign key
        const dbSession = await prisma.session.findUnique({
            where: { sessionId },
            select: { id: true }
        });

        if (!dbSession) {
            return NextResponse.json({ error: "Session not found in database" }, { status: 404 });
        }

        const statusJid = 'status@broadcast';

        let message: any = {};
        let options: any = {};

        if (mentions && Array.isArray(mentions) && mentions.length > 0) {
            options.statusJidList = mentions;
        }
        
        if (type === 'TEXT') {
            message = { 
                extendedTextMessage: {
                    text: content,
                    backgroundArgb: backgroundColor || 0xff000000,
                    font: font || 0
                }
            };
        } else if (type === 'IMAGE' && mediaUrl) {
            message = {
                image: { url: mediaUrl },
                caption: content
            };
        } else if (type === 'VIDEO' && mediaUrl) {
            message = {
                video: { url: mediaUrl },
                caption: content
            };
        }

        await instance.socket.sendMessage(statusJid, message, options);
        
        // Save to DB with correct session ID
        await prisma.story.create({
            data: {
                sessionId: dbSession.id,  // Use database ID, not sessionId string
                jid: statusJid,
                content,
                mediaUrl,
                type
            }
        });

        return NextResponse.json({ success: true });

    } catch (e) {
        console.error("Post status error", e);
        return NextResponse.json({ error: "Failed to post status" }, { status: 500 });
    }
}
