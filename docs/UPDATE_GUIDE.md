# 🔄 WA-AKG Update Guide

This guide covers how to update the application code, dependencies, and database schema, as well as how to bump the application version.

---

## 🚀 Updating the Application

### 1. Pull Latest Code
If you are using git, pull the latest changes from the repository:
```bash
git pull origin main
```

### 2. Install New Dependencies
New features might require new packages. Always run install after pulling:
```bash
npm install
```

### 3. Update Database Schema
If there are changes to `prisma/schema.prisma` (e.g., new tables or fields), you must push them to your database:
```bash
npm run db:push
```
> **Note**: This command syncs your schema with the database without losing data (in most cases). If you need to create migration files for production safety, use `npx prisma migrate dev`.

### 4. Rebuild the Application
Rebuild the Next.js application to apply changes:
```bash
npm run build
```

### 5. Restart the Server
If you are using a process manager like PM2:
```bash
pm2 restart wa-akg
```
Or if running manually:
`npm start`

---

## 🏷️ Versioning

To update the application version displayed in the dashboard:

1.  Open `package.json` in the root directory.
2.  Locate the `"version"` field.
3.  Increment the version number (e.g., change `"1.0.0"` to `"1.1.0"`).

```json
{
  "name": "wa-akg",
  "version": "1.1.0", 
  ...
}
```

The new version will automatically be reflected in the Dashboard Sidebar footer after a rebuild.

---

## 🛠️ Common Issues

### Database Client Error
If you see errors related to Prisma Client after an update, regenerate it:
```bash
npx prisma generate
```

### Type Errors
If `npm run build` fails with type errors, ensure you have pulled all files correctly and that `node_modules` is up to date (`npm install`).
