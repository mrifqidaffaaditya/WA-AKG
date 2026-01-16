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
Use one of the following methods:
1. **API Key**: Header \`X-API-Key: your-key\`
2. **Session**: Cookie \`next-auth.session-token\` (Browser)

## Common Types
- **SessionId**: unique identifier for the WA session (e.g., "mysession")
- **JID**: WhatsApp ID (e.g., "628123456789@s.whatsapp.net" or "123456789@g.us")
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
            },
            security: [{ ApiKeyAuth: [] }, { SessionAuth: [] }],
            paths: {
                // ==================== SESSIONS (5) ====================
                "/sessions": {
                    get: { tags: ["Sessions"], summary: "List all sessions", responses: { 200: { description: "OK" } } },
                    post: { tags: ["Sessions"], summary: "Create session", requestBody: { content: { "application/json": { schema: { properties: { sessionId: { type: "string" } } } } } }, responses: { 200: { description: "Created" } } }
                },
                "/sessions/{id}": {
                    delete: { tags: ["Sessions"], summary: "Delete session", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Deleted" } } }
                },
                "/sessions/{id}/qr": {
                    get: { tags: ["Sessions"], summary: "Get QR Code", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "QR Image" } } }
                },
                "/sessions/{id}/bot-config": {
                    get: { tags: ["Sessions"], summary: "Get bot config", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Config data" } } },
                    put: { tags: ["Sessions"], summary: "Update bot config", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { content: { "application/json": { schema: { type: "object" } } } }, responses: { 200: { description: "Updated" } } }
                },
                "/sessions/{id}/settings": {
                    put: { tags: ["Sessions"], summary: "Update session settings", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { content: { "application/json": { schema: { type: "object" } } } }, responses: { 200: { description: "Updated" } } }
                },

                // ==================== MESSAGING (11) ====================
                "/chat/send": {
                    post: { tags: ["Messaging"], summary: "Send Text Message", requestBody: { content: { "application/json": { schema: { properties: { sessionId: { type: "string" }, jid: { type: "string" }, message: { type: "object" } } } } } }, responses: { 200: { description: "Sent" } } }
                },
                "/messages/poll": { post: { tags: ["Messaging"], summary: "Send Poll", responses: { 200: { description: "Sent" } } } },
                "/messages/list": { post: { tags: ["Messaging"], summary: "Send List Message", responses: { 200: { description: "Sent" } } } },
                "/messages/location": { post: { tags: ["Messaging"], summary: "Send Location", responses: { 200: { description: "Sent" } } } },
                "/messages/contact": { post: { tags: ["Messaging"], summary: "Send Contact", responses: { 200: { description: "Sent" } } } },
                "/messages/react": { post: { tags: ["Messaging"], summary: "Send Reaction", responses: { 200: { description: "Sent" } } } },
                "/messages/forward": { post: { tags: ["Messaging"], summary: "Forward Message", responses: { 200: { description: "Sent" } } } },
                "/messages/sticker": { post: { tags: ["Messaging"], summary: "Send Sticker", responses: { 200: { description: "Sent" } } } },
                "/messages/broadcast": { post: { tags: ["Messaging"], summary: "Send Broadcast", responses: { 200: { description: "Sent" } } } },
                "/messages/spam": { post: { tags: ["Messaging"], summary: "Report Spam", responses: { 200: { description: "Reported" } } } },
                "/messages/delete": { delete: { tags: ["Messaging"], summary: "Delete Message", responses: { 200: { description: "Deleted" } } } },
                "/messages/{id}/media": {
                    get: { tags: ["Messaging"], summary: "Download Media", parameters: [{ name: "id", in: "path", required: true }], responses: { 200: { description: "File stream" } } }
                },

                // ==================== GROUPS (10) ====================
                "/groups": { get: { tags: ["Groups"], summary: "List Groups", responses: { 200: { description: "OK" } } } },
                "/groups/create": { post: { tags: ["Groups"], summary: "Create Group", responses: { 200: { description: "Created" } } } },
                "/groups/invite/accept": { post: { tags: ["Groups"], summary: "Accept Invite", responses: { 200: { description: "Accepted" } } } },
                "/groups/{jid}/picture": {
                    put: { tags: ["Groups"], summary: "Update Picture", parameters: [{ name: "jid", in: "path", required: true }], responses: { 200: { description: "Updated" } } },
                    delete: { tags: ["Groups"], summary: "Remove Picture", parameters: [{ name: "jid", in: "path", required: true }], responses: { 200: { description: "Removed" } } }
                },
                "/groups/{jid}/subject": { put: { tags: ["Groups"], summary: "Update Subject", parameters: [{ name: "jid", in: "path", required: true }], responses: { 200: { description: "Updated" } } } },
                "/groups/{jid}/description": { put: { tags: ["Groups"], summary: "Update Description", parameters: [{ name: "jid", in: "path", required: true }], responses: { 200: { description: "Updated" } } } },
                "/groups/{jid}/invite": { get: { tags: ["Groups"], summary: "Get Invite Code", parameters: [{ name: "jid", in: "path", required: true }], responses: { 200: { description: "Code" } } } },
                "/groups/{jid}/invite/revoke": { put: { tags: ["Groups"], summary: "Revoke Invite Code", parameters: [{ name: "jid", in: "path", required: true }], responses: { 200: { description: "Revoked" } } } },
                "/groups/{jid}/members": { put: { tags: ["Groups"], summary: "Manage Members (Add/Remove/Promote)", parameters: [{ name: "jid", in: "path", required: true }], responses: { 200: { description: "Updated" } } } },
                "/groups/{jid}/settings": { put: { tags: ["Groups"], summary: "Update Group Settings", parameters: [{ name: "jid", in: "path", required: true }], responses: { 200: { description: "Updated" } } } },
                "/groups/{jid}/ephemeral": { put: { tags: ["Groups"], summary: "Toggle Disappearing Messages", parameters: [{ name: "jid", in: "path", required: true }], responses: { 200: { description: "Updated" } } } },
                "/groups/{jid}/leave": { post: { tags: ["Groups"], summary: "Leave Group", parameters: [{ name: "jid", in: "path", required: true }], responses: { 200: { description: "Left" } } } },

                // ==================== CHAT MANAGEMENT (11) ====================
                "/chat/{sessionId}": { get: { tags: ["Chat"], summary: "Get Chat List", parameters: [{ name: "sessionId", in: "path", required: true }], responses: { 200: { description: "OK" } } } },
                "/chat/{sessionId}/{jid}": { get: { tags: ["Chat"], summary: "Get Specific Chat History", parameters: [{ name: "sessionId", in: "path", required: true }, { name: "jid", in: "path", required: true }], responses: { 200: { description: "OK" } } } },
                "/chat/check": { post: { tags: ["Chat"], summary: "Check Numbers", responses: { 200: { description: "Checked" } } } },
                "/chat/read": { put: { tags: ["Chat"], summary: "Mark as Read", responses: { 200: { description: "Updated" } } } },
                "/chat/archive": { put: { tags: ["Chat"], summary: "Archive/Unarchive", responses: { 200: { description: "Updated" } } } },
                "/chat/presence": { post: { tags: ["Chat"], summary: "Send Presence", responses: { 200: { description: "Updated" } } } },
                "/chat/profile-picture": { post: { tags: ["Chat"], summary: "Get Profile Picture", responses: { 200: { description: "URL" } } } },
                "/chat/mute": { put: { tags: ["Chat"], summary: "Mute/Unmute", responses: { 200: { description: "Updated" } } } },
                "/chat/pin": { put: { tags: ["Chat"], summary: "Pin/Unpin", responses: { 200: { description: "Updated" } } } },
                "/chats/by-label/{labelId}": { get: { tags: ["Chat"], summary: "Filter Chats by Label", parameters: [{ name: "labelId", in: "path", required: true }], responses: { 200: { description: "OK" } } } },

                // ==================== CONTACTS (3) ====================
                "/contacts": { get: { tags: ["Contacts"], summary: "List Contacts", responses: { 200: { description: "OK" } } } },
                "/contacts/block": { post: { tags: ["Contacts"], summary: "Block Contact", responses: { 200: { description: "Blocked" } } } },
                "/contacts/unblock": { post: { tags: ["Contacts"], summary: "Unblock Contact", responses: { 200: { description: "Unblocked" } } } },

                // ==================== LABELS (4) ====================
                "/labels": {
                    get: { tags: ["Labels"], summary: "List Labels", responses: { 200: { description: "OK" } } },
                    post: { tags: ["Labels"], summary: "Create Label", responses: { 200: { description: "Created" } } }
                },
                "/labels/{id}": {
                    put: { tags: ["Labels"], summary: "Update Label", parameters: [{ name: "id", in: "path", required: true }], responses: { 200: { description: "Updated" } } },
                    delete: { tags: ["Labels"], summary: "Delete Label", parameters: [{ name: "id", in: "path", required: true }], responses: { 200: { description: "Deleted" } } }
                },
                "/labels/chat-labels": {
                    get: { tags: ["Labels"], summary: "Get Chat Labels", parameters: [{ name: "jid", in: "query", required: true }], responses: { 200: { description: "OK" } } },
                    put: { tags: ["Labels"], summary: "Update Chat Labels", parameters: [{ name: "jid", in: "query", required: true }], responses: { 200: { description: "Updated" } } }
                },

                // ==================== PROFILE (4) ====================
                "/profile": { get: { tags: ["Profile"], summary: "Get Own Profile", responses: { 200: { description: "OK" } } } },
                "/profile/name": { put: { tags: ["Profile"], summary: "Update Push Name", responses: { 200: { description: "Updated" } } } },
                "/profile/status": { put: { tags: ["Profile"], summary: "Update About/Status", responses: { 200: { description: "Updated" } } } },
                "/profile/picture": {
                    put: { tags: ["Profile"], summary: "Update Profile Picture", responses: { 200: { description: "Updated" } } },
                    delete: { tags: ["Profile"], summary: "Remove Profile Picture", responses: { 200: { description: "Removed" } } }
                },

                // ==================== AUTO REPLY (2) ====================
                "/autoreplies": {
                    get: { tags: ["Auto Reply"], summary: "List Auto Replies", responses: { 200: { description: "OK" } } },
                    post: { tags: ["Auto Reply"], summary: "Create Auto Reply", responses: { 200: { description: "Created" } } }
                },
                "/autoreplies/{id}": {
                    get: { tags: ["Auto Reply"], summary: "Get Auto Reply", parameters: [{ name: "id", in: "path", required: true }], responses: { 200: { description: "OK" } } },
                    put: { tags: ["Auto Reply"], summary: "Update Auto Reply", parameters: [{ name: "id", in: "path", required: true }], responses: { 200: { description: "Updated" } } },
                    delete: { tags: ["Auto Reply"], summary: "Delete Auto Reply", parameters: [{ name: "id", in: "path", required: true }], responses: { 200: { description: "Deleted" } } }
                },

                // ==================== SCHEDULER (2) ====================
                "/scheduler": {
                    get: { tags: ["Scheduler"], summary: "List Scheduled", responses: { 200: { description: "OK" } } },
                    post: { tags: ["Scheduler"], summary: "Create Schedule", responses: { 200: { description: "Created" } } }
                },
                "/scheduler/{id}": {
                    get: { tags: ["Scheduler"], summary: "Get Scheduled Message", parameters: [{ name: "id", in: "path", required: true }], responses: { 200: { description: "OK" } } },
                    put: { tags: ["Scheduler"], summary: "Update Schedule", parameters: [{ name: "id", in: "path", required: true }], responses: { 200: { description: "Updated" } } },
                    delete: { tags: ["Scheduler"], summary: "Delete Schedule", parameters: [{ name: "id", in: "path", required: true }], responses: { 200: { description: "Deleted" } } }
                },

                // ==================== WEBHOOKS (2) ====================
                "/webhooks": {
                    get: { tags: ["Webhooks"], summary: "List Webhooks", responses: { 200: { description: "OK" } } },
                    post: { tags: ["Webhooks"], summary: "Create Webhook", responses: { 200: { description: "Created" } } }
                },
                "/webhooks/{id}": {
                    get: { tags: ["Webhooks"], summary: "Get Webhook", parameters: [{ name: "id", in: "path", required: true }], responses: { 200: { description: "OK" } } },
                    put: { tags: ["Webhooks"], summary: "Update Webhook", parameters: [{ name: "id", in: "path", required: true }], responses: { 200: { description: "Updated" } } },
                    delete: { tags: ["Webhooks"], summary: "Delete Webhook", parameters: [{ name: "id", in: "path", required: true }], responses: { 200: { description: "Deleted" } } }
                },

                // ==================== NOTIFICATIONS (3) ====================
                "/notifications": {
                    get: { tags: ["Notifications"], summary: "List Notifications", responses: { 200: { description: "OK" } } },
                    post: { tags: ["Notifications"], summary: "Create Notification", responses: { 200: { description: "Created" } } }
                },
                "/notifications/read": { patch: { tags: ["Notifications"], summary: "Mark Read", responses: { 200: { description: "Updated" } } } },
                "/notifications/delete": { delete: { tags: ["Notifications"], summary: "Delete Notification", responses: { 200: { description: "Deleted" } } } },

                // ==================== USERS (4) ====================
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

                // ==================== SYSTEM (4) ====================
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
