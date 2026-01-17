import { prisma } from "@/lib/prisma";
import type { WASocket, WAMessage, Contact } from "@whiskeysockets/baileys";
import { normalizeMessageContent } from "@whiskeysockets/baileys";
import { onMessageReceived, onMessageSent, dispatchWebhook, downloadAndSaveMedia } from "@/lib/webhook";
import { handleBotCommand, setSessionStartTime } from "../bot/command-handler";

export const bindSessionStore = (sock: WASocket, sessionId: string, _unused: string) => {
    // Set start time for uptime command
    setSessionStartTime(sessionId);

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
                const isNew = await processAndSaveMessage(msg, dbSessionId, sessionId, type === 'notify');
                
                // Execute Bot Commands (Only for Notify / New Messages)
                if (type === 'notify' && isNew) {
                   // Run in background, don't await strictly to not block saving
                   handleBotCommand(sock, sessionId, msg).catch(e => console.error("Bot Handler Error", e));
                }
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
                        // @ts-ignore
                        lid: c.lid || undefined,
                        name: c.name || c.notify || c.verifiedName,
                        notify: c.notify,
                        // @ts-ignore
                        verifiedName: c.verifiedName,
                        profilePic: c.imgUrl || undefined,
                        data: c as any
                    },
                    update: {
                        // @ts-ignore
                        lid: c.lid || undefined,
                        name: c.name || undefined,
                        notify: c.notify || undefined,
                        // @ts-ignore
                        verifiedName: c.verifiedName || undefined,
                        profilePic: c.imgUrl || undefined,
                        data: c as any
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
    
    // Filter out Protocol & Empty Messages
    if (!msg.message) return false;
    if (!keyId || !remoteJid) return false;
    
    // Ignore specific technical message types
    const messageKeys = Object.keys(msg.message);
    const ignoredTypes = [
        'protocolMessage', 
        'senderKeyDistributionMessage', 
        'reactionMessage', // Optional: User might want reactions, but usually "kosong" means junk
        'keepInChatMessage' 
    ];
    
    // If message only contains ignored types, skip
    if (messageKeys.every(k => ignoredTypes.includes(k))) {
        console.log(`Skipping technical message: ${keyId} (${messageKeys.join(', ')})`);
        return false;
    }

    // Check if message already exists to avoid duplicates
    // Baileys 'notify' event can sometimes trigger multiple times or for history
    // Baileys 'notify' event can sometimes trigger multiple times or for history
    const existingMessage = await prisma.message.findUnique({
        where: { sessionId_keyId: { sessionId: dbSessionId, keyId: keyId! } },
        select: { id: true, status: true }
    });

    if (existingMessage) {
        // Message exists! Update status if changed, but DO NOT re-trigger webhooks/bot
        if (fromMe && existingMessage.status !== 'SENT') {
             await prisma.message.update({
                where: { id: existingMessage.id },
                data: { status: 'SENT' }
            });
        }
        // Return false to indicate "Not New"
        return false;
    }

    // Debug fromMe issue (Keep this for a while)
    if (fromMe === undefined || fromMe === null) {
        console.log(`[DEBUG] Message ${keyId} has fromMe=${fromMe}. Key:`, JSON.stringify(msg.key));
    }

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
    // Determine effective participant for groups with standard logic
    const isGroup = remoteJid.endsWith("@g.us");
    const remoteJidAlt = msg.key.remoteJidAlt; // LID/Phone JID handling
    let senderJid = fromMe ? undefined : (isGroup ? (msg.key.participant || msg.participant) : remoteJid);
    
    // Prefer remoteJidAlt for DMs if available (matches webhook logic)
    if (!fromMe && !isGroup && remoteJidAlt) {
        senderJid = remoteJidAlt;
    }


    // Download Media First (to save URL to DB)
    let fileUrl: string | null = null;
    try {
        fileUrl = await downloadAndSaveMedia(msg, sessionId);
    } catch (e) {
        console.error("Error downloading media in store", e);
    }

    await prisma.message.create({
        data: {
            sessionId: dbSessionId,
            remoteJid,
            senderJid,
            fromMe: fromMe || false,
            keyId,
            pushName,
            type: messageType as any,
            content: text,
            mediaUrl: fileUrl, // Save Media URL
            status: fromMe ? "SENT" : "PENDING",
            timestamp
        }
    });

    // Ensure contact exists (Upsert Contact)
    if (remoteJid && !remoteJid.includes('@g.us') && !remoteJid.includes('status@broadcast')) {
         const contactData: any = {
             sessionId: dbSessionId,
             jid: remoteJid
         };

         // Only update name/notify if message is FROM the contact (not from me)
         if (!fromMe) {
             if (pushName) contactData.notify = pushName;
             if (pushName) contactData.name = pushName;
         }

         await prisma.contact.upsert({
            where: { sessionId_jid: { sessionId: dbSessionId, jid: remoteJid } },
            create: {
                sessionId: dbSessionId,
                jid: remoteJid,
                notify: !fromMe ? pushName : undefined,
                name: !fromMe ? pushName : undefined,
                // @ts-ignore
                remoteJidAlt: remoteJidAlt || undefined
            },
            update: !fromMe ? {
                notify: pushName,
                // Only update name if it was null? Or always? Let's just update notify usually.
                // But Baileys often sends name in pushName.
                // @ts-ignore
                remoteJidAlt: remoteJidAlt || undefined // Update Alt JID if we see it
            } : {}
        });
    }

    // Trigger webhook for new messages only (not history sync)
    // AND filter duplicates is implicitly done because we return 'false' above if existing
    if (triggerWebhook) {
        if (fromMe) {
            onMessageSent(sessionId, msg, fileUrl).catch(e => console.error("Error in onMessageSent", e));
        } else {
            // Pass the fileUrl we just downloaded
            onMessageReceived(sessionId, msg, fileUrl).catch(e => console.error("Error in onMessageReceived", e));
        }
    }

    return true; // Is New Message = True
}
// Placeholder - verified that I need to find the logic first
