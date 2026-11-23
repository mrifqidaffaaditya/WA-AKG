import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { waManager } from "@/modules/whatsapp/manager";
import { getAuthenticatedUser, canAccessSession } from "@/lib/api-auth";
import { sanitizePhoneToJid } from "@/lib/jid-utils";
import { safeFetchBuffer } from "@/lib/security";
import { z } from "zod";
import path from "path";
import crypto from "crypto";
import { existsSync } from "fs";
import { writeFile, readFile, mkdir } from "fs/promises";

export const normalizeBroadcastJid = sanitizePhoneToJid;

const MEDIA_DIR = path.join(process.cwd(), "data", "media");

const broadcastBodySchema = z.object({
    recipients: z.array(z.string()).min(1),
    type: z.enum(["text", "image", "video", "audio", "document", "interactive"]).optional().default("text"),
    message: z.string().optional().default(""),
    caption: z.string().optional(),
    mediaUrl: z.string().optional().nullable(),
    mediaType: z.string().optional().nullable(),
    fileName: z.string().optional().nullable(),
    ptt: z.boolean().optional(),
    interactiveData: z.any().optional(),
    delay: z.number().optional().default(2000)
});

function buildRecipientMessageContent(
    type: string,
    message: string,
    buffer: Buffer | null,
    mediaUrl: string | null,
    mediaType: string | null,
    fileName: string | null,
    ptt: boolean,
    interactiveData: any
): any {
    if (type === "image") {
        return {
            image: buffer || { url: mediaUrl! },
            caption: message || undefined,
            mimetype: mediaType || "image/jpeg"
        };
    }
    if (type === "video") {
        return {
            video: buffer || { url: mediaUrl! },
            caption: message || undefined,
            mimetype: mediaType || "video/mp4"
        };
    }
    if (type === "audio") {
        return {
            audio: buffer || { url: mediaUrl! },
            mimetype: mediaType || (ptt ? "audio/ogg; codecs=opus" : "audio/mp4"),
            ptt: Boolean(ptt)
        };
    }
    if (type === "document") {
        return {
            document: buffer || { url: mediaUrl! },
            fileName: fileName || "document",
            caption: message || undefined,
            mimetype: mediaType || "application/octet-stream"
        };
    }
    if (type === "interactive") {
        const payload: any = {
            title: interactiveData?.title || undefined,
            body: interactiveData?.body || message || "Silakan pilih opsi berikut:",
            footer: interactiveData?.footer || undefined,
            buttons: interactiveData?.buttons || []
        };
        if (buffer) {
            if (mediaType?.startsWith("image/")) payload.image = buffer;
            else if (mediaType?.startsWith("video/")) payload.video = buffer;
            else if (mediaType) {
                payload.document = buffer;
                payload.fileName = fileName || "document";
            }
        } else if (mediaUrl) {
            if (mediaType?.startsWith("image/")) payload.image = { url: mediaUrl };
            else if (mediaType?.startsWith("video/")) payload.video = { url: mediaUrl };
            else if (mediaType) {
                payload.document = { url: mediaUrl };
                payload.fileName = fileName || "document";
            }
        }
        return { interactiveMessage: payload };
    }
    // Default text
    return { text: message };
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const user = await getAuthenticatedUser(request);
        if (!user) {
            return NextResponse.json({ status: false, message: "Unauthorized", error: "Unauthorized" }, { status: 401 });
        }

        const { sessionId } = await params;
        const contentType = request.headers.get("content-type") || "";

        let recipientsInput: string[] = [];
        let type: "text" | "image" | "video" | "audio" | "document" | "interactive" = "text";
        let message = "";
        let mediaUrl: string | null = null;
        let mediaType: string | null = null;
        let fileName: string | null = null;
        let ptt = false;
        let interactiveData: any = null;
        let delay = 2000;
        let buffer: Buffer | null = null;

        if (contentType.includes("multipart/form-data")) {
            const formData = await request.formData();
            const recipientsRaw = formData.get("recipients");
            if (typeof recipientsRaw === "string") {
                try {
                    const parsed = JSON.parse(recipientsRaw);
                    if (Array.isArray(parsed)) {
                        recipientsInput = parsed;
                    } else {
                        recipientsInput = recipientsRaw.split(/[\n,]+/);
                    }
                } catch {
                    recipientsInput = recipientsRaw.split(/[\n,]+/);
                }
            }

            type = ((formData.get("type") as string) as any) || "text";
            message = (formData.get("message") as string) || (formData.get("caption") as string) || "";
            mediaUrl = (formData.get("mediaUrl") as string) || null;
            mediaType = (formData.get("mediaType") as string) || null;
            fileName = (formData.get("fileName") as string) || null;
            ptt = formData.get("ptt") === "true";
            const delayRaw = formData.get("delay");
            if (delayRaw) delay = Number(delayRaw) || 2000;

            const interactiveRaw = formData.get("interactiveData");
            if (typeof interactiveRaw === "string") {
                try {
                    interactiveData = JSON.parse(interactiveRaw);
                } catch {}
            } else if (typeof interactiveRaw === "object" && interactiveRaw !== null) {
                interactiveData = interactiveRaw;
            }

            const file = formData.get("file") as File | null;
            if (file && typeof file.arrayBuffer === "function") {
                if (!existsSync(MEDIA_DIR)) {
                    await mkdir(MEDIA_DIR, { recursive: true });
                }
                const arrayBuf = await file.arrayBuffer();
                buffer = Buffer.from(arrayBuf);
                const fileExt = path.extname(file.name) || (
                    type === "image" ? ".jpeg" :
                    type === "video" ? ".mp4" :
                    type === "audio" ? ".mp3" : ".bin"
                );
                const uniqueId = crypto.randomBytes(8).toString("hex");
                const savedFilename = `${sessionId}-${uniqueId}${fileExt}`;
                await writeFile(path.join(MEDIA_DIR, savedFilename), buffer);
                mediaUrl = `/api/media/${encodeURIComponent(savedFilename)}`;
                if (!fileName) fileName = file.name;
                if (!mediaType) mediaType = file.type || null;
            }
        } else {
            const body = await request.json();
            const parseResult = broadcastBodySchema.safeParse(body);
            if (!parseResult.success) {
                return NextResponse.json({ error: parseResult.error.flatten() }, { status: 400 });
            }
            const data = parseResult.data;
            recipientsInput = data.recipients;
            type = data.type;
            message = data.message || data.caption || "";
            mediaUrl = data.mediaUrl || null;
            mediaType = data.mediaType || null;
            fileName = data.fileName || null;
            ptt = Boolean(data.ptt);
            interactiveData = data.interactiveData || null;
            delay = data.delay;
        }

        // If mediaUrl exists and buffer not yet loaded, resolve buffer once
        if (!buffer && mediaUrl) {
            try {
                if (mediaUrl.startsWith("/api/media/")) {
                    const rawName = decodeURIComponent(mediaUrl.replace("/api/media/", ""));
                    const filePath = path.join(MEDIA_DIR, path.basename(rawName));
                    if (existsSync(filePath)) {
                        buffer = await readFile(filePath);
                        if (!fileName) fileName = rawName;
                    }
                } else if (mediaUrl.startsWith("http://") || mediaUrl.startsWith("https://")) {
                    const fetched = await safeFetchBuffer(mediaUrl, { maxBytes: 100 * 1024 * 1024 });
                    buffer = fetched.buffer;
                    if (!mediaType && fetched.contentType) mediaType = fetched.contentType;
                    if (!fileName && fetched.fileName) fileName = fetched.fileName;
                }
            } catch (err: any) {
                return NextResponse.json({
                    status: false,
                    message: `Failed to load media: ${err.message}`,
                    error: err.message
                }, { status: 400 });
            }
        }

        // Validate payload according to type
        if (type === "text" && !message.trim()) {
            return NextResponse.json({
                status: false,
                message: "Message text is required for text broadcast",
                error: "Message text is required"
            }, { status: 400 });
        }
        if (["image", "video", "audio", "document"].includes(type) && !buffer && !mediaUrl) {
            return NextResponse.json({
                status: false,
                message: `Media file or URL is required for ${type} broadcast`,
                error: "Media is required"
            }, { status: 400 });
        }
        if (type === "interactive") {
            const hasBody = Boolean((interactiveData?.body || message).trim());
            const hasButtons = Array.isArray(interactiveData?.buttons) && interactiveData.buttons.length > 0;
            if (!hasBody && !hasButtons) {
                return NextResponse.json({
                    status: false,
                    message: "Interactive message must have body text or buttons",
                    error: "Invalid interactive content"
                }, { status: 400 });
            }
        }

        // Sanitize & normalize recipients (strip '+', whitespace, non-digits, ensure valid WhatsApp JID format)
        const normalizedRecipients = Array.from(
            new Set(recipientsInput.map(normalizeBroadcastJid).filter((j): j is string => Boolean(j)))
        );

        if (normalizedRecipients.length === 0) {
            return NextResponse.json(
                { status: false, message: "No valid recipient JIDs provided", error: "No valid recipient JIDs" },
                { status: 400 }
            );
        }

        const canAccess = await canAccessSession(user.id, user.role, sessionId);
        if (!canAccess) {
            return NextResponse.json({ status: false, message: "Forbidden", error: "Forbidden" }, { status: 403 });
        }

        const instance = waManager.getInstance(sessionId);
        if (!instance?.socket) {
            return NextResponse.json({ status: false, message: "Session not ready", error: "Session not ready" }, { status: 503 });
        }

        const summaryMessage = message || (
            type === "interactive"
                ? (interactiveData?.body || interactiveData?.title || "Interactive Message")
                : (fileName || `${type} broadcast`)
        );

        // --- Save BroadcastLog & recipients to DB ---
        const log = await prisma.broadcastLog.create({
            data: {
                sessionId,
                type,
                message: summaryMessage,
                mediaUrl: mediaUrl || null,
                mediaType: mediaType || null,
                fileName: fileName || null,
                interactiveData: interactiveData ? interactiveData : undefined,
                total: normalizedRecipients.length,
                delay: delay || 2000,
                status: "running",
                recipients: {
                    create: normalizedRecipients.map(jid => ({
                        jid,
                        status: "pending"
                    }))
                }
            },
            include: { recipients: true }
        });

        const io = (global as any).io;
        const broadcastId = log.id;

        // Emit initial state
        if (io) {
            io.to(sessionId).emit("broadcast.progress", {
                broadcastId,
                status: "running",
                total: normalizedRecipients.length,
                sent: 0,
                failed: 0,
                current: null,
                progress: 0,
                startedAt: log.startedAt.toISOString()
            });
        }

        // Process in background — update DB as we go
        (async () => {
            let sent = 0;
            let failed = 0;
            const errors: { jid: string; error: string }[] = [];

            for (let i = 0; i < normalizedRecipients.length; i++) {
                const jid = normalizedRecipients[i];

                // Check if user is registered on WhatsApp (Fixes Issue #124)
                if (jid.endsWith("@s.whatsapp.net")) {
                    try {
                        const checkResult = await instance.socket!.onWhatsApp(jid);
                        const isRegistered = Array.isArray(checkResult) && checkResult.length > 0 && Boolean(checkResult[0]?.exists);
                        if (!isRegistered) {
                            failed++;
                            const notRegErr = "Number not registered on WhatsApp";
                            errors.push({ jid, error: notRegErr });
                            await prisma.broadcastRecipient.updateMany({
                                where: { broadcastLogId: broadcastId, jid },
                                data: { status: "failed", error: notRegErr }
                            });
                            await prisma.broadcastLog.update({
                                where: { id: broadcastId },
                                data: { sent, failed }
                            });
                            if (io) {
                                io.to(sessionId).emit("broadcast.progress", {
                                    broadcastId,
                                    status: "running",
                                    total: normalizedRecipients.length,
                                    sent,
                                    failed,
                                    current: jid,
                                    progress: Math.round(((sent + failed) / normalizedRecipients.length) * 100),
                                    errors
                                });
                            }
                            if (i < normalizedRecipients.length - 1 && delay > 0) {
                                const jitter = Math.floor(Math.random() * 500);
                                await new Promise((r) => setTimeout(r, delay + jitter));
                            }
                            continue;
                        }
                    } catch (checkErr) {
                        // Fallback to sendMessage if onWhatsApp verification encounters an error
                        console.warn(`[Broadcast] onWhatsApp check error for ${jid}:`, checkErr);
                    }
                }

                try {
                    const messageContent = buildRecipientMessageContent(
                        type,
                        message,
                        buffer,
                        mediaUrl,
                        mediaType,
                        fileName,
                        ptt,
                        interactiveData
                    );

                    await instance.socket!.sendMessage(jid, messageContent);
                    sent++;

                    // Update recipient status in DB
                    await prisma.broadcastRecipient.updateMany({
                        where: { broadcastLogId: broadcastId, jid },
                        data: { status: "sent", sentAt: new Date() }
                    });
                } catch (e: any) {
                    failed++;
                    errors.push({ jid, error: e.message || "Unknown error" });
                    console.error(`Failed to send broadcast to ${jid}`, e);

                    // Update recipient error in DB
                    await prisma.broadcastRecipient.updateMany({
                        where: { broadcastLogId: broadcastId, jid },
                        data: { status: "failed", error: e.message || "Unknown error" }
                    });
                }

                const progress = Math.round(((sent + failed) / normalizedRecipients.length) * 100);

                // Update BroadcastLog progress in DB
                await prisma.broadcastLog.update({
                    where: { id: broadcastId },
                    data: { sent, failed }
                });

                // Socket real-time
                if (io) {
                    io.to(sessionId).emit("broadcast.progress", {
                        broadcastId,
                        status: "running",
                        total: normalizedRecipients.length,
                        sent,
                        failed,
                        current: jid,
                        progress
                    });
                }

                // Delay between sends
                if (i < normalizedRecipients.length - 1) {
                    const baseDelay = delay || 2000;
                    const randomDelay = baseDelay + Math.floor(Math.random() * (baseDelay * 0.5));
                    await new Promise(r => setTimeout(r, randomDelay));
                }
            }

            // Mark as completed in DB
            await prisma.broadcastLog.update({
                where: { id: broadcastId },
                data: { status: "completed", sent, failed, completedAt: new Date() }
            });

            // Final socket emit
            if (io) {
                io.to(sessionId).emit("broadcast.progress", {
                    broadcastId,
                    status: "completed",
                    total: normalizedRecipients.length,
                    sent,
                    failed,
                    errors,
                    progress: 100,
                    completedAt: new Date().toISOString()
                });
            }
            console.log(`Broadcast ${broadcastId} completed: ${sent} sent, ${failed} failed out of ${normalizedRecipients.length}`);
        })();

        return NextResponse.json({
            status: true,
            message: "Broadcast started",
            data: { broadcastId: log.id, total: normalizedRecipients.length }
        });

    } catch (e) {
        console.error("Broadcast error", e);
        return NextResponse.json({ status: false, message: "Failed to start broadcast", error: "Failed to start broadcast" }, { status: 500 });
    }
}
