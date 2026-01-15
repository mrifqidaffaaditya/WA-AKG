# 📡 WA-AKG API Documentation

This document provides a complete reference for the WA-AKG REST API.

**Base URL**: `http://localhost:3000`
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

## 💬 Chat & Messages

### Get Chat List
`GET /api/chat/[sessionId]`

Get list of contacts with their last message, sorted by most recent.

**Response:**
```json
[
  {
    "jid": "62812345678@s.whatsapp.net",
    "name": "John Doe",
    "lastMessage": {
      "content": "Hello",
      "timestamp": "2024-01-01T12:00:00Z",
      "type": "text"
    }
  }
]
```

### Get Messages (Chat History)
`GET /api/chat/[sessionId]/[jid]`

Retrieve stored messages for a specific contact. `jid` can be a User JID (`...s.whatsapp.net`) or Group JID (`...g.us`).

**Response (Group vs Private):**
- **Private Chat**: Standard message objects.
- **Group Chat**: The `sender` field is **enriched** with participant details:
  ```json
  {
    "key": { ... },
    "sender": {
        "id": "62812345678@lid",
        "phoneNumber": "62812345678@s.whatsapp.net",
        "admin": "admin" // or null
    },
    "content": "Hello Group",
    "timestamp": "..."
  }
  ```

  ```
145: 
146: ### Send Message / Media
147: `POST /api/chat/send`
148: 
149: Send a text or media message (Image, Video, Audio, Document, Sticker) to a contact or group.
150: 
151: **Body (Text):**
152: ```json
153: {
154:   "sessionId": "marketing-1",
155:   "jid": "62812345678@s.whatsapp.net",
156:   "message": {
157:     "text": "Hello World!"
158:   }
159: }
160: ```
161: 
162: **Body (Image/Video/Audio/Document via URL):**
163: ```json
164: {
165:   "sessionId": "marketing-1",
166:   "jid": "62812345678@s.whatsapp.net",
167:   "message": {
168:     "image": { "url": "https://example.com/image.jpg" },
169:     // OR
170:     "video": { "url": "https://example.com/video.mp4" },
171:     "caption": "Check this media!" // Optional caption
172:   }
173: }
174: ```
175: 
176: **Body (Sticker via URL):**
177: > Automatically converts Image/Video URL to WebP Sticker.
178: ```json
179: {
180:   "sessionId": "marketing-1",
181:   "jid": "62812345678@s.whatsapp.net",
182:   "message": {
183:     "sticker": { 
184:         "url": "https://example.com/sticker.png",
185:         "pack": "My Pack", // Optional
186:         "author": "Me" // Optional
187:     }
188:   }
189: }
190: ```

### Send Sticker
`POST /api/messages/sticker`

Send a sticker (image converted to Sticker).

**FormData:**
- `sessionId`: "marketing-1"
- `jid`: "62812345678@s.whatsapp.net"
- `file`: (Binary File - Image)

### Spam / Bulk Send
`POST /api/messages/spam`

Send multiple messages rapidly (Use with caution).

**Body:**
```json
{
  "sessionId": "marketing-1",
  "jid": "62812345678@s.whatsapp.net",
  "message": "Spam Test",
  "count": 10,
  "delay": 500 // milliseconds
}
```

---

## 📢 Broadcast & Groups

### List Groups
`GET /api/groups?sessionId=[sessionId]`

Get a list of groups for a specific session.

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

## 📸 Status / Stories

### Update Status
`POST /api/status/update`

Post a text, image, or video to WhatsApp Status.

**Body (Text):**
```json
{
  "sessionId": "marketing-1",
  "content": "Hello Status!",
  "type": "TEXT",
  "backgroundColor": 4278190335, // Optional ARGB
  "font": 1 // Optional
}
```

**Body (Image/Video):**
```json
{
  "sessionId": "marketing-1",
  "content": "Caption here", // Caption
  "type": "IMAGE", // or VIDEO
  "mediaUrl": "https://example.com/image.jpg"
}
```

---

## 📅 Scheduler

### List Scheduled Messages
`GET /api/scheduler?sessionId=[sessionId]`

### Create Scheduled Message
`POST /api/scheduler`

**Body:**
```json
{
  "sessionId": "marketing-1",
  "jid": "62812345678@s.whatsapp.net",
  "content": "Good morning!",
  "sendAt": "2024-01-02T08:00" // Local time format (YYYY-MM-DDTHH:mm)
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

### Webhook Payload Structure
When an event occurs, your endpoint will receive a POST request.

**Event: `message.received` / `message.sent`**
```json
{
  "event": "message.received",
  "sessionId": "marketing-1",
  "timestamp": "2024-01-01T12:00:00Z",
  "data": {
    "key": {
      "remoteJid": "12345@g.us",
      "fromMe": false,
      "id": "ABC12345",
      "participant": "62812345678@lid" // If group
    },
    "pushName": "John Doe",
    "messageTimestamp": 1704110400,
    
    // Standardized Fields
    "from": "12345@g.us", // Chat JID (Room)
    "sender": { // Enriched Sender Info (Object for Groups, String for DM)
        "id": "62812345678@lid",
        "phoneNumber": "62812345678@s.whatsapp.net",
        "admin": "admin"
    },
    "remoteJidAlt": "62812345678@s.whatsapp.net", // Sender Phone JID (Alias)
    "isGroup": true,
    
    // Content
    "type": "IMAGE",
    "content": "Check this out", // Caption or Text
    "fileUrl": "/media/marketing-1-ABC12345.jpg", // Path to downloaded media
    "caption": "Check this out",
    "quoted": { // Optional: Present if replying to a message
        "key": {
            "remoteJid": "12345@g.us",
            "participant": "62898765432@s.whatsapp.net",
            "id": "QUOTED_ID"
            "id": "QUOTED_ID"
        },
        "type": "IMAGE",
        "content": "Caption",
        "caption": "Caption",
        "fileUrl": "/media/marketing-1-QUOTED_ID.jpg" // Include if available in DB
    },
    
    // Raw Data (Debugging)
    "raw": { ...full_baileys_message_object... }
  }
}
```

### Update Webhook
`PATCH /api/webhooks/[id]`

### Delete Webhook
`DELETE /api/webhooks/[id]`

---

## ⚙️ System & Users (Superadmin)

### List Users
`GET /api/users`

### Create User
`POST /api/users`

**Body:**
```json
{
  "name": "New User",
  "email": "user@example.com",
  "password": "password123",
  "role": "OWNER"
}
```

### Update/Delete User
- `PATCH /api/users/[id]`
- `DELETE /api/users/[id]`

### System Config
`GET /api/settings/system`

### Update System Config
`POST /api/settings/system`

**Body:**
```json
{
  "appName": "My WA Gateway",
  "logoUrl": "...",
  "timezone": "Asia/Jakarta"
}
```
