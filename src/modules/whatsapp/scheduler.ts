import { prisma } from "@/lib/prisma";
import { waManager } from "./manager";

export function startScheduler() {
    console.log("Starting Message Scheduler...");
    
const checkScheduledMessages = async () => {
    try {
        const now = new Date();
        console.log(`[Scheduler] Checking for messages due before ${now.toISOString()}...`);
        
        const pendingMessages = await prisma.scheduledMessage.findMany({
            where: {
                status: "PENDING",
                sendAt: { lte: now }
            }
        });

        if (pendingMessages.length > 0) {
            console.log(`[Scheduler] Found ${pendingMessages.length} pending messages.`);
        }

        for (const msg of pendingMessages) {
            const instance = waManager.getInstance(msg.sessionId);
            
            if (instance?.socket) {
                try {
                    let content: any = {};
                    // Simple text support for now, expand for media later
                    if (msg.mediaUrl) {
                            // Assuming image for now, logic needs to be robust for types
                            content = { image: { url: msg.mediaUrl }, caption: msg.content };
                    } else {
                            content = { text: msg.content };
                    }

                    await instance.socket.sendMessage(msg.jid, content);

                    await prisma.scheduledMessage.update({
                        where: { id: msg.id },
                        data: { status: "SENT" }
                    });
                    console.log(`[Scheduler] Msg ${msg.id} sent to ${msg.jid}`);

                } catch (err) {
                    console.error(`[Scheduler] Failed to send scheduled msg ${msg.id}`, err);
                    await prisma.scheduledMessage.update({
                        where: { id: msg.id },
                        data: { status: "FAILED" }
                    });
                }
            } else {
                console.log(`[Scheduler] Session ${msg.sessionId} not connected for scheduled msg ${msg.id}`);
                // Optionally mark as failed or leave pending
            }
        }
    } catch (e) {
        console.error("[Scheduler] Error:", e);
    }
};

export function startScheduler() {
    console.log("Starting Message Scheduler...");
    
    // Run immediately on start
    checkScheduledMessages();

    // Then run every 30 seconds
    setInterval(checkScheduledMessages, 30 * 1000); 
}
}
