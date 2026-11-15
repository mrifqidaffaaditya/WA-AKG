import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createTranslator } from "next-intl";
import { locales } from "../config";
import type en from "../messages/en.json";

type Messages = { [key: string]: string | Messages };

const messagesDir = path.join(__dirname, "..", "messages");

function load(locale: string): Messages {
    return JSON.parse(fs.readFileSync(path.join(messagesDir, `${locale}.json`), "utf8"));
}

function flatten(obj: Messages, prefix = ""): Record<string, string> {
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(obj)) {
        const full = prefix ? `${prefix}.${key}` : key;
        if (typeof value === "string") out[full] = value;
        else Object.assign(out, flatten(value, full));
    }
    return out;
}

// ICU argument names ({name}, {count, plural, ...}) and rich-text tags (<terms>)
function argumentsOf(message: string): string[] {
    const args = new Set<string>();
    for (const m of message.matchAll(/\{\s*([A-Za-z0-9_]+)\s*[,}]/g)) args.add(m[1]);
    for (const m of message.matchAll(/<([A-Za-z0-9_]+)>/g)) args.add(`<${m[1]}>`);
    return [...args].sort();
}

// Dummy values for every placeholder so each message can actually be rendered
function sampleValues(message: string) {
    const values: Record<string, unknown> = {};
    for (const arg of argumentsOf(message)) {
        if (arg.startsWith("<")) values[arg.slice(1, -1)] = (chunks: unknown) => chunks;
        else values[arg] = 3;
    }
    return values;
}

const reference = flatten(load("en"));

describe("message catalogs", () => {
    it("has exactly one catalog file per supported locale", () => {
        const files = fs.readdirSync(messagesDir).filter((f) => f.endsWith(".json")).map((f) => f.replace(/\.json$/, ""));
        assert.deepEqual(files.sort(), [...locales].sort());
    });

    for (const locale of locales) {
        describe(locale, () => {
            const messages = load(locale);
            const flat = flatten(messages);

            it("has the same keys as en.json", () => {
                const missing = Object.keys(reference).filter((k) => !(k in flat));
                const extra = Object.keys(flat).filter((k) => !(k in reference));
                assert.deepEqual({ missing, extra }, { missing: [], extra: [] });
            });

            it("has no empty messages", () => {
                const empty = Object.entries(flat).filter(([, v]) => v.trim() === "").map(([k]) => k);
                assert.deepEqual(empty, []);
            });

            it("uses the same placeholders and tags as en.json", () => {
                const mismatched = Object.keys(reference)
                    .filter((k) => k in flat)
                    .filter((k) => argumentsOf(flat[k]).join() !== argumentsOf(reference[k]).join())
                    .map((k) => `${k}: expected [${argumentsOf(reference[k])}] got [${argumentsOf(flat[k])}]`);
                assert.deepEqual(mismatched, []);
            });

            it("renders every message without ICU errors", () => {
                const errors: string[] = [];
                const t = createTranslator({
                    locale,
                    messages,
                    onError: (error) => errors.push(error.message),
                });
                for (const key of Object.keys(flat)) {
                    const values = sampleValues(flat[key]);
                    // @ts-expect-error -- keys are built dynamically from the catalog
                    const out = key.includes("terms") ? t.rich(key, values) : t(key, values);
                    assert.ok(out, `${key} rendered empty`);
                }
                assert.deepEqual(errors, []);
            });
        });
    }
});

describe("plural messages", () => {
    it("formats unread notification counts per locale", () => {
        const expected: Record<string, [number, string][]> = {
            en: [[0, "No new notifications."], [1, "You have 1 unread update."], [5, "You have 5 unread updates."]],
            id: [[0, "Tidak ada notifikasi baru."], [5, "Anda memiliki 5 pembaruan yang belum dibaca."]],
            "pt-BR": [[0, "Nenhuma notificação nova."], [1, "Você tem 1 atualização não lida."], [5, "Você tem 5 atualizações não lidas."]],
        };
        for (const locale of locales) {
            const t = createTranslator({ locale, messages: load(locale) as typeof en, namespace: "notifications" });
            for (const [count, text] of expected[locale]) {
                assert.equal(t("unreadSummary", { count }), text);
            }
        }
    });
});
