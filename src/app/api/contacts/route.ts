
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const sessionIdParam = searchParams.get("sessionId");

    if (sessionIdParam) {
        console.warn(`[DEPRECATED] GET /api/contacts?sessionId=${sessionIdParam} is deprecated. Use GET /api/contacts/${sessionIdParam} instead.`);
    }

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";

    if (!sessionIdParam) {
        return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
    }

    // Resolve sessionId string to database ID (CUID)
    const sessionData = await prisma.session.findUnique({
        where: { sessionId: sessionIdParam },
        select: { id: true }
    });

    if (!sessionData) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const where: any = {
        sessionId: sessionData.id,
    };

    if (search) {
        where.OR = [
            { name: { contains: search } }, // Case insensitive usually handled by DB collation or use mode: 'insensitive' if Postgres
            { notify: { contains: search } },
            { verifiedName: { contains: search } },
            { jid: { contains: search } },
            { remoteJidAlt: { contains: search } }
        ];
    }

    try {
        const [contacts, total] = await Promise.all([
            prisma.contact.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: { name: 'asc' } // Default sort
            }),
            prisma.contact.count({ where })
        ]);

        return NextResponse.json({
            data: contacts,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error("Error fetching contacts:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
