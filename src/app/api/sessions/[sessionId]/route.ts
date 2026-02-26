import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const resolvedParams = await params;
        const sessionId = resolvedParams.sessionId;

        // Verify access
        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
             return NextResponse.json({ error: "Forbidden - Cannot access this session" }, { status: 403 });
        }

        // Get DB Session
        const session = await prisma.session.findUnique({
            where: { sessionId },
            include: {
                _count: {
                    select: { 
                        groups: true,
                        messages: true,
                        contacts: true
                    }
                }
            }
        });

        if (!session) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        // Get Live Instance Data
        const instance = waManager.getInstance(sessionId);
        const isConnected = instance?.status === "CONNECTED";
        
        let uptime = 0;
        if (isConnected && instance?.startTime) {
            uptime = Math.floor((new Date().getTime() - instance.startTime.getTime()) / 1000); // in seconds
        }

        let me = null;
        if (isConnected && instance?.socket?.user) {
             me = instance.socket.user;
        }

        return NextResponse.json({
            ...session,
            status: instance?.status || session.status, // Prefer live status
            uptime,
            me,
            hasInstance: !!instance
        });

    } catch (error) {
        console.error("Get session details error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
