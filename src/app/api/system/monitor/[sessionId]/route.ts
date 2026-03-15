import { NextResponse, NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { waManager } from "@/modules/whatsapp/manager";

import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const resolvedParams = await params;
        const sessionId = resolvedParams.sessionId;

        const auth = await getAuthenticatedUser(req);
        if (!auth) {
            return NextResponse.json({ status: false, message: "Unauthorized" }, { status: 401 });
        }

        const instance = waManager.getInstance(sessionId);

        if (!instance || instance.status !== "CONNECTED") {
            return NextResponse.json({
                status: true,
                message: "Session is not connected",
                data: { status: instance?.status || "DISCONNECTED", uptime: 0, ping: "Offline", store: { contacts: 0, chats: 0, messages: 0 } }
            });
        }

        const uptime = instance.startTime ? Date.now() - instance.startTime.getTime() : 0;

        let pingStatus = "Unknown";
        try {
            if (instance.socket && instance.socket.ws) {
                const ws = instance.socket.ws as any;
                if (ws.readyState === 1) { // OPEN
                    pingStatus = "Online";
                }
            }
        } catch (e) { }

        // Resolve the database session ID (cuid) from the slug
        const dbSession = await prisma.session.findUnique({
            where: { sessionId },
            select: { id: true }
        });

        if (!dbSession) {
            return NextResponse.json({ status: false, message: "Session not found" }, { status: 404 });
        }

        const dbSessionId = dbSession.id;

        // Fetch counts from database using the cuid
        const [contactsCount, groupsCount, messagesCount] = await Promise.all([
            prisma.contact.count({ where: { sessionId: dbSessionId } }),
            prisma.group.count({ where: { sessionId: dbSessionId } }),
            prisma.message.count({ where: { sessionId: dbSessionId } })
        ]);

        return NextResponse.json({
            status: true,
            message: "Session metrics fetched",
            data: {
                status: instance.status,
                uptimeMs: uptime,
                ping: pingStatus,
                store: { 
                    contacts: contactsCount, 
                    chats: groupsCount + contactsCount, // Approximation of total chats
                    messages: messagesCount 
                } 
            }
        });

    } catch (error: any) {
        console.error("Session Monitor API Error:", error);
        return NextResponse.json({ status: false, message: error.message }, { status: 500 });
    }
}
