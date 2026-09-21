import {
    proto,
    generateWAMessageFromContent,
    generateWAMessage,
    prepareWAMessageMedia,
    jidNormalizedUser,
    WASocket,
    WAMessage
} from "@whiskeysockets/baileys";
import crypto from "crypto";
import { logger } from "@/lib/logger";

export interface NativeButtonQuickReply {
    type?: "quick_reply";
    name?: "quick_reply";
    displayText?: string;
    id?: string;
    buttonParamsJson?: string;
}

export interface NativeButtonCtaUrl {
    type?: "cta_url";
    name?: "cta_url";
    displayText?: string;
    url?: string;
    merchantUrl?: string;
    buttonParamsJson?: string;
}

export interface NativeButtonCtaCall {
    type?: "cta_call";
    name?: "cta_call";
    displayText?: string;
    phoneNumber?: string;
    buttonParamsJson?: string;
}

export interface NativeButtonCtaCopy {
    type?: "cta_copy";
    name?: "cta_copy";
    displayText?: string;
    copyCode?: string;
    buttonParamsJson?: string;
}

export interface InteractiveRow {
    header?: string;
    title: string;
    description?: string;
    id: string;
}

export interface InteractiveSection {
    title: string;
    highlight_label?: string;
    rows: InteractiveRow[];
}

export interface NativeButtonSingleSelect {
    type?: "single_select";
    name?: "single_select";
    title?: string;
    sections?: InteractiveSection[];
    buttonParamsJson?: string;
}

export type AnyInteractiveButton =
    | NativeButtonQuickReply
    | NativeButtonCtaUrl
    | NativeButtonCtaCall
    | NativeButtonCtaCopy
    | NativeButtonSingleSelect
    | { name: string; buttonParamsJson: string };

export interface InteractiveHeaderMedia {
    image?: Buffer | { url: string };
    video?: Buffer | { url: string };
    document?: Buffer | { url: string };
    fileName?: string;
    mimetype?: string;
    jpegThumbnail?: Buffer | { url: string };
}

export interface InteractiveMessagePayload {
    title?: string;
    body?: string;
    footer?: string;
    header?: string | InteractiveHeaderMedia;
    thumbnail?: string;
    image?: Buffer | { url: string };
    video?: Buffer | { url: string };
    document?: Buffer | { url: string };
    fileName?: string;
    mimetype?: string;
    jpegThumbnail?: Buffer | { url: string };
    buttons?: AnyInteractiveButton[];
    nativeFlowMessage?: any;
    contextInfo?: any;
    externalAdReply?: any;
}

export interface AlbumItem {
    image?: Buffer | { url: string };
    video?: Buffer | { url: string };
    caption?: string;
    [key: string]: any;
}

export interface EventMessagePayload {
    name: string;
    description?: string;
    startTime: number | string;
    endTime?: number | string;
    isCanceled?: boolean;
    location?: {
        name?: string;
        degreesLatitude?: number;
        degreesLongitude?: number;
    };
    joinLink?: string;
    extraGuestsAllowed?: boolean;
}

/**
 * Checks if the message content is an interactive or extended type
 * (compatible with Lekzo Baileys detectType)
 */
export function isInteractiveContent(content: any): boolean {
    if (!content || typeof content !== "object") return false;
    return Boolean(
        content.interactiveMessage ||
        content.albumMessage ||
        content.productMessage ||
        content.eventMessage ||
        content.buttonsMessage ||
        content.listMessage ||
        content.templateMessage
    );
}

/**
 * Normalizes and converts diverse button shapes into standard WhatsApp Native Flow buttons
 */
export function formatNativeButtons(buttons: AnyInteractiveButton[]): any[] {
    if (!Array.isArray(buttons)) return [];

    return buttons.map(btn => {
        // If already in standard { name, buttonParamsJson } format
        if (btn.name && typeof btn.buttonParamsJson === "string") {
            return {
                name: btn.name,
                buttonParamsJson: btn.buttonParamsJson
            };
        }
        if (btn.name && typeof (btn as any).buttonParamsJson === "object" && (btn as any).buttonParamsJson !== null) {
            return {
                name: btn.name,
                buttonParamsJson: JSON.stringify((btn as any).buttonParamsJson)
            };
        }

        const type = (btn as any).type || btn.name;

        if (type === "quick_reply") {
            const b = btn as NativeButtonQuickReply;
            const displayText = b.displayText || (btn as any).display_text || (btn as any).text || "";
            const id = b.id || displayText;
            return {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: displayText,
                    id: id
                })
            };
        }

        if (type === "cta_url") {
            const b = btn as NativeButtonCtaUrl;
            const displayText = b.displayText || (btn as any).display_text || "";
            const url = b.url || "";
            const merchantUrl = b.merchantUrl || (btn as any).merchant_url || url;
            return {
                name: "cta_url",
                buttonParamsJson: JSON.stringify({
                    display_text: displayText,
                    url: url,
                    merchant_url: merchantUrl
                })
            };
        }

        if (type === "cta_call") {
            const b = btn as NativeButtonCtaCall;
            const displayText = b.displayText || (btn as any).display_text || "";
            const phoneNumber = b.phoneNumber || (btn as any).phone_number || "";
            return {
                name: "cta_call",
                buttonParamsJson: JSON.stringify({
                    display_text: displayText,
                    phone_number: phoneNumber
                })
            };
        }

        if (type === "cta_copy") {
            const b = btn as NativeButtonCtaCopy;
            const displayText = b.displayText || (btn as any).display_text || "Copy";
            const copyCode = b.copyCode || (btn as any).copy_code || "";
            return {
                name: "cta_copy",
                buttonParamsJson: JSON.stringify({
                    display_text: displayText,
                    copy_code: copyCode
                })
            };
        }

        if (type === "single_select") {
            const b = btn as NativeButtonSingleSelect;
            const title = b.title || "Select";
            const sections = (b.sections || []).map(sec => ({
                title: sec.title || "",
                highlight_label: sec.highlight_label || "",
                rows: (sec.rows || []).map(row => ({
                    header: row.header || "",
                    title: row.title || "",
                    description: row.description || "",
                    id: row.id
                }))
            }));
            return {
                name: "single_select",
                buttonParamsJson: JSON.stringify({
                    title: title,
                    sections: sections
                })
            };
        }

        // Fallback for custom button formats
        return {
            name: btn.name || "quick_reply",
            buttonParamsJson: btn.buttonParamsJson || JSON.stringify(btn)
        };
    });
}

/**
 * Converts legacy WhatsApp message formats (listMessage, buttonsMessage, templateMessage)
 * into modern interactiveMessage with Native Flow buttons.
 */
export function convertLegacyToInteractive(content: any): any {
    if (!content || typeof content !== "object") return content;

    // Legacy listMessage
    if (content.listMessage) {
        const list = content.listMessage;
        const nativeButtons = [
            {
                name: "single_select",
                buttonParamsJson: JSON.stringify({
                    title: list.buttonText || "Select",
                    sections: (list.sections || []).map((sec: any) => ({
                        title: sec.title || "",
                        highlight_label: "",
                        rows: (sec.rows || []).map((row: any) => ({
                            header: "",
                            title: row.title || "",
                            description: row.description || "",
                            id: row.rowId || row.id || ""
                        }))
                    }))
                })
            }
        ];

        return {
            interactiveMessage: {
                body: { text: list.description || "" },
                footer: list.footerText ? { text: list.footerText } : undefined,
                header: list.title ? { title: list.title, hasMediaAttachment: false } : undefined,
                nativeFlowMessage: {
                    buttons: nativeButtons,
                    messageParamsJson: "",
                    messageVersion: 1
                },
                contextInfo: list.contextInfo
            }
        };
    }

    // Legacy buttonsMessage
    if (content.buttonsMessage) {
        const bMsg = content.buttonsMessage;
        const nativeButtons = (bMsg.buttons || []).map((btn: any) => ({
            name: "quick_reply",
            buttonParamsJson: JSON.stringify({
                display_text: btn.buttonText?.displayText || btn.buttonText || "",
                id: btn.buttonId || btn.buttonText?.displayText || ""
            })
        }));

        let header: any = undefined;
        if (bMsg.imageMessage) {
            header = { hasMediaAttachment: true, imageMessage: bMsg.imageMessage };
        } else if (bMsg.videoMessage) {
            header = { hasMediaAttachment: true, videoMessage: bMsg.videoMessage };
        } else if (bMsg.documentMessage) {
            header = { hasMediaAttachment: true, documentMessage: bMsg.documentMessage };
        } else if (bMsg.text) {
            header = { title: bMsg.text, hasMediaAttachment: false };
        }

        return {
            interactiveMessage: {
                body: { text: bMsg.contentText || bMsg.text || "" },
                footer: bMsg.footerText ? { text: bMsg.footerText } : undefined,
                header: header,
                nativeFlowMessage: {
                    buttons: nativeButtons,
                    messageParamsJson: "",
                    messageVersion: 1
                },
                contextInfo: bMsg.contextInfo
            }
        };
    }

    // Legacy templateMessage
    if (content.templateMessage) {
        const tmpl = content.templateMessage.hydratedTemplate || content.templateMessage.fourRowTemplate;
        if (tmpl) {
            const nativeButtons = (tmpl.hydratedButtons || [])
                .map((hBtn: any) => {
                    if (hBtn.quickReplyButton) {
                        return {
                            name: "quick_reply",
                            buttonParamsJson: JSON.stringify({
                                display_text: hBtn.quickReplyButton.displayText || "",
                                id: hBtn.quickReplyButton.id || hBtn.quickReplyButton.displayText || ""
                            })
                        };
                    } else if (hBtn.urlButton) {
                        return {
                            name: "cta_url",
                            buttonParamsJson: JSON.stringify({
                                display_text: hBtn.urlButton.displayText || "",
                                url: hBtn.urlButton.url || "",
                                merchant_url: hBtn.urlButton.url || ""
                            })
                        };
                    } else if (hBtn.callButton) {
                        return {
                            name: "cta_call",
                            buttonParamsJson: JSON.stringify({
                                display_text: hBtn.callButton.displayText || "",
                                phone_number: hBtn.callButton.phoneNumber || ""
                            })
                        };
                    }
                    return null;
                })
                .filter(Boolean);

            let header: any = undefined;
            if (tmpl.imageMessage) {
                header = { hasMediaAttachment: true, imageMessage: tmpl.imageMessage };
            } else if (tmpl.videoMessage) {
                header = { hasMediaAttachment: true, videoMessage: tmpl.videoMessage };
            } else if (tmpl.documentMessage) {
                header = { hasMediaAttachment: true, documentMessage: tmpl.documentMessage };
            } else if (tmpl.hydratedTitleText) {
                header = { title: tmpl.hydratedTitleText, hasMediaAttachment: false };
            }

            return {
                interactiveMessage: {
                    body: { text: tmpl.hydratedContentText || tmpl.contentText || "" },
                    footer: tmpl.hydratedFooterText ? { text: tmpl.hydratedFooterText } : undefined,
                    header: header,
                    nativeFlowMessage: {
                        buttons: nativeButtons,
                        messageParamsJson: "",
                        messageVersion: 1
                    },
                    contextInfo: tmpl.contextInfo
                }
            };
        }
    }

    return content;
}

/**
 * Builds an interactive message structure conforming to WhatsApp native flow protocols
 */
export async function buildInteractiveMessage(
    sock: WASocket,
    payload: any
): Promise<any> {
    const raw = payload?.interactiveMessage || payload || {};
    const {
        title,
        body,
        footer,
        header,
        thumbnail,
        image,
        video,
        document,
        fileName,
        mimetype,
        jpegThumbnail,
        contextInfo,
        externalAdReply,
        buttons = [],
        nativeFlowMessage
    } = raw;

    const bodyText = (typeof body === "object" ? body?.text : body) || title || "";
    const footerText = typeof footer === "object" ? footer?.text : footer;

    // 1. Prepare Header (media or text)
    let headerMedia: any = null;
    let headerText = typeof header === "string" ? header : (typeof header === "object" ? header?.title : "");

    const uploadFn = (sock as any).waUploadToServer;

    if (thumbnail) {
        headerMedia = await prepareWAMessageMedia(
            { image: { url: thumbnail } },
            { upload: uploadFn }
        );
    } else if (image) {
        headerMedia = await prepareWAMessageMedia(
            { image: image },
            { upload: uploadFn }
        );
    } else if (video) {
        headerMedia = await prepareWAMessageMedia(
            { video: video },
            { upload: uploadFn }
        );
    } else if (document) {
        const docPayload: any = { document };
        if (jpegThumbnail) docPayload.jpegThumbnail = jpegThumbnail;
        if (fileName) docPayload.fileName = fileName;
        if (mimetype) docPayload.mimetype = mimetype;

        headerMedia = await prepareWAMessageMedia(docPayload, { upload: uploadFn });
        if (fileName && headerMedia?.documentMessage) {
            headerMedia.documentMessage.fileName = fileName;
        }
        if (mimetype && headerMedia?.documentMessage) {
            headerMedia.documentMessage.mimetype = mimetype;
        }
    } else if (typeof header === "object" && header !== null) {
        const hMedia = header as InteractiveHeaderMedia;
        if (hMedia.image || hMedia.video || hMedia.document) {
            headerMedia = await prepareWAMessageMedia(hMedia as any, { upload: uploadFn });
        }
    }

    const interactiveHeader: any = headerMedia
        ? {
              title: headerText || "",
              hasMediaAttachment: true,
              subtitle: "",
              ...headerMedia
          }
        : headerText
        ? {
              title: headerText,
              hasMediaAttachment: false,
              subtitle: ""
          }
        : undefined;

    // 2. Prepare Native Flow Buttons
    const rawButtons = Array.isArray(buttons) && buttons.length > 0
        ? buttons
        : (nativeFlowMessage?.buttons || []);
    const formattedButtons = formatNativeButtons(rawButtons);
    const flowMessage = {
        buttons: formattedButtons,
        messageParamsJson: "",
        messageVersion: 1,
        ...(nativeFlowMessage || {})
    };

    // 3. Prepare Context Info
    let finalContextInfo: any = {};
    if (contextInfo) {
        finalContextInfo = { ...contextInfo };
    }
    if (externalAdReply) {
        finalContextInfo.externalAdReply = {
            title: externalAdReply.title || "",
            body: externalAdReply.body || "",
            mediaType: externalAdReply.mediaType || 1,
            thumbnailUrl: externalAdReply.thumbnailUrl || "",
            mediaUrl: externalAdReply.mediaUrl || "",
            sourceUrl: externalAdReply.sourceUrl || "",
            showAdAttribution: externalAdReply.showAdAttribution ?? false,
            renderLargerThumbnail: externalAdReply.renderLargerThumbnail ?? false,
            ...externalAdReply
        };
    }

    const interactiveMessage: any = {
        body: { text: bodyText },
        footer: footerText ? { text: footerText } : undefined,
        header: interactiveHeader,
        nativeFlowMessage: flowMessage
    };

    if (Object.keys(finalContextInfo).length > 0) {
        interactiveMessage.contextInfo = finalContextInfo;
    }

    return {
        interactiveMessage
    };
}

/**
 * Builds an Album Message (multiple images/videos) conforming to Lekzo Baileys format
 */
export async function sendAlbumMessage(
    sock: WASocket,
    jid: string,
    items: AlbumItem[],
    options: { quoted?: WAMessage; caption?: string } = {}
): Promise<WAMessage> {
    if (!Array.isArray(items) || items.length === 0) {
        throw new Error("Album items must be a non-empty array");
    }

    const uploadFn = (sock as any).waUploadToServer;
    const messageSecret = crypto.randomBytes(32);
    const expectedImageCount = items.filter(a => !!a.image).length;
    const expectedVideoCount = items.filter(a => !!a.video).length;

    // 1. Create and send album anchor message
    const albumAnchor = await generateWAMessageFromContent(
        jid,
        {
            messageContextInfo: {
                messageSecret: messageSecret
            },
            albumMessage: {
                expectedImageCount,
                expectedVideoCount
            }
        },
        {
            userJid: (sock as any).user?.id,
            quoted: options.quoted
        }
    );

    await sock.relayMessage(jid, albumAnchor.message!, {
        messageId: albumAnchor.key.id!
    });

    // 2. Generate and relay each media message associated with the anchor key
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        const itemCaption = item.caption || (i === 0 ? options.caption : undefined) || "";

        const mediaContent: any = {};
        if (item.image) mediaContent.image = item.image;
        else if (item.video) mediaContent.video = item.video;
        if (itemCaption) mediaContent.caption = itemCaption;

        const mediaMsg = await generateWAMessage(jid, mediaContent, {
            userJid: (sock as any).user?.id,
            upload: uploadFn
        });

        if (mediaMsg.message) {
            mediaMsg.message.messageContextInfo = {
                messageSecret: messageSecret,
                messageAssociation: {
                    associationType: 1,
                    parentMessageKey: albumAnchor.key
                }
            };

            await sock.relayMessage(jid, mediaMsg.message, {
                messageId: mediaMsg.key.id!
            });
        }
    }

    return albumAnchor;
}

/**
 * Builds and sends an Event Message (invitation)
 */
export async function sendEventMessage(
    sock: WASocket,
    jid: string,
    eventData: EventMessagePayload,
    options: { quoted?: WAMessage } = {}
): Promise<WAMessage> {
    const startTimeNum = Number(eventData.startTime);
    const endTimeNum = eventData.endTime ? Number(eventData.endTime) : undefined;

    const eventContent = {
        eventMessage: {
            isCanceled: eventData.isCanceled ?? false,
            name: eventData.name,
            description: eventData.description || "",
            location: eventData.location ? {
                degreesLatitude: eventData.location.degreesLatitude || 0,
                degreesLongitude: eventData.location.degreesLongitude || 0,
                name: eventData.location.name || ""
            } : undefined,
            joinLink: eventData.joinLink || "",
            startTime: startTimeNum,
            endTime: endTimeNum,
            extraGuestsAllowed: eventData.extraGuestsAllowed ?? false
        }
    };

    const msg = await generateWAMessageFromContent(jid, eventContent, {
        userJid: (sock as any).user?.id,
        quoted: options.quoted
    });

    await sock.relayMessage(jid, msg.message!, {
        messageId: msg.key.id!
    });

    return msg;
}

/**
 * Normalizes any phone number or JID into standard WhatsApp format
 */
export function normalizeTargetJid(jid: string): string {
    if (!jid) return jid;
    if (jid.endsWith("@g.us") || jid.endsWith("@newsletter")) {
        return jid;
    }
    const clean = jid.replace(/[^0-9]/g, "");
    if (jid.includes("@")) {
        return jidNormalizedUser(jid);
    }
    return `${clean}@s.whatsapp.net`;
}

/**
 * Builds binary nodes required by WhatsApp servers and clients
 * to render Native Flow interactive buttons natively.
 */
export function buildNativeFlowAdditionalNodes(targetJid: string, buttonName: string = "mixed"): any[] {
    const isGroup = targetJid.endsWith("@g.us");
    const isNewsletter = targetJid.endsWith("@newsletter");

    const nodes: any[] = [
        {
            tag: "biz",
            attrs: {
                actual_actors: "2",
                host_storage: "2",
                privacy_mode_ts: String(Math.floor(Date.now() / 1000))
            },
            content: [
                {
                    tag: "interactive",
                    attrs: {
                        type: "native_flow",
                        v: "1"
                    },
                    content: [
                        {
                            tag: "native_flow",
                            attrs: {
                                name: buttonName || "mixed",
                                v: "9"
                            }
                        }
                    ]
                },
                {
                    tag: "quality_control",
                    attrs: {
                        source_type: "third_party"
                    }
                }
            ]
        }
    ];

    // In direct 1-on-1 chats, WhatsApp expects the biz_bot attribute to recognize interactive bot messages
    if (!isGroup && !isNewsletter) {
        nodes.push({
            tag: "bot",
            attrs: {
                biz_bot: "1"
            }
        });
    }

    return nodes;
}

/**
 * Builds and sends a Product interactive message
 */
export async function sendProductMessage(
    sock: WASocket,
    jid: string,
    productData: any,
    options: { quoted?: WAMessage } = {}
): Promise<WAMessage> {
    const {
        title = "",
        description = "",
        thumbnail,
        productId,
        retailerId,
        url,
        body = "",
        footer = "",
        buttons = [],
        priceAmount1000 = null,
        currencyCode = "IDR"
    } = productData;

    let productImage: any = null;
    const uploadFn = (sock as any).waUploadToServer;

    if (thumbnail) {
        const thumbData = Buffer.isBuffer(thumbnail) ? thumbnail : { url: thumbnail };
        const media = await prepareWAMessageMedia({ image: thumbData }, { upload: uploadFn });
        productImage = media?.imageMessage;
    }

    const formattedButtons = formatNativeButtons(buttons);

    const productContent = {
        interactiveMessage: {
            body: { text: body },
            footer: footer ? { text: footer } : undefined,
            header: {
                title: title,
                hasMediaAttachment: false,
                productMessage: {
                    product: {
                        productImage: productImage || undefined,
                        productId: productId || "",
                        title: title,
                        description: description,
                        currencyCode: currencyCode,
                        priceAmount1000: priceAmount1000,
                        retailerId: retailerId || "",
                        url: url || "",
                        productImageCount: productImage ? 1 : 0
                    },
                    businessOwnerJid: (sock as any).user?.id ? jidNormalizedUser((sock as any).user.id) : "0@s.whatsapp.net"
                }
            },
            nativeFlowMessage: {
                buttons: formattedButtons,
                messageParamsJson: "",
                messageVersion: 1
            }
        }
    };

    const targetJid = normalizeTargetJid(jid);
    const userJid = (sock as any).user?.id ? jidNormalizedUser((sock as any).user.id) : undefined;
    const additionalNodes = buildNativeFlowAdditionalNodes(targetJid, "mixed");

    const msg = await generateWAMessageFromContent(targetJid, productContent, {
        ...(userJid ? { userJid } : {}),
        quoted: options.quoted
    } as any);

    await sock.relayMessage(targetJid, msg.message!, {
        messageId: msg.key.id!,
        additionalNodes
    });

    try {
        sock.ev.emit("messages.upsert", {
            messages: [msg],
            type: "append"
        });
    } catch (e) {
        logger.warn(`Failed to emit messages.upsert for product message: ${e}`);
    }

    return msg;
}

/**
 * Universal interactive message dispatcher.
 * Handles interactiveMessage, albumMessage, eventMessage, productMessage, or legacy buttons/list.
 */
export async function handleInteractiveMessageDispatch(
    sock: WASocket,
    jid: string,
    content: any,
    options: any = {}
): Promise<any> {
    // 1. Check if legacy and convert to interactive
    const converted = convertLegacyToInteractive(content);

    // 2. Handle interactiveMessage
    if (converted.interactiveMessage) {
        const interactivePayload = converted.interactiveMessage;
        const fullInteractive = await buildInteractiveMessage(sock, interactivePayload);
        const targetJid = normalizeTargetJid(jid);
        const userJid = (sock as any).user?.id ? jidNormalizedUser((sock as any).user.id) : undefined;

        const rawBtns = interactivePayload.buttons || interactivePayload.nativeFlowMessage?.buttons || [];
        const buttonName = (rawBtns.length === 1 && rawBtns[0]?.name) ? rawBtns[0].name : "mixed";
        const additionalNodes = buildNativeFlowAdditionalNodes(targetJid, buttonName);

        const msg = await generateWAMessageFromContent(targetJid, fullInteractive, {
            ...(userJid ? { userJid } : {}),
            quoted: options.quoted
        } as any);

        await sock.relayMessage(targetJid, msg.message!, {
            messageId: msg.key.id!,
            additionalNodes
        });

        // Emit messages.upsert to ensure DB store saves the message and web dashboard updates real-time
        try {
            sock.ev.emit("messages.upsert", {
                messages: [msg],
                type: "append"
            });
        } catch (e) {
            logger.warn(`Failed to emit messages.upsert for interactive message: ${e}`);
        }

        return msg;
    }

    // 3. Handle albumMessage
    if (content.albumMessage) {
        const items: AlbumItem[] = Array.isArray(content.albumMessage)
            ? content.albumMessage
            : content.albumMessage.items || [];
        const msg = await sendAlbumMessage(sock, jid, items, options);
        try {
            sock.ev.emit("messages.upsert", {
                messages: [msg],
                type: "append"
            });
        } catch (e) {}
        return msg;
    }

    // 4. Handle eventMessage
    if (content.eventMessage) {
        const msg = await sendEventMessage(sock, jid, content.eventMessage, options);
        try {
            sock.ev.emit("messages.upsert", {
                messages: [msg],
                type: "append"
            });
        } catch (e) {}
        return msg;
    }

    // 5. Handle productMessage
    if (content.productMessage) {
        return await sendProductMessage(sock, jid, content.productMessage, options);
    }

    return null;
}
