import dns from "dns";
import net from "net";
import { logger } from "./logger";

/**
 * Checks if an IPv4 or IPv6 address is private, loopback, link-local, or reserved.
 */
export function isPrivateOrReservedIp(ip: string): boolean {
    // Handle IPv4-mapped IPv6 (e.g. ::ffff:127.0.0.1)
    if (ip.startsWith("::ffff:")) {
        ip = ip.substring(7);
    }

    if (net.isIPv4(ip)) {
        const parts = ip.split(".").map(Number);
        if (parts.length !== 4 || parts.some(p => isNaN(p) || p < 0 || p > 255)) {
            return true; // Invalid IPv4, treat as unsafe
        }

        const [b0, b1] = parts;

        // 0.0.0.0/8 (Current network)
        if (b0 === 0) return true;
        // 10.0.0.0/8 (Private)
        if (b0 === 10) return true;
        // 127.0.0.0/8 (Loopback)
        if (b0 === 127) return true;
        // 169.254.0.0/16 (Link-local / Cloud Metadata: AWS, GCP, Azure, DO, etc.)
        if (b0 === 169 && b1 === 254) return true;
        // 172.16.0.0/12 (Private)
        if (b0 === 172 && b1 >= 16 && b1 <= 31) return true;
        // 192.168.0.0/16 (Private)
        if (b0 === 192 && b1 === 168) return true;
        // 224.0.0.0/4 (Multicast) & 240.0.0.0/4 (Reserved)
        if (b0 >= 224) return true;
        // Broadcast
        if (ip === "255.255.255.255") return true;

        return false;
    }

    if (net.isIPv6(ip)) {
        const lower = ip.toLowerCase();
        // ::1 (Loopback)
        if (lower === "::1" || lower === "0:0:0:0:0:0:0:1") return true;
        // :: (Unspecified)
        if (lower === "::" || lower === "0:0:0:0:0:0:0:0") return true;
        // fe80::/10 (Link-local)
        if (lower.startsWith("fe8") || lower.startsWith("fe9") || lower.startsWith("fea") || lower.startsWith("feb")) return true;
        // fc00::/7 (Unique local private)
        if (lower.startsWith("fc") || lower.startsWith("fd")) return true;

        return false;
    }

    return true; // Unknown address format, treat as unsafe
}

export interface ValidateUrlOptions {
    allowHttp?: boolean;
    allowedHostnames?: string[];
}

/**
 * Validates that a URL is well-formed, uses allowed protocols,
 * and does NOT resolve to internal / private / loopback IP addresses (anti-SSRF).
 */
export async function validateSafeUrl(
    urlStr: string,
    options: ValidateUrlOptions = {}
): Promise<{ valid: boolean; error?: string; url?: URL; resolvedIps?: string[] }> {
    if (!urlStr || typeof urlStr !== "string") {
        return { valid: false, error: "URL must be a non-empty string" };
    }

    let parsed: URL;
    try {
        parsed = new URL(urlStr);
    } catch {
        return { valid: false, error: "Malformed URL" };
    }

    const allowedProtocols = options.allowHttp ? ["https:", "http:"] : ["https:"];
    if (!allowedProtocols.includes(parsed.protocol)) {
        return { valid: false, error: `Protocol '${parsed.protocol}' is not allowed. Only HTTPS is supported.` };
    }

    const hostname = parsed.hostname;
    if (!hostname) {
        return { valid: false, error: "URL missing valid hostname" };
    }

    // Check specific hostnames whitelist if requested
    if (options.allowedHostnames && options.allowedHostnames.length > 0) {
        const matches = options.allowedHostnames.some(allowed => 
            hostname === allowed || hostname.endsWith(`.${allowed}`)
        );
        if (!matches) {
            return { valid: false, error: `Hostname '${hostname}' is not in the allowed domains list` };
        }
    }

    // Direct IP address in hostname
    if (net.isIP(hostname)) {
        if (isPrivateOrReservedIp(hostname)) {
            return { valid: false, error: `Access to private or local IP address (${hostname}) is forbidden` };
        }
        return { valid: true, url: parsed, resolvedIps: [hostname] };
    }

    // Reject localhost explicitly
    if (hostname.toLowerCase() === "localhost" || hostname.toLowerCase().endsWith(".localhost")) {
        return { valid: false, error: "Access to localhost is forbidden" };
    }

    // Resolve DNS and check every returned IP
    try {
        const lookupResults = await dns.promises.lookup(hostname, { all: true });
        if (!lookupResults || lookupResults.length === 0) {
            return { valid: false, error: `Unable to resolve hostname '${hostname}'` };
        }

        const resolvedIps = lookupResults.map(r => r.address);
        for (const res of lookupResults) {
            if (isPrivateOrReservedIp(res.address)) {
                return { valid: false, error: `Hostname resolves to private or internal IP address (${res.address})` };
            }
        }

        return { valid: true, url: parsed, resolvedIps };
    } catch (err: any) {
        return { valid: false, error: `DNS lookup failed for '${hostname}': ${err.message}` };
    }
}

export interface SafeFetchOptions {
    maxBytes?: number;
    timeoutMs?: number;
    allowHttp?: boolean;
    allowedHostnames?: string[];
}

const DEFAULT_MAX_BYTES = 16 * 1024 * 1024; // 16 MB
const DEFAULT_TIMEOUT_MS = 10000; // 10s

/**
 * Safely fetches a remote file with SSRF protection, size limits, and timeout.
 */
export async function safeFetchBuffer(
    urlStr: string,
    options: SafeFetchOptions = {}
): Promise<{ buffer: Buffer; contentType: string; fileName?: string }> {
    const maxBytes = options.maxBytes ?? DEFAULT_MAX_BYTES;
    const timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;

    let currentUrl = urlStr;
    const maxRedirects = 3;

    for (let redirectCount = 0; redirectCount <= maxRedirects; redirectCount++) {
        const val = await validateSafeUrl(currentUrl, {
            allowHttp: options.allowHttp,
            allowedHostnames: options.allowedHostnames
        });

        if (!val.valid || !val.url) {
            throw new Error(`SSRF Prevention: ${val.error}`);
        }

        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);

        let response: Response;
        try {
            response = await fetch(val.url.toString(), {
                method: "GET",
                signal: controller.signal,
                redirect: "manual" // Handle redirects manually to validate destination IP at each hop
            });
        } catch (err: any) {
            clearTimeout(timer);
            throw new Error(`Network fetch failed for '${currentUrl}': ${err.message}`);
        } finally {
            clearTimeout(timer);
        }

        // Handle redirects
        if (response.status >= 300 && response.status < 400) {
            const location = response.headers.get("location");
            if (!location) {
                throw new Error(`Redirect response (${response.status}) missing Location header`);
            }
            // Resolve relative redirect
            currentUrl = new URL(location, val.url).toString();
            continue;
        }

        if (!response.ok) {
            throw new Error(`Remote server responded with HTTP ${response.status} ${response.statusText}`);
        }

        // Check Content-Length header if present
        const contentLength = response.headers.get("content-length");
        if (contentLength && parseInt(contentLength, 10) > maxBytes) {
            throw new Error(`File size (${contentLength} bytes) exceeds the maximum limit of ${maxBytes} bytes`);
        }

        // Stream body with byte counter
        if (!response.body) {
            throw new Error("Empty response body from remote server");
        }

        const reader = response.body.getReader();
        const chunks: Uint8Array[] = [];
        let receivedBytes = 0;

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) {
                receivedBytes += value.length;
                if (receivedBytes > maxBytes) {
                    reader.cancel();
                    throw new Error(`Download exceeded maximum permitted size of ${maxBytes} bytes`);
                }
                chunks.push(value);
            }
        }

        const buffer = Buffer.concat(chunks);
        const contentType = response.headers.get("content-type") || "application/octet-stream";
        const pathFileName = val.url.pathname.split("/").pop() || "media";

        return {
            buffer,
            contentType,
            fileName: pathFileName
        };
    }

    throw new Error(`Too many redirects (max ${maxRedirects})`);
}
