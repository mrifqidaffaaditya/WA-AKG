import { Server, Socket } from "socket.io";
import { decode } from "next-auth/jwt";
import { prisma } from "../lib/prisma";
import { canAccessSession } from "../lib/api-auth";
import { logger } from "../lib/logger";

function parseCookies(cookieHeader?: string): Record<string, string> {
    const cookies: Record<string, string> = {};
    if (!cookieHeader) return cookies;

    cookieHeader.split(";").forEach((cookie) => {
        const parts = cookie.split("=");
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const val = parts.slice(1).join("=").trim();
            cookies[key] = decodeURIComponent(val);
        }
    });

    return cookies;
}

export function setupSocket(io: Server) {
    // 🔐 Socket.IO Authentication Middleware
    io.use(async (socket: Socket, next) => {
        try {
            const headers = socket.handshake.headers;
            const cookies = parseCookies(headers.cookie);

            // 1. Try NextAuth JWT session tokens (v4 and v5 cookie names)
            const tokenCookieNames = [
                "authjs.session-token",
                "__Secure-authjs.session-token",
                "next-auth.session-token",
                "__Secure-next-auth.session-token"
            ];

            const secret = process.env.AUTH_SECRET;

            for (const cookieName of tokenCookieNames) {
                const tokenVal = cookies[cookieName];
                if (tokenVal && secret) {
                    try {
                        const decoded = await decode({
                            token: tokenVal,
                            secret,
                            salt: cookieName
                        });

                        if (decoded && decoded.id) {
                            socket.data.user = {
                                id: decoded.id as string,
                                role: (decoded.role as string) || "STAFF",
                                email: (decoded.email as string) || ""
                            };
                            return next();
                        }
                    } catch (e) {
                        logger.debug("Socket", `Failed decoding cookie ${cookieName}:`, e);
                    }
                }
            }

            // 2. Try API Key from auth payload or x-api-key header
            const apiKey = 
                (socket.handshake.auth?.apiKey as string) ||
                (headers["x-api-key"] as string) ||
                (socket.handshake.query?.apiKey as string);

            if (apiKey && typeof apiKey === "string") {
                const user = await prisma.user.findUnique({
                    where: { apiKey },
                    select: { id: true, role: true, email: true }
                });

                if (user) {
                    socket.data.user = {
                        id: user.id,
                        role: user.role,
                        email: user.email
                    };
                    return next();
                }
            }

            // Reject unauthenticated sockets
            logger.warn("Socket", `Rejected unauthenticated connection attempt from ${socket.id} (IP: ${socket.handshake.address})`);
            return next(new Error("Authentication required"));

        } catch (err) {
            logger.error("Socket", "Error in Socket.IO auth middleware:", err);
            return next(new Error("Internal authentication error"));
        }
    });

    // 📡 Authenticated connection handler
    io.on("connection", (socket: Socket) => {
        const user = socket.data.user;
        logger.info("Socket", `Client connected: ${socket.id} (User: ${user?.id || "unknown"}, Role: ${user?.role || "unknown"})`);

        socket.on("disconnect", () => {
            logger.info("Socket", `Client disconnected: ${socket.id}`);
        });

        // 🛡️ Authorized Session Room Join
        socket.on("join-session", async (sessionId: string) => {
            try {
                if (!sessionId || typeof sessionId !== "string") {
                    socket.emit("error", { message: "Invalid sessionId" });
                    return;
                }

                if (!socket.data.user) {
                    socket.emit("error", { message: "Unauthorized" });
                    return;
                }

                const canAccess = await canAccessSession(
                    socket.data.user.id,
                    socket.data.user.role,
                    sessionId
                );

                if (!canAccess) {
                    logger.warn("Socket", `Forbidden join-session attempt: User ${socket.data.user.id} tried to join session '${sessionId}'`);
                    socket.emit("error", { message: "Forbidden - Cannot access this session" });
                    return;
                }

                socket.join(sessionId);
                logger.debug("Socket", `Socket ${socket.id} (User: ${socket.data.user.id}) joined session room: ${sessionId}`);
            } catch (err) {
                logger.error("Socket", `Error joining session ${sessionId}:`, err);
                socket.emit("error", { message: "Error joining session room" });
            }
        });

        // 🛡️ Authorized User-specific Notification Room Join
        socket.on("join-user-room", (userId: string) => {
            if (!userId || typeof userId !== "string") {
                socket.emit("error", { message: "Invalid userId" });
                return;
            }

            if (!socket.data.user) {
                socket.emit("error", { message: "Unauthorized" });
                return;
            }

            // Only allow joining own user room, unless SUPERADMIN
            if (socket.data.user.id !== userId && socket.data.user.role !== "SUPERADMIN") {
                logger.warn("Socket", `Forbidden join-user-room attempt: User ${socket.data.user.id} tried to join user:${userId}`);
                socket.emit("error", { message: "Forbidden - Cannot access other user room" });
                return;
            }

            socket.join(`user:${userId}`);
            logger.debug("Socket", `Socket ${socket.id} joined user room: user:${userId}`);
        });
    });
}
