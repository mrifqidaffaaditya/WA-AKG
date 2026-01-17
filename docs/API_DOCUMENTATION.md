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

### GET /api/autoreplies/{id}
**Description**: Get a specific auto-reply rule by ID.

**Path Parameters**:
- `id` (string, required): Rule ID

**Request Example**:
```bash
curl -X GET https://your-domain.com/api/autoreplies/rule123 \
  -H "X-API-Key: your-api-key"
```

**Response (200 OK)**:
```json
{
  "id": "rule123",
  "sessionId": "sales-01",
  "keyword": "price",
  "response": "Our prices start at $10",
  "matchType": "CONTAINS",
  "createdAt": "2024-01-15T10:00:00Z"
}
```

---

### PUT /api/autoreplies/{id}
**Description**: Update an existing auto-reply rule.

**Path Parameters**:
- `id` (string, required): Rule ID

**Request Body**:
- `keyword` (string, optional): Updated keyword
- `response` (string, optional): Updated response
- `matchType` (string, optional): Updated match type

**Request Example**:
```bash
curl -X PUT https://your-domain.com/api/autoreplies/rule123 \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "keyword": "pricing",
    "response": "Our premium prices start at $50",
    "matchType": "EXACT"
  }'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "rule": {
    "id": "rule123",
    "sessionId": "sales-01",
    "keyword": "pricing",
    "response": "Our premium prices start at $50",
    "matchType": "EXACT",
    "updatedAt": "2024-01-17T03:00:00Z"
  }
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

### GET /api/scheduler/{id}
**Description**: Get a specific scheduled message by ID.

**Path Parameters**:
- `id` (string, required): Scheduled message ID

**Request Example**:
```bash
curl -X GET https://your-domain.com/api/scheduler/msg123 \
  -H "X-API-Key: your-api-key"
```

**Response (200 OK)**:
```json
{
  "id": "msg123",
  "sessionId": "sales-01",
  "jid": "628123456789@s.whatsapp.net",
  "content": "Reminder: Meeting at 3 PM",
  "sendAt": "2024-01-18T15:00:00Z",
  "status": "PENDING",
  "createdAt": "2024-01-17T10:00:00Z"
}
```

---

### PUT /api/scheduler/{id}
**Description**: Update a scheduled message.

**Path Parameters**:
- `id` (string, required): Scheduled message ID

**Request Body**:
- `content` (string, optional): Updated message content
- `sendAt` (datetime, optional): Updated send time
- `jid` (string, optional): Updated recipient

**Request Example**:
```bash
curl -X PUT https://your-domain.com/api/scheduler/msg123 \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Updated: Meeting postponed to 4 PM",
    "sendAt": "2024-01-18T16:00:00"
  }'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "scheduled": {
    "id": "msg123",
    "content": "Updated: Meeting postponed to 4 PM",
    "sendAt": "2024-01-18T16:00:00Z",
    "updatedAt": "2024-01-17T12:00:00Z"
  }
}
```

---

### DELETE /api/scheduler/{id}
**Description**: Delete a scheduled message.

**Path Parameters**:
- `id` (string, required): Scheduled message ID

**Request Example**:
```bash
curl -X DELETE https://your-domain.com/api/scheduler/msg123 \
  -H "X-API-Key: your-api-key"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Scheduled message deleted"
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

### GET /api/webhooks/{id}
**Description**: Get a specific webhook by ID.

**Path Parameters**:
- `id` (string, required): Webhook ID

**Request Example**:
```bash
curl -X GET https://your-domain.com/api/webhooks/webhook123 \
  -H "X-API-Key: your-api-key"
```

**Response (200 OK)**:
```json
{
  "id": "webhook123",
  "name": "CRM Integration",
  "url": "https://crm.example.com/webhook",
  "events": ["message.upsert", "message.delete"],
  "isActive": true,
  "createdAt": "2024-01-15T10:00:00Z"
}
```

---

### PUT /api/webhooks/{id}
**Description**: Update webhook configuration.

**Path Parameters**:
- `id` (string, required): Webhook ID

**Request Body**:
- `name` (string, optional): Updated name
- `url` (string, optional): Updated URL
- `events` (array, optional): Updated event list
- `isActive` (boolean, optional): Enable/disable webhook

**Request Example**:
```bash
curl -X PUT https://your-domain.com/api/webhooks/webhook123 \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated CRM Integration",
    "isActive": false
  }'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "webhook": {
    "id": "webhook123",
    "name": "Updated CRM Integration",
    "isActive": false,
    "updatedAt": "2024-01-17T03:00:00Z"
  }
}
```

---

### DELETE /api/webhooks/{id}
**Description**: Delete a webhook.

**Path Parameters**:
- `id` (string, required): Webhook ID

**Request Example**:
```bash
curl -X DELETE https://your-domain.com/api/webhooks/webhook123 \
  -H "X-API-Key: your-api-key"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Webhook deleted"
}
```

---

### PUT /api/labels/{id}
**Description**: Update a label.

**Path Parameters**:
- `id` (string, required): Label ID

**Request Body**:
- `name` (string, optional): Updated label name
- `color` (integer, optional): Updated color (0-19)

**Request Example**:
```bash
curl -X PUT https://your-domain.com/api/labels/label123 \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Super Important",
    "color": 7
  }'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "label": {
    "id": "label123",
    "name": "Super Important",
    "color": 7,
    "colorHex": "#FF1493",
    "updatedAt": "2024-01-17T03:00:00Z"
  }
}
```

---

### DELETE /api/labels/{id}
**Description**: Delete a label.

**Path Parameters**:
- `id` (string, required): Label ID

**Request Example**:
```bash
curl -X DELETE https://your-domain.com/api/labels/label123 \
  -H "X-API-Key: your-api-key"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Label deleted"
}
```

---

### GET /api/labels/chat-labels
**Description**: Get labels assigned to a specific chat.

**Query Parameters**:
- `jid` (string, required): Chat JID
- `sessionId` (string, required): Session ID

**Request Example**:
```bash
curl -X GET "https://your-domain.com/api/labels/chat-labels?jid=628123456789@s.whatsapp.net&sessionId=sales-01" \
  -H "X-API-Key: your-api-key"
```

**Response (200 OK)**:
```json
{
  "labels": [
    {
      "id": "label123",
      "name": "Important",
      "color": 0,
      "colorHex": "#FF0000"
    }
  ]
}
```

---

### PUT /api/labels/chat-labels
**Description**: Add or remove labels from a chat.

**Query Parameters**:
- `jid` (string, required): Chat JID

**Request Body**:
- `sessionId` (string, required)
- `labelIds` (array, required): Array of label IDs
- `action` (string, required): "add" or "remove"

**Request Example**:
```bash
curl -X PUT "https://your-domain.com/api/labels/chat-labels?jid=628123456789@s.whatsapp.net" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "sales-01",
    "labelIds": ["label123", "label456"],
    "action": "add"
  }'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Labels added to chat"
}
```

---

### GET /api/users/{id}
**Description**: Get a specific user by ID (SUPERADMIN only).

**Path Parameters**:
- `id` (string, required): User ID

**Request Example**:
```bash
curl -X GET https://your-domain.com/api/users/user123 \
  -H "X-API-Key: your-api-key"
```

**Response (200 OK)**:
```json
{
  "id": "user123",
  "name": "Sales Team",
  "email": "sales@example.com",
  "role": "OWNER",
  "createdAt": "2024-01-05T00:00:00Z",
  "_count": {
    "sessions": 2
  }
}
```

---

### PUT /api/users/{id}
**Description**: Update user information (SUPERADMIN only).

**Path Parameters**:
- `id` (string, required): User ID

**Request Body**:
- `name` (string, optional)
- `email` (string, optional)
- `password` (string, optional)
- `role` (string, optional)

**Request Example**:
```bash
curl -X PUT https://your-domain.com/api/users/user123 \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Sales Team",
    "role": "STAFF"
  }'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "user": {
    "id": "user123",
    "name": "Updated Sales Team",
    "role": "STAFF",
    "updatedAt": "2024-01-17T03:00:00Z"
  }
}
```

---

### DELETE /api/users/{id}
**Description**: Delete a user (SUPERADMIN only).

**Path Parameters**:
- `id` (string, required): User ID

**Request Example**:
```bash
curl -X DELETE https://your-domain.com/api/users/user123 \
  -H "X-API-Key: your-api-key"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "User deleted"
}
```

---

### DELETE /api/user/api-key
**Description**: Revoke current API key.

**Request Example**:
```bash
curl -X DELETE https://your-domain.com/api/user/api-key \
  -H "X-API-Key: your-current-api-key"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "API key revoked"
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

### PUT /api/chat/read
**Description**: Mark messages or entire chat as read.

**Path Parameters**: None
**Query Parameters**: None
**Request Body**:
- `sessionId` (string, required): Session identifier
- `jid` (string, required): WhatsApp JID
- `messageIds` (array of strings, optional): Specific message IDs to mark as read

**Request Examples**:

```bash
# Mark entire chat as read
curl -X PUT https://your-domain.com/api/chat/read \\\n  -H "X-API-Key: your-api-key" \\\n  -H "Content-Type: application/json" \\\n  -d '{
    "sessionId": "sales-01",
    "jid": "628123456789@s.whatsapp.net"
  }'

# Mark specific messages as read
curl -X PUT https://your-domain.com/api/chat/read \\\n  -H "X-API-Key: your-api-key" \\\n  -H "Content-Type: application/json" \\\n  -d '{
    "sessionId": "sales-01",
    "jid": "628123456789@s.whatsapp.net",
    "messageIds": ["3EB0ABCD1234567890", "3EB0DEFG0987654321"]
  }'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Messages marked as read"
}
```

---

### POST /api/messages/contact
**Description**: Send contact card(s) to a chat.

**Request Body**:
- `sessionId` (string, required): Session identifier
- `jid` (string, required): Recipient JID
- `contacts` (array, required): Array of contact objects with `displayName` and `vcard`

**Request Example**:
```bash
curl -X POST https://your-domain.com/api/messages/contact \\\n  -H "X-API-Key: your-api-key" \\\n  -H "Content-Type: application/json" \\\n  -d '{
    "sessionId": "sales-01",
    "jid": "628123456789@s.whatsapp.net",
    "contacts": [
      {
        "displayName": "John Doe",
        "vcard": "BEGIN:VCARD\nVERSION:3.0\nFN:John Doe\nTEL:+628123456789\nEND:VCARD"
      }
    ]
  }'
```

**Response (200 OK)**:
```json
{
  "success": true
}
```

---

### POST /api/messages/react
**Description**: React to a message with an emoji. Send empty string to remove reaction.

**Request Body**:
- `sessionId` (string, required)
- `jid` (string, required)
- `messageId` (string, required): Message ID to react to
- `emoji` (string, required): Emoji character or empty string

**Request Example**:
```bash
curl -X POST https://your-domain.com/api/messages/react \\\n  -H "X-API-Key: your-api-key" \\\n  -H "Content-Type: application/json" \\\n  -d '{
    "sessionId": "sales-01",
    "jid": "628123456789@s.whatsapp.net",
    "messageId": "3EB0ABCD1234567890",
    "emoji": "👍"
  }'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Reaction sent"
}
```

---

### POST /api/messages/forward
**Description**: Forward a message to one or multiple recipients.

**Request Body**:
- `sessionId` (string, required)
- `fromJid` (string, required): Source chat JID
- `messageId` (string, required): Message ID to forward
- `toJids` (array of strings, required): List of recipient JIDs

**Request Example**:
```bash
curl -X POST https://your-domain.com/api/messages/forward \\\n  -H "X-API-Key: your-api-key" \\\n  -H "Content-Type: application/json" \\\n  -d '{
    "sessionId": "sales-01",
    "fromJid": "628123456789@s.whatsapp.net",
    "messageId": "3EB0ABCD1234567890",
    "toJids": ["628987654321@s.whatsapp.net", "120363123456789@g.us"]
  }'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Message forwarded to 2 recipient(s)"
}
```

---

### PUT /api/groups/{jid}/members
**Description**: Add, remove, promote, or demote group members.

**Path Parameters**:
- `jid` (string, required): URL-encoded group JID

**Request Body**:
- `sessionId` (string, required)
- `action` (string, required): One of `add`, `remove`, `promote`, `demote`
- `participants` (array of strings, required): List of participant JIDs

**Request Example**:
```bash
curl -X PUT https://your-domain.com/api/groups/120363123456789%40g.us/members \\\n  -H "X-API-Key: your-api-key" \\\n  -H "Content-Type: application/json" \\\n  -d '{
    "sessionId": "sales-01",
    "action": "add",
    "participants": ["628123456789@s.whatsapp.net", "628987654321@s.whatsapp.net"]
  }'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Successfully added participants",
  "result": [
    {"status": "200", "jid": "628123456789@s.whatsapp.net"},
    {"status": "200", "jid": "628987654321@s.whatsapp.net"}
  ]
}
```

**Error Responses**:
- **403**: Bot must be admin

---

### PUT /api/groups/{jid}/invite
**Description**: Revoke current invite code and generate a new one.

**Path Parameters**:
- `jid` (string, required): URL-encoded group JID

**Request Body**:
- `sessionId` (string, required)

**Request Example**:
```bash
curl -X PUT https://your-domain.com/api/groups/120363123456789%40g.us/invite \\\n  -H "X-API-Key: your-api-key" \\\n  -H "Content-Type: application/json" \\\n  -d '{
    "sessionId": "sales-01"
  }'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Invite code revoked successfully",
  "newInviteCode": "AbCdEfGhIjKlMnOp",
  "inviteUrl": "https://chat.whatsapp.com/AbCdEfGhIjKlMnOp"
}
```

---

## 🏷️ Labels

### GET /api/labels
**Description**: List all labels for a session with chat counts.

**Query Parameters**:
- `sessionId` (string, required): Session identifier

**Request Example**:
```bash
curl -X GET "https://your-domain.com/api/labels?sessionId=sales-01" \\\n  -H "X-API-Key: your-api-key"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "labels": [
    {
      "id": "label123",
      "sessionId": "sales-01",
      "name": "Important",
      "color": 0,
      "colorHex": "#FF0000",
      "createdAt": "2024-01-15T10:00:00Z",
      "_count": {
        "chatLabels": 5
      }
    },
    {
      "id": "label456",
      "sessionId": "sales-01",
      "name": "Follow-up",
      "color": 3,
      "colorHex": "#00FF00",
      "createdAt": "2024-01-14T12:00:00Z",
      "_count": {
        "chatLabels": 12
      }
    }
  ]
}
```

---

### POST /api/labels
**Description**: Create a new label with color.

**Request Body**:
- `sessionId` (string, required)
- `name` (string, required): Label name
- `color` (integer, optional): Color index 0-19 (default: 0)

**Request Example**:
```bash
curl -X POST https://your-domain.com/api/labels \\\n  -H "X-API-Key: your-api-key" \\\n  -H "Content-Type: application/json" \\\n  -d '{
    "sessionId": "sales-01",
    "name": "VIP Customers",
    "color": 5
  }'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "label": {
    "id": "label789",
    "sessionId": "sales-01",
    "name": "VIP Customers",
    "color": 5,
    "colorHex": "#0000FF",
    "createdAt": "2024-01-17T02:00:00Z"
  }
}
```

**Validation**:
- Color must be between 0-19
- 20 predefined colors available

---

## 📇 Contacts

### GET /api/contacts
**Description**: Get paginated contact list with search functionality.

**Query Parameters**:
- `sessionId` (string, required): Session identifier
- `page` (integer, optional): Page number (default: 1)
- `limit` (integer, optional): Items per page (default: 10)
- `search` (string, optional): Search by name, notify, jid

**Request Example**:
```bash
curl -X GET "https://your-domain.com/api/contacts?sessionId=sales-01&page=1&limit=20&search=john" \\\n  -H "X-API-Key: your-api-key"
```

**Response (200 OK)**:
```json
{
  "data": [
    {
      "id": "contact123",
      "jid": "628123456789@s.whatsapp.net",
      "name": "John Doe",
      "notify": "John",
      "verifiedName": null,
      "profilePic": "https://...",
      "remoteJidAlt": "628123456789"
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "totalPages": 8
  }
}
```

---

## 👤 Profile

### GET /api/profile
**Description**: Get bot's own WhatsApp profile and status.

**Query Parameters**:
- `sessionId` (string, required)

**Request Example**:
```bash
curl -X GET "https://your-domain.com/api/profile?sessionId=sales-01" \\\n  -H "X-API-Key: your-api-key"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "jid": "628111222333@s.whatsapp.net",
  "status": {
    "status": "Hey there! I'm using WhatsApp",
    "setAt": "2024-01-10T08:00:00Z"
  }
}
```

---

## 👥 Users

### GET /api/users
**Description**: List all users (SUPERADMIN only).

**Authorization**: Requires SUPERADMIN role

**Request Example**:
```bash
curl -X GET https://your-domain.com/api/users \\\n  -H "X-API-Key: your-api-key"
```

**Response (200 OK)**:
```json
[
  {
    "id": "user123",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "SUPERADMIN",
    "createdAt": "2024-01-01T00:00:00Z",
    "_count": {
      "sessions": 3
    }
  },
  {
    "id": "user456",
    "name": "Sales Team",
    "email": "sales@example.com",
    "role": "OWNER",
    "createdAt": "2024-01-05T00:00:00Z",
    "_count": {
      "sessions": 2
    }
  }
]
```

---

### POST /api/users
**Description**: Create a new user (SUPERADMIN only).

**Authorization**: Requires SUPERADMIN role

**Request Body**:
- `name` (string, required): Min 2 characters
- `email` (string, required): Valid email format
- `password` (string, required): Min 6 characters
- `role` (string, optional): `SUPERADMIN`, `OWNER`, or `STAFF` (default: `OWNER`)

**Request Example**:
```bash
curl -X POST https://your-domain.com/api/users \\\n  -H "X-API-Key: your-api-key" \\\n  -H "Content-Type: application/json" \\\n  -d '{
    "name": "Marketing Team",
    "email": "marketing@example.com",
    "password": "SecurePass123",
    "role": "OWNER"
  }'
```

**Response (200 OK)**:
```json
{
  "id": "user789",
  "name": "Marketing Team",
  "email": "marketing@example.com",
  "role": "OWNER",
  "createdAt": "2024-01-17T02:30:00Z"
}
```

**Error Responses**:
- **400**: Email already exists
- **403**: Unauthorized (not SUPERADMIN)

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
| | POST | `/api/messages/contact` | Send contact card |
| | POST | `/api/messages/react` | React to message |
| | POST | `/api/messages/forward` | Forward message |
| | POST | `/api/messages/broadcast` | Broadcast message |
| | DELETE | `/api/messages/delete` | Delete message |
| **Chat** | GET | `/api/chat/{sessionId}` | List chats |
| | GET | `/api/chat/{sessionId}/{jid}` | Get chat history |
| | POST | `/api/chat/check` | Check numbers |
| | PUT | `/api/chat/read` | Mark as read |
| | PUT | `/api/chat/archive` | Archive chat |
| | PUT | `/api/chat/mute` | Mute chat |
| | PUT | `/api/chat/pin` | Pin chat |
| | POST | `/api/chat/presence` | Send presence |
| | POST | `/api/chat/profile-picture` | Get profile picture |
| **Groups** | GET | `/api/groups` | List groups |
| | POST | `/api/groups/create` | Create group |
| | PUT | `/api/groups/{jid}/subject` | Update group name |
| | PUT | `/api/groups/{jid}/members` | Manage members |
| | GET | `/api/groups/{jid}/invite` | Get invite code |
| | PUT | `/api/groups/{jid}/invite` | Revoke invite code |
| | POST | `/api/groups/{jid}/leave` | Leave group |
| **Labels** | GET | `/api/labels` | List labels |
| | POST | `/api/labels` | Create label |
| **Contacts** | GET | `/api/contacts` | List contacts (paginated) |
| **Profile** | GET | `/api/profile` | Get own profile |
| **Auto Reply** | GET | `/api/autoreplies` | List rules |
| | POST | `/api/autoreplies` | Create rule |
| | DELETE | `/api/autoreplies/{id}` | Delete rule |
| **Scheduler** | GET | `/api/scheduler` | List schedules |
| | POST | `/api/scheduler` | Create schedule |
| **Webhooks** | GET | `/api/webhooks` | List webhooks |
| | POST | `/api/webhooks` | Create webhook |
| **Users** | GET | `/api/users` | List users (SUPERADMIN) |
| | POST | `/api/users` | Create user (SUPERADMIN) |
| **System** | GET | `/api/settings/system` | Get config |
| | POST | `/api/settings/system` | Update config |

---

## 🔑 Parameter Quick Reference

### Common Request Parameters

#### sessionId
- **Type**: string
- **Location**: Query parameter or request body
- **Description**: Unique identifier for the WhatsApp session
- **Example**: `"sales-01"`, `"support-bot-1"`

#### jid (WhatsApp ID)
- **Type**: string
- **Format**: 
  - Personal: `{countryCode}{number}@s.whatsapp.net`
  - Group: `{groupId}@g.us`
- **Example**: `"628123456789@s.whatsapp.net"`, `"120363123456789@g.us"`
- **Note**: Must be URL-encoded when used in path parameters

### Validation Limits

- **Phone Check**: Maximum 50 numbers per request
- **Poll Options**: 2-12 options required
- **Message History**: Maximum 100 messages returned
- **Group Subject**: Maximum 100 characters
- **Label Colors**: 0-19 index values
- **Message Deletion**: Only messages < 7 minutes old
- **Broadcast Delay**: Random 10-20 seconds between messages
- **Latitude**: -90 to 90
- **Longitude**: -180 to 180

---

## 🛡️ Error Responses

### Common HTTP Status Codes

| Code | Description | Example Response |
|------|-------------|------------------|
| 200 | Success | `{"success": true, "message": "OK"}` |
| 400 | Bad Request | `{"error": "sessionId is required"}` |
| 401 | Unauthorized | `{"error": "Unauthorized"}` |
| 403 | Forbidden | `{"error": "Forbidden - Cannot access this session"}` |
| 404 | Not Found | `{"error": "Session not found"}` |
| 503 | Service Unavailable | `{"error": "Session not ready"}` |

### Specific Error Cases

#### Bot Permission Errors
```json
{
  "error": "Bot must be admin to update group subject"
}
```

#### Validation Errors
```json
{
  "error": "Poll must have between 2 and 12 options"
}
```

#### Time Limit Errors
```json
{
  "error": "Cannot delete message older than 7 minutes"
}
```

---

## 📖 Best Practices

1. **Always URL-encode JIDs** in path parameters
2. **Check session status** before sending messages
3. **Respect rate limits** to avoid bans
4. **Use webhooks** for real-time event notifications
5. **Implement retry logic** for failed requests
6. **Store message IDs** for reactions and deletions
7. **Validate phone numbers** before sending bulk messages
8. **Use scheduled messages** for time-sensitive campaigns
9. **Monitor webhook deliveries** for debugging
10. **Keep API keys secure** and rotate regularly

---

## 🚀 Quick Start Examples

### Complete Message Flow
```bash
# 1. Create session
curl -X POST https://your-domain.com/api/sessions \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"name": "Bot 1"}'

# 2. Get QR code
curl -X GET https://your-domain.com/api/sessions/bot-1/qr \
  -H "X-API-Key: your-api-key"

# 3. Send message (after scanning QR)
curl -X POST https://your-domain.com/api/chat/send \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "bot-1",
    "jid": "628123456789@s.whatsapp.net",
    "message": {"text": "Hello!"}
  }'
```

---

**Documentation Version**: 1.2.0  
**Last Updated**: 2024-01-17  
**Total Endpoints**: 64+
