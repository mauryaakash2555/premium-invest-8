# Environment Variables (Audit Snapshot)

This file lists environment variables used across the repo.

Important:
- **Do NOT commit real secrets** (API keys, passwords).
- Example values below are **fake**.

---

## Variables from the Next.js app (`.env.local` in repo root)

### `NEXT_PUBLIC_AI_CHAT_ENABLED`
**Purpose:** Turns the AI chat UI on/off (client-side).
**Get from:** You choose it.
**Used in:** `components/AIChatFloat.jsx`
**If missing:** Chat defaults to enabled (current code treats missing as enabled).
**Example:** `true`

---

### `NEXT_PUBLIC_SUPABASE_URL`
**Purpose:** Supabase project URL.
**Get from:** Supabase project settings → API.
**Used in:** `lib/supabaseAdmin.js` (server), also validated in `lib/env.js`.
**If missing:** Supabase client can’t connect → lead capture/admin dashboard won’t work.
**Example:** `https://your-project.supabase.co`

---

### `NEXT_PUBLIC_SUPABASE_ANON_KEY`
**Purpose:** Public “anon” key (client-safe key).
**Get from:** Supabase project settings → API.
**Used in:** Validated in `lib/env.js` (currently not used directly by the server client).
**If missing:** Some code paths may treat Supabase as “not configured”.
**Example:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.FAKE.PAYLOAD`

---

### `SUPABASE_SERVICE_ROLE_KEY`
**Purpose:** Server-side Supabase key with full permissions.
**Get from:** Supabase project settings → API → service_role key.
**Used in:** `lib/supabaseAdmin.js` (server).
**If missing:** All Supabase writes/reads from Next API routes fail (leads, events, admin dashboard).
**Example:** `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.SERVICE.ROLE.FAKE`

---

### `ADMIN_PASSWORD`
**Purpose:** Admin login password AND signing secret for the admin cookie.
**Get from:** You choose it (store in Vercel env).
**Used in:**
- `app/api/admin/login/route.js` (checks password)
- `lib/adminSession.js` (HMAC cookie signing)
- `app/api/events/route.js` (salt for IP hash)
**If missing:** Admin login won’t work; admin cookie verification returns “not admin”.
**Example:** `your-strong-admin-pass`

---

### `GROQ_API_KEY`
**Purpose:** Key for Groq LLM API (user chat).
**Get from:** Groq console.
**Used in:** `app/api/chat/route.js`
**If missing:** User chat returns setup/fallback responses.
**Example:** `gsk_FAKE_GROQ_KEY_123`

---

### `ANTHROPIC_API_KEY`
**Purpose:** Key for Anthropic Claude API (admin chat + strategy).
**Get from:** Anthropic console.
**Used in:** `app/api/chat/route.js`, `app/api/admin/strategy/route.js`, `app/api/health/route.js`
**If missing:** Admin mode AI won’t work; health will show anthropic missing.
**Example:** `sk-ant-api03-FAKE_ANTHROPIC_KEY`

---

### `GEMINI_API_KEY`
**Purpose:** Key for Google Gemini API (LLM).
**Get from:** Google AI Studio / `ai.google.dev`.
**Used in:** `app/api/chat/route.js` (Gemini code exists), `app/api/health/route.js` (deep check).
**If missing:** Health will show gemini missing; chat still works (uses Groq/Claude).
**Example:** `AIzaSyFAKE_GEMINI_KEY`

---

### `NEXT_PUBLIC_BACKEND_URL`
**Purpose:** External backend base URL (legacy backend used by blog/contact).
**Get from:** Your deployed backend (example: Render).
**Used in:** `app/blog/page.js`, `app/contact/page.jsx`
**If missing:** Code falls back to a default backend URL in those pages.
**Example:** `https://bmwealth-backend.onrender.com`

---

### `REACT_APP_BACKEND_URL`
**Purpose:** Legacy variable name for backend URL (kept for compatibility).
**Get from:** You choose it.
**Used in:** Present in `.env.local`, but Next pages mainly use `NEXT_PUBLIC_BACKEND_URL`.
**If missing:** Usually no impact for the Next app.
**Example:** `https://bmwealth-backend.onrender.com`

---

### `NEXT_PUBLIC_RECAPTCHA_SITE_KEY`
**Purpose:** Google reCAPTCHA v3 site key for contact form (client-side).
**Get from:** Google reCAPTCHA admin console.
**Used in:** `app/contact/page.jsx`
**If missing:** Contact form still tries to work (it skips reCAPTCHA on non-production domain and has a fallback key in code).
**Example:** `6LfFAKE_SITE_KEY`

---

### `VERCEL_OIDC_TOKEN`
**Purpose:** Auto-created by Vercel CLI (development auth token).
**Get from:** Vercel CLI.
**Used in:** Not referenced by app source directly.
**If missing:** Usually no app impact.
**Example:** `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.FAKE...`

---

## Variables used by the legacy FastAPI backend (`backend/server.py`)

### `MONGO_URL`
**Purpose:** MongoDB connection string (Motor).
**Get from:** MongoDB Atlas.
**Used in:** `backend/server.py`
**If missing:** Backend won’t start.
**Example:** `mongodb+srv://user:pass@cluster.mongodb.net`

---

### `DB_NAME`
**Purpose:** MongoDB database name.
**Get from:** You choose it.
**Used in:** `backend/server.py`
**If missing:** Backend won’t start.
**Example:** `bmwealth`

---

### `RECAPTCHA_SECRET_KEY`
**Purpose:** Google reCAPTCHA secret for server-side verification.
**Get from:** Google reCAPTCHA admin console.
**Used in:** `backend/server.py` and `api/contact.js`
**If missing:** Contact submission fails (backend throws config error) or reCAPTCHA verification may be skipped depending on path.
**Example:** `6LfFAKE_SECRET_KEY`

---

### `RECAPTCHA_TIMEOUT`
**Purpose:** Timeout (seconds) for reCAPTCHA verification call.
**Get from:** You choose it.
**Used in:** `backend/server.py`
**If missing:** Defaults to `3`.
**Example:** `3`

---

### `CORS_ORIGINS`
**Purpose:** Allowed origins for backend CORS.
**Get from:** You choose it.
**Used in:** `backend/server.py`
**If missing:** Defaults to `*` (open).
**Example:** `https://bmwealth.co.in,https://www.bmwealth.co.in`

---

### `ENABLE_AUTO_SEED`
**Purpose:** Auto-seed a default blog post into MongoDB.
**Get from:** You choose it.
**Used in:** `backend/server.py`
**If missing:** Defaults to `true`.
**Example:** `true`

---

## Variables used by the legacy Vercel function (`api/contact.js`)

### `MONGODB_URI`
**Purpose:** MongoDB URI used by the serverless function.
**Get from:** MongoDB Atlas.
**Used in:** `api/contact.js`
**If missing:** Contact still returns success, but won’t save to MongoDB.
**Example:** `mongodb+srv://user:pass@cluster.mongodb.net/bmwealth`

---

### `EMAIL_USER`
**Purpose:** Gmail username for email notifications.
**Get from:** Gmail (use an App Password).
**Used in:** `api/contact.js`
**If missing:** No email notification is sent.
**Example:** `you@example.com`

---

### `EMAIL_PASS`
**Purpose:** Gmail app password.
**Get from:** Google Account → App Passwords.
**Used in:** `api/contact.js`
**If missing:** No email notification is sent.
**Example:** `abcd efgh ijkl mnop`
