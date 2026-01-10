# 📡 WA-AKG API Documentation

This document provides a complete reference for the WA-AKG REST API.

**Base URL**: `http://localhost:3000` (Default)

## 🔐 Authentication

All API endpoints require authentication. You can authenticate using one of two methods:

### 1. API Key (Server-to-Server)
Recommended for external applications, webhooks, or scripts.
Pass the key in the `X-API-Key` header.

```bash
curl http://localhost:3000/api/sessions \
  -H "X-API-Key: wag_your_generated_api_key"
```

### 2. Session Cookie (Browser/Frontend)
Used for the dashboard. The `authjs.session-token` cookie must be present.

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
    "id": "clxxx...", 
    "sessionId": "marketing-1",
    "name": "Marketing Main",
    "status": "CONNECTED",
    "createdAt": "2024-01-01T12:00:00Z"
  }
]
```

### Create Session
`POST /api/sessions`

Initialize a new session. It will start in `STOPPED` or `SCANNING` state.

**Body:**
```json
{
  "sessionId": "marketing-1" // Custom unique identifier
}
```

### Get QR Code
`GET /api/sessions/[sessionId]/qrcode`

Retrieve the QR code if the session is in `SCANNING` state.

**Response:**
```json
{
  "qr": "data:image/png;base64,..." // Base64 encoded QR image
}
```

### Delete Session
`DELETE /api/sessions/[sessionId]`

Logout and remove the session data.

---

## 💬 Chat & Messages

### Send Message
`POST /api/chat/send`

Send a text or media message to a contact or group.

**Request Body (Text):**
```json
{
  "sessionId": "marketing-1",
  "jid": "62812345678@s.whatsapp.net",
  "message": {
    "text": "Hello World!"
  }
}
```

**Request Body (Image):**
```json
{
  "sessionId": "marketing-1",
  "jid": "1234567890@g.us", // Group JID
  "message": {
    "image": { "url": "https://example.com/image.png" },
    "caption": "Look at this!"
  }
}
```

**Supported Message Types:** `text`, `image`, `video`, `document`, `audio`.

### Get Chat History
`GET /api/chat/[sessionId]/[jid]`

Retrieve stored messages for a specific chat.

**URL Params:**
- `sessionId`: Your custom session ID.
- `jid`: The contact JID (e.g., `628123...@s.whatsapp.net`).

---

## 👥 Groups

### List Groups
`GET /api/groups/[sessionId]`

Get a list of all groups the session is a participant in.

**Response:**
```json
[
  {
    "jid": "123456@g.us",
    "subject": "My Community",
    "size": 25,
    "creation": 1700000000
  }
]
```

---

## 📅 Scheduler

### Schedule Message
`POST /api/scheduler`

Queue a message to be sent at a specific time.

**Body:**
```json
{
  "sessionId": "marketing-1",
  "jid": "62812345678@s.whatsapp.net",
  "content": "Good morning!",
  "sendAt": "2024-12-25T07:00:00" // Local time (based on System Timezone)
}
```

### List Scheduled
`GET /api/scheduler?sessionId=marketing-1`

---

## 📢 Broadcast

### Send Broadcast
`POST /api/messages/broadcast`

Send a message to multiple recipients with safe random delays (anti-ban).

**Body:**
```json
{
  "sessionId": "marketing-1",
  "recipients": [
    "62812345678@s.whatsapp.net",
    "62898765432@s.whatsapp.net"
  ],
  "message": "Promo content here...",
  "delay": 5000 // Base delay in ms
}
```

---

## 🤖 Auto-Reply

### Create Rule
`POST /api/autoreplies`

**Body:**
```json
{
  "sessionId": "marketing-1",
  "keyword": "price",
  "response": "Our prices start at $10",
  "matchType": "CONTAINS" // EXACT, CONTAINS, STARTS_WITH
}
```

---

## 🔗 Webhooks

Configure webhooks to receive real-time events.

### Create Webhook
`POST /api/webhooks`

**Body:**
```json
{
  "name": "CRM Integration",
  "url": "https://my-crm.com/api/webhook",
  "events": [
    "message.upsert",
    "connection.update"
  ]
}
```
