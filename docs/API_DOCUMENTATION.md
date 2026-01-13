# 📡 WA-AKG API Documentation

This document provides a complete reference for the WA-AKG REST API.

**Base URL**: `http://localhost:3000` (Default)
**Production URL**: `https://wa-akg.aikeigroup.net`
> **Note**: For Production, replace `localhost:3000` with the production domain.

## 🔐 Authentication

All API endpoints require authentication via **API Key**.

**Header:**
`X-API-Key: your_api_key_here`

To obtain an API Key:
1.  Log in to the Dashboard.
2.  Go to **Webhooks & API** settings.
3.  Generate or copy your API Key.

---

## 📦 Sessions

Manage WhatsApp instances (accounts).

### List Sessions
`GET /api/sessions`

Returns all sessions accessible to the authenticated user.

**Response:**
```json
[
  {
    "id": "cmk...",
    "sessionId": "marketing-1",
    "name": "Marketing Main",
    "status": "CONNECTED",
    "qr": null,
    "createdAt": "2024-01-01T12:00:00Z"
  }
]
```

### Create Session
`POST /api/sessions`

Initialize a new session.

**Body:**
```json
{
  "name": "My New Session",
  "sessionId": "custom-id-optional" // Optional. If omitted, random ID is generated.
}
```

**Response:**
```json
{
  "id": "cmk...",
  "sessionId": "custom-id-optional",
  "name": "My New Session",
  "status": "DISCONNECTED"
}
```

### Get Session Config (Bot)
`GET /api/sessions/[sessionId]/bot-config`

**Response:**
```json
{
  "enabled": true,
  "botMode": "OWNER",
  "botAllowedJids": [],
  "autoReplyMode": "ALL",
  "enableSticker": true
  // ...other config
}
```

### Update Session Config (Bot)
`POST /api/sessions/[sessionId]/bot-config`

**Body:**
```json
{
  "enabled": true,
  "botMode": "OWNER", // OWNER, ALL, SPECIFIC
  "enableSticker": true,
  "autoReplyMode": "ALL"
}
```

### Delete Session
`DELETE /api/sessions/[sessionId]`

Logout and remove the session data.

---

## 💬 Chat

### Send Message
`POST /api/chat/send`

Send a text message to a contact or group.

**Body:**
```json
{
  "sessionId": "marketing-1",
  "jid": "62812345678@s.whatsapp.net", // or 12345@g.us
  "message": {
    "text": "Hello World!"
  }
}
```
*Note: `message` object follows Baileys `AnyMessageContent` structure.*

### Get Messages
`GET /api/chat/[sessionId]/[jid]`

Retrieve stored messages for a chat. `jid` must be URL-encoded.

---

## 👥 Groups

### List Groups
`GET /api/groups?sessionId=[sessionId]`

Get a list of groups for a specific session.

**Response:**
```json
[
  {
    "id": "123@g.us",
    "subject": "Community",
    "size": 10
  }
]
```

### Create Group
`POST /api/groups/create`

**Body:**
```json
{
  "sessionId": "marketing-1",
  "subject": "My New Group",
  "participants": ["62812345678@s.whatsapp.net", "62898765432@s.whatsapp.net"]
}
```

---

## 📢 Broadcast

### Send Broadcast
`POST /api/messages/broadcast`

Send a message to multiple recipients with random delays (anti-ban).

**Body:**
```json
{
  "sessionId": "marketing-1",
  "recipients": [
    "62812345678@s.whatsapp.net",
    "62898765432@s.whatsapp.net"
  ],
  "message": "Promo content here...",
  "delay": 10000 // Base delay in ms (optional, default handled by server)
}
```

---

## 🤖 Auto-Reply

### List Auto-Replies
`GET /api/autoreplies?sessionId=[sessionId]`

### Create Auto-Reply
`POST /api/autoreplies`

**Body:**
```json
{
  "sessionId": "marketing-1",
  "keyword": "price",
  "response": "Starts at $10",
  "matchType": "EXACT" // EXACT, CONTAINS, STARTS_WITH
}
```

### Delete Auto-Reply
`DELETE /api/autoreplies/[id]`

---

## 🔗 Webhooks

### List Webhooks
`GET /api/webhooks`

### Create Webhook
`POST /api/webhooks`

**Body:**
```json
{
  "name": "My Server",
  "url": "https://callback.com",
  "events": ["message.received", "message.sent"],
  "sessionId": "marketing-1" // Optional, null = Global
}
```

### Update Webhook
`PATCH /api/webhooks/[id]`

**Body:**
```json
{
  "isActive": false,
  "events": ["message.received"]
}
```

### Delete Webhook
`DELETE /api/webhooks/[id]`

---

## 🔔 Notifications

### List Notifications
`GET /api/notifications`

Request must be authenticated. Returns notifications for the user.

### Send Notification (Superadmin Only)
`POST /api/notifications`

**Body (Broadcast):**
```json
{
  "broadcast": true,
  "title": "System Alert",
  "message": "Maintenance in 1 hour",
  "type": "WARNING"
}
```

**Body (Target User):**
```json
{
  "targetUserId": "user-uuid",
  "title": "Hello",
  "message": "Welcome!",
  "type": "INFO"
}
```

### Mark Read
`PATCH /api/notifications/read`

**Body:**
```json
{ "ids": ["notif-1", "notif-2"] } // omit "ids" to mark all as read
```

### Delete Notification
`DELETE /api/notifications/delete?id=[id]`
