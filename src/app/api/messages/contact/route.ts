import { NextResponse, NextRequest } from "next/server";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";

/**
 * @deprecated This endpoint is deprecated. Use POST /api/messages/{sessionId}/{jid}/contact instead.
 * This endpoint will be removed in a future version.
 */
// POST: Send contact card
export async function POST(request: NextRequest) {
    console.warn('[DEPRECATED] POST /api/messages/contact is deprecated. Use POST /api/messages/{sessionId}/{jid}/contact instead.');
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { sessionId, jid, contacts } = body;

        if (!sessionId || !jid || !contacts || !Array.isArray(contacts)) {
            return NextResponse.json({ 
                error: "sessionId, jid, and contacts (array) are required" 
            }, { status: 400 });
        }

        if (contacts.length === 0) {
            return NextResponse.json({ error: "At least one contact is required" }, { status: 400 });
        }

        // Validate contacts structure
        for (const contact of contacts) {
            if (!contact.displayName || !contact.vcard) {
                return NextResponse.json({ 
                    error: "Each contact must have displayName and vcard" 
                }, { status: 400 });
            }
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

        // Send contact message
        await instance.socket.sendMessage(jid, {
            contacts: {
                displayName: contacts.length > 1 ? "Contacts" : contacts[0].displayName,
                contacts: contacts
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Send contact error:", error);
        return NextResponse.json({ error: "Failed to send contact" }, { status: 500 });
    }
}
