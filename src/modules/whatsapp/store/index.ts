import { prisma } from "@/lib/prisma";
import type { WASocket, WAMessage, Contact } from "@whiskeysockets/baileys";
import { normalizeMessageContent } from "@whiskeysockets/baileys";
import { onMessageReceived, onMessageSent, dispatchWebhook } from "@/lib/webhook";

export const bindSessionStore = (sock: WASocket, sessionId: string, _unused: string) => {
    // First, get the database Session ID (cuid)
    let dbSessionId: string | null = null;
    
    // Initialize by fetching the session ID
    (async () => {
        const session = await prisma.session.findUnique({
            where: { sessionId },
            select: { id: true }
        });
        if (session) {
            dbSessionId = session.id;
            console.log(`Message store initialized for session ${sessionId} (db: ${dbSessionId})`);
        } else {
            console.error(`Session ${sessionId} not found for message store`);
        }
    })();
    
    // Handle Messages
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        // Process all message types: notify, append, and history sync
        if (type !== 'notify' && type !== 'append') {
            // For history sync, we still want to save messages
            console.log(`Received ${messages.length} messages of type: ${type}`);
        }

        // Ensure we have the database session ID
        if (!dbSessionId) {
            const session = await prisma.session.findUnique({ where: { sessionId }, select: { id: true } });
            if (!session) return;
            dbSessionId = session.id;
        }

        for (const msg of messages) {
            try {
                await processAndSaveMessage(msg, dbSessionId, sessionId, type === 'notify');
            } catch (error) {
                console.error("Error saving message", error);
            }
        }
    });

    // Handle Message History Sync (when connecting for the first time or syncing)
    sock.ev.on('messaging-history.set', async ({ messages, chats, contacts, isLatest }) => {
        console.log(`History sync: ${messages?.length || 0} messages, ${chats?.length || 0} chats, ${contacts?.length || 0} contacts, latest: ${isLatest}`);
        
        // Ensure we have the database session ID
        if (!dbSessionId) {
            const session = await prisma.session.findUnique({ where: { sessionId }, select: { id: true } });
            if (!session) return;
            dbSessionId = session.id;
        }

        // Save all historical messages
        if (messages && messages.length > 0) {
            console.log(`Syncing ${messages.length} historical messages...`);
            for (const msg of messages) {
                try {
                    await processAndSaveMessage(msg, dbSessionId, sessionId, false);
                } catch (error) {
                    console.error("Error saving historical message", error);
                }
            }
            console.log(`Finished syncing ${messages.length} historical messages`);
        }


        // Note: Contacts and Chats are synced by src/modules/whatsapp/store/contacts.ts
        // We only handle messages here to avoid P2002 Unique Constraint Race Conditions.
        console.log(`Finished syncing ${messages.length} historical messages`);
    });

    // Handle Contacts Upsert
    sock.ev.on('contacts.upsert', async (contacts) => {
        // Ensure we have the database session ID
        if (!dbSessionId) {
            const session = await prisma.session.findUnique({ where: { sessionId }, select: { id: true } });
            if (!session) return;
            dbSessionId = session.id;
        }

        for (const c of contacts) {
             try {
                if (!c.id) continue;
                await prisma.contact.upsert({
                    where: { sessionId_jid: { sessionId: dbSessionId, jid: c.id } },
                    create: {
                        sessionId: dbSessionId,
                        jid: c.id,
                        name: c.name || c.notify,
                        notify: c.notify
                    },
                    update: {
                        name: c.name || undefined,
                        notify: c.notify || undefined
                    }
                });
                
                // Dispatch webhook for contact update
                dispatchWebhook(sessionId, "contact.update", { jid: c.id, name: c.name, notify: c.notify });
             } catch (e) {
                 console.error("Error saving contact", e);
             }
        }
    });

    // Handle Message Status Updates
    sock.ev.on('messages.update', async (updates) => {
        if (!dbSessionId) return;
        
        for (const update of updates) {
            try {
                const keyId = update.key?.id;
                if (!keyId) continue;

                const statusMap: Record<number, string> = {
                    0: 'PENDING',
                    1: 'SENT',
                    2: 'DELIVERED',
                    3: 'READ',
                    4: 'READ', // Played
                };

                const status = statusMap[update.update?.status || 0] || 'PENDING';

                await prisma.message.updateMany({
                    where: { sessionId: dbSessionId, keyId },
                    data: { status: status as any }
                });

                // Dispatch webhook for message status update
                dispatchWebhook(sessionId, "message.status", {
                    keyId,
                    remoteJid: update.key?.remoteJid,
                    status
                });
            } catch (e) {
                console.error("Error updating message status", e);
            }
        }
    });
};

async function processAndSaveMessage(msg: WAMessage, dbSessionId: string, sessionId: string, triggerWebhook: boolean) {
    const keyId = msg.key.id;
    const remoteJid = msg.key.remoteJid;
    const fromMe = msg.key.fromMe;
    const pushName = msg.pushName;
    const timestamp = msg.messageTimestamp 
        ? new Date((typeof msg.messageTimestamp === 'number' ? msg.messageTimestamp : Number(msg.messageTimestamp)) * 1000)
        : new Date();
    
    if (!keyId || !remoteJid) return;

    const messageContent = normalizeMessageContent(msg.message);
    let text = "";
    let messageType = "TEXT";

    // Extract content based on message type
    if (messageContent?.conversation) {
        text = messageContent.conversation;
    } else if (messageContent?.extendedTextMessage?.text) {
        text = messageContent.extendedTextMessage.text;
    } else if (messageContent?.imageMessage) {
        messageType = "IMAGE";
        text = messageContent.imageMessage.caption || "";
    } else if (messageContent?.videoMessage) {
        messageType = "VIDEO";
        text = messageContent.videoMessage.caption || "";
    } else if (messageContent?.audioMessage) {
        messageType = "AUDIO";
    } else if (messageContent?.documentMessage) {
        messageType = "DOCUMENT";
        text = messageContent.documentMessage.fileName || "";
    } else if (messageContent?.stickerMessage) {
        messageType = "STICKER";
    } else if (messageContent?.locationMessage) {
        messageType = "LOCATION";
        text = `${messageContent.locationMessage.degreesLatitude},${messageContent.locationMessage.degreesLongitude}`;
    } else if (messageContent?.contactMessage) {
        messageType = "CONTACT";
        text = messageContent.contactMessage.displayName || "";
    }

    // Determine effective participant for groups
    const senderJid = fromMe ? undefined : (remoteJid.includes('@g.us') ? msg.key.participant : remoteJid);

    await prisma.message.upsert({
        where: { sessionId_keyId: { sessionId: dbSessionId, keyId } },
        create: {
            sessionId: dbSessionId,
            remoteJid,
            senderJid,
            fromMe: fromMe || false,
            keyId,
            pushName,
            type: messageType as any,
            content: text,
            status: fromMe ? "SENT" : "PENDING",
            timestamp
        },
        update: {
            // Only update if we have new information
            status: fromMe ? "SENT" : "PENDING", 
        }
    });

    // Ensure contact exists (Upsert Contact)
    if (remoteJid && !remoteJid.includes('@g.us') && !remoteJid.includes('status@broadcast')) {
         await prisma.contact.upsert({
            where: { sessionId_jid: { sessionId: dbSessionId, jid: remoteJid } },
            create: {
                sessionId: dbSessionId,
                jid: remoteJid,
                name: pushName || undefined,
                notify: pushName
            },
            update: {
                notify: pushName
            }
        });
    }

    // Trigger webhook for new messages only (not history sync)
    if (triggerWebhook) {
        if (fromMe) {
            onMessageSent(sessionId, msg);
        } else {
            onMessageReceived(sessionId, msg);
        }
    }
}
