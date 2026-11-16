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
