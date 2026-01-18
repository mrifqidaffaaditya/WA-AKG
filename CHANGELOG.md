
## [v1.2.0] - 2026-01-18

### Added
- **API Standardization**: Standardized API modules to use RESTful path parameters (`/api/{resource}/{sessionId}`) instead of query/body parameters.
- **Real-time Chat Sync**:
    - Implemented Socket.IO integration for instant message updates in Chat Window and Chat List.
    - Removed legacy polling mechanisms for better performance.
    - Added auto-scroll to bottom functionality for new messages.
- **Media Sending Support**:
    - Added UI for sending Images, Videos, Audio, Documents, and Stickers via a new attachment menu.
    - Implemented new API endpoint `POST /api/messages/{sessionId}/{jid}/media`.
- **Session Manager V2**:
    - Refactored Session Manager UI to a modern Grid Layout.
    - Added support for **Custom Session IDs** during creation.
    - Improved status indicators and navigation controls.
- **Landing Page Overhaul**:
    - Redesigned landing page with SaaS-style UI, features grid, and tech stack showcase.
    - Added Dynamic Version display, Privacy Policy, and Terms of Service pages.
- **Documentation**:
    - Enhanced Sidebar with accordion navigation and search.
    - Updated `API_DOCUMENTATION.md` and `swagger.ts` with new Media API endpoint.
- **Public API Enhancements**:
    - Added `fileUrl`, `sender` (object), and `remoteJidAlt` to webhook payloads.
    - Webhooks now include detailed `quoted` message information with auto-resolved media URLs.

### Fixed
- **Chat History Sorting**: Fixed `/api/chat/[sessionId]/[jid]` to correctly fetch the latest 100 messages chronologically.
- **Session Reliability**: Fixed issues with session restarting, stopping, and logout loops.
- **Logout Logic**: Explicit logout now correctly cleans up credentials.


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
