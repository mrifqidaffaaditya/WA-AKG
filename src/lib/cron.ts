import cron from "node-cron";
import cronParser from "cron-parser";
import { prisma } from "@/lib/prisma";
import { waManager } from "@/modules/whatsapp/manager";
import { logger } from "./logger";
export function initScheduler() {
    // Run every minute
    cron.schedule("* * * * *", async () => {
        try {
            const now = new Date();
            
            // Fetch pending messages due for sending
            const pendingMessages = await prisma.scheduledMessage.findMany({
                where: {
                    status: "PENDING",
                    sendAt: {
                        lte: now
                    }
                },
                include: {
                    session: true
                }
            });

            if (pendingMessages.length === 0) return;

            // Only log if we're actually processing things to reduce noise
            logger.info("Cron", `Found ${pendingMessages.length} messages to send`);

            for (const msg of pendingMessages) {
                const instance = waManager.getInstance(msg.session.sessionId);

                if (!instance || !instance.socket) {
                    logger.warn("Cron", `Session ${msg.session.sessionId} not connected. Skipping.`);
                    // Optionally mark as FAILED or retry later
                    // keeping PENDING will define behavior (retry next minute)
                    // But if session is dead for long time, it piles up.
                    // Let's keep it PENDING for now.
                    continue;
                }

                try {
                    logger.info("Cron", `Sending to ${msg.jid}`);
                    
                    if (msg.mediaUrl) {
                        const type = msg.mediaType || "document";
                        let payload: any = {};
                        if (msg.content) payload.caption = msg.content;
                        
                        if (type === "image") {
                            payload.image = { url: msg.mediaUrl };
                        } else if (type === "video") {
                            payload.video = { url: msg.mediaUrl };
                        } else if (type === "audio") {
                            payload = { audio: { url: msg.mediaUrl } };
                        } else {
                            payload.document = { url: msg.mediaUrl };
                            payload.mimetype = "application/octet-stream";
                            payload.fileName = msg.mediaUrl.split('/').pop() || "file";
                        }
                        await instance.socket.sendMessage(msg.jid, payload);
                    } else {
                        await instance.socket.sendMessage(msg.jid, { text: msg.content || "" });
                    }

                    // Update status or compute next sendAt if recurring
                    if (msg.cronExpression) {
                        const interval = cronParser.parse(msg.cronExpression, { tz: "Asia/Jakarta" });
                        const nextDate = interval.next().toDate();
                        await prisma.scheduledMessage.update({
                            where: { id: msg.id },
                            data: { sendAt: nextDate } // Keep status as PENDING
                        });
                    } else {
                        await prisma.scheduledMessage.update({
                            where: { id: msg.id },
                            data: { status: "SENT" }
                        });
                    }

                } catch (error) {
                    logger.error("Cron", `Check failed for ${msg.id}`, error);
                    if (!msg.cronExpression) {
                        await prisma.scheduledMessage.update({
                            where: { id: msg.id },
                            data: { status: "FAILED" } // Failed to send
                        });
                    } else {
                        const interval = cronParser.parse(msg.cronExpression, { tz: "Asia/Jakarta" });
                        await prisma.scheduledMessage.update({
                            where: { id: msg.id },
                            data: { sendAt: interval.next().toDate() }
                        });
                    }
                }
            }

        } catch (error) {
            logger.error("Cron", "Scheduler error:", error);
        }
    });
    
    logger.info("Cron", "Scheduler initialized");
}
