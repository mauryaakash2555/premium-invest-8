# API (Next.js Route Handlers in `/app/api`)

This file documents every API route under **`/app/api`** (the Next.js app).

---

## POST `/api/chat`

**Purpose:** Process a user/admin message and return an AI reply.

**Parameters (JSON):**
- `message`: `string` (required)
- `conversationHistory`: `array` (optional, max 20)
- `conversationId`: `string` (optional)
- `leadId`: `uuid string` (optional)
- `mode`: `"user" | "admin"` (optional)

**Response (JSON):**
- Success:
  - `{ ok: true, reply: string, conversationId: string }`
  - Sometimes also: `{ cta: { label, href }, intent: {...} }`
- Soft-failure fallback (still ok=true):
  - `{ ok: true, reply: string, conversationId: string, warn: string }`

**Logic (simple):**
1. Validate request with Zod.
2. Rate limit:
   - user: 10 messages/minute
   - admin: 50 messages/hour
3. If not admin mode:
   - Save the user message to Supabase `conversations` (best effort).
   - Compute/update lead score (best effort) and store score in `events` + optional `leads.lead_score`.
   - If intent is strong (amount/how-to-invest/best fund): return a rule-based consultation reply + CTA.
   - Else: call **Groq** and return the model response (trimmed to ~4 sentences).
4. If admin mode:
   - Call **Claude (Anthropic)** with a strategic “business advisor” prompt + Supabase context.
5. Save bot reply to Supabase `conversations` (best effort, and never for admin mode).
6. Log AI usage/errors to Supabase `events` (best effort).

**Error handling:**
- Rate limit → `429` with `Retry-After`.
- Missing keys / setup not ready → returns `ok: true` with safe fallback message (and `warn`).
- Provider failures → logs `chat_error` event and returns safe fallback message.

**Used by:** `components/AIChatFloat.jsx`

**To modify:**
- Change model/provider selection: `app/api/chat/route.js`
- Change admin system prompt: `buildAdminStrategicPrompt()`
- Change user safety rules: `buildSeBiSafeSystemPrompt()`

---

## POST `/api/leads`

**Purpose:** Save a lead (name/email/phone) into Supabase.

**Parameters (JSON):**
- `name`: `string` (optional)
- `email`: `string` (required)
- `phone`: `string` (optional)

**Response (JSON):**
- Success: `{ ok: true, lead: { id, name, email, phone, created_at } }`
- Missing email: `400 { ok: false, error: "email_required" }`
- Setup required (Supabase missing / schema missing): `503 { ok: false, error: "setup_required", ... }`

**Logic:**
1. Normalize email (lowercase/trim).
2. Use Supabase service client.
3. Upsert into `leads` by unique `email`.

**Error handling:**
- If `public.leads` table missing → returns `setup_required` with hint to run `supabase/schema.sql`.

**Used by:** `components/AIChatFloat.jsx`

---

## POST `/api/events`

**Purpose:** Log analytics/events into Supabase (privacy-safe).

**Parameters (JSON):**
- `leadId`: `uuid string` (optional)
- `event_type`: `string` (required)
- `data`: `any` (optional)

**Response (JSON):**
- Success: `{ ok: true }`
- Setup required: `503 { ok: false, error: "setup_required" }`

**Logic:**
1. Validate with Zod.
2. Hash the visitor IP on the server (`ipHash`) and store hash (never raw IP).
3. Insert into `events`.

**Used by:**
- `components/AIChatFloat.jsx`
- `components/ChatErrorBoundary.jsx`

---

## GET `/api/health`

**Purpose:** Check if required services are configured and reachable.

**Parameters (query):**
- `deep=1` (optional) — actually pings Gemini + Anthropic with a tiny request.

**Response (JSON):**
- `{ ok: boolean, asOf, ms, checks: { supabase, ai: { gemini, anthropic }, admin } }`

**Logic:**
1. Check env vars safely (doesn’t throw).
2. Query Supabase lightly (select from `leads`).
3. If `deep=1`, do short timeout “ping” calls to Gemini and Anthropic.

**Used by:** humans/admins (manual debugging), and mentioned in chat setup hints.

---

## GET `/api/market-data`

**Purpose:** Provide a “premium market snapshot” for the ticker.

**Parameters:** None

**Response (JSON):**
- Success: `{ ok: true, asOf: string, items: Array<{ id, name, kind, value, changePct, direction, source, currency }> }`
- Failure: `502 { ok: false }`

**Logic (simple):**
1. Fetch USD/INR first.
2. Fetch each instrument using a list of Yahoo Finance symbols (tries multiple candidates).
3. Convert metals to INR and normalize units (Gold per 10g, Silver per 1kg).
4. Return numbers + direction (up/down/flat).

**Used by:** `components/PremiumMarketTicker.jsx`

---

## GET `/api/blog`

**Purpose:** Return blog posts from local JSON.

**Parameters:** None

**Response (JSON):**
- `{ posts: any[], debug: { timestamp, slugs, totalPosts } }`

**Logic:**
1. Reads `data/blog.json` from disk.
2. Returns it with no-cache headers.

**Used by:** Not referenced by current `app/blog/page.js` (that uses `data/staticBlogData.js`), but available for debugging/integration.

---

## GET `/api/bmwealth`

**Purpose:** Dummy endpoint for connectivity checks.

**Parameters:** None

**Response (JSON):**
- Contents of `data/bmwealth.json` plus `receivedAt` timestamp.

**Used by:** Not referenced by current pages; useful for “is API alive?” checks.

---

# Admin API (requires admin cookie)

All admin routes require a valid signed cookie `bm_admin` set by `POST /api/admin/login`.

---

## POST `/api/admin/login`

**Purpose:** Create an admin session cookie.

**Parameters (JSON):**
- `password`: `string` (required)

**Response (JSON):**
- Success: `{ ok: true }` (sets cookie)
- Wrong password: `401 { ok: false }`
- Setup required (no ADMIN_PASSWORD env): `503 { ok: false, error: "setup_required" }`

**Used by:** `components/AIChatFloat.jsx`

---

## GET `/api/admin/summary`

**Purpose:** Admin dashboard: leads, conversations, lead scores, revenue totals, AI provider counts.

**Parameters (query):**
- `leadId=<uuid>` (optional) — if present, returns a single lead + full conversation history.

**Response (JSON):**
- With `leadId`: `{ ok: true, lead, conversations }`
- Without `leadId`: `{ ok: true, today: {...}, all: {...} }`

**Logic:**
1. Verify admin cookie.
2. Query Supabase tables `leads`, `conversations`, `events`.
3. Build lead score map from latest `lead_score` events.
4. Sum revenue from `events` (`revenue` and `revenue_manual`).
5. Count AI provider usage from `chat_ai` events.

**Used by:** `components/AIChatFloat.jsx` (admin dashboard tab)

---

## GET `/api/admin/analytics`

**Purpose:** Admin analytics KPIs (visitors, conversations started, leads captured, conversion rate, trends).

**Parameters:** None

**Response (JSON):**
- `{ ok: true, today: {...}, week: {...}, month: {...}, asOf }`

**Logic:**
1. Verify admin cookie.
2. Pull relevant events for month + previous month.
3. Compute unique visitors from `ipHash`.
4. Pull conversations for question mining and compute “top questions”.

**Used by:** `components/AIChatFloat.jsx` (analytics tab)

---

## GET `/api/admin/strategy`

**Purpose:** Return “today’s strategic advice” for the business (Claude-generated).

**Parameters (query):**
- `force=1` (optional) — regenerate even if cached.

**Response (JSON):**
- `{ ok: true, text: string, cached: boolean, asOf: string }`

**Logic:**
1. Verify admin cookie.
2. If cached advice exists today (stored as `events.admin_strategy`) and not forced → return it.
3. Build context (visitors, leads, revenue, top questions).
4. Call Claude (Anthropic) and store result back into `events`.

**Used by:** `components/AIChatFloat.jsx` (dashboard tab)

---

## POST `/api/admin/revenue`

**Purpose:** Manually record revenue.

**Parameters (JSON):**
- `amount`: `number|string` (required)
- `currency`: `string` (optional, default `"INR"`)
- `source`: `"Affiliate" | "Lead Sale" | "Product" | "Other"` (optional)
- `note`: `string` (optional)
- `leadId`: `uuid string` (optional)

**Response (JSON):**
- `{ ok: true }` on success

**Logic:**
1. Verify admin cookie.
2. Insert event `revenue` into Supabase `events`.

**Used by:** `components/AIChatFloat.jsx`

---

## GET `/api/admin/export`

**Purpose:** Export leads as CSV.

**Parameters (query):**
- `filter=all|hot|today|range` (optional)
- `start=<ISO>` and `end=<ISO>` (used when `filter=range`)

**Response:**
- CSV file download (`Content-Type: text/csv`)
- Header: `X-Export-Count`

**Logic:**
1. Verify admin cookie.
2. Fetch leads + conversations counts + latest lead scores.
3. Filter and generate CSV.

**Used by:** `components/AIChatFloat.jsx`
