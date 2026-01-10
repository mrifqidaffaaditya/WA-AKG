<div align="center">

# 🚀 WA-AKG: The Ultimate WhatsApp Gateway & Dashboard

![WhatsApp Bot](https://img.shields.io/badge/WhatsApp-Bot-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma&logoColor=white)
![Baileys](https://img.shields.io/badge/Powered%20By-Baileys-orange?style=for-the-badge)

**A powerful, self-hosted WhatsApp Gateway, Dashboard, and Bot Management System.**  
Built for developers and businesses to manage multi-session WhatsApp accounts, schedule messages, create auto-replies, and integrate with external apps via Webhooks.

[Features](#-features) • [User Guide](docs/USER_GUIDE.md) • [API Documentation](#-api-reference) • [Installation](#-installation)


</div>

---

## 🌟 Why WA-AKG?

Turn your WhatsApp into a programmable API. Whether you need a simple **WhatsApp Bot**, a **Marketing Broadcast Tool**, or a robust **WhatsApp Webhook** integration for your CRM, WA-AKG handles it all with a modern, responsive dashboard.

### 🔥 Key Features
- **📱 Multi-Session Management**: Connect unlimited WhatsApp accounts via QR Code.
- **⚡ Real-time Messaging**: Instant sending and receiving with low latency.
- **📅 Smart Scheduler**: Schedule messages to be sent at precise times (supports **Global Timezone** configuration).
- **📢 Broadcast / Blast**: Send bulk messages to contacts or groups with random delays to **avoid bans**.
- **🤖 Advanced Auto-Reply**: Create keyword-based bots (Exact, Contains, Starts With) with ease.
- **🔗 Powerful Webhooks**: Forward incoming messages (`text`, `image`, `sticker`) to your own API endpoint.
- **👥 Group Management**: Manage groups, fetch participants, and send group announcements.
- **🎨 Sticker Maker**: Convert images to stickers automatically with `#sticker` command (supports remove.bg).
- **🔒 Role-Based Access**: Secure your dashboard with `Owner`, `Admin`, and `User` roles.
- **🌐 RESTful API**: Full documentation for external integrations.

---

## 🛠️ Tech Stack

-   **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
-   **Language**: TypeScript
-   **Database**: PostgreSQL / MySQL (via Prisma ORM)
-   **Core**: [@whiskeysockets/baileys](https://github.com/WhiskeySockets/Baileys)
-   **UI Library**: [Shadcn UI](https://ui.shadcn.com/) + Tailwind CSS
-   **Auth**: NextAuth.js v5

---

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/mrifqidaffaaditya/WA-AKG.git
cd WA-AKG
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment
Copy the example environment file and update your credentials:
```bash
cp .env.example .env
```
Update `.env` with your Database URL and Auth Secret:
```env
DATABASE_URL="postgresql://user:pass@localhost:5432/wa_gateway_db"
AUTH_SECRET="generate-a-strong-secret-here"
```

### 4. Setup Database
For detailed instructions, see [Database Setup Guide](docs/DATABASE_SETUP.md).

```bash
# Push schema and generate client
npm run db:push

# (Optional) Open Prisma Studio to view data
npm run db:studio
```

### 5. Create Admin User
```bash
# syntax: npm run make-admin <email> <password>
npm run make-admin admin@example.com password123
```

### 5. Start the Application
```bash
# Development Mode
npm run dev

# Production Build
npm run build
npm start
```
Access the dashboard at: `http://localhost:3000/dashboard`

---

## 📚 API Reference

Interact with your WhatsApp sessions programmatically.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/chat/send` | Send text or media message |
| `POST` | `/api/scheduler` | Schedule a future message |
| `GET` | `/api/sessions` | List connected sessions |
| `POST` | `/api/sessions` | Create a new session |
| `GET` | `/api/groups/[sessionId]` | Fetch joined groups |

### Example: Send Message
```bash
curl -X POST http://localhost:3000/api/chat/send \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session_1",
    "jid": "62812345678@s.whatsapp.net",
    "content": "Hello from WA-AKG API!"
  }'
```

### Example: Create Auto-Reply
```bash
curl -X POST http://localhost:3000/api/autoreplies \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "session_1",
    "keyword": "price",
    "response": "Our price starts at $10",
    "matchType": "CONTAINS"
  }'
```

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

<div align="center">
  <small>Built with ❤️ by <a href="https://github.com/mrifqidaffaaditya">Aditya</a></small>
</div>
