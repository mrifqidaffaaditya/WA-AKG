import { NextResponse, NextRequest } from "next/server";
import { getAuthenticatedUser } from "@/lib/api-auth";
import { waManager } from "@/modules/whatsapp/manager";

export const dynamic = "force-dynamic";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const resolvedParams = await params;
        const sessionId = resolvedParams.sessionId;

        const auth = await getAuthenticatedUser(req);
        if (!auth) {
            return NextResponse.json({ status: false, message: "Unauthorized" }, { status: 401 });
        }

        // Check if user has access to this session
        // (Assuming you have a canAccessSession helper, or using role checks)
        // For simplicity, we assume auth valid and checking manager directly

        const instance = waManager.getInstance(sessionId);

        if (!instance || instance.status !== "CONNECTED") {
            return NextResponse.json({
                status: true,
                message: "Session is not connected",
                data: { status: instance?.status || "DISCONNECTED", uptime: 0, storeSize: 0 }
            });
        }

        // Store counting removed because Baileys MakeInMemoryStore is not exported via Manager.
        // If needed in the future, we would expose instance.store or retrieve from DB instead.

        const uptime = instance.startTime ? Date.now() - instance.startTime.getTime() : 0;

        // Perform a quick ping if possible using Baileys WA Socket
        // WbSocket raw ping
        let pingStatus = "Unknown";
        let pingMs: number | null = null;

        try {
            if (instance.socket && instance.socket.ws) {
                // Attempt to read socket state
                const ws = instance.socket.ws as any;
                if (ws.readyState === 1) { // OPEN
                    pingStatus = "Online";
                }
            }
        } catch (e) { }

        return NextResponse.json({
            status: true,
            message: "Session metrics fetched",
            data: {
                status: instance.status,
                uptimeMs: uptime,
                ping: pingStatus,
                store: { contacts: 0, chats: 0, messages: 0 } // Legacy shape for UI compatibility
            }
        });

    } catch (error: any) {
        console.error("Session Monitor API Error:", error);
        return NextResponse.json({ status: false, message: error.message }, { status: 500 });
    }
}
