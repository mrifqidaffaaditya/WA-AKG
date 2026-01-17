import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string; replyId: string }> }
) {
    try {
        const { sessionId, replyId } = await params;

        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const rule = await prisma.autoReply.findUnique({
            where: { id: replyId },
            include: { session: true }
        });

        if (!rule) {
            return NextResponse.json({ error: "Rule not found" }, { status: 404 });
        }

        // Verify the rule belongs to this session
        if (rule.session.sessionId !== sessionId) {
            return NextResponse.json({ error: "Rule not found in this session" }, { status: 404 });
        }

        await prisma.autoReply.delete({ where: { id: replyId } });
        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Delete auto reply error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
