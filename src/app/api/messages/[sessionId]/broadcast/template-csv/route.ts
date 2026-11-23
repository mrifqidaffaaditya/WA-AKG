import { NextResponse, NextRequest } from "next/server";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";
import { generateBroadcastCsvTemplate } from "@/lib/broadcast-import";

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

        const csvContent = generateBroadcastCsvTemplate();

        return new Response(csvContent, {
            status: 200,
            headers: {
                "Content-Type": "text/csv; charset=utf-8",
                "Content-Disposition": 'attachment; filename="template_broadcast.csv"',
                "Cache-Control": "no-cache"
            }
        });
    } catch (error: any) {
        console.error("Failed to generate broadcast CSV template:", error);
        return NextResponse.json({
            status: false,
            message: "Failed to generate CSV template",
            error: error.message
        }, { status: 500 });
    }
}
