import { prisma } from "@/lib/prisma";
import type { WASocket } from "@whiskeysockets/baileys";
import { normalizeMessageContent } from "@whiskeysockets/baileys";

// Helper for permission check (Deduplicate from command-handler if possible, but keep simple here)
function canAutoReply(config: any, fromMe: boolean, senderJid: string): boolean {
    if (!config || !config.enabled) return false;
    
    // Auto Reply Specific Mode
    const mode = config.autoReplyMode || 'ALL';
    
    if (fromMe) {
        // If mode is OWNER, it triggers for ME? 
        // Auto Reply usually replies TO someone. 
        // If I send a message, and mode is OWNER, should it reply to me? 
        // User requested "Self Mode" -> Use case: Snippets.
        // So yes, if fromMe checks out.
        
        // However, standard auto-reply logic (replying to incoming) should be blocked if fromMe is true AND mode is ALL?
        // No, typically Auto Reply doesn't trigger on own messages to prevent unexpected loops.
        // But for "Self Mode" (Macros), it MUST trigger on own messages.
        
        if (mode === 'OWNER') return true; 
        if (mode === 'ALL') return false; // Standard auto-reply ignores self
        
        // Specific? 
        return false; 
    } else {
        // Incoming message from others
        if (mode === 'OWNER') return false; // Owner only acts on Owner messages
        if (mode === 'ALL') return true;
        
        if (mode === 'SPECIFIC') {
            const allowedJids = config.autoReplyAllowedJids || [];
            if (Array.isArray(allowedJids)) {
                 return allowedJids.some((jid: string) => senderJid.includes(jid));
            }
        }
    }
    
    return false;
}

export async function bindAutoReply(sock: WASocket, sessionId: string) {
    sock.ev.on('messages.upsert', async ({ messages, type }) => {
        if (type !== 'notify') return;

        // Fetch session ID and Bot Config once per batch (optimization)
        const session = await prisma.session.findUnique({
             where: { sessionId },
             // @ts-ignore
             include: { botConfig: true } 
        });
        
        if (!session) return;
        
        // @ts-ignore
        let config = (session as any).botConfig;
        
        if (!config) {
             console.log("AutoReply: No config found, creating default...");
             config = await prisma.botConfig.create({
                 data: {
                     sessionId: session.id,
                     enabled: true,
                     botMode: 'OWNER',
                     autoReplyMode: 'ALL'
                 }
             });
        }

        console.log(`AutoReply: Processing for ${sessionId}. Config:`, config ? "Found" : "Missing", config?.enabled ? "Enabled" : "Disabled");
        
        if (!config || !config.enabled) return;

        for (const msg of messages) {
            const fromMe = msg.key.fromMe || false;
            const remoteJid = msg.key.remoteJid;
            const senderJid = msg.key.participant || remoteJid;

            if (!remoteJid || !senderJid) continue;

            // Check Permissions
            if (!canAutoReply(config, fromMe, senderJid)) continue;

            const content = normalizeMessageContent(msg.message);
            const text = content?.conversation || content?.extendedTextMessage?.text || ""; // Caption?

            if (!text) continue;

            try {
                // Fetch rules for this session
                const rules = await prisma.autoReply.findMany({
                    where: { 
                        session: {
                            sessionId: sessionId
                        }
                    }
                });

                for (const rule of rules) {
                    let match = false;
                    const keyword = rule.keyword.toLowerCase();
                    const incoming = text.toLowerCase();

                    switch (rule.matchType) {
                        case 'EXACT':
                            match = incoming === keyword;
                            break;
                        case 'CONTAINS':
                            match = incoming.includes(keyword);
                            break;
                        case 'REGEX':
                            try {
                                const regex = new RegExp(rule.keyword, 'i');
                                match = regex.test(text); // Use original case for regex
                            } catch (e) {
                                console.error("Invalid regex in auto-reply", rule.keyword);
                            }
                            break;
                    }

                    if (match) {
                        console.log(`Auto-reply match: ${rule.keyword} -> ${remoteJid}`);
                        
                        // Send response
                        // Check if media or text
                        if (rule.isMedia && rule.mediaUrl) {
                            // TODO: Implement media sending from URL
                             await sock.sendMessage(remoteJid, { 
                                text: rule.response // Caption
                                // image: { url: rule.mediaUrl } // Need to determine type
                            }, { quoted: msg });
                        } else {
                            await sock.sendMessage(remoteJid, { text: rule.response }, { quoted: msg });
                        }
                        
                        break; 
                    }
                }

            } catch (e) {
                console.error("Auto-reply error", e);
            }
        }
    });
}
