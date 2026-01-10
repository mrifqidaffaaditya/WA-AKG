import { prisma } from "@/lib/prisma";
import type { WASocket, WAMessage } from "@whiskeysockets/baileys";
import { downloadMediaMessage } from "@whiskeysockets/baileys";
import Sticker from "wa-sticker-formatter"; 

// Map to track start times for uptime
const startTimes = new Map<string, number>();

// Default bot config
const DEFAULT_CONFIG = {
    enabled: true,
    publicMode: false,
    enableSticker: true,
    enablePing: true,
    enableUptime: true,
    removeBgApiKey: null as string | null
};

export function setSessionStartTime(sessionId: string) {
    if (!startTimes.has(sessionId)) {
        startTimes.set(sessionId, Date.now());
    }
}

export async function handleBotCommand(
    sock: WASocket | undefined,
    sessionId: string,
    msg: WAMessage
) {
    if (!sock || !msg.message || !msg.key.remoteJid) return;

    const remoteJid = msg.key.remoteJid;
    const fromMe = msg.key.fromMe || false;
    
    // Get text content
    let text = "";
    const messageContent = msg.message;
    
    if (messageContent.conversation) {
        text = messageContent.conversation;
    } else if (messageContent.extendedTextMessage?.text) {
        text = messageContent.extendedTextMessage.text;
    } else if (messageContent.imageMessage?.caption) {
        text = messageContent.imageMessage.caption;
    } else if (messageContent.videoMessage?.caption) {
        text = messageContent.videoMessage.caption;
    }

    if (!text.startsWith("#")) return;

    // Fetch session first
    const session = await prisma.session.findUnique({
        where: { sessionId },
        select: { id: true }
    });

    if (!session) return;
    
    // Fetch BotConfig separately to avoid TypeScript include issues
    const botConfig = await prisma.botConfig.findUnique({
        where: { sessionId: session.id }
    });
    
    const config = botConfig || DEFAULT_CONFIG;

    if (!config.enabled) return;
    
    // Public Mode Check:
    // If publicMode is FALSE, ONLY the owner (fromMe) can use it.
    if (!config.publicMode && !fromMe) {
        return;
    }

    const [command, ...args] = text.trim().split(" ");
    const cmd = command.toLowerCase().slice(1); // remove #

    try {
        switch (cmd) {
            case "ping": {
                if (!config.enablePing) return;
                await sock.sendMessage(remoteJid, { text: "Pong! 🏓" }, { quoted: msg });
                break;
            }
            
            case "id": {
                await sock.sendMessage(remoteJid, { 
                    text: `*Chat ID:* \`${remoteJid}\`` 
                }, { quoted: msg });
                break;
            }

            case "uptime": {
                if (!config.enableUptime) return;
                
                const start = startTimes.get(sessionId) || Date.now();
                const uptimeMs = Date.now() - start;
                const hours = Math.floor(uptimeMs / 3600000);
                const minutes = Math.floor((uptimeMs % 3600000) / 60000);
                const seconds = Math.floor((uptimeMs % 60000) / 1000);
                
                await sock.sendMessage(remoteJid, { 
                    text: `*Session Uptime:* ${hours}h ${minutes}m ${seconds}s` 
                }, { quoted: msg });
                break;
            }

            case "sticker": 
            case "s": 
            case "stiker": {
                if (!config.enableSticker) return;

                // Check if message has image
                let mediaMsg: WAMessage | null = msg;
                
                // If quoted, check quoted
                const quoted = messageContent.extendedTextMessage?.contextInfo?.quotedMessage;
                if (quoted) {
                    mediaMsg = {
                        key: {
                            remoteJid,
                            id: messageContent.extendedTextMessage?.contextInfo?.stanzaId,
                        },
                        message: quoted
                    } as WAMessage;
                }

                // Verify it is an image
                const isImage = !!mediaMsg.message?.imageMessage;
                
                if (!isImage) {
                    await sock.sendMessage(remoteJid, { text: "❌ Please reply to an image or send an image with caption #sticker" }, { quoted: msg });
                    return;
                }

                await sock.sendMessage(remoteJid, { react: { text: "⏳", key: msg.key } });

                try {
                    // Download
                    let buffer = await downloadMediaMessage(
                        mediaMsg,
                        "buffer",
                        {}
                    ) as Buffer;
                    
                    // Check for background removal
                    const isRemoveBg = args.includes("nobg") || args.includes("removebg");
                    if (isRemoveBg && config.removeBgApiKey) {
                        try {
                            // Convert Buffer to Uint8Array for Blob compatibility
                            const uint8Array = new Uint8Array(buffer);
                            const blob = new Blob([uint8Array], { type: 'image/png' });
                            
                            const formData = new FormData();
                            formData.append('image_file', blob, 'image.png');
                            formData.append('size', 'auto');

                            const res = await fetch('https://api.remove.bg/v1.0/removebg', {
                                method: 'POST',
                                headers: {
                                    'X-Api-Key': config.removeBgApiKey
                                },
                                body: formData
                            });

                            if (res.ok) {
                                const arrayBuffer = await res.arrayBuffer();
                                buffer = Buffer.from(arrayBuffer);
                            } else {
                                const err = await res.json();
                                throw new Error(`RemoveBG Error: ${(err as any).errors?.[0]?.title || res.statusText}`);
                            }
                        } catch (bgError) {
                            console.error("RemoveBG Failed:", bgError);
                            await sock.sendMessage(remoteJid, { text: `⚠️ Remove BG failed: ${(bgError as any).message}. Sending normal sticker...` }, { quoted: msg });
                        }
                    } else if (isRemoveBg && !config.removeBgApiKey) {
                         await sock.sendMessage(remoteJid, { text: `⚠️ Remove BG API Key not configured in dashboard. Sending normal sticker...` }, { quoted: msg });
                    }

                    // Convert
                    const sticker = new Sticker(buffer as Buffer, {
                        pack: "WA-AKG Bot",
                        author: "By WA-AKG",
                        type: "full", // full, crop, circle
                        quality: 50
                    });

                    const stickerBuffer = await sticker.toBuffer();

                    // Send
                    await sock.sendMessage(remoteJid, { sticker: stickerBuffer }, { quoted: msg });
                    await sock.sendMessage(remoteJid, { react: { text: "✅", key: msg.key } });

                } catch (e) {
                    console.error("Sticker generation failed", e);
                    await sock.sendMessage(remoteJid, { text: "❌ Failed to create sticker. Error: " + (e as any).message }, { quoted: msg });
                }
                break;
            }
            
            case "menu":
            case "help": {
                 const menu = `
🤖 *WA-AKG Bot Menu* 🤖

📌 *Commands:*
• *#sticker* / *#s*: Convert Image to Sticker
  - Use *#sticker nobg* to remove background (Requires API Key)
• *#ping*: Check Bot Status
• *#uptime*: Check Session Uptime
• *#id*: Get Chat ID

_Made with ❤️_
`;
                 await sock.sendMessage(remoteJid, { text: menu }, { quoted: msg });
                 break;
            }

            default:
                // Ignore unknown commands
                break;
        }
    } catch (e) {
        console.error("Bot command error", e);
    }
}
