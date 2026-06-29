# 🔄 WA-AKG Update Guide

Keep your **WA-AKG** instance up-to-date with the latest features, security patches, and performance improvements.

---

## 🚀 Standard Update Process

Follow these steps to update your application safely.

### Option A: Automatic Update (Recommended)
If you are deploying with PM2 and using the built-in [start.sh](file:///home/aditya/project/WA-AKG/start.sh) script, updating is as simple as:
```bash
git pull
./start.sh
```
This script will automatically pull the environment, install any new dependencies, sync the Prisma database schema, build Next.js assets, and safely reload the PM2 process without downtime.

---

### Option B: Manual Update Process
If you prefer running commands manually:

#### 1. Pull Latest Changes
```bash
git pull
```

#### 2. Update Dependencies
```bash
npm install
```

#### 3. Sync Database Schema
If the update includes database changes, run:
```bash
npm run db:push
```
> [!NOTE]
> For production environments requiring strict migration history, use `npx prisma migrate deploy` instead.

#### 4. Build & Restart
```bash
# Build the optimized production bundle
npm run build

# Restart your process using PM2
pm2 restart wa-akg
```

---

## 🏷️ Version Management

To manually bump your application version:

1.  Open `package.json`.
2.  Update the `"version"` field (e.g., `"1.1.1"` -> `"1.1.2"`).
3.  Rebuild the application.

The version number is displayed in the **Dashboard Sidebar** footer.

---

## 🛠️ Troubleshooting Updates

| Issue | Resolution |
| :--- | :--- |
| **Prisma Type Errors** | Run `npx prisma generate` to refresh the client. |
| **Build Failures** | Delete `.next` and `node_modules`, then `npm install`. |
| **API Errors** | Ensure your `.env` matches the latest requirements in `docs/ENVIRONMENT_VARIABLES.md`. |

---

## 🔒 Security Changelog (v1.6.1)

| Perubahan | Sebelum | Sesudah |
| :--- | :--- | :--- |
| **AUTH\_SECRET wajib** | Fallback ke `"secret"` jika tidak diset | Server exit dengan error jika tidak diset |
| **Password plaintext fallback** | `bcrypt.compare() \|\| password === user.password` | Hanya `bcrypt.compare()` |
| **Docker kredensial** | Hardcoded di `docker-compose.yml` | Dibaca dari `.env` file |
| **GET /api/settings/system** | Tanpa autentikasi | Minimal login required |
| **generateApiKey()** | `Math.random()` | Gunakan `crypto.randomBytes()` |

> [!IMPORTANT]
> Setelah update ke v1.6.1, pastikan `AUTH_SECRET` diset di `.env`. Jika menggunakan Docker, buat `.env` dari `.env.example` sebelum `docker compose up`.

---
<div align="center">
  **Version**: 1.6.1 | **Last Verified**: 2026-06-28
</div>
