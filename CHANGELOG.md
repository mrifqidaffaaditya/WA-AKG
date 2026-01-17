# Changelog

## [beta-v1.1.0.2] - 2026-01-17

### Added
- **Comprehensive API Documentation**:
    - **Full Coverage**: Documented all **86 API endpoints** in `docs/API_DOCUMENTATION.md`, covering Sessions, Messaging, Groups, Contacts, Labels, Scheduler, Auto Reply, Webhooks, Users, and System modules.
    - **OpenAPI 3.0 Support**: Completely rewrote `src/lib/swagger.ts` to provide a full OpenAPI 3.0 specification.
    - **Detailed Examples**: Added copy-paste ready cURL examples and JSON request/response bodies for every endpoint.
    - **Guides**: Added new sections for "Parameter Quick Reference", "Validation Limits", "Error Responses", and "Best Practices".
- **Swagger UI Integration**:
    - Verified and synchronized the `/dashboard/api-docs` page to correctly display the full 86-endpoint specification.
- **Route Tracking**:
    - Updated `all_routes.txt` to accurately track 86 HTTP endpoints across 64 route files.

### Fixed
- **Documentation Accuracy**: Corrected endpoint counts and method definitions (GET/PUT/DELETE) for `autoreplies`, `scheduler`, `webhooks`, and `users` resources.
- **Swagger Schema**: Fixed missing endpoints in the Swagger generator script (`users/{id}`, `labels`, `notifications`, `system`, etc.).

## [1.1.0.1] - 2026-01-15

### Added
- **Webhook Quoted Message Support**: 
    - The webhook payload now includes a `quoted` object when processing a reply to a message.
    - **Recursive Extraction**: Extracts `type`, `content`, `caption`, and identifying keys (`id`, `participant`) of the quoted message.
    - **Smart Media Lookup**: Automatically looks up the original message in the database using its `stanzaId`. If the original message was a media file (Image/Video/Sticker) that was previously saved, the `quoted.fileUrl` field is populated with the local path. This avoids re-downloading media and saves bandwidth.
- **Documentation**: Updated `README.md` with detailed collapsible webhook payload examples.

### Fixed
- **Webhook Syntax**: Resolved a critical syntax error (duplicate code block) in `src/lib/webhook.ts` that caused build failures.
- **Robustness**: Improved `extractQuotedMessage` helper to handle various message types (Group, Private) accurately.

## [beta-v1.1.0.1] - 2026-01-15

### Added
- **Contact Management**: 
    - **Contact List Page**: New Dashboard page (`/dashboard/contacts`) to view, filter, and manage synced contacts.
    - **Features**: Search by Name/JID, Session Filtering, and Configurable Pagination Limits (5 to 3000 items per page).
    - **Database**: Enhanced `Contact` model to store `lid`, `verifiedName`, `remoteJidAlt`, `profilePic`, and raw `data`.
- **UI Enhancements**:
- **Enhanced Messaging Engine**:
    - **Duplicate Filter**: Implemented robust detection to prevent duplicate message processing and auto-replies.
    - **Junk Filter**: Automatically ignores empty messages and technical protocol messages (e.g., key distribution, reactions) to keep the logs clean.
- **Improved UI Inputs**:
    - **Multiline Support**: Auto Reply and Scheduler now use Textarea inputs, allowing for longer, multi-line messages.
- **Bug Fixes**:
    - **Media Access**: Fixed middleware configuration to ensure public media files are accessible.
### Fixed
- **Build Stability**: Resolved improper UI module imports (`Table`, `Pagination`) and missing type overrides for Prisma schema changes.
- **Backend Logic**: Fixed duplicate imports in dashboard pages.

## [1.1.0] - 2026-01-13

### Added
- **Webhook Enhancements**:
    - **Raw Data**: Added `raw` field to webhook payload containing the full Baileys message object.
    - **Media Support**: Added automatic media downloading (Images, Video, etc.). Webhook now includes `fileUrl` pointing to the saved file in `public/media`.
    - **Enriched Participant Data**: For group messages, the `sender` and `participant` fields are now objects containing detailed info (`id`, `phoneNumber`, `admin`).
    - **Standardized Fields**: Added `from` (Chat JID), `sender` (Participant/User), `isGroup`, and `remoteJidAlt` (extracted from message key) fields.
- **API Response Enrichment**:
    - **Chat History API**: `/api/chat/[sessionId]/[jid]` now returns enriched `sender` details for group messages, matching the webhook format.

### Fixed
- **Webhook Logic**: Fixed issues where `from` and `sender` were ambiguous or incorrect. `from` now consistently refers to the Chat Room, and `sender` refers to the actual sender.
- **Async Handling**: Updated message store to safely handle asynchronous webhook operations without blocking.

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
