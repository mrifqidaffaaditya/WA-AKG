import test from "node:test";
import assert from "node:assert/strict";
import { isPrivateOrReservedIp, validateSafeUrl, materializeSafeMediaPayload } from "../security";

test("isPrivateOrReservedIp correctly identifies unsafe IPs", () => {
    // Unsafe IPv4
    assert.strictEqual(isPrivateOrReservedIp("127.0.0.1"), true, "Loopback must be unsafe");
    assert.strictEqual(isPrivateOrReservedIp("10.0.0.5"), true, "10.0.0.0/8 must be unsafe");
    assert.strictEqual(isPrivateOrReservedIp("172.16.0.1"), true, "172.16.0.0/12 must be unsafe");
    assert.strictEqual(isPrivateOrReservedIp("172.31.255.255"), true, "172.31.255.255 must be unsafe");
    assert.strictEqual(isPrivateOrReservedIp("192.168.1.1"), true, "192.168.0.0/16 must be unsafe");
    assert.strictEqual(isPrivateOrReservedIp("169.254.169.254"), true, "Cloud metadata 169.254 must be unsafe");
    assert.strictEqual(isPrivateOrReservedIp("100.64.0.1"), true, "CGNAT 100.64 must be unsafe");
    assert.strictEqual(isPrivateOrReservedIp("100.127.255.255"), true, "CGNAT 100.127 must be unsafe");
    assert.strictEqual(isPrivateOrReservedIp("0.0.0.0"), true, "0.0.0.0 must be unsafe");
    assert.strictEqual(isPrivateOrReservedIp("255.255.255.255"), true, "Broadcast must be unsafe");

    // Unsafe IPv6
    assert.strictEqual(isPrivateOrReservedIp("::1"), true, "IPv6 loopback must be unsafe");
    assert.strictEqual(isPrivateOrReservedIp("::"), true, "IPv6 unspecified must be unsafe");
    assert.strictEqual(isPrivateOrReservedIp("fe80::1"), true, "IPv6 link-local must be unsafe");
    assert.strictEqual(isPrivateOrReservedIp("fc00::1"), true, "IPv6 unique local must be unsafe");
    assert.strictEqual(isPrivateOrReservedIp("fd12:3456::1"), true, "IPv6 unique local (fd) must be unsafe");
    assert.strictEqual(isPrivateOrReservedIp("::ffff:127.0.0.1"), true, "IPv4-mapped loopback must be unsafe");

    // Safe Public IPs
    assert.strictEqual(isPrivateOrReservedIp("8.8.8.8"), false, "Google DNS must be safe");
    assert.strictEqual(isPrivateOrReservedIp("1.1.1.1"), false, "Cloudflare DNS must be safe");
    assert.strictEqual(isPrivateOrReservedIp("93.184.216.34"), false, "example.com IP must be safe");
});

test("validateSafeUrl blocks SSRF and invalid protocols", async () => {
    // Malformed & local file paths
    const local1 = await validateSafeUrl("/app/.env");
    assert.strictEqual(local1.valid, false);

    const local2 = await validateSafeUrl("./.env");
    assert.strictEqual(local2.valid, false);

    const fileScheme = await validateSafeUrl("file:///app/.env");
    assert.strictEqual(fileScheme.valid, false);

    // Localhost & private IPs
    const localhost = await validateSafeUrl("http://localhost:3000", { allowHttp: true });
    assert.strictEqual(localhost.valid, false);

    const loopback = await validateSafeUrl("http://127.0.0.1:3000", { allowHttp: true });
    assert.strictEqual(loopback.valid, false);

    const metadata = await validateSafeUrl("http://169.254.169.254/latest/meta-data/", { allowHttp: true });
    assert.strictEqual(metadata.valid, false);

    // Default requires HTTPS
    const httpDefault = await validateSafeUrl("http://example.com/test.jpg");
    assert.strictEqual(httpDefault.valid, false, "Should require HTTPS by default");
});

test("materializeSafeMediaPayload blocks local file access", async () => {
    // Attempt to leak /app/.env via document
    await assert.rejects(
        async () => {
            await materializeSafeMediaPayload({
                document: { url: "/app/.env" },
                mimetype: "text/plain",
                fileName: "loot.txt"
            });
        },
        /SSRF Prevention|Malformed URL|Failed to process document media/,
        "Must reject local file path in document"
    );

    // Attempt to leak via image
    await assert.rejects(
        async () => {
            await materializeSafeMediaPayload({
                image: { url: "./.env" }
            });
        },
        /SSRF Prevention|Malformed URL|Failed to process image media/,
        "Must reject local file path in image"
    );

    // Attempt stream injection
    await assert.rejects(
        async () => {
            await materializeSafeMediaPayload({
                document: { stream: {} }
            });
        },
        /Stream uploads are not permitted/,
        "Must reject stream payload"
    );

    // Attempt to leak via thumbnail
    await assert.rejects(
        async () => {
            await materializeSafeMediaPayload({
                thumbnail: "/app/.env"
            });
        },
        /SSRF Prevention|Malformed URL|Failed to process thumbnail media/,
        "Must reject local file path in thumbnail"
    );

    // Attempt to leak via header media
    await assert.rejects(
        async () => {
            await materializeSafeMediaPayload({
                header: {
                    image: { url: "/app/.env" }
                }
            });
        },
        /SSRF Prevention|Malformed URL|Failed to process image media/,
        "Must reject local file path in header media"
    );

    // Attempt to leak via album items
    await assert.rejects(
        async () => {
            const items = [{ image: { url: "/app/.env" } }];
            await Promise.all(items.map(item => materializeSafeMediaPayload(item)));
        },
        /SSRF Prevention|Malformed URL|Failed to process image media/,
        "Must reject local file path in album items"
    );
});
