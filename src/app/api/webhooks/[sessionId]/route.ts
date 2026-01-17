import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    const user = await getAuthenticatedUser(request);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await params;

    // Verify access to session
    const hasAccess = await canAccessSession(user.id, user.role, sessionId);
    if (!hasAccess) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        // Resolve session string ID to internal ID if needed, or just look up webhooks
        // We need the internal ID to query the Webhook table
        const session = await prisma.session.findUnique({
            where: { sessionId: sessionId },
            select: { id: true }
        });

        if (!session) {
             return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        const webhooks = await prisma.webhook.findMany({
            where: {
                userId: user.id,
                OR: [
                    { sessionId: session.id }, // Specific to this session
                    { sessionId: null }        // Global webhooks
                ]
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json(webhooks);
    } catch (error) {
        console.error("Fetch webhooks error:", error);
        return NextResponse.json({ error: "Failed to fetch webhooks" }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    const user = await getAuthenticatedUser(request);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { sessionId } = await params;

    const hasAccess = await canAccessSession(user.id, user.role, sessionId);
    if (!hasAccess) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { name, url, secret, events } = body;

        if (!name || !url || !events || events.length === 0) {
            return NextResponse.json({ error: "Name, URL, and at least one event are required" }, { status: 400 });
        }

        const session = await prisma.session.findUnique({
            where: { sessionId: sessionId },
            select: { id: true }
        });

        if (!session) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        const webhook = await prisma.webhook.create({
            data: {
                userId: user.id,
                name,
                url,
                secret: secret || null,
                sessionId: session.id, // Strictly link to this session
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
