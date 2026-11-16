import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";
import { sanitizePhoneToJid } from "@/lib/jid-utils";
import type { AnyMessageContent } from "@whiskeysockets/baileys";
import { z } from "zod";

export const normalizeBroadcastJid = sanitizePhoneToJid;

const DEFAULT_MIN_DELAY_MS = 10_000;
const DEFAULT_MAX_DELAY_MS = 30_000;
// Anti-ban limits: long pause every BATCH_SIZE sends, hard cap per rolling hour
const BATCH_SIZE = 20;
const BATCH_PAUSE_MIN_MS = 120_000;
const BATCH_PAUSE_MAX_MS = 300_000;
const MAX_PER_HOUR = 100;
const HOUR_MS = 3_600_000;

const broadcastBodySchema = z.object({
    recipients: z.array(z.string()),
    message: z.string().min(1),
    delay: z.number().optional(),
    antiBan: z.boolean().default(true)
});

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
        const body = await request.json();

        const parseResult = broadcastBodySchema.safeParse(body);
        if (!parseResult.success) {
            return NextResponse.json({ error: parseResult.error.flatten() }, { status: 400 });
        }

        const { recipients, message, delay, antiBan } = parseResult.data;

        // Sanitize & normalize recipients (strip '+', whitespace, non-digits, ensure valid WhatsApp JID format)
        const normalizedRecipients = Array.from(
            new Set(recipients.map(normalizeBroadcastJid).filter((j): j is string => Boolean(j)))
        );

        if (normalizedRecipients.length === 0) {
            return NextResponse.json(
                { status: false, message: "No valid recipient JIDs provided", error: "No valid recipient JIDs" },
                { status: 400 }
            );
        }

        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Forbidden", error: "Forbidden" }, { status: 403 });
        }

        const instance = waManager.getInstance(sessionId);
        if (!instance?.socket) {
            return NextResponse.json({ status: false, message: "Session not ready", error: "Session not ready" }, { status: 503 });
        }

        // --- Save BroadcastLog & recipients to DB ---
        const log = await prisma.broadcastLog.create({
            data: {
                sessionId,
                message,
                total: normalizedRecipients.length,
                delay: delay || DEFAULT_MIN_DELAY_MS,
                status: "running",
                recipients: {
                    create: normalizedRecipients.map(jid => ({
                        jid,
                        status: "pending"
                    }))
                }
            },
            include: { recipients: true }
        });

        const messageContent: AnyMessageContent = { text: message };
        const io = (global as any).io;
        const broadcastId = log.id;

        // Emit initial state
        if (io) {
            io.to(sessionId).emit("broadcast.progress", {
                broadcastId,
                status: "running",
                total: normalizedRecipients.length,
                sent: 0,
                failed: 0,
                current: null,
                progress: 0,
                startedAt: log.startedAt.toISOString()
            });
        }

        // Process in background — update DB as we go
        (async () => {
            let sent = 0;
            let failed = 0;
            const errors: { jid: string; error: string }[] = [];
            const sendTimes: number[] = [];

            for (let i = 0; i < normalizedRecipients.length; i++) {
                const jid = normalizedRecipients[i];

                // Hourly cap: wait until the oldest send leaves the rolling hour
                while (sendTimes.length && Date.now() - sendTimes[0] >= HOUR_MS) sendTimes.shift();
                if (antiBan && sendTimes.length >= MAX_PER_HOUR) {
                    await new Promise(r => setTimeout(r, sendTimes[0] + HOUR_MS - Date.now() + 1000));
                    sendTimes.shift();
                }
                sendTimes.push(Date.now());

                try {
                    await instance.socket!.sendMessage(jid, messageContent);
                    sent++;

                    // Update recipient status in DB
                    await prisma.broadcastRecipient.updateMany({
                        where: { broadcastLogId: broadcastId, jid },
                        data: { status: "sent", sentAt: new Date() }
                    });
                } catch (e: any) {
                    failed++;
                    errors.push({ jid, error: e.message || "Unknown error" });
                    console.error(`Failed to send broadcast to ${jid}`, e);

                    // Update recipient error in DB
                    await prisma.broadcastRecipient.updateMany({
                        where: { broadcastLogId: broadcastId, jid },
                        data: { status: "failed", error: e.message || "Unknown error" }
                    });
                }

                const progress = Math.round(((sent + failed) / normalizedRecipients.length) * 100);

                // Update BroadcastLog progress in DB
                await prisma.broadcastLog.update({
                    where: { id: broadcastId },
                    data: { sent, failed }
                });

                // Socket real-time
                if (io) {
                    io.to(sessionId).emit("broadcast.progress", {
                        broadcastId,
                        status: "running",
                        total: normalizedRecipients.length,
                        sent,
                        failed,
                        current: jid,
                        progress
                    });
                }

                // Delay between sends
                if (i < normalizedRecipients.length - 1) {
                    // No delay given: random 10-30s (anti-ban default). Custom delay: base + up to 50% jitter.
                    const randomDelay = delay
                        ? delay + Math.floor(Math.random() * (delay * 0.5))
                        : DEFAULT_MIN_DELAY_MS + Math.floor(Math.random() * (DEFAULT_MAX_DELAY_MS - DEFAULT_MIN_DELAY_MS));
                    const batchPause = antiBan && (i + 1) % BATCH_SIZE === 0
                        ? BATCH_PAUSE_MIN_MS + Math.floor(Math.random() * (BATCH_PAUSE_MAX_MS - BATCH_PAUSE_MIN_MS))
                        : 0;
                    await new Promise(r => setTimeout(r, randomDelay + batchPause));
                }
            }

            // Mark as completed in DB
            await prisma.broadcastLog.update({
                where: { id: broadcastId },
                data: { status: "completed", sent, failed, completedAt: new Date() }
            });

            // Final socket emit
            if (io) {
                io.to(sessionId).emit("broadcast.progress", {
                    broadcastId,
                    status: "completed",
                    total: normalizedRecipients.length,
                    sent,
                    failed,
                    errors,
                    progress: 100,
                    completedAt: new Date().toISOString()
                });
            }
            console.log(`Broadcast ${broadcastId} completed: ${sent} sent, ${failed} failed out of ${normalizedRecipients.length}`);
        })();

        return NextResponse.json({
            status: true,
            message: "Broadcast started",
            data: { broadcastId: log.id, total: normalizedRecipients.length }
        });

    } catch (e) {
        console.error("Broadcast error", e);
        return NextResponse.json({ status: false, message: "Failed to start broadcast", error: "Failed to start broadcast" }, { status: 500 });
    }
}
