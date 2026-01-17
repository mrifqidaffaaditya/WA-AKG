import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, canAccessSession, isAdmin } from "@/lib/api-auth";

// GET: List Auto Replies
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

        const rules = await prisma.autoReply.findMany({
            where: { sessionId: session.id },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(rules);

    } catch (error) {
        console.error("Fetch auto replies error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST: Create Auto Reply
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
        const { keyword, response, matchType } = body;

        if (!keyword || !response) {
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

        const newRule = await prisma.autoReply.create({
            data: {
                sessionId: session.id,
                keyword,
                response,
                matchType: matchType || "EXACT",
                isMedia: false
            }
        });

        return NextResponse.json(newRule);

    } catch (error) {
        console.error("Create auto reply error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }

}

/**
 * @deprecated This endpoint is deprecated. Use DELETE /api/autoreplies/{sessionId}/{replyId} instead.
 * This endpoint will be removed in a future version.
 */
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    console.warn('[DEPRECATED] DELETE /api/autoreplies/{id} is deprecated. Use DELETE /api/autoreplies/{sessionId}/{replyId} instead.');
    const { sessionId: id } = await params;

    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const rule = await prisma.autoReply.findUnique({
            where: { id },
            include: { session: true }
        });

        if (!rule) {
            return NextResponse.json({ error: "Rule not found" }, { status: 404 });
        }

        const canAccess = await canAccessSession(user.id, user.role, rule.session.sessionId);
        if (!canAccess) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        await prisma.autoReply.delete({ where: { id } });
        return NextResponse.json({ success: true });

    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
