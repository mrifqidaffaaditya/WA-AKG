# WA-AKG API Documentation

Comprehensive reference for the WhatsApp AI Gateway API.

## Authentication
All endpoints require authentication via one of the following methods:
1. **API Key**: Header \`X-API-Key: your-key\`
2. **Session Cookie**: Automatic when logged in via browser

## Base URL
\`https://your-domain.com/api\`

---

## 📅 Sessions

| Method | Endpoint | Description | Params (Query/Path/Body) |
|:-------|:---------|:------------|:-------------------------|
| `GET` | `/sessions` | List all sessions | - |
| `POST` | `/sessions` | Create a new session | Body: `{ sessionId }` |
| `DELETE` | `/sessions` | Delete a session | Body: `{ sessionId }` |
| `GET` | `/sessions/{id}/qr` | Get QR Code | Path: `id` (Session ID) |
| `GET` | `/sessions/{id}/bot-config` | Get bot config | Path: `id` |
| `PUT` | `/sessions/{id}/bot-config` | Update bot config | Path: `id`, Body: `{ config }` |
| `PUT` | `/sessions/{id}/settings` | Update settings | Path: `id`, Body: `{ settings }` |

## 💬 Messaging

| Method | Endpoint | Description | Params (Query/Path/Body) |
|:-------|:---------|:------------|:-------------------------|
| `POST` | `/chat/send` | Send text message | Body: `{ sessionId, jid, message: { text } }` |
| `POST` | `/messages/poll` | Send poll | Body: `{ sessionId, jid, poll }` |
| `POST` | `/messages/list` | Send list message | Body: `{ sessionId, jid, ... }` |
| `POST` | `/messages/location` | Send location | Body: `{ sessionId, jid, location }` |
| `POST` | `/messages/contact` | Send contact | Body: `{ sessionId, jid, vcard }` |
| `POST` | `/messages/react` | Send reaction | Body: `{ sessionId, jid, reaction }` |
| `POST` | `/messages/forward` | Forward message | Body: `{ sessionId, jid, messageId }` |
| `POST` | `/messages/sticker` | Send sticker | Body: `{ sessionId, jid, sticker }` |
| `POST` | `/messages/broadcast` | Broadcast message | Body: `{ sessionId, jids[], message }` |
| `POST` | `/messages/spam` | Report spam | Body: `{ sessionId, jid }` |
| `DELETE` | `/messages/delete` | Delete message | Body: `{ sessionId, jid, messageId }` |
| `GET` | `/messages/{id}/media` | Download media | Path: `id`, Query: `sessionId` |

## 📂 Chat Management

| Method | Endpoint | Description | Params (Query/Path/Body) |
|:-------|:---------|:------------|:-------------------------|
| `GET` | `/chat/{sessionId}` | Get chat list | Path: `sessionId`, Query: `page`, `limit` |
| `GET` | `/chat/{sessionId}/{jid}` | Get chat history | Path: `sessionId`, `jid`, Query: `limit` |
| `POST` | `/chat/check` | Check numbers | Body: `{ sessionId, phones[] }` |
| `PUT` | `/chat/read` | Mark as read | Body: `{ sessionId, jid }` |
| `PUT` | `/chat/archive` | Archive chat | Body: `{ sessionId, jid, archive: boolean }` |
| `POST` | `/chat/presence` | Send presence | Body: `{ sessionId, jid, presence }` |
| `POST` | `/chat/profile-picture` | Get profile picture | Body: `{ sessionId, jid }` |
| `PUT` | `/chat/mute` | Mute chat | Body: `{ sessionId, jid, mute, duration }` |
| `PUT` | `/chat/pin` | Pin chat | Body: `{ sessionId, jid, pin: boolean }` |
| `GET` | `/chats/by-label/{labelId}` | Filter by label | Path: `labelId` |

## 👥 Groups

| Method | Endpoint | Description | Params (Query/Path/Body) |
|:-------|:---------|:------------|:-------------------------|
| `GET` | `/groups` | List groups | Query: `sessionId` |
| `POST` | `/groups/create` | Create group | Body: `{ sessionId, subject, participants }` |
| `POST` | `/groups/invite/accept` | Accept invite | Body: `{ sessionId, code }` |
| `PUT` | `/groups/{jid}/picture` | Update picture | Path: `jid` (Group JID), Body: `{ sessionId, image }` |
| `DELETE` | `/groups/{jid}/picture` | Remove picture | Path: `jid`, Body: `{ sessionId }` |
| `PUT` | `/groups/{jid}/subject` | Update subject | Path: `jid`, Body: `{ sessionId, subject }` |
| `PUT` | `/groups/{jid}/description` | Update description | Path: `jid`, Body: `{ sessionId, description }` |
| `GET` | `/groups/{jid}/invite` | Get invite code | Path: `jid`, Query: `sessionId` |
| `PUT` | `/groups/{jid}/invite/revoke` | Revoke invite code | Path: `jid`, Body: `{ sessionId }` |
| `PUT` | `/groups/{jid}/members` | Manage members | Path: `jid`, Body: `{ sessionId, action, participants }` |
| `PUT` | `/groups/{jid}/settings` | Update settings | Path: `jid`, Body: `{ sessionId, settings }` |
| `PUT` | `/groups/{jid}/ephemeral` | Toggle disappearing | Path: `jid`, Body: `{ sessionId, ephemeral }` |
| `POST` | `/groups/{jid}/leave` | Leave group | Path: `jid`, Body: `{ sessionId }` |

## 🏷️ Labels

| Method | Endpoint | Description | Params (Query/Path/Body) |
|:-------|:---------|:------------|:-------------------------|
| `GET` | `/labels` | List labels | - |
| `POST` | `/labels` | Create label | Body: `{ name, color }` |
| `PUT` | `/labels/{id}` | Update label | Path: `id`, Body: `{ name, color }` |
| `DELETE` | `/labels/{id}` | Delete label | Path: `id` |
| `GET` | `/labels/chat-labels` | Get chat labels | Query: `jid`, `sessionId` |
| `PUT` | `/labels/chat-labels` | Update chat labels | Query: `jid`, Body: `{ sessionId, labelIds[] }` |

## 📒 Contacts

| Method | Endpoint | Description | Params (Query/Path/Body) |
|:-------|:---------|:------------|:-------------------------|
| `GET` | `/contacts` | List contacts | Query: `sessionId` |
| `POST` | `/contacts/block` | Block contact | Body: `{ sessionId, jid }` |
| `POST` | `/contacts/unblock` | Unblock contact | Body: `{ sessionId, jid }` |

## 👤 Profile

| Method | Endpoint | Description | Params (Query/Path/Body) |
|:-------|:---------|:------------|:-------------------------|
| `GET` | `/profile` | Get profile | Query: `sessionId` |
| `PUT` | `/profile/name` | Update name | Body: `{ sessionId, name }` |
| `PUT` | `/profile/status` | Update status | Body: `{ sessionId, status }` |
| `PUT` | `/profile/picture` | Update picture | Body: `{ sessionId, image }` |
| `DELETE` | `/profile/picture` | Remove picture | Body: `{ sessionId }` |

## 🤖 Auto Reply

| Method | Endpoint | Description | Params (Query/Path/Body) |
|:-------|:---------|:------------|:-------------------------|
| `GET` | `/autoreplies` | List auto replies | - |
| `POST` | `/autoreplies` | Create auto reply | Body: `{ trigger, response, ... }` |
| `GET` | `/autoreplies/{id}` | Get details | Path: `id` |
| `PUT` | `/autoreplies/{id}` | Update | Path: `id`, Body: `{ ... }` |
| `DELETE` | `/autoreplies/{id}` | Delete | Path: `id` |

## 📅 Scheduler

| Method | Endpoint | Description | Params (Query/Path/Body) |
|:-------|:---------|:------------|:-------------------------|
| `GET` | `/scheduler` | List scheduled | - |
| `POST` | `/scheduler` | Create schedule | Body: `{ sessionId, jid, message, triggerAt }` |
| `GET` | `/scheduler/{id}` | Get details | Path: `id` |
| `PUT` | `/scheduler/{id}` | Update | Path: `id`, Body: `{ ... }` |
| `DELETE` | `/scheduler/{id}` | Delete | Path: `id` |

## 🔗 Webhooks

| Method | Endpoint | Description | Params (Query/Path/Body) |
|:-------|:---------|:------------|:-------------------------|
| `GET` | `/webhooks` | List webhooks | - |
| `POST` | `/webhooks` | Create webhook | Body: `{ url, events[] }` |
| `GET` | `/webhooks/{id}` | Get details | Path: `id` |
| `PUT` | `/webhooks/{id}` | Update | Path: `id`, Body: `{ ... }` |
| `DELETE` | `/webhooks/{id}` | Delete | Path: `id` |

## 🔔 Notifications & Users

| Method | Endpoint | Description | Params (Query/Path/Body) |
|:-------|:---------|:------------|:-------------------------|
| `GET` | `/notifications` | List notifs | - |
| `POST` | `/notifications` | Create notif | Body: `{ title, message }` |
| `PATCH` | `/notifications/read` | Mark read | Body: `{ ids[] }` |
| `DELETE` | `/notifications/delete` | Delete | Query: `id` |
| `GET` | `/users` | List users | - |
| `POST` | `/users` | Create user | Body: `{ name, email, password }` |
| `GET` | `/user/api-key` | Get API Key | - |
| `POST` | `/user/api-key` | Generate Key | - |

## ⚙️ System

| Method | Endpoint | Description | Params (Query/Path/Body) |
|:-------|:---------|:------------|:-------------------------|
| `GET` | `/settings/system` | Get system config | - |
| `PUT` | `/settings/system` | Update config | Body: `{ ... }` |
| `POST` | `/status/update` | Update status | Body: `{ status }` |
| `GET` | `/system/check-updates` | Check updates | - |
