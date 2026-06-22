import { prisma } from "@/lib/prisma";
import { normalizeJid } from "@/lib/jid-utils";
import { waManager } from "@/modules/whatsapp/manager";
import Sticker from "wa-sticker-formatter";

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

        // Return chronological order (oldest first)
        return {
            messages: messages.reverse(),
            hasMore
        };
    }

    static async sendTextMessage(sessionId: string, jid: string, messagePayload: any, mentions?: string[], quotedMessageId?: string) {
        const instance = waManager.getInstance(sessionId);
        if (!instance || !instance.socket) {
            throw new Error("WhatsApp session is disconnected or not found");
        }

        // Handle quoted/reply message
        if (quotedMessageId) {
            try {
                const dbSession = await prisma.session.findUnique({ where: { sessionId }, select: { id: true } });
                if (dbSession) {
                    const quotedMsg = await prisma.message.findFirst({
                        where: { sessionId: dbSession.id, keyId: quotedMessageId },
                        select: { keyId: true, remoteJid: true, fromMe: true, content: true, timestamp: true }
                    });
                    if (quotedMsg && typeof messagePayload === 'object' && !messagePayload.quoted) {
                        (messagePayload as any).contextInfo = {
                            stanzaId: quotedMsg.keyId,
                            participant: quotedMsg.fromMe ? undefined : quotedMsg.remoteJid,
                            quotedMessage: { conversation: quotedMsg.content || "" }
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

        if (msgPayload.sticker && (msgPayload.sticker.url || typeof msgPayload.sticker === 'string')) {
            const url = msgPayload.sticker.url || msgPayload.sticker;
            try {
                const res = await fetch(url);
                if (!res.ok) throw new Error(`Failed to fetch sticker media`);
                const buffer = await res.arrayBuffer();
                const sticker = new Sticker(Buffer.from(buffer), {
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
                const res = await fetch(msgPayload.image.url);
                if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
                const buffer = await res.arrayBuffer();
                msgPayload.image = Buffer.from(buffer);
            } catch (e: any) {
                throw new Error(`Failed to fetch image from URL: ${e.message}`);
            }
        }

        if (msgPayload.video && typeof msgPayload.video === 'object' && msgPayload.video.url) {
            try {
                const res = await fetch(msgPayload.video.url);
                if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
                const buffer = await res.arrayBuffer();
                msgPayload.video = Buffer.from(buffer);
            } catch (e: any) {
                throw new Error(`Failed to fetch video from URL: ${e.message}`);
            }
        }

        if (msgPayload.document && typeof msgPayload.document === 'object' && msgPayload.document.url) {
            try {
                const res = await fetch(msgPayload.document.url);
                if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
                const buffer = await res.arrayBuffer();
                msgPayload.document = Buffer.from(buffer);
            } catch (e: any) {
                throw new Error(`Failed to fetch document from URL: ${e.message}`);
            }
        }

        if (msgPayload.audio && typeof msgPayload.audio === 'object' && msgPayload.audio.url) {
            try {
                const res = await fetch(msgPayload.audio.url);
                if (!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
                const buffer = await res.arrayBuffer();
                msgPayload.audio = Buffer.from(buffer);
            } catch (e: any) {
                throw new Error(`Failed to fetch audio from URL: ${e.message}`);
            }
        }

        if (msgPayload.text && mentions && Array.isArray(mentions)) {
            msgPayload.mentions = mentions;
        }

        return await instance.socket.sendMessage(jid, msgPayload, { mentions: mentions || [] } as any);
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

        return await instance.socket.sendMessage(jid, content);
    }
}
