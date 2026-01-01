# BM Wealth (premium-invest-8) — Architecture (Audit Snapshot)

## PROJECT OVERVIEW (simple)

BM Wealth is a website for a wealth/financial services brand (Mumbai). People can browse services, read blog posts, see a live “market ticker”, and contact the team. There is also an “AI concierge” chat that captures leads and (for admins) shows a small dashboard and strategic advice.

## TECH STACK (what it’s built with)

- **Frontend**: Next.js 15 (App Router) + React 18
- **Styling**: Tailwind utilities (via `cn()` helper), CSS modules for some widgets
- **UI/Icons/Animation**: lucide-react icons, framer-motion animations
- **Analytics**: Vercel Analytics + Vercel Speed Insights
- **Database (current)**: Supabase (Postgres) for leads + conversations + events
- **AI**:
  - Groq (LLM) for normal user chat replies
  - Anthropic Claude for admin chat + admin “strategy”
  - Gemini code exists but is currently not used in the main chat path
- **Market data**: Yahoo Finance “chart” endpoint (server-side fetch)
- **Legacy / extra code present**:
  - `backend/` is a FastAPI (Python) backend using MongoDB
  - `frontend/` is a Create React App (older frontend)
  - `api/contact.js` is a Vercel serverless function (Node) contact handler

## CURRENT FEATURES (1–9 completed)

1. **Marketing site pages**: Home, About, Services, Platforms, Partners, Contact, legal/compliance pages.
2. **Luxury navigation**: Desktop nav + a mobile dock menu.
3. **WhatsApp/Chat launcher**: Floating button opens the concierge chat UI.
4. **Lead capture**: Chat asks name → email → phone, then saves to Supabase.
5. **AI concierge**:
   - User mode uses Groq for SEBI-safe educational answers + consultation CTA.
   - Admin mode uses Claude for business/strategy style answers.
6. **Admin dashboard**: Leads list, lead scores (HOT/WARM/COLD), conversations, revenue tracking, analytics, CSV export (admin-only via cookie).
7. **Blog**:
   - Static blog data served from `data/staticBlogData.js`
   - Blog list page can also fetch “backend blogs” from an external backend in production.
8. **Market ticker**: Live-ish market snapshot (indices/metals/FX/crypto) via `/api/market-data`.
9. **Health checks**: `/api/health` reports whether Supabase and AI keys are configured (optional deep checks).

---

## FOLDER STRUCTURE (what each folder is for)

- **`/app`**: Next.js App Router pages + API routes.
- **`/app/api`**: Next.js Route Handlers (server endpoints).
- **`/components`**: React components used by Next.js pages.
- **`/components/ui`**: Shadcn/Radix-style UI building blocks (mostly not used yet in current pages).
- **`/hooks`**: Small React hooks (`useIsMobile`).
- **`/lib`**: Utility + server helpers (`env`, Supabase admin client, admin cookie).
- **`/data`**: Local JSON/data sources for site content and blog posts.
- **`/public`**: Static assets (icons, logos, fonts, sitemap, robots).
- **`/supabase`**: SQL schema for the Supabase tables used by the AI + admin dashboard.
- **`/database_backup`**: MongoDB dump files (legacy/backup).
- **`/backend`**: Python FastAPI backend (legacy / external deployment).
- **`/frontend`**: Old React app (legacy).
- **`/api`**: Legacy Vercel serverless functions (example: `api/contact.js`).
- **`/scripts`**: Small helper scripts (validation, safety backups).
- **`/tests`**: Test artifacts (currently minimal for the Next app).
- **`/.vercel` / `.next` / `node_modules`**: build/runtime folders (generated).

---

## FILE INVENTORY (important files)

### App shell + pages

- **`app/layout.js`**
  - **Purpose**: Global layout wrapper.
  - **What it does**: Adds `Navigation`, `Footer`, `LuxuryMobileDock`, `WhatsAppFloat`, plus Vercel analytics.
  - **Depends on**: `components/*`, `@vercel/analytics`, `@vercel/speed-insights`.

- **`app/page.jsx`**
  - **Purpose**: Homepage.
  - **What it does**: Hero + services cards + blog preview + live mood strip + live ticker.
  - **Depends on**: `components/AnimatedClouds`, `ServiceCard`, `BlogCard`, `MarketMoodStrip`, `PremiumMarketTicker`, `data/staticBlogData`.

- **`app/blog/page.js`**
  - **Purpose**: Blog list page.
  - **What it does**: Shows static blog posts immediately; optionally fetches more posts from external backend on production domain.
  - **Depends on**: `data/staticBlogData`, `components/LazyImage`, `components/MobileScrollBoost`, `NEXT_PUBLIC_BACKEND_URL`.

- **`app/blog/[slug]/page.js`**
  - **Purpose**: Blog detail page.
  - **What it does**: Loads a single post from `data/staticBlogData`, renders HTML, applies “scroll boost” to certain blocks.
  - **Depends on**: `data/staticBlogData`, browser DOM APIs.

- **Other page folders under `app/`** (examples: `services/`, `contact/`, `privacy/`, `terms/`, etc.)
  - **Purpose**: Static marketing / legal pages.
  - **What they do**: Present content and CTAs.
  - **Depends on**: Mostly `next/link`, icons, and occasionally `MobileScrollBoost` / `LazyImage`.

### API routes (Next.js)

- **`app/api/chat/route.js`**
  - **Purpose**: Main AI chat brain.
  - **What it does**: Validates input, rate-limits, calls Groq (user) or Claude (admin), writes to Supabase (best effort).
  - **Depends on**: `lib/env`, `lib/adminSession`, `lib/supabaseAdmin`, Groq API, Anthropic API.

- **`app/api/leads/route.js`**
  - **Purpose**: Capture/Upsert leads.
  - **What it does**: Upserts by email into `public.leads`.
  - **Depends on**: Supabase service role key + URL.

- **`app/api/events/route.js`**
  - **Purpose**: Analytics/event logging.
  - **What it does**: Writes events to `public.events`; hashes IP server-side for privacy.
  - **Depends on**: Supabase, `ADMIN_PASSWORD` (used as salt).

- **`app/api/admin/*/route.js`**
  - **Purpose**: Admin-only endpoints (dashboard/analytics/revenue/export/strategy).
  - **What it does**: Checks admin cookie, queries Supabase, returns JSON or CSV.
  - **Depends on**: Supabase + admin cookie in request.

- **`app/api/market-data/route.js`**
  - **Purpose**: Market snapshot provider.
  - **What it does**: Fetches public Yahoo Finance data server-side; normalizes to a small JSON.
  - **Depends on**: Yahoo Finance endpoints (public).

- **`app/api/blog/route.js`**
  - **Purpose**: Serve local blog JSON.
  - **What it does**: Reads `data/blog.json` and returns it with no-cache headers.
  - **Depends on**: `fs/promises`.

- **`app/api/bmwealth/route.js`**
  - **Purpose**: Dummy connectivity endpoint.
  - **What it does**: Returns `data/bmwealth.json`.
  - **Depends on**: Local JSON import.

- **`app/api/health/route.js`**
  - **Purpose**: Health + setup status.
  - **What it does**: Checks Supabase + AI keys, optionally does quick “ping” calls to Gemini/Claude.
  - **Depends on**: Supabase, Gemini, Anthropic.

### Core “helpers”

- **`lib/env.js`**
  - **Purpose**: Validate environment variables.
  - **What it does**: Uses `zod` schemas to read AI/Supabase/Admin env vars safely.
  - **Depends on**: `zod`.

- **`lib/supabaseAdmin.js`**
  - **Purpose**: Server-side Supabase client.
  - **What it does**: Creates a Supabase client using service role key.
  - **Depends on**: `@supabase/supabase-js`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.

- **`lib/adminSession.js`**
  - **Purpose**: Admin auth cookie.
  - **What it does**: HMAC-signs a cookie using `ADMIN_PASSWORD`, verifies expiry.
  - **Depends on**: Node `crypto`, `ADMIN_PASSWORD`.

- **`hooks/useIsMobile.js`**
  - **Purpose**: Simple mobile detection.
  - **What it does**: Watches window width + pointer/hover media queries.
  - **Depends on**: browser APIs.

### Supabase schema

- **`supabase/schema.sql`**
  - **Purpose**: Create the tables used by AI + admin dashboard.
  - **What it does**: Creates `leads`, `conversations`, `events` with indexes.
  - **Depends on**: Supabase Postgres + `pgcrypto` extension.

### Legacy/other code in repo

- **`backend/server.py`**
  - **Purpose**: FastAPI backend (MongoDB) for contact/newsletter/blog.
  - **What it does**: Provides `/api/contact`, `/api/newsletter`, `/api/blog` endpoints and optional seeding.
  - **Depends on**: MongoDB, reCAPTCHA secret, FastAPI.

- **`api/contact.js`**
  - **Purpose**: Vercel serverless contact handler.
  - **What it does**: Validates, optional reCAPTCHA verify, saves to MongoDB, sends email (optional).
  - **Depends on**: MongoDB, Gmail credentials, optional reCAPTCHA secret.

---

## DATA FLOW DIAGRAMS (text)

### 1) User chat (lead capture + AI reply)

User clicks chat button → `components/WhatsAppFloat.jsx` → opens `components/AIChatFloat.jsx`
Name/email/phone → `POST /api/leads` → Supabase `leads` table
User question → `POST /api/chat` → Groq API → reply → shown in chat UI
Events (visitor/message/etc) → `POST /api/events` → Supabase `events` table

### 2) Admin mode

Admin enters code in chat → `POST /api/admin/login` → sets admin cookie
Admin dashboard fetch → `GET /api/admin/summary` → Supabase queries → dashboard JSON
Admin analytics → `GET /api/admin/analytics` → Supabase events + conversations → analytics JSON
Admin strategy → `GET /api/admin/strategy` → Claude API → cached in Supabase events

### 3) Blog list

User opens `/blog` → `app/blog/page.js` shows `data/staticBlogData.js` posts
On production domain only → fetch `${NEXT_PUBLIC_BACKEND_URL}/api/blog` (legacy backend) → merge posts

### 4) Market ticker

Homepage ticker → `components/PremiumMarketTicker.jsx` → `GET /api/market-data` → Yahoo Finance → normalized JSON → UI

### 5) Contact form

User submits contact form → `app/contact/page.jsx` → axios `POST ${NEXT_PUBLIC_BACKEND_URL}/api/contact` → backend validates reCAPTCHA + saves to MongoDB → returns success/failure
If slow/fails → user sees WhatsApp fallback CTA

---

## EXTERNAL DEPENDENCIES (what they do / when used)

### Gemini API
- **What it does**: Google Gemini LLM.
- **When used**: Code exists in `app/api/chat/route.js`, but user chat currently uses Groq, and admin uses Claude.

### Groq API
- **What it does**: Fast LLM “chat completions”.
- **When used**: Normal (non-admin) chat replies in `POST /api/chat`.

### Claude (Anthropic) API
- **What it does**: LLM used for “admin strategic advisor” and admin chat responses.
- **When used**: Admin mode in `POST /api/chat` and `GET /api/admin/strategy`.

### Supabase
- **What it does**: Stores leads, conversations, events (and is queried for admin dashboard).
- **Tables**: `leads`, `conversations`, `events` (see `docs/DATABASE.md`).

### Cloudflare
- **What it does**: Not used directly in the Next.js app code.
- **When used**: Only referenced inside dependency code (for Cloudflare Workers compatibility). If you use Cloudflare in production, it’s likely at DNS/proxy level, not in this repo’s source.
