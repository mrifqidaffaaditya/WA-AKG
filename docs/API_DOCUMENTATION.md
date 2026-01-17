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

### GET /api/sessions/{id}
**Description**: Get detailed information about a specific session, including real-time status and uptime.

**Path Parameters**:
- `id` (string): The unique session ID (e.g., "sales-01")

**Request Example**:
```bash
curl -X GET https://your-domain.com/api/sessions/sales-01 \
  -H "X-API-Key: your-api-key"
```

**Response (200 OK)**:
```json
{
  "id": "clx123abc",
  "name": "Sales Bot",
  "sessionId": "sales-01",
  "status": "CONNECTED",
  "userId": "user123",
  "uptime": 3600, // seconds
  "hasInstance": true,
  "me": {
      "id": "628123456789:1@s.whatsapp.net",
      "name": "My Business"
  },
  "createdAt": "2024-01-15T10:30:00Z"
}
```

---

### POST /api/sessions/{id}/{action}
**Description**: Perform an action on a session (start, stop, restart, logout).

**Path Parameters**:
- `id` (string): The unique session ID (e.g., "sales-01")
- `action` (string): The action to perform. Valid values: `start`, `stop`, `restart`, `logout`.

**Request Example**:
```bash
curl -X POST https://your-domain.com/api/sessions/sales-01/restart \
  -H "X-API-Key: your-api-key"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Session restarted successfully"
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

### POST /api/chat/{sessionId}/send
**Description**: Send text, media, or sticker messages.

**Path Parameters**:
- `sessionId` (string, required): Session identifier (e.g., "sales-01")

**Request Body (Text Message)**:
```json
{
  "jid": "628123456789@s.whatsapp.net",
  "message": {
    "text": "Hello! Welcome to our store."
  },
  "mentions": ["628123456789@s.whatsapp.net"]
}
```

**Request Body (Image with Caption)**:
```json
{
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
curl -X POST https://your-domain.com/api/chat/sales-01/send \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
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

### POST /api/chat/send (DEPRECATED)
> **⚠️ DEPRECATED**: This endpoint is deprecated. Use `POST /api/chat/{sessionId}/send` instead. This endpoint will be removed in a future version.

**Description**: Send text, media, or sticker messages.

**Request Body (Text Message)**:
```json
{
  "sessionId": "sales-01",
  "jid": "628123456789@s.whatsapp.net",
  "message": {
    "text": "Hello! Welcome to our store."
  },
  "mentions": ["628123456789@s.whatsapp.net"]
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

### POST /api/messages/{sessionId}/{jid}/poll
**Description**: Send a poll message.

**Path Parameters**:
- `sessionId` (string, required): Session ID
- `jid` (string, required): Recipient JID (URL-encoded)

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| question | string | Yes | Poll question |
| options | string[] | Yes | 2-12 options |
| selectableCount | number | No | Default 1 |

**Request Example**:
```bash
curl -X POST https://your-domain.com/api/messages/sales-01/120363123456789012%40g.us/poll \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
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
- `400`: Missing required fields or invalid options count.
- `401`: Unauthorized.
- `403`: Forbidden.
- `500`: Failed to send poll.

---

### POST /api/messages/poll (DEPRECATED)
> **⚠️ DEPRECATED**: This endpoint is deprecated. Use `POST /api/messages/{sessionId}/{jid}/poll` instead. This endpoint will be removed in a future version.

**Description**: Send a poll message.

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| sessionId | string | Yes | Session ID |
| jid | string | Yes | Recipient JID |
| question | string | Yes | Poll question |
| options | string[] | Yes | 2-12 options |
| selectableCount | number | No | Default 1 |

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

### POST /api/messages/{sessionId}/{jid}/location
**Description**: Send a location message.

**Path Parameters**:
- `sessionId` (string, required): Session ID
- `jid` (string, required): Recipient JID (URL-encoded)

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| latitude | number | Yes | Latitude (-90 to 90) |
| longitude | number | Yes | Longitude (-180 to 180) |
| name | string | No | Location name |
| address | string | No | Location address |

**Request Example**:
```bash
curl -X POST https://your-domain.com/api/messages/sales-01/628123456789%40s.whatsapp.net/location \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
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
- `403`: Forbidden.
- `500`: Failed to send location.

---

### POST /api/messages/location (DEPRECATED)
> **⚠️ DEPRECATED**: This endpoint is deprecated. Use `POST /api/messages/{sessionId}/{jid}/location` instead. This endpoint will be removed in a future version.

**Description**: Send a location message.

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| sessionId | string | Yes | Session ID |
| jid | string | Yes | Recipient JID |
| latitude | number | Yes | Latitude (-90 to 90) |
| longitude | number | Yes | Longitude (-180 to 180) |
| name | string | No | Location name |
| address | string | No | Location address |

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

### POST /api/messages/{sessionId}/broadcast
**Description**: Send a message to multiple recipients.

**Path Parameters**:
- `sessionId` (string, required): Session identifier

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| recipients | string[] | Yes | List of recipient JIDs |
| message | string | Yes | Message text to broadcast |

**Request Example**:
```bash
curl -X POST https://your-domain.com/api/messages/sales-01/broadcast \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
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
- `400`: Invalid request body.
- `401`: Unauthorized.
- `403`: Forbidden.
- `503`: Session not ready.
- `500`: Failed to start broadcast.

---

### POST /api/messages/broadcast (DEPRECATED)
> **⚠️ DEPRECATED**: This endpoint is deprecated. Use `POST /api/messages/{sessionId}/broadcast` instead. This endpoint will be removed in a future version.

**Description**: Send a message to multiple recipients.

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| sessionId | string | Yes | Session ID |
| recipients | string[] | Yes | List of recipient JIDs |
| message | string | Yes | Message text to broadcast |

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

### GET /api/messages/{sessionId}/download/{messageId}/media
**Description**: Download media (image, video, audio, or document) from a message by its ID.

**Path Parameters**:
- `sessionId` (string, required): Session identifier.
- `messageId` (string, required): The unique ID of the message.

**Request Example**:
```bash
curl -X GET "https://your-domain.com/api/messages/sales-01/download/3EB0ABCD1234567890/media" \
  -H "X-API-Key: your-api-key"
```

**Response**:
Returns the binary media file with appropriate `Content-Type` and `Content-Disposition` headers.

**Common Errors**:
- `401`: Unauthorized.
- `403`: Forbidden.
- `404`: Message not found or has no media.

---

### GET /api/messages/{id}/media (DEPRECATED)
> **⚠️ DEPRECATED**: This endpoint is deprecated. Use `GET /api/messages/{sessionId}/download/{messageId}/media` instead. This endpoint will be removed in a future version.

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

### DELETE /api/messages/{sessionId}/{jid}/{messageId}
**Description**: Delete a message for everyone.

**Path Parameters**:
- `sessionId` (string, required): Session identifier
- `jid` (string, required): Recipient JID (URL-encoded)
- `messageId` (string, required): Message ID

**Request Example**:
```bash
curl -X DELETE https://your-domain.com/api/messages/sales-01/628123456789%40s.whatsapp.net/3EB0ABCD1234567890 \
  -H "X-API-Key: your-api-key"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Message deleted for everyone"
}
```

**Common Errors**:
- `401`: Unauthorized.
- `403`: Forbidden.
- `500`: Failed to delete message.

---

### DELETE /api/messages/delete (DEPRECATED)
> **⚠️ DEPRECATED**: This endpoint is deprecated. Use `DELETE /api/messages/{sessionId}/{jid}/{messageId}` instead. This endpoint will be removed in a future version.

**Description**: Delete a message for everyone.

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| sessionId | string | Yes | Session identifier |
| jid | string | Yes | Recipient JID |
| messageId | string | Yes | Message ID |

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

### POST /api/chat/{sessionId}/check
**Description**: Check if phone numbers are registered on WhatsApp (max 50 numbers per request).

**Path Parameters**:
- `sessionId` (string, required): Session identifier

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| numbers | string[] | Yes | Array of phone numbers (max 50) |

**Request Example**:
```bash
curl -X POST https://your-domain.com/api/chat/sales-01/check \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "numbers": ["628123456789", "628987654321"]
  }'
```

**Common Errors**:
- `400`: Missing numbers or exceeds limit (max 50).
- `401`: Unauthorized.
- `403`: Forbidden.
- `500`: Failed to check numbers.

---

### POST /api/chat/check (DEPRECATED)
> **⚠️ DEPRECATED**: This endpoint is deprecated. Use `POST /api/chat/{sessionId}/check` instead. This endpoint will be removed in a future version.

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

### PUT /api/chat/{sessionId}/{jid}/archive
**Description**: Archive or unarchive a chat.

**Path Parameters**:
- `sessionId` (string, required): Session identifier (e.g., "sales-01")
- `jid` (string, required): WhatsApp JID (URL-encoded, e.g., "628123456789@s.whatsapp.net")

**Request Body**:
```json
{
  "archive": true
}
```

**Request Example**:
```bash
curl -X PUT https://your-domain.com/api/chat/sales-01/628123456789%40s.whatsapp.net/archive \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "archive": true
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
- `403`: Forbidden (cannot access session).
- `503`: Session not ready.
- `500`: Failed to archive/unarchive chat.

---

### PUT /api/chat/archive (DEPRECATED)
> **⚠️ DEPRECATED**: This endpoint is deprecated. Use `PUT /api/chat/{sessionId}/{jid}/archive` instead. This endpoint will be removed in a future version.

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

### POST /api/chat/{sessionId}/{jid}/presence
**Description**: Send presence status (typing, recording, online, etc.) to a chat.

**Path Parameters**:
- `sessionId` (string, required): Session identifier
- `jid` (string, required): Chat JID (URL-encoded)

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| presence | string | Yes | composing, recording, paused, available, unavailable |

**Request Example**:
```bash
curl -X POST https://your-domain.com/api/chat/sales-01/628123456789%40s.whatsapp.net/presence \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
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

**Common Errors**:
- `400`: Missing required fields or invalid presence value.
- `401`: Unauthorized.
- `403`: Forbidden (cannot access session).
- `503`: Session not ready.
- `500`: Failed to send presence.

---

### POST /api/chat/presence (DEPRECATED)
> **⚠️ DEPRECATED**: This endpoint is deprecated. Use `POST /api/chat/{sessionId}/{jid}/presence` instead. This endpoint will be removed in a future version.

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

### POST /api/chat/{sessionId}/{jid}/profile-picture
**Description**: Get profile picture URL for a contact or group.

**Path Parameters**:
- `sessionId` (string, required): Session identifier
- `jid` (string, required): Contact or group JID (URL-encoded)

**Request Example**:
```bash
curl -X POST https://your-domain.com/api/chat/sales-01/628123456789%40s.whatsapp.net/profile-picture \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "jid": "628123456789@s.whatsapp.net",
  "profilePicUrl": "https://pps.whatsapp.net/..."
}
```

**Common Errors**:
- `401`: Unauthorized.
- `403`: Forbidden (cannot access session).
- `503`: Session not ready.
- `500`: Failed to fetch profile picture.

---

### POST /api/chat/profile-picture (DEPRECATED)
> **⚠️ DEPRECATED**: This endpoint is deprecated. Use `POST /api/chat/{sessionId}/{jid}/profile-picture` instead. This endpoint will be removed in a future version.

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

### GET /api/groups/{sessionId}
**Description**: List all groups for a session.

**Path Parameters**:
- `sessionId` (string, required): Session ID

**Request Example**:
```bash
curl -X GET "https://your-domain.com/api/groups/sales-01" \
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
  }
]
```

**Common Errors**:
- `401`: Unauthorized.
- `403`: Forbidden.
- `404`: Session not found.
- `500`: Failed to fetch groups.

---

### GET /api/groups (DEPRECATED)
> **⚠️ DEPRECATED**: This endpoint is deprecated. Use `GET /api/groups/{sessionId}` instead. This endpoint will be removed in a future version.

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

### GET /api/groups/{sessionId}/{jid}
**Description**: Get detailed information about a group (metadata, participants, picture).

**Path Parameters**:
- `sessionId` (string, required): Session ID
- `jid` (string): Group JID (e.g. `123456@g.us`) - URL-encoded

**Request Example**:
```bash
curl -X GET "https://your-domain.com/api/groups/sales-01/120363123456789012%40g.us" \
  -H "X-API-Key: your-api-key"
```

**Response (200 OK)**:
```json
{
  "id": "120363123456789012@g.us",
  "subject": "Sales Team",
  ...
}
```

**Common Errors**:
- `401`: Unauthorized.
- `403`: Forbidden.
- `404`: Group not found.
- `500`: Failed to fetch details.

---

### GET /api/groups/{jid} (DEPRECATED)
> **⚠️ DEPRECATED**: This endpoint is deprecated. Use `GET /api/groups/{sessionId}/{jid}` instead. This endpoint will be removed in a future version.

**Description**: Get detailed information about a group.

**Path Parameters**:
- `jid` (string): Group JID (e.g. `123456@g.us`)

**Query Parameters**:
- `sessionId` (string, required): Session ID

**Request Example**:
```bash
curl -X GET "https://your-domain.com/api/groups/120363123456789012%40g.us?sessionId=sales-01" \
  -H "X-API-Key: your-api-key"
```

**Response (200 OK)**:
```json
{
  "id": "120363123456789012@g.us",
  "subject": "Sales Team",
  "subjectOwner": "628123456789@s.whatsapp.net",
  "subjectTime": 1704067200,
  "size": 15,
  "creation": 1704067200,
  "owner": "628123456789@s.whatsapp.net",
  "desc": "Official Sales Team Group",
  "descId": "3EB0...",
  "restrict": false,
  "announce": true,
  "participants": [
      {
          "id": "628123456789@s.whatsapp.net",
          "admin": "admin"
      },
      {
          "id": "628987654321@s.whatsapp.net",
          "admin": null
      }
  ],
  "ephemeralDuration": 0,
  "inviteCode": "AbCdEf...",
  "pictureUrl": "https://pps.whatsapp.net/..."
}
```

---

### POST /api/groups/{sessionId}/create
**Description**: Create a new group.

**Path Parameters**:
- `sessionId` (string, required): Session ID

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| subject | string | Yes | Group name (max 100 chars) |
| participants | string[] | Yes | Array of participant JIDs |

**Request Example**:
```bash
curl -X POST https://your-domain.com/api/groups/sales-01/create \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "subject": "VIP Customers",
    "participants": ["628123456789@s.whatsapp.net", "628987654321@s.whatsapp.net"]
  }'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "group": {
    "id": "120363155555555555@g.us",
    "subject": "VIP Customers",
    "description": null,
    "creation": 1704200000,
    "owner": "62812000000000@s.whatsapp.net",
    "participants": [...]
  }
}
```

**Common Errors**:
- `400`: Invalid input (e.g., subject too long, no participants).
- `401`: Unauthorized.
- `403`: Forbidden.
- `500`: Failed to create group.

---

### POST /api/groups/create (DEPRECATED)
> **⚠️ DEPRECATED**: This endpoint is deprecated. Use `POST /api/groups/{sessionId}/create` instead. This endpoint will be removed in a future version.

**Description**: Create a new group.

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| sessionId | string | Yes | Session ID |
| subject | string | Yes | Group name |
| participants | string[] | Yes | Array of participant JIDs |

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

### PUT /api/groups/{sessionId}/{jid}/members
**Description**: Add, remove, promote, or demote group participants.

**Path Parameters**:
- `sessionId` (string, required): Session ID
- `jid` (string): Group JID (URL-encoded)

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| action | string | Yes | `add`, `remove`, `promote`, `demote` |
| participants | string[] | Yes | List of participant JIDs |

**Request Example**:
```bash
curl -X PUT "https://your-domain.com/api/groups/sales-01/120363555666777888%40g.us/members" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
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

**Common Errors**:
- `400`: Invalid action or participants.
- `403`: Bot not admin.
- `500`: Failed to update members.

---

### PUT /api/groups/{jid}/members (DEPRECATED)
> **⚠️ DEPRECATED**: This endpoint is deprecated. Use `PUT /api/groups/{sessionId}/{jid}/members` instead. This endpoint will be removed in a future version.

**Description**: Add, remove, promote, or demote group participants.

**Path Parameters**:
- `jid` (string): Group JID (URL-encoded)

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| sessionId | string | Yes | Session ID |
| action | string | Yes | Action type |
| participants | string[] | Yes | List of JIDs |

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

### PUT /api/groups/{sessionId}/{jid}/subject
**Description**: Update group name/subject.

**Path Parameters**:
- `sessionId` (string, required): Session ID
- `jid` (string): Group JID (URL-encoded)

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| subject | string | Yes | New group subject (max 100 characters) |

**Request Example**:
```bash
curl -X PUT "https://your-domain.com/api/groups/sales-01/120363555666777888%40g.us/subject" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
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
- `400`: Missing `subject`, or subject > 100 chars.
- `401`: Unauthorized.
- `403`: Bot not admin or forbidden.
- `503`: Session not ready.

---

### PUT /api/groups/{jid}/subject (DEPRECATED)
> **⚠️ DEPRECATED**: This endpoint is deprecated. Use `PUT /api/groups/{sessionId}/{jid}/subject` instead. This endpoint will be removed in a future version.

**Description**: Update group name/subject.

**Path Parameters**:
- `jid` (string): Group JID (URL-encoded)

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| sessionId | string | Yes | Session ID |
| subject | string | Yes | New group subject |

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

### GET /api/groups/{sessionId}/{jid}/invite
**Description**: Get group invite code.

**Path Parameters**:
- `sessionId` (string, required): Session ID
- `jid` (string): Group JID (URL-encoded)

**Request Example**:
```bash
curl -X GET "https://your-domain.com/api/groups/sales-01/120363555666777888%40g.us/invite" \
  -H "X-API-Key: your-api-key"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "inviteCode": "AbCdEfGhIjKlMnOp",
  "inviteUrl": "https://chat.whatsapp.com/AbCdEfGhIjKlMnOp"
}
```

---

### PUT /api/groups/{sessionId}/{jid}/invite
**Description**: Revoke and refresh group invite code.

**Path Parameters**:
- `sessionId` (string, required): Session ID
- `jid` (string): Group JID (URL-encoded)

**Request Example**:
```bash
curl -X PUT "https://your-domain.com/api/groups/sales-01/120363555666777888%40g.us/invite" \
  -H "X-API-Key: your-api-key"
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

### GET /api/groups/{jid}/invite (DEPRECATED)
> **⚠️ DEPRECATED**: This endpoint is deprecated. Use `GET /api/groups/{sessionId}/{jid}/invite` instead.

**Description**: Get group invite code.

**Query Parameters**:
- `sessionId` (string, required): Session ID

**Request Example**:
```bash
curl -X GET "https://your-domain.com/api/groups/120363555666777888%40g.us/invite?sessionId=sales-01" \
  -H "X-API-Key: your-api-key"
```

---

### PUT /api/groups/{jid}/invite (DEPRECATED)
> **⚠️ DEPRECATED**: This endpoint is deprecated. Use `PUT /api/groups/{sessionId}/{jid}/invite` instead.

**Description**: Revoke group invite code.

**Request Body**:
- `sessionId` (string, required): Session ID

**Request Example**:
```bash
curl -X PUT "https://your-domain.com/api/groups/120363555666777888%40g.us/invite" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"sessionId": "sales-01"}'
```

---

---

### POST /api/groups/{sessionId}/invite/accept
**Description**: Accept a group invite code.

**Path Parameters**:
- `sessionId` (string, required): Session ID

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| inviteCode | string | Yes | The invite code |

**Request Example**:
```bash
curl -X POST https://your-domain.com/api/groups/sales-01/invite/accept \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "inviteCode": "A1b2C3d4E5f6G7h8I9j0K"
  }'
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Group invite accepted successfully",
  "groupJid": "120363000000000000@g.us"
}
```

**Common Errors**:
- `400`: Invalid or expired invite code.
- `401`: Unauthorized.
- `403`: Forbidden.
- `500`: Failed to accept invite.

---

### POST /api/groups/invite/accept (DEPRECATED)
> **⚠️ DEPRECATED**: This endpoint is deprecated. Use `POST /api/groups/{sessionId}/invite/accept` instead. This endpoint will be removed in a future version.

**Description**: Accept a group invite code.

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| sessionId | string | Yes | Session ID |
| inviteCode | string | Yes | The invite code |

**Request Example**:
```bash
curl -X POST https://your-domain.com/api/groups/invite/accept \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "sessionId": "sales-01",
    "inviteCode": "A1b2C3d4E5f6G7h8I9j0K"
  }'
```

---

### POST /api/groups/{sessionId}/{jid}/leave
**Description**: Leave a group.

**Path Parameters**:
- `sessionId` (string, required): Session ID
- `jid` (string): Group JID (URL-encoded)

**Request Example**:
```bash
curl -X POST "https://your-domain.com/api/groups/sales-01/120363555666777888%40g.us/leave" \
  -H "X-API-Key: your-api-key"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Successfully left the group"
}
```

**Common Errors**:
- `401`: Unauthorized.
- `403`: Forbidden.
- `500`: Failed to leave.

---

### POST /api/groups/{jid}/leave (DEPRECATED)
> **⚠️ DEPRECATED**: This endpoint is deprecated. Use `POST /api/groups/{sessionId}/{jid}/leave` instead. This endpoint will be removed in a future version.

**Description**: Leave a group.

**Path Parameters**:
- `jid` (string): Group JID (URL-encoded)

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| sessionId | string | Yes | Session ID |

**Request Example**:
```bash
curl -X POST "https://your-domain.com/api/groups/120363555666777888%40g.us/leave" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{"sessionId": "sales-01"}'
```

---

---

### PUT /api/groups/{sessionId}/{jid}/description
**Description**: Update group description.

**Path Parameters**:
- `sessionId` (string, required): Session ID
- `jid` (string): Group JID (URL-encoded)

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| description | string | No | New description (max 512 chars) |

**Request Example**:
```bash
curl -X PUT "https://your-domain.com/api/groups/sales-01/120363555666777888%40g.us/description" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
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

**Common Errors**:
- `400`: Invalid input.
- `403`: Bot not admin.
- `500`: Failed to update.

---

### PUT /api/groups/{jid}/description (DEPRECATED)
> **⚠️ DEPRECATED**: This endpoint is deprecated. Use `PUT /api/groups/{sessionId}/{jid}/description` instead. This endpoint will be removed in a future version.

**Description**: Update group description.

**Path Parameters**:
- `jid` (string): Group JID (URL-encoded)

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| sessionId | string | Yes | Session ID |
| description | string | No | New description |

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

### PUT /api/groups/{sessionId}/{jid}/picture
**Description**: Update group profile picture.

**Path Parameters**:
- `sessionId` (string, required): Session ID
- `jid` (string): Group JID (URL-encoded)

**Request Body (multipart/form-data)**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | file | Yes | Image file (JPG/PNG) |

**Request Example**:
```bash
curl -X PUT "https://your-domain.com/api/groups/sales-01/120363555666777888%40g.us/picture" \
  -H "X-API-Key: your-api-key" \
  -F "file=@image.jpg"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Group picture updated successfully"
}
```

---

### DELETE /api/groups/{sessionId}/{jid}/picture
**Description**: Remove group profile picture.

**Path Parameters**:
- `sessionId` (string, required): Session ID
- `jid` (string): Group JID (URL-encoded)

**Request Example**:
```bash
curl -X DELETE "https://your-domain.com/api/groups/sales-01/120363555666777888%40g.us/picture" \
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

### PUT /api/groups/{jid}/picture (DEPRECATED)
> **⚠️ DEPRECATED**: This endpoint is deprecated. Use `PUT /api/groups/{sessionId}/{jid}/picture` instead. This endpoint will be removed in a future version.

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

### DELETE /api/groups/{jid}/picture (DEPRECATED)
> **⚠️ DEPRECATED**: This endpoint is deprecated. Use `DELETE /api/groups/{sessionId}/{jid}/picture` instead. This endpoint will be removed in a future version.

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

### PUT /api/groups/{sessionId}/{jid}/settings
**Description**: Update group settings (who can send messages, edit info).

**Path Parameters**:
- `sessionId` (string, required): Session ID
- `jid` (string): Group JID (URL-encoded)

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| setting | string | Yes | `announcement`, `not_announcement`, `locked`, `unlocked` |
| value | boolean | No | Ignored (legacy) |

**Request Example**:
```bash
curl -X PUT "https://your-domain.com/api/groups/sales-01/120363555666777888%40g.us/settings" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "setting": "announcement"
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

**Common Errors**:
- `400`: Invalid setting.
- `403`: Bot not admin.
- `500`: Failed to update.

---

### PUT /api/groups/{jid}/settings (DEPRECATED)
> **⚠️ DEPRECATED**: This endpoint is deprecated. Use `PUT /api/groups/{sessionId}/{jid}/settings` instead. This endpoint will be removed in a future version.

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

### PUT /api/groups/{sessionId}/{jid}/ephemeral
**Description**: Toggle disappearing messages.

**Path Parameters**:
- `sessionId` (string, required): Session ID
- `jid` (string): Group JID (URL-encoded)

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| expiration | number | Yes | 0 (off), 86400 (24h), 604800 (7d), 7776000 (90d) |

**Request Example**:
```bash
curl -X PUT "https://your-domain.com/api/groups/sales-01/120363555666777888%40g.us/ephemeral" \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
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

**Common Errors**:
- `400`: Invalid expiration.
- `403`: Bot not admin.
- `500`: Failed to toggle.

---

### PUT /api/groups/{jid}/ephemeral (DEPRECATED)
> **⚠️ DEPRECATED**: This endpoint is deprecated. Use `PUT /api/groups/{sessionId}/{jid}/ephemeral` instead. This endpoint will be removed in a future version.

**Description**: Toggle disappearing messages.

**Path Parameters**:
- `jid` (string): Group JID (URL-encoded)

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| sessionId | string | Yes | Session ID |
| expiration | number | Yes | Expiration time |

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

### GET /api/autoreplies/{sessionId}
**Description**: List all auto-reply rules for a session.

**Path Parameters**:
- `sessionId` (string, required): Session ID

**Request Example**:
```bash
curl -X GET https://your-domain.com/api/autoreplies/sales-01 \
  -H "X-API-Key: your-api-key"
```

---

### POST /api/autoreplies/{sessionId}
**Description**: Create a new auto-reply rule.

**Path Parameters**:
- `sessionId` (string, required): Session ID

**Request Body**:
- `keyword` (string, required): Trigger keyword
- `response` (string, required): Reply message
- `matchType` (string, optional): EXACT, CONTAINS, or STARTS_WITH

**Request Example**:
```bash
curl -X POST https://your-domain.com/api/autoreplies/sales-01 \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{ "keyword": "hello", "response": "Hi there!", "matchType": "EXACT" }'
```

---

### DELETE /api/autoreplies/{sessionId}/{replyId}
**Description**: Delete an auto-reply rule.

**Path Parameters**:
- `sessionId` (string, required): Session ID
- `replyId` (string, required): Reply ID

**Request Example**:
```bash
curl -X DELETE https://your-domain.com/api/autoreplies/sales-01/reply123 \
  -H "X-API-Key: your-api-key"
```

---

### GET /api/autoreplies (DEPRECATED)
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

### GET /api/scheduler/{sessionId}
**Description**: List all scheduled messages for a session.

**Path Parameters**:
- `sessionId` (string, required): Session ID

**Request Example**:
```bash
curl -X GET https://your-domain.com/api/scheduler/sales-01 \
  -H "X-API-Key: your-api-key"
```

---

### POST /api/scheduler/{sessionId}
**Description**: Create a new scheduled message.

**Path Parameters**:
- `sessionId` (string, required): Session ID

**Request Body**:
- `jid` (string, required): Recipient JID
- `content` (string, required): Message content
- `sendAt` (string, required): Send time (ISO format)
- `mediaUrl` (string, optional): Media URL

**Request Example**:
```bash
curl -X POST https://your-domain.com/api/scheduler/sales-01 \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{ "jid": "628123456789@s.whatsapp.net", "content": "Reminder!", "sendAt": "2024-12-25T10:00:00" }'
```

---

### DELETE /api/scheduler/{sessionId}/{scheduleId}
**Description**: Delete a scheduled message.

**Path Parameters**:
- `sessionId` (string, required): Session ID
- `scheduleId` (string, required): Schedule ID

**Request Example**:
```bash
curl -X DELETE https://your-domain.com/api/scheduler/sales-01/sched123 \
  -H "X-API-Key: your-api-key"
```

---

### GET /api/scheduler (DEPRECATED)
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

### 📦 Webhook Payload Anatomy

When an event occurs, WA-AKG sends a POST request to your configured URL. The payload structure is consistent across all events.

#### 🔐 Security (Signature Verification)
If you configured a `secret`, each request includes an `X-Hub-Signature-256` header.
```javascript
const crypto = require('crypto');
const hmac = crypto.createHmac('sha256', YOUR_WEBHOOK_SECRET);
const digest = hmac.update(JSON.stringify(requestBody)).digest('hex');
const isValid = request.headers['x-hub-signature-256'] === digest;
```

#### 📝 Event: `message.upsert` (Complex Reply Example)
Triggered when a new message is received or sent. This example demonstrates a text reply to an image message, showcasing LID info and nested quoted data.

```json
{
  "event": "message.received",
  "sessionId": "xgj7d9",
  "timestamp": "2026-01-17T05:33:08.545Z",
  "data": {
    "key": {
      "id": "3EB0B78DEA13E7ACC4D167",
      "remoteJid": "6287748687946@s.whatsapp.net",
      "fromMe": false
    },
    "pushName": "Adit",
    "messageTimestamp": 1768627988,
    "from": "6287748687946@s.whatsapp.net",
    "sender": "100429287395370@lid",
    "remoteJidAlt": "100429287395370@lid",
    "isGroup": false,
    "type": "TEXT",
    "content": "saya sedang reply",
    "fileUrl": null,
    "quoted": {
      "key": {
        "remoteJid": null,
        "participant": "6285134586690@s.whatsapp.net",
        "fromMe": false,
        "id": "A54FD0B6F9E9AF237C09899284D90586"
      },
      "type": "IMAGE",
      "content": "Ini caption dari reply",
      "caption": "Ini caption dari reply",
      "fileUrl": "/media/xgj7d9-A54FD0B6F9E9AF237C09899284D90586.jpeg"
    }
  }
}
```

> [!NOTE]
> - `sender`: The primary identifier for the sender (often a `.lid` for newer WhatsApp versions).
> - `remoteJidAlt`: Alternative JID often used for routing or identification.
> - `quoted`: Contains full context if the message is a reply, including media references.

#### 🚪 Event: `connection.update`
Triggered when the session status changes.

```json
{
  "event": "connection.update",
  "sessionId": "marketing-01",
  "data": {
    "status": "Connected",
    "qr": null,
    "isOnline": true
  }
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

### POST /api/status/{sessionId}/update

> [!WARNING]
> **EXPERIMENTAL FEATURE**
> 
> This endpoint may have reliability issues with text status background colors and media uploads.

**Description**: Post a status update (story) to WhatsApp.

**Path Parameters**:
- `sessionId` (string, required): Session ID

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| content | string | Yes | Status text or caption |
| type | string | No | TEXT, IMAGE, or VIDEO (default: TEXT) |
| mediaUrl | string | No | Required for IMAGE/VIDEO |
| backgroundColor | integer | No | ARGB color for text status |
| font | integer | No | Font style |
| mentions | string[] | No | JIDs to mention |

**Request Example**:
```bash
curl -X POST https://your-domain.com/api/status/sales-01/update \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{ "content": "Hello World!", "type": "TEXT" }'
```

**Response (200 OK)**:
```json
{ "success": true, "id": "ABCD1234" }
```

---

### POST /api/status/update (DEPRECATED)

> [!WARNING]
> **EXPERIMENTAL FEATURE - KNOWN ISSUES**
> 
> This endpoint is currently experiencing reliability issues and may not function as expected:
> - Text statuses with background colors may not display correctly
> - Media statuses (images/videos) may fail to upload
> - The feature is under active development and fixes are in progress
> 
> **We recommend avoiding this endpoint in production** until these issues are resolved.

**Description**: Post a status update (story) to WhatsApp. Supports text, image, and video statuses.

**Request Body**:
- `sessionId` (string, required): Session ID.
- `content` (string, required): Text content for the status or caption for media.
- `type` (string, optional): Type of status: `TEXT` (default), `IMAGE`, or `VIDEO`.
- `mediaUrl` (string, optional): URL of the media (required for `IMAGE` and `VIDEO`).
- `backgroundColor` (number, optional): Background color ARGB for text status (e.g., `0xff123456`).
- `font` (number, optional): Font style index for text status.
- `mentions` (array of strings, optional): List of JIDs to mention in the status.

**Request Example (Text Status)**:
```bash
curl -X POST https://your-domain.com/api/status/update \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
    "sessionId": "sales-01",
    "content": "Hello World!",
    "backgroundColor": 4278190080,
    "mentions": ["628123456789@s.whatsapp.net"]
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

### PUT /api/chat/{sessionId}/{jid}/read
**Description**: Mark messages or entire chat as read.

**Path Parameters**:
- `sessionId` (string, required): Session identifier (e.g., "sales-01")
- `jid` (string, required): WhatsApp JID (URL-encoded, e.g., "628123456789@s.whatsapp.net")

**Request Body**:
- `messageIds` (array of strings, optional): Specific message IDs to mark as read. If not provided, marks entire chat as read

**Request Examples**:

```bash
# Mark entire chat as read
curl -X PUT https://your-domain.com/api/chat/sales-01/628123456789%40s.whatsapp.net/read \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{}'

# Mark specific messages as read
curl -X PUT https://your-domain.com/api/chat/sales-01/628123456789%40s.whatsapp.net/read \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
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

**Common Errors**:
- `401`: Unauthorized.
- `403`: Forbidden (cannot access session).
- `503`: Session not ready.
- `500`: Failed to mark messages as read.

---

### PUT /api/chat/read (DEPRECATED)
> **⚠️ DEPRECATED**: This endpoint is deprecated. Use `PUT /api/chat/{sessionId}/{jid}/read` instead. This endpoint will be removed in a future version.

**Description**: Mark messages or entire chat as read.

**Request Body**:
- `sessionId` (string, required): Session identifier
- `jid` (string, required): WhatsApp JID
- `messageIds` (array of strings, optional): Specific message IDs to mark as read

**Request Example**:

```bash
curl -X PUT https://your-domain.com/api/chat/read \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "sales-01",
    "jid": "628123456789@s.whatsapp.net",
    "messageIds": ["3EB0ABCD1234567890"]
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

### POST /api/messages/{sessionId}/{jid}/contact
**Description**: Send contact card(s) to a chat.

**Path Parameters**:
- `sessionId` (string, required): Session identifier
- `jid` (string, required): Recipient JID (URL-encoded)

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| contacts | array | Yes | Array of contact objects with `displayName` and `vcard` |

**Request Example**:
```bash
curl -X POST https://your-domain.com/api/messages/sales-01/628123456789%40s.whatsapp.net/contact \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
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
- `400`: Missing required fields.
- `401`: Unauthorized.
- `403`: Forbidden.
- `500`: Failed to send contact.

---

### POST /api/messages/contact (DEPRECATED)
> **⚠️ DEPRECATED**: This endpoint is deprecated. Use `POST /api/messages/{sessionId}/{jid}/contact` instead. This endpoint will be removed in a future version.

**Description**: Send contact card(s) to a chat.

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| sessionId | string | Yes | Session identifier |
| jid | string | Yes | Recipient JID |
| contacts | array | Yes | Array of contact objects |

**Request Example**:
```bash
curl -X POST https://your-domain.com/api/messages/contact \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
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

**Common Errors**:
- `400`: Missing `sessionId`, `jid`, or `contacts`.
- `401`: Unauthorized.
- `403`: Forbidden (cannot access session).
- `503`: Session not ready.
- `500`: Failed to send contact.


---

### POST /api/messages/{sessionId}/{jid}/{messageId}/react
**Description**: React to a message with an emoji. Send empty string to remove reaction.

**Path Parameters**:
- `sessionId` (string, required): Session ID
- `jid` (string, required): Recipient JID (URL-encoded)
- `messageId` (string, required): Message ID to react to

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| emoji | string | Yes | Emoji character or empty string |

**Request Example**:
```bash
curl -X POST https://your-domain.com/api/messages/sales-01/628123456789%40s.whatsapp.net/3EB0ABCD1234567890/react \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
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
- `400`: Missing required fields.
- `401`: Unauthorized.
- `403`: Forbidden.
- `500`: Failed to send reaction.

---

### POST /api/messages/react (DEPRECATED)
> **⚠️ DEPRECATED**: This endpoint is deprecated. Use `POST /api/messages/{sessionId}/{jid}/{messageId}/react` instead. This endpoint will be removed in a future version.

**Description**: React to a message with an emoji.

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| sessionId | string | Yes | Session ID |
| jid | string | Yes | Recipient JID |
| messageId | string | Yes | Message ID |
| emoji | string | Yes | Emoji character |

**Request Example**:
```bash
curl -X POST https://your-domain.com/api/messages/react \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
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

### POST /api/messages/{sessionId}/{jid}/list
**Description**: Send a formatted numbered list message. Baileys has limited support for interactive lists, so this sends a beautifully formatted text message.

**Path Parameters**:
- `sessionId` (string, required): Session ID
- `jid` (string, required): Recipient JID (URL-encoded)

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| title | string | Yes | List title/header |
| options | array | Yes | List options |
| footer | string | No | Footer text |

**Request Example**:
```bash
curl -X POST https://your-domain.com/api/messages/sales-01/628123456789%40s.whatsapp.net/list \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
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
- `400`: Missing required fields.
- `401`: Unauthorized.
- `403`: Forbidden.
- `500`: Failed to send message.

---

### POST /api/messages/list (DEPRECATED)
> **⚠️ DEPRECATED**: This endpoint is deprecated. Use `POST /api/messages/{sessionId}/{jid}/list` instead. This endpoint will be removed in a future version.

**Description**: Send a formatted numbered list message.

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| sessionId | string | Yes | Session ID |
| jid | string | Yes | Recipient JID |
| title | string | Yes | List title/header |
| options | array | Yes | List options |
| footer | string | No | Footer text |

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

### POST /api/messages/{sessionId}/{jid}/spam
**Description**: Send a message multiple times in a row (message bombing). This operation runs in the background.

**Path Parameters**:
- `sessionId` (string, required): Session ID
- `jid` (string, required): Recipient JID (URL-encoded)

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| message | string | Yes | Message text to spam |
| count | number | No | Number of messages to send (default: 10) |
| delay | number | No | Delay between messages in ms (default: 500) |

**Request Example**:
```bash
curl -X POST https://your-domain.com/api/messages/sales-01/628123456789%40s.whatsapp.net/spam \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{
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
- `400`: Missing required fields.
- `401`: Unauthorized.
- `403`: Forbidden.
- `500`: Failed to start spam.

---

### POST /api/messages/spam (DEPRECATED)
> **⚠️ DEPRECATED**: This endpoint is deprecated. Use `POST /api/messages/{sessionId}/{jid}/spam` instead. This endpoint will be removed in a future version.

**Description**: Send a message multiple times in a row.

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| sessionId | string | Yes | Session ID |
| jid | string | Yes | Recipient JID |
| message | string | Yes | Message text |
| count | number | No | Default 10 |
| delay | number | No | Default 500ms |

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

### POST /api/messages/{sessionId}/{jid}/sticker
**Description**: Convert an image (static or animated) to a WhatsApp sticker and send it.

**Path Parameters**:
- `sessionId` (string, required): Session ID
- `jid` (string, required): Recipient JID (URL-encoded)

**Request (multipart/form-data)**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | file | Yes | Image file to convert (PNG, JPG, WEBP, GIF) |

**Request Example**:
```bash
curl -X POST https://your-domain.com/api/messages/sales-01/628123456789%40s.whatsapp.net/sticker \
  -H "X-API-Key: your-api-key" \
  -F "file=@/path/to/your/image.png"
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
- `500`: Failed to create sticker.

---

### POST /api/messages/sticker (DEPRECATED)
> **⚠️ DEPRECATED**: This endpoint is deprecated. Use `POST /api/messages/{sessionId}/{jid}/sticker` instead. This endpoint will be removed in a future version.

**Description**: Convert an image to a WhatsApp sticker and send it.

**Request (multipart/form-data)**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| sessionId | string | Yes | Session ID |
| jid | string | Yes | Recipient JID |
| file | file | Yes | Image file |

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

### POST /api/messages/{sessionId}/forward
**Description**: Forward a message to one or multiple recipients.

**Path Parameters**:
- `sessionId` (string, required): Session identifier

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| fromJid | string | Yes | Source chat JID |
| messageId | string | Yes | Message ID to forward |
| toJids | string[] | Yes | List of recipient JIDs |

**Request Example**:
```bash
curl -X POST https://your-domain.com/api/messages/sales-01/forward \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
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
- `400`: Missing required fields.
- `401`: Unauthorized.
- `403`: Forbidden.
- `500`: Failed to forward message.

---

### POST /api/messages/forward (DEPRECATED)
> **⚠️ DEPRECATED**: This endpoint is deprecated. Use `POST /api/messages/{sessionId}/forward` instead. This endpoint will be removed in a future version.

**Description**: Forward a message to one or multiple recipients.

**Request Body**:
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| sessionId | string | Yes | Session identifier |
| fromJid | string | Yes | Source chat JID |
| messageId | string | Yes | Message ID to forward |
| toJids | string[] | Yes | List of recipient JIDs |

**Request Example**:
```bash
curl -X POST https://your-domain.com/api/messages/forward \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "sales-01",
    "fromJid": "628123456789@s.whatsapp.net",
    "messageId": "3EB0ABCD1234567890",
    "toJids": ["628987654321@s.whatsapp.net", "120363123456789@g.us"]
  }'
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

---

### GET /api/chats/{sessionId}/by-label/{labelId}
**Description**: Get all chats associated with a specific label.

**Path Parameters**:
- `sessionId` (string, required): Session identifier
- `labelId` (string, required): Label ID

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

**Common Errors**:
- `401`: Unauthorized.
- `403`: Forbidden.
- `404`: Label not found.
- `400`: Label does not belong to session.

---

### GET /api/chats/by-label/{labelId} (DEPRECATED)
> **⚠️ DEPRECATED**: This endpoint is deprecated. Use `GET /api/chats/{sessionId}/by-label/{labelId}` instead. This endpoint will be removed in a future version.

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

### GET /api/contacts/{sessionId}
**Description**: List contacts from the session's address book with pagination and search.

**Path Parameters**:
- `sessionId` (string, required): Session ID

**Query Parameters**:
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)
- `search` (string, optional): Search by name, JID, or notify name

**Request Example**:
```bash
curl -X GET "https://your-domain.com/api/contacts/sales-01?page=1&limit=20&search=john" \
  -H "X-API-Key: your-api-key"
```

**Response (200 OK)**:
```json
{
  "data": [
    {
      "jid": "628123456789@s.whatsapp.net",
      "name": "John Doe",
      "notify": "John",
      "verifiedName": "John Doe Business",
      "profilePic": "https://url-to-pic.jpg"
    }
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20,
    "totalPages": 5
  }
}
```

---

### GET /api/contacts (DEPRECATED)
> **⚠️ DEPRECATED**: This endpoint is deprecated. Use `GET /api/contacts/{sessionId}` instead. This endpoint will be removed in a future version.

**Description**: List contacts from the session's address book.

**Query Parameters**:
- `sessionId` (string, required): Session ID
- `page` (number, optional): Page number (default: 1)
- `limit` (number, optional): Items per page (default: 10)
- `search` (string, optional): Search by name/number

**Request Example**:
```bash
curl -X GET "https://your-domain.com/api/contacts?sessionId=sales-01&page=1&limit=20&search=john" \
  -H "X-API-Key: your-api-key"
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

### GET /api/profile/{sessionId}
**Description**: Get own profile information.

**Path Parameters**:
- `sessionId` (string, required): Session ID

**Request Example**:
```bash
curl -X GET https://your-domain.com/api/profile/sales-01 \
  -H "X-API-Key: your-api-key"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "jid": "628123456789@s.whatsapp.net",
  "status": { "status": "Available" }
}
```

---

### PUT /api/profile/{sessionId}/name
**Description**: Update the WhatsApp account's display name.

**Path Parameters**:
- `sessionId` (string, required): Session ID

**Request Body**:
- `name` (string, required): New display name (max 25 characters)

**Request Example**:
```bash
curl -X PUT https://your-domain.com/api/profile/sales-01/name \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{ "name": "My Business" }'
```

**Response (200 OK)**:
```json
{ "success": true, "message": "Profile name updated successfully", "name": "My Business" }
```

---

### PUT /api/profile/{sessionId}/status
**Description**: Update the WhatsApp account's about/status.

**Path Parameters**:
- `sessionId` (string, required): Session ID

**Request Body**:
- `status` (string, required): New status text (max 139 characters)

**Request Example**:
```bash
curl -X PUT https://your-domain.com/api/profile/sales-01/status \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-api-key" \
  -d '{ "status": "Available 9AM-5PM" }'
```

**Response (200 OK)**:
```json
{ "success": true, "message": "Profile status updated successfully", "status": "Available 9AM-5PM" }
```

---

### PUT /api/profile/{sessionId}/picture
**Description**: Upload a new profile picture.

**Path Parameters**:
- `sessionId` (string, required): Session ID

**Request Body (multipart/form-data)**:
- `file` (file, required): Image file

**Request Example**:
```bash
curl -X PUT https://your-domain.com/api/profile/sales-01/picture \
  -H "X-API-Key: your-api-key" \
  -F "file=@profile.jpg"
```

---

### DELETE /api/profile/{sessionId}/picture
**Description**: Remove profile picture.

**Path Parameters**:
- `sessionId` (string, required): Session ID

**Request Example**:
```bash
curl -X DELETE https://your-domain.com/api/profile/sales-01/picture \
  -H "X-API-Key: your-api-key"
```

---

### PUT /api/profile/name (DEPRECATED)
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

---

## 📞 Contacts

### GET /api/contacts/{sessionId}
**Description**: Get list of contacts.

**Path Parameters**:
- `sessionId` (string, required): Session ID

**Query Parameters**:
- `search` (string, optional): Search term
- `page` (number, optional): Page number
- `limit` (number, optional): Items per page

**Request Example**:
```bash
curl -X GET "https://your-domain.com/api/contacts/sales-01?search=john" \
  -H "X-API-Key: your-api-key"
```

**Response (200 OK)**:
```json
{
  "data": [
    {
      "id": "628123456789@s.whatsapp.net",
      "name": "John Doe",
      "notify": "John",
      "verify": "verified"
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 10
  }
}
```

---

### POST /api/contacts/{sessionId}/{jid}/block
**Description**: Block a contact.

**Path Parameters**:
- `sessionId` (string, required): Session ID
- `jid` (string, required): Contact JID (URL-encoded)

**Request Example**:
```bash
curl -X POST "https://your-domain.com/api/contacts/sales-01/628123456789%40s.whatsapp.net/block" \
  -H "X-API-Key: your-api-key"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Contact blocked successfully"
}
```

---

### POST /api/contacts/{sessionId}/{jid}/unblock
**Description**: Unblock a contact.

**Path Parameters**:
- `sessionId` (string, required): Session ID
- `jid` (string, required): Contact JID (URL-encoded)

**Request Example**:
```bash
curl -X POST "https://your-domain.com/api/contacts/sales-01/628123456789%40s.whatsapp.net/unblock" \
  -H "X-API-Key: your-api-key"
```

**Response (200 OK)**:
```json
{
  "success": true,
  "message": "Contact unblocked successfully"
}
```

---

## 🏷️ Labels

### GET /api/labels/{sessionId}
**Description**: Get all labels.

**Path Parameters**:
- `sessionId` (string, required): Session ID

**Request Example**:
```bash
curl -X GET "https://your-domain.com/api/labels/sales-01" \
  -H "X-API-Key: your-api-key"
```

**Response (200 OK)**:
```json
[
  {
    "id": "1",
    "name": "New Customer",
    "color": "#ff0000",
    "count": 5
  }
]
```

---

### PUT /api/labels/{sessionId}/{labelId}
**Description**: Update a label (currently only name/color update logic varies by platform, primarily used for syncing).

**Path Parameters**:
- `sessionId` (string, required): Session ID
- `labelId` (string, required): Label ID

**Request Body**:
- `name` (string): New name
- `color` (number): Color ID

---

### DELETE /api/labels/{sessionId}/{labelId}
**Description**: Delete a label.

**Path Parameters**:
- `sessionId` (string, required): Session ID
- `labelId` (string, required): Label ID

---

### GET /api/labels/{sessionId}/chat/{jid}/labels
**Description**: Get labels assigned to a specific chat.

**Path Parameters**:
- `sessionId` (string, required): Session ID
- `jid` (string, required): Chat JID (URL-encoded)

---

### PUT /api/labels/{sessionId}/chat/{jid}/labels
**Description**: Assign or remove labels from a chat.

**Path Parameters**:
- `sessionId` (string, required): Session ID
- `jid` (string, required): Chat JID (URL-encoded)

**Request Body**:
- `labelIds` (string[]): List of label IDs
- `action` (string): "add" or "remove"

---

## 👤 Profile

### GET /api/profile/{sessionId}
**Description**: Get current bot profile info.

**Path Parameters**:
- `sessionId` (string, required): Session ID

---

### PUT /api/profile/{sessionId}/name
**Description**: Update display name.

**Path Parameters**:
- `sessionId` (string, required): Session ID

**Request Body**:
- `name` (string, required): New display name

---

### PUT /api/profile/{sessionId}/status
**Description**: Update about/status.

**Path Parameters**:
- `sessionId` (string, required): Session ID

**Request Body**:
- `status` (string, required): New status text

---

### PUT /api/profile/{sessionId}/picture
**Description**: Update profile picture.

**Path Parameters**:
- `sessionId` (string, required): Session ID

**Request Body (FormData)**:
- `file` (file, required): Image file

---

### DELETE /api/profile/{sessionId}/picture
**Description**: Remove profile picture.

**Path Parameters**:
- `sessionId` (string, required): Session ID

---

## 📢 Status (Stories)

### POST /api/status/{sessionId}/update
**Description**: Post a status update.

**Path Parameters**:
- `sessionId` (string, required): Session ID

**Request Body**:
- `content` (string): Text content or caption
- `mediaUrl` (string, optional): URL for image/video status

---

## 📅 Scheduler

### GET /api/scheduler/{sessionId}
**Description**: Get scheduled messages.

**Path Parameters**:
- `sessionId` (string, required): Session ID

---

### POST /api/scheduler/{sessionId}
**Description**: Schedule a message.

**Path Parameters**:
- `sessionId` (string, required): Session ID

**Request Body**:
- `jid` (string, required): Recipient JID
- `content` (string, required): Message content
- `sendAt` (string, required): ISO Date string (e.g. 2024-12-31T23:59:00Z)
- `mediaUrl` (string, optional): Media URL

---

### DELETE /api/scheduler/{sessionId}/{scheduleId}
**Description**: Cancel a scheduled message.

**Path Parameters**:
- `sessionId` (string, required): Session ID
- `scheduleId` (string, required): Schedule ID

---
