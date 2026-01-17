import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";
import moment from "moment-timezone";

// GET: List Scheduled Messages
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { sessionId } = await params;

        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
             return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const session = await prisma.session.findUnique({
            where: { sessionId: sessionId },
            select: { id: true }
        });

        if (!session) {
             return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        const messages = await prisma.scheduledMessage.findMany({
            where: { sessionId: session.id },
            orderBy: { sendAt: 'asc' }
        });

        return NextResponse.json(messages);

    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST: Create Scheduled Message
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const { sessionId } = await params;

        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { jid, content, sendAt, mediaUrl } = body;

        if (!jid || !content || !sendAt) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const session = await prisma.session.findUnique({
             where: { sessionId: sessionId },
             select: { id: true }
        });

        if (!session) {
             return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        // @ts-ignore
        const systemConfig = await prisma.systemConfig.findUnique({ where: { id: "default" } });
        const timezone = systemConfig?.timezone || "Asia/Jakarta";

        const utcDate = moment.tz(sendAt, timezone).toDate();

        const scheduled = await prisma.scheduledMessage.create({
            data: {
                sessionId: session.id,
                jid,
                content,
                mediaUrl,
                sendAt: utcDate,
                status: "PENDING"
            }
        });

        return NextResponse.json(scheduled);

    } catch (error) {
        console.error("Schedule error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

}

/**
 * @deprecated This endpoint is deprecated. Use DELETE /api/scheduler/{sessionId}/{scheduleId} instead.
 * This endpoint will be removed in a future version.
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    console.warn('[DEPRECATED] DELETE /api/scheduler/{id} is deprecated. Use DELETE /api/scheduler/{sessionId}/{scheduleId} instead.');
    // In legacy route this param was 'id', now it acts as the id (scheduleId)
    const { sessionId: id } = await params;

    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const msg = await prisma.scheduledMessage.findUnique({
            where: { id },
            include: { session: true }
        });

        if (!msg) {
            return NextResponse.json({ error: "Message not found" }, { status: 404 });
        }

        const canAccess = await canAccessSession(user.id, user.role, msg.session.sessionId);
        if (!canAccess) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await prisma.scheduledMessage.delete({ where: { id } });
        return NextResponse.json({ success: true });

    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
