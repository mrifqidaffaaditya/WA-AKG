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

Complete documentation for all **64+ API endpoints**.

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
                    get: { tags: ["Sessions"], summary: "List all sessions", responses: { 200: { description: "OK" } } },
                    post: { tags: ["Sessions"], summary: "Create new session", requestBody: { content: { "application/json": { schema: { type: "object", required: ["name", "sessionId"], properties: { name: { type: "string" }, sessionId: { type: "string" } } } } } }, responses: { 200: { description: "Created" } } }
                },
                "/sessions/{id}/qr": {
                    get: { tags: ["Sessions"], summary: "Get QR Code", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "OK" } } }
                },
                "/sessions/{id}/bot-config": {
                    get: { tags: ["Sessions"], summary: "Get bot config", parameters: [{ name: "id", in: "path", required: true }], responses: { 200: { description: "OK" } } },
                    put: { tags: ["Sessions"], summary: "Update bot config", parameters: [{ name: "id", in: "path", required: true }], requestBody: { content: { "application/json": { schema: { type: "object" } } } }, responses: { 200: { description: "Updated" } } }
                },
                "/sessions/{id}/settings": {
                    put: { tags: ["Sessions"], summary: "Update settings", parameters: [{ name: "id", in: "path", required: true }], requestBody: { content: { "application/json": { schema: { type: "object" } } } }, responses: { 200: { description: "Updated" } } },
                    delete: { tags: ["Sessions"], summary: "Delete session", parameters: [{ name: "id", in: "path", required: true }], responses: { 200: { description: "Deleted" } } }
                },

                // ==================== MESSAGING (12 Endpoints) ====================
                "/chat/send": {
                    post: { tags: ["Messaging"], summary: "Send Text Message", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "jid", "message"], properties: { sessionId: { type: "string" }, jid: { type: "string" }, message: { type: "object" } } } } } }, responses: { 200: { description: "Sent" } } }
                },
                "/messages/poll": { post: { tags: ["Messaging"], summary: "Send Poll", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "jid", "poll"] } } } }, responses: { 200: { description: "Sent" } } } },
                "/messages/list": { post: { tags: ["Messaging"], summary: "Send List", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "jid"] } } } }, responses: { 200: { description: "Sent" } } } },
                "/messages/location": { post: { tags: ["Messaging"], summary: "Send Location", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "jid", "location"] } } } }, responses: { 200: { description: "Sent" } } } },
                "/messages/contact": { post: { tags: ["Messaging"], summary: "Send Contact", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "jid", "vcard"] } } } }, responses: { 200: { description: "Sent" } } } },
                "/messages/react": { post: { tags: ["Messaging"], summary: "Send Reaction", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "jid", "reaction"] } } } }, responses: { 200: { description: "Sent" } } } },
                "/messages/forward": { post: { tags: ["Messaging"], summary: "Forward Message", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "jid", "messageId"] } } } }, responses: { 200: { description: "Sent" } } } },
                "/messages/sticker": { post: { tags: ["Messaging"], summary: "Send Sticker", requestBody: { content: { "multipart/form-data": { schema: { type: "object", required: ["sessionId", "jid", "sticker"] } } } }, responses: { 200: { description: "Sent" } } } },
                "/messages/broadcast": { post: { tags: ["Messaging"], summary: "Broadcast Message", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "jids", "message"] } } } }, responses: { 200: { description: "Sent" } } } },
                "/messages/spam": { post: { tags: ["Messaging"], summary: "Send Spam", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "jid", "message", "count"] } } } }, responses: { 200: { description: "Started" } } } },
                "/messages/delete": { post: { tags: ["Messaging"], summary: "Delete Message", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "jid", "messageId"] } } } }, responses: { 200: { description: "Deleted" } } } },
                "/messages/{id}/media": {
                    get: { tags: ["Messaging"], summary: "Download Media", parameters: [{ name: "id", in: "path", required: true }, { name: "sessionId", in: "query", required: true }], responses: { 200: { description: "OK" } } }
                },

                // ==================== CHAT MANAGEMENT (10 Endpoints) ====================
                "/chat/{sessionId}": { 
                    get: { tags: ["Chat"], summary: "Get Chat List", parameters: [{ name: "sessionId", in: "path", required: true }, { name: "page", in: "query" }, { name: "limit", in: "query" }], responses: { 200: { description: "OK" } } } 
                },
                "/chat/{sessionId}/{jid}": { 
                    get: { tags: ["Chat"], summary: "Get History", parameters: [{ name: "sessionId", in: "path", required: true }, { name: "jid", in: "path", required: true }, { name: "limit", in: "query" }], responses: { 200: { description: "OK" } } } 
                },
                "/chat/check": { post: { tags: ["Chat"], summary: "Check Numbers", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "phones"] } } } }, responses: { 200: { description: "OK" } } } },
                "/chat/read": { put: { tags: ["Chat"], summary: "Mark Read", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "jid"] } } } }, responses: { 200: { description: "OK" } } } },
                "/chat/archive": { put: { tags: ["Chat"], summary: "Archive Chat", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "jid", "archive"] } } } }, responses: { 200: { description: "OK" } } } },
                "/chat/presence": { post: { tags: ["Chat"], summary: "Send Presence", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "jid", "presence"] } } } }, responses: { 200: { description: "OK" } } } },
                "/chat/profile-picture": { post: { tags: ["Chat"], summary: "Get Picture", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "jid"] } } } }, responses: { 200: { description: "OK" } } } },
                "/chat/mute": { put: { tags: ["Chat"], summary: "Mute Chat", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "jid", "mute"] } } } }, responses: { 200: { description: "OK" } } } },
                "/chat/pin": { put: { tags: ["Chat"], summary: "Pin Chat", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "jid", "pin"] } } } }, responses: { 200: { description: "OK" } } } },
                "/chats/by-label/{labelId}": { 
                    get: { tags: ["Chat"], summary: "Filter by Label", parameters: [{ name: "labelId", in: "path", required: true }, { name: "sessionId", in: "query", required: true }], responses: { 200: { description: "OK" } } } 
                },

                // ==================== GROUPS (13 Endpoints) ====================
                "/groups": { 
                    get: { tags: ["Groups"], summary: "List Groups", parameters: [{ name: "sessionId", in: "query", required: true }], responses: { 200: { description: "OK" } } } 
                },
                "/groups/create": { post: { tags: ["Groups"], summary: "Create Group", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "subject", "participants"] } } } }, responses: { 200: { description: "OK" } } } },
                "/groups/invite/accept": { post: { tags: ["Groups"], summary: "Accept Invite", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "code"] } } } }, responses: { 200: { description: "OK" } } } },
                "/groups/{jid}/picture": {
                    put: { tags: ["Groups"], summary: "Update Picture", parameters: [{ name: "jid", in: "path", required: true }], requestBody: { content: { "multipart/form-data": { schema: { type: "object", required: ["sessionId", "file"] } } } }, responses: { 200: { description: "OK" } } },
                    delete: { tags: ["Groups"], summary: "Remove Picture", parameters: [{ name: "jid", in: "path", required: true }, { name: "sessionId", in: "query", required: true }], responses: { 200: { description: "OK" } } }
                },
                "/groups/{jid}/subject": { put: { tags: ["Groups"], summary: "Update Subject", parameters: [{ name: "jid", in: "path", required: true }], requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "subject"] } } } }, responses: { 200: { description: "OK" } } } },
                "/groups/{jid}/description": { put: { tags: ["Groups"], summary: "Update Description", parameters: [{ name: "jid", in: "path", required: true }], requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "description"] } } } }, responses: { 200: { description: "OK" } } } },
                "/groups/{jid}/invite": { 
                    get: { tags: ["Groups"], summary: "Get Code", parameters: [{ name: "jid", in: "path", required: true }, { name: "sessionId", in: "query", required: true }], responses: { 200: { description: "OK" } } },
                    put: { tags: ["Groups"], summary: "Revoke Code", parameters: [{ name: "jid", in: "path", required: true }], requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId"] } } } }, responses: { 200: { description: "OK" } } } 
                },
                "/groups/{jid}/members": { put: { tags: ["Groups"], summary: "Manage Members", parameters: [{ name: "jid", in: "path", required: true }], requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "action", "participants"] } } } }, responses: { 200: { description: "OK" } } } },
                "/groups/{jid}/settings": { put: { tags: ["Groups"], summary: "Update Settings", parameters: [{ name: "jid", in: "path", required: true }], requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "settings"] } } } }, responses: { 200: { description: "OK" } } } },
                "/groups/{jid}/ephemeral": { put: { tags: ["Groups"], summary: "Toggle Ephemeral", parameters: [{ name: "jid", in: "path", required: true }], requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "ephemeral"] } } } }, responses: { 200: { description: "OK" } } } },
                "/groups/{jid}/leave": { post: { tags: ["Groups"], summary: "Leave Group", parameters: [{ name: "jid", in: "path", required: true }], requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId"] } } } }, responses: { 200: { description: "OK" } } } },

                // ==================== LABELS (6 Endpoints) ====================
                "/labels": {
                    get: { tags: ["Labels"], summary: "List Labels", parameters: [{ name: "sessionId", in: "query", required: true }], responses: { 200: { description: "OK" } } },
                    post: { tags: ["Labels"], summary: "Create Label", requestBody: { content: { "application/json": { schema: { type: "object", required: ["name", "color", "sessionId"] } } } }, responses: { 200: { description: "OK" } } }
                },
                "/labels/{id}": {
                    put: { tags: ["Labels"], summary: "Update Label", parameters: [{ name: "id", in: "path", required: true }], requestBody: { content: { "application/json": { schema: { type: "object", required: ["name", "color"] } } } }, responses: { 200: { description: "OK" } } },
                    delete: { tags: ["Labels"], summary: "Delete Label", parameters: [{ name: "id", in: "path", required: true }], responses: { 200: { description: "OK" } } }
                },
                "/labels/chat-labels": {
                    get: { tags: ["Labels"], summary: "Get Chat Labels", parameters: [{ name: "jid", in: "query", required: true }, { name: "sessionId", in: "query", required: true }], responses: { 200: { description: "OK" } } },
                    put: { tags: ["Labels"], summary: "Update Chat Labels", parameters: [{ name: "jid", in: "query", required: true }], requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "labelIds", "action"] } } } }, responses: { 200: { description: "OK" } } }
                },

                // ==================== CONTACTS (3 Endpoints) ====================
                "/contacts": { get: { tags: ["Contacts"], summary: "List Contacts", parameters: [{ name: "sessionId", in: "query", required: true }], responses: { 200: { description: "OK" } } } },
                "/contacts/block": { post: { tags: ["Contacts"], summary: "Block", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "jid"] } } } }, responses: { 200: { description: "OK" } } } },
                "/contacts/unblock": { post: { tags: ["Contacts"], summary: "Unblock", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "jid"] } } } }, responses: { 200: { description: "OK" } } } },

                // ==================== PROFILE (5 Endpoints) ====================
                "/profile": { get: { tags: ["Profile"], summary: "Get Profile", parameters: [{ name: "sessionId", in: "query", required: true }], responses: { 200: { description: "OK" } } } },
                "/profile/name": { put: { tags: ["Profile"], summary: "Update Name", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "name"] } } } }, responses: { 200: { description: "OK" } } } },
                "/profile/status": { put: { tags: ["Profile"], summary: "Update Status", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "status"] } } } }, responses: { 200: { description: "OK" } } } },
                "/profile/picture": {
                    put: { tags: ["Profile"], summary: "Update Picture", requestBody: { content: { "multipart/form-data": { schema: { type: "object", required: ["sessionId", "image"] } } } }, responses: { 200: { description: "OK" } } },
                    delete: { tags: ["Profile"], summary: "Remove Picture", parameters: [{ name: "sessionId", in: "query", required: true }], responses: { 200: { description: "OK" } } }
                },

                // ==================== AUTO REPLY (5 Endpoints) ====================
                "/autoreplies": {
                    get: { tags: ["Auto Reply"], summary: "List Rules", parameters: [{ name: "sessionId", in: "query", required: true }], responses: { 200: { description: "OK" } } },
                    post: { tags: ["Auto Reply"], summary: "Create Rule", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "keyword", "response"] } } } }, responses: { 200: { description: "OK" } } }
                },
                "/autoreplies/{id}": {
                    get: { tags: ["Auto Reply"], summary: "Get Rule", parameters: [{ name: "id", in: "path", required: true }], responses: { 200: { description: "OK" } } },
                    put: { tags: ["Auto Reply"], summary: "Update Rule", parameters: [{ name: "id", in: "path", required: true }], requestBody: { content: { "application/json": { schema: { type: "object" } } } }, responses: { 200: { description: "OK" } } },
                    delete: { tags: ["Auto Reply"], summary: "Delete Rule", parameters: [{ name: "id", in: "path", required: true }], responses: { 200: { description: "OK" } } }
                },

                // ==================== SCHEDULER (5 Endpoints) ====================
                "/scheduler": {
                    get: { tags: ["Scheduler"], summary: "List Scheduled", parameters: [{ name: "sessionId", in: "query", required: true }], responses: { 200: { description: "OK" } } },
                    post: { tags: ["Scheduler"], summary: "Create Schedule", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "jid", "message", "triggerAt"] } } } }, responses: { 200: { description: "OK" } } }
                },
                "/scheduler/{id}": {
                    get: { tags: ["Scheduler"], summary: "Get Schedule", parameters: [{ name: "id", in: "path", required: true }], responses: { 200: { description: "OK" } } },
                    put: { tags: ["Scheduler"], summary: "Update Schedule", parameters: [{ name: "id", in: "path", required: true }], requestBody: { content: { "application/json": { schema: { type: "object" } } } }, responses: { 200: { description: "OK" } } },
                    delete: { tags: ["Scheduler"], summary: "Delete Schedule", parameters: [{ name: "id", in: "path", required: true }], responses: { 200: { description: "OK" } } }
                },

                // ==================== WEBHOOKS (5 Endpoints) ====================
                "/webhooks": {
                    get: { tags: ["Webhooks"], summary: "List Webhooks", responses: { 200: { description: "OK" } } },
                    post: { tags: ["Webhooks"], summary: "Create Webhook", requestBody: { content: { "application/json": { schema: { type: "object", required: ["name", "url", "sessionId"] } } } }, responses: { 200: { description: "OK" } } }
                },
                "/webhooks/{id}": {
                    get: { tags: ["Webhooks"], summary: "Get Webhook", parameters: [{ name: "id", in: "path", required: true }], responses: { 200: { description: "OK" } } },
                    put: { tags: ["Webhooks"], summary: "Update Webhook", parameters: [{ name: "id", in: "path", required: true }], requestBody: { content: { "application/json": { schema: { type: "object" } } } }, responses: { 200: { description: "OK" } } },
                    delete: { tags: ["Webhooks"], summary: "Delete Webhook", parameters: [{ name: "id", in: "path", required: true }], responses: { 200: { description: "OK" } } }
                },

                // ==================== NOTIFICATIONS (4 Endpoints) ====================
                "/notifications": {
                    get: { tags: ["Notifications"], summary: "List", responses: { 200: { description: "OK" } } },
                    post: { tags: ["Notifications"], summary: "Create", requestBody: { content: { "application/json": { schema: { type: "object", required: ["title", "message"] } } } }, responses: { 200: { description: "OK" } } }
                },
                "/notifications/read": { patch: { tags: ["Notifications"], summary: "Mark Read", requestBody: { content: { "application/json": { schema: { type: "object", required: ["ids"] } } } }, responses: { 200: { description: "OK" } } } },
                "/notifications/delete": { delete: { tags: ["Notifications"], summary: "Delete", parameters: [{ name: "id", in: "query", required: true }], responses: { 200: { description: "OK" } } } },

                // ==================== USERS (7 Endpoints) ====================
                "/users": {
                    get: { tags: ["Users"], summary: "List Users", responses: { 200: { description: "OK" } } },
                    post: { tags: ["Users"], summary: "Create User", requestBody: { content: { "application/json": { schema: { type: "object", required: ["name", "email", "password"] } } } }, responses: { 200: { description: "OK" } } }
                },
                "/users/{id}": {
                    get: { tags: ["Users"], summary: "Get User", parameters: [{ name: "id", in: "path", required: true }], responses: { 200: { description: "OK" } } },
                    put: { tags: ["Users"], summary: "Update User", parameters: [{ name: "id", in: "path", required: true }], requestBody: { content: { "application/json": { schema: { type: "object" } } } }, responses: { 200: { description: "OK" } } },
                    delete: { tags: ["Users"], summary: "Delete User", parameters: [{ name: "id", in: "path", required: true }], responses: { 200: { description: "OK" } } }
                },
                "/user/api-key": {
                    get: { tags: ["Users"], summary: "Get API Key", responses: { 200: { description: "OK" } } },
                    post: { tags: ["Users"], summary: "Generate API Key", responses: { 200: { description: "OK" } } }
                },

                // ==================== SYSTEM (4 Endpoints) ====================
                "/settings/system": {
                    get: { tags: ["System"], summary: "Get Config", responses: { 200: { description: "OK" } } },
                    post: { tags: ["System"], summary: "Update Config", requestBody: { content: { "application/json": { schema: { type: "object" } } } }, responses: { 200: { description: "OK" } } }
                },
                "/docs": { get: { tags: ["System"], summary: "Get OpenAPI Spec", responses: { 200: { description: "OK" } } } },
                "/status/update": { post: { tags: ["System"], summary: "Update Status", requestBody: { content: { "application/json": { schema: { type: "object", required: ["status"] } } } }, responses: { 200: { description: "OK" } } } },
                "/system/check-updates": { get: { tags: ["System"], summary: "Check Updates", responses: { 200: { description: "OK" } } } }
            },
        },
    });
    return spec;
};
