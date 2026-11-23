import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";
import { z } from "zod";

const createTemplateSchema = z.object({
    name: z.string().min(1, "Template name is required"),
    type: z.enum(["text", "image", "video", "audio", "document", "interactive"]).default("text"),
    message: z.string().optional().nullable(),
    mediaUrl: z.string().optional().nullable(),
    mediaType: z.string().optional().nullable(),
    fileName: z.string().optional().nullable(),
    interactiveData: z.any().optional().nullable(),
});

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        const { sessionId } = await params;
        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Forbidden", error: "Forbidden" }, { status: 403 });
        }

        // Return templates created for this session, this user, or global
        const templates = await prisma.broadcastTemplate.findMany({
            where: {
                OR: [
                    { sessionId },
                    { sessionId: null, userId: user.id },
                    { sessionId: null, userId: null }
                ]
            },
            orderBy: { createdAt: "desc" }
        });

        return NextResponse.json({
            status: true,
            message: "Templates fetched successfully",
            data: templates
        });
    } catch (e: any) {
        console.error("Fetch templates error:", e);
        return NextResponse.json({ status: false, message: "Failed to fetch templates", error: e.message }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        const { sessionId } = await params;
        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Forbidden", error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const parseResult = createTemplateSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({ status: false, message: "Validation error", error: parseResult.error.flatten() }, { status: 400 });
        }

        const { name, type, message, mediaUrl, mediaType, fileName, interactiveData } = parseResult.data;

        const template = await prisma.broadcastTemplate.create({
            data: {
                userId: user.id,
                sessionId,
                name,
                type,
                message: message || null,
                mediaUrl: mediaUrl || null,
                mediaType: mediaType || null,
                fileName: fileName || null,
                interactiveData: interactiveData ? interactiveData : undefined
            }
        });

        return NextResponse.json({
            status: true,
            message: "Template saved successfully",
            data: template
        });
    } catch (e: any) {
        console.error("Save template error:", e);
        return NextResponse.json({ status: false, message: "Failed to save template", error: e.message }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        const { sessionId } = await params;
        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Forbidden", error: "Forbidden" }, { status: 403 });
        }

        const { searchParams } = new URL(request.url);
        const id = searchParams.get("id");
        if (!id) {
            return NextResponse.json({ status: false, message: "Template ID is required", error: "Missing ID" }, { status: 400 });
        }

        await prisma.broadcastTemplate.delete({
            where: { id }
        });

        return NextResponse.json({
            status: true,
            message: "Template deleted successfully"
        });
    } catch (e: any) {
        console.error("Delete template error:", e);
        return NextResponse.json({ status: false, message: "Failed to delete template", error: e.message }, { status: 500 });
    }
}
