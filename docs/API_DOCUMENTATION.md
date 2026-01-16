# WA-AKG API Documentation

Complete API reference with request and response examples for all endpoints.

## 🔐 Authentication

All endpoints require authentication via:
- **API Key Header**: `X-API-Key: your-api-key`
- **Session Cookie**: `next-auth.session-token` (automatically sent by browser)

## 📍 Base URL
```
https://your-domain.com/api
```

---

## 📱 Sessions Management

### GET /api/sessions
**Description**: List all accessible sessions for the authenticated user.

**Request Example**:
```bash
curl -X GET https://your-domain.com/api/sessions \
  -H "X-API-Key: your-api-key"
```

**Response (200 OK)**:
```json
[
  {
    "id": "clx123abc",
    "name": "Marketing Bot",
    "sessionId": "marketing-1",
    "status": "Connected",
    "userId": "user123",
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T12:00:00Z"
  },
  {
    "id": "clx456def",
    "name": "Customer Support",
    "sessionId": "support-1", 
    "status": "Disconnected",
    "userId": "user123",
    "createdAt": "2024-01-10T08:00:00Z",
    "updatedAt": "2024-01-15T09:00:00Z"
  }
]
```

---

### POST /api/sessions
**Description**: Create a new WhatsApp session.

**Request Body**:
```json
{
  "name": "Sales Bot",
  "sessionId": "sales-01"
}
```

**Request Example**:
```bash
curl -X POST https://your-domain.com/api/sessions \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "name": "Sales Bot",
    "sessionId": "sales-01"
  }'
```

**Response (200 OK)**:
```json
{
  "id": "clx789ghi",
  "name": "Sales Bot",
  "sessionId": "sales-01",
  "status": "Disconnected",
  "userId": "user123",
  "createdAt": "2024-01-17T02:10:00Z"
}
```

---

### GET /api/sessions/{id}/qr
**Description**: Get QR code for session pairing.

**Path Parameters**:
- `id` (string): Session ID (e.g., "sales-01")

**Request Example**:
```bash
curl -X GET https://your-domain.com/api/sessions/sales-01/qr \
  -H "X-API-Key: your-api-key"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "qr": "2@AbCdEfGhIjKlMnOpQrStUvWxYz...",
  "base64": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

**Response (400 - Already Connected)**:
```json
{
  "error": "Already connected",
  "connected": true
}
```

---

### GET /api/sessions/{id}/bot-config
**Description**: Get bot configuration for a session.

**Path Parameters**:
- `id` (string): Session ID

**Request Example**:
```bash
curl -X GET https://your-domain.com/api/sessions/sales-01/bot-config \
  -H "X-API-Key: your-api-key"
```

**Response (200 OK)**:
```json
{
  "enabled": true,
  "botMode": "OWNER",
  "botAllowedJids": [],
  "autoReplyMode": "ALL",
  "autoReplyAllowedJids": [],
  "enableSticker": true,
  "enablePing": true,
  "enableUptime": true,
  "botName": "WA-AKG Bot",
  "removeBgApiKey": null,
  "enableVideoSticker": true,
  "maxStickerDuration": 10
}
```

---

### POST /api/sessions/{id}/bot-config
**Description**: Update bot configuration.

**Path Parameters**:
- `id` (string): Session ID

**Request Body**:
```json
{
  "enabled": true,
  "botMode": "OWNER",
  "autoReplyMode": "WHITELIST",
  "autoReplyAllowedJids": ["628123456789@s.whatsapp.net"],
  "enableSticker": true,
  "botName": "My Custom Bot"
}
```

**Request Example**:
```bash
curl -X POST https://your-domain.com/api/sessions/sales-01/bot-config \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "enabled": true,
    "botMode": "OWNER", 
    "enableSticker": true
  }'
```

**Response (200 OK)**:
```json
{
  "id": "config123",
  "sessionId": "session-db-id",
  "enabled": true,
  "botMode": "OWNER",
  "enableSticker": true,
  "updatedAt": "2024-01-17T02:15:00Z"
}
```

---

### PATCH /api/sessions/{id}/settings
**Description**: Update session settings.

**Path Parameters**:
- `id` (string): Session ID

**Request Body**:
```json
{
  "config": {
    "readReceipts": true,
    "rejectCalls": false
  }
}
```

**Request Example**:
```bash
curl -X PATCH https://your-domain.com/api/sessions/sales-01/settings \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "config": {
      "readReceipts": true
    }
  }'
```

**Response (200 OK)**:
```json
{
  "id": "clx789ghi",
  "sessionId": "sales-01",
  "config": {
    "readReceipts": true,
    "rejectCalls": false
  },
  "updatedAt": "2024-01-17T02:20:00Z"
}
```

---

### DELETE /api/sessions/{id}/settings
**Description**: Delete a session and logout.

**Path Parameters**:
- `id` (string): Session ID

**Request Example**:
```bash
curl -X DELETE https://your-domain.com/api/sessions/sales-01/settings \
  -H "X-API-Key: your-api-key"
```

**Response (200 OK)**:
```json
{
  "success": true
}
```

---

## 💬 Messaging

### POST /api/chat/send
**Description**: Send text, media, or sticker messages.

**Request Body (Text Message)**:
```json
{
  "sessionId": "sales-01",
  "jid": "628123456789@s.whatsapp.net",
  "message": {
    "text": "Hello! Welcome to our store."
  }
}
```

**Request Body (Image with Caption)**:
```json
{
  "sessionId": "sales-01",
  "jid": "628123456789@s.whatsapp.net",
  "message": {
    "image": {
      "url": "https://example.com/product.jpg"
    },
    "caption": "Check out our new product!"
  }
}
```

**Request Body (Sticker from URL)**:
```json
{
  "sessionId": "sales-01",
  "jid": "628123456789@s.whatsapp.net",
  "message": {
    "sticker": {
      "url": "https://example.com/sticker.webp",
      "pack": "My Sticker Pack",
      "author": "WA-AKG"
    }
  }
}
```

**Request Example**:
```bash
curl -X POST https://your-domain.com/api/chat/send \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "sessionId": "sales-01",
    "jid": "628123456789@s.whatsapp.net",
    "message": {
      "text": "Hello!"
    }
  }'
```

**Response (200 OK)**:
```json
{
  "success": true
}
```

---

### POST /api/messages/poll
**Description**: Send a poll message.

**Request Body**:
```json
{
  "sessionId": "sales-01",
  "jid": "120363123456789012@g.us",
  "poll": {
    "name": "What's your favorite product?",
    "values": ["Product A", "Product B", "Product C"],
    "selectableCount": 1
  }
}
```

**Request Example**:
```bash
curl -X POST https://your-domain.com/api/messages/poll \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "sessionId": "sales-01",
    "jid": "120363123456789012@g.us",
    "poll": {
      "name": "What is your favorite product?",
      "values": ["Product A", "Product B"],
      "selectableCount": 1
    }
  }'
```

**Response (200 OK)**:
```json
{
  "success": true
}
```

---

### POST /api/messages/location
**Description**: Send a location message.

**Request Body**:
```json
{
  "sessionId": "sales-01",
  "jid": "628123456789@s.whatsapp.net",
  "location": {
    "degreesLatitude": -6.2088,
    "degreesLongitude": 106.8456
  }
}
```

**Request Example**:
```bash
curl -X POST https://your-domain.com/api/messages/location \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "sessionId": "sales-01",
    "jid": "628123456789@s.whatsapp.net",
    "location": {
      "degreesLatitude": -6.2088,
      "degreesLongitude": 106.8456
    }
  }'
```

**Response (200 OK)**:
```json
{
  "success": true
}
```

---

### POST /api/messages/broadcast
**Description**: Send a message to multiple recipients.

**Request Body**:
```json
{
  "sessionId": "sales-01",
  "jids": [
    "628123456789@s.whatsapp.net",
    "628987654321@s.whatsapp.net"
  ],
  "message": {
    "text": "🎉 Flash Sale! 50% off today only!"
  }
}
```

**Request Example**:
```bash
curl -X POST https://your-domain.com/api/messages/broadcast \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "sessionId": "sales-01",
    "jids": ["628123456789@s.whatsapp.net"],
    "message": {"text": "Sale alert!"}
  }'
```

**Response (200 OK)**:
```json
{
  "success": true
}
```

---

### DELETE /api/messages/delete
**Description**: Delete a message for everyone.

**Request Body**:
```json
{
  "sessionId": "sales-01",
  "jid": "628123456789@s.whatsapp.net",
  "messageId": "3EB0ABCD1234567890"
}
```

**Request Example**:
```bash
curl -X DELETE https://your-domain.com/api/messages/delete \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "sessionId": "sales-01",
    "jid": "628123456789@s.whatsapp.net",
    "messageId": "3EB0ABCD1234567890"
  }'
```

**Response (200 OK)**:
```json
{
  "success": true
}
```

---

## 📂 Chat Management

### GET /api/chat/{sessionId}
**Description**: Get list of chats with pagination.

**Path Parameters**:
- `sessionId` (string): Session ID

**Query Parameters**:
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 20)
- `search` (string, optional): Search query

**Request Example**:
```bash
curl -X GET "https://your-domain.com/api/chat/sales-01?page=1&limit=20" \
  -H "X-API-Key: your-api-key"
```

**Response (200 OK)**:
```json
{
  "chats": [
    {
      "jid": "628123456789@s.whatsapp.net",
      "name": "John Doe",
      "lastMessage": "Thank you!",
      "timestamp": 1705456789,
      "unreadCount": 0
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

---

### GET /api/chat/{sessionId}/{jid}
**Description**: Get message history for a specific chat.

**Path Parameters**:
- `sessionId` (string): Session ID
- `jid` (string): WhatsApp JID (must be URL-encoded)

**Query Parameters**:
- `limit` (number, optional): Number of messages (default: 50)

**Request Example**:
```bash
# Note: JID must be URL-encoded
curl -X GET "https://your-domain.com/api/chat/sales-01/628123456789%40s.whatsapp.net?limit=20" \
  -H "X-API-Key: your-api-key"
```

**Response (200 OK)**:
```json
[
  {
    "id": "msg123",
    "messageTimestamp": 1705456789,
    "fromMe": false,
    "text": "Hello, do you have this product?",
    "type": "TEXT"
  },
  {
    "id": "msg124",
    "messageTimestamp": 1705456790,
    "fromMe": true,
    "text": "Yes, we have it in stock!",
    "type": "TEXT"
  }
]
```

---

### POST /api/chat/check
**Description**: Check if phone numbers are registered on WhatsApp (max 50 numbers per request).

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| sessionId | string | Yes | Session identifier |
| numbers | string[] | Yes | Array of phone numbers (max 50) |

**Request Example**:
```bash
curl -X POST https://your-domain.com/api/chat/check \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "sessionId": "sales-01",
    "numbers": ["628123456789", "628987654321"]
  }'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "results": [
    {
      "number": "628123456789",
      "exists": true,
      "jid": "628123456789@s.whatsapp.net"
    },
    {
      "number": "628987654321",
      "exists": false,
      "jid": null,
      "error": "Invalid number format"
    }
  ]
}
```

---

### PUT /api/chat/archive
**Description**: Archive or unarchive a chat.

**Request Body**:
```json
{
  "sessionId": "sales-01",
  "jid": "628123456789@s.whatsapp.net",
  "archive": true
}
```

**Request Example**:
```bash
curl -X PUT https://your-domain.com/api/chat/archive \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "sessionId": "sales-01",
    "jid": "628123456789@s.whatsapp.net",
    "archive": true
  }'
```

**Response (200 OK)**:
```json
{
  "success": true
}
```

---

### PUT /api/chat/mute
**Description**: Mute or unmute a chat for a specific duration.

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| sessionId | string | Yes | Session identifier |
| jid | string | Yes | Chat JID (URL-encoded if needed) |
| mute | boolean | Yes | true to mute, false to unmute |
| duration | number | No | Mute duration in seconds (default: 8 hours) |

**Request Example (Mute for 1 hour)**:
```bash
curl -X PUT https://your-domain.com/api/chat/mute \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "sessionId": "sales-01",
    "jid": "628123456789@s.whatsapp.net",
    "mute": true,
    "duration": 3600
  }'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Chat muted successfully"
}
```

---

### PUT /api/chat/pin
**Description**: Pin or unpin a chat to the top of the chat list.

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| sessionId | string | Yes | Session identifier |
| jid | string | Yes | Chat JID (URL-encoded if needed) |
| pin | boolean | Yes | true to pin, false to unpin |

**Request Example**:
```bash
curl -X PUT https://your-domain.com/api/chat/pin \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "sessionId": "sales-01",
    "jid": "628123456789@s.whatsapp.net",
    "pin": true
  }'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Chat pinned successfully"
}
```

---

### POST /api/chat/presence
**Description**: Send presence status (typing, recording, online, etc.) to a chat.

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| sessionId | string | Yes | Session identifier |
| jid | string | Yes | Chat JID |
| presence | string | Yes | composing, recording, paused, available, unavailable |

**Request Example**:
```bash
curl -X POST https://your-domain.com/api/chat/presence \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "sessionId": "sales-01",
    "jid": "628123456789@s.whatsapp.net",
    "presence": "composing"
  }'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Presence 'composing' sent to 628123456789@s.whatsapp.net"
}
```

---

### POST /api/chat/profile-picture
**Description**: Get profile picture URL for a contact or group.

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| sessionId | string | Yes | Session identifier |
| jid | string | Yes | Contact or group JID |

**Request Example**:
```bash
curl -X POST https://your-domain.com/api/chat/profile-picture \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "sessionId": "sales-01",
    "jid": "628123456789@s.whatsapp.net"
  }'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "jid": "628123456789@s.whatsapp.net",
  "profilePicUrl": "https://pps.whatsapp.net/v/t61.24694-24/..."
}
```

---

## 👥 Groups

### GET /api/groups
**Description**: List all groups for a session.

**Query Parameters**:
- `sessionId` (string, required): Session ID

**Request Example**:
```bash
curl -X GET "https://your-domain.com/api/groups?sessionId=sales-01" \
  -H "X-API-Key: your-api-key"
```

**Response (200 OK)**:
```json
[
  {
    "jid": "120363123456789012@g.us",
    "subject": "Sales Team",
    "participants": 15,
    "createdAt": 1704067200
  },
  {
    "jid": "120363987654321098@g.us",
    "subject": "Customer Support",
    "participants": 8,
    "createdAt": 1703980800
  }
]
```

---

### POST /api/groups/create
**Description**: Create a new group.

**Request Body**:
```json
{
  "sessionId": "sales-01",
  "subject": "VIP Customers",
  "participants": [
    "628123456789@s.whatsapp.net",
    "628987654321@s.whatsapp.net"
  ]
}
```

**Request Example**:
```bash
curl -X POST https://your-domain.com/api/groups/create \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "sessionId": "sales-01",
    "subject": "VIP Customers",
    "participants": ["628123456789@s.whatsapp.net"]
  }'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "group": {
    "id": "120363555666777888@g.us",
    "subject": "VIP Customers"
  }
}
```

---

### PUT /api/groups/{jid}/subject
**Description**: Update group name/subject.

**Path Parameters**:
- `jid` (string): Group JID (URL-encoded)

**Request Body**:
```json
{
  "sessionId": "sales-01",
  "subject": "VIP Customers - Premium"
}
```

**Request Example**:
```bash
curl -X PUT "https://your-domain.com/api/groups/120363555666777888%40g.us/subject" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "sessionId": "sales-01",
    "subject": "VIP Customers - Premium"
  }'
```

**Response (200 OK)**:
```json
{
  "success": true
}
```

---

### GET /api/groups/{jid}/invite
**Description**: Get group invite code.

**Path Parameters**:
- `jid` (string): Group JID (URL-encoded)

**Query Parameters**:
- `sessionId` (string, required): Session ID

**Request Example**:
```bash
curl -X GET "https://your-domain.com/api/groups/120363555666777888%40g.us/invite?sessionId=sales-01" \
  -H "X-API-Key: your-api-key"
```

**Response (200 OK)**:
```json
{
  "code": "AbCdEfGhIjKlMnOp"
}
```

---

### POST /api/groups/{jid}/leave
**Description**: Leave a group.

**Path Parameters**:
- `jid` (string): Group JID (URL-encoded)

**Request Body**:
```json
{
  "sessionId": "sales-01"
}
```

**Request Example**:
```bash
curl -X POST "https://your-domain.com/api/groups/120363555666777888%40g.us/leave" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"sessionId": "sales-01"}'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Successfully left the group"
}
```

---

## 🤖 Auto Reply

### GET /api/autoreplies
**Description**: List all auto-reply rules for a session.

**Query Parameters**:
- `sessionId` (string, required): Session ID

**Request Example**:
```bash
curl -X GET "https://your-domain.com/api/autoreplies?sessionId=sales-01" \
  -H "X-API-Key: your-api-key"
```

**Response (200 OK)**:
```json
[
  {
    "id": "reply123",
    "keyword": "price",
    "response": "Our prices start at $10. Check our catalog!",
    "matchType": "CONTAINS",
    "isActive": true,
    "createdAt": "2024-01-15T10:00:00Z"
  },
  {
    "id": "reply124",
    "keyword": "hello",
    "response": "Hi! Welcome to our store. How can I help you?",
    "matchType": "EXACT",
    "isActive": true,
    "createdAt": "2024-01-14T08:00:00Z"
  }
]
```

---

### POST /api/autoreplies
**Description**: Create a new auto-reply rule.

**Request Body**:
```json
{
  "sessionId": "sales-01",
  "keyword": "hours",
  "response": "We're open 9 AM - 6 PM daily",
  "matchType": "CONTAINS"
}
```

**Match Types**:
- `EXACT`: Exact match only
- `CONTAINS`: Message contains keyword
- `STARTS_WITH`: Message starts with keyword

**Request Example**:
```bash
curl -X POST https://your-domain.com/api/autoreplies \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "sessionId": "sales-01",
    "keyword": "hours",
    "response": "We are open 9 AM - 6 PM",
    "matchType": "CONTAINS"
  }'
```

**Response (200 OK)**:
```json
{
  "id": "reply125",
  "keyword": "hours",
  "response": "We are open 9 AM - 6 PM",
  "matchType": "CONTAINS",
  "sessionId": "session-db-id",
  "createdAt": "2024-01-17T02:30:00Z"
}
```

---

### DELETE /api/autoreplies/{id}
**Description**: Delete an auto-reply rule.

**Path Parameters**:
- `id` (string): Auto-reply rule ID

**Request Example**:
```bash
curl -X DELETE https://your-domain.com/api/autoreplies/reply125 \
  -H "X-API-Key: your-api-key"
```

**Response (200 OK)**:
```json
{
  "success": true
}
```

---

## 📅 Scheduler

### GET /api/scheduler
**Description**: List scheduled messages.

**Query Parameters**:
- `sessionId` (string, required): Session ID

**Request Example**:
```bash
curl -X GET "https://your-domain.com/api/scheduler?sessionId=sales-01" \
  -H "X-API-Key: your-api-key"
```

**Response (200 OK)**:
```json
[
  {
    "id": "sched123",
    "jid": "628123456789@s.whatsapp.net",
    "content": "Reminder: Your appointment is tomorrow at 10 AM",
    "sendAt": "2024-01-18T10:00:00Z",
    "status": "PENDING",
    "createdAt": "2024-01-17T02:00:00Z"
  }
]
```

---

### POST /api/scheduler
**Description**: Schedule a message to be sent later.

**Request Body**:
```json
{
  "sessionId": "sales-01",
  "jid": "628123456789@s.whatsapp.net",
  "content": "Don't forget our meeting tomorrow!",
  "sendAt": "2024-01-18T09:00:00",
  "mediaUrl": "https://example.com/reminder.jpg"
}
```

**Request Example**:
```bash
curl -X POST https://your-domain.com/api/scheduler \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "sessionId": "sales-01",
    "jid": "628123456789@s.whatsapp.net",
    "content": "Meeting reminder",
    "sendAt": "2024-01-18T09:00:00"
  }'
```

**Response (200 OK)**:
```json
{
  "id": "sched124",
  "jid": "628123456789@s.whatsapp.net",
  "content": "Meeting reminder",
  "sendAt": "2024-01-18T02:00:00Z",
  "status": "PENDING",
  "createdAt": "2024-01-17T02:35:00Z"
}
```

---

## 🔗 Webhooks

### GET /api/webhooks
**Description**: List all webhooks for the authenticated user.

**Request Example**:
```bash
curl -X GET https://your-domain.com/api/webhooks \
  -H "X-API-Key: your-api-key"
```

**Response (200 OK)**:
```json
[
  {
    "id": "webhook123",
    "name": "CRM Integration",
    "url": "https://crm.example.com/webhook",
    "events": ["message.upsert", "message.delete"],
    "isActive": true,
    "sessionId": "session-db-id",
    "createdAt": "2024-01-15T10:00:00Z"
  }
]
```

---

### POST /api/webhooks
**Description**: Create a new webhook.

**Request Body**:
```json
{
  "name": "CRM Integration",
  "url": "https://crm.example.com/webhook",
  "secret": "webhook-secret-key",
  "sessionId": "sales-01",
  "events": ["message.upsert", "message.delete"]
}
```

**Available Events**:
- `message.upsert`: New or updated message
- `message.delete`: Message deleted
- `message.update`: Message status updated

**Request Example**:
```bash
curl -X POST https://your-domain.com/api/webhooks \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "name": "CRM Integration",
    "url": "https://crm.example.com/webhook",
    "events": ["message.upsert"]
  }'
```

**Response (200 OK)**:
```json
{
  "id": "webhook124",
  "name": "CRM Integration",
  "url": "https://crm.example.com/webhook",
  "events": ["message.upsert"],
  "isActive": true,
  "userId": "user123",
  "createdAt": "2024-01-17T02:40:00Z"
}
```

---

## ⚙️ System

### GET /api/settings/system
**Description**: Get system configuration.

**Request Example**:
```bash
curl -X GET https://your-domain.com/api/settings/system \
  -H "X-API-Key: your-api-key"
```

**Response (200 OK)**:
```json
{
  "id": "default",
  "appName": "WA-AKG", 
  "logoUrl": "",
  "timezone": "Asia/Jakarta"
}
```

---

### POST /api/settings/system
**Description**: Update system configuration (Admin only).

**Request Body**:
```json
{
  "appName": "My WhatsApp Gateway",
  "logoUrl": "https://example.com/logo.png",
  "timezone": "Asia/Singapore"
}
```

**Request Example**:
```bash
curl -X POST https://your-domain.com/api/settings/system \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "appName": "My WhatsApp Gateway",
    "timezone": "Asia/Jakarta"
  }'
```

**Response (200 OK)**:
```json
{
  "id": "default",
  "appName": "My WhatsApp Gateway",
  "logoUrl": "https://example.com/logo.png",
  "timezone": "Asia/Jakarta",
  "updatedAt": "2024-01-17T02:45:00Z"
}
```

---

## 📊 Complete Endpoint Reference

| Category | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| **Sessions** | GET | `/api/sessions` | List sessions |
| | POST | `/api/sessions` | Create session |
| | GET | `/api/sessions/{id}/qr` | Get QR code |
| | GET | `/api/sessions/{id}/bot-config` | Get bot config |
| | POST | `/api/sessions/{id}/bot-config` | Update bot config |
| | PATCH | `/api/sessions/{id}/settings` | Update settings |
| | DELETE | `/api/sessions/{id}/settings` | Delete session |
| **Messaging** | POST | `/api/chat/send` | Send message |
| | POST | `/api/messages/poll` | Send poll |
| | POST | `/api/messages/location` | Send location |
| | POST | `/api/messages/broadcast` | Broadcast message |
| | DELETE | `/api/messages/delete` | Delete message |
| **Chat** | GET | `/api/chat/{sessionId}` | List chats |
| | GET | `/api/chat/{sessionId}/{jid}` | Get chat history |
| | POST | `/api/chat/check` | Check numbers |
| | PUT | `/api/chat/archive` | Archive chat |
| **Groups** | GET | `/api/groups` | List groups |
| | POST | `/api/groups/create` | Create group |
| | PUT | `/api/groups/{jid}/subject` | Update group name |
| | GET | `/api/groups/{jid}/invite` | Get invite code |
| | POST | `/api/groups/{jid}/leave` | Leave group |
| **Auto Reply** | GET | `/api/autoreplies` | List rules |
| | POST | `/api/autoreplies` | Create rule |
| | DELETE | `/api/autoreplies/{id}` | Delete rule |
| **Scheduler** | GET | `/api/scheduler` | List schedules |
| | POST | `/api/scheduler` | Create schedule |
| **Webhooks** | GET | `/api/webhooks` | List webhooks |
| | POST | `/api/webhooks` | Create webhook |
| **System** | GET | `/api/settings/system` | Get config |
| | POST | `/api/settings/system` | Update config |
