import { auth } from "@/lib/auth";
import { ChatInterface } from "@/components/chat/chat-interface";
import { ChatLayoutClient } from "@/components/chat/chat-layout-client";
import { cookies } from "next/headers";
import { canAccessSession } from "@/lib/api-auth";
import { SessionGuard } from "@/components/dashboard/session-guard";
import { prisma } from "@/lib/prisma";

export default async function ChatWithJidPage({
    params,
}: {
    params: Promise<{ jid: string }>;
}) {
    const { jid: rawJid } = await params;
    const session = await auth();

    if (!session?.user?.id) return <div>Unauthorized</div>;

    const cookieStore = await cookies();
    const sessionId = cookieStore.get("sessionId")?.value;
    let validSessionId: string | null = null;

    if (sessionId) {
        const hasAccess = await canAccessSession(session.user.id, session.user.role, sessionId);
        if (hasAccess) {
            validSessionId = sessionId;
        }
    }

    const decoded = decodeURIComponent(rawJid);
    let resolvedJid = decoded;

    if (decoded.includes("@")) {
        // If it already has domain (e.g. @g.us, @s.whatsapp.net, @newsletter, @lid)
        resolvedJid = decoded;
    } else {
        // Check if this ID belongs to a known group in the active session
        let foundGroup = false;
        if (validSessionId) {
            const dbSession = await prisma.session.findUnique({
                where: { sessionId: validSessionId },
                select: { id: true }
            });
            if (dbSession) {
                const groupMatch = await prisma.group.findFirst({
                    where: {
                        sessionId: dbSession.id,
                        OR: [
                            { jid: decoded },
                            { jid: `${decoded}@g.us` }
                        ]
                    },
                    select: { jid: true }
                });
                if (groupMatch) {
                    resolvedJid = groupMatch.jid;
                    foundGroup = true;
                }
            }
        }

        if (!foundGroup) {
            if (decoded.length >= 16 && decoded.startsWith("120363")) {
                resolvedJid = `${decoded}@g.us`;
            } else {
                let clean = decoded.replace(/\D/g, "");
                if (clean.startsWith("0")) clean = "62" + clean.substring(1);
                resolvedJid = `${clean}@s.whatsapp.net`;
            }
        }
    }

    if (!validSessionId) {
        return (
            <SessionGuard>
                <ChatInterface sessionId={null} />
            </SessionGuard>
        );
    }

    return (
        <div className="h-[calc(100vh-6.5rem)] sm:h-[calc(100vh-6rem)]">
            <ChatLayoutClient
                key={`${validSessionId}-${resolvedJid}`}
                sessionId={validSessionId}
                initialJid={resolvedJid}
            />
        </div>
    );
}
