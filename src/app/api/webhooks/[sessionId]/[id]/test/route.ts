import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { testWebhook } from "@/lib/webhook";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string; id: string }> }
) {
    const user = await getAuthenticatedUser(request);
    if (!user) {
        return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId, id } = await params;

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

    // Verify webhook ownership — only owner can test
    const webhook = await prisma.webhook.findFirst({
        where: {
            id,
            userId: user.id,
            OR: [
                { sessionId: session.id },
                { sessionId: null }
            ]
        }
    });

    if (!webhook) {
        return NextResponse.json({ status: false, message: "Webhook not found", error: "Webhook not found" }, { status: 404 });
    }

    const result = await testWebhook(webhook.id, webhook.url, webhook.secret);

    return NextResponse.json({
        status: true,
        message: result.success ? "Webhook test successful" : "Webhook test failed",
        data: result
    });
}
