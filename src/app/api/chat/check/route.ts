import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

// POST: Check if number is on WhatsApp
export async function POST(request: NextRequest) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { sessionId, numbers } = body;

        if (!sessionId || !numbers || !Array.isArray(numbers)) {
            return NextResponse.json({ 
                error: "sessionId and numbers (array) are required" 
            }, { status: 400 });
        }

        if (numbers.length === 0) {
            return NextResponse.json({ error: "At least one number is required" }, { status: 400 });
        }

        if (numbers.length > 50) {
            return NextResponse.json({ error: "Maximum 50 numbers per request" }, { status: 400 });
        }

        // Check if user can access this session
        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ error: "Forbidden - Cannot access this session" }, { status: 403 });
        }

        const instance = waManager.getInstance(sessionId);
        if (!instance?.socket) {
            return NextResponse.json({ error: "Session not ready" }, { status: 503 });
        }

        // Check numbers on WhatsApp
        const results = await Promise.all(
            numbers.map(async (number: string) => {
                try {
                    const checkResult = await instance.socket!.onWhatsApp(number);
                    // onWhatsApp returns array of results
                    const result = Array.isArray(checkResult) && checkResult.length > 0 ? checkResult[0] : null;
                    return {
                        number,
                        exists: result?.exists || false,
                        jid: result?.jid || null
                    };
                } catch (error) {
                    return {
                        number,
                        exists: false,
                        jid: null,
                        error: "Invalid number format"
                    };
                }
            })
        );

        return NextResponse.json({ 
            success: true,
            results
        });

    } catch (error) {
        console.error("Check WhatsApp error:", error);
        return NextResponse.json({ error: "Failed to check numbers" }, { status: 500 });
    }
}
