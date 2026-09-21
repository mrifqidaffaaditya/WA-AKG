import { prisma } from "@/lib/prisma";
import { waManager } from "./manager";
import { logger } from "@/lib/logger";

const checkScheduledMessages = async () => {
    try {
        const now = new Date();
        logger.debug("Scheduler", `Checking for messages due before ${now.toISOString()}...`);

        const pendingMessages = await prisma.scheduledMessage.findMany({
            where: {
                status: "PENDING",
                sendAt: { lte: now }
            }
        });

        if (pendingMessages.length > 0) {
            logger.info("Scheduler", `Found ${pendingMessages.length} pending messages.`);
        }

        for (const msg of pendingMessages) {
            const instance = waManager.getInstance(msg.sessionId);

            if (instance?.socket) {
                try {
                    let content: any = {};
                    if (msg.mediaUrl) {
                        const url = msg.mediaUrl;
                        const type = msg.mediaType || 'image';

                        const { safeFetchBuffer } = await import("@/lib/security");
                        const { buffer, fileName, contentType } = await safeFetchBuffer(url, {
                            maxBytes: 50 * 1024 * 1024,
                            timeoutMs: 15000
                        });

                        if (type === 'video') {
                            content = { video: buffer, caption: msg.content, mimetype: contentType || 'video/mp4' };
                        } else if (type === 'document') {
                            content = { document: buffer, caption: msg.content, fileName: fileName || 'file', mimetype: contentType || 'application/octet-stream' };
                        } else {
                            content = { image: buffer, caption: msg.content, mimetype: contentType || 'image/jpeg' };
                        }
                    } else {
                        content = { text: msg.content };
                    }

                    await instance.socket.sendMessage(msg.jid, content);

                    await prisma.scheduledMessage.update({
                        where: { id: msg.id },
                        data: { status: "SENT" }
                    });
                    logger.success("Scheduler", `Msg ${msg.id} sent to ${msg.jid}`);

                } catch (err) {
                    logger.error("Scheduler", `Failed to send scheduled msg ${msg.id}`, err);
                    await prisma.scheduledMessage.update({
                        where: { id: msg.id },
                        data: { status: "FAILED" }
                    });
                }
            } else {
                logger.warn("Scheduler", `Session ${msg.sessionId} not connected for scheduled msg ${msg.id}`);
                // Optionally mark as failed or leave pending
            }
        }
    } catch (e) {
        logger.error("Scheduler", "Error executing scheduler loop:", e);
    }
};

export function startScheduler() {
    logger.info("Scheduler", "Starting Message Scheduler...");

    // Run immediately on start
    checkScheduledMessages();

    // Then run every 30 seconds
    setInterval(checkScheduledMessages, 30 * 1000);
}
