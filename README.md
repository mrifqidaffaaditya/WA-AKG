# WA-AKG (WhatsApp Gateway & Dashboard)

A robust, self-hosted WhatsApp Gateway and Management Dashboard built with **Next.js 15**, **Baileys**, and **Prisma**.  
This application allows you to manage multiple WhatsApp sessions, schedule messages, create auto-replies, manage groups, and more—all from a modern, responsive dashboard.

## 🚀 Features

-   **Multi-Session Management**: Connect and manage multiple WhatsApp accounts via QR code scanning.
-   **Dashboard UI**: Clean, responsive interface built with Shadcn UI & Tailwind CSS.
-   **Real-time Messaging**: Send and receive messages instantly.
-   **Message Scheduler**: Schedule messages to be sent at a specific time (with timezone support).
-   **Auto-Reply**: Configure keyword-based auto-replies with "is", "starts with", or "contains" matching.
-   **Broadcast / Blast**: Send messages to multiple contacts or groups with random delays to avoid bans.
-   **Group Management**: List groups, view participants, and send messages to groups.
-   **Sticker Maker**: Convert images to stickers directly from the chat.
-   **Webhook Support**: Forward incoming messages to external URLs for custom processing.
-   **Role-Based Access**: Multi-user support with `OWNER`, `ADMIN`, and `USER` roles.
-   **Global Timezone**: Configure the system timezone for accurate scheduling.
-   **Bot Features**: Sticker commands (`#sticker`), Status downloading, and more.

## 🛠️ Tech Stack

-   **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
-   **Language**: TypeScript
-   **Database**: PostgreSQL / MySQL (via Prisma ORM)
-   **WhatsApp Core**: [@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys)
-   **UI Components**: [Shadcn UI](https://ui.shadcn.com/)
-   **Styling**: Tailwind CSS
-   **Authentication**: NextAuth.js (v5)
-   **Real-time**: Socket.io (Custom implementation with Next.js)

## 📦 Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/mrifqidaffaaditya/WA-AKG.git
cd WA-AKG
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env` and configure your database and secrets.
```bash
cp .env.example .env
```
Update `.env`:
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/wa_gateway"
AUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 4. Database Setup
Push the Prisma schema to your database.
```bash
npx prisma db push
npx prisma generate
```

### 5. Create First Admin User
You can seed the database or use the registration page if allowed. Alternatively, manually insert a user with `role: "SUPERADMIN"` or `"OWNER"` in the database.

### 6. Run the Application
```bash
# Development
npm run dev

# Production
npm run build
npm start
```
Access the dashboard at `http://localhost:3000/dashboard`.

---

## 📚 API Documentation

All API endpoints are prefixed with `/api`. Most endpoints require authentication via a session cookie (NextAuth) or an API Key (for webhooks/external access).

### 🔐 Authentication

#### `POST /api/auth/signin`
Standard NextAuth sign-in endpoint.

### 📱 Sessions (WhatsApp Accounts)

#### `GET /api/sessions`
List all active WhatsApp sessions accessible to the current user.
-   **Response**: `[{ sessionId, status, name, phone, ... }]`

#### `POST /api/sessions`
Create a new WhatsApp session.
-   **Body**: `{ sessionId: string }`
-   **Response**: `{ sessionId, status: "STOPPED" }`

#### `GET /api/sessions/[sessionId]/qrcode`
Get the QR code for a session (if status is `SCANNING`).
-   **Response**: `{ qr: "base64_string" }` or `{ error: "Session connected" }`

#### `DELETE /api/sessions/[sessionId]`
Delete/Logout a session.

### 📩 Messages

#### `POST /api/messages/send`
Send a text or media message.
-   **Headers**: `Content-Type: application/json`
-   **Body**:
    ```json
    {
      "sessionId": "session_id_here",
      "jid": "62812345678@s.whatsapp.net",
      "content": "Hello World",
      "mediaUrl": "https://example.com/image.png" // Optional
    }
    ```
-   **Response**: `{ status: "sent", messageId: "..." }`

### 📅 Scheduler

#### `GET /api/scheduler?sessionId=...`
List scheduled messages for a session.

#### `POST /api/scheduler`
Schedule a message.
-   **Body**:
    ```json
    {
      "sessionId": "session_id_here",
      "jid": "62812345678@s.whatsapp.net",
      "content": "Future Message",
      "sendAt": "2024-12-31T23:59:00", // Local time formatting supported
      "mediaUrl": "..."
    }
    ```
-   **Note**: The system converts the `sendAt` time to UTC based on the **System Timezone** configuration.

### 🤖 Auto-Replies

#### `GET /api/autoreplies`
List auto-reply rules.

#### `POST /api/autoreplies`
Create a new auto-reply rule.
-   **Body**:
    ```json
    {
      "sessionId": "session_id_here",
      "keyword": "hello",
      "response": "Hi there! This is an automated reply.",
      "matchType": "EXACT", // or "CONTAINS", "STARTS_WITH"
      "isPublic": true,
      "replyToMedia": false
    }
    ```

### 👥 Groups

#### `GET /api/groups/[sessionId]`
List all groups the session has joined.
-   **Response**: `[{ jid, subject, size, ... }]`

### ⚙️ System Settings (Admin Only)

#### `GET /api/settings/system`
Get global system configuration.

#### `POST /api/settings/system`
Update system settings.
-   **Body**:
    ```json
    {
      "appName": "My WhatsApp App",
      "logoUrl": "...",
      "timezone": "Asia/Jakarta"
    }
    ```

## ⚠️ Disclaimer
This project is for educational purposes. WhatsApp is a registered trademark of Meta Platforms, Inc. This project is not affiliated with, associated with, authorized by, endorsed by, or in any way officially connected with WhatsApp or Meta. Using automated software on WhatsApp may violate their Terms of Service and lead to account bans. Use responsibly.
