# 🗄️ Database Setup Guide

This guide will help you set up the database for **WA-AKG**. The project uses **Prisma ORM**, which supports PostgreSQL, MySQL, SQLite, and MongoDB.

## 1. Prerequisites

Ensure you have a database server running.
-   **PM2 Stack (Recommended)**: Run MySQL/PostgreSQL directly on the host, configure `.env`, and manage using PM2.
-   **Docker Stack (Alternative)**: You can use the included Docker Compose configuration to spin up a MySQL database alongside the Next.js gateway application.
-   **Local Development (Bare-metal)**: You can run MySQL or PostgreSQL locally on your machine.
-   **Production**: Use a managed database service (e.g., Supabase, Neon, AWS RDS).

## 2. Docker Compose Setup (Alternative)

WA-AKG menyertakan `docker-compose.yml` di root project yang mendefinisikan container MySQL 8.0 (`wa-akg-db`) dan aplikasi (`wa-akg-app`).

1. **Siapkan Environment**:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` — isi `AUTH_SECRET`, `MYSQL_ROOT_PASSWORD`, `ADMIN_PASSWORD`, dan `NEXT_PUBLIC_SWAGGER_PASSWORD` dengan nilai yang kuat.

2. **Jalankan Stack**:
   ```bash
   docker compose up -d
   ```

3. **Apa yang terjadi saat startup**:
   - MySQL database dibuat.
   - Semua tabel dibuat otomatis (`npx prisma db push`).
   - Akun SuperAdmin diprovisi menggunakan kredensial dari `.env` Anda.

---

## 3. Configuration (Bare-metal)

Edit your `.env` file and set the `DATABASE_URL`.

### MySQL
```env
DATABASE_URL="mysql://user:pass@db-host:3306/wa_akg"
```

### PostgreSQL
```env
DATABASE_URL="postgresql://user:pass@db-host:5432/wa_akg?schema=public"
```

## 3. Initialization Commands

We have prepared easy-to-use commands in `package.json`.

### Sync Schema
Push the Prisma schema to your database. This creates all necessary tables.

```bash
npm run db:push
```

### Reset Database (Caution!)
If you need to wipe the database and start fresh:

```bash
npx prisma migrate reset
```

## 4. Switching Database Provider
By default, the project might be configured for **MySQL** or **PostgreSQL**. To switch providers (e.g., from MySQL to PostgreSQL):

1.  **Open `prisma/schema.prisma`**:
2.  **Locate the `datasource` block**:
    ```prisma
    datasource db {
      provider = "mysql" // Change this to "postgresql"
      url      = env("DATABASE_URL")
    }
    ```
3.  **Update `.env`**: Change your `DATABASE_URL` format to match the new provider (see [Configuration](#2-configuration)).
4.  **Remove Migrations** (Optional but Recommended): Delete the `prisma/migrations` folder to avoid conflicts.
5.  **Push changes**:
    ```bash
    npm run db:push
    ```

## 5. Creating an Admin User

After setting up the database, you need a **SUPERADMIN** user to access the dashboard settings.
We included a script to help you create one quickly.

### Syntax
```bash
npm run make-admin <email> <password>
```

### Example
```bash
npm run make-admin admin@example.com password123
```

-   If the user **does not exist**, it will be created with `SUPERADMIN` role.
-   If the user **already exists**, it will be promoted to `SUPERADMIN` (password ignored).

## 6. Troubleshooting

-   **Connection Error**: Check if your database server is running and the credentials in `.env` are correct.
-   **Prisma Client Error**: If you change the schema, always run `npm run db:push` or `npx prisma generate` to update the client.
