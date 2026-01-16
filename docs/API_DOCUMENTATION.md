# WA-AKG API Documentation

Comprehensive reference for the WhatsApp AI Gateway API.

## Authentication
All endpoints require authentication via one of the following methods:
1. **API Key**: Header `X-API-Key: your-key`
2. **Session Cookie**: Automatic when logged in via browser

## Base URL
`https://your-domain.com/api`

---

## 📅 Sessions

### GET /sessions
**Description**: List all sessions accessible to the authenticated user.
**Response (200 OK)**:
```json
[
  {
    "id": "cuid",
    "name": "My Session",
    "sessionId": "session-1",
    "status": "Connected",
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

### POST /sessions
**Description**: Create a new session.
**Request Body**:
```json
{
  "name": "Work Session",
  "sessionId": "work-01"
}
```
**Response (200 OK)**:
```json
{
  "id": "new-cuid",
  "name": "Work Session",
  "sessionId": "work-01",
  "status": "Disconnected"
}
```

### GET /sessions/{id}/qr
**Description**: Get the QR code or pairing code for a session.
**Parameters**:
- **Path**: `id` (The alphanumeric sessionId)
**Response (200 OK)**:
```json
{
  "qr": "data:image/png;base64,...",
  "pairingCode": "ABCD-EFGH"
}
```

### GET /sessions/{id}/bot-config
**Description**: Get the bot configuration for a session.
**Parameters**:
- **Path**: `id`
**Response (200 OK)**:
```json
{ "enabled": true, "prefix": "!", "owner": "..." }
```

### PUT /sessions/{id}/bot-config
**Description**: Update bot configuration.
**Parameters**:
- **Path**: `id`
**Request Body**:
```json
{ "enabled": false, "prefix": "/" }
```
**Response (200 OK)**:
```json
{ "success": true }
```

### PUT /sessions/{id}/settings
**Description**: Update session settings.
**Parameters**:
- **Path**: `id`
**Request Body**:
```json
{ "settings": { "readReceipts": true, "rejectCalls": false } }
```
**Response (200 OK)**:
```json
{ "success": true }
```

### DELETE /sessions/{id}/settings
**Description**: Delete a session and its data.
**Parameters**:
- **Path**: `id`
**Response (200 OK)**:
```json
{ "success": true, "message": "Session deleted" }
```

---

## 💬 Messaging

### POST /chat/send
**Description**: Send a text message.
**Request Body**:
```json
{
  "sessionId": "session-1",
  "jid": "1234567890@s.whatsapp.net",
  "message": { "text": "Hello World" }
}
```
**Response (200 OK)**:
```json
{ "success": true }
```

### POST /messages/poll
**Description**: Send a poll message.
**Request Body**:
```json
{
  "sessionId": "session-1",
  "jid": "...",
  "poll": { "name": "Question?", "values": ["A", "B"], "selectableCount": 1 }
}
```
**Response (200 OK)**:
```json
{ "success": true }
```

### POST /messages/sticker
**Description**: Send a sticker by uploading an image.
**Request Type**: `multipart/form-data`
**Body**:
- `sessionId`: string
- `jid`: string
- `file`: image file
**Response (200 OK)**:
```json
{ "success": true }
```

### POST /messages/list
**Description**: Send a list message.
**Request Body**:
```json
{ "sessionId": "...", "jid": "...", "title": "List", "sections": [...] }
```
**Response (200 OK)**:
```json
{ "success": true }
```

### POST /messages/location
**Description**: Send a location.
**Request Body**:
```json
{ "sessionId": "...", "jid": "...", "location": { "degreesLatitude": 0.0, "degreesLongitude": 0.0 } }
```
**Response (200 OK)**:
```json
{ "success": true }
```

### POST /messages/contact
**Description**: Send a contact card.
**Request Body**:
```json
{ "sessionId": "...", "jid": "...", "vcard": "BEGIN:VCARD..." }
```
**Response (200 OK)**:
```json
{ "success": true }
```

### POST /messages/react
**Description**: Send a reaction.
**Request Body**:
```json
{ "sessionId": "...", "jid": "...", "reaction": { "text": "❤️", "key": { "remoteJid": "...", "id": "..." } } }
```
**Response (200 OK)**:
```json
{ "success": true }
```

### POST /messages/forward
**Description**: Forward a message.
**Request Body**:
```json
{ "sessionId": "...", "jid": "...", "messageId": "..." }
```
**Response (200 OK)**:
```json
{ "success": true }
```

### POST /messages/broadcast
**Description**: Send message to multiple JIDs.
**Request Body**:
```json
{ "sessionId": "...", "jids": ["jid1", "jid2"], "message": { "text": "..." } }
```
**Response (200 OK)**:
```json
{ "success": true }
```

### POST /messages/spam
**Description**: Send multiple messages (Spam/Bomb).
**Request Body**:
```json
{ "sessionId": "...", "jid": "...", "message": "...", "count": 10, "delay": 500 }
```
**Response (200 OK)**:
```json
{ "success": true, "message": "Bombing started" }
```

### DELETE /messages/delete
**Description**: Delete a message for everyone.
**Request Body**:
```json
{ "sessionId": "...", "jid": "...", "messageId": "..." }
```
**Response (200 OK)**:
```json
{ "success": true }
```

### GET /messages/{id}/media
**Description**: Download media.
**Parameters**:
- **Path**: `id` (Message CUID)
- **Query**: `sessionId`
**Response**: Binary file.

---

## 📂 Chat Management

### GET /chat/{sessionId}
**Description**: Get list of chats.
**Parameters**:
- **Path**: `sessionId`
- **Query**: `page`, `limit`, `search`
**Response (200 OK)**:
```json
{ "chats": [...], "pagination": { ... } }
```

### GET /chat/{sessionId}/{jid}
**Description**: Get messages.
**Parameters**:
- **Path**: `sessionId`, `jid`
**Response (200 OK)**:
```json
[ { "id": "...", "text": "..." } ]
```

### POST /chat/check
**Description**: Check WhatsApp numbers.
**Request Body**:
```json
{ "sessionId": "...", "phones": ["..."] }
```
**Response (200 OK)**:
```json
[ { "exists": true, "jid": "..." } ]
```

### PUT /chat/read
**Description**: Mark read.
**Request Body**:
```json
{ "sessionId": "...", "jid": "..." }
```
**Response (200 OK)**:
```json
{ "success": true }
```

### PUT /chat/archive
**Description**: Archive/Unarchive chat.
**Request Body**:
```json
{ "sessionId": "...", "jid": "...", "archive": true }
```
**Response (200 OK)**:
```json
{ "success": true }
```

### POST /chat/presence
**Description**: Send presence (composing/recording).
**Request Body**:
```json
{ "sessionId": "...", "jid": "...", "presence": "composing" }
```
**Response (200 OK)**:
```json
{ "success": true }
```

### POST /chat/profile-picture
**Description**: Get contact profile picture.
**Request Body**:
```json
{ "sessionId": "...", "jid": "..." }
```
**Response (200 OK)**:
```json
{ "url": "..." }
```

### PUT /chat/mute
**Description**: Mute/Unmute chat.
**Request Body**:
```json
{ "sessionId": "...", "jid": "...", "mute": 3600 }
```
**Response (200 OK)**:
```json
{ "success": true }
```

### PUT /chat/pin
**Description**: Pin/Unpin chat.
**Request Body**:
```json
{ "sessionId": "...", "jid": "...", "pin": true }
```
**Response (200 OK)**:
```json
{ "success": true }
```

### GET /chats/by-label/{labelId}
**Description**: Filter chats by label.
**Parameters**:
- **Path**: `labelId`
- **Query**: `sessionId`
**Response (200 OK)**:
```json
[ { "jid": "...", "name": "..." } ]
```

---

## 👥 Groups

### GET /groups
**Description**: List groups.
**Parameters**:
- **Query**: `sessionId`
**Response (200 OK)**:
```json
[ { "jid": "...@g.us", "subject": "..." } ]
```

### POST /groups/create
**Description**: Create group.
**Request Body**:
```json
{ "sessionId": "...", "subject": "...", "participants": ["..."] }
```
**Response (200 OK)**:
```json
{ "id": "...@g.us" }
```

### POST /groups/invite/accept
**Description**: Join group via code.
**Request Body**:
```json
{ "sessionId": "...", "code": "..." }
```
**Response (200 OK)**:
```json
{ "jid": "..." }
```

### PUT /groups/{jid}/picture
**Description**: Update group picture.
**Request Type**: `multipart/form-data`
**Body**:
- `sessionId`: string
- `file`: image file
**Response (200 OK)**:
```json
{ "success": true }
```

### DELETE /groups/{jid}/picture
**Description**: Remove group picture.
**Parameters**:
- **Query**: `sessionId`
**Response (200 OK)**:
```json
{ "success": true }
```

### PUT /groups/{jid}/subject
**Description**: Update group name.
**Request Body**:
```json
{ "sessionId": "...", "subject": "..." }
```
**Response (200 OK)**:
```json
{ "success": true }
```

### PUT /groups/{jid}/description
**Description**: Update group description.
**Request Body**:
```json
{ "sessionId": "...", "description": "..." }
```
**Response (200 OK)**:
```json
{ "success": true }
```

### GET /groups/{jid}/invite
**Description**: Get group invite code.
**Parameters**:
- **Query**: `sessionId`
**Response (200 OK)**:
```json
{ "code": "..." }
```

### PUT /groups/{jid}/invite
**Description**: Revoke group invite code.
**Request Body**:
```json
{ "sessionId": "..." }
```
**Response (200 OK)**:
```json
{ "success": true, "newInviteCode": "..." }
```

### PUT /groups/{jid}/members
**Description**: Manage members.
**Request Body**:
```json
{ "sessionId": "...", "action": "add/remove/promote/demote", "participants": ["..."] }
```
**Response (200 OK)**:
```json
{ "success": true }
```

### PUT /groups/{jid}/settings
**Description**: Update group settings (announce/locked).
**Request Body**:
```json
{ "sessionId": "...", "settings": { "announce": true, "restrict": false } }
```
**Response (200 OK)**:
```json
{ "success": true }
```

### PUT /groups/{jid}/ephemeral
**Description**: Update disappearing messages.
**Request Body**:
```json
{ "sessionId": "...", "ephemeral": 86400 }
```
**Response (200 OK)**:
```json
{ "success": true }
```

### POST /groups/{jid}/leave
**Description**: Leave group.
**Request Body**:
```json
{ "sessionId": "..." }
```
**Response (200 OK)**:
```json
{ "success": true }
```

---

## 🏷️ Labels

### GET /labels
**Description**: List labels.
**Parameters**:
- **Query**: `sessionId`
**Response (200 OK)**:
```json
{ "success": true, "labels": [...] }
```

### POST /labels
**Description**: Create label.
**Request Body**:
```json
{ "name": "...", "color": 0, "sessionId": "..." }
```
**Response (200 OK)**:
```json
{ "success": true, "label": { ... } }
```

### PUT /labels/{id}
**Description**: Update label.
**Request Body**:
```json
{ "name": "...", "color": 1 }
```
**Response (200 OK)**:
```json
{ "success": true }
```

### DELETE /labels/{id}
**Description**: Delete label.
**Response (200 OK)**:
```json
{ "success": true }
```

### GET /labels/chat-labels
**Description**: Get labels for a chat.
**Parameters**:
- **Query**: `jid`, `sessionId`
**Response (200 OK)**:
```json
{ "success": true, "labels": [...] }
```

### PUT /labels/chat-labels
**Description**: Update chat labels.
**Request Body**:
```json
{ "sessionId": "...", "labelIds": ["..."], "action": "add" }
```
**Response (200 OK)**:
```json
{ "success": true }
```

---

## 📒 Contacts

### GET /contacts
**Description**: List contacts.
**Parameters**:
- **Query**: `sessionId`
**Response (200 OK)**:
```json
{ "data": [...], "meta": { ... } }
```

### POST /contacts/block
**Description**: Block contact.
**Request Body**:
```json
{ "sessionId": "...", "jid": "..." }
```
**Response (200 OK)**:
```json
{ "success": true }
```

### POST /contacts/unblock
**Description**: Unblock contact.
**Request Body**:
```json
{ "sessionId": "...", "jid": "..." }
```
**Response (200 OK)**:
```json
{ "success": true }
```

---

## 👤 Profile

### GET /profile
**Description**: Get own profile status.
**Parameters**:
- **Query**: `sessionId`
**Response (200 OK)**:
```json
{ "success": true, "status": { ... } }
```

### PUT /profile/name
**Description**: Update own name.
**Request Body**:
```json
{ "sessionId": "...", "name": "..." }
```
**Response (200 OK)**:
```json
{ "success": true }
```

### PUT /profile/status
**Description**: Update about/status.
**Request Body**:
```json
{ "sessionId": "...", "status": "..." }
```
**Response (200 OK)**:
```json
{ "success": true }
```

### PUT /profile/picture
**Description**: Update own profile picture.
**Request Type**: `multipart/form-data`
**Body**:
- `sessionId`: string
- `file`: image file
**Response (200 OK)**:
```json
{ "success": true }
```

### DELETE /profile/picture
**Description**: Remove own profile picture.
**Parameters**:
- **Query**: `sessionId`
**Response (200 OK)**:
```json
{ "success": true }
```

---

## 🤖 Auto Reply

### GET /autoreplies
**Description**: List rules.
**Parameters**:
- **Query**: `sessionId`
**Response (200 OK)**:
```json
[ { "id": "...", "keyword": "..." } ]
```

### POST /autoreplies
**Description**: Create rule.
**Request Body**:
```json
{ "sessionId": "...", "keyword": "...", "response": "..." }
```
**Response (200 OK)**:
```json
{ "id": "..." }
```

### GET /autoreplies/{id}
**Description**: Get rule.
**Response (200 OK)**:
```json
{ "id": "..." }
```

### PUT /autoreplies/{id}
**Description**: Update rule.
**Request Body**:
```json
{ "keyword": "...", "response": "..." }
```
**Response (200 OK)**:
```json
{ "success": true }
```

### DELETE /autoreplies/{id}
**Description**: Delete rule.
**Response (200 OK)**:
```json
{ "success": true }
```

---

## 📅 Scheduler

### GET /scheduler
**Description**: List schedules.
**Parameters**:
- **Query**: `sessionId`
**Response (200 OK)**:
```json
[ { "id": "..." } ]
```

### POST /scheduler
**Description**: Create schedule.
**Request Body**:
```json
{ "sessionId": "...", "jid": "...", "content": "..." }
```
**Response (200 OK)**:
```json
{ "id": "..." }
```

### GET /scheduler/{id}
**Description**: Get schedule.
**Response (200 OK)**:
```json
{ "id": "..." }
```

### PUT /scheduler/{id}
**Description**: Update schedule.
**Request Body**:
```json
{ "content": "..." }
```
**Response (200 OK)**:
```json
{ "success": true }
```

### DELETE /scheduler/{id}
**Description**: Delete schedule.
**Response (200 OK)**:
```json
{ "success": true }
```

---

## 🔗 Webhooks

### GET /webhooks
**Description**: List webhooks.
**Response (200 OK)**:
```json
[ { "id": "...", "url": "..." } ]
```

### POST /webhooks
**Description**: Create webhook.
**Request Body**:
```json
{ "name": "...", "url": "...", "events": ["..."] }
```
**Response (200 OK)**:
```json
{ "id": "..." }
```

### GET /webhooks/{id}
**Description**: Get webhook.
**Response (200 OK)**:
```json
{ "id": "..." }
```

### PUT /webhooks/{id}
**Description**: Update webhook.
**Request Body**:
```json
{ "name": "..." }
```
**Response (200 OK)**:
```json
{ "success": true }
```

### DELETE /webhooks/{id}
**Description**: Delete webhook.
**Response (200 OK)**:
```json
{ "success": true }
```

---

## 🔔 Notifications

### GET /notifications
**Description**: List notifications.
**Response (200 OK)**:
```json
[ { "id": "...", "read": false } ]
```

### post /notifications
**Description**: Create notification (System).
**Request Body**:
```json
{ "title": "...", "message": "..." }
```
**Response (200 OK)**:
```json
{ "success": true }
```

### PATCH /notifications/read
**Description**: Mark read.
**Request Body**:
```json
{ "ids": ["..."] }
```
**Response (200 OK)**:
```json
{ "success": true }
```

### DELETE /notifications/delete
**Description**: Delete notification.
**Parameters**:
- **Query**: `id`
**Response (200 OK)**:
```json
{ "success": true }
```

---

## 👥 Users

### GET /users
**Description**: List users.
**Response (200 OK)**:
```json
[ { "id": "...", "role": "..." } ]
```

### POST /users
**Description**: Create users.
**Request Body**:
```json
{ "name": "...", "email": "...", "password": "...", "role": "STAFF" }
```
**Response (200 OK)**:
```json
{ "id": "..." }
```

### GET /users/{id}
**Description**: Get user.
**Response (200 OK)**:
```json
{ "id": "..." }
```

### PUT /users/{id}
**Description**: Update user.
**Request Body**:
```json
{ "name": "..." }
```
**Response (200 OK)**:
```json
{ "success": true }
```

### DELETE /users/{id}
**Description**: Delete user.
**Response (200 OK)**:
```json
{ "success": true }
```

### GET /user/api-key
**Description**: Get API Key.
**Response (200 OK)**:
```json
{ "apiKey": "..." }
```

### POST /user/api-key
**Description**: Regenerate API Key.
**Response (200 OK)**:
```json
{ "apiKey": "..." }
```

---

## ⚙️ System

### GET /settings/system
**Description**: Get config.
**Response (200 OK)**:
```json
{ "timezone": "..." }
```

### POST /settings/system
**Description**: Update config.
**Request Body**:
```json
{ "timezone": "..." }
```
**Response (200 OK)**:
```json
{ "success": true }
```

### POST /status/update
**Description**: Update status.
**Request Body**:
```json
{ "status": "MAINTENANCE" }
```
**Response (200 OK)**:
```json
{ "success": true }
```

### GET /system/check-updates
**Description**: Check updates.
**Response (200 OK)**:
```json
{ "updateAvailable": false }
```

### GET /docs
**Description**: Get OpenAPI Spec.
**Response (200 OK)**:
```json
{ "openapi": "3.0.0" }
```
