import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
    generateBroadcastCsvTemplate,
    parseBroadcastRecipients,
    normalizePhoneNumber,
    detectDelimiter
} from "../broadcast-import";

describe("Broadcast Import & CSV Template Utilities", () => {
    it("should generate a clean readable CSV template with UTF-8 BOM", () => {
        const template = generateBroadcastCsvTemplate();
        assert.ok(template.startsWith("\uFEFF"), "Should start with UTF-8 BOM");
        assert.ok(template.includes("nomor,nama,catatan"), "Should include header row");
        assert.ok(template.includes("6281234567890"), "Should include sample phone number");
        assert.ok(template.includes("Budi Santoso"), "Should include sample name");
    });

    it("should detect delimiters correctly", () => {
        assert.equal(detectDelimiter("nomor,nama,catatan\n1,2,3"), ",");
        assert.equal(detectDelimiter("nomor;nama;catatan\n1;2;3"), ";");
        assert.equal(detectDelimiter("nomor\tnama\tcatatan\n1\t2\t3"), "\t");
        assert.equal(detectDelimiter("nomor|nama|catatan\n1|2|3"), "|");
    });

    it("should normalize Indonesian phone numbers", () => {
        assert.equal(normalizePhoneNumber("08123456789").normalized, "628123456789@s.whatsapp.net");
        assert.equal(normalizePhoneNumber("+62 812-3456-789").normalized, "628123456789@s.whatsapp.net");
        assert.equal(normalizePhoneNumber("628123456789@s.whatsapp.net").normalized, "628123456789@s.whatsapp.net");
        assert.equal(normalizePhoneNumber("120363023456789@g.us").normalized, "120363023456789@g.us");
    });

    it("should parse standard comma-separated CSV with headers", () => {
        const csv = `nomor,nama,catatan
6281234567890,Budi Santoso,VIP
085712345678,Ahmad,Normal
6281234567890,Budi Santoso Duplicate,VIP
invalid_phone,Test,Error`;

        const result = parseBroadcastRecipients(csv);
        assert.equal(result.stats.totalRows, 4);
        assert.equal(result.stats.validCount, 2);
        assert.equal(result.stats.duplicateCount, 1);
        assert.equal(result.stats.invalidCount, 1);
        assert.equal(result.validPhones.length, 2);
        assert.equal(result.validPhones[0], "6281234567890@s.whatsapp.net");
        assert.equal(result.validPhones[1], "6285712345678@s.whatsapp.net");
    });

    it("should parse semicolon-separated CSV (Indonesian/European Excel export)", () => {
        const csv = `nomor;nama;catatan
628111111111;Siti;Member
082222222222;Dewi;Customer`;

        const result = parseBroadcastRecipients(csv);
        assert.equal(result.stats.validCount, 2);
        assert.equal(result.validPhones[0], "628111111111@s.whatsapp.net");
        assert.equal(result.validPhones[1], "6282222222222@s.whatsapp.net");
    });

    it("should parse raw phone list without header", () => {
        const raw = `08123456789
08987654321
08555555555`;

        const result = parseBroadcastRecipients(raw);
        assert.equal(result.stats.validCount, 3);
        assert.equal(result.validPhones.length, 3);
    });
});
