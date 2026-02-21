
## [v1.4.0] - 2026-02-21

### Added
- **Dashboard UI Overhaul**:
    - **Grouped Sidebar Navigation**: Organizes features into logical sections (Messaging, Contacts, Automation, Developer, Administration).
    - **Active Link Highlighting**: Sidebar now correctly highlights the current active page.
    - **Collapsible Groups**: Sidebar sections can now be collapsed/expanded for a cleaner workspace.
    - **Revamped Home Page**: Features 4 summary stat cards, a quick-actions grid, and improved session status cards with colored indicators.
    - **Modernized Layout**: Added backdrop-blur to the navbar, refined spacing, and updated all loading skeletons.
- **Star/Unstar Message**: `POST /api/messages/{sessionId}/{jid}/{messageId}/star` to star or unstar messages.
- **Message Search**: `GET /api/messages/{sessionId}/search` with full-text search, JID/type/sender filters, and pagination.

### Fixed
- **API Consistency**: Refactored reply endpoints (`/api/messages/[sessionId]/[jid]/[messageId]/reply` and `/api/messages/[sessionId]/[jid]/reply`) to use the same `{ message: { text: ... }, mentions: [] }` format as the `/send` endpoint.
- **Auto Reply Bug**: Fixed `matchType` default in PUT endpoint — was `"exact"` (lowercase) but handler expects `"EXACT"` (uppercase), causing updated rules to silently stop matching.
- **Contacts Block/Unblock**: Added missing `decodeURIComponent(jid)` — JIDs with `%40` encoding were not being decoded.
- **Contacts GET Auth**: Replaced `auth()` with `getAuthenticatedUser()` + `canAccessSession()` to enable API key authentication and session-level access control.
- **Infrastructure**: Fixed Prisma binary target issues for better environment compatibility.

### Changed
- **Consistency**: Standardized `403` error messages to `"Forbidden - Cannot access this session"` across 11 route files.
- **Consistency**: Standardized validation order (auth → params → body) across all routes.
- **Cleanup**: Removed duplicate `messages/[jid]/read` route (use `chat/[jid]/read` instead).
- **Styling**: Switched sidebar from a shadow-based design to a more modern border-based aesthetic.

## [v1.3.0] - 2026-02-01

### Added
- **Granular Access Control**:
    - Introduced `BLACKLIST` mode for both Bot Commands and Auto Replies.
    - Added `botBlockedJids` and `autoReplyBlockedJids` to `BotConfig`.
    - Updated Dashboard "Bot Settings" to configure Blocked/Allowed JIDs visually.
- **Advanced Auto Reply Features**:
    - **Context Awareness**: Auto replies can now be scoped to `ALL`, `GROUP`, or `PRIVATE` chats via `triggerType`.
    - **Media Support**: Auto replies can now include media attachments (Images, Videos, Documents) via `mediaUrl` and `isMedia`.
- **Scheduler Enhancements**:
    - **Media Support**: Scheduled messages now support `image`, `video`, and `document` types.
    - **Smart JID Helpers**: Added UI dropdown to easily select recipient type (`@s.whatsapp.net`, `@g.us`, `@newsletter`).
- **Documentation**:
    - Comprehensive audit of `src/lib/swagger.ts` with complete examples for all endpoints.
    - Updated `USER_GUIDE.md` and `README.md` with new feature instructions.

### Fixed
- **Type Safety**: Resolved Prisma type definition conflicts in Auto Reply API route.
- **Stability**: Improvements to context-based message filtering logic.

## [v1.2.0] - 2026-01-18

### Added
- **Major API Refactoring & Standardization**: 
    - **RESTful Architecture**: Completely refactored core API modules to use standardized RESTful path parameters (`/api/{resource}/{sessionId}`) instead of inconsistent query/body params.
    - **Affected Modules**:
        - **Contacts**: `/api/contacts/{sessionId}`
        - **Labels**: `/api/labels/{sessionId}`
        - **Profile**: `/api/profile/{sessionId}`
        - **Scheduler**: `/api/scheduler/{sessionId}`
        - **Auto Replies**: `/api/autoreplies/{sessionId}`
        - **Groups**: `/api/groups/{sessionId}`
        - **Webhooks**: `/api/webhooks/{sessionId}`
    - **Frontend Updates**: Updated all corresponding Dashboard pages (Contacts, Scheduler, Auto Reply, Groups) to consume these new endpoints.
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
