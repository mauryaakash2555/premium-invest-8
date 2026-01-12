# Feature Modules

Each feature is self-contained and can be added/removed independently.

## Feature 1: Lead Capture
**Status:** Active (default)
**Files:**
- `components/user/AIChatFloat.jsx` (lead capture flow + calls `/api/leads`)
- `app/api/leads/route.js`
- `lib/db/leads.js`

**Dependencies:**
- Supabase (`public.leads` table)

**To disable:** Set `FEATURE_LEAD_CAPTURE=false` (or `NEXT_PUBLIC_FEATURE_LEAD_CAPTURE=false`)
**To remove:** Delete the 3 files above + remove lead capture flow from `AIChatFloat.jsx`

---

## Feature 2: Context Memory
**Status:** Active (default)
**Files:**
- `lib/ai/contextManager.js`
- `lib/db/conversations.js`
- `app/api/chat/route.js` (uses context manager)

**Dependencies:**
- Supabase (`public.conversations` table)

**To disable:** Set `FEATURE_CONTEXT_MEMORY=false`
**To remove:** Remove `buildConversationHistorySafe` usage from `app/api/chat/route.js`

---

## Feature 3: Time Greetings
**Status:** Active (default)
**Files:**
- `components/user/AIChatFloat.jsx` (`dayGreeting()` usage)

**Dependencies:** None

**To disable:** Set `NEXT_PUBLIC_FEATURE_TIME_GREETINGS=false`
**To remove:** Remove `dayGreeting()` logic and use a static greeting

---

## Feature 4: Revenue Tracking
**Status:** Active (default)
**Files:**
- `components/user/AIChatFloat.jsx` (admin UI “Add Revenue”)
- `app/api/admin/revenue/route.js`
- `lib/db/events.js` (stores revenue events)

**Dependencies:**
- Supabase (`public.events` table)

**To disable:** Set `FEATURE_REVENUE_TRACKING=false`
**To remove:** Delete the route + remove the admin UI section

---

## Feature 5: Lead Scoring
**Status:** Active (default)
**Files:**
- `app/api/chat/route.js` (computes score + persists score)
- `lib/db/leads.js` (updates `lead_score` column safely)
- `lib/db/events.js` (stores `lead_score` events)

**Dependencies:**
- Supabase (`public.leads.lead_score` column, `public.events` table)

**To disable:** Set `FEATURE_LEAD_SCORING=false`
**To remove:** Remove `computeLeadScore` + score persistence in `app/api/chat/route.js`

---

## Feature 6: Analytics (Admin)
**Status:** Active (default)
**Files:**
- `app/api/admin/analytics/route.js`
- `components/user/AIChatFloat.jsx` (admin “Analytics” tab UI)
- `lib/db/events.js` / `lib/db/conversations.js` / `lib/db/leads.js`

**Dependencies:**
- Supabase (`public.events`, `public.conversations`, `public.leads`)

**To disable:** Set `FEATURE_ANALYTICS=false`
**To remove:** Delete the API route + remove analytics UI in `AIChatFloat.jsx`

---

## Feature 7: Claude Admin (Strategic Advisor)
**Status:** Active (default)
**Files:**
- `app/api/admin/strategy/route.js`
- `lib/ai/claude.js`
- `components/user/AIChatFloat.jsx` (admin strategic advice panel)

**Dependencies:**
- `ANTHROPIC_API_KEY`
- Supabase (`public.events`, `public.leads`, `public.conversations`) for context building

**To disable:** Set `FEATURE_CLAUDE_ADMIN=false` (and/or `FEATURE_USE_CLAUDE=false`)
**To remove:** Delete `app/api/admin/strategy/route.js` and remove UI calls

---

## Feature 8: AI Provider - Gemini
**Status:** Optional (flag-controlled)
**Files:**
- `lib/ai/gemini.js`
- `lib/ai/provider.js` (orchestrator)
- `app/api/chat/route.js` (uses orchestrator)

**Dependencies:**
- `GEMINI_API_KEY`

**To disable:** Set `FEATURE_USE_GEMINI=false`
**To remove:** Delete `lib/ai/gemini.js` and remove it from `lib/ai/provider.js`

---

## Feature 9: AI Provider - Groq
**Status:** Active (default)
**Files:**
- `lib/ai/groq.js`
- `lib/ai/provider.js` (orchestrator)
- `app/api/chat/route.js` (uses orchestrator)

**Dependencies:**
- `GROQ_API_KEY`

**To disable:** Set `FEATURE_USE_GROQ=false`
**To remove:** Delete `lib/ai/groq.js` and remove it from `lib/ai/provider.js`





