import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string; scheduleId: string }> }
) {
    try {
        const { sessionId, scheduleId } = await params;
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ error: "Forbidden - Cannot access this session" }, { status: 403 });
        }

        const body = await request.json();
        const { jid, content, sendAt } = body;

        if (!jid || !content || !sendAt) {
            return NextResponse.json({ error: "JID, content, and sendAt are required" }, { status: 400 });
        }

        const updated = await prisma.scheduledMessage.update({
            where: { id: scheduleId },
            data: {
                jid,
                content,
                sendAt: new Date(sendAt)
            }
        });

        return NextResponse.json(updated);
    } catch (error) {
        console.error("Update schedule error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string; scheduleId: string }> }
) {
    try {
        const { sessionId, scheduleId } = await params;

        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ error: "Forbidden - Cannot access this session" }, { status: 403 });
        }

        const msg = await prisma.scheduledMessage.findUnique({
            where: { id: scheduleId },
            include: { session: true }
        });

        if (!msg) {
            return NextResponse.json({ error: "Message not found" }, { status: 404 });
        }

        // Verify the schedule belongs to this session
        if (msg.session.sessionId !== sessionId) {
            return NextResponse.json({ error: "Schedule not found in this session" }, { status: 404 });
        }

        await prisma.scheduledMessage.delete({ where: { id: scheduleId } });
        return NextResponse.json({ success: true });

    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
