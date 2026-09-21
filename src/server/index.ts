import { loadEnvConfig } from "@next/env";
// Load environment variables before any other imports/logic
loadEnvConfig(process.cwd());

import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server } from "socket.io";
import { setupSocket } from "./socket";
import { waManager } from "../modules/whatsapp/manager";
import { logger } from "../lib/logger";
import { runAutoMigration } from "../lib/auto-migrate";
import pkg from "../../package.json";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3030", 10);

const INSECURE_AUTH_SECRETS = [
  "change-me",
  "secret",
  "your-super-secret-key-at-least-32-chars-change-this-in-production",
  "your-secret-here",
  "YOUR_AUTH_SECRET_HERE",
  "changethis",
  "default_secret"
];

if (!process.env.AUTH_SECRET || INSECURE_AUTH_SECRETS.includes(process.env.AUTH_SECRET)) {
  if (!dev) {
    logger.error("Server", "FATAL: AUTH_SECRET is unset or using an insecure placeholder! Please generate a strong secret with: openssl rand -base64 32");
    process.exit(1);
  } else {
    logger.warn("Server", "WARNING: AUTH_SECRET is unset or using a default placeholder. Please update it before deploying to production!");
  }
}

// On NTFS filesystems (e.g. /media/... partitions), Turbopack dev chunk naming containing colons
// causes OS Error 22 (EINVAL). Default custom server to webpack unless TURBOPACK=1 is explicitly enabled.
const useTurbopack = process.env.TURBOPACK === "1" || process.env.TURBO === "true";
const app = next({
  dev,
  hostname,
  port,
  ...(dev ? (useTurbopack ? { turbopack: true } : { webpack: true }) : {})
});
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  // Run runtime database migrations directly on application start
  await runAutoMigration();

  const server = createServer(async (req, res) => {
    try {
      if (!req.url) return;
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      logger.error("Server", "Error handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  const allowedOrigin = process.env.BASE_URL || `http://${hostname}:${port}`;
  const io = new Server(server, {
    path: "/api/socket/io",
    addTrailingSlash: false,
    cors: {
      origin: (origin, callback) => {
        if (
          !origin ||
          origin === allowedOrigin ||
          origin.startsWith("http://localhost:") ||
          origin.startsWith("http://127.0.0.1:") ||
          origin === process.env.NEXTAUTH_URL
        ) {
          callback(null, true);
        } else {
          callback(new Error("CORS origin denied"));
        }
      },
      credentials: true,
      methods: ["GET", "POST"]
    }
  });

  setupSocket(io);
  // Optional: Global instance for Baileys to emit events
  (global as any).io = io;

  // Initialize WhatsApp Manager
  waManager.setup(io);
  waManager.loadSessions();

  // Start Scheduler
  import("../modules/whatsapp/scheduler").then(m => m.startScheduler());

  // Cloudflare 520 Fix: increase keep-alive timeout so Node doesn't kill idle connections that Cloudflare expects to reuse
  // See: https://github.com/vercel/next.js/issues/48962
  server.keepAliveTimeout = 120 * 1000; // 120 seconds
  server.headersTimeout = 120 * 1000; // 120 seconds

  server.listen(port, () => {
    logger.banner(pkg.name.toUpperCase(), pkg.version, port);

    // --- WA-AKG Monitor Heartbeat ---
    // Sends a ping every 30 seconds to the monitoring server
    // Telemetry opt-out is supported via ENABLE_TELEMETRY="false" or DISABLE_TELEMETRY="true"
    const isTelemetryEnabled = process.env.ENABLE_TELEMETRY !== "false" && process.env.DISABLE_TELEMETRY !== "true";

    if (isTelemetryEnabled) {
      const MONITOR_URL = "https://api-wa-akg.aikeigroup.net/api/ping";
      const APP_NAME = process.env.APP_NAME || "WA-AKG";
      const APP_VERSION = `v${pkg.version}`;

      const sendHeartbeat = async () => {
        try {
          await fetch(MONITOR_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              appUrl: APP_VERSION,
              appVersion: pkg.version,
              appName: APP_NAME,
              isBackend: true,
              systemInfo: {
                platform: process.platform,
                nodeVersion: process.version,
                memoryUsage: Math.round(process.memoryUsage().rss / 1024 / 1024) + "MB"
              }
            }),
          });
        } catch {
          // Silently fail to not disturb the main application
        }
      };

      // Initial ping
      sendHeartbeat();
      // Interval ping
      setInterval(sendHeartbeat, 30000);
    } else {
      logger.info("Server", "Telemetry heartbeat is disabled via environment configuration.");
    }
    // --------------------------------
  });
});
