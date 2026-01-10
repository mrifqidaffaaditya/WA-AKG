import { prisma } from "@/lib/prisma";
import { NextResponse, NextRequest } from "next/server";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: sessionId } = await params;

    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // @ts-ignore
        const session = await (prisma as any).session.findUnique({
            where: { sessionId },
            select: { id: true, botConfig: true }
        });

        if (!session) {
            return NextResponse.json({ error: "Session not found" }, { status: 404 });
        }

        // Return config or default if null
        const config = session.botConfig || {
            enabled: true,
            publicMode: false,
            enableSticker: true,
            enablePing: true,
            enableUptime: true,
            removeBgApiKey: ""
        };

        return NextResponse.json(config);
    } catch (error) {
        console.error("Get Bot Config Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: sessionId } = await params;

    try {
        const user = await getAuthenticatedUser(request);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const body = await request.json();
        
        // Find session DB ID
        const session = await prisma.session.findUnique({
            where: { sessionId },
            select: { id: true }
        });

        if (!session) return NextResponse.json({ error: "Session not found" }, { status: 404 });

        // Upsert Config
        // @ts-ignore
        const config = await (prisma as any).botConfig.upsert({
            where: { sessionId: session.id },
            create: {
                sessionId: session.id,
                enabled: body.enabled ?? true,
                publicMode: body.publicMode ?? false,
                enableSticker: body.enableSticker ?? true,
                enablePing: body.enablePing ?? true,
                enableUptime: body.enableUptime ?? true,
                removeBgApiKey: body.removeBgApiKey || null,
            },
            update: {
                enabled: body.enabled,
                publicMode: body.publicMode,
                enableSticker: body.enableSticker,
                enablePing: body.enablePing,
                enableUptime: body.enableUptime,
                removeBgApiKey: body.removeBgApiKey || null,
            }
        });

        return NextResponse.json(config);
    } catch (error) {
        console.error("Update Bot Config Error:", error);
        return NextResponse.json({ error: "Failed to update config" }, { status: 500 });
    }
}
