# Environment Variables Documentation

This document describes all environment variables used in WA-AKG.

## 📋 Quick Start

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the values in `.env` according to your environment

3. **Important:** Never commit `.env` to version control!

---

## 🗄️ Database Configuration

### `DATABASE_URL` (Required)
PostgreSQL or MySQL connection string.

**Format (PostgreSQL):**
```
postgresql://user:password@host:port/database?schema=public
```

**Format (MySQL):**
```
mysql://user:password@host:port/database
```

**Example:**
```env
DATABASE_URL="postgresql://admin:secret123@localhost:5432/wa_gateway?schema=public"
```

---

## 🔐 Authentication

### `AUTH_SECRET` (Required)
Secret key for NextAuth.js session encryption.

**Generate with:**
```bash
openssl rand -base64 32
```

**Example:**
```env
AUTH_SECRET="w6PO4cY5PgJ0VSipJHLK7z0PLx/tWCrYROqGDPIjsm8="
```

### `NEXTAUTH_URL` (Required)
Base URL for NextAuth callbacks.

**Example:**
```env
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_URL="https://wa-gateway.yourdomain.com"  # Production
```

---

## 🚀 Application Settings

### `NODE_ENV`
Application environment.

**Values:** `development` | `production` | `test`

**Default:** `development`

### `PORT`
Port number for the application server.

**Default:** `3000`

**Example:**
```env
PORT="3030"
```

### `HOSTNAME`
Hostname for the server.

**Default:** `localhost`

### `NEXT_PUBLIC_API_URL`
Public API URL (accessible from client-side).

**Example:**
```env
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
NEXT_PUBLIC_API_URL="https://api.yourdomain.com"  # Production
```

---

## 🎨 Branding & UI

### `APP_NAME`
Application name displayed in UI.

**Default:** `WA-AKG`

### `LOGO_URL` (Optional)
Custom logo URL.

**Example:**
```env
LOGO_URL="https://cdn.yourdomain.com/logo.png"
```

### `FAVICON_URL` (Optional)
Custom favicon URL.

---

## 🔌 External Integrations

### `REMOVE_BG_API_KEY` (Optional)
API key for Remove.bg service (sticker background removal).

**Get your key:** https://www.remove.bg/api

**Example:**
```env
REMOVE_BG_API_KEY="your-removebg-api-key"
```

---

## 📝 Logging & Debugging

### `BAILEYS_LOG_LEVEL`
Logging level for Baileys WhatsApp library.

**Values:** `fatal` | `error` | `warn` | `info` | `debug` | `trace`

**Recommended:**
- Production: `error`
- Development: `debug`

**Example:**
```env
BAILEYS_LOG_LEVEL="error"
```

---

## 📚 Swagger API Documentation

### `NEXT_PUBLIC_SWAGGER_USERNAME`
Username for Swagger UI authentication.

**Default:** `admin`

**⚠️ Change in production!**

### `NEXT_PUBLIC_SWAGGER_PASSWORD`
Password for Swagger UI authentication.

**Default:** `admin123`

**⚠️ Change in production!**

### `NEXT_PUBLIC_SWAGGER_ENABLED`
Enable/disable Swagger UI.

**Values:** `true` | `false`

**Default:** `true`

**Example:**
```env
NEXT_PUBLIC_SWAGGER_ENABLED="false"  # Disable in production
```

---

## 🔔 Notifications

### `ENABLE_NOTIFICATIONS`
Enable system notifications.

**Values:** `true` | `false`

**Default:** `true`

---

## ⚙️ Advanced Settings

### `SESSION_TIMEOUT_HOURS`
Session timeout duration in hours.

**Default:** `24`

### `MAX_UPLOAD_SIZE_MB`
Maximum file upload size in megabytes.

**Default:** `50`

### `ENABLE_RATE_LIMITING`
Enable API rate limiting.

**Values:** `true` | `false`

**Default:** `true`

### `RATE_LIMIT_PER_MINUTE`
Maximum requests per minute per IP.

**Default:** `60`

---

## 🌍 Localization

### `TZ`
Timezone for scheduled messages and timestamps.

**Example:**
```env
TZ="Asia/Jakarta"
TZ="America/New_York"
TZ="Europe/London"
```

### `LOCALE`
Locale for date/time formatting.

**Example:**
```env
LOCALE="id-ID"
LOCALE="en-US"
```

---

## 📊 Analytics (Optional)

### `NEXT_PUBLIC_GA_ID`
Google Analytics tracking ID.

**Example:**
```env
NEXT_PUBLIC_GA_ID="G-XXXXXXXXXX"
```

Leave empty to disable analytics.

---

## 🔧 Feature Flags

### `ENABLE_EXPERIMENTAL_FEATURES`
Enable experimental features.

**Values:** `true` | `false`

**Default:** `false`

**⚠️ Use with caution in production!**

### `ENABLE_AUTO_UPDATE_CHECK`
Enable automatic update checking.

**Values:** `true` | `false`

**Default:** `true`

---

## 💾 Backup & Storage

### `MEDIA_STORAGE_PATH`
Path for media file storage (relative to project root).

**Default:** `uploads`

### `BACKUP_SCHEDULE` (Optional)
Backup schedule in cron format.

**Example:**
```env
BACKUP_SCHEDULE="0 2 * * *"  # Daily at 2 AM
```

---

## 🔒 Security Best Practices

1. **Never commit `.env` file** to version control
2. **Use strong `AUTH_SECRET`** (generate with OpenSSL)
3. **Change Swagger credentials** in production
4. **Use HTTPS** in production (`NEXTAUTH_URL`)
5. **Restrict database access** (use strong passwords)
6. **Enable rate limiting** in production
7. **Disable Swagger UI** in production (optional)

---

## 📝 Example Configurations

### Development
```env
NODE_ENV="development"
PORT="3000"
NEXTAUTH_URL="http://localhost:3000"
BAILEYS_LOG_LEVEL="debug"
NEXT_PUBLIC_SWAGGER_ENABLED="true"
```

### Production
```env
NODE_ENV="production"
PORT="3000"
NEXTAUTH_URL="https://wa.yourdomain.com"
BAILEYS_LOG_LEVEL="error"
NEXT_PUBLIC_SWAGGER_ENABLED="false"
NEXT_PUBLIC_SWAGGER_USERNAME="custom-admin"
NEXT_PUBLIC_SWAGGER_PASSWORD="very-secure-password-123"
```

---

## 🆘 Troubleshooting

### Database Connection Issues
- Verify `DATABASE_URL` format
- Check database server is running
- Verify credentials and port
- Check firewall settings

### Authentication Errors
- Regenerate `AUTH_SECRET`
- Verify `NEXTAUTH_URL` matches your domain
- Clear browser cookies
- Check session timeout settings

### Swagger Not Accessible
- Verify `NEXT_PUBLIC_SWAGGER_ENABLED="true"`
- Check credentials
- Clear browser cache
- Restart development server

---

## 📚 Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Environment Variables](https://www.prisma.io/docs/reference/database-reference/connection-urls)
- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)

---

**Last Updated:** 2026-01-17  
**Version:** 1.2.0
