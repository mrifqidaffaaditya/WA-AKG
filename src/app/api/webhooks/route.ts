import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser } from "@/lib/api-auth";

export async function GET(request: NextRequest) {
    console.warn('[DEPRECATED] GET /api/webhooks is deprecated. Use GET /api/webhooks/{sessionId} instead.');
    const user = await getAuthenticatedUser(request);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const webhooks = await prisma.webhook.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(webhooks);
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch webhooks" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    console.warn('[DEPRECATED] POST /api/webhooks is deprecated. Use POST /api/webhooks/{sessionId} instead.');
    const user = await getAuthenticatedUser(request);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { name, url, secret, sessionId, events } = body;

        if (!name || !url || !events || events.length === 0) {
            return NextResponse.json({ error: "Name, URL, and at least one event are required" }, { status: 400 });
        }

        let targetSessionId = null;
        if (sessionId) {
            const session = await prisma.session.findUnique({
                where: { sessionId: sessionId },
                select: { id: true }
            });
            if (!session) {
                return NextResponse.json({ error: "Session not found" }, { status: 404 });
            }
            targetSessionId = session.id;
        }

        const webhook = await prisma.webhook.create({
            data: {
                userId: user.id,
                name,
                url,
                secret: secret || null,
                sessionId: targetSessionId,
                events,
                isActive: true
            }
        });

        return NextResponse.json(webhook);
    } catch (error: any) {
        console.error("Create webhook error detailed:", error);
        return NextResponse.json({ error: "Failed to create webhook", details: error.message }, { status: 500 });
    }
}
