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
# WhatsApp AI Gateway - Complete API Reference

Complete reference matching the client-side documentation.

## 🔐 Authentication
All endpoints require authentication via:
1. **API Key Header**: \`X-API-Key: your-api-key\`
2. **Session Cookie**: \`next-auth.session-token\`
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
                    ApiKeyAuth: {
                        type: "apiKey",
                        in: "header",
                        name: "X-API-Key",
                    },
                    SessionAuth: {
                        type: "apiKey",
                        in: "cookie",
                        name: "next-auth.session-token",
                    }
                },
            },
            security: [{ ApiKeyAuth: [] }, { SessionAuth: [] }],
            paths: {
                // ==================== SESSIONS ====================
                "/sessions": {
                    get: { tags: ["Sessions"], summary: "List all sessions", responses: { 200: { description: "OK" } } },
                    post: { tags: ["Sessions"], summary: "Create new session", requestBody: { content: { "application/json": { schema: { type: "object", required: ["name", "sessionId"], properties: { name: { type: "string" }, sessionId: { type: "string" } } } } } }, responses: { 200: { description: "Created" } } }
                },
                "/sessions/{id}/qr": {
                    get: { tags: ["Sessions"], summary: "Get QR code", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "OK" } } }
                },
                "/sessions/{id}/bot-config": {
                    get: { tags: ["Sessions"], summary: "Get bot config", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "OK" } } },
                    post: { tags: ["Sessions"], summary: "Update bot config", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { content: { "application/json": { schema: { type: "object", properties: { enabled: { type: "boolean" }, botMode: { type: "string" } } } } } }, responses: { 200: { description: "Updated" } } }
                },
                "/sessions/{id}/settings": {
                    patch: { tags: ["Sessions"], summary: "Update settings", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { content: { "application/json": { schema: { type: "object", properties: { config: { type: "object" } } } } } }, responses: { 200: { description: "Updated" } } },
                    delete: { tags: ["Sessions"], summary: "Delete session", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Deleted" } } }
                },

                // ==================== GROUPS ====================
                "/groups": {
                    get: { tags: ["Groups"], summary: "List groups", parameters: [{ name: "sessionId", in: "query", required: true, schema: { type: "string" } }], responses: { 200: { description: "OK" } } }
                },
                "/groups/create": {
                    post: { tags: ["Groups"], summary: "Create group", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "subject", "participants"], properties: { sessionId: { type: "string" }, subject: { type: "string" }, participants: { type: "array", items: { type: "string" } } } } } } }, responses: { 200: { description: "Created" } } }
                },
                "/groups/invite/accept": {
                    post: { tags: ["Groups"], summary: "Accept invite", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "code"], properties: { sessionId: { type: "string" }, code: { type: "string" } } } } } }, responses: { 200: { description: "Joined" } } }
                },
                "/groups/{jid}/picture": {
                    put: { tags: ["Groups"], summary: "Update group picture", parameters: [{ name: "jid", in: "path", required: true, schema: { type: "string" } }], requestBody: { content: { "multipart/form-data": { schema: { type: "object", properties: { sessionId: { type: "string" }, file: { type: "string", format: "binary" } } } } } }, responses: { 200: { description: "Updated" } } },
                    delete: { tags: ["Groups"], summary: "Remove group picture", parameters: [{ name: "jid", in: "path", required: true, schema: { type: "string" } }, { name: "sessionId", in: "query", required: true, schema: { type: "string" } }], responses: { 200: { description: "Removed" } } }
                },
                "/groups/{jid}/subject": {
                    put: { tags: ["Groups"], summary: "Update group name", parameters: [{ name: "jid", in: "path", required: true, schema: { type: "string" } }], requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "subject"], properties: { sessionId: { type: "string" }, subject: { type: "string" } } } } } }, responses: { 200: { description: "Updated" } } }
                },
                "/groups/{jid}/description": {
                    put: { tags: ["Groups"], summary: "Update description", parameters: [{ name: "jid", in: "path", required: true, schema: { type: "string" } }], requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "description"], properties: { sessionId: { type: "string" }, description: { type: "string" } } } } } }, responses: { 200: { description: "Updated" } } }
                },
                "/groups/{jid}/invite": {
                    get: { tags: ["Groups"], summary: "Get invite code", parameters: [{ name: "jid", in: "path", required: true, schema: { type: "string" } }, { name: "sessionId", in: "query", required: true, schema: { type: "string" } }], responses: { 200: { description: "OK" } } }
                },
                "/groups/{jid}/invite/revoke": {
                    put: { tags: ["Groups"], summary: "Revoke invite", parameters: [{ name: "jid", in: "path", required: true, schema: { type: "string" } }], requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId"], properties: { sessionId: { type: "string" } } } } } }, responses: { 200: { description: "Revoked" } } }
                },
                "/groups/{jid}/members": {
                    put: { tags: ["Groups"], summary: "Manage members", parameters: [{ name: "jid", in: "path", required: true, schema: { type: "string" } }], requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "action", "participants"], properties: { sessionId: { type: "string" }, action: { type: "string", enum: ["add", "remove", "promote", "demote"] }, participants: { type: "array", items: { type: "string" } } } } } } }, responses: { 200: { description: "Updated" } } }
                },
                "/groups/{jid}/settings": {
                    put: { tags: ["Groups"], summary: "Update settings", parameters: [{ name: "jid", in: "path", required: true, schema: { type: "string" } }], requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "settings"], properties: { sessionId: { type: "string" }, settings: { type: "object" } } } } } }, responses: { 200: { description: "Updated" } } }
                },
                "/groups/{jid}/ephemeral": {
                    put: { tags: ["Groups"], summary: "Toggle disappearing messages", parameters: [{ name: "jid", in: "path", required: true, schema: { type: "string" } }], requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "ephemeral"], properties: { sessionId: { type: "string" }, ephemeral: { type: "integer", description: "Duration in seconds or 0 to off" } } } } } }, responses: { 200: { description: "Updated" } } }
                },
                "/groups/{jid}/leave": {
                    post: { tags: ["Groups"], summary: "Leave group", parameters: [{ name: "jid", in: "path", required: true, schema: { type: "string" } }], requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId"], properties: { sessionId: { type: "string" } } } } } }, responses: { 200: { description: "Left" } } }
                },

                // ==================== PROFILE ====================
                "/profile": {
                    get: { tags: ["Profile"], summary: "Get own profile", parameters: [{ name: "sessionId", in: "query", required: true, schema: { type: "string" } }], responses: { 200: { description: "OK" } } }
                },
                "/profile/name": {
                    put: { tags: ["Profile"], summary: "Update name", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "name"], properties: { sessionId: { type: "string" }, name: { type: "string" } } } } } }, responses: { 200: { description: "Updated" } } }
                },
                "/profile/status": {
                    put: { tags: ["Profile"], summary: "Update status", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "status"], properties: { sessionId: { type: "string" }, status: { type: "string" } } } } } }, responses: { 200: { description: "Updated" } } }
                },
                "/profile/picture": {
                    put: { tags: ["Profile"], summary: "Update picture", requestBody: { content: { "multipart/form-data": { schema: { type: "object", properties: { sessionId: { type: "string" }, image: { type: "string", format: "binary" } } } } } }, responses: { 200: { description: "Updated" } } },
                    delete: { tags: ["Profile"], summary: "Remove picture", parameters: [{ name: "sessionId", in: "query", required: true, schema: { type: "string" } }], responses: { 200: { description: "Removed" } } }
                },

                // ==================== MESSAGING ====================
                "/chat/send": {
                    post: { tags: ["Messaging"], summary: "Send message", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "jid", "message"], properties: { sessionId: { type: "string" }, jid: { type: "string" }, message: { type: "object" } } } } } }, responses: { 200: { description: "Sent" } } }
                },
                "/messages/poll": {
                    post: { tags: ["Messaging"], summary: "Send poll", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "jid", "poll"], properties: { sessionId: { type: "string" }, jid: { type: "string" }, poll: { type: "object" } } } } } }, responses: { 200: { description: "Sent" } } }
                },
                "/messages/list": {
                    post: { tags: ["Messaging"], summary: "Send list message", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "jid"], properties: { sessionId: { type: "string" }, jid: { type: "string" }, title: { type: "string" }, sections: { type: "array" } } } } } }, responses: { 200: { description: "Sent" } } }
                },
                "/messages/location": {
                    post: { tags: ["Messaging"], summary: "Send location", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "jid", "location"], properties: { sessionId: { type: "string" }, jid: { type: "string" }, location: { type: "object" } } } } } }, responses: { 200: { description: "Sent" } } }
                },
                "/messages/contact": {
                    post: { tags: ["Messaging"], summary: "Send contact", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "jid", "vcard"], properties: { sessionId: { type: "string" }, jid: { type: "string" }, vcard: { type: "object" } } } } } }, responses: { 200: { description: "Sent" } } }
                },
                "/messages/react": {
                    post: { tags: ["Messaging"], summary: "Send reaction", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "jid", "reaction"], properties: { sessionId: { type: "string" }, jid: { type: "string" }, reaction: { type: "object", properties: { text: { type: "string" }, key: { type: "object" } } } } } } } }, responses: { 200: { description: "Sent" } } }
                },
                "/messages/forward": {
                    post: { tags: ["Messaging"], summary: "Forward message", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "jid", "messageId"], properties: { sessionId: { type: "string" }, jid: { type: "string" }, messageId: { type: "string" } } } } } }, responses: { 200: { description: "Sent" } } }
                },
                "/messages/sticker": {
                    post: { tags: ["Messaging"], summary: "Send sticker", requestBody: { content: { "multipart/form-data": { schema: { type: "object", required: ["sessionId", "jid", "sticker"], properties: { sessionId: { type: "string" }, jid: { type: "string" }, sticker: { type: "string", format: "binary" } } } } } }, responses: { 200: { description: "Sent" } } }
                },
                "/messages/broadcast": {
                    post: { tags: ["Messaging"], summary: "Broadcast message", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "jids", "message"], properties: { sessionId: { type: "string" }, jids: { type: "array", items: { type: "string" } }, message: { type: "object" } } } } } }, responses: { 200: { description: "Broadcasted" } } }
                },
                "/messages/spam": {
                    post: { tags: ["Messaging"], summary: "Report spam", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "jid"], properties: { sessionId: { type: "string" }, jid: { type: "string" } } } } } }, responses: { 200: { description: "Reported" } } }
                },
                "/messages/delete": {
                    delete: { tags: ["Messaging"], summary: "Delete message", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "jid", "messageId"], properties: { sessionId: { type: "string" }, jid: { type: "string" }, messageId: { type: "string" } } } } } }, responses: { 200: { description: "Deleted" } } }
                },
                "/messages/{id}/media": {
                    get: { tags: ["Messaging"], summary: "Download media", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }, { name: "sessionId", in: "query", required: true, schema: { type: "string" } }], responses: { 200: { description: "Media binary" } } }
                },

                // ==================== CHAT ====================
                "/chat/{sessionId}": {
                    get: { tags: ["Chat"], summary: "Get chats", parameters: [{ name: "sessionId", in: "path", required: true, schema: { type: "string" } }, { name: "page", in: "query", schema: { type: "integer" } }, { name: "limit", in: "query", schema: { type: "integer" } }], responses: { 200: { description: "OK" } } }
                },
                "/chat/{sessionId}/{jid}": {
                    get: { tags: ["Chat"], summary: "Get specific chat", parameters: [{ name: "sessionId", in: "path", required: true, schema: { type: "string" } }, { name: "jid", in: "path", required: true, schema: { type: "string" } }, { name: "limit", in: "query", schema: { type: "integer" } }], responses: { 200: { description: "OK" } } }
                },
                "/chat/check": {
                    post: { tags: ["Chat"], summary: "Check numbers", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "phones"], properties: { sessionId: { type: "string" }, phones: { type: "array", items: { type: "string" } } } } } } }, responses: { 200: { description: "Checked" } } }
                },
                "/chat/read": {
                    put: { tags: ["Chat"], summary: "Mark as read", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "jid"], properties: { sessionId: { type: "string" }, jid: { type: "string" } } } } } }, responses: { 200: { description: "Marked" } } }
                },
                "/chat/archive": {
                    put: { tags: ["Chat"], summary: "Archive chat", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "jid", "archive"], properties: { sessionId: { type: "string" }, jid: { type: "string" }, archive: { type: "boolean" } } } } } }, responses: { 200: { description: "Archived" } } }
                },
                "/chat/presence": {
                    post: { tags: ["Chat"], summary: "Send presence", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "jid", "presence"], properties: { sessionId: { type: "string" }, jid: { type: "string" }, presence: { type: "string" } } } } } }, responses: { 200: { description: "Sent" } } }
                },
                "/chat/profile-picture": {
                    post: { tags: ["Chat"], summary: "Get profile picture", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "jid"], properties: { sessionId: { type: "string" }, jid: { type: "string" } } } } } }, responses: { 200: { description: "OK" } } }
                },
                "/chat/mute": {
                    put: { tags: ["Chat"], summary: "Mute chat", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "jid", "mute"], properties: { sessionId: { type: "string" }, jid: { type: "string" }, mute: { type: "boolean" } } } } } }, responses: { 200: { description: "Muted" } } }
                },
                "/chat/pin": {
                    put: { tags: ["Chat"], summary: "Pin chat", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "jid", "pin"], properties: { sessionId: { type: "string" }, jid: { type: "string" }, pin: { type: "boolean" } } } } } }, responses: { 200: { description: "Pinned" } } }
                },
                "/chats/by-label/{labelId}": {
                    get: { tags: ["Chat"], summary: "Filter by label", parameters: [{ name: "labelId", in: "path", required: true, schema: { type: "string" } }, { name: "sessionId", in: "query", required: true, schema: { type: "string" } }], responses: { 200: { description: "OK" } } }
                },

                // ==================== CONTACTS ====================
                "/contacts": {
                    get: { tags: ["Contacts"], summary: "List contacts", parameters: [{ name: "sessionId", in: "query", required: true, schema: { type: "string" } }], responses: { 200: { description: "OK" } } }
                },
                "/contacts/block": {
                    post: { tags: ["Contacts"], summary: "Block contact", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "jid"], properties: { sessionId: { type: "string" }, jid: { type: "string" } } } } } }, responses: { 200: { description: "Blocked" } } }
                },
                "/contacts/unblock": {
                    post: { tags: ["Contacts"], summary: "Unblock contact", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "jid"], properties: { sessionId: { type: "string" }, jid: { type: "string" } } } } } }, responses: { 200: { description: "Unblocked" } } }
                },

                // ==================== LABELS ====================
                "/labels": {
                    get: { tags: ["Labels"], summary: "List labels", parameters: [{ name: "sessionId", in: "query", required: true, schema: { type: "string" } }], responses: { 200: { description: "OK" } } },
                    post: { tags: ["Labels"], summary: "Create label", requestBody: { content: { "application/json": { schema: { type: "object", required: ["name", "color", "sessionId"], properties: { name: { type: "string" }, color: { type: "integer" }, sessionId: { type: "string" } } } } } }, responses: { 200: { description: "Created" } } }
                },
                "/labels/{id}": {
                    put: { tags: ["Labels"], summary: "Update label", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" }, color: { type: "integer" } } } } } }, responses: { 200: { description: "Updated" } } },
                    delete: { tags: ["Labels"], summary: "Delete label", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Deleted" } } }
                },
                "/labels/chat-labels": {
                    get: { tags: ["Labels"], summary: "Get chat labels", parameters: [{ name: "jid", in: "query", required: true, schema: { type: "string" } }, { name: "sessionId", in: "query", required: true, schema: { type: "string" } }], responses: { 200: { description: "OK" } } },
                    put: { tags: ["Labels"], summary: "Add/remove labels", parameters: [{ name: "jid", in: "query", required: true, schema: { type: "string" } }], requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "labelIds", "action"], properties: { sessionId: { type: "string" }, labelIds: { type: "array", items: { type: "string" } }, action: { type: "string", enum: ["add", "remove"] } } } } } }, responses: { 200: { description: "Updated" } } }
                },

                // ==================== AUTO REPLY ====================
                "/autoreplies": {
                    get: { tags: ["Auto Reply"], summary: "List auto replies", parameters: [{ name: "sessionId", in: "query", required: true, schema: { type: "string" } }], responses: { 200: { description: "OK" } } },
                    post: { tags: ["Auto Reply"], summary: "Create auto reply", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "keyword", "response"], properties: { sessionId: { type: "string" }, keyword: { type: "string" }, response: { type: "string" }, matchType: { type: "string" } } } } } }, responses: { 200: { description: "Created" } } }
                },
                "/autoreplies/{id}": {
                    get: { tags: ["Auto Reply"], summary: "Get auto reply", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "OK" } } },
                    put: { tags: ["Auto Reply"], summary: "Update auto reply", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { content: { "application/json": { schema: { type: "object", properties: { keyword: { type: "string" }, response: { type: "string" } } } } } }, responses: { 200: { description: "Updated" } } },
                    delete: { tags: ["Auto Reply"], summary: "Delete auto reply", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Deleted" } } }
                },

                // ==================== SCHEDULER ====================
                "/scheduler": {
                    get: { tags: ["Scheduler"], summary: "List scheduled", parameters: [{ name: "sessionId", in: "query", required: true, schema: { type: "string" } }], responses: { 200: { description: "OK" } } },
                    post: { tags: ["Scheduler"], summary: "Create scheduled", requestBody: { content: { "application/json": { schema: { type: "object", required: ["sessionId", "jid", "content", "sendAt"], properties: { sessionId: { type: "string" }, jid: { type: "string" }, content: { type: "string" }, sendAt: { type: "string" } } } } } }, responses: { 200: { description: "Created" } } }
                },
                "/scheduler/{id}": {
                    get: { tags: ["Scheduler"], summary: "Get scheduled", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "OK" } } },
                    put: { tags: ["Scheduler"], summary: "Update scheduled", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { content: { "application/json": { schema: { type: "object", properties: { content: { type: "string" }, sendAt: { type: "string" } } } } } }, responses: { 200: { description: "Updated" } } },
                    delete: { tags: ["Scheduler"], summary: "Delete scheduled", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Deleted" } } }
                },

                // ==================== WEBHOOKS ====================
                "/webhooks": {
                    get: { tags: ["Webhooks"], summary: "List webhooks", responses: { 200: { description: "OK" } } },
                    post: { tags: ["Webhooks"], summary: "Create webhook", requestBody: { content: { "application/json": { schema: { type: "object", required: ["name", "url", "events"], properties: { name: { type: "string" }, url: { type: "string" }, events: { type: "array", items: { type: "string" } }, sessionId: { type: "string" } } } } } }, responses: { 200: { description: "Created" } } }
                },
                "/webhooks/{id}": {
                    get: { tags: ["Webhooks"], summary: "Get webhook", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "OK" } } },
                    put: { tags: ["Webhooks"], summary: "Update webhook", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" }, url: { type: "string" }, isActive: { type: "boolean" } } } } } }, responses: { 200: { description: "Updated" } } },
                    delete: { tags: ["Webhooks"], summary: "Delete webhook", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Deleted" } } }
                },

                // ==================== NOTIFICATIONS ====================
                "/notifications": {
                    get: { tags: ["Notifications"], summary: "List notifications", responses: { 200: { description: "OK" } } },
                    post: { tags: ["Notifications"], summary: "Create notification", requestBody: { content: { "application/json": { schema: { type: "object", required: ["title", "message"], properties: { title: { type: "string" }, message: { type: "string" } } } } } }, responses: { 200: { description: "Created" } } }
                },
                "/notifications/read": {
                    patch: { tags: ["Notifications"], summary: "Mark as read", requestBody: { content: { "application/json": { schema: { type: "object", properties: { ids: { type: "array", items: { type: "string" } } } } } } }, responses: { 200: { description: "Updated" } } }
                },
                "/notifications/delete": {
                    delete: { tags: ["Notifications"], summary: "Delete notifications", parameters: [{ name: "id", in: "query", schema: { type: "string" } }], responses: { 200: { description: "Deleted" } } }
                },

                // ==================== USERS ====================
                "/users": {
                    get: { tags: ["Users"], summary: "List users", responses: { 200: { description: "OK" } } },
                    post: { tags: ["Users"], summary: "Create user", requestBody: { content: { "application/json": { schema: { type: "object", required: ["name", "email", "password"], properties: { name: { type: "string" }, email: { type: "string" }, password: { type: "string" }, role: { type: "string" } } } } } }, responses: { 200: { description: "Created" } } }
                },
                "/users/{id}": {
                    get: { tags: ["Users"], summary: "Get user", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "OK" } } },
                    put: { tags: ["Users"], summary: "Update user", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], requestBody: { content: { "application/json": { schema: { type: "object", properties: { name: { type: "string" }, email: { type: "string" }, role: { type: "string" } } } } } }, responses: { 200: { description: "Updated" } } },
                    delete: { tags: ["Users"], summary: "Delete user", parameters: [{ name: "id", in: "path", required: true, schema: { type: "string" } }], responses: { 200: { description: "Deleted" } } }
                },
                "/user/api-key": {
                    get: { tags: ["Users"], summary: "Get API key", responses: { 200: { description: "OK" } } },
                    post: { tags: ["Users"], summary: "Generate API key", responses: { 200: { description: "OK" } } }
                },

                // ==================== SYSTEM ====================
                "/settings/system": {
                    get: { tags: ["System"], summary: "Get system settings", responses: { 200: { description: "OK" } } },
                    post: { tags: ["System"], summary: "Update system settings", requestBody: { content: { "application/json": { schema: { type: "object", properties: { appName: { type: "string" }, logoUrl: { type: "string" }, timezone: { type: "string" } } } } } }, responses: { 200: { description: "Updated" } } }
                },
                "/status/update": {
                    post: { tags: ["System"], summary: "Update status", requestBody: { content: { "application/json": { schema: { type: "object", required: ["status"], properties: { status: { type: "string" } } } } } }, responses: { 200: { description: "Updated" } } }
                },
                "/system/check-updates": {
                    get: { tags: ["System"], summary: "Check updates", responses: { 200: { description: "OK" } } }
                },
            },
        },
    });
    return spec;
};