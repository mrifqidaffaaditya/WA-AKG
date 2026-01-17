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

## 🔐 Web Authentication (NextAuth)

### GET /api/auth/session
**Description**: Get the current active web session.

**Response**:
```json
{
  "user": {
    "name": "Admin",
    "email": "admin@example.com",
    "image": "..."
  },
  "expires": "2024-..."
}
```

### GET /api/auth/csrf
**Description**: Get CSRF token for secure form submissions.

**Response**:
```json
{
  "csrfToken": "..."
}
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
  "id": "cm5y123...",
  "sessionId": "cm5x456...",
  "enabled": true,
  "botMode": "OWNER",
  "botAllowedJids": [],
  "autoReplyMode": "ALL",
  "autoReplyAllowedJids": [],
  "botName": "WA-AKG Bot",
  "enableSticker": true,
  "enableVideoSticker": true,
  "maxStickerDuration": 10,
  "enablePing": true,
  "enableUptime": true,
  "removeBgApiKey": null,
  "createdAt": "2024-01-17T02:15:00.000Z",
  "updatedAt": "2024-01-17T02:15:00.000Z"
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
- `sessionId` (string, required)
- `jid` (string, required)
- `question` (string, required): Poll question
- `options` (array of strings, required): 2-12 options
- `selectableCount` (number, optional): Default 1

**Request Example**:
```bash
curl -X POST https://your-domain.com/api/messages/poll \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "sessionId": "sales-01",
    "jid": "120363123456789012@g.us",
    "question": "What is your favorite product?",
    "options": ["Product A", "Product B", "Product C"],
    "selectableCount": 1
  }'
```

**Response (200 OK)**:
```json
{
  "success": true
}
```

**Common Errors**:
- `400`: Missing required fields, or options count out of range (2-12).
- `401`: Unauthorized.
- `403`: Forbidden (cannot access session).
- `503`: Session not ready.
- `500`: Failed to send poll.


---

### POST /api/messages/location
**Description**: Send a location message.

**Request Body**:
- `sessionId` (string, required)
- `jid` (string, required)
- `latitude` (number, required): -90 to 90
- `longitude` (number, required): -180 to 180
- `name` (string, optional): Location name
- `address` (string, optional): Location address

**Request Example**:
```bash
curl -X POST https://your-domain.com/api/messages/location \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "sessionId": "sales-01",
    "jid": "628123456789@s.whatsapp.net",
    "latitude": -6.2088,
    "longitude": 106.8456,
    "name": "Central Park",
    "address": "Jakarta, Indonesia"
  }'
```

**Response (200 OK)**:
```json
{
  "success": true
}
```

**Common Errors**:
- `400`: Missing required fields or coordinates out of range.
- `401`: Unauthorized.
- `403`: Forbidden (cannot access session).
- `503`: Session not ready.
- `500`: Failed to send location.


---

### POST /api/messages/broadcast
**Description**: Send a message to multiple recipients.

**Request Body**:
- `sessionId` (string, required): Session ID
- `recipients` (array of strings, required): List of recipient JIDs
- `message` (string, required): Message text to broadcast
- `delay` (number, optional): Delay in ms (default: 2000, but code uses random 10-20s)

**Request Example**:
```bash
curl -X POST https://your-domain.com/api/messages/broadcast \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "sessionId": "sales-01",
    "recipients": ["628123456789@s.whatsapp.net", "628987654321@s.whatsapp.net"],
    "message": "🎉 Flash Sale! 50% off today only!"
  }'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Broadcast started in background"
}
```

**Common Errors**:
- `400`: Invalid request body (validation error).
- `401`: Unauthorized.
- `403`: Forbidden (cannot access session).
- `503`: Session not ready.


---

### GET /api/messages/{id}/media
**Description**: Download media (image, video, audio, or document) from a message by its ID.

**Path Parameters**:
- `id` (string, required): The unique ID of the message.

**Query Parameters**:
- `sessionId` (string, required): Session identifier.

**Request Example**:
```bash
curl -X GET "https://your-domain.com/api/messages/3EB0ABCD1234567890/media?sessionId=sales-01" \
  -H "X-API-Key: your-api-key"
```

**Response**:
Returns the binary media file with appropriate `Content-Type` and `Content-Disposition` headers.

**Common Errors**:
- `400`: `sessionId` is required.
- `401`: Unauthorized.
- `403`: Forbidden (cannot access session or message doesn't belong to session).
- `404`: Message not found, has no media, or media file missing on disk.
- `500`: Failed to download media.

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
  "success": true,
  "message": "Message deleted for everyone"
}
```

**Common Errors**:
- `400`: Message too old (> 7 minutes) or missing fields.
- `401`: Unauthorized.
- `403`: Forbidden (cannot access session).
- `503`: Session not ready.
- `500`: Failed to delete message.


---

## 📂 Chat Management

### GET /api/chat/{sessionId}
**Description**: Get list of chats with pagination.

**Path Parameters**:
- `sessionId` (string): Session ID

**Query Parameters**: None
- `search` (string, optional): Search query

**Request Example**:
```bash
curl -X GET "https://your-domain.com/api/chat/sales-01?page=1&limit=20" \
  -H "X-API-Key: your-api-key"
```

**Response (200 OK)**:
  {
    "jid": "628123456789@s.whatsapp.net",
    "name": "John Doe",
    "notify": "John",
    "lastMessage": {
       "content": "Hello", 
       "timestamp": "2024-01-01T12:00:00.000Z"
    }
  }
]
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

### PUT /api/groups/{jid}/members
**Description**: Add, remove, promote, or demote group participants.

**Path Parameters**:
- `jid` (string): Group JID (URL-encoded)

**Request Body**:
- `sessionId` (string, required): Session ID
- `action` (string, required): One of `add`, `remove`, `promote`, `demote`
- `participants` (array, required): List of phone numbers (JIDs)

**Request Example**:
```bash
curl -X PUT "https://your-domain.com/api/groups/120363555666777888%40g.us/members" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "sessionId": "sales-01",
    "action": "add",
    "participants": ["628123456789@s.whatsapp.net"]
  }'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Successfully added participants",
  "result": [...]
}
```

---

### PUT /api/groups/{jid}/subject
**Description**: Update group name/subject.

**Path Parameters**:
- `jid` (string): Group JID (URL-encoded)

**Request Body**:
- `sessionId` (string, required): Session ID
- `subject` (string, required): New group subject (max 100 characters)

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
  "success": true,
  "message": "Group subject updated successfully",
  "subject": "VIP Customers - Premium"
}
```

**Common Errors**:
- `400`: Missing `sessionId`, `subject`, or subject > 100 chars.
- `401`: Unauthorized.
- `403`: Bot not admin or forbidden.
- `503`: Session not ready.


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

### PUT /api/groups/{jid}/invite
**Description**: Revoke and refresh group invite code.

**Path Parameters**:
- `jid` (string): Group JID (URL-encoded)

**Request Body**:
- `sessionId` (string, required): Session ID

**Request Example**:
```bash
curl -X PUT "https://your-domain.com/api/groups/120363555666777888%40g.us/invite" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "sessionId": "sales-01"
  }'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Invite code revoked successfully",
  "newInviteCode": "NeWcOdE123",
  "inviteUrl": "https://chat.whatsapp.com/NeWcOdE123"
}
```

---

---

### POST /api/groups/invite/accept
**Description**: Accept a group invite code.

**Request Body**:
- `sessionId` (string, required): Session ID
- `inviteCode` (string, required): The invite code

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Group invite accepted successfully",
  "groupJid": "120363000000000000@g.us"
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

---

### PUT /api/groups/{jid}/description
**Description**: Update group description.

**Path Parameters**:
- `jid` (string): Group JID (URL-encoded)

**Request Body**:
- `sessionId` (string, required): Session ID
- `description` (string, optional): New description (max 512 chars)

**Request Example**:
```bash
curl -X PUT "https://your-domain.com/api/groups/120363555666777888%40g.us/description" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "sessionId": "sales-01",
    "description": "Welcome to our VIP group!"
  }'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Group description updated successfully",
  "description": "Welcome to our VIP group!"
}
```

---

---

---

### PUT /api/groups/{jid}/picture
**Description**: Update group profile picture.

**Path Parameters**:
- `jid` (string): Group JID (URL-encoded)

**Request Body (FormData)**:
- `sessionId` (string, required): Session ID
- `file` (file, required): Image file (JPG/PNG)

**Request Example**:
```bash
curl -X PUT "https://your-domain.com/api/groups/120363555666777888%40g.us/picture" \
  -F "sessionId=sales-01" \
  -F "file=@/path/to/image.jpg" \
  -H "X-API-Key: your-api-key"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Group picture updated successfully"
}
```

---

### DELETE /api/groups/{jid}/picture
**Description**: Remove group profile picture.

**Path Parameters**:
- `jid` (string): Group JID (URL-encoded)

**Query Parameters**:
- `sessionId` (string, required): Session ID

**Request Example**:
```bash
curl -X DELETE "https://your-domain.com/api/groups/120363555666777888%40g.us/picture?sessionId=sales-01" \
  -H "X-API-Key: your-api-key"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Group picture removed successfully"
}
```

---

---

### PUT /api/groups/{jid}/settings
**Description**: Update group settings (who can send messages/edit info).

**Path Parameters**:
- `jid` (string): Group JID (URL-encoded)

**Request Body**:
- `sessionId` (string, required): Session ID
- `setting` (string, required): `announcement` (admins only send), `not_announcement` (everyone sends), `locked` (admins only edit info), `unlocked` (everyone edits info)
- `value` (boolean, required): Ignored but required by schema (use setting name instead)

**Request Example**:
```bash
curl -X PUT "https://your-domain.com/api/groups/120363555666777888%40g.us/settings" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "sessionId": "sales-01",
    "setting": "announcement",
    "value": true
  }'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Group setting 'announcement' updated successfully",
  "setting": "announcement"
}
```

---

### PUT /api/groups/{jid}/ephemeral
**Description**: Toggle disappearing messages.

**Path Parameters**:
- `jid` (string): Group JID (URL-encoded)

**Request Body**:
- `sessionId` (string, required): Session ID
- `expiration` (number, required): 0 (off), 86400 (24h), 604800 (7d), 7776000 (90d)

**Request Example**:
```bash
curl -X PUT "https://your-domain.com/api/groups/120363555666777888%40g.us/ephemeral" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "sessionId": "sales-01",
    "expiration": 604800
  }'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Disappearing messages enabled",
  "expiration": 604800,
  "expirationLabel": "7 days"
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
**Description**: Get a list of all scheduled messages for a specific session.

**Query Parameters**:
- `sessionId` (string, required): The ID of the session to list messages for.

**Request Example**:
```bash
curl -X GET "https://your-domain.com/api/scheduler?sessionId=sales-01" \
  -H "X-API-Key: your-api-key"
```

**Response (200 OK)**:
```json
[
  {
    "id": "cm5z...",
    "sessionId": "cm5y...",
    "jid": "628123456789@s.whatsapp.net",
    "content": "Reminder: Your appointment is tomorrow",
    "mediaUrl": null,
    "sendAt": "2024-01-18T10:00:00.000Z",
    "status": "PENDING",
    "createdAt": "2024-01-17T02:00:00.000Z",
    "updatedAt": "2024-01-17T02:00:00.000Z"
  }
]
```

---

### POST /api/scheduler
**Description**: Schedule a message (text or media) to be sent at a specific time in the future.

**Request Body**:
- `sessionId` (string, required): Session ID.
- `jid` (string, required): Recipient JID.
- `content` (string, required): Message text.
- `sendAt` (string, required): Time to send the message (format: "YYYY-MM-DDTHH:mm" for local time or ISO string).
- `mediaUrl` (string, optional): URL of the media file to send.

**Request Example**:
```bash
curl -X POST https://your-domain.com/api/scheduler \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "sessionId": "sales-01",
    "jid": "628123456789@s.whatsapp.net",
    "content": "Don't forget our meeting tomorrow!",
    "sendAt": "2024-01-18T09:00",
    "mediaUrl": "https://example.com/reminder.jpg"
  }'
```

**Response (200 OK)**:
```json
{
  "id": "cm5z...",
  "sessionId": "cm5y...",
  "jid": "628123456789@s.whatsapp.net",
  "content": "Don't forget our meeting tomorrow!",
  "mediaUrl": "https://example.com/reminder.jpg",
  "sendAt": "2024-01-18T02:00:00.000Z",
  "status": "PENDING",
  "createdAt": "2024-01-17T02:35:00.000Z",
  "updatedAt": "2024-01-17T02:35:00.000Z"
}
```

**Common Errors**:
- `400`: Missing required fields.
- `401`: Unauthorized.
- `403`: Forbidden (cannot access session).
- `404`: Session not found.
- `500`: Internal Server Error.

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
  "success": true
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
    "secret": "your-webhook-secret",
    "events": ["message.upsert", "message.delete"],
    "isActive": true,
    "sessionId": "session-db-id",
    "userId": "user123",
    "createdAt": "2024-01-15T10:00:00.000Z",
    "updatedAt": "2024-01-15T10:00:00.000Z"
  }
]
```

**Common Errors**:
- `401`: Unauthorized.
- `500`: Failed to fetch webhooks.

---

### POST /api/webhooks
**Description**: Create a new webhook.

**Request Body**:
- `name` (string, required): Webhook name
- `url` (string, required): Webhook URL
- `secret` (string, optional): Secret for signature verification
- `sessionId` (string, optional): Filter by session ID
- `events` (array, required): List of events to subscribe to

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
  "secret": null,
  "events": ["message.upsert"],
  "isActive": true,
  "sessionId": null,
  "userId": "user123",
  "createdAt": "2024-01-17T02:40:00.000Z",
  "updatedAt": "2024-01-17T02:40:00.000Z"
}
```

**Common Errors**:
- `400`: Missing required fields.
- `401`: Unauthorized.
- `404`: Session not found.
- `500`: Failed to create webhook.

---

### PATCH /api/webhooks/{id}
**Description**: Update webhook configuration.

**Path Parameters**:
- `id` (string, required): Webhook ID

**Request Body**:
- `name` (string, optional): Updated name
- `url` (string, optional): Updated URL
- `secret` (string, optional): Updated secret
- `sessionId` (string, optional): Associated session ID
- `events` (array, optional): Updated event list
- `isActive` (boolean, optional): Enable/disable webhook

**Request Example**:
```bash
curl -X PATCH https://your-domain.com/api/webhooks/webhook123 \
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
  "id": "webhook123",
  "name": "Updated CRM Integration",
  "url": "https://crm.example.com/webhook",
  "secret": "your-webhook-secret",
  "events": ["message.upsert", "message.delete"],
  "isActive": false,
  "sessionId": "sales-01",
  "userId": "user123",
  "createdAt": "2024-01-15T10:00:00.000Z",
  "updatedAt": "2024-01-17T03:00:00.000Z"
}
```

**Common Errors**:
- `400`: Invalid request body.
- `401`: Unauthorized.
- `404`: Webhook not found.
- `500`: Failed to update webhook.

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
  "message": "Label deleted successfully"
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
  "success": true,
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
  "message": "Labels added to chat",
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

### PATCH /api/users/{id}
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
curl -X PATCH https://your-domain.com/api/users/user123 \
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
    "email": "sales@example.com",
    "name": "Updated Sales Team",
    "role": "STAFF",
    "emailVerified": null,
    "image": null,
    "createdAt": "2024-01-05T00:00:00.000Z",
    "updatedAt": "2024-01-17T03:00:00.000Z"
  }
}
```

**Common Errors**:
- `400`: Invalid request body or ID.
- `401`: Unauthorized.
- `403`: Forbidden (SUPERADMIN only).
- `404`: User not found.
- `500`: Internal server error.

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

### GET /api/user/api-key
**Description**: Get the current user's API key.

**Request Example**:
```bash
curl -X GET https://your-domain.com/api/user/api-key
```

**Response (200 OK)**:
```json
{
  "apiKey": "ak_1234567890abcdef..."
}
```

---

### POST /api/user/api-key
**Description**: Generate a new API key for the current user. This will invalidate the previous key.

**Request Example**:
```bash
curl -X POST https://your-domain.com/api/user/api-key
```

**Response (200 OK)**:
```json
{
  "apiKey": "ak_new_key_..."
}
```

---

### DELETE /api/user/api-key
**Description**: Revoke the current user's API key.

**Request Example**:
```bash
curl -X DELETE https://your-domain.com/api/user/api-key
```

**Response (200 OK)**:
```json
{
  "success": true
}
```

---

## 🔔 Notifications

### GET /api/notifications
**Description**: Get a list of the last 50 notifications for the authenticated user.

**Request Example**:
```bash
curl -X GET https://your-domain.com/api/notifications \
  -H "X-API-Key: your-api-key"
```

**Response (200 OK)**:
```json
[
  {
    "id": "uuid-1",
    "userId": "user-123",
    "title": "New Message",
    "message": "You have a new message from 628123456789",
    "type": "INFO",
    "href": "/chat/628123456789",
    "read": false,
    "createdAt": "2024-01-17T10:00:00Z"
  }
]
```

---

### POST /api/notifications
**Description**: Create and send a notification. This endpoint is restricted to **SUPERADMIN** users only. Notifications can be sent to all users (broadcast) or a specific user.

**Request Body**:
- `title` (string, required): Notification title.
- `message` (string, required): Notification message body.
- `type` (string, optional): Notification type (e.g., "INFO", "SUCCESS", "WARNING", "ERROR"). Default: "INFO".
- `href` (string, optional): Link to redirect when clicked.
- `targetUserId` (string, optional): The ID of the specific user to notify.
- `broadcast` (boolean, optional): Set to `true` to send to all users.

**Request Example (Broadcast)**:
```bash
curl -X POST https://your-domain.com/api/notifications \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "System Maintenance",
    "message": "The system will be down for maintenance at 02:00 AM.",
    "broadcast": true,
    "type": "WARNING"
  }'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "count": 150
}
```

**Common Errors**:
- `400`: Invalid Request (missing targetUserId or broadcast=true).
- `401`: Unauthorized.
- `403`: Forbidden (Only Superadmin can send notifications).
- `500`: Error creating notification.

---

### DELETE /api/notifications/delete
**Description**: Delete a specific notification by its unique ID. Only notifications belonging to the authenticated user can be deleted.

**Query Parameters**:
- `id` (string, required): The unique identifier of the notification to delete.

**Request Example**:
```bash
curl -X DELETE "https://your-domain.com/api/notifications/delete?id=notification-uuid" \
  -H "X-API-Key: your-api-key"
```

**Response (200 OK)**:
```json
{
  "success": true
}
```

**Common Errors**:
- `400`: Notification ID required.
- `401`: Unauthorized.
- `500`: Error deleting notification.

---

### PATCH /api/notifications/read
**Description**: Mark one or more notifications as read. If no IDs are provided in the request body, all unread notifications for the user will be marked as read.

**Request Body**:
- `ids` (array of strings, optional): An array of notification IDs (UUIDs) to mark as read.

**Request Example (Specific Notifications)**:
```bash
curl -X PATCH https://your-domain.com/api/notifications/read \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "ids": ["uuid-1", "uuid-2"]
  }'
```

**Request Example (All Notifications)**:
```bash
curl -X PATCH https://your-domain.com/api/notifications/read \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{}'
```

**Response (200 OK)**:
```json
{
  "success": true
}
```

**Common Errors**:
- `401`: Unauthorized.
- `500`: Error updating notifications.

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

### POST /api/system/check-updates
**Description**: Check for new releases on GitHub and create a system notification if a newer version is available.

**Request Example**:
```bash
curl -X POST https://your-domain.com/api/system/check-updates \
  -H "X-API-Key: your-api-key"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Notification sent",
  "version": "v1.2.0"
}
```

**Common Errors**:
- `401`: Unauthorized.
- `500`: Error checking updates.

---

### POST /api/status/update
**Description**: Post a status update (story) to WhatsApp. Supports text, image, and video statuses.

**Request Body**:
- `sessionId` (string, required): Session ID.
- `content` (string, required): Text content for the status or caption for media.
- `type` (string, optional): Type of status: `TEXT` (default), `IMAGE`, or `VIDEO`.
- `mediaUrl` (string, optional): URL of the media (required for `IMAGE` and `VIDEO`).
- `backgroundColor` (number, optional): Background color ARGB for text status (e.g., `0xff123456`).
- `font` (number, optional): Font style index for text status.

**Request Example (Text Status)**:
```bash
curl -X POST https://your-domain.com/api/status/update \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "sessionId": "sales-01",
    "content": "Hello World!",
    "backgroundColor": 4278190080
  }'
```

**Response (200 OK)**:
```json
{
  "success": true
}
```

**Common Errors**:
- `400`: Missing required fields.
- `401`: Unauthorized.
- `403`: Forbidden.
- `404`: Session not found.
- `503`: Session not ready (not connected).
- `500`: Internal Server Error.

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

**Common Errors**:
- `400`: Missing `sessionId`, `jid`, or `contacts`.
- `401`: Unauthorized.
- `403`: Forbidden (cannot access session).
- `503`: Session not ready.
- `500`: Failed to send contact.


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

**Common Errors**:
- `400`: Missing required fields (`sessionId`, `jid`, `messageId`, `emoji`).
- `401`: Unauthorized.
- `403`: Forbidden (cannot access session).
- `503`: Session not ready.
- `500`: Failed to send reaction.

---

### POST /api/messages/list
**Description**: Send a formatted numbered list message. Baileys has limited support for interactive lists, so this sends a beautifully formatted text message.

**Request Body**:
- `sessionId` (string, required): Session ID
- `jid` (string, required): Recipient JID
- `title` (string, required): List title/header
- `options` (array of strings, required): List options
- `footer` (string, optional): Footer text

**Request Example**:
```bash
curl -X POST https://your-domain.com/api/messages/list \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "sessionId": "sales-01",
    "jid": "628123456789@s.whatsapp.net",
    "title": "Main Menu",
    "options": ["Check Balance", "Order History", "Talk to CS"],
    "footer": "Select an option by replying with the number"
  }'
```

**Response (200 OK)**:
```json
{
  "success": true
}
```

**Common Errors**:
- `400`: Missing fields or empty options.
- `401`: Unauthorized.
- `403`: Forbidden (cannot access session).
- `503`: Session not ready.
- `500`: Failed to send list message.

---

### POST /api/messages/spam
**Description**: Send a message multiple times in a row (message bombing). This operation runs in the background.

**Request Body**:
- `sessionId` (string, required): Session ID
- `jid` (string, required): Recipient JID
- `message` (string, required): Message text to spam
- `count` (number, optional): Number of messages to send (default: 10)
- `delay` (number, optional): Delay between messages in ms (default: 500)

**Request Example**:
```bash
curl -X POST https://your-domain.com/api/messages/spam \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "sessionId": "sales-01",
    "jid": "628123456789@s.whatsapp.net",
    "message": "🔥 Flash Sale Starting Now!",
    "count": 5,
    "delay": 1000
  }'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Bombing 5 messages started"
}
```

**Common Errors**:
- `400`: Missing required fields (`sessionId`, `jid`, `message`).
- `401`: Unauthorized.
- `403`: Forbidden (cannot access session).
- `503`: Session not ready.
- `500`: Failed to start spam.

---

### POST /api/messages/sticker
**Description**: Convert an image (static or animated) to a WhatsApp sticker and send it.

**Request (multipart/form-data)**:
- `sessionId` (string, required): Session ID
- `jid` (string, required): Recipient JID
- `file` (file, required): Image file to convert (PNG, JPG, WEBP, GIF)

**Request Example**:
```bash
curl -X POST https://your-domain.com/api/messages/sticker \
  -H "X-API-Key: your-api-key" \
  -F "sessionId=sales-01" \
  -F "jid=628123456789@s.whatsapp.net" \
  -F "file=@/path/to/your/image.png"
```

**Response (200 OK)**:
```json
{
  "success": true
}
```

**Common Errors**:
- `400`: Missing required fields (`sessionId`, `jid`, `file`).
- `401`: Unauthorized.
- `403`: Forbidden (cannot access session).
- `503`: Session not ready.
- `500`: Failed to create/send sticker.

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

**Common Errors**:
- `400`: Missing `sessionId`, `fromJid`, `messageId`, or `toJids`.
- `401`: Unauthorized.
- `403`: Forbidden (cannot access session).
- `503`: Session not ready.
- `500`: Failed to forward message.

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

---

### GET /api/chats/by-label/{labelId}
**Description**: Get all chats associated with a specific label.

**Path Parameters**:
- `labelId` (string): Label ID

**Response (200 OK)**:
```json
{
  "success": true,
  "label": {
    "id": "label123",
    "name": "Important",
    "colorHex": "#FF0000"
  },
  "chats": ["628123456789@s.whatsapp.net"],
  "count": 1
}
```

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

---

### POST /api/contacts/block
**Description**: Block a contact.

**Request Body**:
- `sessionId` (string, required)
- `jid` (string, required): Contact JID to block

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Contact blocked successfully"
}
```

---

### POST /api/contacts/unblock
**Description**: Unblock a contact.

**Request Body**:
- `sessionId` (string, required)
- `jid` (string, required): Contact JID to unblock

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Contact unblocked successfully"
}
```

---

## 👤 Profile

### PUT /api/profile/name
**Description**: Update the WhatsApp account's display name.

**Request Body**:
- `sessionId` (string, required): Session ID
- `name` (string, required): New display name (max 25 characters)

**Request Example**:
```bash
curl -X PUT https://your-domain.com/api/profile/name \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "sales-01",
    "name": "Alex (Sales Support)"
  }'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Profile name updated successfully",
  "name": "Alex (Sales Support)"
}
```

**Common Errors**:
- `400`: `sessionId` and `name` are required, or name exceeds 25 characters.
- `401`: Unauthorized.
- `403`: Forbidden (cannot access session).
- `503`: Session not ready.
- `500`: Failed to update profile name.

---

### PUT /api/profile/status
**Description**: Update the WhatsApp account's status/about message.

**Request Body**:
- `sessionId` (string, required): Session ID
- `status` (string, required): New status message (max 139 characters)

**Request Example**:
```bash
curl -X PUT https://your-domain.com/api/profile/status \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "sales-01",
    "status": "Available | Support Agent"
  }'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Profile status updated successfully",
  "status": "Available | Support Agent"
}
```

**Common Errors**:
- `400`: `sessionId` and `status` are required, or status exceeds 139 characters.
- `401`: Unauthorized.
- `403`: Forbidden (cannot access session).
- `503`: Session not ready.
- `500`: Failed to update profile status.

---

### PUT /api/profile/picture
**Description**: Update the WhatsApp account's profile picture.

**Request (multipart/form-data)**:
- `sessionId` (string, required): Session ID
- `file` (file, required): Image file (JPG/PNG)

**Request Example**:
```bash
curl -X PUT https://your-domain.com/api/profile/picture \
  -H "X-API-Key: your-api-key" \
  -F "sessionId=sales-01" \
  -F "file=@/path/to/image.jpg"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Profile picture updated successfully"
}
```

**Common Errors**:
- `400`: `sessionId` and `file` are required.
- `401`: Unauthorized.
- `403`: Forbidden (cannot access session).
- `503`: Session not ready.
- `500`: Failed to update profile picture.

---

### DELETE /api/profile/picture
**Description**: Remove the current WhatsApp profile picture.

**Query Parameters**:
- `sessionId` (string, required): Session ID

**Request Example**:
```bash
curl -X DELETE "https://your-domain.com/api/profile/picture?sessionId=sales-01" \
  -H "X-API-Key: your-api-key"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Profile picture removed successfully"
}
```

**Common Errors**:
- `400`: `sessionId` is required.
- `401`: Unauthorized.
- `403`: Forbidden (cannot access session).
- `503`: Session not ready.
- `500`: Failed to remove profile picture.

---

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
curl -X GET https://your-domain.com/api/users \
  -H "X-API-Key: your-api-key"
```

**Response (200 OK)**:
```json
[
  {
    "id": "user123",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "SUPERADMIN",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "_count": {
      "sessions": 3
    }
  },
  {
    "id": "user456",
    "name": "Sales Team",
    "email": "sales@example.com",
    "role": "OWNER",
    "createdAt": "2024-01-05T00:00:00.000Z",
    "_count": {
      "sessions": 2
    }
  }
]
```

**Common Errors**:
- `401`: Unauthorized.
- `403`: Forbidden (SUPERADMIN only).
- `500`: Failed to fetch users.

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
curl -X POST https://your-domain.com/api/users \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
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
  "createdAt": "2024-01-17T02:30:00.000Z"
}
```

**Common Errors**:
- `400`: Invalid request body or email already exists.
- `401`: Unauthorized.
- `403`: Forbidden (SUPERADMIN only).
- `500`: Failed to create user.

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
