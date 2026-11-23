import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";
import { z } from "zod";

const updateTemplateSchema = z.object({
    name: z.string().min(1).optional(),
    type: z.enum(["text", "image", "video", "audio", "document", "interactive"]).optional(),
    message: z.string().optional().nullable(),
    mediaUrl: z.string().optional().nullable(),
    mediaType: z.string().optional().nullable(),
    fileName: z.string().optional().nullable(),
    interactiveData: z.any().optional().nullable(),
});

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string; templateId: string }> }
) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        const { sessionId, templateId } = await params;
        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Forbidden", error: "Forbidden" }, { status: 403 });
        }

        const template = await prisma.broadcastTemplate.findUnique({
            where: { id: templateId }
        });

        if (!template) {
            return NextResponse.json({ status: false, message: "Template not found", error: "Template not found" }, { status: 404 });
        }

        return NextResponse.json({ status: true, data: template });
    } catch (e: any) {
        console.error("Get template error:", e);
        return NextResponse.json({ status: false, message: "Failed to get template", error: e.message }, { status: 500 });
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string; templateId: string }> }
) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        const { sessionId, templateId } = await params;
        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Forbidden", error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const parseResult = updateTemplateSchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({ status: false, message: "Validation error", error: parseResult.error.flatten() }, { status: 400 });
        }

        const data = parseResult.data;
        const updated = await prisma.broadcastTemplate.update({
            where: { id: templateId },
            data: {
                ...(data.name ? { name: data.name } : {}),
                ...(data.type ? { type: data.type } : {}),
                ...(data.message !== undefined ? { message: data.message } : {}),
                ...(data.mediaUrl !== undefined ? { mediaUrl: data.mediaUrl } : {}),
                ...(data.mediaType !== undefined ? { mediaType: data.mediaType } : {}),
                ...(data.fileName !== undefined ? { fileName: data.fileName } : {}),
                ...(data.interactiveData !== undefined ? { interactiveData: data.interactiveData } : {})
            }
        });

        return NextResponse.json({ status: true, message: "Template updated", data: updated });
    } catch (e: any) {
        console.error("Update template error:", e);
        return NextResponse.json({ status: false, message: "Failed to update template", error: e.message }, { status: 500 });
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string; templateId: string }> }
) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        const { sessionId, templateId } = await params;
        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Forbidden", error: "Forbidden" }, { status: 403 });
        }

        await prisma.broadcastTemplate.delete({
            where: { id: templateId }
        });

        return NextResponse.json({ status: true, message: "Template deleted" });
    } catch (e: any) {
        console.error("Delete template error:", e);
        return NextResponse.json({ status: false, message: "Failed to delete template", error: e.message }, { status: 500 });
    }
}
