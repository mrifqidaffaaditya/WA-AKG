# Changelog

## [v1.2.0.beta-1] - 2026-01-18

### Changed
- **API Standardization**: Refactored multiple API modules to use RESTful path parameters instead of query/body parameters.
    - **Contacts**: `/api/contacts/{sessionId}`
    - **Labels**: `/api/labels/{sessionId}`
    - **Profile**: `/api/profile/{sessionId}`
    - **Scheduler**: `/api/scheduler/{sessionId}`
    - **Auto Replies**: `/api/autoreplies/{sessionId}`
    - **Groups**: `/api/groups/{sessionId}`
    - **Webhooks**: `/api/webhooks/{sessionId}`
- **Frontend Refactoring**: Updated Dashboard pages (Contacts, Scheduler, Auto Reply, Groups, Webhooks, API Docs) to consume the new RESTful API endpoints.

### Removed
- **Legacy Routes**: Removed deprecated `[id]` based routes for Scheduler, Auto Replies, and Labels to resolve Next.js dynamic route conflicts.

## [Unreleased] - 2026-01-17
### Fixed
- **Session Restart/Stop Logout Bug**: Fixed critical issue where restarting or stopping a session would incorrectly delete authentication credentials, causing complete logout instead of preserving credentials for auto-login.
    - Now only explicit logout (`DisconnectReason.loggedOut`) deletes credentials
    - Stop and Restart actions now preserve credentials for seamless auto-reconnect
    - Modified `src/modules/whatsapp/instance.ts` to differentiate between logout, stop, and disconnect scenarios

### Known Issues
- **Status Update Feature (`POST /api/status/update`)**: 
    - ⚠️ **This endpoint has known reliability issues and should not be used in production.**
    - Text statuses with custom background colors may not display correctly.
    - Media statuses (images/videos) may fail to upload to WhatsApp servers.
    - The feature is experimental and under active development.

### Documentation
- Added prominent WARNING notices to all documentation about status update feature issues:
    - `docs/API_DOCUMENTATION.md`
    - `docs/API-QUICK-REFERENCE.md`
    - `README.md`
- Created API route `/api/media/[filename]` for reliable media file serving (fixes 404 errors).
- Updated `src/lib/webhook.ts` to use new media API route.

## [v1.1.3-beta.2] - 2026-01-17
### Added
- **Session Management Dashboard**: New dashboard page (`/dashboard/sessions/[id]`) for comprehensive session control.
- **Session Actions**: Ability to Start, Stop, Restart, and Logout sessions directly from UI.
- **Real-time Status**: Live uptime counter and status updates (Connected, Stopped, Scanning QR).
- **API Endpoints**:
    - `GET /api/sessions/{id}`: Detailed session info including uptime.
    - `POST /api/sessions/{id}/{action}`: Control session lifecycle (start/stop/restart/logout).
- **Documentation**: Updated Swagger and API Documentation with new endpoints.

### Fixed
- **Session Loop**: Fixed issue where stopped sessions would auto-reconnect indefinitely.
- **Logout Cleanup**: Fixed issue where QR code wouldn't reappear after logout due to stale credentials.
- **API Cleanups**: Resolved proper parameter naming (`{id}` vs `{sessionId}`) in API routes.

## [beta-v1.1.3.1] - 2026-01-17

### Added
- **Group Mentions**: Added support for `@mention` in group chats via `/api/chat/send`.
    ```json
    {
      "jid": "123456@g.us",
      "message": { "text": "Hello @62812..." },
      "mentions": ["628123456789@s.whatsapp.net"]
    }
    ```
- **Status Mentions**: Added support for tagging users in status updates (Stories) via `/api/status/update`.
    ```json
    {
      "content": "Check this out",
      "mentions": ["628123456789@s.whatsapp.net"]
    }
    ```
- **Group Details API**: New endpoint `GET /api/groups/{jid}` to fetch full group metadata (participants, description, admin status) and profile picture.
    - Returns: `subject`, `desc`, `participants` (with admin status), `pictureUrl`, etc.
- **Documentation**: Updated Swagger and Markdown docs to reflect these changes.

## [v1.1.2] - 2026-01-17

### Added
- **API Documentation Audit & Refinement**:
    - **Method Standardization**: Systematically verified all 86 API routes and corrected HTTP methods to match actual implementation (e.g., changed mislabeled `PUT` to `PATCH`, and `GET` to `POST` for action-based endpoints).
    - **OpenAPI Schema Enrichment**: Added comprehensive JSON request and response schemas for all 86 endpoints in `src/lib/swagger.ts`, including nested object structures and detailed field descriptions.
    - **Error Response Documentation**: Added explicitly documented common error responses (`400`, `401`, `403`, `404`, `500`) with example bodies for key modules.
    - **Ghost Removal**: Cleaned up documentation by removing unimplemented or legacy API methods (e.g., ghost `GET` or `PUT` methods that were not present in the codebase).
    - **Synchronization**: Ensured 1:1 parity between `docs/API_DOCUMENTATION.md` and the interactive Swagger UI.

### Fixed
- **Endpoint Accuracy**: Corrected several response structures and field names in the documentation to ensure they perfectly match the Prisma model outputs and API handlers.
- **Improved Examples**: Standardized date formats to ISO 8601 and refined cURL examples for better copy-paste compatibility.

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
