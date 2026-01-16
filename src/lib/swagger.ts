import { createSwaggerSpec } from "next-swagger-doc";

export const getApiDocs = () => {
    const spec = createSwaggerSpec({
        apiFolder: "src/app/api",
        definition: {
            openapi: "3.0.0",
            info: {
                title: "WA-AKG API Documentation",
                version: "1.2.0",
                description: `
# WhatsApp AI Gateway - API Reference

Complete documentation for all **64 API endpoints**.

## Authentication
All endpoints require authentication:
1. **API Key**: Header \`X-API-Key: your-key\`
2. **Session**: Cookie \`next-auth.session-token\` (Browser)

## Common Parameters
- **sessionId**: Unique identifier for the WA session (e.g., "mysession")
- **jid**: WhatsApp ID (e.g., "628123456789@s.whatsapp.net" or "123456789@g.us")
                `,
            },
            servers: [
                {
                    url: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
                    description: "API Server",
                },
            ],
            components: {
                securitySchemes: {
                    ApiKeyAuth: { type: "apiKey", in: "header", name: "X-API-Key" },
                    SessionAuth: { type: "apiKey", in: "cookie", name: "next-auth.session-token" }
                },
                schemas: {
                    Error: { type: "object", properties: { error: { type: "string" } } },
                    Success: { type: "object", properties: { success: { type: "boolean" }, message: { type: "string" } } }
                }
            },
            security: [{ ApiKeyAuth: [] }, { SessionAuth: [] }],
            paths: {
                // ==================== SESSIONS (7 Endpoints) ====================
                "/sessions": {
                    get: { tags: ["Sessions"], summary: "List all sessions", responses: { 200: { description: "List of sessions" } } },
                    post: { 
                        tags: ["Sessions"], 
                        summary: "Create new session", 
                        requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId"], properties: { sessionId: { type: "string" } } } } } }, 
                        responses: { 200: { description: "Created" } } 
                    },
                    delete: {
                        tags: ["Sessions"],
                        summary: "Delete session (via body)",
                        requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId"], properties: { sessionId: { type: "string" } } } } } },
                        responses: { 200: { description: "Deleted" } }
                    }
                },
                "/sessions/{id}/qr": {
                    get: { 
                        tags: ["Sessions"], 
                        summary: "Get QR Code", 
                        parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" }, description: "Session ID (e.g. mysession)" }], 
                        responses: { 200: { description: "QR Image or JSON" } } 
                    }
                },
                "/sessions/{id}/bot-config": {
                    get: { tags: ["Sessions"], summary: "Get bot config", parameters: [{ name: "id", in: "path", required: true }], responses: { 200: { description: "Config data" } } },
                    put: { tags: ["Sessions"], summary: "Update bot config", parameters: [{ name: "id", in: "path", required: true }], requestBody: { content: { "application/json": { schema: { type: "object" } } } }, responses: { 200: { description: "Updated" } } }
                },
                "/sessions/{id}/settings": {
                    put: { tags: ["Sessions"], summary: "Update session settings", parameters: [{ name: "id", in: "path", required: true }], requestBody: { content: { "application/json": { schema: { type: "object" } } } }, responses: { 200: { description: "Updated" } } }
                },

                // ==================== MESSAGING (12 Endpoints) ====================
                "/chat/send": {
                    post: { 
                        tags: ["Messaging"], 
                        summary: "Send Text Message", 
                        description: "Send a text message to a specific JID",
                        requestBody: { 
                            content: { 
                                "application/json": { 
                                    schema: { 
                                        type: "object", 
                                        required: ["sessionId", "jid", "message"], 
                                        properties: { 
                                            sessionId: { type: "string" }, 
                                            jid: { type: "string" }, 
                                            message: { type: "object", properties: { text: { type: "string" } } } 
                                        } 
                                    } 
                                } 
                            } 
                        }, 
                        responses: { 200: { description: "Message sent" } } 
                    }
                },
                "/messages/poll": { post: { tags: ["Messaging"], summary: "Send Poll", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "jid", "poll"], properties: { sessionId: { type: "string" }, jid: { type: "string" }, poll: { type: "object" } } } } } }, responses: { 200: { description: "Sent" } } } },
                "/messages/list": { post: { tags: ["Messaging"], summary: "Send List Message", responses: { 200: { description: "Sent" } } } },
                "/messages/location": { post: { tags: ["Messaging"], summary: "Send Location", responses: { 200: { description: "Sent" } } } },
                "/messages/contact": { post: { tags: ["Messaging"], summary: "Send Contact", responses: { 200: { description: "Sent" } } } },
                "/messages/react": { post: { tags: ["Messaging"], summary: "Send Reaction", responses: { 200: { description: "Sent" } } } },
                "/messages/forward": { post: { tags: ["Messaging"], summary: "Forward Message", responses: { 200: { description: "Sent" } } } },
                "/messages/sticker": { post: { tags: ["Messaging"], summary: "Send Sticker", responses: { 200: { description: "Sent" } } } },
                "/messages/broadcast": { post: { tags: ["Messaging"], summary: "Send Broadcast", responses: { 200: { description: "Sent" } } } },
                "/messages/spam": { post: { tags: ["Messaging"], summary: "Report Spam", responses: { 200: { description: "Reported" } } } },
                "/messages/delete": { 
                    delete: { 
                        tags: ["Messaging"], 
                        summary: "Delete Message", 
                        requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "jid", "messageId"], properties: { sessionId: { type: "string" }, jid: { type: "string" }, messageId: { type: "string" } } } } } },
                        responses: { 200: { description: "Deleted" } } 
                    } 
                },
                "/messages/{id}/media": {
                    get: { 
                        tags: ["Messaging"], 
                        summary: "Download Media", 
                        parameters: [
                            { name: "id", in: "path", required: true, schema: { type: "string" }, description: "Message ID" },
                            { name: "sessionId", in: "query", required: true, schema: { type: "string" }, description: "Session ID" }
                        ], 
                        responses: { 200: { description: "File stream" } } 
                    }
                },

                // ==================== CHAT MANAGEMENT (11 Endpoints) ====================
                "/chat/{sessionId}": { 
                    get: { 
                        tags: ["Chat"], 
                        summary: "Get Chat List", 
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } },
                            { name: "page", in: "query", schema: { type: "integer" } },
                            { name: "limit", in: "query", schema: { type: "integer" } }
                        ], 
                        responses: { 200: { description: "List of chats" } } 
                    } 
                },
                "/chat/{sessionId}/{jid}": { 
                    get: { 
                        tags: ["Chat"], 
                        summary: "Get Chat History", 
                        parameters: [
                            { name: "sessionId", in: "path", required: true, schema: { type: "string" } }, 
                            { name: "jid", in: "path", required: true, schema: { type: "string" } },
                            { name: "limit", in: "query", schema: { type: "integer" } }
                        ], 
                        responses: { 200: { description: "Chat messages" } } 
                    } 
                },
                "/chat/check": { post: { tags: ["Chat"], summary: "Check Numbers", responses: { 200: { description: "Checked" } } } },
                "/chat/read": { put: { tags: ["Chat"], summary: "Mark as Read", responses: { 200: { description: "Updated" } } } },
                "/chat/archive": { put: { tags: ["Chat"], summary: "Archive/Unarchive", responses: { 200: { description: "Updated" } } } },
                "/chat/presence": { post: { tags: ["Chat"], summary: "Send Presence", responses: { 200: { description: "Updated" } } } },
                "/chat/profile-picture": { post: { tags: ["Chat"], summary: "Get Profile Picture", responses: { 200: { description: "URL" } } } },
                "/chat/mute": { put: { tags: ["Chat"], summary: "Mute/Unmute", responses: { 200: { description: "Updated" } } } },
                "/chat/pin": { put: { tags: ["Chat"], summary: "Pin/Unpin", responses: { 200: { description: "Updated" } } } },
                "/chats/by-label/{labelId}": { 
                    get: { 
                        tags: ["Chat"], 
                        summary: "Filter Chats by Label", 
                        parameters: [{ name: "labelId", in: "path", required: true, schema: { type: "string" } }], 
                        responses: { 200: { description: "Filtered chats" } } 
                    } 
                },

                // ==================== GROUPS (13 Endpoints) ====================
                "/groups": { 
                    get: { 
                        tags: ["Groups"], 
                        summary: "List Groups", 
                        parameters: [{ name: "sessionId", in: "query", required: true, schema: { type: "string" } }],
                        responses: { 200: { description: "List of groups" } } 
                    } 
                },
                "/groups/create": { post: { tags: ["Groups"], summary: "Create Group", responses: { 200: { description: "Created" } } } },
                "/groups/invite/accept": { post: { tags: ["Groups"], summary: "Accept Invite", responses: { 200: { description: "Accepted" } } } },
                "/groups/{jid}/picture": {
                    put: { tags: ["Groups"], summary: "Update Picture", parameters: [{ name: "jid", in: "path", required: true }], responses: { 200: { description: "Updated" } } },
                    delete: { tags: ["Groups"], summary: "Remove Picture", parameters: [{ name: "jid", in: "path", required: true }, { name: "sessionId", in: "query", required: true, schema: { type: "string" } }], responses: { 200: { description: "Removed" } } }
                },
                "/groups/{jid}/subject": { put: { tags: ["Groups"], summary: "Update Subject", parameters: [{ name: "jid", in: "path", required: true }], responses: { 200: { description: "Updated" } } } },
                "/groups/{jid}/description": { put: { tags: ["Groups"], summary: "Update Description", parameters: [{ name: "jid", in: "path", required: true }], responses: { 200: { description: "Updated" } } } },
                "/groups/{jid}/invite": { get: { tags: ["Groups"], summary: "Get Invite Code", parameters: [{ name: "jid", in: "path", required: true }], responses: { 200: { description: "Code" } } } },
                "/groups/{jid}/invite/revoke": { put: { tags: ["Groups"], summary: "Revoke Invite Code", parameters: [{ name: "jid", in: "path", required: true }], responses: { 200: { description: "Revoked" } } } },
                "/groups/{jid}/members": { put: { tags: ["Groups"], summary: "Manage Members", parameters: [{ name: "jid", in: "path", required: true }], responses: { 200: { description: "Updated" } } } },
                "/groups/{jid}/settings": { put: { tags: ["Groups"], summary: "Update Group Settings", parameters: [{ name: "jid", in: "path", required: true }], responses: { 200: { description: "Updated" } } } },
                "/groups/{jid}/ephemeral": { put: { tags: ["Groups"], summary: "Toggle Disappearing", parameters: [{ name: "jid", in: "path", required: true }], responses: { 200: { description: "Updated" } } } },
                "/groups/{jid}/leave": { post: { tags: ["Groups"], summary: "Leave Group", parameters: [{ name: "jid", in: "path", required: true }], responses: { 200: { description: "Left" } } } },

                // ==================== LABELS (7 Endpoints) ====================
                "/labels": {
                    get: { tags: ["Labels"], summary: "List Labels", responses: { 200: { description: "OK" } } },
                    post: { tags: ["Labels"], summary: "Create Label", responses: { 200: { description: "Created" } } }
                },
                "/labels/{id}": {
                    put: { tags: ["Labels"], summary: "Update Label", parameters: [{ name: "id", in: "path", required: true }], responses: { 200: { description: "Updated" } } },
                    delete: { tags: ["Labels"], summary: "Delete Label", parameters: [{ name: "id", in: "path", required: true }], responses: { 200: { description: "Deleted" } } }
                },
                "/labels/chat-labels": {
                    get: { 
                        tags: ["Labels"], 
                        summary: "Get Chat Labels", 
                        parameters: [
                            { name: "jid", in: "query", required: true, schema: { type: "string" } },
                            { name: "sessionId", in: "query", required: true, schema: { type: "string" } }
                        ], 
                        responses: { 200: { description: "OK" } } 
                    },
                    put: { 
                        tags: ["Labels"], 
                        summary: "Update Chat Labels", 
                        parameters: [
                            { name: "jid", in: "query", required: true, schema: { type: "string" } }
                        ], 
                        requestBody: { content: { "application/json": { schema: { type: "object", properties: { sessionId: { type: "string" }, action: { type: "string", enum: ["add", "remove"] }, labelIds: { type: "array", items: { type: "string" } } } } } } },
                        responses: { 200: { description: "Updated" } } 
                    }
                },

                // ==================== CONTACTS (3 Endpoints) ====================
                 "/contacts": { 
                    get: { 
                        tags: ["Contacts"], 
                        summary: "List Contacts", 
                        parameters: [{ name: "sessionId", in: "query", required: true, schema: { type: "string" } }],
                        responses: { 200: { description: "OK" } } 
                    } 
                },
                "/contacts/block": { post: { tags: ["Contacts"], summary: "Block Contact", responses: { 200: { description: "Blocked" } } } },
                "/contacts/unblock": { post: { tags: ["Contacts"], summary: "Unblock Contact", responses: { 200: { description: "Unblocked" } } } },

                // ==================== PROFILE (4 Endpoints) ====================
                "/profile": { get: { tags: ["Profile"], summary: "Get Own Profile", responses: { 200: { description: "OK" } } } },
                "/profile/name": { put: { tags: ["Profile"], summary: "Update Push Name", responses: { 200: { description: "Updated" } } } },
                "/profile/status": { put: { tags: ["Profile"], summary: "Update About/Status", responses: { 200: { description: "Updated" } } } },
                "/profile/picture": {
                    put: { tags: ["Profile"], summary: "Update Profile Picture", responses: { 200: { description: "Updated" } } },
                    delete: { tags: ["Profile"], summary: "Remove Profile Picture", parameters: [{ name: "sessionId", in: "query", required: true, schema: { type: "string" } }], responses: { 200: { description: "Removed" } } }
                },

                // ==================== AUTO REPLY (5 Endpoints) ====================
                "/autoreplies": {
                    get: { tags: ["Auto Reply"], summary: "List Auto Replies", responses: { 200: { description: "OK" } } },
                    post: { tags: ["Auto Reply"], summary: "Create Auto Reply", responses: { 200: { description: "Created" } } }
                },
                "/autoreplies/{id}": {
                    get: { tags: ["Auto Reply"], summary: "Get Auto Reply", parameters: [{ name: "id", in: "path", required: true }], responses: { 200: { description: "OK" } } },
                    put: { tags: ["Auto Reply"], summary: "Update Auto Reply", parameters: [{ name: "id", in: "path", required: true }], responses: { 200: { description: "Updated" } } },
                    delete: { tags: ["Auto Reply"], summary: "Delete Auto Reply", parameters: [{ name: "id", in: "path", required: true }], responses: { 200: { description: "Deleted" } } }
                },

                // ==================== SCHEDULER (5 Endpoints) ====================
                "/scheduler": {
                    get: { tags: ["Scheduler"], summary: "List Scheduled", responses: { 200: { description: "OK" } } },
                    post: { tags: ["Scheduler"], summary: "Create Schedule", responses: { 200: { description: "Created" } } }
                },
                "/scheduler/{id}": {
                    get: { tags: ["Scheduler"], summary: "Get Scheduled Message", parameters: [{ name: "id", in: "path", required: true }], responses: { 200: { description: "OK" } } },
                    put: { tags: ["Scheduler"], summary: "Update Schedule", parameters: [{ name: "id", in: "path", required: true }], responses: { 200: { description: "Updated" } } },
                    delete: { tags: ["Scheduler"], summary: "Delete Schedule", parameters: [{ name: "id", in: "path", required: true }], responses: { 200: { description: "Deleted" } } }
                },

                // ==================== WEBHOOKS (5 Endpoints) ====================
                "/webhooks": {
                    get: { tags: ["Webhooks"], summary: "List Webhooks", responses: { 200: { description: "OK" } } },
                    post: { tags: ["Webhooks"], summary: "Create Webhook", responses: { 200: { description: "Created" } } }
                },
                "/webhooks/{id}": {
                    get: { tags: ["Webhooks"], summary: "Get Webhook", parameters: [{ name: "id", in: "path", required: true }], responses: { 200: { description: "OK" } } },
                    put: { tags: ["Webhooks"], summary: "Update Webhook", parameters: [{ name: "id", in: "path", required: true }], responses: { 200: { description: "Updated" } } },
                    delete: { tags: ["Webhooks"], summary: "Delete Webhook", parameters: [{ name: "id", in: "path", required: true }], responses: { 200: { description: "Deleted" } } }
                },

                // ==================== NOTIFICATIONS (4 Endpoints) ====================
                "/notifications": {
                    get: { tags: ["Notifications"], summary: "List Notifications", responses: { 200: { description: "OK" } } },
                    post: { tags: ["Notifications"], summary: "Create Notification", responses: { 200: { description: "Created" } } }
                },
                "/notifications/read": { patch: { tags: ["Notifications"], summary: "Mark Read", responses: { 200: { description: "Updated" } } } },
                "/notifications/delete": { delete: { tags: ["Notifications"], summary: "Delete Notification", responses: { 200: { description: "Deleted" } } } },

                // ==================== USERS (7 Endpoints) ====================
                "/users": {
                    get: { tags: ["Users"], summary: "List Users (Admin)", responses: { 200: { description: "OK" } } },
                    post: { tags: ["Users"], summary: "Create User (Admin)", responses: { 200: { description: "Created" } } }
                },
                "/users/{id}": {
                    get: { tags: ["Users"], summary: "Get User", parameters: [{ name: "id", in: "path", required: true }], responses: { 200: { description: "OK" } } },
                    put: { tags: ["Users"], summary: "Update User", parameters: [{ name: "id", in: "path", required: true }], responses: { 200: { description: "Updated" } } },
                    delete: { tags: ["Users"], summary: "Delete User", parameters: [{ name: "id", in: "path", required: true }], responses: { 200: { description: "Deleted" } } }
                },
                "/user/api-key": {
                    get: { tags: ["Users"], summary: "Get API Key", responses: { 200: { description: "Key" } } },
                    post: { tags: ["Users"], summary: "Generate New API Key", responses: { 200: { description: "New Key" } } }
                },

                // ==================== SYSTEM (4 Endpoints) ====================
                "/settings/system": {
                    get: { tags: ["System"], summary: "Get System Settings", responses: { 200: { description: "OK" } } },
                    put: { tags: ["System"], summary: "Update System Settings", responses: { 200: { description: "Updated" } } }
                },
                "/status/update": { post: { tags: ["System"], summary: "Update Status", responses: { 200: { description: "Updated" } } } },
                "/system/check-updates": { get: { tags: ["System"], summary: "Check for Updates", responses: { 200: { description: "Status" } } } }
            },
        },
    });
    return spec;
};
