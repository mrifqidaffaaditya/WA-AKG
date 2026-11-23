import test from "node:test";
import assert from "node:assert/strict";
import { sanitizePhoneToJid } from "@/lib/jid-utils";
import { buildNativeFlowAdditionalNodes } from "@/modules/whatsapp/interactive";

test("sanitizePhoneToJid correctly sanitizes phone numbers and JIDs (Issue #90)", () => {
    // Numbers with leading +
    assert.equal(sanitizePhoneToJid("+628123456789"), "628123456789@s.whatsapp.net");
    assert.equal(sanitizePhoneToJid(" +62 812-3456-7890 "), "6281234567890@s.whatsapp.net");

    // Indonesian 08xx prefix conversion
    assert.equal(sanitizePhoneToJid("08123456789"), "628123456789@s.whatsapp.net");

    // Standard raw digits
    assert.equal(sanitizePhoneToJid("628123456789"), "628123456789@s.whatsapp.net");

    // Already formatted JIDs with unwanted symbols in user part
    assert.equal(sanitizePhoneToJid("+628123456789@s.whatsapp.net"), "628123456789@s.whatsapp.net");
    assert.equal(sanitizePhoneToJid("628123456789@s.whatsapp.net"), "628123456789@s.whatsapp.net");

    // Groups & newsletters preserved
    assert.equal(sanitizePhoneToJid("123456789-987654@g.us"), "123456789-987654@g.us");
    assert.equal(sanitizePhoneToJid("1234567890@newsletter"), "1234567890@newsletter");

    // Invalid / empty inputs
    assert.equal(sanitizePhoneToJid(""), null);
    assert.equal(sanitizePhoneToJid("   "), null);
    assert.equal(sanitizePhoneToJid("++--"), null);
    assert.equal(sanitizePhoneToJid("@s.whatsapp.net"), null);
});

test("buildNativeFlowAdditionalNodes does not output bot node for direct chats (Issue #112)", () => {
    const directNodes = buildNativeFlowAdditionalNodes("628123456789@s.whatsapp.net", "cta_copy");
    const hasBotNodeInDirect = directNodes.some(n => n.tag === "bot");
    assert.equal(hasBotNodeInDirect, false, "Direct chat must not contain <bot> node");

    const groupNodes = buildNativeFlowAdditionalNodes("123456789@g.us", "mixed");
    const hasBotNodeInGroup = groupNodes.some(n => n.tag === "bot");
    assert.equal(hasBotNodeInGroup, false, "Group chat must not contain <bot> node");
});

test("broadcastSchema supports media, document, audio, and interactive chat formats", async () => {
    const { broadcastSchema, broadcastTemplateSchema } = await import("@/lib/validations");

    // Standard text broadcast
    const textRes = broadcastSchema.safeParse({
        recipients: ["628123456789@s.whatsapp.net"],
        type: "text",
        message: "Hello world"
    });
    assert.equal(textRes.success, true);
    if (textRes.success) {
        assert.equal(textRes.data.type, "text");
        assert.equal(textRes.data.message, "Hello world");
    }

    // Image broadcast with caption and mediaUrl
    const imageRes = broadcastSchema.safeParse({
        recipients: ["628123456789@s.whatsapp.net"],
        type: "image",
        mediaUrl: "https://example.com/banner.jpg",
        message: "Look at this promo!"
    });
    assert.equal(imageRes.success, true);
    if (imageRes.success) {
        assert.equal(imageRes.data.type, "image");
        assert.equal(imageRes.data.mediaUrl, "https://example.com/banner.jpg");
    }

    // Document broadcast with fileName
    const docRes = broadcastSchema.safeParse({
        recipients: ["628123456789@s.whatsapp.net"],
        type: "document",
        mediaUrl: "https://example.com/report.pdf",
        fileName: "Q4_Report.pdf",
        message: "Quarterly Financial Report"
    });
    assert.equal(docRes.success, true);
    if (docRes.success) {
        assert.equal(docRes.data.type, "document");
        assert.equal(docRes.data.fileName, "Q4_Report.pdf");
    }

    // Audio broadcast with PTT flag
    const audioRes = broadcastSchema.safeParse({
        recipients: ["628123456789@s.whatsapp.net"],
        type: "audio",
        mediaUrl: "https://example.com/voice.ogg",
        ptt: true
    });
    assert.equal(audioRes.success, true);
    if (audioRes.success) {
        assert.equal(audioRes.data.type, "audio");
        assert.equal(audioRes.data.ptt, true);
    }

    // Interactive message broadcast with buttons
    const interactiveRes = broadcastSchema.safeParse({
        recipients: ["628123456789@s.whatsapp.net"],
        type: "interactive",
        message: "Main interactive body",
        interactiveData: {
            title: "Header Title",
            body: "Main interactive body",
            footer: "Footer notes",
            buttons: [
                { type: "quick_reply", displayText: "Ya, Setuju", id: "btn_agree" },
                { type: "cta_url", displayText: "Kunjungi Web", url: "https://google.com" }
            ]
        }
    });
    assert.equal(interactiveRes.success, true);
    if (interactiveRes.success) {
        assert.equal(interactiveRes.data.type, "interactive");
        assert.equal(interactiveRes.data.interactiveData?.buttons?.length, 2);
    }

    // Broadcast template schema
    const tmplRes = broadcastTemplateSchema.safeParse({
        name: "Promo Ramadhan 2026",
        type: "interactive",
        message: "Dapatkan diskon menarik!",
        interactiveData: {
            title: "Promo Ramadhan",
            buttons: [{ type: "quick_reply", displayText: "Klaim Voucher", id: "claim" }]
        }
    });
    assert.equal(tmplRes.success, true);
    if (tmplRes.success) {
        assert.equal(tmplRes.data.name, "Promo Ramadhan 2026");
        assert.equal(tmplRes.data.type, "interactive");
    }
});
