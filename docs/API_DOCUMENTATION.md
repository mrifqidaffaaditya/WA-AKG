# WA-AKG API Documentation

# WhatsApp AI Gateway — Complete API Reference

Professional WhatsApp Gateway REST API with **81 routes** for complete WhatsApp automation.

> **Version**: 1.6.1 | **Last Updated**: June 2026

## 🔐 Authentication

All endpoints require one of the following authentication methods:

| Method | Header / Cookie | Example |
| :--- | :--- | :--- |
| **API Key** | `X-API-Key` (header) | `X-API-Key: your-api-key-here` |
| **Session Cookie** | `next-auth.session-token` (cookie) | Automatically managed by browser |

> [!IMPORTANT]
> `AUTH_SECRET` **wajib** diset di `.env` — tidak ada fallback ke default. Server akan crash jika tidak diset.

## 📋 Common Parameters

| Parameter | Format | Example |
| :--- | :--- | :--- |
| `sessionId` | Unique session identifier | `session-01` |
| `jid` (Personal) | `{countryCode}{number}@s.whatsapp.net` | `628123456789@s.whatsapp.net` |
| `jid` (Group) | `{groupId}@g.us` | `120363123456789@g.us` |

---

## 📂 Media

### \[GET\] /media/{filename}

**Get uploaded media file**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `filename` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | File data |

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/media/image.jpg" \
  -H "X-API-Key: your-api-key"
```

---

## 📂 Groups

### \[POST\] /groups/{sessionId}/{jid}/leave

**Leave a group**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Left the group successfully |

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/groups/session-01/628123456789@s.whatsapp.net/leave" \
  -H "X-API-Key: your-api-key"
```

---

### \[GET\] /groups/{sessionId}

**List all groups**

Get all groups associated with the session

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | List of groups |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `404` | Resource not found |
| `500` | Failed to fetch groups |

**Response Example (`200`):**

```json
[
  {
    "id": "string",
    "subject": "string",
    "desc": "string",
    "owner": "string",
    "size": 0,
    "isCommunity": true,
    "linkedParentJid": "string",
    "participants": [
      {
        "id": "string",
        "admin": "string"
      }
    ]
  }
]
```

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/groups/session-01" \
  -H "X-API-Key: your-api-key"
```

---

### \[POST\] /groups/{sessionId}/create

**Create new group**

Create a new group with specified participants

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `subject` | string | ✅ Yes | — |
| `participants` | array of string | ✅ Yes | — |

**Example:**

```json
{
  "subject": "VIP Customers",
  "participants": [
    "628123456789@s.whatsapp.net"
  ]
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Group created |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to create group |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `group` | object | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "group": {
    "id": "string",
    "subject": "string",
    "desc": "string",
    "owner": "string",
    "size": 0,
    "isCommunity": true,
    "linkedParentJid": "string",
    "participants": [
      {
        "id": "string",
        "admin": "string"
      }
    ]
  }
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/groups/session-01/create" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"subject":"VIP Customers","participants":["628123456789@s.whatsapp.net"]}'
```

---

### \[PUT\] /groups/{sessionId}/{jid}/subject

**Update group subject**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `subject` | string | ✅ Yes | — |

**Example:**

```json
{
  "subject": "string"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Subject updated |
| `400` | Invalid subject |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to update subject |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `message` | string | No | — |
| `subject` | string | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "message": "string",
  "subject": "string"
}
```

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/groups/session-01/628123456789@s.whatsapp.net/subject" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"subject":"string"}'
```

---

### \[PUT\] /groups/{jid}/subject

**Update group name**

Update group subject (max 100 characters, requires admin)

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `jid` | path | ✅ Yes | string | URL-encoded group JID |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sessionId` | string | ✅ Yes | — |
| `subject` | string | ✅ Yes | — |

**Example:**

```json
{
  "sessionId": "string",
  "subject": "string"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Subject updated |
| `400` | Invalid request (missing fields or subject too long) |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to update group subject |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `message` | string | No | — |
| `subject` | string | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "message": "Group subject updated successfully",
  "subject": "New Subject"
}
```

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/groups/628123456789@s.whatsapp.net/subject" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"string","subject":"string"}'
```

---

### \[PUT\] /groups/{sessionId}/{jid}/members

**Manage group members**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `action` | string | ✅ Yes | **Options:** `add`, `remove`, `promote`, `demote` |
| `participants` | array of string | ✅ Yes | — |

**Example:**

```json
{
  "action": "add",
  "participants": [
    "string"
  ]
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Members updated |
| `400` | Invalid action |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to update members |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `message` | string | No | — |
| `result` | array of object | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "message": "string",
  "result": [
    {
      "text": "Hello from WA-AKG!"
    }
  ]
}
```

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/groups/session-01/628123456789@s.whatsapp.net/members" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"action":"add","participants":["string"]}'
```

---

### \[PUT\] /groups/{sessionId}/{jid}/invite

**Revoke invite code**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Invite revoked |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to revoke code |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `message` | string | No | — |
| `newInviteCode` | string | No | — |
| `inviteUrl` | string | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "message": "string",
  "newInviteCode": "string",
  "inviteUrl": "string"
}
```

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/groups/session-01/628123456789@s.whatsapp.net/invite" \
  -H "X-API-Key: your-api-key"
```

---

### \[GET\] /groups/{sessionId}/{jid}/invite

**Get invite code**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Invite code |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to get code |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `inviteCode` | string | No | — |
| `inviteUrl` | string | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "inviteCode": "string",
  "inviteUrl": "string"
}
```

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/groups/session-01/628123456789@s.whatsapp.net/invite" \
  -H "X-API-Key: your-api-key"
```

---

### \[GET\] /groups/{sessionId}/{jid}

**Get group details**

Get detailed group information

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Group details |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `404` | Resource not found |
| `500` | Failed to fetch details |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | No | — |
| `subject` | string | No | — |
| `subjectOwner` | string | No | — |
| `subjectTime` | number | No | — |
| `desc` | string | No | — |
| `descOwner` | string | No | — |
| `descId` | string | No | — |
| `owner` | string | No | — |

**Response Example (`200`):**

```json
{
  "id": "string",
  "subject": "string",
  "subjectOwner": "string",
  "subjectTime": 0,
  "desc": "string",
  "descOwner": "string",
  "descId": "string",
  "owner": "string"
}
```

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/groups/session-01/628123456789@s.whatsapp.net" \
  -H "X-API-Key: your-api-key"
```

---

### \[POST\] /groups/{jid}/leave

**Leave group**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `jid` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sessionId` | string | ✅ Yes | — |

**Example:**

```json
{
  "sessionId": "string"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Left group |

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/groups/628123456789@s.whatsapp.net/leave" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"string"}'
```

---

### \[POST\] /groups/{sessionId}/invite/accept

**Accept group invite**

Join a group using an invite code

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `inviteCode` | string | ✅ Yes | — |

**Example:**

```json
{
  "inviteCode": "string"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Group invite accepted |
| `400` | Invalid/Expired code |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to accept invite |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `message` | string | No | — |
| `groupJid` | string | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "message": "string",
  "groupJid": "string"
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/groups/session-01/invite/accept" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"inviteCode":"string"}'
```

---

### \[DELETE\] /groups/{sessionId}/{jid}/picture

**Remove group picture**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Picture removed |

#### cURL Example

```bash
curl -X DELETE "http://localhost:3000/api/groups/session-01/628123456789@s.whatsapp.net/picture" \
  -H "X-API-Key: your-api-key"
```

---

### \[PUT\] /groups/{sessionId}/{jid}/picture

**Update group picture**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`multipart/form-data`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `file` | string (binary) | ✅ Yes | — |

**Example:**

```json
{
  "file": "(binary)"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Picture updated |

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/groups/session-01/628123456789@s.whatsapp.net/picture" \
  -H "X-API-Key: your-api-key" \
  -F "file=@/path/to/file.jpg" \
  -F "type=image" \
  -F "caption=Hello"
```

---

### \[PUT\] /groups/{sessionId}/{jid}/settings

**Update group settings**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `setting` | string | ✅ Yes | announcement (admins only send), not_announcement (all send), locked (admins only edit), unlocked (all edit) **Options:** `announcement`, `not_announcement`, `locked`, `unlocked` |
| `value` | boolean | No | Ignored but required |

**Example:**

```json
{
  "setting": "announcement",
  "value": true
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Settings updated |

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/groups/session-01/628123456789@s.whatsapp.net/settings" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"setting":"announcement","value":true}'
```

---

### \[PUT\] /groups/{sessionId}/{jid}/description

**Update group description**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `description` | string | No | — |

**Example:**

```json
{
  "description": "string"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Description updated |
| `400` | Invalid input |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to update |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `description` | string | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "description": "string"
}
```

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/groups/session-01/628123456789@s.whatsapp.net/description" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"description":"string"}'
```

---

### \[PUT\] /groups/{sessionId}/{jid}/ephemeral

**Toggle disappearing messages**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `expiration` | integer | ✅ Yes | **Options:** `0`, `86400`, `604800`, `7776000` |

**Example:**

```json
{
  "expiration": 0
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Ephemeral toggled |
| `400` | Invalid expiration |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to toggle |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `expiration` | integer | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "expiration": 0
}
```

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/groups/session-01/628123456789@s.whatsapp.net/ephemeral" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"expiration":0}'
```

---

## 📂 Documentation

### \[GET\] /docs

**Get Swagger JSON specification**

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Swagger JSON spec |

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/docs" \
  -H "X-API-Key: your-api-key"
```

---

## 📂 Chats

### \[GET\] /chats/by-label/{labelId}

**Get chats by label ID**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `labelId` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | List of chats with the label |

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/chats/by-label/label_01" \
  -H "X-API-Key: your-api-key"
```

---

## 📂 Web Authentication

### \[POST\] /auth/register

**Register a new user**

Register a user via web.

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | string | ✅ Yes | — |
| `email` | string | ✅ Yes | — |
| `password` | string | ✅ Yes | — |

**Example:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | User registered |

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/auth/register" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123"}'
```

---

### \[GET\] /auth/session

**Get current web session**

Check if the user is authenticated in the web dashboard

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Current session |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `user` | object | No | — |
| `expires` | string | No | — |

**Response Example (`200`):**

```json
{
  "user": {
    "name": "string",
    "email": "string",
    "image": "string"
  },
  "expires": "string"
}
```

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/auth/session" \
  -H "X-API-Key: your-api-key"
```

---

### \[GET\] /auth/csrf

**Get CSRF token**

Retrieve CSRF token for form submissions

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | CSRF Token |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `csrfToken` | string | No | — |

**Response Example (`200`):**

```json
{
  "csrfToken": "string"
}
```

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/auth/csrf" \
  -H "X-API-Key: your-api-key"
```

---

## 📂 Sessions

### \[GET\] /sessions

**List all accessible sessions**

Get all sessions accessible to the authenticated user (role-based filtering)

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | List of sessions |
| `401` | Unauthorized - Invalid or missing API key |

**Response Example (`200`):**

```json
[
  {
    "id": "clx123abc",
    "name": "Marketing Bot",
    "sessionId": "marketing-1",
    "status": "Connected",
    "userId": "string",
    "user": {
      "name": "User Name",
      "email": "user@example.com"
    },
    "botConfig": {
      "text": "Hello from WA-AKG!"
    },
    "webhooks": [
      {
        "text": "Hello from WA-AKG!"
      }
    ],
    "_count": {
      "contacts": 0,
      "messages": 0,
      "groups": 0,
      "autoReplies": 0,
      "scheduledMessages": 0
    },
    "createdAt": "2026-01-15T08:00:00.000Z",
    "updatedAt": "2026-01-15T08:00:00.000Z"
  }
]
```

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/sessions" \
  -H "X-API-Key: your-api-key"
```

---

### \[POST\] /sessions

**Create new WhatsApp session**

Creates a new WhatsApp session for QR code pairing

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | string | ✅ Yes | Display name for the session |
| `sessionId` | string | No | Unique session ID (auto-generated if not provided) |

**Example:**

```json
{
  "name": "Marketing Bot",
  "sessionId": "marketing-1"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Session created successfully |
| `400` | Invalid request body |
| `401` | Unauthorized - Invalid or missing API key |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | No | — |
| `name` | string | No | — |
| `sessionId` | string | No | — |
| `status` | string | No | **Options:** `Connected`, `Disconnected`, `Connecting` |
| `userId` | string | No | — |
| `botConfig` | object, nullable | No | — |
| `webhooks` | array of object | No | — |
| `_count` | object, nullable | No | — |
| `createdAt` | string (date-time) | No | — |
| `updatedAt` | string (date-time) | No | — |

**Response Example (`200`):**

```json
{
  "id": "clx123abc",
  "name": "Marketing Bot",
  "sessionId": "marketing-1",
  "status": "Connected",
  "userId": "string",
  "botConfig": {
    "text": "Hello from WA-AKG!"
  },
  "webhooks": [
    {
      "text": "Hello from WA-AKG!"
    }
  ],
  "_count": {
    "contacts": 0,
    "messages": 0,
    "groups": 0,
    "autoReplies": 0,
    "scheduledMessages": 0
  },
  "createdAt": "2026-01-15T08:00:00.000Z",
  "updatedAt": "2026-01-15T08:00:00.000Z"
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/sessions" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"name":"Marketing Bot","sessionId":"marketing-1"}'
```

---

### \[GET\] /sessions/{id}/qr

**Get QR code for pairing**

Retrieve QR code (string and base64 image) for WhatsApp pairing

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | path | ✅ Yes | string | Session ID |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | QR code generated |
| `400` | Already connected |
| `404` | QR not available yet |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `qr` | string | No | QR code string |
| `base64` | string | No | Base64 data URL for image |

**Response Example (`200`):**

```json
{
  "status": true,
  "message": "QR code generated",
  "data": {
    "success": true,
    "qr": "2@AbCdEfGhIjKlMnOp...",
    "base64": "data:image/png;base64,iVBORw0KGgo..."
  }
}
```

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/sessions/sales-01/qr" \
  -H "X-API-Key: your-api-key"
```

---

### \[GET\] /sessions/{id}/bot-config

**Get bot configuration**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Bot configuration retrieved |

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/sessions/abc123/bot-config" \
  -H "X-API-Key: your-api-key"
```

---

### \[POST\] /sessions/{id}/bot-config

**Update bot configuration**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `enabled` | boolean | No | — |
| `botMode` | string | No | **Options:** `OWNER`, `SPECIFIC`, `BLACKLIST`, `ALL` |
| `botAllowedJids` | array of string | No | — |
| `botBlockedJids` | array of string | No | — |
| `autoReplyMode` | string | No | **Options:** `OWNER`, `SPECIFIC`, `BLACKLIST`, `ALL` |
| `autoReplyAllowedJids` | array of string | No | — |
| `autoReplyBlockedJids` | array of string | No | — |
| `botName` | string | No | — |
| `enableSticker` | boolean | No | — |
| `enableVideoSticker` | boolean | No | — |
| `maxStickerDuration` | integer | No | — |
| `enablePing` | boolean | No | — |
| `enableUptime` | boolean | No | — |
| `removeBgApiKey` | string, nullable | No | — |

**Example:**

```json
{
  "enabled": true,
  "botMode": "BLACKLIST",
  "botBlockedJids": [
    "628123456789@s.whatsapp.net"
  ],
  "autoReplyMode": "SPECIFIC",
  "autoReplyAllowedJids": [
    "628123456789@s.whatsapp.net"
  ],
  "botName": "My Assistant",
  "enableSticker": true
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Configuration updated |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `404` | Session not found |
| `500` | Internal Server Error |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | No | — |
| `sessionId` | string | No | — |
| `enabled` | boolean | No | — |
| `botMode` | string | No | — |
| `botAllowedJids` | array of string | No | — |
| `autoReplyMode` | string | No | — |
| `autoReplyAllowedJids` | array of string | No | — |
| `botName` | string | No | — |
| `enableSticker` | boolean | No | — |
| `enableVideoSticker` | boolean | No | — |
| `maxStickerDuration` | integer | No | — |
| `enablePing` | boolean | No | — |
| `enableUptime` | boolean | No | — |
| `removeBgApiKey` | string, nullable | No | — |
| `createdAt` | string (date-time) | No | — |
| `updatedAt` | string (date-time) | No | — |

**Response Example (`200`):**

```json
{
  "id": "string",
  "sessionId": "string",
  "enabled": true,
  "botMode": "string",
  "botAllowedJids": [
    "string"
  ],
  "autoReplyMode": "string",
  "autoReplyAllowedJids": [
    "string"
  ],
  "botName": "string",
  "enableSticker": true,
  "enableVideoSticker": true,
  "maxStickerDuration": 0,
  "enablePing": true,
  "enableUptime": true,
  "removeBgApiKey": "string",
  "createdAt": "2026-01-15T08:00:00.000Z",
  "updatedAt": "2026-01-15T08:00:00.000Z"
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/sessions/abc123/bot-config" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"enabled":true,"botMode":"BLACKLIST","botBlockedJids":["628123456789@s.whatsapp.net"],"autoReplyMode":"SPECIFIC","autoReplyAllowedJids":["628123456789@s.whatsapp.net"],"botName":"My Assistant","enableSticker":true}'
```

---

### \[GET\] /sessions/{id}

**Get session details**

Get detailed information about a specific session including uptime and status

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Session details |
| `404` | Session not found |

**Response Example (`200`):**

```json
{
  "id": "clx123abc",
  "name": "Marketing Bot",
  "sessionId": "marketing-1",
  "status": "Connected",
  "userId": "string",
  "botConfig": {
    "text": "Hello from WA-AKG!"
  },
  "webhooks": [
    {
      "text": "Hello from WA-AKG!"
    }
  ],
  "_count": {
    "contacts": 0,
    "messages": 0,
    "groups": 0,
    "autoReplies": 0,
    "scheduledMessages": 0
  },
  "createdAt": "2026-01-15T08:00:00.000Z",
  "updatedAt": "2026-01-15T08:00:00.000Z",
  "uptime": 0,
  "messageCount": 0,
  "hasInstance": true,
  "me": {
    "text": "Hello from WA-AKG!"
  }
}
```

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/sessions/abc123" \
  -H "X-API-Key: your-api-key"
```

---

### \[POST\] /sessions/{id}/{action}

**Perform session action**

Start, stop, restart, or logout a session

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | path | ✅ Yes | string | — |
| `action` | path | ✅ Yes | string | **Options:** `start`, `stop`, `restart`, `logout` |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Action performed successfully |
| `400` | Invalid action |
| `500` | Action failed |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | boolean | No | — |
| `message` | string | No | — |
| `data` | object, nullable | No | — |

**Response Example (`200`):**

```json
{
  "status": true,
  "message": "Operation successful",
  "data": {
    "text": "Hello from WA-AKG!"
  }
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/sessions/abc123/start" \
  -H "X-API-Key: your-api-key"
```

---

### \[PATCH\] /sessions/{id}/settings

**Update session settings**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `config` | object | No | — |

**Example:**

```json
{
  "config": {
    "readReceipts": true,
    "rejectCalls": true
  }
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Settings updated |

#### cURL Example

```bash
curl -X PATCH "http://localhost:3000/api/sessions/abc123/settings" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"config":{"readReceipts":true,"rejectCalls":true}}'
```

---

### \[DELETE\] /sessions/{id}/settings

**Delete session and logout**

Permanently deletes session and logs out from WhatsApp

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Session deleted |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | boolean | No | — |
| `message` | string | No | — |
| `data` | object, nullable | No | — |

**Response Example (`200`):**

```json
{
  "status": true,
  "message": "Operation successful",
  "data": {
    "text": "Hello from WA-AKG!"
  }
}
```

#### cURL Example

```bash
curl -X DELETE "http://localhost:3000/api/sessions/abc123/settings" \
  -H "X-API-Key: your-api-key"
```

---

## 📂 Session Access

### \[GET\] /sessions/{sessionId}/access

**List users with shared access**

Get all users who have been granted access to the specified session. Only the session owner or SUPERADMIN can use this endpoint.

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | Session ID (slug or CUID) |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Access list retrieved |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Only session owner can manage access |
| `404` | Session not found |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | boolean | No | — |
| `message` | string | No | — |
| `data` | array of object | No | — |

**Response Example (`200`):**

```json
{
  "status": true,
  "message": "Access list retrieved successfully",
  "data": [
    {
      "id": "string",
      "sessionId": "string",
      "userId": "string",
      "createdAt": "2026-01-15T08:00:00.000Z",
      "user": {
        "id": "string",
        "name": "string",
        "email": "string",
        "role": "string"
      }
    }
  ]
}
```

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/sessions/marketing-1/access" \
  -H "X-API-Key: your-api-key"
```

---

### \[POST\] /sessions/{sessionId}/access

**Grant access to another user**

Grant session access to another registered user by email. Only the session owner or SUPERADMIN can use this endpoint. Cannot grant access to the session owner or SUPERADMINs.

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | Session ID (slug or CUID) |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `email` | string (email) | ✅ Yes | Email of the user to grant access |

**Example:**

```json
{
  "email": "staff@example.com"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `201` | Access granted successfully |
| `400` | Validation error / Cannot grant to owner / SUPERADMIN already has access |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Only session owner can manage access |
| `404` | Session or user not found |
| `409` | User already has access to this session |

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/sessions/marketing-1/access" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"email":"staff@example.com"}'
```

---

### \[DELETE\] /sessions/{sessionId}/access

**Revoke user access**

Remove shared access for a user from the specified session. Only the session owner or SUPERADMIN can use this endpoint.

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | Session ID (slug or CUID) |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `userId` | string | ✅ Yes | CUID of the user to revoke access from |

**Example:**

```json
{
  "userId": "clx456ghi"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Access revoked successfully |
| `400` | Validation error |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Only session owner can manage access |
| `404` | Session or access record not found |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | boolean | No | — |
| `message` | string | No | — |
| `data` | object, nullable | No | — |

**Response Example (`200`):**

```json
{
  "status": true,
  "message": "Operation successful",
  "data": {
    "text": "Hello from WA-AKG!"
  }
}
```

#### cURL Example

```bash
curl -X DELETE "http://localhost:3000/api/sessions/marketing-1/access" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"userId":"clx456ghi"}'
```

---

## 📂 Messaging

### \[POST\] /messages/{sessionId}/{jid}/send

**Send message (text/media/sticker)**

Universal endpoint for sending text, images, videos, documents, and stickers. Supports mentions and all WhatsApp message types.

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | Session identifier |
| `jid` | path | ✅ Yes | string | Recipient JID |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `message` | object | ✅ Yes | Message content (text, image, sticker, etc.) |
| `mentions` | array of string | No | List of JIDs to mention (for group messages) |

**Example:**

```json
{
  "message": {
    "text": "Hello from WA-AKG!"
  },
  "mentions": [
    "628123456789@s.whatsapp.net"
  ]
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Message sent successfully |
| `400` | Invalid request - jid and message are required |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `404` | Session not found or disconnected |
| `500` | Failed to send message |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | boolean | No | — |
| `message` | string | No | — |
| `data` | object, nullable | No | — |

**Response Example (`200`):**

```json
{
  "status": true,
  "message": "Message sent successfully",
  "data": {
    "key": {
      "remoteJid": "628123456789@s.whatsapp.net",
      "fromMe": true,
      "id": "3EB01234567890"
    },
    "message": {
      "conversation": "Hello from WA-AKG!"
    },
    "messageTimestamp": "1678901234"
  }
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/messages/sales-01/628123456789@s.whatsapp.net/send" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"message":{"text":"Hello from WA-AKG!"},"mentions":["628123456789@s.whatsapp.net"]}'
```

---

### \[POST\] /messages/{sessionId}/{jid}/media

**Send media (image/video/audio/document)**

Send file using multipart/form-data

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | Session identifier |
| `jid` | path | ✅ Yes | string | Recipient JID |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`multipart/form-data`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `file` | string (binary) | ✅ Yes | — |
| `type` | string | ✅ Yes | **Options:** `image`, `video`, `audio`, `voice`, `document`, `sticker` **Default:** `image` |
| `caption` | string | No | — |

**Example:**

```json
{
  "file": "(binary)",
  "type": "image",
  "caption": "string"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Media sent successfully |
| `400` | Bad Request - File missing |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to send media |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | boolean | No | — |
| `message` | string | No | — |
| `data` | object, nullable | No | — |

**Response Example (`200`):**

```json
{
  "status": true,
  "message": "Operation successful",
  "data": {
    "text": "Hello from WA-AKG!"
  }
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/messages/session-01/628123456789@s.whatsapp.net/media" \
  -H "X-API-Key: your-api-key" \
  -F "file=@/path/to/file.jpg" \
  -F "type=image" \
  -F "caption=Hello"
```

---

### \[POST\] /messages/{sessionId}/broadcast

**Broadcast message to multiple recipients**

Send same message to multiple contacts with anti-ban delays (10-20s random)

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `recipients` | array of string | ✅ Yes | — |
| `message` | string | ✅ Yes | — |
| `delay` | number | No | Optional delay (unused) |

**Example:**

```json
{
  "recipients": [
    "628123456789@s.whatsapp.net",
    "628987654321@s.whatsapp.net"
  ],
  "message": "Flash Sale! 50% off",
  "delay": 0
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Broadcast started |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to start broadcast |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `message` | string | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "message": "Broadcast started in background"
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/messages/session-01/broadcast" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"recipients":["628123456789@s.whatsapp.net","628987654321@s.whatsapp.net"],"message":"Flash Sale! 50% off","delay":0}'
```

---

### [GET] /messages/{sessionId}/broadcast/history

**Get broadcast history**

Retrieve list of past broadcasts with status, sent/failed counts.

#### Parameters

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sessionId` | string | Yes | Session ID (path) |
| `limit` | integer | No | Max results (default: 20, max: 50) |
| `offset` | integer | No | Pagination offset |

**Response Fields (`200`):**

| Field | Type | Description |
| :--- | :--- | :--- |
| `status` | boolean | Success indicator |
| `data` | array | List of BroadcastLog objects |
| `total` | integer | Total count |
| `limit` | integer | Requested limit |
| `offset` | integer | Requested offset |

**BroadcastLog object:**

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | string | Broadcast log ID |
| `message` | string | Broadcast message content |
| `total` | integer | Total recipients |
| `sent` | integer | Successfully sent count |
| `failed` | integer | Failed count |
| `status` | string | `running`, `completed`, `cancelled` |
| `startedAt` | datetime | Start time |
| `completedAt` | datetime | Completion time (nullable) |

**Status Codes:**

| Code | Description |
| :--- | :--- |
| `200` | Broadcast history retrieved |
| `401` | Unauthorized |
| `403` | Forbidden |

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/messages/session-01/broadcast/history" \
  -H "X-API-Key: your-api-key"
```

---

### [GET] /messages/{sessionId}/broadcast/history/{logId}

**Get broadcast detail**

Retrieve full detail of a specific broadcast including per-recipient status.

#### Parameters

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sessionId` | string | Yes | Session ID (path) |
| `logId` | string | Yes | Broadcast log ID (path) |

**BroadcastRecipient object:**

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | string | Recipient record ID |
| `jid` | string | WhatsApp JID |
| `status` | string | `pending`, `sent`, `failed` |
| `error` | string | Error message if failed (nullable) |
| `sentAt` | datetime | Sent timestamp (nullable) |

**Status Codes:**

| Code | Description |
| :--- | :--- |
| `200` | Broadcast detail retrieved |
| `401` | Unauthorized |
| `403` | Forbidden |
| `404` | Broadcast not found |

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/messages/session-01/broadcast/history/clxabc123" \
  -H "X-API-Key: your-api-key"
```

---

### [POST] /messages/{sessionId}/{jid}/poll

**Send poll message**

Create interactive poll (2-12 options, single or multiple choice)

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `question` | string | ✅ Yes | — |
| `options` | array of string | ✅ Yes | — |
| `selectableCount` | integer | No | — |

**Example:**

```json
{
  "question": "What's your favorite product?",
  "options": [
    "Product A",
    "Product B",
    "Product C"
  ],
  "selectableCount": 1
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Poll sent |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to send poll |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |

**Response Example (`200`):**

```json
{
  "success": true
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/messages/session-01/628123456789@s.whatsapp.net/poll" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"question":"What's your favorite product?","options":["Product A","Product B","Product C"],"selectableCount":1}'
```

---

### \[POST\] /messages/{sessionId}/{jid}/location

**Send location**

Share GPS coordinates with optional name and address

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `latitude` | number | ✅ Yes | — |
| `longitude` | number | ✅ Yes | — |
| `name` | string | No | — |
| `address` | string | No | — |

**Example:**

```json
{
  "latitude": -6.2088,
  "longitude": 106.8456,
  "name": "Central Park",
  "address": "Jakarta, Indonesia"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Location sent |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to send location |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |

**Response Example (`200`):**

```json
{
  "success": true
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/messages/session-01/628123456789@s.whatsapp.net/location" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"latitude":-6.2088,"longitude":106.8456,"name":"Central Park","address":"Jakarta, Indonesia"}'
```

---

### \[POST\] /messages/{sessionId}/{jid}/contact

**Send contact card**

Share one or multiple contact vCards

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `contacts` | array of object | ✅ Yes | — |

**Example:**

```json
{
  "contacts": [
    {
      "displayName": "John Doe",
      "vcard": "BEGIN:VCARD..."
    }
  ]
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Contact sent |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to send contact |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |

**Response Example (`200`):**

```json
{
  "success": true
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/messages/session-01/628123456789@s.whatsapp.net/contact" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"contacts":[{"displayName":"John Doe","vcard":"BEGIN:VCARD..."}]}'
```

---

### \[GET\] /messages/{sessionId}/download/{messageId}/media

**Download message media**

Download media from a message (direct binary or redirect)

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `messageId` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Binary media file |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Cannot access session or message |
| `404` | Message not found or has no media |

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/messages/session-01/download/MSG_ID_123/media" \
  -H "X-API-Key: your-api-key"
```

---

### \[POST\] /messages/{sessionId}/{jid}/{messageId}/react

**React to message with emoji**

Add emoji reaction to a message (empty string removes reaction)

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |
| `messageId` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `emoji` | string | ✅ Yes | Emoji or empty string to remove |

**Example:**

```json
{
  "emoji": "👍"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Reaction sent |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to send reaction |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `message` | string | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "message": "string"
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/messages/session-01/628123456789@s.whatsapp.net/MSG_ID_123/react" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"emoji":"👍"}'
```

---

### \[POST\] /messages/{sessionId}/{jid}/{messageId}/reply

**Reply to a message (quoted reply)**

Send a quoted reply to a specific message by its ID. Uses same request format as /send — pass a Baileys message object.

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |
| `messageId` | path | ✅ Yes | string | ID of message to reply to |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `message` | object | ✅ Yes | Message content — same format as /send (text, image, video, etc.) |
| `mentions` | array of string | No | JIDs to mention |
| `fromMe` | boolean | No | Whether the quoted message was sent by you **Default:** `false` |

**Example:**

```json
{
  "message": {
    "text": "Thanks for your message!"
  },
  "mentions": [
    "628123456789@s.whatsapp.net"
  ],
  "fromMe": true
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Reply sent successfully |
| `400` | message is required |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to send reply |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `message` | string | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "message": "Message sent successfully"
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/messages/sales-01/628123456789@s.whatsapp.net/3EB0ABCD1234567890/reply" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"message":{"text":"Thanks for your message!"},"mentions":["628123456789@s.whatsapp.net"],"fromMe":true}'
```

---

### \[POST\] /messages/{sessionId}/{jid}/reply

**Reply to a message (body-based)**

Send a quoted reply with messageId provided in the request body. Same request format as /send with added messageId.

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `messageId` | string | ✅ Yes | ID of the message to reply to |
| `message` | object | ✅ Yes | Message content — same format as /send (text, image, video, etc.) |
| `mentions` | array of string | No | JIDs to mention |
| `fromMe` | boolean | No | Whether the quoted message was sent by you **Default:** `false` |

**Example:**

```json
{
  "messageId": "3EB0ABCD1234567890",
  "message": {
    "text": "Sure, let me check that for you!"
  }
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Reply sent successfully |
| `400` | messageId and message required |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to send reply |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | boolean | No | — |
| `message` | string | No | — |
| `data` | object, nullable | No | — |

**Response Example (`200`):**

```json
{
  "status": true,
  "message": "Operation successful",
  "data": {
    "text": "Hello from WA-AKG!"
  }
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/messages/sales-01/628123456789@s.whatsapp.net/reply" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"messageId":"3EB0ABCD1234567890","message":{"text":"Sure, let me check that for you!"}}'
```

---

### \[POST\] /messages/{sessionId}/{jid}/{messageId}/star

**Star or unstar a message**

Mark a message as starred (saved) or remove the star. Starred messages appear in the Starred Messages section.

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |
| `messageId` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `star` | boolean | No | true to star, false to unstar **Default:** `true` |
| `fromMe` | boolean | No | Whether the message was sent by you **Default:** `false` |

**Example:**

```json
{
  "star": true,
  "fromMe": false
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Star status updated |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to star/unstar message |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `message` | string | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "message": "Message starred"
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/messages/session-01/628123456789@s.whatsapp.net/MSG_ID_123/star" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"star":true,"fromMe":false}'
```

---

### \[GET\] /messages/{sessionId}/search

**Search messages**

Search messages stored in the database for a session. Supports full-text search, filtering by JID, type, and sender.

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `q` | query | No | string | Text to search for in message content |
| `jid` | query | No | string | Filter by chat JID |
| `type` | query | No | string | Filter by message type **Options:** `TEXT`, `IMAGE`, `VIDEO`, `AUDIO`, `DOCUMENT`, `STICKER`, `LOCATION`, `CONTACT` |
| `fromMe` | query | No | boolean | Filter by sender (true=outgoing, false=incoming) |
| `page` | query | No | integer | **Default:** `1` |
| `limit` | query | No | integer | **Default:** `20` |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Search results |
| `400` | q or jid is required |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `404` | Session not found |
| `500` | Failed to search messages |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `data` | array of object | No | — |
| `pagination` | object | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "data": [
    {
      "id": "string",
      "remoteJid": "string",
      "fromMe": true,
      "keyId": "string",
      "pushName": "string",
      "type": "string",
      "content": "string",
      "status": "string",
      "timestamp": "2026-01-15T08:00:00.000Z",
      "quoteId": "string"
    }
  ],
  "pagination": {
    "total": 0,
    "page": 0,
    "limit": 0,
    "pages": 0
  }
}
```

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/messages/sales-01/search?q=invoice&jid=628123456789@s.whatsapp.net&type=value&fromMe=value&page=value&limit=value" \
  -H "X-API-Key: your-api-key"
```

---

### \[POST\] /messages/{sessionId}/{jid}/list

**Send list message**

Send a formatted numbered list message

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `title` | string | ✅ Yes | — |
| `options` | array of string | ✅ Yes | — |
| `footer` | string | No | — |

**Example:**

```json
{
  "title": "Our Services",
  "options": [
    "Web Dev",
    "App Dev",
    "UI/UX"
  ],
  "footer": "Choose one"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Message sent |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to send message |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |

**Response Example (`200`):**

```json
{
  "success": true
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/messages/session-01/628123456789@s.whatsapp.net/list" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"title":"Our Services","options":["Web Dev","App Dev","UI/UX"],"footer":"Choose one"}'
```

---

### \[POST\] /messages/{sessionId}/{jid}/spam

**Message bombing (Spam)**

Send a message multiple times in a row in the background

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `message` | string | ✅ Yes | — |
| `count` | integer | No | **Default:** `10` |
| `delay` | integer | No | Delay in ms **Default:** `500` |

**Example:**

```json
{
  "message": "Check our new catalog!",
  "count": 5,
  "delay": 1000
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Spam started |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to start spam |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `message` | string | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "message": "string"
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/messages/session-01/628123456789@s.whatsapp.net/spam" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"message":"Check our new catalog!","count":5,"delay":1000}'
```

---

### \[POST\] /messages/{sessionId}/{jid}/sticker

**Send sticker**

Convert an image to sticker and send it

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`multipart/form-data`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `file` | string (binary) | ✅ Yes | — |
| `pack` | string | No | Sticker pack name (default: WA-AKG) |
| `author` | string | No | Sticker author name (default: User) |
| `type` | string | No | Sticker crop type (default: full) **Options:** `full`, `crop`, `circle` |
| `quality` | integer | No | Image quality (default: 50) |

**Example:**

```json
{
  "file": "(binary)",
  "pack": "string",
  "author": "string",
  "type": "full",
  "quality": 0
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Sticker sent |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to create sticker |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |

**Response Example (`200`):**

```json
{
  "success": true
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/messages/session-01/628123456789@s.whatsapp.net/sticker" \
  -H "X-API-Key: your-api-key" \
  -F "file=@/path/to/file.jpg" \
  -F "type=image" \
  -F "caption=Hello"
```

---

### \[POST\] /messages/{sessionId}/forward

**Forward message**

Forward a message to one or multiple chats

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `fromJid` | string | ✅ Yes | Source chat JID |
| `messageId` | string | ✅ Yes | — |
| `toJids` | array of string | ✅ Yes | Recipient JIDs |

**Example:**

```json
{
  "fromJid": "628123456789@s.whatsapp.net",
  "messageId": "3EB0ABCD1234567890",
  "toJids": [
    "628987654321@s.whatsapp.net"
  ]
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Message forwarded |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to forward message |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `message` | string | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "message": "string"
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/messages/session-01/forward" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"fromJid":"628123456789@s.whatsapp.net","messageId":"3EB0ABCD1234567890","toJids":["628987654321@s.whatsapp.net"]}'
```

---

### \[DELETE\] /messages/{sessionId}/{jid}/{messageId}

**Delete message for everyone**

Delete message (only works for messages < 7 minutes old)

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |
| `messageId` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Message deleted |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to delete message |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `message` | string | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "message": "Message deleted for everyone"
}
```

#### cURL Example

```bash
curl -X DELETE "http://localhost:3000/api/messages/session-01/628123456789@s.whatsapp.net/MSG_ID_123" \
  -H "X-API-Key: your-api-key"
```

---

### \[PATCH\] /messages/{sessionId}/{jid}/{messageId}

**Edit a sent message**

Edit text of a sent message

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |
| `messageId` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `text` | string | ✅ Yes | — |

**Example:**

```json
{
  "text": "Updated text message"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Message edited |
| `400` | Bad Request |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to edit message |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | boolean | No | — |
| `message` | string | No | — |

**Response Example (`200`):**

```json
{
  "status": true,
  "message": "Message edited successfully"
}
```

#### cURL Example

```bash
curl -X PATCH "http://localhost:3000/api/messages/session-01/628123456789@s.whatsapp.net/MSG_ID_123" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"text":"Updated text message"}'
```

---

## 📂 Chat

### \[GET\] /chat/{sessionId}

**Get chat list with contacts**

Retrieve all contacts with last message for a session

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Chat list |

**Response Example (`200`):**

```json
[
  {
    "jid": "628123456789@s.whatsapp.net",
    "name": "John Doe",
    "notify": "string",
    "profilePic": "string"
  }
]
```

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/chat/session-01" \
  -H "X-API-Key: your-api-key"
```

---

### \[GET\] /chat/{sessionId}/{jid}

**Get message history**

Fetch up to 100 messages for a chat (enriched with participant info for groups)

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | URL-encoded JID |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Message history (max 100 messages) |

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/chat/session-01/628123456789@s.whatsapp.net" \
  -H "X-API-Key: your-api-key"
```

---

### \[PUT\] /chat/{sessionId}/{jid}/read

**Mark messages as read**

Mark specific messages or entire chat as read using RESTful path parameters

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | Session identifier |
| `jid` | path | ✅ Yes | string | URL-encoded WhatsApp JID |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `messageIds` | array of string | No | Optional: specific message IDs to mark as read. If not provided, marks entire chat as read |

**Example:**

```json
{
  "messageIds": [
    "string"
  ]
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Messages marked as read |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to mark messages as read |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `message` | string | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "message": "Messages marked as read"
}
```

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/chat/session-01/628123456789@s.whatsapp.net/read" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"messageIds":["string"]}'
```

---

### \[PUT\] /chat/{sessionId}/{jid}/archive

**Archive/unarchive chat**

Archive or unarchive a chat using RESTful path parameters

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | URL-encoded JID |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `archive` | boolean | ✅ Yes | true to archive, false to unarchive |

**Example:**

```json
{
  "archive": true
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Chat archived/unarchived |
| `400` | Missing required fields |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to archive/unarchive chat |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `message` | string | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "message": "Chat archived"
}
```

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/chat/session-01/628123456789@s.whatsapp.net/archive" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"archive":true}'
```

---

### \[PUT\] /chat/{sessionId}/{jid}/mute

**Mute/unmute chat**

Mute chat with optional duration (default 8 hours)

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | URL-encoded JID |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `mute` | boolean | ✅ Yes | — |
| `duration` | integer | No | Duration in seconds (default: 8 hours) |

**Example:**

```json
{
  "mute": true,
  "duration": 3600
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Chat muted/unmuted |
| `400` | Missing required fields |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to mute/unmute chat |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `message` | string | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "message": "Chat muted"
}
```

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/chat/session-01/628123456789@s.whatsapp.net/mute" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"mute":true,"duration":3600}'
```

---

### \[PUT\] /chat/{sessionId}/{jid}/pin

**Pin/unpin chat**

Pin or unpin a chat

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | URL-encoded JID |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `pin` | boolean | ✅ Yes | — |

**Example:**

```json
{
  "pin": true
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Chat pinned/unpinned |
| `400` | Missing required fields |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to pin/unpin chat |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `message` | string | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "message": "Chat pinned"
}
```

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/chat/session-01/628123456789@s.whatsapp.net/pin" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"pin":true}'
```

---

### \[POST\] /chat/{sessionId}/{jid}/presence

**Send presence (typing/recording)**

Send presence status (typing, recording, online, etc.) to a chat

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | URL-encoded JID |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `presence` | string | ✅ Yes | **Options:** `composing`, `recording`, `paused`, `available`, `unavailable` |

**Example:**

```json
{
  "presence": "composing"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Presence sent |
| `400` | Missing required fields or invalid presence |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to send presence |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `message` | string | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "message": "Presence 'composing' sent to 628123456789@s.whatsapp.net"
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/chat/session-01/628123456789@s.whatsapp.net/presence" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"presence":"composing"}'
```

---

### \[POST\] /chat/{sessionId}/{jid}/profile-picture

**Get profile picture URL**

Get profile picture URL for a contact or group

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | URL-encoded JID |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Profile picture URL |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to fetch profile picture |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `jid` | string | No | — |
| `profilePicUrl` | string, nullable | No | — |
| `message` | string | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "jid": "628123456789@s.whatsapp.net",
  "profilePicUrl": "https://pps.whatsapp.net/...",
  "message": "No profile picture found"
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/chat/session-01/628123456789@s.whatsapp.net/profile-picture" \
  -H "X-API-Key: your-api-key"
```

---

### \[POST\] /chat/{sessionId}/check

**Check if numbers exist on WhatsApp**

Validate phone numbers (max 50 per request)

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `numbers` | array of string | ✅ Yes | — |

**Example:**

```json
{
  "numbers": [
    "628123456789",
    "628987654321"
  ]
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Validation results |
| `400` | Missing required fields |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to check numbers |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `results` | array of object | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "results": [
    {
      "number": "string",
      "exists": true,
      "jid": "string",
      "error": "string"
    }
  ]
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/chat/session-01/check" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"numbers":["628123456789","628987654321"]}'
```

---

## 📂 Profile

### \[GET\] /profile/{sessionId}

**Get own profile**

Fetch profile information of the connected WhatsApp account

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Profile info |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `jid` | string | No | — |
| `status` | object | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "jid": "string",
  "status": {
    "text": "Hello from WA-AKG!"
  }
}
```

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/profile/session-01" \
  -H "X-API-Key: your-api-key"
```

---

### \[PUT\] /profile/{sessionId}/name

**Update profile name**

Update the WhatsApp display name (max 25 chars)

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | string | ✅ Yes | — |

**Example:**

```json
{
  "name": "string"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Name updated |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | boolean | No | — |
| `message` | string | No | — |
| `data` | object, nullable | No | — |

**Response Example (`200`):**

```json
{
  "status": true,
  "message": "Operation successful",
  "data": {
    "text": "Hello from WA-AKG!"
  }
}
```

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/profile/session-01/name" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"name":"string"}'
```

---

### \[PUT\] /profile/{sessionId}/status

**Update profile status**

Update the WhatsApp about/status (max 139 chars)

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | string | ✅ Yes | — |

**Example:**

```json
{
  "status": "string"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Status updated |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | boolean | No | — |
| `message` | string | No | — |
| `data` | object, nullable | No | — |

**Response Example (`200`):**

```json
{
  "status": true,
  "message": "Operation successful",
  "data": {
    "text": "Hello from WA-AKG!"
  }
}
```

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/profile/session-01/status" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"status":"string"}'
```

---

### \[DELETE\] /profile/{sessionId}/picture

**Remove profile picture**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Picture removed |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | boolean | No | — |
| `message` | string | No | — |
| `data` | object, nullable | No | — |

**Response Example (`200`):**

```json
{
  "status": true,
  "message": "Operation successful",
  "data": {
    "text": "Hello from WA-AKG!"
  }
}
```

#### cURL Example

```bash
curl -X DELETE "http://localhost:3000/api/profile/session-01/picture" \
  -H "X-API-Key: your-api-key"
```

---

### \[PUT\] /profile/{sessionId}/picture

**Update profile picture**

Upload a new profile picture

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`multipart/form-data`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `file` | string (binary) | ✅ Yes | — |

**Example:**

```json
{
  "file": "(binary)"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Picture updated |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | boolean | No | — |
| `message` | string | No | — |
| `data` | object, nullable | No | — |

**Response Example (`200`):**

```json
{
  "status": true,
  "message": "Operation successful",
  "data": {
    "text": "Hello from WA-AKG!"
  }
}
```

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/profile/session-01/picture" \
  -H "X-API-Key: your-api-key" \
  -F "file=@/path/to/file.jpg" \
  -F "type=image" \
  -F "caption=Hello"
```

---

## 📂 Auto Replies

### \[DELETE\] /autoreplies/{sessionId}

**Delete all autoreplies**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Autoreplies deleted |

#### cURL Example

```bash
curl -X DELETE "http://localhost:3000/api/autoreplies/session-01" \
  -H "X-API-Key: your-api-key"
```

---

## 📂 Auto Reply

### \[GET\] /autoreplies/{sessionId}

**List auto-reply rules**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | List of auto-reply rules |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `404` | Session not found |

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/autoreplies/session-01" \
  -H "X-API-Key: your-api-key"
```

---

### \[POST\] /autoreplies/{sessionId}

**Create auto-reply rule**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `keyword` | string | ✅ Yes | — |
| `response` | string | ✅ Yes | — |
| `matchType` | string | No | **Options:** `EXACT`, `CONTAINS`, `STARTS_WITH`, `REGEX` |
| `isMedia` | boolean | No | — |
| `mediaUrl` | string | No | — |
| `triggerType` | string | No | **Options:** `ALL`, `GROUP`, `PRIVATE` |

**Example:**

```json
{
  "keyword": "hello",
  "response": "Hi there! How can I help?",
  "matchType": "EXACT",
  "triggerType": "ALL",
  "isMedia": false
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Rule created |
| `400` | Missing required fields |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/autoreplies/session-01" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"keyword":"hello","response":"Hi there! How can I help?","matchType":"EXACT","triggerType":"ALL","isMedia":false}'
```

---

### \[DELETE\] /autoreplies/{sessionId}/{replyId}

**Delete auto-reply rule**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `replyId` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Rule deleted |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `404` | Rule not found |

#### cURL Example

```bash
curl -X DELETE "http://localhost:3000/api/autoreplies/session-01/reply_01" \
  -H "X-API-Key: your-api-key"
```

---

### \[PUT\] /autoreplies/{sessionId}/{replyId}

**Update auto-reply rule**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `replyId` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `keyword` | string | ✅ Yes | — |
| `response` | string | ✅ Yes | — |
| `isMedia` | boolean | No | — |
| `mediaUrl` | string | No | — |
| `triggerType` | string | No | **Options:** `ALL`, `GROUP`, `PRIVATE` |

**Example:**

```json
{
  "keyword": "hello",
  "response": "Hi there! How can I help?",
  "matchType": "EXACT",
  "triggerType": "ALL",
  "isMedia": false
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Rule updated |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `404` | Rule not found |

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/autoreplies/session-01/reply_01" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"keyword":"hello","response":"Hi there! How can I help?","matchType":"EXACT","triggerType":"ALL","isMedia":false}'
```

---

## 📂 Scheduler

### \[DELETE\] /scheduler/{sessionId}

**Delete all scheduled messages for a session**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Scheduled messages deleted |

#### cURL Example

```bash
curl -X DELETE "http://localhost:3000/api/scheduler/session-01" \
  -H "X-API-Key: your-api-key"
```

---

### \[GET\] /scheduler/{sessionId}

**List scheduled messages**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | List of scheduled messages |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `404` | Session not found |

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/scheduler/session-01" \
  -H "X-API-Key: your-api-key"
```

---

### \[POST\] /scheduler/{sessionId}

**Create scheduled message**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `jid` | string | ✅ Yes | — |
| `content` | string | ✅ Yes | — |
| `sendAt` | string (date-time) | ✅ Yes | — |
| `mediaUrl` | string | No | — |
| `mediaType` | string | No | **Options:** `image`, `video`, `document` |

**Example:**

```json
{
  "jid": "628123456789@s.whatsapp.net",
  "content": "Reminder: Meeting in 10 mins",
  "sendAt": "2024-12-25T10:00:00.000Z",
  "mediaUrl": "https://example.com/image.jpg",
  "mediaType": "image"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Scheduled message created |
| `400` | Missing required fields |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/scheduler/session-01" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"jid":"628123456789@s.whatsapp.net","content":"Reminder: Meeting in 10 mins","sendAt":"2024-12-25T10:00:00.000Z","mediaUrl":"https://example.com/image.jpg","mediaType":"image"}'
```

---

### \[DELETE\] /scheduler/{sessionId}/{scheduleId}

**Delete scheduled message**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `scheduleId` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Message deleted |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `404` | Message not found |

#### cURL Example

```bash
curl -X DELETE "http://localhost:3000/api/scheduler/session-01/sched_01" \
  -H "X-API-Key: your-api-key"
```

---

### \[PUT\] /scheduler/{sessionId}/{scheduleId}

**Update scheduled message**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `scheduleId` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `jid` | string | ✅ Yes | — |
| `content` | string | ✅ Yes | — |
| `sendAt` | string (date-time) | ✅ Yes | — |
| `mediaUrl` | string | No | — |
| `mediaType` | string | No | **Options:** `image`, `video`, `document` |

**Example:**

```json
{
  "jid": "628123456789@s.whatsapp.net",
  "content": "Updated meeting reminder",
  "sendAt": "2024-12-25T11:00:00.000Z",
  "mediaUrl": "https://example.com/image.jpg",
  "mediaType": "image"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Message updated |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `404` | Message not found |

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/scheduler/session-01/sched_01" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"jid":"628123456789@s.whatsapp.net","content":"Updated meeting reminder","sendAt":"2024-12-25T11:00:00.000Z","mediaUrl":"https://example.com/image.jpg","mediaType":"image"}'
```

---

### \[POST\] /scheduler

**Create a scheduled message task**

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Scheduled task created |

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/scheduler" \
  -H "X-API-Key: your-api-key"
```

---

## 📂 Webhooks

### \[GET\] /webhooks/{sessionId}

**List webhooks for a session**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | List of webhooks |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/webhooks/session-01" \
  -H "X-API-Key: your-api-key"
```

---

### \[POST\] /webhooks/{sessionId}

**Create a webhook**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | string | ✅ Yes | — |
| `url` | string | ✅ Yes | — |
| `secret` | string | No | — |
| `events` | array of string | ✅ Yes | — |

**Example:**

```json
{
  "name": "string",
  "url": "string",
  "secret": "string",
  "events": [
    "string"
  ]
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Webhook created |
| `400` | Invalid input |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/webhooks/session-01" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"name":"string","url":"string","secret":"string","events":["string"]}'
```

---

### \[DELETE\] /webhooks/{sessionId}/{id}

**Delete webhook**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `id` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Webhook deleted |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `404` | Webhook not found |

#### cURL Example

```bash
curl -X DELETE "http://localhost:3000/api/webhooks/session-01/abc123" \
  -H "X-API-Key: your-api-key"
```

---

### \[PUT\] /webhooks/{sessionId}/{id}

**Update webhook**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `id` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | string | No | — |
| `url` | string | No | — |
| `secret` | string | No | — |
| `events` | array of string | No | — |
| `isActive` | boolean | No | — |

**Example:**

```json
{
  "name": "string",
  "url": "string",
  "secret": "string",
  "events": [
    "string"
  ],
  "isActive": true
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Webhook updated |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `404` | Webhook not found |

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/webhooks/session-01/abc123" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"name":"string","url":"string","secret":"string","events":["string"],"isActive":true}'
```

---

### \[DELETE\] /webhooks/{id}

**Delete webhook**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Webhook deleted |
| `401` | Unauthorized - Invalid or missing API key |
| `404` | Webhook not found |
| `500` | Internal Server Error |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |

**Response Example (`200`):**

```json
{
  "success": true
}
```

#### cURL Example

```bash
curl -X DELETE "http://localhost:3000/api/webhooks/abc123" \
  -H "X-API-Key: your-api-key"
```

---

### \[POST\] /webhooks/{sessionId}/{id}/test

**Test webhook endpoint**

Fire a test payload to verify the webhook endpoint is reachable and responding correctly.

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `id` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Test result |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `404` | Webhook not found |

**Response Fields (`200`):**

| Field | Type | Description |
| :--- | :--- | :--- |
| `status` | boolean | Operation status |
| `message` | string | Success/failure message |
| `data.success` | boolean | Whether the test request succeeded |
| `data.statusCode` | integer (nullable) | HTTP status code returned by webhook |
| `data.responseBody` | string (nullable) | Response body from webhook |
| `data.responseTimeMs` | integer | Response time in milliseconds |
| `data.error` | string (nullable) | Error message if failed |

**Response Example:**

```json
{
  "status": true,
  "message": "Webhook test successful",
  "data": {
    "success": true,
    "statusCode": 200,
    "responseBody": "OK",
    "responseTimeMs": 234
  }
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/webhooks/session-01/abc123/test" \
  -H "X-API-Key: your-api-key"
```

---

### \[GET\] /webhooks/{sessionId}/{id}/logs

**Get webhook delivery logs**

Retrieve delivery history for a specific webhook including status, response time, and error messages.

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `id` | path | ✅ Yes | string | — |
| `limit` | query | No | integer | Max logs to return (default: 50) |
| `offset` | query | No | integer | Pagination offset (default: 0) |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Webhook delivery logs |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `404` | Webhook not found |

**Response Fields (`200`):**

| Field | Type | Description |
| :--- | :--- | :--- |
| `status` | boolean | Operation status |
| `data` | array of object | Delivery log entries |
| `total` | integer | Total log count |
| `limit` | integer | Requested limit |
| `offset` | integer | Requested offset |

**Log Entry Fields:**

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | string | Log entry ID |
| `webhookId` | string | Associated webhook ID |
| `event` | string | Event that triggered the webhook |
| `status` | string | SUCCESS or FAILED |
| `requestUrl` | string | Webhook URL called |
| `responseStatusCode` | integer (nullable) | HTTP response status |
| `responseBody` | string (nullable) | Response body |
| `responseTimeMs` | integer (nullable) | Response time in milliseconds |
| `errorMessage` | string (nullable) | Error message if failed |
| `createdAt` | string (date-time) | When the delivery occurred |

**Response Example:**

```json
{
  "status": true,
  "data": [
    {
      "id": "cmk123abc",
      "webhookId": "abc123",
      "event": "message.received",
      "status": "SUCCESS",
      "requestUrl": "https://example.com/webhook",
      "responseStatusCode": 200,
      "responseBody": "OK",
      "responseTimeMs": 145,
      "errorMessage": null,
      "createdAt": "2026-06-28T10:30:00.000Z"
    }
  ],
  "total": 1,
  "limit": 50,
  "offset": 0
}
```

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/webhooks/session-01/abc123/logs?limit=50&offset=0" \
  -H "X-API-Key: your-api-key"
```

---

## 🔐 Webhook HMAC Verification

WA-AKG signs every webhook request with HMAC-SHA256 when you set a `secret` on your webhook. Receiver **must** verify signature before processing payload.

### How It Works

When secret set, WA-AKG sends header:

```
X-Webhook-Signature: sha256=<hex-encoded-hmac>
```

Signature = HMAC-SHA256(webhook-secret, raw-request-body).

### Verify Examples

#### Node.js (Express)

```javascript
import crypto from "crypto";

const WEBHOOK_SECRET = "your-webhook-secret"; // same as set in WA-AKG

app.post("/webhook", express.raw({ type: "application/json" }), (req, res) => {
  const sig = req.headers["x-webhook-signature"];
  if (!sig) return res.status(401).send("Missing signature");

  // Extract hash from "sha256=<hex>"
  const expected = sig.replace("sha256=", "");
  const actual = crypto
    .createHmac("sha256", WEBHOOK_SECRET)
    .update(req.body)
    .digest("hex");

  if (expected !== actual) {
    return res.status(401).send("Invalid signature");
  }

  const payload = JSON.parse(req.body);
  console.log("Verified webhook:", payload.event);
  res.sendStatus(200);
});
```

#### Node.js (Raw HTTP)

```javascript
import crypto from "crypto";
import { createServer } from "http";

const WEBHOOK_SECRET = "your-webhook-secret";

createServer((req, res) => {
  if (req.method !== "POST") return res.writeHead(405).end();

  let body = "";
  req.on("data", (chunk) => (body += chunk));
  req.on("end", () => {
    const sig = req.headers["x-webhook-signature"];
    if (!sig) return res.writeHead(401).end("Missing signature");

    const expected = sig.replace("sha256=", "");
    const actual = crypto
      .createHmac("sha256", WEBHOOK_SECRET)
      .update(body)
      .digest("hex");

    if (expected !== actual) {
      return res.writeHead(401).end("Invalid signature");
    }

    const payload = JSON.parse(body);
    console.log("Verified:", payload.event);
    res.writeHead(200).end("OK");
  });
}).listen(3001);
```

#### Python (Flask)

```python
import hmac
import hashlib
from flask import Flask, request, abort

app = Flask(__name__)
WEBHOOK_SECRET = b"your-webhook-secret"  # same as set in WA-AKG

@app.route("/webhook", methods=["POST"])
def webhook():
    sig = request.headers.get("X-Webhook-Signature", "")
    if not sig:
        abort(401, "Missing signature")

    expected = sig.replace("sha256=", "")
    actual = hmac.new(WEBHOOK_SECRET, request.data, hashlib.sha256).hexdigest()

    if not hmac.compare_digest(expected, actual):
        abort(401, "Invalid signature")

    payload = request.json
    print(f"Verified: {payload['event']}")
    return "OK", 200
```

#### Python (FastAPI)

```python
import hmac
import hashlib
from fastapi import FastAPI, Request, HTTPException

app = FastAPI()
WEBHOOK_SECRET = b"your-webhook-secret"

@app.post("/webhook")
async def webhook(req: Request):
    sig = req.headers.get("x-webhook-signature", "")
    if not sig:
        raise HTTPException(401, "Missing signature")

    body = await req.body()
    expected = sig.replace("sha256=", "")
    actual = hmac.new(WEBHOOK_SECRET, body, hashlib.sha256).hexdigest()

    if not hmac.compare_digest(expected, actual):
        raise HTTPException(401, "Invalid signature")

    payload = await req.json()
    print(f"Verified: {payload['event']}")
    return "OK"
```

#### PHP

```php
<?php
$secret = 'your-webhook-secret';
$body = file_get_contents('php://input');
$sig = $_SERVER['HTTP_X_WEBHOOK_SIGNATURE'] ?? '';

$expected = str_replace('sha256=', '', $sig);
$actual = hash_hmac('sha256', $body, $secret);

if (!hash_equals($expected, $actual)) {
    http_response_code(401);
    die('Invalid signature');
}

$payload = json_decode($body);
error_log('Verified: ' . $payload->event);
http_response_code(200);
echo 'OK';
```

#### Go

```go
package main

import (
    "crypto/hmac"
    "crypto/sha256"
    "encoding/hex"
    "fmt"
    "io"
    "net/http"
    "strings"
)

var secret = []byte("your-webhook-secret")

func webhookHandler(w http.ResponseWriter, r *http.Request) {
    sig := r.Header.Get("X-Webhook-Signature")
    if sig == "" {
        http.Error(w, "Missing signature", 401)
        return
    }

    body, _ := io.ReadAll(r.Body)
    expected := strings.TrimPrefix(sig, "sha256=")
    mac := hmac.New(sha256.New, secret)
    mac.Write(body)
    actual := hex.EncodeToString(mac.Sum(nil))

    if !hmac.Equal([]byte(expected), []byte(actual)) {
        http.Error(w, "Invalid signature", 401)
        return
    }

    fmt.Println("Verified webhook")
    w.WriteHeader(200)
}
```

### Testing Your Webhook Receiver

WA-AKG includes built-in webhook test payload. You can also trigger test event manually:

```bash
# Create webhook with secret
curl -X POST "http://localhost:3000/api/webhooks/session-01" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test HMAC",
    "url": "https://your-server.com/webhook",
    "secret": "your-webhook-secret",
    "events": ["message.received"]
  }'
```

Then send a message to a WhatsApp session. Check your server logs — should show verified payload with `X-Webhook-Signature` header.

---

---

## 🎯 Webhook Payload Examples

When WA-AKG sends a POST to your webhook URL, the body has this structure:

```json
{
  "event": "message.received",
  "sessionId": "your-session-id",
  "timestamp": "2026-06-27T12:00:00.000Z",
  "data": { }
}
```

### Events List

| Event | Trigger |
| :--- | :--- |
| `message.received` | New incoming message |
| `message.sent` | Message sent from dashboard/API |
| `message.status` | Message delivery/read status change |
| `message.deleted` | Message recalled/revoked |
| `message.edited` | Message edited |
| `connection.update` | Session connection state changed |
| `group.update` | Group metadata changed (name, desc, settings) |
| `group.participant` | Member joined/left/promoted/demoted |
| `contact.update` | Contact name or notify changed |
| `status.update` | Status/story update |

---

### Payload Examples

#### message.received — Incoming DM text

```json
{
  "event": "message.received",
  "data": {
    "key": { "id": "AB12CD34EF", "remoteJid": "6281234567890@s.whatsapp.net", "fromMe": false },
    "pushName": "Budi",
    "from": "6281234567890@s.whatsapp.net",
    "sender": "6281234567890@s.whatsapp.net",
    "isGroup": false,
    "chatType": "PERSONAL",
    "type": "TEXT",
    "content": "Halo, ini test",
    "fileUrl": null,
    "caption": null,
    "quoted": null
  }
}
```

#### message.received — Image/video with caption

```json
{
  "event": "message.received",
  "data": {
    "from": "6281234567890@s.whatsapp.net",
    "isGroup": false,
    "chatType": "PERSONAL",
    "type": "IMAGE",
    "content": "Foto liburan",
    "fileUrl": "/api/media/abc-GH78IJ90KL.jpg",
    "caption": "Foto liburan"
  }
}
```

#### message.received — Group text

```json
{
  "event": "message.received",
  "data": {
    "from": "1234567890-123456@g.us",
    "sender": "6281234567890@s.whatsapp.net",
    "isGroup": true,
    "chatType": "GROUP",
    "type": "TEXT",
    "content": "Halo group",
    "key": { "id": "AB12CD34EF", "remoteJid": "1234567890-123456@g.us", "fromMe": false, "participant": "6281234567890@s.whatsapp.net" }
  }
}
```

#### message.received — With quoted reply

```json
{
  "event": "message.received",
  "data": {
    "from": "6281234567890@s.whatsapp.net",
    "type": "TEXT",
    "content": "Setuju!",
    "quoted": {
      "key": { "remoteJid": "6281234567890@s.whatsapp.net", "fromMe": true, "id": "XY99ZZ00AA" },
      "type": "TEXT",
      "content": "Gimana?"
    }
  }
}
```

#### message.received — Audio / Sticker / Location / Contact

```json
{
  "event": "message.received",
  "data": { "from": "6281234567890@s.whatsapp.net", "type": "AUDIO", "fileUrl": "/api/media/abc.mp3" }
}
```
For sticker: `type: "STICKER"`, location: `type: "LOCATION"` + `content: "lat,lng"`, contact: `type: "CONTACT"` + `content: "Display Name"`.

#### message.sent — Outgoing text (dashboard/API)

```json
{
  "event": "message.sent",
  "data": {
    "key": { "id": "BA12CD34EF", "remoteJid": "6281234567890@s.whatsapp.net", "fromMe": true },
    "from": "6281234567890@s.whatsapp.net",
    "receiver": "6281234567890@s.whatsapp.net",
    "sender": "ME",
    "isGroup": false,
    "chatType": "PERSONAL",
    "type": "TEXT",
    "content": "Pesan balasan",
    "fileUrl": null,
    "quoted": null
  }
}
```

#### message.sent — Outgoing media

```json
{
  "event": "message.sent",
  "data": {
    "from": "6281234567890@s.whatsapp.net",
    "type": "IMAGE",
    "content": "Foto liburan",
    "fileUrl": "/api/media/abc-CD78EF90GH.jpg",
    "caption": "Foto liburan"
  }
}
```

#### message.sent — To group

```json
{
  "event": "message.sent",
  "data": {
    "from": "1234567890-123456@g.us",
    "receiver": "1234567890-123456@g.us",
    "sender": "ME",
    "isGroup": true,
    "chatType": "GROUP",
    "type": "TEXT",
    "content": "Saya setuju",
    "key": { "participant": "6281234567890@s.whatsapp.net" }
  }
}
```

#### message.status — Delivery/read update

```json
{
  "event": "message.status",
  "data": { "keyId": "AB12CD34EF", "remoteJid": "6281234567890@s.whatsapp.net", "status": "DELIVERED" }
}
```

Status flow: `PENDING` → `SENT` → `DELIVERED` → `READ`

#### message.deleted — Message recalled/revoked

```json
{
  "event": "message.deleted",
  "data": { "keyId": "DE12LT34EF", "remoteJid": "6281234567890@s.whatsapp.net", "fromMe": false }
}
```

#### message.edited — Message edited

```json
{
  "event": "message.edited",
  "data": { "keyId": "ED12IT34EF", "newContent": "Pesan diperbaiki", "remoteJid": "6281234567890@s.whatsapp.net" }
}
```

#### connection.update — Session connection state

```json
{
  "event": "connection.update",
  "data": { "status": "CONNECTED", "qr": null }
}
```

Status: `SCAN_QR` (includes QR), `CONNECTED`, `DISCONNECTED`, `LOGGED_OUT`, `STOPPED`

#### group.update — Group metadata changed

```json
{
  "event": "group.update",
  "data": {
    "jid": "1234567890-123456@g.us",
    "subject": "Nama Grup Baru",
    "desc": "Deskripsi grup",
    "restrict": true,
    "announce": false,
    "owner": "6281234567890@s.whatsapp.net"
  }
}
```

#### group.participant — Member joined/left/promoted

```json
{
  "event": "group.participant",
  "data": {
    "jid": "1234567890-123456@g.us",
    "action": "add",
    "participants": ["6281234567890@s.whatsapp.net"]
  }
}
```

Actions: `add`, `remove`, `promote`, `demote`

#### contact.update — Contact name/notify changed

```json
{
  "event": "contact.update",
  "data": { "jid": "6281234567890@s.whatsapp.net", "name": "Budi Santoso", "notify": "Budi" }
}
```

#### status.update — Status/story update

```json
{
  "event": "status.update",
  "data": { "from": "status@broadcast", "type": "TEXT", "content": "Halo semua" }
}
```

---

## 📂 Users

### \[POST\] /users

**Create user (SUPERADMIN only)**

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | string | ✅ Yes | — |
| `email` | string (email) | ✅ Yes | — |
| `password` | string | ✅ Yes | — |
| `role` | string | No | **Options:** `SUPERADMIN`, `OWNER`, `STAFF` **Default:** `OWNER` |

**Example:**

```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "SUPERADMIN"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | User created |
| `400` | Bad Request - Invalid parameters |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Internal Server Error |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | No | — |
| `name` | string | No | — |
| `email` | string | No | — |
| `role` | string | No | — |
| `createdAt` | string (date-time) | No | — |

**Response Example (`200`):**

```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "role": "string",
  "createdAt": "2026-01-15T08:00:00.000Z"
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/users" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"name":"string","email":"string","password":"string","role":"SUPERADMIN"}'
```

---

### \[GET\] /users

**List users (SUPERADMIN only)**

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | List of users |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Internal Server Error |

**Response Example (`200`):**

```json
[
  {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "string",
    "createdAt": "2026-01-15T08:00:00.000Z",
    "_count": {
      "sessions": 0
    }
  }
]
```

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/users" \
  -H "X-API-Key: your-api-key"
```

---

### \[DELETE\] /users/{id}

**Delete user (SUPERADMIN only)**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | User deleted |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `404` | User not found |
| `500` | Internal Server Error |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `message` | string | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "message": "string"
}
```

#### cURL Example

```bash
curl -X DELETE "http://localhost:3000/api/users/abc123" \
  -H "X-API-Key: your-api-key"
```

---

### \[PATCH\] /users/{id}

**Update user (SUPERADMIN only)**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | string | No | — |
| `email` | string | No | — |
| `password` | string | No | — |
| `role` | string | No | **Options:** `SUPERADMIN`, `OWNER`, `STAFF` |

**Example:**

```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "role": "SUPERADMIN"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | User updated |
| `400` | Bad Request - Invalid parameters |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `404` | User not found |
| `500` | Internal Server Error |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `user` | object | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "user": {
    "id": "string",
    "email": "string",
    "name": "string",
    "role": "string",
    "emailVerified": "string",
    "image": "string",
    "createdAt": "2026-01-15T08:00:00.000Z",
    "updatedAt": "2026-01-15T08:00:00.000Z"
  }
}
```

#### cURL Example

```bash
curl -X PATCH "http://localhost:3000/api/users/abc123" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"name":"string","email":"string","password":"string","role":"SUPERADMIN"}'
```

---

### \[POST\] /user/api-key

**Generate new API key**

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | New API key generated |
| `401` | Unauthorized - Invalid or missing API key |
| `500` | Failed to generate API key |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `apiKey` | string | No | — |

**Response Example (`200`):**

```json
{
  "apiKey": "string"
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/user/api-key" \
  -H "X-API-Key: your-api-key"
```

---

### \[DELETE\] /user/api-key

**Revoke API key**

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | API key revoked |
| `401` | Unauthorized - Invalid or missing API key |
| `500` | Failed to revoke API key |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | boolean | No | — |
| `message` | string | No | — |
| `data` | object, nullable | No | — |

**Response Example (`200`):**

```json
{
  "status": true,
  "message": "Operation successful",
  "data": {
    "text": "Hello from WA-AKG!"
  }
}
```

#### cURL Example

```bash
curl -X DELETE "http://localhost:3000/api/user/api-key" \
  -H "X-API-Key: your-api-key"
```

---

### \[GET\] /user/api-key

**Get current API key**

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Current API key |
| `401` | Unauthorized - Invalid or missing API key |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `apiKey` | string, nullable | No | — |

**Response Example (`200`):**

```json
{
  "apiKey": "string"
}
```

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/user/api-key" \
  -H "X-API-Key: your-api-key"
```

---

## 📂 Labels

### \[POST\] /labels/{sessionId}

**Create label**

Create new label with color (0-19 index)

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | string | ✅ Yes | — |
| `color` | integer | No | Color index (0-19) |

**Example:**

```json
{
  "name": "Important",
  "color": 0
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Label created |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to create label |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `label` | object | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "label": {
    "id": "string",
    "name": "string",
    "color": 0,
    "predefinedId": "string"
  }
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/labels/session-01" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"name":"Important","color":0}'
```

---

### \[PUT\] /labels/{sessionId}

**Update all labels or bulk update**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Labels updated |

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/labels/session-01" \
  -H "X-API-Key: your-api-key"
```

---

### \[DELETE\] /labels/{sessionId}

**Delete labels**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Labels deleted |

#### cURL Example

```bash
curl -X DELETE "http://localhost:3000/api/labels/session-01" \
  -H "X-API-Key: your-api-key"
```

---

### \[GET\] /labels/{sessionId}

**List labels**

Get all labels with chat count

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | List of labels |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `404` | Session not found |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `labels` | array of object | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "labels": [
    {
      "id": "string",
      "name": "string",
      "color": 0,
      "predefinedId": "string"
    }
  ]
}
```

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/labels/session-01" \
  -H "X-API-Key: your-api-key"
```

---

### \[DELETE\] /labels/{sessionId}/{labelId}

**Delete label**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `labelId` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Label deleted |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | boolean | No | — |
| `message` | string | No | — |
| `data` | object, nullable | No | — |

**Response Example (`200`):**

```json
{
  "status": true,
  "message": "Operation successful",
  "data": {
    "text": "Hello from WA-AKG!"
  }
}
```

#### cURL Example

```bash
curl -X DELETE "http://localhost:3000/api/labels/session-01/label_01" \
  -H "X-API-Key: your-api-key"
```

---

### \[PUT\] /labels/{sessionId}/{labelId}

**Update label**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `labelId` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | string | No | — |
| `color` | integer | No | — |

**Example:**

```json
{
  "name": "string",
  "color": 0
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Label updated |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `label` | object | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "label": {
    "id": "string",
    "name": "string",
    "color": 0,
    "predefinedId": "string"
  }
}
```

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/labels/session-01/label_01" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"name":"string","color":0}'
```

---

### \[GET\] /labels/{sessionId}/chat/{jid}/labels

**Get chat labels**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Chat labels |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `labels` | array of object | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "labels": [
    {
      "id": "string",
      "name": "string",
      "color": 0,
      "predefinedId": "string"
    }
  ]
}
```

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/labels/session-01/chat/628123456789@s.whatsapp.net/labels" \
  -H "X-API-Key: your-api-key"
```

---

### \[PUT\] /labels/{sessionId}/chat/{jid}/labels

**Update chat labels**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `labelIds` | array of string | ✅ Yes | — |
| `action` | string | ✅ Yes | **Options:** `add`, `remove` |

**Example:**

```json
{
  "labelIds": [
    "string"
  ],
  "action": "add"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Chat labels updated |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `message` | string | No | — |
| `labels` | array of object | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "message": "string",
  "labels": [
    {
      "id": "string",
      "name": "string",
      "color": 0,
      "predefinedId": "string"
    }
  ]
}
```

#### cURL Example

```bash
curl -X PUT "http://localhost:3000/api/labels/session-01/chat/628123456789@s.whatsapp.net/labels" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"labelIds":["string"],"action":"add"}'
```

---

### \[GET\] /chats/{sessionId}/by-label/{labelId}

**Get chats by label**

Get all chats associated with a specific label

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `labelId` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | List of chats with label |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `404` | Label not found |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `label` | object | No | — |
| `chats` | array of string | No | — |
| `count` | integer | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "label": {
    "text": "Hello from WA-AKG!"
  },
  "chats": [
    "string"
  ],
  "count": 0
}
```

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/chats/session-01/by-label/label_01" \
  -H "X-API-Key: your-api-key"
```

---

## 📂 Notifications

### \[POST\] /notifications

**Create notification**

Send a notification to a specific user or broadcast to all (Superadmin only)

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `title` | string | ✅ Yes | — |
| `message` | string | ✅ Yes | — |
| `type` | string | No | **Options:** `INFO`, `SUCCESS`, `WARNING`, `ERROR` **Default:** `INFO` |
| `href` | string | No | — |
| `targetUserId` | string | No | Target user UUID |
| `broadcast` | boolean | No | **Default:** `false` |

**Example:**

```json
{
  "title": "Maintenance",
  "message": "System update in 5 minutes",
  "type": "INFO",
  "href": "/settings",
  "targetUserId": "string",
  "broadcast": true
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Notification created |
| `400` | Invalid request |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Error creating notification |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `count` | integer | No | Number of users notified if broadcast |

**Response Example (`200`):**

```json
{
  "success": true,
  "count": 0
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/notifications" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"title":"Maintenance","message":"System update in 5 minutes","type":"INFO","href":"/settings","targetUserId":"string","broadcast":true}'
```

---

### \[GET\] /notifications

**List notifications**

Get the last 50 notifications for the authenticated user

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | List of notifications |
| `401` | Unauthorized - Invalid or missing API key |
| `500` | Error fetching notifications |

**Response Example (`200`):**

```json
[
  {
    "id": "string",
    "userId": "string",
    "title": "string",
    "message": "string",
    "type": "string",
    "href": "string",
    "read": true,
    "createdAt": "2026-01-15T08:00:00.000Z"
  }
]
```

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/notifications" \
  -H "X-API-Key: your-api-key"
```

---

### \[PATCH\] /notifications/read

**Mark notifications as read**

Mark specific or all notifications as read for the authenticated user

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `ids` | array of string | No | Array of notification IDs. If omitted or empty, all notifications are marked as read. |

**Example:**

```json
{
  "ids": [
    "string"
  ]
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Notifications updated |
| `401` | Unauthorized - Invalid or missing API key |
| `500` | Error updating notifications |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | boolean | No | — |
| `message` | string | No | — |
| `data` | object, nullable | No | — |

**Response Example (`200`):**

```json
{
  "status": true,
  "message": "Operation successful",
  "data": {
    "text": "Hello from WA-AKG!"
  }
}
```

#### cURL Example

```bash
curl -X PATCH "http://localhost:3000/api/notifications/read" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"ids":["string"]}'
```

---

### \[DELETE\] /notifications/delete

**Delete specific notification**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `id` | query | ✅ Yes | string | Notification UUID |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Notification deleted |
| `400` | Notification ID required |
| `401` | Unauthorized - Invalid or missing API key |
| `500` | Error deleting notification |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | boolean | No | — |
| `message` | string | No | — |
| `data` | object, nullable | No | — |

**Response Example (`200`):**

```json
{
  "status": true,
  "message": "Operation successful",
  "data": {
    "text": "Hello from WA-AKG!"
  }
}
```

#### cURL Example

```bash
curl -X DELETE "http://localhost:3000/api/notifications/delete?id=abc123" \
  -H "X-API-Key: your-api-key"
```

---

## 📂 System

### \[POST\] /settings/system

**Update system settings**

Update global system configuration (Superadmin/Owner only)

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `appName` | string | No | — |
| `logoUrl` | string | No | — |
| `timezone` | string | No | — |

**Example:**

```json
{
  "appName": "string",
  "logoUrl": "string",
  "timezone": "string"
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Settings updated |
| `401` | Unauthorized - Invalid or missing API key |
| `500` | Failed to update settings |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | No | — |
| `appName` | string | No | — |
| `logoUrl` | string | No | — |
| `timezone` | string | No | — |
| `updatedAt` | string (date-time) | No | — |

**Response Example (`200`):**

```json
{
  "id": "string",
  "appName": "string",
  "logoUrl": "string",
  "timezone": "string",
  "updatedAt": "2026-01-15T08:00:00.000Z"
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/settings/system" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"appName":"string","logoUrl":"string","timezone":"string"}'
```

---

### \[GET\] /settings/system

**Get system settings**

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | System settings |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | No | — |
| `appName` | string | No | — |
| `logoUrl` | string | No | — |
| `timezone` | string | No | — |

**Response Example (`200`):**

```json
{
  "id": "default",
  "appName": "WA-AKG",
  "logoUrl": "https://example.com/logo.png",
  "timezone": "Asia/Jakarta"
}
```

#### cURL Example

```bash
curl -X GET "http://localhost:3000/api/settings/system" \
  -H "X-API-Key: your-api-key"
```

---

### \[POST\] /status/{sessionId}/update

**Update status**

Post a status update (story) to WhatsApp. Supports text, image, and video.

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `content` | string | ✅ Yes | Status text or caption |
| `type` | string | No | **Options:** `TEXT`, `IMAGE`, `VIDEO` **Default:** `TEXT` |
| `mediaUrl` | string | No | Required for IMAGE and VIDEO |
| `backgroundColor` | integer | No | — |
| `font` | integer | No | — |
| `mentions` | array of string | No | — |

**Example:**

```json
{
  "content": "string",
  "type": "TEXT",
  "mediaUrl": "string",
  "backgroundColor": 0,
  "font": 0,
  "mentions": [
    "string"
  ]
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Status posted |
| `400` | Missing required fields |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `503` | Session not connected or ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | boolean | No | — |
| `message` | string | No | — |
| `data` | object, nullable | No | — |

**Response Example (`200`):**

```json
{
  "status": true,
  "message": "Operation successful",
  "data": {
    "text": "Hello from WA-AKG!"
  }
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/status/session-01/update" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"content":"string","type":"TEXT","mediaUrl":"string","backgroundColor":0,"font":0,"mentions":["string"]}'
```

---

### \[POST\] /status/update

**Update status**

Post a status update (story) to WhatsApp. Supports text, image, and video.

#### Headers

```
X-API-Key: your-api-key
Content-Type: application/json
```

#### Request Body (`application/json`)

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `sessionId` | string | ✅ Yes | — |
| `content` | string | ✅ Yes | Status text or caption |
| `type` | string | No | **Options:** `TEXT`, `IMAGE`, `VIDEO` **Default:** `TEXT` |
| `mediaUrl` | string | No | Required for IMAGE and VIDEO |
| `backgroundColor` | integer | No | ARGB color for TEXT status |
| `font` | integer | No | Font style for TEXT status |
| `mentions` | array of string | No | List of JIDs to mention/tag in the status |

**Example:**

```json
{
  "sessionId": "string",
  "content": "string",
  "type": "TEXT",
  "mediaUrl": "string",
  "backgroundColor": 0,
  "font": 0,
  "mentions": [
    "string"
  ]
}
```

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Status updated |
| `400` | Missing required fields |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to post status |
| `503` | Session not ready |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | boolean | No | — |
| `message` | string | No | — |
| `data` | object, nullable | No | — |

**Response Example (`200`):**

```json
{
  "status": true,
  "message": "Operation successful",
  "data": {
    "text": "Hello from WA-AKG!"
  }
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/status/update" \
  -H "X-API-Key: your-api-key" \
  -H "Content-Type: application/json" \
  -d '{"sessionId":"string","content":"string","type":"TEXT","mediaUrl":"string","backgroundColor":0,"font":0,"mentions":["string"]}'
```

---

### \[POST\] /system/check-updates

**Check for updates**

Checks for new releases on GitHub and creates a system notification if a newer version is available.

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Check results |
| `401` | Unauthorized - Invalid or missing API key |
| `500` | Error checking updates |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `message` | string | No | — |
| `version` | string | No | Latest version tag |

**Response Example (`200`):**

```json
{
  "success": true,
  "message": "string",
  "version": "string"
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/system/check-updates" \
  -H "X-API-Key: your-api-key"
```

---

## 📂 Contacts

### \[POST\] /contacts/{sessionId}/{jid}/block

**Block contact**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Contact blocked |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to block contact |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `message` | string | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "message": "string"
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/contacts/session-01/628123456789@s.whatsapp.net/block" \
  -H "X-API-Key: your-api-key"
```

---

### \[POST\] /contacts/{sessionId}/{jid}/unblock

**Unblock contact**

#### Parameters

| Name | Located in | Required | Type | Description |
| :--- | :--- | :--- | :--- | :--- |
| `sessionId` | path | ✅ Yes | string | — |
| `jid` | path | ✅ Yes | string | — |

#### Responses

| Code | Description |
| :--- | :--- |
| `200` | Contact unblocked |
| `401` | Unauthorized - Invalid or missing API key |
| `403` | Forbidden - Access denied |
| `500` | Failed to unblock contact |

**Response Fields (`200`):**

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `success` | boolean | No | — |
| `message` | string | No | — |

**Response Example (`200`):**

```json
{
  "success": true,
  "message": "string"
}
```

#### cURL Example

```bash
curl -X POST "http://localhost:3000/api/contacts/session-01/628123456789@s.whatsapp.net/unblock" \
  -H "X-API-Key: your-api-key"
```

---

## 📦 Schemas

### Error

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | boolean | No | — |
| `message` | string | No | — |
| `error` | string | No | — |

**Example:**

```json
{
  "status": false,
  "message": "Error occurred",
  "error": "Detailed error info"
}
```

### Success

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `status` | boolean | No | — |
| `message` | string | No | — |
| `data` | object, nullable | No | — |

**Example:**

```json
{
  "status": true,
  "message": "Operation successful",
  "data": {
    "text": "Hello from WA-AKG!"
  }
}
```

### Session

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | No | — |
| `name` | string | No | — |
| `sessionId` | string | No | — |
| `status` | string | No | **Options:** `Connected`, `Disconnected`, `Connecting` |
| `userId` | string | No | — |
| `botConfig` | object, nullable | No | — |
| `webhooks` | array of object | No | — |
| `_count` | object, nullable | No | — |
| `createdAt` | string (date-time) | No | — |
| `updatedAt` | string (date-time) | No | — |

**Example:**

```json
{
  "id": "clx123abc",
  "name": "Marketing Bot",
  "sessionId": "marketing-1",
  "status": "Connected",
  "userId": "string",
  "botConfig": {
    "text": "Hello from WA-AKG!"
  },
  "webhooks": [
    {
      "text": "Hello from WA-AKG!"
    }
  ],
  "_count": {
    "contacts": 0,
    "messages": 0,
    "groups": 0,
    "autoReplies": 0,
    "scheduledMessages": 0
  },
  "createdAt": "2026-01-15T08:00:00.000Z",
  "updatedAt": "2026-01-15T08:00:00.000Z"
}
```

### Message

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `text` | string | No | — |

**Example:**

```json
{
  "text": "Hello! How can I help you?"
}
```

### Contact

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `jid` | string | No | — |
| `name` | string | No | — |
| `notify` | string | No | — |
| `profilePic` | string, nullable | No | — |

**Example:**

```json
{
  "jid": "628123456789@s.whatsapp.net",
  "name": "John Doe",
  "notify": "string",
  "profilePic": "string"
}
```

### ScheduledMessage

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | No | — |
| `sessionId` | string | No | — |
| `jid` | string | No | — |
| `content` | string | No | — |
| `sendAt` | string (date-time) | No | — |
| `status` | string | No | — |

**Example:**

```json
{
  "id": "string",
  "sessionId": "string",
  "jid": "string",
  "content": "string",
  "sendAt": "2026-01-15T08:00:00.000Z",
  "status": "PENDING"
}
```

### Webhook

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | No | — |
| `sessionId` | string | No | — |
| `url` | string | No | — |
| `events` | array of string | No | Events to subscribe to: message.received, message.sent, message.status, connection.update, group.update, contact.update, status.update, group.participant, message.deleted, message.edited or '*' |
| `secret` | string | No | — |

**Example:**

```json
{
  "id": "string",
  "sessionId": "string",
  "url": "string",
  "events": [
    "string"
  ],
  "secret": "string"
}
```

### Group

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | No | — |
| `subject` | string | No | — |
| `desc` | string | No | — |
| `owner` | string | No | — |
| `size` | number | No | — |
| `isCommunity` | boolean | No | Whether this group is a WhatsApp Community announcement group |
| `linkedParentJid` | string, nullable | No | JID of the parent community if this is a sub-group |
| `participants` | array of object | No | — |

**Example:**

```json
{
  "id": "string",
  "subject": "string",
  "desc": "string",
  "owner": "string",
  "size": 0,
  "isCommunity": true,
  "linkedParentJid": "string",
  "participants": [
    {
      "id": "string",
      "admin": "string"
    }
  ]
}
```

### Label

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | No | — |
| `name` | string | No | — |
| `color` | number, nullable | No | — |
| `predefinedId` | string, nullable | No | — |

**Example:**

```json
{
  "id": "string",
  "name": "string",
  "color": 0,
  "predefinedId": "string"
}
```

### GroupDetails

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `id` | string | No | — |
| `subject` | string | No | — |
| `subjectOwner` | string | No | — |
| `subjectTime` | number | No | — |
| `desc` | string | No | — |
| `descOwner` | string | No | — |
| `descId` | string | No | — |
| `owner` | string | No | — |

**Example:**

```json
{
  "id": "string",
  "subject": "string",
  "subjectOwner": "string",
  "subjectTime": 0,
  "desc": "string",
  "descOwner": "string",
  "descId": "string",
  "owner": "string"
}
```

