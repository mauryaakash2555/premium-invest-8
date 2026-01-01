## FOUNDATION REBUILD – PHASE 2 (Reorganize Code)

This file explains what changed in Phase 2.
It is written in simple language so even a 10-year-old can follow it.

---

## 1) The Big Idea (What we did)

- We **organized** files into clear folders (user/admin/shared, ai/db/utils).
- We **did not destroy** old files. If something was removed from its old spot, we put a copy in `DELETE_ME/phase2/`.
- We **made chat code cleaner** by moving AI calls into `lib/ai` and DB calls into `lib/db`.

---

## 2) New Folder Structure (What it means)

- **`app/(public)/`**: public pages (like the homepage `/`).
- **`app/admin-secret-xyz/`**: hidden admin page (login + dashboard).
- **`app/api/*`**: API routes (server endpoints).
- **`components/user/`**: UI used by normal users (homepage, chat, etc.).
- **`components/admin/`**: UI used by admin pages.
- **`components/shared/`**: UI used by both user and admin.
- **`lib/ai/`**: AI provider code (Groq / Gemini / Claude).
- **`lib/db/`**: Supabase database helper code (leads / conversations / events).
- **`lib/utils/`**: small helpers like rate limiting and logging.
- **`config/`**: constants + env validation.
- **`DELETE_ME/phase2/`**: “do not delete” safe folder for old files.

---

## 3) What Moved Where (Important moves)

### App routes

- **Old**: `app/page.jsx`  
  **New**: `app/(public)/page.jsx`  
  **Why**: makes it clear this is the public homepage.

### Components

- **Old**: `components/AIChatFloat.jsx`  
  **New**: `components/user/AIChatFloat.jsx`

- **Old**: `components/ChatErrorBoundary.jsx`  
  **New**: `components/shared/ChatErrorBoundary.jsx`

- **Old**: `components/*` (user-facing UI pieces)  
  **New**: `components/user/*`

### AI logic

- **New**: `lib/ai/groq.js` (user chat provider)
- **New**: `lib/ai/gemini.js` (Gemini provider)
- **New**: `lib/ai/claude.js` (admin provider)

### Database logic

- **New**: `lib/db/leads.js` (upsert/read leads)
- **New**: `lib/db/conversations.js` (save/read messages)
- **New**: `lib/db/events.js` (log events + analytics helpers)

### Config

- **New**: `config/constants.js` (all settings in one place)
- **New**: `config/env.js` (env validation)

---

## 4) What Changed (Logic changes)

### `/api/chat` (the biggest cleanup)

File: `app/api/chat/route.js`

- ✅ Now uses:
  - `lib/ai/groq` + `lib/ai/claude` for AI calls
  - `lib/db/conversations` + `lib/db/leads` + `lib/db/events` for DB writes/reads
  - `lib/utils/rateLimiter` for rate limiting
  - `config/constants` for thresholds + rate limits
  - `config/env` for AI env config

This made the API route shorter and easier to maintain.

---

## 5) What We Put In `DELETE_ME/` (Nothing destroyed)

Folder: `DELETE_ME/phase2/ORIGINALS/`

We kept backups of files that were removed from their old locations.
Examples:

- `DELETE_ME/phase2/ORIGINALS/app/page.jsx`
- `DELETE_ME/phase2/ORIGINALS/components/AIChatFloat.module.css`
- `DELETE_ME/phase2/ORIGINALS/components/PremiumMarketTicker.module.css`

### Also parked for “delete later” (still not deleted)

Folder: `DELETE_ME/phase2/TO_DELETE_LATER/`

Why this exists: these files were part of the old layout, but the **new app no longer uses them**.
We moved them here so they don’t clutter the main folders, and so we can restore them if needed.

- Old homepage file (would conflict with the new `(public)` route group):
  - `DELETE_ME/phase2/TO_DELETE_LATER/app/page.jsx`

- Old duplicate “root components” (the app now uses `components/user/*` and `components/shared/*`):
  - `DELETE_ME/phase2/TO_DELETE_LATER/components_root/AIChatFloat.jsx`
  - `DELETE_ME/phase2/TO_DELETE_LATER/components_root/Navigation.jsx`
  - `DELETE_ME/phase2/TO_DELETE_LATER/components_root/Footer.jsx`
  - `DELETE_ME/phase2/TO_DELETE_LATER/components_root/PremiumMarketTicker.jsx`
  - (and other similar duplicates)

- Old support files that were previously in root `components/`:
  - `DELETE_ME/phase2/TO_DELETE_LATER/components/AIChatFloat.module.css`
  - `DELETE_ME/phase2/TO_DELETE_LATER/components/PremiumMarketTicker.module.css`
  - `DELETE_ME/phase2/TO_DELETE_LATER/components/Navigation_backup_pre_shadcn.jsx`
  - `DELETE_ME/phase2/TO_DELETE_LATER/components/V0Test.jsx`

---

## 6) What Broke (and how it was fixed)

- **Problem**: keeping `app/page.jsx` AND `app/(public)/page.jsx` would create a homepage route conflict.  
  **Fix**: keep the active homepage only in `app/(public)/page.jsx`, and store the old file safely in `DELETE_ME/phase2/ORIGINALS/`.

---

## 7) Quick “How to Check” (Smoke test)

- Open homepage: `/`
- Open chat → finish lead capture → ask a question → get reply
- Open admin page: `/admin-secret-xyz`
- Login → view Summary/Analytics


