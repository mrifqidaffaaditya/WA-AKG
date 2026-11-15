# 🔐 Environment Variables Guide

This document provides a comprehensive reference for all configuration options available in **WA-AKG**. 

> [!WARNING]
> Never commit your `.env` file to version control (Git). It contains sensitive credentials that could compromise your system.

---

## 🎯 1. Required Core Settings

These variables are critical for the application to function.

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `PORT` | string | `3000` | The port on which the server will listen. Ensure this port is free on your server! |
| `DATABASE_URL` | string | — | The database connection string (e.g. `mysql://user:pass@localhost:3306/db` or `postgresql://user:pass@localhost:5432/db?schema=public`). |
| `AUTH_SECRET` | string | — | Secure cryptographic key used for JWT session encryption. **Server will exit on startup if this is empty in production!** (Generate with `openssl rand -base64 32`). |
| `BASE_URL` | string | `http://localhost:3000` | The unified public URL where your application is hosted. Essential for correct authentication callbacks and URL generation. |
| `NODE_ENV` | string | `development` | Environment mode (`development` \| `production` \| `test`). |
| `HOSTNAME` | string | `localhost` | Server hostname binding IP or address. |

---

## 🔗 2. NextAuth & Proxy Integration

Settings that manage OAuth flow, reverse proxies, and public-facing URL compilation.

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `NEXTAUTH_URL` | string | `${BASE_URL}` | The URL pointing to the NextAuth authentication handler. Should match `BASE_URL`. |
| `AUTH_TRUST_HOST` | boolean | `true` | Set to `true` if your application is deployed behind a reverse proxy (e.g. Nginx, Cloudflare, Apache). |
| `NEXT_PUBLIC_APP_URL` | string | `${BASE_URL}` | Public facing client URL. |
| `NEXT_PUBLIC_API_URL` | string | `${BASE_URL}/api` | Public facing API endpoint URL. |

---

## 🎨 3. Branding & General Settings

Branding attributes and client interface pagination settings.

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `APP_NAME` | string | `WA-AKG` | Custom name displayed across the login screens, dashboard header, and sidebar footer. |
| `LOGO_URL` | string | — | Custom image URL for your brand logo (leave empty to use default asset). |
| `FAVICON_URL` | string | — | Custom image URL for the browser tab favicon (leave empty to use default asset). |
| `NEXT_PUBLIC_CHAT_PAGE_SIZE` | number | `50` | Default number of conversations loaded per page in the chat window. |
| `NEXT_PUBLIC_ALLOW_INDEXING` | boolean | `false` | Set to `true` to allow search engines to crawl public paths (useful for landing pages). |

---

## 📚 4. Swagger API Documentation (/docs)

Interactive OpenAPI / Swagger documentation page settings.

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SWAGGER_ENABLED` | boolean | `true` | Toggle public access to the interactive API documentation at `/docs`. |
| `NEXT_PUBLIC_SWAGGER_USERNAME` | string | `admin` | Basic auth username required to view the `/docs` page. |
| `NEXT_PUBLIC_SWAGGER_PASSWORD` | string | `admin123` | Basic auth password. **Wajib diubah di server production!** |

---

## 🔌 5. WhatsApp Core (Baileys Engine)

Configuration settings for the underlying WhatsApp WebSocket client.

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `BAILEYS_LOG_LEVEL` | string | `error` | Verbosity of WhatsApp socket logging. Options: `trace` \| `debug` \| `info` \| `warn` \| `error` \| `fatal`. Recommend `error` in production to reduce log clutter. |

---

## 🔧 6. Integrations & Feature Flags

Optional third-party integrations and experimental feature toggles.

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `REMOVE_BG_API_KEY` | string | — | API key from [remove.bg](https://www.remove.bg) for automatic sticker background removal. |
| `ENABLE_NOTIFICATIONS` | boolean | `true` | Set to `false` to silence UI-based system alerts. |
| `ENABLE_AUTO_UPDATE_CHECK` | boolean | `true` | Periodically query releases repository to check for updates. |
| `ENABLE_EXPERIMENTAL_FEATURES` | boolean | `false` | Toggle experimental features. |

---

## 🛡️ 7. Security & Limits

Rate limiting parameters and upload size thresholds.

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `SESSION_TIMEOUT_HOURS` | number | `24` | Hours after which user authentication sessions expire. |
| `MAX_UPLOAD_SIZE_MB` | number | `50` | Maximum allowed file upload size (in MB) for media attachments. |
| `ENABLE_RATE_LIMITING` | boolean | `true` | Protect API endpoints from brute-force/abuse via rate limits. |
| `RATE_LIMIT_PER_MINUTE` | number | `60` | Max requests allowed per minute per IP address. |

---

## 🌍 8. Localization & Storage

| Variable | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `TZ` | string | `Asia/Jakarta` | Timezone database string (e.g. `Asia/Jakarta`, `UTC`) for cron campaigns. |
| `LOCALE` | string | `id-ID` | Preferred locale for formatting dates and numbers. |
| `DEFAULT_LANGUAGE` | string | `en` | Default dashboard UI language (`en`, `id`, `pt-BR`) for users who haven't picked one with the language switcher. See [I18N.md](I18N.md). |
| `MEDIA_STORAGE_PATH` | string | `uploads` | Directory folder (relative to project root) where downloaded media attachments are stored. |
| `NEXT_PUBLIC_GA_ID` | string | — | Google Analytics tracking ID. |

---

## 🐳 9. Docker Compose Variables

Required ONLY if utilizing the `docker-compose.yml` stack deployment.

| Variable | Required | Default | Description |
| :--- | :--- | :--- | :--- |
| `MYSQL_ROOT_PASSWORD` | **Yes** | — | Root access password for the MySQL container. |
| `MYSQL_DATABASE` | No | `wa_akg` | Target schema database name. |
| `ADMIN_EMAIL` | **Yes** | — | Email of the default SuperAdmin generated on first boot. |
| `ADMIN_PASSWORD` | **Yes** | — | Password of the default SuperAdmin generated on first boot. |

---

<div align="center">
  **Last Updated**: June 2026 | **Version**: 1.6.2
</div>
