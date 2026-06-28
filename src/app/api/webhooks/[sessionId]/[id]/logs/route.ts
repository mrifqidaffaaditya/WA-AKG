import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string; id: string }> }
) {
    const user = await getAuthenticatedUser(request);
    if (!user) {
        return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId, id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
    const offset = Math.max(parseInt(searchParams.get("offset") || "0"), 0);

    const hasAccess = await canAccessSession(user.id, user.role, sessionId);
    if (!hasAccess) {
        return NextResponse.json({ status: false, message: "Forbidden - Cannot access this session", error: "Forbidden - Cannot access this session" }, { status: 403 });
    }

    // Resolve session by either CUID or WhatsApp sessionId
    const session = await prisma.session.findFirst({
        where: {
            OR: [
                { id: sessionId },
                { sessionId: sessionId }
            ]
        },
        select: { id: true }
    });

    if (!session) {
        return NextResponse.json({ status: false, message: "Session not found", error: "Session not found" }, { status: 404 });
    }

    // Verify webhook access
    const webhook = await prisma.webhook.findFirst({
        where: {
            id,
            OR: [
                { sessionId: session.id },
                { sessionId: null, userId: user.id }
            ]
        }
    });

    if (!webhook) {
        return NextResponse.json({ status: false, message: "Webhook not found", error: "Webhook not found" }, { status: 404 });
    }

    try {
        const [logs, total] = await Promise.all([
            prisma.webhookLog.findMany({
                where: { webhookId: id },
                orderBy: { createdAt: "desc" },
                take: limit,
                skip: offset
            }),
            prisma.webhookLog.count({
                where: { webhookId: id }
            })
        ]);

        return NextResponse.json({
            status: true,
            data: logs,
            total,
            limit,
            offset
        });
    } catch (error) {
        console.error("Fetch webhook logs error:", error);
        return NextResponse.json({ status: false, message: "Failed to fetch webhook logs", error: "Failed to fetch webhook logs" }, { status: 500 });
    }
}
