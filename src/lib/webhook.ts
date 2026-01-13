import { prisma } from "./prisma";
import crypto from "crypto";
import { normalizeMessageContent, downloadMediaMessage, WAMessage } from "@whiskeysockets/baileys";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import pino from "pino";

// Event types that can trigger webhooks
export type WebhookEventType = 
    | "message.received"
    | "message.sent"
    | "message.status"
    | "connection.update"
    | "group.update"
    | "contact.update"
    | "status.update";

interface WebhookPayload {
    event: WebhookEventType;
    sessionId: string;
    timestamp: string;
    data: any;
}

/**
 * Dispatch webhook to all matching endpoints
 */
export async function dispatchWebhook(
    sessionId: string, 
    event: WebhookEventType, 
    data: any
) {
    try {
        // Get the session to find the userId
        const session = await prisma.session.findUnique({
            where: { sessionId },
            select: { id: true, userId: true }
        });

        if (!session) {
            console.warn(`Webhook dispatch: Session ${sessionId} not found`);
            return;
        }

        // Find all active webhooks for this user/session
        const webhooks = await prisma.webhook.findMany({
            where: {
                userId: session.userId,
                isActive: true,
                OR: [
                    { sessionId: null }, // Global webhooks
                    { sessionId: session.id } // Session-specific webhooks
                ]
            }
        });

        if (webhooks.length === 0) return;

        const payload: WebhookPayload = {
            event,
            sessionId,
            timestamp: new Date().toISOString(),
            data: normalizePayloadData(event, data) // Normalize data before sending
        };

        // Dispatch to all matching webhooks
        for (const webhook of webhooks) {
            // Check if this webhook subscribes to this event
            const events = (webhook.events as string[]) || [];
            if (!events.includes(event) && !events.includes("*")) {
                continue;
            }

            // Send webhook in background
            sendWebhookRequest(webhook.url, payload, webhook.secret).catch(err => {
                console.error(`Webhook ${webhook.id} failed:`, err);
            });
        }
    } catch (error) {
        console.error("Webhook dispatch error:", error);
    }
}

/**
 * Normalize payload data to match API format and avoid Circular/BigInt errors
 */
function normalizePayloadData(event: WebhookEventType, data: any): any {
    if (event === "message.received" || event === "message.sent") {
        // If data is already simplified, return it
        if (data.type && data.content) return data;

        // If data is raw Baileys message (which we shouldn't be passing raw anymore, but just in case)
        // Ideally the caller (onMessageReceived) should have already simplified it.
        // But let's handle the specific fields passed by onMessageReceived below.
        return data; 
    }
    return data;
}

/**
 * JSON Replacer to handle BigInt
 */
function jsonReplacer(key: string, value: any) {
    if (typeof value === 'bigint') {
        return value.toString();
    }
    return value;
}

/**
 * Send HTTP POST request to webhook endpoint
 */
async function sendWebhookRequest(url: string, payload: WebhookPayload, secret?: string | null) {
    // Use custom replacer for BigInt support
    const body = JSON.stringify(payload, jsonReplacer);
    
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        "User-Agent": "WA-AKG-Webhook/1.0"
    };

    // Add HMAC signature if secret is provided
    if (secret) {
        const signature = crypto
            .createHmac("sha256", secret)
            .update(body)
            .digest("hex");
        headers["X-Webhook-Signature"] = `sha256=${signature}`;
    }

    const response = await fetch(url, {
        method: "POST",
        headers,
        body,
        signal: AbortSignal.timeout(10000) // 10 second timeout
    });

    if (!response.ok) {
        throw new Error(`Webhook returned ${response.status}: ${response.statusText}`);
    }

    return response;
}

/**
 * Helper to download and save media
 */
async function downloadAndSaveMedia(message: WAMessage, sessionId: string): Promise<string | null> {
    try {
        const messageContent = normalizeMessageContent(message.message);
        if (!messageContent) return null;

        const messageType = Object.keys(messageContent)[0];
        if (!['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage', 'stickerMessage'].includes(messageType)) {
            return null;
        }

        const buffer = await downloadMediaMessage(
            message,
            "buffer",
            {},
            { 
               logger: pino({ level: "silent" }) as any,
               reuploadRequest: (msg) => new Promise((resolve) => resolve(msg)) 
            }
        ) as Buffer;

        if (!buffer) return null;

        // Generate filename
        const extMap: Record<string, string> = {
            imageMessage: 'jpg',
            videoMessage: 'mp4',
            audioMessage: 'mp3',
            documentMessage: 'bin',
            stickerMessage: 'webp'
        };
        
        let ext = extMap[messageType] || 'bin';
        
        // Try to get extension from mimetype if available
        const mime = (messageContent as any)[messageType]?.mimetype;
        if (mime) {
            const mimeExt = mime.split('/')[1]?.split(';')[0];
            if (mimeExt) ext = mimeExt;
        }

        const filename = `${sessionId}-${message.key.id}.${ext}`;
        const filePath = path.join(process.cwd(), "public", "media", filename);

        // Ensure directory exists (redundant if handled by OS, but safe)
        await mkdir(path.dirname(filePath), { recursive: true });
        
        await writeFile(filePath, buffer);
        
        // Return URL path (assuming served from /media)
        // In a real app you might want full URL, but relative is safer for now.
        // User requested URL.
        return `/media/${filename}`;

    } catch (e) {
        console.error("Failed to download media:", e);
        return null;
    }
}

/**
 * Helper to dispatch message received event
 * Normalizes message content to match API structure
 */
export async function onMessageReceived(sessionId: string, message: any) {
    // Re-calculate fields to match store logic EXACTLY
    const remoteJid = message.key?.remoteJid || "";
    const fromMe = message.key?.fromMe || false;
    const isGroup = remoteJid.endsWith("@g.us");
    const participant = isGroup ? (message.key?.participant || message.participant) : undefined;
    
    // Extract Alt JID (e.g. Phone Number JID when remoteJid is LID)
    // Note: Baileys puts this in key sometimes
    const remoteJidAlt = message.key?.remoteJidAlt || null;

    // "from" is usually the chat JID (remoteJid)
    // "sender" is who sent it. In DM: remoteJid. In Group: participant.
    // If DM and remoteJidAlt exists (Phone JID), user prefers that as sender.
    let sender: any = isGroup ? participant : remoteJid;
    if (!isGroup && remoteJidAlt) {
        sender = remoteJidAlt;
    }
    
    // Enrich Participant Data if Group
    let participantDetail: any = participant;
    
    if (isGroup && typeof sender === 'string') {
        try {
            // Need dbSessionId
            const session = await prisma.session.findUnique({ 
                where: { sessionId },
                select: { id: true }
            });
            
            if (session) {
                const group = await prisma.group.findUnique({
                    where: { 
                        sessionId_jid: { 
                            sessionId: session.id, 
                            jid: remoteJid 
                        } 
                    },
                    select: { participants: true }
                });
                
                if (group && group.participants) {
                    const parts = group.participants as any[];
                    // Try to match sender or participant JID
                    const found = parts.find(p => p.id === sender || p.id === participant);
                    if (found) {
                        sender = found;
                        participantDetail = found;
                    }
                }
            }
        } catch (e) {
            console.error("Failed to enrich participant", e);
        }
    }

    // Download media if available
    let fileUrl: string | null = null;
    try {
        fileUrl = await downloadAndSaveMedia(message, sessionId);
    } catch (e) {
         console.error("Error handling media download", e);
    }

    const normalized = extractMessageContent(message);
    
    dispatchWebhook(sessionId, "message.received", {
        key: {
            id: message.key?.id,
            remoteJid: remoteJid,
            fromMe: fromMe,
            participant: participantDetail
        },
        pushName: message.pushName,
        messageTimestamp: message.messageTimestamp,
        
        // Simplified Fields
        from: remoteJid,            // Chat ID
        sender: sender,             // Who Sent It (Preferred JID or Object)
        remoteJidAlt: remoteJidAlt, // Explicit Alt Field
        isGroup: isGroup,           // Boolean
        
        // Message Content
        type: normalized.type,
        content: normalized.content,
        fileUrl: fileUrl,           // Link to file if media
        caption: normalized.caption, // Separate caption
        
        // Raw Data (Requested by User)
        raw: message
    });
}

/**
 * Helper to dispatch message sent event
 */
export async function onMessageSent(sessionId: string, message: any) {
    const normalized = extractMessageContent(message);
    const remoteJid = message.key?.remoteJid || "";
    
    // Download media for sent messages too (optional but good)
    let fileUrl: string | null = null;
    try {
        fileUrl = await downloadAndSaveMedia(message, sessionId);
    } catch (e) { /* ignore */ }
    
    // For sent messages, sender is always ME (or represented by the bot)
    // If it's a group, the participant might be undefined in the key if sent by us, 
    // but typically we are the sender.
    const sender = message.key?.participant || (message.key?.fromMe ? "ME" : remoteJid);
    const remoteJidAlt = message.key?.remoteJidAlt || null;

    dispatchWebhook(sessionId, "message.sent", {
        key: message.key,
        
        from: remoteJid,
        sender: sender,
        remoteJidAlt: remoteJidAlt, 
        isGroup: remoteJid.endsWith("@g.us"),
        
        type: normalized.type,
        content: normalized.content,
        fileUrl: fileUrl,
        caption: normalized.caption,
        
        timestamp: Date.now(),
        raw: message
    });
}

/**
 * Determine chat type from JID
 */
function getChatType(jid: string): "PERSONAL" | "GROUP" | "STATUS" | "NEWSLETTER" | "UNKNOWN" {
    if (!jid) return "UNKNOWN";
    if (jid.endsWith("@g.us")) return "GROUP";
    if (jid.endsWith("@s.whatsapp.net")) return "PERSONAL";
    if (jid === "status@broadcast") return "STATUS";
    if (jid.endsWith("@newsletter")) return "NEWSLETTER";
    return "UNKNOWN";
}

/**
 * Helper to dispatch connection update event
 */
export function onConnectionUpdate(sessionId: string, status: string, qr?: string) {
    dispatchWebhook(sessionId, "connection.update", {
        status,
        qr: qr || null
    });
}

/**
 * Extract content and type from Baileys message
 */
function extractMessageContent(msg: any): { type: string, content: string, caption?: string } {
    const messageContent = normalizeMessageContent(msg.message);
    let text = "";
    let caption = undefined;
    let messageType = "TEXT";

    if (!messageContent) return { type: "UNKNOWN", content: "" };

    if (messageContent.conversation) {
        text = messageContent.conversation;
    } else if (messageContent.extendedTextMessage?.text) {
        text = messageContent.extendedTextMessage.text;
    } else if (messageContent.imageMessage) {
        messageType = "IMAGE";
        caption = messageContent.imageMessage.caption || "";
        text = caption; // Content often used as text display
    } else if (messageContent.videoMessage) {
        messageType = "VIDEO";
        caption = messageContent.videoMessage.caption || "";
        text = caption;
    } else if (messageContent.audioMessage) {
        messageType = "AUDIO";
    } else if (messageContent.documentMessage) {
        messageType = "DOCUMENT";
        text = messageContent.documentMessage.fileName || "";
        caption = messageContent.documentMessage.caption || "";
    } else if (messageContent.stickerMessage) {
        messageType = "STICKER";
    } else if (messageContent.locationMessage) {
        messageType = "LOCATION";
        text = `${messageContent.locationMessage.degreesLatitude},${messageContent.locationMessage.degreesLongitude}`;
    } else if (messageContent.contactMessage) {
        messageType = "CONTACT";
        text = messageContent.contactMessage.displayName || "";
    }

    return { type: messageType, content: text, caption };
}

