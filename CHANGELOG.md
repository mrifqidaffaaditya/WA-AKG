# Changelog

## [1.0.7] - 2026-01-13

### Fixed
- **Frontend Webhooks**: Fixed an issue where the webhook list was empty. The dashboard now correctly matches both the Session String ID (`mysession`) and the Internal Database ID (CUID) when filtering webhooks.
## [1.0.6] - 2026-01-13

### Fixed
- **Auto Reply**: Fixed silent failure where Auto Reply would not run for new sessions due to missing `BotConfig`. Added automatic creation of default config for both new and existing sessions.
- **API `POST /api/sessions`**: Fixed issue where custom `sessionId` provided in request body was ignored. Now accepts `sessionId` correctly.
- **API `POST /api/webhooks`**: Fixed `500 Internal Server Error` when creating webhooks. The API now correctly resolves the session string ID to the database internal ID (CUID).
- **API `POST /api/system/check-updates`**: Fixed authentication issue. Now uses `getAuthenticatedUser` to allow access via API Key (previously restricted to Session Cookie only).
- **Frontend Session Selector**: Fixed issue where only "CONNECTED" sessions were listed. Now displays all sessions (Disconnected, Scanning QR, etc.) to allow management.
- **Frontend Webhooks Page**: Fixed page to respect the currently selected session in the navbar. Webhook list is now filtered by session, and creating a webhook attaches it to the active session.

### Added
- **Auto Update Check**: Implemented automatic update checking when entering the dashboard. A specific notification is created only if a new version is available.
- **Logging Configuration**: Added `BAILEYS_LOG_LEVEL` support in `.env` to configure WhatsApp Baileys logger verbosity (default: `error`).
- **Scripts**: Added `scripts/test_endpoints.sh` for verifying API endpoints via curl.

### Documentation
- **API Documentation**: Completely overwrote `docs/API_DOCUMENTATION.md` with comprehensive details for all endpoints (Chat, Groups, Broadcast, Spam, Sticker, Status, Scheduler, System). 
- **Environment**: Updated `.env.example` to include new logging configuration.
