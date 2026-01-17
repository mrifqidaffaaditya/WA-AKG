# 📂 Knowledge Base Index

Welcome to the internal documentation portal for **WA-AKG**. Use the links below to navigate the technical and user-facing guides.

---

## 📘 Essential Guides

| Document | Purpose |
| :--- | :--- |
| **[API Documentation](./API_DOCUMENTATION.md)** | Full REST API reference for all **86 endpoints**. |
| **[User Guide](./USER_GUIDE.md)** | Step-by-step instructions for dashboard features. |
| **[Project Architecture](./PROJECT_DOCUMENTATION.md)** | Detailed system logic, diagrams, and database schema. |
| **[Environment Config](./ENVIRONMENT_VARIABLES.md)** | Secure configuration and server setup. |

---

## 🛠️ Infrastructure & Maintenance

- **[Database Setup](./DATABASE_SETUP.md)**: Schema migrations and provider switching.
- **[Update Guide](./UPDATE_GUIDE.md)**: How to sync from upstream and apply patches.
- **[Quick Reference](./API-QUICK-REFERENCE.md)**: Handy cURL snippets and JID formats.

---

## 🚦 Getting Started (Programmatically)

1. **Auth**: Get your key via Dashboard Settings -> include `X-API-Key`.
2. **Session**: Create one via `/api/sessions` and scan the QR.
3. **Automate**: Register a URL via `/api/webhooks` to start receiving events.

---
<div align="center">
  **Version**: 1.1.2 | **Build Status**: Stable
</div>
