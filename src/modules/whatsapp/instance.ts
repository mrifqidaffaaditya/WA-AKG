import makeWASocket, {
    DisconnectReason,
    fetchLatestBaileysVersion,
    makeCacheableSignalKeyStore,
    WASocket,
    ConnectionState
} from "@whiskeysockets/baileys";
import { prisma } from "@/lib/prisma";
import { usePrismaAuthState } from "./auth/usePrismaAuthState";
import { Server } from "socket.io";
import pino from "pino";
import { bindSessionStore } from "./store";
import { syncGroups } from "./store/groups";
import { bindContactSync } from "./store/contacts";
import { bindAutoReply } from "./store/autoreply";
import { bindPpGuard } from "./store/ppguard";

export class WhatsAppInstance {
    socket: WASocket | null = null;
    qr: string | null = null;
    rq: string | null = null;
    status: string = "DISCONNECTED";
    sessionId: string;
    userId: string;
    io: Server;
    config: any = {};

    constructor(sessionId: string, userId: string, io: Server) {
        this.sessionId = sessionId;
        this.userId = userId;
        this.io = io;
    }

    async init() {
        const sessionData = await prisma.session.findUnique({ where: { sessionId: this.sessionId } });
        this.config = sessionData?.config || {};
        
        const { state, saveCreds } = await usePrismaAuthState(this.sessionId);
        const { version } = await fetchLatestBaileysVersion();

        this.socket = makeWASocket({
            version,
            logger: pino({ level: process.env.BAILEYS_LOG_LEVEL || "error" }) as any,
            printQRInTerminal: false,
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: process.env.BAILEYS_LOG_LEVEL || "error" }) as any),
            },
            browser: ["WA-AKG", "Chrome", "1.0.0"],
            markOnlineOnConnect: true,
            syncFullHistory: true, // Enable history sync to get contacts
        });
        
        // Bind Store for DB Sync (handles incoming messages)
        bindSessionStore(this.socket, this.sessionId, this.sessionId);
        
        // Bind Contact Sync (handles contacts.update and messaging-history.set events)
        bindContactSync(this.socket, this.sessionId);

        this.socket.ev.on("creds.update", saveCreds);

        this.socket.ev.on("connection.update", async (update) => {
             await this.handleConnectionUpdate(update);
        });
    }

    async handleConnectionUpdate(update: Partial<ConnectionState>) {
        const { connection, lastDisconnect, qr } = update;

        try {
            if (qr) {
                this.qr = qr;
                this.status = "SCAN_QR";
                
                // Emit QR to Socket Room
                this.io?.to(this.sessionId).emit("connection.update", { status: this.status, qr });
                
                // Update DB
                await prisma.session.update({
                    where: { sessionId: this.sessionId },
                    data: { qr, status: "SCAN_QR" }
                });
            }
            
            if (connection === "close") {
                const code = (lastDisconnect?.error as any)?.output?.statusCode;
                const shouldReconnect = code !== DisconnectReason.loggedOut;
                
                this.status = "DISCONNECTED";
                 this.io?.to(this.sessionId).emit("connection.update", { status: this.status, qr: null });
                 
                 // Use try-catch specifically for update as session might be deleted
                 try {
                     await prisma.session.update({
                        where: { sessionId: this.sessionId },
                        data: { status: "DISCONNECTED", qr: null }
                    });
                 } catch (e) {
                     // Ignore if session not found (deleted)
                 }

                if (shouldReconnect) {
                    this.init();
                } else {
                     console.log(`Session ${this.sessionId} logged out. Deleting...`);
                     try {
                         await prisma.session.update({
                            where: { sessionId: this.sessionId },
                            data: { status: "LOGGED_OUT", qr: null }
                         });
                     } catch (e) { /* ignore */ }
                     this.socket = null;
                }
            }

            if (connection === "open") {
                this.status = "CONNECTED";
                this.qr = null;
                
                this.io?.to(this.sessionId).emit("connection.update", { status: this.status, qr: null });
                
                // Sync Groups from WhatsApp (with error handling)
                try {
                    await syncGroups(this.socket as WASocket, this.sessionId);
                } catch (e) {
                    console.error("Group sync failed:", e);
                }
                
                // Bind Auto Reply
                bindAutoReply(this.socket as WASocket, this.sessionId);
                
                // Bind PP Guard
                bindPpGuard(this.socket as WASocket, this.sessionId);

                await prisma.session.update({
                    where: { sessionId: this.sessionId },
                    data: { status: "CONNECTED", qr: null }
                });
                
                console.log(`Session ${this.sessionId} connected and synced successfully`);
            }
        } catch (error: any) {
            // Catch global errors in handler (like Record Not Found if session deleted mid-process)
            if (error.code === 'P2025') {
                console.warn(`Session ${this.sessionId} record not found during update. Stopping instance.`);
                this.socket?.end(undefined);
                this.socket = null;
            } else {
                console.error("Error in handleConnectionUpdate:", error);
            }
        }
    }
}
