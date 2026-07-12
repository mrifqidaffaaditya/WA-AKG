## 📝 Description

### Direct Chat URL (`/dashboard/chat/[jid]`)
- New dynamic route `/dashboard/chat/[jid]` that opens a chat directly by phone number
- URL path syncs via `history.replaceState` when selecting a chat from the list
- Handles browser back/forward via `popstate` event
- Supports formats: `+62812xxx`, `62812xxx`, `0812xxx`

### Webhook Log Optimization
- Removed `raw: message` (full Baileys WAMessage) from webhook payload — biggest storage hog
- Truncated `responseBody` to max 1KB — prevents storing full HTML error pages
- Added auto-cleanup: deletes logs older than 30 days, caps at 500 logs per webhook

### Reply Input Focus
- Reply text box now automatically gains focus when clicking reply arrow or using context menu reply

## 🔖 PR Type

- [x] `feat` — New feature
- [x] `fix` — Bug fix
- [ ] `chore` — Maintenance / dependency
- [ ] `docs` — Documentation
- [ ] `refactor` — Code refactor
- [ ] `breaking` — ⚠️ Breaking change

## 🔗 Related Issue

Closes #84, Closes #85

## 📸 Screenshot / Demo

<!-- Upload screenshot / GIF if there are UI changes -->

## ✅ Checklist

- [x] Tested locally (`npm run dev`)
- [ ] `npm run build` succeeds without errors
- [ ] Linter is clean (`npx eslint .`)
- [x] Documentation updated (CHANGELOG.md)
- [ ] No credentials or secrets exposed

## 🧪 Testing Steps

### Direct Chat URL
1. Navigate to `/dashboard/chat/62812xxxxxx` — chat window opens directly with that number
2. Click a different chat from the list — URL updates to `/dashboard/chat/{number}`
3. Click browser back/forward — selected chat follows URL

### Reply Focus
1. Open any chat
2. Hover a message and click the reply arrow (CornerUpLeft icon)
3. Text input should automatically receive focus

### Webhook Log
1. Webhook logs now exclude `raw: message` payload
2. Response bodies larger than 1KB are truncated
3. Old logs (>30 days) auto-deleted, max 500 per webhook

## ⚠️ Breaking Changes

None
