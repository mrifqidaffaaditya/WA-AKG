# WA-AKG Project Documentation

> **Version**: 1.2.0
> **Last Updated**: January 2026
> **Tech Stack**: Next.js 14+ (App Router), TypeScript, Prisma, MySQL, Baileys, Tailwind CSS.

---

## 🏗️ Project Architecture

The project follows a modern Next.js App Router structure with a clear separation of concerns between Frontend (UI), Backend (API), and Core Logic (WhatsApp Engine).

### Directory Structure
```
src/
├── app/                 # App Router Pages & API Routes
│   ├── api/             # Backend API Endpoints (64+ routes)
│   ├── dashboard/       # Protected Dashboard Pages
│   ├── auth/            # Authentication Pages (Login)
│   └── docs/            # Public Documentation Page
├── components/          # React Components
│   ├── ui/              # Shadcn UI Primitives
│   ├── dashboard/       # Dashboard-specific Components
│   └── chat/            # Chat Interface Components
├── lib/                 # Shared Utilities (DB, Auth, Helpers)
├── modules/             # Core Business Logic
│   └── whatsapp/        # WhatsApp Baileys Engine
└── types/               # TypeScript Definitions
```

---

## 🗄️ Database Schema

The database relies on MySQL managed via Prisma ORM.

### Core Models
| Model | Description | Key Relations |
| :--- | :--- | :--- |
| **User** | System users (Admin/Staff) | `Session`, `Webhook`, `Notification` |
| **Session** | WhatsApp Device Sessions | `User`, `Message`, `Contact`, `Group` |
| **AuthState** | Baileys Session Credentials | Linked to `Session` |

### Messaging Models
| Model | Description | Key Relations |
| :--- | :--- | :--- |
| **Message** | Chat history (In/Out) | `Session`, `Contact` |
| **Contact** | User/Group Metadata | `Session` |
| **Group** | Group Chat Metadata | `Session` |
| **AutoReply** | Automated response rules | `Session` |
| **ScheduledMessage** | Messages scheduled for future | `Session` |

### System Models
| Model | Description | Key Relations |
| :--- | :--- | :--- |
| **BotConfig** | AI/Bot specific settings | `Session` |
| **Webhook** | External event notifications | `User`, `Session` |
| **Label** | Chat organization tags | `ChatLabel` |
| **SystemConfig** | Global app settings | Singleton |

> **Full Schema**: See `prisma/schema.prisma` for exact field definitions.

---

## 🌐 Frontend Routes

### Dashboard (`/dashboard`)
Protected area for managing WhatsApp sessions.
- **Overview**: `/dashboard` - Status summary and quick actions.
- **Sessions**: `/dashboard/sessions` - CRUD for devices & QR scanning.
- **Chat**: `/dashboard/chat` - Real-time chat interface.
- **Contacts**: `/dashboard/contacts` - Address book management.
- **Groups**: `/dashboard/groups` - Group management tools.
- **Broadcasting**: `/dashboard/broadcast` - Mass messaging tools.
- **Auto Actions**:
  - `/dashboard/autoreply` - Configure auto-responses.
  - `/dashboard/scheduler` - Schedule messages.
- **Settings**:
  - `/dashboard/bot-settings` - AI and Bot configuration.
  - `/dashboard/webhooks` - Developer webhook settings.
  - `/dashboard/settings` - General system preferences.
- **Developers**: `/dashboard/api-docs` - API reference page.

### Public Pages
- **Login**: `/auth/login`
- **Documentation**: `/docs` (Swagger UI)

---

## 🔌 Backend API

The API is structured around **RESTful principles** with strict parameter usage (`Query` vs `Body`).

### Key Modules
1.  **Session Manager** (`/api/sessions`)
    - Handles lifecycle: Create, Scan QR, Delete, Reconnect.
    - Uses `waManager` to spawn Baileys instances.
    
2.  **Messaging Engine** (`/api/chat`, `/api/messages`)
    - Supports Text, Image, Video, Documents, Stickers.
    - Advanced features: Polls, Lists, Location, Contacts.
    - High-performance broadcasting queue.

3.  **Group Controller** (`/api/groups`)
    - Full admin capabilities: Create, Promote/Demote, Settings.
    - Invite link management.

4.  **Event System** (`/api/webhooks`)
    - Real-time event dispatch for `message.upsert`, `connection.update`, etc.
    - HMAC signature verification.

> **API Reference**: See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for the complete list of 64 endpoints.

---

## ⚙️ Core Modules (Logic)

### WhatsApp Manager (`src/modules/whatsapp`)
- **`manager.ts`**: Singleton class that orchestrates all WhatsApp instances.
  - Manages in-memory session storage.
  - Handles socket connections and reconnections.
- **`instance.ts`**: formatting and event handling for a single session.
- **`store/`**: Custom Baileys store implementation to sync with Prisma.

### Authentication (`src/lib/auth.ts`)
- Uses **NextAuth.js v5**.
- Credentials flow (Email/Password).
- API Key middleware for external API access.

---

## 🚀 Environment Variables

Configuration is managed via `.env` file. Critical variables include:
- `DATABASE_URL`: MySQL connection string.
- `NEXTAUTH_SECRET`: Session encryption key.
- `NEXT_PUBLIC_API_URL`: Base URL for API calls.

> **Full Config**: See [ENVIRONMENT_VARIABLES.md](ENVIRONMENT_VARIABLES.md).
