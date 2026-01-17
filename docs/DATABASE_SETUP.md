# 🗄️ Database Setup Guide

This guide will help you set up the database for **WA-AKG**. The project uses **Prisma ORM**, which supports PostgreSQL, MySQL, SQLite, and MongoDB.

## 1. Prerequisites

Ensure you have a database server running.
-   **Local Development**: You can use Docker or a local installation of PostgreSQL/MySQL.
-   **Production**: Use a managed database service (e.g., Supabase, Neon, AWS RDS).

## 2. Configuration

Edit your `.env` file and set the `DATABASE_URL`.

### PostgreSQL (Recommended)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/wa_gateway_db?schema=public"
```

### MySQL
```env
DATABASE_URL="mysql://username:password@localhost:3306/wa_gateway_db"
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
