# FULL CODEBASE AUDIT – COMPLETE INVENTORY CHECK (Phase 1 Baseline)

**Repo:** `premium-invest-8`  
**Audit date:** 2026-03-10  
**Audit mode:** READ-ONLY (no fixes, no deletions)  
**Audited commit:** `6c9175c0d6050ed7ee93985cde6430d1ed67a087` (branch `staging`; same as `origin/main`)  

## How to read this report
- **Code-present** means the implementation exists in the repository.
- **Operational/working** is marked **UNKNOWN** unless it can be verified via runtime checks + a live Supabase project (not available from this audit context).
- Any uncertainty is explicitly labeled **UNKNOWN**.

---

# PART 1 — Phase 1 Features (Inventory + Status)

## Feature numbering note (IMPORTANT)
The repo has **inconsistent feature numbering**:
- `features/FEATURES.md` documents **Feature 1–9**.
- `app/api/chat/route.js` includes comments for **Feature 10–12**.
- `config/features.js` contains additional flags (affiliate tracking, product pitching, email notifications, smart cache, SEBI audit, admin modes, provider toggles).

Below is a consolidated **Phase-1 baseline** aligned to the repository’s own docs + flags.

## Feature 1 — Lead Capture
- **Code-present:** YES
- **Likely working:** UNKNOWN (depends on Supabase table availability)
- **Primary files:**
  - `components/user/AIChatFloat.jsx` (lead capture UI + POST)
  - `app/api/leads/route.js`
  - `lib/db/leads.js`
- **DB dependency:** `public.leads` (defined in `supabase/schema.sql`)
- **Flags:** `FEATURE_LEAD_CAPTURE` / `NEXT_PUBLIC_FEATURE_LEAD_CAPTURE`

## Feature 2 — Context Memory
- **Code-present:** YES
- **Likely working:** UNKNOWN (depends on Supabase `conversations` table)
- **Primary files:**
  - `lib/ai/contextManager.js`
  - `lib/db/conversations.js`
  - `app/api/chat/route.js`
- **DB dependency:** `public.conversations` (defined in `supabase/schema.sql`)
- **Flags:** `FEATURE_CONTEXT_MEMORY` / `NEXT_PUBLIC_FEATURE_CONTEXT_MEMORY`

## Feature 3 — Time Greetings
- **Code-present:** YES
- **Likely working:** YES (no external dependency)
- **Primary files:** `components/user/AIChatFloat.jsx`
- **Flags:** `NEXT_PUBLIC_FEATURE_TIME_GREETINGS`

## Feature 4 — Revenue Tracking (Admin)
- **Code-present:** YES
- **Likely working:** UNKNOWN (depends on `events` table)
- **Primary files:**
  - `components/user/AIChatFloat.jsx` (admin UI)
  - `app/api/admin/revenue/route.js`
  - `lib/db/events.js`
- **DB dependency:** `public.events` (defined in `supabase/schema.sql`)
- **Flags:** `FEATURE_REVENUE_TRACKING` / `NEXT_PUBLIC_FEATURE_REVENUE_TRACKING`

## Feature 5 — Lead Scoring
- **Code-present:** YES
- **Likely working:** UNKNOWN (depends on `leads` + `events`)
- **Primary files:**
  - `app/api/chat/route.js` (lead scoring + persistence)
  - `lib/db/leads.js` (safe updates)
  - `lib/db/events.js`
- **DB dependency:** `public.leads.lead_score`, `public.events`
- **Flags:** `FEATURE_LEAD_SCORING` / `NEXT_PUBLIC_FEATURE_LEAD_SCORING`

## Feature 6 — Analytics (Admin)
- **Code-present:** YES
- **Likely working:** UNKNOWN
- **Primary files:**
  - `app/api/admin/analytics/route.js`
  - `components/user/AIChatFloat.jsx` (admin analytics tab)
  - `lib/db/events.js`, `lib/db/conversations.js`, `lib/db/leads.js`
- **DB dependency:** `public.events`, `public.conversations`, `public.leads`
- **Flags:** `FEATURE_ANALYTICS` / `NEXT_PUBLIC_FEATURE_ANALYTICS`

## Feature 7 — Claude Admin (Strategic Advisor)
- **Code-present:** YES
- **Likely working:** UNKNOWN (depends on Anthropic key + flags)
- **Primary files:**
  - `app/api/admin/strategy/route.js`
  - `lib/ai/claude.js`
  - `components/user/AIChatFloat.jsx` (admin strategy panel)
- **Env dependency:** `ANTHROPIC_API_KEY` (also `CLAUDE_API_KEY` appears referenced elsewhere)
- **Flags:** `FEATURE_CLAUDE_ADMIN`, `FEATURE_USE_CLAUDE` (+ NEXT_PUBLIC variants)

## Feature 8 — AI Provider: Gemini
- **Code-present:** YES
- **Likely working:** UNKNOWN (depends on key)
- **Primary files:** `lib/ai/gemini.js`, `lib/ai/provider.js`, `app/api/chat/route.js`
- **Env dependency:** `GEMINI_API_KEY` (and `GOOGLE_AI_API_KEY` also referenced)
- **Flags:** `FEATURE_USE_GEMINI` (+ NEXT_PUBLIC variant)

## Feature 9 — AI Provider: Groq
- **Code-present:** YES
- **Likely working:** UNKNOWN (depends on key)
- **Primary files:** `lib/ai/groq.js`, `lib/ai/provider.js`, `app/api/chat/route.js`
- **Env dependency:** `GROQ_API_KEY`
- **Flags:** `FEATURE_USE_GROQ` (+ NEXT_PUBLIC variant)

## Feature 10 — Affiliate Tracking / Affiliate Context
- **Code-present:** YES
- **Likely working:** UNKNOWN (depends on tables + flags)
- **Primary files:**
  - `app/track/[platform]/route.js` (redirect + click logging)
  - `app/api/affiliate/click/route.js` (UI click event)
  - `lib/db/affiliateLinks.js` (DB access)
  - `lib/ai/provider.js` (affiliate context prompt, tag extraction)
- **DB dependency:** `public.affiliate_links`, `public.affiliate_clicks` (defined in `supabase/schema.sql`)
- **Flags:** `NEXT_PUBLIC_FEATURE_AFFILIATE_TRACKING` (+ server `FEATURE_AFFILIATE_TRACKING`)
- **Known issue (audit finding):** `lib/db/affiliateLinks.js` comments/shape appear inconsistent with `supabase/schema.sql` columns (needs reconciliation; not fixed here).

## Feature 11 — Product Pitching
- **Code-present:** YES
- **Likely working:** YES/UNKNOWN (purely code + flags; optional)
- **Primary files:** `lib/pitching/intentDetector.js`, `lib/pitching/pitches.js`, `app/api/chat/route.js`
- **Flags:** `NEXT_PUBLIC_FEATURE_PRODUCT_PITCHING`

## Feature 12 — Email Notifications (Hot lead alert + summaries + followups)
- **Code-present:** YES
- **Likely working:** UNKNOWN (depends on Resend + DB)
- **Primary files:**
  - `lib/email/emailService.js`
  - `app/api/chat/route.js` (hot-lead alert path; deduped via `events`)
  - `app/api/cron/*` (daily/weekly summaries; followups)
- **Env dependency:** `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `SUBMISSIONS_NOTIFY_EMAIL` (plus others)
- **DB dependency:** `public.email_preferences` exists (BUT schema mismatch; see Part 2)
- **Flags:** `NEXT_PUBLIC_FEATURE_EMAIL_NOTIFICATIONS`
- **Known gap (audit finding):** code references `email_followups` table, but no `CREATE TABLE` for it exists in repo SQL migrations.

## Feature 13 — Smart Cache
- **Code-present:** YES
- **Likely working:** UNKNOWN (best-effort; falls back in-memory)
- **Primary files:** `lib/cache/smartCache.js`, `app/api/chat/route.js`
- **DB dependency:** `public.smart_cache` (defined in `supabase/schema.sql` and `supabase/migrations/add_smart_cache.sql`)
- **Flags:** `NEXT_PUBLIC_FEATURE_SMART_CACHE`

## Compliance guardrail — SEBI Audit (extra)
- **Code-present:** YES
- **Likely working:** UNKNOWN (depends on provider keys)
- **Primary files:** `lib/compliance/sebiAudit.js`, `app/api/chat/route.js`
- **Flags:** `NEXT_PUBLIC_FEATURE_SEBI_AUDIT`, `NEXT_PUBLIC_FEATURE_SEBI_AUDIT_CLAUDE_FALLBACK`

## Admin modes (extra)
- **Super admin:** `app/admin-secret-akash/page.jsx` + `/api/admin/*` routes + `components/admin/SuperAdminDashboard.jsx`
- **Family admin:** `/api/admin/family/login`, `/api/admin/family-stats`, `components/admin/FamilyAdminView.jsx`
- **Note:** Family admin is designed as **stats-only** (no AI call in chat path).

---

# PART 2 — Supabase Schema Audit (ALL tables found in repo SQL)

## Data access note
- This audit can only confirm **schema declared in repo** (`supabase/schema.sql` + `supabase/migrations/*.sql`).
- **Row counts:** **UNKNOWN** (requires live DB access).

## Tables defined in `supabase/schema.sql`
### `public.leads`
- Columns: `id uuid pk default gen_random_uuid()`, `name text`, `email text unique`, `phone text`, `lead_score integer default 0`, `created_at timestamptz default now()`
- Indexes: `idx_leads_created_at (created_at desc)`
- FKs: none

### `public.conversations`
- Columns: `id uuid pk`, `lead_id uuid -> public.leads(id) on delete cascade`, `message text`, `sender text check in ('user','bot')`, `created_at timestamptz`
- Indexes: `idx_conversations_lead_created (lead_id, created_at desc)`
- FKs: `lead_id` → `public.leads(id)`

### `public.events`
- Columns: `id uuid pk`, `lead_id uuid -> public.leads(id) on delete cascade`, `event_type text`, `data jsonb`, `created_at timestamptz`
- Indexes: `idx_events_lead_created (lead_id, created_at desc)`
- FKs: `lead_id` → `public.leads(id)`

### `public.affiliate_links`
- Columns: `id uuid pk`, `platform text not null`, `category text`, `affiliate_url text`, `commission_rate numeric`, `commission_type text`, `is_active boolean default true`, `placeholder boolean default false`, `created_at timestamptz`
- Indexes: none declared here
- FKs: none

### `public.affiliate_clicks`
- Columns: `id uuid pk`, `affiliate_id uuid -> public.affiliate_links(id)`, `lead_id uuid -> public.leads(id) on delete set null`, `platform text`, `clicked_at timestamptz`, `converted boolean default false`, `conversion_amount numeric`, `converted_at timestamptz`
- Indexes: `idx_clicks_platform(platform)`, `idx_clicks_lead(lead_id)`
- FKs: `affiliate_id` → `affiliate_links(id)`, `lead_id` → `leads(id)`

### `public.email_preferences` (schema.sql version)
- Columns: `id uuid primary key` (no default), `email_address text not null`, notification booleans, `created_at`, `updated_at`
- Seed: inserts a singleton row with fixed id `00000000-0000-0000-0000-000000000001`
- Indexes: none declared here
- FKs: none

### `public.smart_cache`
- Columns: `scope text check in ('public','family_admin','super_admin')`, `question_hash text`, `normalized_question text`, `answer text`, `provider text`, `hits bigint default 0`, `created_at`, `updated_at`, `last_hit_at`, PK `(scope, question_hash)`
- Indexes: `idx_smart_cache_hits(hits desc)`, `idx_smart_cache_last_hit(last_hit_at desc)`
- FKs: none

## Tables defined in `supabase/migrations/*.sql`
### `public.onboarding_events` (from `add_onboarding_events.sql`)
- Columns: `id uuid pk`, `user_id text`, `session_id text`, `step_number int`, `action_type text check in ('complete','skip','assist')`, `skip_reason text`, `meta jsonb`, `created_at timestamptz`
- Indexes: `onboarding_events_user_idx(user_id)`, `onboarding_events_session_idx(session_id)`, `onboarding_events_step_idx(step_number, action_type)`

### `public.onboarding_leads` (from `add_onboarding_leads_clicks.sql`)
- Columns: `id uuid pk`, `name text`, `phone text`, `email text`, `step_stuck int`, `source text default 'onboarding_public'`, `created_at timestamptz`
- Indexes: `onboarding_leads_email_idx(email)`, `onboarding_leads_phone_idx(phone)`

### `public.onboarding_clicks` (from `add_onboarding_leads_clicks.sql`)
- Columns: `id uuid pk`, `step_number int`, `click_type text not null`, `user_id text`, `session_id text`, `meta jsonb`, `created_at timestamptz`
- Indexes: `onboarding_clicks_type_idx(click_type)`, `onboarding_clicks_step_idx(step_number)`

### `public.whatsapp_followups` (from `add_whatsapp_followups.sql`)
- Columns: `id uuid pk`, `lead_id uuid`, `phone text not null`, `source text default 'unknown'`, `step int not null`, `status text check in (...)`, `due_at timestamptz not null`, `sent_at`, `replied_at`, `provider`, `provider_message_id`, `last_error`, `context jsonb`, `created_at`, `updated_at`
- Indexes: `whatsapp_followups_due_idx(status, due_at)`, `whatsapp_followups_phone_idx(phone)`, `whatsapp_followups_lead_idx(lead_id)`
- Triggers/functions: `set_updated_at_whatsapp_followups()` + trigger `trg_whatsapp_followups_updated_at`
- FKs: none declared (lead_id is not constrained here)

### `public.intelligence_items` (from `002_live_intelligence.sql`)
- Columns: `id uuid pk`, `source_name text`, `source_url text`, `source_hash text unique not null`, `category text check(...)`, `urgency text check(...) default low`, 6 required blocks, processing booleans, `status text check(...)`, `published_at`, `created_at`, `updated_at`
- Indexes: category, urgency, status, published_at, created_at
- Triggers/functions: shared `update_updated_at_column()` + trigger `update_intelligence_items_updated_at`

### `public.live_mood` (from `002_live_intelligence.sql`)
- Columns: `id uuid pk`, `mood_text text`, `mood_type text check(...)`, `generated_by text default gemini`, `context_data jsonb`, `is_active boolean`, `valid_until timestamptz`, `created_at`
- Indexes: `idx_live_mood_active` (partial), `idx_live_mood_created(created_at desc)`

### `public.rss_sources` (from `002_live_intelligence.sql`)
- Columns: `id uuid pk`, `name text unique`, `feed_url text`, `category text`, polling config fields, status fields, `created_at`, `updated_at`
- Triggers/functions: shared `update_updated_at_column()` + trigger `update_rss_sources_updated_at`

### `public.intelligence_queue` (from `002_live_intelligence.sql`)
- Columns: `id uuid pk`, `item_id uuid references public.intelligence_items(id) on delete cascade`, `stage text check(...)`, attempt fields, `status text check(...)`, `created_at`
- Indexes: `idx_queue_status(status)`, `idx_queue_stage(stage)`
- FKs: `item_id` → `intelligence_items(id)`

### `public.signal_types` (from `002_live_intelligence.sql`)
- Columns: `id uuid pk`, `signal_key text unique`, `signal_label text`, `signal_description text`, `created_at`
- Indexes: none declared

### `public.live_intelligence_headlines` (from `20260113_live_intelligence.sql`)
- Columns: `id uuid pk`, `category text`, `icon text default`, `headline text`, `why_it_matters text`, `urgency text default`, `data_point text`, `source text`, `cta_button jsonb`, validity window fields, `is_active boolean`, `is_breaking boolean`, `created_by text`, `created_at`, `updated_at`
- Indexes: `idx_headlines_active`, `idx_headlines_category`, `idx_headlines_validity`
- RLS: enabled; policies for public read + service_role manage
- Functions: `cleanup_expired_headlines()`, `get_active_headlines(p_category)`

### `public.breaking_news_log` (from `20260113_live_intelligence.sql`)
- Columns: `id uuid pk`, `headline text`, `category text default`, `duration_ms int default 30000`, `triggered_at timestamptz`, `triggered_by text`
- Indexes: `idx_breaking_news_recent(triggered_at desc)`
- RLS: enabled; service_role manage

### `public.rss_feed_cache` (from `20260113_live_intelligence.sql`)
- Columns: `id uuid pk`, `feed_url text unique`, `source_name text`, `content text`, `last_fetched timestamptz`, `expires_at timestamptz default now()+5min`
- Indexes: `idx_rss_cache_url(feed_url)`
- RLS: enabled; service_role manage

### `public.live_intelligence_analytics` (from `20260113_live_intelligence.sql`)
- Columns: `id uuid pk`, `event_type text`, `headline_id uuid references live_intelligence_headlines(id)`, `category text`, `mode text`, `session_id text`, `user_agent text`, `created_at timestamptz`
- Indexes: `idx_analytics_event`, `idx_analytics_headline`
- RLS: enabled; public INSERT allowed; service_role SELECT allowed

### `public.community_post_image_overrides` (from `20260209_community_post_image_overrides.sql`)
- Columns: `post_id text pk`, `image_url text`, `image_keywords text[] default '{}'`, `image_source text default manual`, `created_at`, `updated_at`
- Indexes: `idx_community_post_image_overrides_updated_at(updated_at desc)`

### `public.email_preferences` (migration version – conflicts with schema.sql)
Defined in `add_email_preferences.sql`:
- Columns: `id uuid pk default gen_random_uuid()`, `user_id text default 'admin'`, notification booleans, `email_address text default '...'`, `created_at`, `updated_at`
- Seed: `insert ... on conflict do nothing` (note: no conflict target specified)

**Audit finding:** There are **two incompatible definitions** for `public.email_preferences`:
- `supabase/schema.sql` expects a fixed singleton `id` with `email_address not null`.
- `supabase/migrations/add_email_preferences.sql` defines `id` with a default UUID and `user_id` field.

This should be reconciled for a clean, reproducible schema (not fixed here).

## Supabase tables referenced in code (machine scan)
A full scan of JS/TS sources found these Supabase `.from("...")` usages:

- `admin_sessions`
- `affiliate_clicks`
- `affiliate_links`
- `breaking_news_log`
- `comments`
- `conversations`
- `email_followups`  ← **referenced but not defined in repo SQL**
- `email_preferences`
- `events`
- `fii_dii_data`
- `headlines`
- `health_checks`
- `intelligence_items`
- `intelligence_queue`
- `leads`
- `live_intelligence_analytics`
- `live_intelligence_headlines`
- `live_mood`
- `market_events`
- `night_summaries`
- `onboarding_clicks`
- `onboarding_events`
- `onboarding_leads`
- `post_views`
- `posts`
- `processing_logs`
- `rss_sources`
- `smart_cache`
- `system_alerts`
- `universe_content`
- `whatsapp_followups`
- `whatsapp_subscribers`

**Audit finding:** many referenced tables (e.g., `posts`, `comments`, `admin_sessions`, `system_alerts`, etc.) are **not created** by any SQL in `supabase/` that was found during this audit.

---

# PART 3 — Full File Structure Audit (high-signal inventory)

## Objective repo stats (machine scan)
- `TOTAL_FILES=8108` (includes `.git` and various `.tmp_*` artifacts already present in repo)
- Top-level file/dir counts (selected):
  - `.git=6057`
  - `scripts=643`
  - `app=302`
  - `components=230`
  - `frontend=120`
  - `lib=110`
  - `public=46`
  - `supabase=10`

## `app/` (Next.js App Router)
- `APP_FILES=302`
- `app/api/**/route.*`: **131 API route handlers** (via workspace search)
- Major `app/` subareas (depth 2 counts from scan):
  - `app/api=132` (directory-level count; includes non-route files if any)
  - `app/store=12`, `app/tools=12`, `app/blog=11`, `app/(public)=10`, `app/_store=10`
  - `app/admin-secret-akash=6` (super admin entry)
  - `app/intelligence=5`, `app/client-portal=5`, `app/submit=5`

**Notable API groups:**
- Chat + leads: `/api/chat`, `/api/leads`, `/api/leads/capture`
- Admin: `/api/admin/*` (stats, leads, analytics, revenue, deliverables, live-intelligence)
- Cron: `/api/cron/*` (headlines, daily/weekly summary, whatsapp followups, email followups)
- Live intelligence: `/api/live-intelligence/*` (feed, ingest, process, mood, status, archive)
- ITR flows: `/api/itr/*` (upload/extract/audit/validate/payment)
- Payments: `/api/razorpay/*` and `/api/payments/razorpay/*`
- Tracking: `/track/[platform]`, `/api/affiliate/click`, `/api/track-affiliate-click/[id]`

## `lib/` (server utilities + feature modules)
High-level inventory (from directory listing):
- AI: `lib/ai/*` (provider routing, Groq/Gemini/Claude adapters, suggestion generator)
- DB: `lib/db/*` (Supabase admin client + table helpers)
- Cache: `lib/cache/smartCache.js`
- Compliance: `lib/compliance/sebiAudit.js`
- Email: `lib/email/*`
- Auth/session: `lib/adminSession.js`, `lib/familySession.js`, `lib/auth/*`
- Live Intelligence: `lib/live-intelligence/*`
- WhatsApp: `lib/whatsapp/*`

## `public/`
Contains static assets: icons, fonts, service images, spline assets, videos, `ads.txt`, `sw.js`.

---

# PART 4 — Environment Variables Audit (Referenced vs Declared)

## Summary (machine scan)
- `process.env` variables referenced in JS/TS: **125**
- Variables declared in `.env.example`: **8**
- Missing from `.env.example` but referenced in code: **118**
- Present in `.env.example` but not referenced in code: **1** (`NEXT_PUBLIC_APP_URL`)

## Missing vars (explicit list)
The following variables are referenced in code but not present in `.env.example` (count=118):

ADMIN_COOKIE_MAX_AGE_SECONDS
ADMIN_PASSWORD
ADMIN_PASSWORD_HASH
ADMIN_SESSION_SECRET
ADMIN_TOKEN
ANALYTICS_SALT
ANALYZE
ANTHROPIC_API_KEY
AUDIT_ALLOW_LEGACY_SLUGS
AUDIT_INCLUDE_LIVE_CATALOGUE_PAGES
AUDIT_MAIN_BASE
AUDIT_MAX_LIVE_CATALOGUE_PAGES
AUDIT_OUTPUT_DIR
AUDIT_STORE_BASE
BACKEND_URL
BASE_URL
BLOG11_URL
BLOG_IMAGES_STORAGE_BUCKET
CI
CLAUDE_API_KEY
COHERE_API_KEY
CRON_SECRET
DISABLE_HOT_RELOAD
E2E_EXTERNAL_NAV
EDITORIAL_INBOX_EMAIL
ENABLE_HEALTH_CHECK
FAMILY_ADMIN_PASSWORD
FAMILY_ADMIN_PASSWORD_HASH
FAMILY_ADMIN_SESSION_SECRET
FEATURE_LEAD_SCORING
FEATURE_SMART_SMALLTALK_REDIRECT
FORCE_SECURE_COOKIES
GEMINI_API_KEY
GOOGLE_AI_API_KEY
GROQ_API_KEY
HUGGINGFACE_API_KEY
HUGGINGFACE_CHAT_MODEL
ITR_STORAGE_BUCKET
LIVE_INTELLIGENCE_ALLOW_CURATED_FALLBACK
LIVE_INTELLIGENCE_STRICT_AI
MISTRAL_API_KEY
MISTRAL_CHAT_MODEL
NEWS_API_KEY
NEXT_BACKEND_URL
NEXT_PUBLIC_
NEXT_PUBLIC_AI_CHAT_ENABLED
NEXT_PUBLIC_BACKEND_URL
NEXT_PUBLIC_FEATURE_AFFILIATE_TRACKING
NEXT_PUBLIC_FEATURE_ANALYTICS
NEXT_PUBLIC_FEATURE_CHAT_ENABLED
NEXT_PUBLIC_FEATURE_CLAUDE_ADMIN
NEXT_PUBLIC_FEATURE_CONTEXT_MEMORY
NEXT_PUBLIC_FEATURE_EMAIL_NOTIFICATIONS
NEXT_PUBLIC_FEATURE_FAMILY_ADMIN_MODE
NEXT_PUBLIC_FEATURE_LEAD_CAPTURE
NEXT_PUBLIC_FEATURE_LEAD_SCORING
NEXT_PUBLIC_FEATURE_PRODUCT_PITCHING
NEXT_PUBLIC_FEATURE_REVENUE_TRACKING
NEXT_PUBLIC_FEATURE_SEBI_AUDIT
NEXT_PUBLIC_FEATURE_SEBI_AUDIT_CLAUDE_FALLBACK
NEXT_PUBLIC_FEATURE_SMART_CACHE
NEXT_PUBLIC_FEATURE_SMART_SMALLTALK_REDIRECT
NEXT_PUBLIC_FEATURE_SUPER_ADMIN_MODE
NEXT_PUBLIC_FEATURE_TIME_GREETINGS
NEXT_PUBLIC_FEATURE_USE_CLAUDE
NEXT_PUBLIC_FEATURE_USE_GEMINI
NEXT_PUBLIC_FEATURE_USE_GROQ
NEXT_PUBLIC_GA4_MEASUREMENT_ID
NEXT_PUBLIC_RECAPTCHA_SITE_KEY
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY
NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF
NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA
NEXT_PUBLIC_WEALTH_DESK_EMAIL
NEXT_PUBLIC_WEALTH_DESK_NAME
NEXT_PUBLIC_WEALTH_DESK_PHONE
NEXT_PUBLIC_WEALTH_DESK_TITLE
NEXT_PUBLIC_WEALTH_DESK_WHATSAPP
NODE_ENV
OCR_SPACE_API_KEY
OCR_TEMP_DIR
OPENAI_API_KEY
PDFPLUMBER_PYTHON
PDF_DOWNLOAD_TOKEN_SECRET
PLAYWRIGHT_BASE_URL
PLAYWRIGHT_SKIP_WEB_SERVER
PROPERTY_VS_SIP_PAYMENT_LINK
PUBLIC_DASHBOARD_URL
PUBLIC_URL
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
REACT_APP_BACKEND_URL
REACT_APP_ENABLE_VISUAL_EDITS
REACT_APP_RECAPTCHA_SITE_KEY
SUPABASE_SERVICE_ROLE_KEY
SUPER_ADMIN_PASSWORD
SUPER_ADMIN_PASSWORD_HASH
TARGET_URL
TEST_BASE_URL
TEST_PDF_OUT
TEST_TO_EMAIL
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_WHATSAPP_FROM
VALIDATE_ALL_STRICT_ENV
VERCEL
VERCEL_ENV
VERCEL_GIT_COMMIT_REF
VERCEL_GIT_COMMIT_SHA
VERCEL_URL
WHATSAPP_AGENT_NAME
WHATSAPP_AGENT_SIGNATURE
WHATSAPP_CLOUD_API_VERSION
WHATSAPP_CLOUD_TOKEN
WHATSAPP_PHONE_NUMBER_ID
WHATSAPP_WEBHOOK_VERIFY_TOKEN

## Practical implications
- The repo’s `.env.example` is **not sufficient** to configure the app.
- Many features are best-effort and may silently degrade if env vars are missing.

## Key env groups (non-exhaustive)
- **Supabase:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- **AI providers:** `GROQ_API_KEY`, `GEMINI_API_KEY` / `GOOGLE_AI_API_KEY`, `ANTHROPIC_API_KEY` / `CLAUDE_API_KEY` (plus placeholders: `MISTRAL_API_KEY`, `COHERE_API_KEY`, `HUGGINGFACE_API_KEY`)
- **Email (Resend):** `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, `SUBMISSIONS_NOTIFY_EMAIL`, `EDITORIAL_INBOX_EMAIL`
- **Payments:** `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
- **WhatsApp/Twilio:** `WHATSAPP_CLOUD_TOKEN`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_WEBHOOK_VERIFY_TOKEN`, `TWILIO_*` vars (both patterns are referenced)
- **Cron security:** `CRON_SECRET`

Full lists are in **Appendix A**.

---

# PART 5 — Integration Status (Supabase, AI, Email, Payments, Analytics, etc.)

## Integration matrix (code-present vs config)
- **Supabase:** code-present YES (`@supabase/supabase-js`, admin client helpers). Operational status UNKNOWN.
- **Resend email:** code-present YES (`resend` dependency, email service). Operational status UNKNOWN.
- **AI providers:** code-present YES (Groq, Gemini, Claude adapters; orchestrator). Operational status UNKNOWN.
- **Razorpay:** code-present YES (`razorpay` dependency + API routes). Operational status UNKNOWN.
- **Vercel analytics/speed-insights:** dependencies present; usage UNKNOWN.
- **MongoDB:** dependency present (`mongodb`), but Supabase is primary DB in inspected paths; actual usage UNKNOWN.
- **OCR / Document processing:** `tesseract.js`, `pdfjs-dist`, `@google-cloud/documentai` dependencies; ITR routes exist; operational status UNKNOWN.
- **Market data external sources:** `/api/market-data` aggregates many sources; some require keys.

---

# PART 6 — Undocumented / Extra Features Discovered

Codebase contains substantial systems beyond the basic chatbot:
- **Live Intelligence engine** (RSS ingest → AI processing → Supabase tables → UI), with RLS policies and analytics tables.
- **Market snapshot API** (`/api/market-data`) with multi-source fallback.
- **ITR (tax) OCR + filing help flow** (`/api/itr/*`) including upload/extract/validate/payment.
- **Cron job endpoints** (`/api/cron/*`) for summaries, headlines cleanup, followups.
- **Community posts & images** (`/api/submit-post`, `/api/posts`, image overrides table migration).
- **Onboarding funnel tracking** (`onboarding_*` tables + `/api/onboarding/*`).
- **Multiple proxy endpoints** (`/api/proxy-*`, `/api/track-affiliate-click/[id]`) suggesting legacy/external backend integration.

---

# PART 7 — Code Quality Check (Observations + Recommendations)

## What’s good
- Feature flag system supports both server (`FEATURE_*`) and client (`NEXT_PUBLIC_FEATURE_*`) correctly.
- “Best-effort” DB writes reduce hard failures when optional tables are missing.
- Compliance guardrail exists for SEBI-safe responses.
- Deduping of hot-lead emails via event logging is a good pattern.

## Risks / issues (no fixes applied)
- Very large critical route files (notably `app/api/chat/route.js`, `app/api/market-data/route.js`) increase regression risk.
- `.env.example` is severely incomplete relative to code.
- **Schema drift:** `public.email_preferences` has conflicting definitions across SQL files.
- **Missing migrations:** tables referenced in code but not defined in repo SQL (e.g., `email_followups`, `posts`, `comments`, `admin_sessions`, etc.).
- Some DB helper modules appear out of sync with actual schema (`affiliate_links` shape mismatch noted).

## Recommended next actions (safe, Phase 2/3 readiness)
- Reconcile and re-export a single authoritative Supabase schema (or a clean migration chain).
- Add missing table migrations for all code-referenced tables (or remove/guard those code paths).
- Expand `.env.example` into a complete, documented environment contract.
- Split oversized route modules into smaller units + add targeted tests.

---

# PART 8 — Deployment Status (Staging/Prod, Branch Alignment)

## URLs (from `DO_NOT_TOUCH.md`)
- **Staging:** https://stagingpremium-invest-8-gwog89i5i-akashs-projects-7840bca9.vercel.app
- **Production:** https://bmwealth.co.in

## Git alignment
- Local branch: `staging`
- `origin/staging`, `origin/main` point to the same commit: `6c9175c0d...`

## Last deployed
- **UNKNOWN** (requires Vercel deployment inspection / timestamps)

---

# PART 9 — Gaps / Missing Pieces for Phase 2 & 3

## Highest-impact gaps
- **DB schema completeness:** code references multiple tables not declared in repo SQL.
- **Followups:** `email_followups` referenced but schema absent.
- **Env contract:** build-time/runtime env vars are not fully documented.
- **Schema conflicts:** `email_preferences` has two incompatible definitions.

## Phase 2/3 readiness checklist (audit-driven)
- Confirm which DB is authoritative for “posts/comments/headlines/etc.” (Supabase vs another store).
- Confirm provider keys and quotas (Groq/Gemini/Claude) and failure modes.
- Validate cron endpoints are protected (e.g., `CRON_SECRET`) and wired in Vercel Cron.
- Decide whether legacy proxy endpoints are still required.

---

# APPENDIX A — Environment Variables

## A1. Variables referenced in code (count=125)
(From machine scan; includes possible false positives such as `NEXT_PUBLIC_` if used in string concatenation.)

ADMIN_COOKIE_MAX_AGE_SECONDS
ADMIN_PASSWORD
ADMIN_PASSWORD_HASH
ADMIN_SESSION_SECRET
ADMIN_TOKEN
ALPHA_VANTAGE_API_KEY
ANALYTICS_SALT
ANALYZE
ANTHROPIC_API_KEY
AUDIT_ALLOW_LEGACY_SLUGS
AUDIT_INCLUDE_LIVE_CATALOGUE_PAGES
AUDIT_MAIN_BASE
AUDIT_MAX_LIVE_CATALOGUE_PAGES
AUDIT_OUTPUT_DIR
AUDIT_STORE_BASE
BACKEND_URL
BASE_URL
BLOG11_URL
BLOG_IMAGES_STORAGE_BUCKET
CI
CLAUDE_API_KEY
COHERE_API_KEY
CRON_SECRET
DISABLE_HOT_RELOAD
E2E_EXTERNAL_NAV
EDITORIAL_INBOX_EMAIL
ENABLE_HEALTH_CHECK
EXCHANGE_RATE_API_KEY
FAMILY_ADMIN_PASSWORD
FAMILY_ADMIN_PASSWORD_HASH
FAMILY_ADMIN_SESSION_SECRET
FEATURE_LEAD_SCORING
FEATURE_SMART_SMALLTALK_REDIRECT
FORCE_SECURE_COOKIES
GEMINI_API_KEY
GOLDAPI_KEY
GOOGLE_AI_API_KEY
GROQ_API_KEY
HUGGINGFACE_API_KEY
HUGGINGFACE_CHAT_MODEL
ITR_STORAGE_BUCKET
LIVE_INTELLIGENCE_ALLOW_CURATED_FALLBACK
LIVE_INTELLIGENCE_STRICT_AI
MISTRAL_API_KEY
MISTRAL_CHAT_MODEL
NEWS_API_KEY
NEXT_BACKEND_URL
NEXT_PUBLIC_
NEXT_PUBLIC_AI_CHAT_ENABLED
NEXT_PUBLIC_BACKEND_URL
NEXT_PUBLIC_FEATURE_AFFILIATE_TRACKING
NEXT_PUBLIC_FEATURE_ANALYTICS
NEXT_PUBLIC_FEATURE_CHAT_ENABLED
NEXT_PUBLIC_FEATURE_CLAUDE_ADMIN
NEXT_PUBLIC_FEATURE_CONTEXT_MEMORY
NEXT_PUBLIC_FEATURE_EMAIL_NOTIFICATIONS
NEXT_PUBLIC_FEATURE_FAMILY_ADMIN_MODE
NEXT_PUBLIC_FEATURE_LEAD_CAPTURE
NEXT_PUBLIC_FEATURE_LEAD_SCORING
NEXT_PUBLIC_FEATURE_PRODUCT_PITCHING
NEXT_PUBLIC_FEATURE_REVENUE_TRACKING
NEXT_PUBLIC_FEATURE_SEBI_AUDIT
NEXT_PUBLIC_FEATURE_SEBI_AUDIT_CLAUDE_FALLBACK
NEXT_PUBLIC_FEATURE_SMART_CACHE
NEXT_PUBLIC_FEATURE_SMART_SMALLTALK_REDIRECT
NEXT_PUBLIC_FEATURE_SUPER_ADMIN_MODE
NEXT_PUBLIC_FEATURE_TIME_GREETINGS
NEXT_PUBLIC_FEATURE_USE_CLAUDE
NEXT_PUBLIC_FEATURE_USE_GEMINI
NEXT_PUBLIC_FEATURE_USE_GROQ
NEXT_PUBLIC_GA4_MEASUREMENT_ID
NEXT_PUBLIC_RECAPTCHA_SITE_KEY
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_UNSPLASH_ACCESS_KEY
NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF
NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA
NEXT_PUBLIC_WEALTH_DESK_EMAIL
NEXT_PUBLIC_WEALTH_DESK_NAME
NEXT_PUBLIC_WEALTH_DESK_PHONE
NEXT_PUBLIC_WEALTH_DESK_TITLE
NEXT_PUBLIC_WEALTH_DESK_WHATSAPP
NODE_ENV
OCR_SPACE_API_KEY
OCR_TEMP_DIR
OPENAI_API_KEY
PDFPLUMBER_PYTHON
PDF_DOWNLOAD_TOKEN_SECRET
PLAYWRIGHT_BASE_URL
PLAYWRIGHT_SKIP_WEB_SERVER
PROPERTY_VS_SIP_PAYMENT_LINK
PUBLIC_DASHBOARD_URL
PUBLIC_URL
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
REACT_APP_BACKEND_URL
REACT_APP_ENABLE_VISUAL_EDITS
REACT_APP_RECAPTCHA_SITE_KEY
RESEND_API_KEY
RESEND_FROM_EMAIL
SUBMISSIONS_NOTIFY_EMAIL
SUPABASE_SERVICE_ROLE_KEY
SUPER_ADMIN_PASSWORD
SUPER_ADMIN_PASSWORD_HASH
TARGET_URL
TEST_BASE_URL
TEST_PDF_OUT
TEST_TO_EMAIL
TWILIO_ACCOUNT_SID
TWILIO_AUTH_TOKEN
TWILIO_WHATSAPP_FROM
UNSPLASH_ACCESS_KEY
VALIDATE_ALL_STRICT_ENV
VERCEL
VERCEL_ENV
VERCEL_GIT_COMMIT_REF
VERCEL_GIT_COMMIT_SHA
VERCEL_URL
WHATSAPP_AGENT_NAME
WHATSAPP_AGENT_SIGNATURE
WHATSAPP_CLOUD_API_VERSION
WHATSAPP_CLOUD_TOKEN
WHATSAPP_PHONE_NUMBER_ID
WHATSAPP_WEBHOOK_VERIFY_TOKEN

## A2. `.env.example` variables (count=8)
ALPHA_VANTAGE_API_KEY
EXCHANGE_RATE_API_KEY
GOLDAPI_KEY
NEXT_PUBLIC_APP_URL
RESEND_API_KEY
RESEND_FROM_EMAIL
SUBMISSIONS_NOTIFY_EMAIL
UNSPLASH_ACCESS_KEY

## A3. Missing from `.env.example` but referenced in code (count=118)
Same list as Part 4 “Missing vars (explicit list)”.

## A4. Present in `.env.example` but not referenced in code
- `NEXT_PUBLIC_APP_URL`

---

# APPENDIX B — Supabase Tables Referenced in Code (count=32)
admin_sessions
affiliate_clicks
affiliate_links
breaking_news_log
comments
conversations
email_followups
email_preferences
events
fii_dii_data
headlines
health_checks
intelligence_items
intelligence_queue
leads
live_intelligence_analytics
live_intelligence_headlines
live_mood
market_events
night_summaries
onboarding_clicks
onboarding_events
onboarding_leads
post_views
posts
processing_logs
rss_sources
smart_cache
system_alerts
universe_content
whatsapp_followups
whatsapp_subscribers

---

# APPENDIX C — API Route Inventory (`app/api/**/route.*`, count=131)

app/api/admin/affiliate-convert/route.js
app/api/admin/affiliate-fail/route.js
app/api/admin/affiliate-stats/route.js
app/api/admin/affiliate-update/route.js
app/api/admin/aio-tracker/route.js
app/api/admin/analytics/route.js
app/api/admin/approve/[id]/route.js
app/api/admin/blog-images/route.js
app/api/admin/daily-metrics/route.js
app/api/admin/deliverables/email/route.js
app/api/admin/deliverables/pdf/route.js
app/api/admin/deliverables/preview/email/route.js
app/api/admin/deliverables/preview/pdf/route.js
app/api/admin/deliverables/route.js
app/api/admin/email-preferences/route.js
app/api/admin/export/route.js
app/api/admin/family-stats/route.js
app/api/admin/family/login/route.js
app/api/admin/family/logout/route.js
app/api/admin/headlines/route.js
app/api/admin/insights/route.js
app/api/admin/leads/route.js
app/api/admin/live-intelligence/route.js
app/api/admin/login/route.js
app/api/admin/logout/route.js
app/api/admin/queue/route.js
app/api/admin/reject/[id]/route.js
app/api/admin/revenue/route.js
app/api/admin/search-images/route.js
app/api/admin/site-images/route.js
app/api/admin/stats/route.js
app/api/admin/strategy/route.js
app/api/admin/summary/route.js
app/api/admin/test-email/route.js
app/api/admin/test-property-vs-sip-emails/route.js
app/api/admin/verify/route.js
app/api/affiliate/click/route.js
app/api/ai/generate-summary/route.js
app/api/analytics/live-intelligence/route.js
app/api/approve/[id]/route.js
app/api/blog-image/route.js
app/api/blog/editorial-image-overrides/route.js
app/api/blog/route.js
app/api/bmwealth/route.js
app/api/breaking-news/route.js
app/api/chat/route.js
app/api/comments/[postId]/route.js
app/api/community-images/route.js
app/api/contact/route.js
app/api/cron/check-expiry/route.js
app/api/cron/daily-summary/route.js
app/api/cron/email-followups/route.js
app/api/cron/headlines/route.js
app/api/cron/weekly-summary/route.js
app/api/cron/whatsapp-followups/route.js
app/api/email/click/route.js
app/api/email/open/route.js
app/api/events/route.js
app/api/generate-pdf/route.ts
app/api/health/route.js
app/api/insights-config/route.js
app/api/intelligence/crisis-mode/route.js
app/api/intelligence/sip-vs-panic/challenge-stats/route.ts
app/api/intelligence/sip-vs-panic/generate-blog/route.ts
app/api/intelligence/sip-vs-panic/social-proof/route.ts
app/api/intelligence/sip-vs-panic/story-stats/route.ts
app/api/intelligence/sip-vs-panic/track/route.ts
app/api/itr/audit/route.js
app/api/itr/delete/route.js
app/api/itr/download-json/route.js
app/api/itr/extract-text/route.js
app/api/itr/extract-v2/route.js
app/api/itr/extract/route.js
app/api/itr/file/route.js
app/api/itr/override/route.js
app/api/itr/payment/route.js
app/api/itr/pdfjs-worker/route.js
app/api/itr/upload/route.js
app/api/itr/validate/route.js
app/api/leads/capture/route.js
app/api/leads/route.js
app/api/live-intelligence/archive/route.js
app/api/live-intelligence/deals-intel/route.js
app/api/live-intelligence/explain/route.js
app/api/live-intelligence/feed/route.js
app/api/live-intelligence/health/route.js
app/api/live-intelligence/indices-snapshot/route.js
app/api/live-intelligence/ingest/route.js
app/api/live-intelligence/market-intel/route.js
app/api/live-intelligence/mood/route.js
app/api/live-intelligence/night-summary/route.js
app/api/live-intelligence/options-intel/route.js
app/api/live-intelligence/process/route.js
app/api/live-intelligence/status/route.js
app/api/market-data/route.js
app/api/newsletter/route.js
app/api/newsletter/subscribe/route.js
app/api/og/sip-vs-panic/route.ts
app/api/onboarding/click/route.js
app/api/onboarding/event/route.js
app/api/onboarding/lead/route.js
app/api/onboarding/progress/route.js
app/api/payments/razorpay/create-order/route.js
app/api/payments/razorpay/verify/route.js
app/api/pdf/generate/route.js
app/api/pdf/service/route.js
app/api/post/[id]/route.js
app/api/posts/route.js
app/api/property-vs-sip/email-summary/route.js
app/api/proxy-approve/[id]/route.js
app/api/proxy-posts/route.js
app/api/proxy-queue/route.js
app/api/proxy-reject/[id]/route.js
app/api/proxy-submit/route.js
app/api/queue/route.js
app/api/razorpay/create-order/route.js
app/api/razorpay/verify/route.js
app/api/reject/[id]/route.js
app/api/rss-proxy/route.js
app/api/submit-post/route.js
app/api/submit-story/route.js
app/api/submit/guest/route.js
app/api/submit/impact/route.js
app/api/tools/aio/email/route.js
app/api/track-affiliate-click/[id]/route.js
app/api/track-view/[id]/route.js
app/api/track/route.js
app/api/universe/generate-content/route.ts
app/api/version/route.ts
app/api/whatsapp/opt-in/route.js
app/api/whatsapp/webhook/route.js
