import crypto from "crypto";
import { logger } from "./logger";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // Standard 96-bit IV for GCM
const PREFIX = "enc:v1:";

/**
 * Derives a 32-byte encryption key from environment secrets.
 */
function getDerivedKey(): Buffer {
    const secret = process.env.ENCRYPTION_KEY || process.env.AUTH_SECRET;
    if (!secret) {
        throw new Error("ENCRYPTION_KEY or AUTH_SECRET must be defined in environment variables");
    }
    return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypts a plaintext string using AES-256-GCM.
 * Output format: enc:v1:<iv_hex>:<tag_hex>:<ciphertext_hex>
 */
export function encryptData(plaintext: string): string {
    if (!plaintext) return plaintext;

    const key = getDerivedKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, "utf8", "hex");
    encrypted += cipher.final("hex");
    const tag = cipher.getAuthTag().toString("hex");

    return `${PREFIX}${iv.toString("hex")}:${tag}:${encrypted}`;
}

/**
 * Decrypts a ciphertext string produced by encryptData.
 * If the data does not start with the prefix, it is returned as-is (backward compatibility for unencrypted data).
 */
export function decryptData(data: string): string {
    if (!data || typeof data !== "string") return data;

    // Backward compatibility: If not encrypted, return as-is
    if (!data.startsWith(PREFIX)) {
        return data;
    }

    try {
        const key = getDerivedKey();
        const raw = data.substring(PREFIX.length);
        const parts = raw.split(":");
        if (parts.length !== 3) {
            throw new Error("Invalid encrypted payload structure");
        }

        const [ivHex, tagHex, encryptedHex] = parts;
        const iv = Buffer.from(ivHex, "hex");
        const tag = Buffer.from(tagHex, "hex");

        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(tag);

        let decrypted = decipher.update(encryptedHex, "hex", "utf8");
        decrypted += decipher.final("utf8");

        return decrypted;
    } catch (err: any) {
        logger.error("Crypto", "Decryption failed:", err.message);
        throw new Error("Failed to decrypt data payload");
    }
}
