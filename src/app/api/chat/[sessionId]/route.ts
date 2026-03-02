import { prisma } from "@/lib/prisma";
import { batchResolveToPhoneJid, isLidJid } from "@/lib/jid-utils";
import { NextResponse, NextRequest } from "next/server";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    const { sessionId } = await params;

    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        // Check if user can access this session
        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Forbidden - Cannot access this session", error: "Forbidden" }, { status: 403 });
        }

        // Get the database Session ID (cuid) from the sessionId string
        const session = await prisma.session.findUnique({
            where: { sessionId },
            select: { id: true }
        });

        if (!session) {
            return NextResponse.json({ status: false, message: "Session not found", error: 'Session not found' }, { status: 404 });
        }

        const dbSessionId = session.id;

        // Fetch contacts using the database id (cuid)
        const contacts = await prisma.contact.findMany({
            where: { sessionId: dbSessionId },
            orderBy: { updatedAt: 'desc' },
            select: {
                jid: true,
                name: true,
                notify: true,
                profilePic: true,
            }
        });

        // Build LID -> Phone JID lookup map for batch resolution
        const allJids = contacts.map(c => c.jid);
        const jidMap = await batchResolveToPhoneJid(allJids, dbSessionId);

        // Attach the last message for each contact and normalize JIDs
        const chatList = await Promise.all(contacts.map(async (c) => {
            const normalizedJid = jidMap.get(c.jid) || c.jid;
            const lastMessage = await prisma.message.findFirst({
                where: {
                    sessionId: dbSessionId,
                    OR: [{ remoteJid: c.jid }, { remoteJid: normalizedJid }]
                },
                orderBy: { timestamp: 'desc' },
                select: { content: true, timestamp: true, type: true }
            });
            return {
                ...c,
                jid: normalizedJid, // Always return @s.whatsapp.net format
                lastMessage
            };
        }));

        chatList.sort((a, b) => {
            const tA = a.lastMessage?.timestamp.getTime() || 0;
            const tB = b.lastMessage?.timestamp.getTime() || 0;
            return tB - tA;
        });

        return NextResponse.json({ status: true, message: "Chats fetched successfully", data: chatList });
    } catch (error) {
        console.error("Chat API error:", error);
        return NextResponse.json({ status: false, message: "Failed to fetch chats", error: 'Failed to fetch chats' }, { status: 500 });
    }
}
