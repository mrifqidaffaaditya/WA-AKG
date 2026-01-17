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
        session.botConfig = session.botConfig || {
            enabled: true,
            botMode: 'OWNER',
            botAllowedJids: [],
            autoReplyMode: 'ALL',
            autoReplyAllowedJids: [],
            enableSticker: true,
            enablePing: true,
            enableUptime: true,
            botName: "WA-AKG Bot",
            removeBgApiKey: null,
            enableVideoSticker: true,
            maxStickerDuration: 10
        };

        return NextResponse.json(session.botConfig);
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
                botMode: body.botMode || 'OWNER',
                botAllowedJids: body.botAllowedJids || [],
                autoReplyMode: body.autoReplyMode || 'ALL',
                autoReplyAllowedJids: body.autoReplyAllowedJids || [],
                
                enableSticker: body.enableSticker ?? true,
                enableVideoSticker: body.enableVideoSticker ?? true,
                maxStickerDuration: body.maxStickerDuration || 10,
                enablePing: body.enablePing ?? true,
                enableUptime: body.enableUptime ?? true,
                removeBgApiKey: body.removeBgApiKey || null,
            },
            update: {
                botMode: body.botMode,
                botAllowedJids: body.botAllowedJids,
                autoReplyMode: body.autoReplyMode,
                autoReplyAllowedJids: body.autoReplyAllowedJids,
                botName: body.botName,
                enableSticker: body.enableSticker,
                enableVideoSticker: body.enableVideoSticker,
                maxStickerDuration: body.maxStickerDuration,
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
