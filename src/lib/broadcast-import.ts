/**
 * Broadcast Contact Import & CSV Template Utilities
 */

export interface ParsedBroadcastRecipient {
    raw: string;
    phone: string | null;
    name: string | null;
    notes: string | null;
    isValid: boolean;
    isDuplicate: boolean;
    error?: string;
}

export interface BroadcastParseResult {
    items: ParsedBroadcastRecipient[];
    validPhones: string[];
    stats: {
        totalRows: number;
        validCount: number;
        duplicateCount: number;
        invalidCount: number;
    };
    detectedDelimiter: string;
}

export interface ParseOptions {
    autoFormatIndo?: boolean; // Default true: 08xxx -> 628xxx
    removeDuplicates?: boolean; // Default true
}

export const SAMPLE_BROADCAST_TEMPLATE_ROWS = [
    { nomor: "6281234567890", nama: "Budi Santoso", catatan: "Pelanggan Prioritas" },
    { nomor: "6289876543210", nama: "Siti Aminah", catatan: "Pesanan Grosir #1024" },
    { nomor: "085712345678", nama: "Ahmad Fauzi", catatan: "Follow-up Penawaran" },
    { nomor: "628198765432", nama: "Dewi Lestari", catatan: "Member VIP" }
];

/**
 * Generates a clean, readable CSV template string with UTF-8 BOM.
 * BOM ensures Excel on Windows/Mac properly parses characters and columns.
 */
export function generateBroadcastCsvTemplate(): string {
    const header = "nomor,nama,catatan";
    const rows = SAMPLE_BROADCAST_TEMPLATE_ROWS.map(
        row => `${row.nomor},"${row.nama}","${row.catatan}"`
    );
    // Prepend UTF-8 BOM (\uFEFF) for Microsoft Excel compatibility
    return "\uFEFF" + [header, ...rows].join("\r\n");
}

/**
 * Detect delimiter in CSV/table string: comma, semicolon, tab, pipe
 */
export function detectDelimiter(text: string): string {
    const firstLine = text.split(/\r?\n/)[0] || "";
    const counts: Record<string, number> = {
        ",": (firstLine.match(/,/g) || []).length,
        ";": (firstLine.match(/;/g) || []).length,
        "\t": (firstLine.match(/\t/g) || []).length,
        "|": (firstLine.match(/\|/g) || []).length
    };
    let best = ",";
    let max = 0;
    for (const [delim, count] of Object.entries(counts)) {
        if (count > max) {
            max = count;
            best = delim;
        }
    }
    return best;
}

/**
 * Split a CSV line respecting quoted values
 */
export function splitCsvLine(line: string, delimiter: string): string[] {
    const result: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                current += '"';
                i++; // Skip escaped quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === delimiter && !inQuotes) {
            result.push(current.trim());
            current = "";
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}

/**
 * Clean and normalize a phone number string for WhatsApp
 */
export function normalizePhoneNumber(
    phoneRaw: string,
    autoFormatIndo: boolean = true
): { normalized: string | null; error?: string } {
    let clean = phoneRaw.trim();
    if (!clean) return { normalized: null, error: "Empty phone number" };

    // Group or newsletter JID
    if (clean.endsWith("@g.us") || clean.endsWith("@newsletter")) {
        return { normalized: clean };
    }

    // Existing full JID format like 628123@s.whatsapp.net
    if (clean.includes("@s.whatsapp.net")) {
        const digits = clean.split("@")[0].replace(/\D/g, "");
        if (digits.length >= 7 && digits.length <= 16) {
            return { normalized: `${digits}@s.whatsapp.net` };
        }
        return { normalized: null, error: "Invalid JID digits" };
    }

    // Strip +, spaces, dashes, parentheses
    clean = clean.replace(/[\s\-\+\(\)\.]/g, "");

    // Must be purely digits
    if (!/^\d+$/.test(clean)) {
        return { normalized: null, error: "Contains non-numeric characters" };
    }

    // Indonesian 08xx -> 628xx
    if (autoFormatIndo && clean.startsWith("08")) {
        clean = "628" + clean.substring(2);
    } else if (autoFormatIndo && clean.startsWith("0")) {
        clean = "62" + clean.substring(1);
    }

    // Validate international number length (usually 8 to 15 digits according to E.164)
    if (clean.length < 7 || clean.length > 16) {
        return { normalized: null, error: "Number length must be 7-16 digits" };
    }

    return { normalized: `${clean}@s.whatsapp.net` };
}

/**
 * Parse broadcast contacts from CSV or text input
 */
export function parseBroadcastRecipients(
    rawInput: string,
    options: ParseOptions = {}
): BroadcastParseResult {
    const { autoFormatIndo = true, removeDuplicates = true } = options;

    // Strip BOM if present
    const cleanInput = rawInput.replace(/^\uFEFF/, "").trim();
    if (!cleanInput) {
        return {
            items: [],
            validPhones: [],
            stats: { totalRows: 0, validCount: 0, duplicateCount: 0, invalidCount: 0 },
            detectedDelimiter: ","
        };
    }

    const lines = cleanInput.split(/\r?\n/).filter(line => line.trim().length > 0);
    const delimiter = detectDelimiter(cleanInput);

    let phoneColIdx = 0;
    let nameColIdx = -1;
    let notesColIdx = -1;
    let startIndex = 0;

    // Check if line 0 is a header row
    const firstCols = splitCsvLine(lines[0], delimiter).map(c => c.toLowerCase().replace(/[^a-z0-9]/g, ""));
    const phoneHeaderCandidates = ["nomor", "phone", "telepon", "telp", "hp", "whatsapp", "wa", "jid", "number", "target"];
    const nameHeaderCandidates = ["nama", "name", "kontak", "contact", "customer", "pelanggan"];
    const notesHeaderCandidates = ["catatan", "catat", "note", "notes", "keterangan", "ket", "label", "tag"];

    let hasHeader = false;
    firstCols.forEach((col, idx) => {
        if (phoneHeaderCandidates.includes(col)) {
            phoneColIdx = idx;
            hasHeader = true;
        } else if (nameHeaderCandidates.includes(col)) {
            nameColIdx = idx;
            hasHeader = true;
        } else if (notesHeaderCandidates.includes(col)) {
            notesColIdx = idx;
            hasHeader = true;
        }
    });

    if (hasHeader) {
        startIndex = 1;
    } else {
        // If no named header, find which column looks like a phone number in line 0
        const sampleRow = splitCsvLine(lines[0], delimiter);
        sampleRow.forEach((col, idx) => {
            const digits = col.replace(/\D/g, "");
            if (digits.length >= 7 && digits.length <= 15) {
                phoneColIdx = idx;
            }
        });
        if (sampleRow.length >= 2 && phoneColIdx === 0) nameColIdx = 1;
        if (sampleRow.length >= 3) notesColIdx = 2;
    }

    const items: ParsedBroadcastRecipient[] = [];
    const seenPhones = new Set<string>();
    const validPhones: string[] = [];

    let duplicateCount = 0;
    let invalidCount = 0;
    let validCount = 0;

    for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const cols = splitCsvLine(line, delimiter);
        const rawPhone = (cols[phoneColIdx] || "").trim();
        const rawName = nameColIdx !== -1 && cols[nameColIdx] ? cols[nameColIdx].trim() : null;
        const rawNotes = notesColIdx !== -1 && cols[notesColIdx] ? cols[notesColIdx].trim() : null;

        const { normalized, error } = normalizePhoneNumber(rawPhone, autoFormatIndo);

        if (!normalized) {
            invalidCount++;
            items.push({
                raw: line,
                phone: rawPhone || null,
                name: rawName,
                notes: rawNotes,
                isValid: false,
                isDuplicate: false,
                error: error || "Invalid number"
            });
            continue;
        }

        const isDuplicate = seenPhones.has(normalized);
        if (isDuplicate) {
            duplicateCount++;
            items.push({
                raw: line,
                phone: normalized,
                name: rawName,
                notes: rawNotes,
                isValid: true,
                isDuplicate: true,
                error: "Duplicate number"
            });
            if (!removeDuplicates) {
                validPhones.push(normalized);
            }
        } else {
            seenPhones.add(normalized);
            validCount++;
            validPhones.push(normalized);
            items.push({
                raw: line,
                phone: normalized,
                name: rawName,
                notes: rawNotes,
                isValid: true,
                isDuplicate: false
            });
        }
    }

    return {
        items,
        validPhones,
        stats: {
            totalRows: lines.length - startIndex,
            validCount,
            duplicateCount,
            invalidCount
        },
        detectedDelimiter: delimiter
    };
}
