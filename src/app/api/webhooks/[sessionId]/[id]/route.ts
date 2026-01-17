import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string; id: string }> }
) {
    const user = await getAuthenticatedUser(request);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { sessionId, id } = await params;

    const hasAccess = await canAccessSession(user.id, user.role, sessionId);
    if (!hasAccess) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const body = await request.json();
        const { name, url, secret, events, isActive } = body;

        // Verify ownership and session context (optional but good for strictness)
        const existing = await prisma.webhook.findFirst({
            where: { id, userId: user.id }
        });

        if (!existing) {
            return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
        }

        const webhook = await prisma.webhook.update({
            where: { id },
            data: {
                ...(name !== undefined && { name }),
                ...(url !== undefined && { url }),
                ...(secret !== undefined && { secret }),
                // Session ID generally shouldn't change, but we could allow moving it? 
                // For now, let's keep it defined by creation or unchanged.
                ...(events !== undefined && { events }),
                ...(isActive !== undefined && { isActive })
            }
        });

        return NextResponse.json(webhook);
    } catch (error) {
        console.error("Update webhook error:", error);
        return NextResponse.json({ error: "Failed to update webhook" }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string; id: string }> }
) {
    const user = await getAuthenticatedUser(request);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const { sessionId, id } = await params;

    const hasAccess = await canAccessSession(user.id, user.role, sessionId);
    if (!hasAccess) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
        const existing = await prisma.webhook.findFirst({
            where: { id, userId: user.id }
        });

        if (!existing) {
            return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
        }

        await prisma.webhook.delete({ where: { id } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete webhook error:", error);
        return NextResponse.json({ error: "Failed to delete webhook" }, { status: 500 });
    }
}
