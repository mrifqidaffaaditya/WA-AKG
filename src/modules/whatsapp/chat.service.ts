import { prisma } from "@/lib/prisma";
import { normalizeJid } from "@/lib/jid-utils";
import { waManager } from "@/modules/whatsapp/manager";
import { onMessageSent } from "@/lib/webhook";
import Sticker from "wa-sticker-formatter";
import type { InteractiveMessagePayload, AlbumItem } from "./interactive";

export class ChatService {
    /**
     * Get active chats list for a session with last message preview.
     * Cursor-based pagination — `before` is ISO timestamp of last seen chat.
     * Returns chats with last message timestamp < before (older).
     */
    static async getChatsList(
        dbSessionId: string,
        limit = 50,
        before?: string,
        search?: string
    ) {
        // 1. Get latest message per remoteJid with cursor pagination
        // Uses m1.timestamp < before (when provided) to load older chats
        // Build params: [dbSessionId, dbSessionId, (before?), limit]
        const qParams: any[] = [dbSessionId, dbSessionId];
        if (before) qParams.push(new Date(before));
        qParams.push(limit);

        const rawLastMessages = await prisma.$queryRawUnsafe<Array<{
            remoteJid: string;
            content: string | null;
            timestamp: Date;
            type: string;
        }>>(`
            SELECT m1.remoteJid, m1.content, m1.timestamp, m1.type
            FROM \`Message\` m1
            INNER JOIN (
                SELECT remoteJid, MAX(timestamp) as max_ts
                FROM \`Message\`
                WHERE sessionId = ?
                GROUP BY remoteJid
            ) m2 ON m1.remoteJid = m2.remoteJid AND m1.timestamp = m2.max_ts
            WHERE m1.sessionId = ?
            ${before ? 'AND m1.timestamp < ?' : ''}
            ORDER BY m1.timestamp DESC
            LIMIT ?
        `, ...qParams);

        // Fast return if no messages
        if (rawLastMessages.length === 0) return [];

        // 2. Batch fetch contacts & groups ONLY for JIDs that have messages
        const jids = rawLastMessages.map(m => m.remoteJid);
        const [contacts, groups] = await Promise.all([
            prisma.contact.findMany({
                where: { sessionId: dbSessionId, jid: { in: jids } },
                select: { jid: true, name: true, notify: true, profilePic: true }
            }),
            prisma.group.findMany({
                where: { sessionId: dbSessionId, jid: { in: jids } },
                select: { jid: true, subject: true }
            })
        ]);

        // Build lookup map
        const infoMap = new Map<string, { name: string | null; notify: string | null; profilePic: string | null }>();
        contacts.forEach(c => infoMap.set(c.jid, { name: c.name, notify: c.notify, profilePic: c.profilePic }));
        groups.forEach(g => infoMap.set(g.jid, { name: g.subject, notify: g.subject, profilePic: null }));

        // 3. Build result array (already sorted by SQL DESC)
        const result: any[] = [];
        const seenJids = new Set<string>();
        for (const msg of rawLastMessages) {
            if (seenJids.has(msg.remoteJid)) continue;
            seenJids.add(msg.remoteJid);

            const info = infoMap.get(msg.remoteJid);
            result.push({
                jid: msg.remoteJid,
                name: info?.name || null,
                notify: info?.notify || null,
                profilePic: info?.profilePic || null,
                lastMessage: {
                    content: msg.content,
                    timestamp: msg.timestamp instanceof Date
                        ? msg.timestamp.toISOString()
                        : String(msg.timestamp),
                    type: msg.type
                }
            });
        }

        // 4. Apply in-memory search filter if needed
        if (search && search.trim()) {
            const q = search.toLowerCase();
            return result.filter(c =>
                (c.name || '').toLowerCase().includes(q) ||
                (c.notify || '').toLowerCase().includes(q) ||
                c.jid.toLowerCase().includes(q)
            );
        }

        return result;
    }

    /**
     * Get messages for a specific chat with cursor pagination (infinite scroll).
     * @param before ISO timestamp — load messages older than this
     * @param limit max messages to return
     */
    static async getMessages(
        dbSessionId: string,
        jid: string,
        limit = 50,
        before?: string
    ) {
        const normalizedJid = normalizeJid(jid);

        // Find contact variations (LID, alt JIDs)
        const contact = await prisma.contact.findFirst({
            where: {
                sessionId: dbSessionId,
                OR: [{ jid }, { lid: jid }, { remoteJidAlt: jid }, { jid: normalizedJid }]
            },
            select: { jid: true, lid: true, remoteJidAlt: true }
        });

        const queryJids = new Set([jid, normalizedJid]);
        if (contact) {
            if (contact.jid) queryJids.add(contact.jid);
            if (contact.lid) queryJids.add(contact.lid);
            if (contact.remoteJidAlt) queryJids.add(contact.remoteJidAlt);
        }

        const where: any = {
            sessionId: dbSessionId,
            remoteJid: { in: Array.from(queryJids) }
        };

        // Cursor-based: load older messages before this timestamp
        if (before) {
            where.timestamp = { lt: new Date(before) };
        }

        const messages = await prisma.message.findMany({
            where,
            orderBy: { timestamp: 'desc' },
            take: limit + 1 // fetch 1 extra to know if there's more
        });

        const hasMore = messages.length > limit;
        if (hasMore) messages.pop();

        // Fetch quoted messages
        const quoteIds = messages.map(m => m.quoteId).filter((id): id is string => !!id);
        const quotedMessagesMap = new Map<string, { content: string | null; fromMe: boolean; senderJid: string | null; pushName: string | null }>();
        if (quoteIds.length > 0) {
            try {
                const quotedMsgs = await prisma.message.findMany({
                    where: { sessionId: dbSessionId, keyId: { in: quoteIds } },
                    select: { keyId: true, content: true, fromMe: true, senderJid: true, pushName: true }
                });
                quotedMsgs.forEach(qm => {
                    quotedMessagesMap.set(qm.keyId, {
                        content: qm.content,
                        fromMe: qm.fromMe,
                        senderJid: qm.senderJid,
                        pushName: qm.pushName
                    });
                });
            } catch (e) {
                console.error("Failed to batch load quoted messages:", e);
            }
        }

        const messagesWithQuote = messages.map((m: any) => {
            const quoted = m.quoteId ? quotedMessagesMap.get(m.quoteId) : undefined;
            return {
                ...m,
                quoted: quoted ? {
                    keyId: m.quoteId,
                    content: quoted.content,
                    fromMe: quoted.fromMe,
                    senderJid: quoted.senderJid,
                    pushName: quoted.pushName
                } : null
            };
        });

        // Return chronological order (oldest first)
        return {
            messages: messagesWithQuote.reverse(),
            hasMore
        };
    }

    static async sendTextMessage(sessionId: string, jid: string, messagePayload: any, mentions?: string[], quotedMessageId?: string) {
        const instance = waManager.getInstance(sessionId);
        if (!instance || !instance.socket) {
            throw new Error("WhatsApp session is disconnected or not found");
        }

        // Handle quoted/reply message
        let quotedOption: any = undefined;
        if (quotedMessageId) {
            try {
                const dbSession = await prisma.session.findUnique({ where: { sessionId }, select: { id: true } });
                if (dbSession) {
                    const quotedMsg = await prisma.message.findFirst({
                        where: { sessionId: dbSession.id, keyId: quotedMessageId },
                        select: { keyId: true, remoteJid: true, fromMe: true, content: true, senderJid: true }
                    });
                    if (quotedMsg) {
                        const rawParticipant = quotedMsg.fromMe 
                            ? instance.socket.user?.id 
                            : (quotedMsg.senderJid || quotedMsg.remoteJid);
                        
                        let cleanParticipant: string | undefined = undefined;
                        if (rawParticipant) {
                            const [userPart, domain] = rawParticipant.split('@');
                            const cleanUser = userPart.split(':')[0];
                            cleanParticipant = domain ? `${cleanUser}@${domain}` : cleanUser;
                        }

                        quotedOption = {
                            key: {
                                remoteJid: quotedMsg.remoteJid,
                                fromMe: quotedMsg.fromMe,
                                id: quotedMsg.keyId,
                                participant: cleanParticipant
                            },
                            message: {
                                conversation: quotedMsg.content || ""
                            }
                        };
                    }
                }
            } catch (e) {
                console.error("Error fetching quoted message (non-fatal):", e);
            }
        }

        let msgPayload = { ...messagePayload };

        // Normalize "text" to "caption" if a media message is sent with "text"
        if (msgPayload.text && (msgPayload.image || msgPayload.video || msgPayload.document || msgPayload.audio)) {
            if (!msgPayload.caption) {
                msgPayload.caption = msgPayload.text;
            }
            delete msgPayload.text;
        }

        const { safeFetchBuffer } = await import("@/lib/security");

        if (msgPayload.sticker && (msgPayload.sticker.url || typeof msgPayload.sticker === 'string')) {
            const url = msgPayload.sticker.url || msgPayload.sticker;
            try {
                const { buffer } = await safeFetchBuffer(url, { maxBytes: 10 * 1024 * 1024 });
                const sticker = new Sticker(buffer, {
                    pack: msgPayload.sticker.pack || "WA-AKG Bot",
                    author: msgPayload.sticker.author || "WA-AKG",
                    type: "full",
                    quality: 50
                });
                msgPayload = { sticker: await sticker.toBuffer() };
            } catch (e: any) {
                throw new Error(`Failed to generate sticker from URL: ${e.message}`);
            }
        }

        if (msgPayload.image && typeof msgPayload.image === 'object' && msgPayload.image.url) {
            try {
                const { buffer } = await safeFetchBuffer(msgPayload.image.url, { maxBytes: 25 * 1024 * 1024 });
                msgPayload.image = buffer;
            } catch (e: any) {
                throw new Error(`Failed to fetch image from URL: ${e.message}`);
            }
        }

        if (msgPayload.video && typeof msgPayload.video === 'object' && msgPayload.video.url) {
            try {
                const { buffer } = await safeFetchBuffer(msgPayload.video.url, { maxBytes: 100 * 1024 * 1024 });
                msgPayload.video = buffer;
            } catch (e: any) {
                throw new Error(`Failed to fetch video from URL: ${e.message}`);
            }
        }

        if (msgPayload.document && typeof msgPayload.document === 'object' && msgPayload.document.url) {
            try {
                const { buffer } = await safeFetchBuffer(msgPayload.document.url, { maxBytes: 100 * 1024 * 1024 });
                msgPayload.document = buffer;
            } catch (e: any) {
                throw new Error(`Failed to fetch document from URL: ${e.message}`);
            }
        }

        if (msgPayload.audio && typeof msgPayload.audio === 'object' && msgPayload.audio.url) {
            try {
                const { buffer } = await safeFetchBuffer(msgPayload.audio.url, { maxBytes: 50 * 1024 * 1024 });
                msgPayload.audio = buffer;
            } catch (e: any) {
                throw new Error(`Failed to fetch audio from URL: ${e.message}`);
            }
        }

        if (msgPayload.text && mentions && Array.isArray(mentions)) {
            msgPayload.mentions = mentions;
        }

        const options: any = { mentions: mentions || [] };
        if (quotedOption) {
            options.quoted = quotedOption;
        }

        const sendResult = await instance.socket.sendMessage(jid, msgPayload, options);

        // Fire webhook for sent message (non-blocking)
        try {
            const webhookMsg: any = {
                key: sendResult?.key || sendResult || {},
                message: {
                    conversation: typeof msgPayload.text === 'string' ? msgPayload.text : (msgPayload.caption || "")
                },
                messageTimestamp: Math.floor(Date.now() / 1000)
            };

            // Map media types to proper message structure for webhook
            if (msgPayload.image) {
                webhookMsg.message = {
                    imageMessage: { caption: msgPayload.caption || "", mimetype: msgPayload.mimetype || "image/jpeg" }
                };
            } else if (msgPayload.video) {
                webhookMsg.message = {
                    videoMessage: { caption: msgPayload.caption || "", mimetype: msgPayload.mimetype || "video/mp4" }
                };
            } else if (msgPayload.audio) {
                webhookMsg.message = {
                    audioMessage: { mimetype: msgPayload.ptt ? "audio/ogg; codecs=opus" : "audio/mp4" }
                };
            } else if (msgPayload.document) {
                webhookMsg.message = {
                    documentMessage: { caption: msgPayload.caption || "", fileName: msgPayload.fileName || "document", mimetype: msgPayload.mimetype || "application/octet-stream" }
                };
            } else if (msgPayload.sticker) {
                webhookMsg.message = {
                    stickerMessage: {}
                };
            }

            onMessageSent(sessionId, webhookMsg).catch(e => console.error("Webhook error:", e));
        } catch (e) {
            // Non-blocking — webhook failure shouldn't break message send
        }

        return sendResult;
    }

    /**
     * Send a media message locally from a buffer.
     */
    static async sendMediaMessage(
        sessionId: string,
        jid: string,
        buffer: Buffer,
        type: string,
        mimetype: string,
        fileName: string,
        caption: string
    ) {
        const instance = waManager.getInstance(sessionId);
        if (!instance || !instance.socket) {
            throw new Error("WhatsApp session is disconnected or not found");
        }

        const messageOptions: any = {};
        if (caption) messageOptions.caption = caption;
        messageOptions.mimetype = mimetype;

        let content: any = {};

        if (type === 'image') {
            content = { image: buffer, ...messageOptions };
        } else if (type === 'video') {
            content = { video: buffer, ...messageOptions };
        } else if (type === 'audio') {
            content = { audio: buffer, mimetype: 'audio/mp4', ptt: false };
        } else if (type === 'voice') {
            content = { audio: buffer, mimetype: 'audio/mp4', ptt: true };
        } else if (type === 'document') {
            content = { document: buffer, mimetype, fileName, ...messageOptions };
        } else if (type === 'sticker') {
            const sticker = new Sticker(buffer, {
                pack: "WA-AKG Bot",
                author: "WA-AKG",
                type: "full",
                quality: 50
            });
            content = { sticker: await sticker.toBuffer() };
        } else {
            content = { document: buffer, mimetype, fileName, ...messageOptions };
        }

        const sendResult = await instance.socket.sendMessage(jid, content);

        // Fire webhook for sent media message (non-blocking)
        try {
            const webhookMsg: any = {
                key: sendResult?.key || sendResult || {},
                message: {
                    conversation: caption || ""
                },
                messageTimestamp: Math.floor(Date.now() / 1000)
            };

            // Map media type to proper message structure for webhook
            if (type === 'image') {
                webhookMsg.message = { imageMessage: { caption: caption || "", mimetype } };
            } else if (type === 'video') {
                webhookMsg.message = { videoMessage: { caption: caption || "", mimetype } };
            } else if (type === 'audio' || type === 'voice') {
                webhookMsg.message = { audioMessage: { mimetype: 'audio/mp4', ptt: type === 'voice' } };
            } else if (type === 'document') {
                webhookMsg.message = { documentMessage: { caption: caption || "", fileName, mimetype } };
            } else if (type === 'sticker') {
                webhookMsg.message = { stickerMessage: {} };
            }

            onMessageSent(sessionId, webhookMsg).catch(e => console.error("Webhook error:", e));
        } catch (e) {
            // Non-blocking
        }

        return sendResult;
    }

    /**
     * Send rich interactive message (Native Flow buttons, single_select list, etc.)
     */
    static async sendInteractiveMessage(
        sessionId: string,
        jid: string,
        payload: InteractiveMessagePayload,
        options: any = {}
    ) {
        const instance = waManager.getInstance(sessionId);
        if (!instance || !instance.socket) {
            throw new Error("WhatsApp session is disconnected or not found");
        }

        const sendResult = await instance.socket.sendMessage(jid, {
            interactiveMessage: payload
        } as any, options);

        // Fire webhook for sent interactive message
        try {
            const webhookMsg: any = {
                key: sendResult?.key || {},
                message: {
                    conversation: payload.body || payload.title || "Interactive Message"
                },
                messageTimestamp: Math.floor(Date.now() / 1000)
            };
            onMessageSent(sessionId, webhookMsg).catch(e => console.error("Webhook error:", e));
        } catch (e) {
            // Non-blocking
        }

        return sendResult;
    }

    /**
     * Send Album message with multiple images/videos
     */
    static async sendAlbumMessage(
        sessionId: string,
        jid: string,
        items: AlbumItem[],
        options: { caption?: string; quoted?: any } = {}
    ) {
        const instance = waManager.getInstance(sessionId);
        if (!instance || !instance.socket) {
            throw new Error("WhatsApp session is disconnected or not found");
        }

        const sendResult = await instance.socket.sendMessage(jid, {
            albumMessage: items
        } as any, options);

        try {
            const webhookMsg: any = {
                key: sendResult?.key || {},
                message: {
                    conversation: options.caption || "Album Message"
                },
                messageTimestamp: Math.floor(Date.now() / 1000)
            };
            onMessageSent(sessionId, webhookMsg).catch(e => console.error("Webhook error:", e));
        } catch (e) {
            // Non-blocking
        }

        return sendResult;
    }
}
