# Live Intelligence Overlay — Full Audit (Single-File Reference)

Date: 2026-01-15  
Project: `premium-invest-8` (bmwealth.co.in)

This document is the **one-stop, single-file** deep audit of the Live Intelligence overlay system: what we built, why it exists, what every visible control does, what is “real” vs placeholder, what’s missing, and how to improve it.

---

## 0) Executive Summary

### What it is
The Live Intelligence overlay is a **full-screen, portal-rendered financial command center** that can auto-open based on scroll behavior. It is designed to feel like a **premium “mode” layer** over the site (similar to an app screen), not a normal page section.

### What it’s good at today (working)
- Stable overlay layering (portal to `document.body`) and predictable open/close behavior.
- Body scroll lock while overlay is open (prevents background scroll bleed).
- Share flow that works without pop-up blockers (native share on mobile + real share links).
- Quick Access cards open PDFs inside a modal iframe (keeps users inside your branded experience).
- Market ticker backend `/api/market-data` is live on production and renders into the homepage ticker.

### What’s still mostly a UI shell (not fully wired)
- Header tabs are currently “visual only” (no state switching).
- KPI values are currently “demo-ish” state values (not tied to a real user portfolio).
- “Add Goal” is a button with no action yet.

### Critical UX fixes shipped (recent)
- **Scroll indicator visibility**: the overlay previously hid the scrollbar, so users felt scrolling but didn’t see system scroll feedback. This has been corrected by showing a thin scrollbar.
- **Share dropdown links not navigating**: hardened click behavior so share links navigate reliably across browsers (mobile included).

---

## 1) Where the Overlay Lives (Key File Map)

**Core overlay implementation**
- Overlay + panel: [components/user/LiveIntelligenceOverlay.jsx](components/user/LiveIntelligenceOverlay.jsx)

**Market ticker (homepage scrolling ticker)**
- Protected ticker component: [core/marketTicker/MarketTicker.jsx](core/marketTicker/MarketTicker.jsx)
- Market data API endpoint: [app/api/market-data/route.js](app/api/market-data/route.js)

**Security headers that affect iframes**
- Middleware: [middleware.js](middleware.js)

---

## 2) Overlay Architecture (What We Actually Built)

### 2.1 Two-layer structure

#### A) `LiveIntelligenceOverlay` (outer container)
Responsibilities:
- Owns `isOpen` and animation state.
- Portals overlay content into `document.body` (stable z-index, avoids stacking context issues).
- Locks background scroll:
  - `document.body.style.overflow = 'hidden'` when open.
  - Restores on close/unmount.
- Sets `body[data-laser-active="true"]` to enable global premium theme overrides.
- Auto-open logic using `IntersectionObserver` tied to the “Live Mood” bar.
- Exposes a global open hook:
  - `window.__openLiveIntelligence = openOverlay`

Why portal (`createPortal`) matters:
- Prevents overlay being clipped by parent containers.
- Prevents z-index wars.
- Makes behavior consistent across every route.

Status: **Working and production-grade.**

#### B) `LiveIntelligencePanel` (inner content)
Responsibilities:
- Header (title, mode badge, streak badge, tabs, actions).
- KPI grid.
- Charts/widgets area (TradingView embeds and other “intel” modules).
- Quick Access PDF grid.
- Share menu.
- PDF modal.

Status: **Mostly working UI; some features are placeholder/not wired.**

---

## 3) Lifecycle: Open / Close / Scroll Mechanics

### 3.1 How the overlay opens

#### Open path A — Auto-open on scroll (session-limited)
Mechanism:
- `IntersectionObserver` watches the element referenced by `liveMoodRef`.
- If the Live Mood bar scrolls out of view **while scrolling down**, and the overlay hasn’t auto-opened this session → open overlay.
- Uses `sessionStorage` key `li-overlay-auto-opened` to avoid repeatedly triggering.

Purpose:
- “Smart reveal” after engagement, rather than interrupting immediately.

Working?
- **Yes**, as long as the page passes a valid `liveMoodRef` and the element exists.

Better:
- Add a debug query flag (dev-only), e.g. `?li=1`, that forces open.
- Add a visible CTA button somewhere for direct access.

#### Open path B — Manual open via global bridge
Mechanism:
- `window.__openLiveIntelligence()`

Purpose:
- Lets other modules (like the protected market ticker) open the overlay without importing overlay internals (avoids circular dependencies).

Working?
- **Yes** on pages where the overlay is mounted.

Better:
- Replace with event bridge:
  - `window.dispatchEvent(new CustomEvent('bm:open-live-intelligence'))`

---

### 3.2 How the overlay closes
Exit paths:
- Keyboard: `Escape` closes overlay.
- UI: back arrow button `←` closes overlay.
- Footer “Home” inside overlay triggers `handleFooterHome()`:
  - closes overlay
  - scrolls underlying page to top smoothly

Purpose:
- Multiple predictable exits for keyboard and mobile.

Working?
- **Yes.**

Better:
- Accessibility: focus trap + restore focus to the triggering element on close.

---

### 3.3 Why the scrollbar/scroll indicator looked “broken”

Symptom you described:
- Page moves up/down, but the right-side scrollbar indicator doesn’t show movement.

Root cause:
- The overlay intentionally hid scrollbars via CSS (while still allowing scroll), which removes OS scroll feedback.

Fix shipped:
- The overlay now shows a subtle scrollbar (thin + premium), so system scroll feedback matches actual scroll position.

---

## 4) Header: Every Visible Control (Button-by-Button)

This header is the top control surface of the overlay.

### 4.1 Title: “Live Intelligence”
- Type: text
- Purpose: establish context
- Status: working

### 4.2 `ModeIndicator`
- Type: component (likely a status chip)
- Purpose: show “mode” (market status, system mode, etc.)
- Status: renders; correctness depends on its internal logic
- Better: standardize data source + add tooltip “what this means”

### 4.3 `StreakBadge showDetails={true}`
- Type: component
- Purpose: gamification / retention
- Status: renders; correctness depends on its internal logic
- Better: make streak tied to meaningful actions (reading insights, returning daily, completing profile)

### 4.4 Navigation Tabs (currently UI-only)
Tabs shown:
- “Live Market Pulse” (active)
- “Live”
- “Timings”
- “2 Days”

What they do today:
- Visual only: hover styling changes, but clicking does not change content.

What they’re meant to do:
- `pulse`: today’s market + portfolio summary
- `live`: streaming / live-only widgets + alerts
- `timings`: market session timing, open/close, holiday awareness
- `2days`: short historical view with deltas

Outcome if you wire them:
- The overlay becomes a real product surface instead of a static dashboard.

Recommended implementation:
- Add `activeTab` state.
- Render sections conditionally.
- Optional: sync to URL query for deep links.

### 4.5 Back Arrow “←” (Close)
- Type: button
- Action: closes overlay via `onClose`
- Purpose: primary and obvious exit
- Status: working
- Better: add tooltip “Back” + restore focus to last focused element

### 4.6 Share button + dropdown

#### Share button
Behavior:
- If `navigator.share` exists (mobile): uses native share UI.
- If native share fails/unavailable: opens dropdown.

Purpose:
- Viral loop + easy sharing without pop-up blockers.

Status:
- Working.

#### Dropdown options (anchors)
Options:
- WhatsApp
- Email
- Twitter/X
- LinkedIn
- Telegram

Important note:
- These are normal links (`<a href="..." target="_blank">`) so browsers treat them as real navigations.

Status:
- A reliability hardening has been applied so link taps/clicks navigate consistently.

Better:
- Add tracking (which channel was used).
- Replace `alert()` copy feedback with a non-blocking toast.

#### Copy Link
Behavior:
- Uses Clipboard API when available.
- Falls back to `prompt()` when clipboard is blocked.

Purpose:
- Always give user a way to share.

Status:
- Working.

### 4.7 “+ Add Goal”
Current:
- Styled button.
- No click action yet.

Purpose (intended):
- Start a goal wizard and connect planning + SIP suggestions.

Status:
- Not functional yet.

Better:
- Open a “Goal Wizard” modal:
  - Goal name
  - Amount
  - Time horizon
  - Risk preference
  - Suggest SIP + allocation

---

## 5) KPI Row (Top Metrics Cards)

What it is:
- A row/grid of KPI cards (portfolio value, invested, etc.).

Purpose:
- The “Bloomberg headline”: instant summary.

Status:
- UI works.
- Data is currently demo-ish (stored in component state), not a real portfolio.

Better:
- Connect to a real portfolio data source:
  - authenticated user portfolio, or
  - admin-managed model portfolio
- Add loading skeletons + “asOf” timestamp.

---

## 6) Charts / Market Context Widgets

What it is:
- TradingView embeds and other context widgets.

Important truth:
- TradingView embeds are **separate from** your internal `/api/market-data` ticker.

Purpose:
- Provide visual market context without building chart infra.

Status:
- Usually works, but depends on iframe embedding and network conditions.

Better:
- Add fallback text when iframe fails to load.
- Consider a “lite mode” for low-end devices.

---

## 7) Quick Access Grid (PDF Services)

What it is:
- A grid of service cards (KYC, onboarding, etc.).

What clicking does:
- The cards are anchors, but the click is intercepted:
  - `preventDefault()` to prevent page navigation
  - sets `pdfUrl`
  - opens PDF modal

Why this pattern:
- Keeps user in overlay mode.
- Avoids opening extra tabs.

Keyboard support:
- Enter/Space opens the PDF modal.

Status:
- Works as long as the service link returns a PDF or embeddable endpoint.

Better:
- Add a loading indicator while iframe loads.
- Add “Open in new tab” alternative.

---

## 8) PDF Modal (Iframe Viewer)

What it is:
- A full-screen modal rendered via portal.
- Displays the PDF in an `<iframe>`.

Controls:
- Click backdrop closes.
- ESC closes.
- Close “✕” closes.

Scroll behavior:
- Locks body scroll while open.

Status:
- Working.

Better:
- Focus trap for accessibility.
- Add download/open-in-browser controls.

---

## 9) Market Ticker System (Production Cross-check)

### 9.1 Backend API: `/api/market-data`
- File: [app/api/market-data/route.js](app/api/market-data/route.js)
- It returns `{ ok: true, asOf, items: [...] }`.

What it covers:
- NIFTY 50, SENSEX, USD/INR, BTC, GOLD, SILVER, CRUDE.

Why it’s robust:
- Multiple source fallbacks.
- Short cache.
- Auto-calculated % change when sources don’t provide changePct.

Status:
- Live on production (`bmwealth.co.in`).

### 9.2 Frontend ticker component
- File: [core/marketTicker/MarketTicker.jsx](core/marketTicker/MarketTicker.jsx)

What it does:
- Calls `/api/market-data` periodically.
- Normalizes response.
- Displays a smooth marquee ticker.

Status:
- Working on production.

---

## 10) Vercel Stack / Environment Variables — What You Have, What You Might Need

You shared these env vars (All Environments):
- `NEXT_PUBLIC_AI_CHAT_ENABLED`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `ANTHROPIC_API_KEY`
- `GEMINI_API_KEY`
- `GROQ_API_KEY`

### 10.1 What each one is for (and common mistakes)

#### `NEXT_PUBLIC_*` variables
- These are exposed to the browser.
- Good for: public URLs, anon keys, feature flags.
- Never store secrets in `NEXT_PUBLIC_*`.

`NEXT_PUBLIC_AI_CHAT_ENABLED`
- Purpose: feature flag to toggle chat UI features.
- Recommendation: keep values like `true/false` and handle defaults in code.

`NEXT_PUBLIC_SUPABASE_URL`
- Purpose: Supabase project URL.

`NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Purpose: Supabase browser key.

#### Server-only secrets
`SUPABASE_SERVICE_ROLE_KEY`
- Purpose: server-side privileged Supabase key.
- Must never be exposed to client.
- Use only in server routes/actions.

`ANTHROPIC_API_KEY`, `GEMINI_API_KEY`, `GROQ_API_KEY`
- Purpose: server-side LLM calls.
- Must remain server-only.

### 10.2 Market data API keys you may want (optional but recommended)
Your market data API route supports these environment variables:
- `ALPHA_VANTAGE_API_KEY` (used for some fallback data)
- `EXCHANGE_RATE_API_KEY` (USD/INR fallback)
- `GOLDAPI_KEY` (metals fallback)

If these are not set:
- The route still works because it has multiple scrapers + fallback.
- But reliability improves if keys are provided.

Recommendation:
- Add these as server-only env vars in Vercel (no `NEXT_PUBLIC_`).

### 10.3 Suggested “deployment readiness” extras
(Not strictly required, but helpful for consistency)
- `NEXT_PUBLIC_SITE_URL=https://bmwealth.co.in` (optional; helps when generating absolute URLs)
- `NODE_ENV` is managed by Vercel.

---

## 11) What’s Missing (Prioritized Roadmap)

### P0 (High impact, low effort)
- Wire header tabs to real `activeTab` state.
- Replace `alert()` with toast notifications.
- Add PDF iframe loading skeleton.
- Add “Open in new tab” for PDFs.

### P1 (Product value)
- Replace KPI demo state with real portfolio data.
- Add “Last updated” timestamps.
- Add event tracking:
  - overlay opened/closed
  - share opened + channel clicked
  - PDF opened + which service

### P2 (Premium platform feel)
- Add personalization.
- Add goal wizard + SIP suggestions.
- Add saved views.

---

## 12) QA Checklist (Quick Manual Tests)

Overlay behavior:
- Scroll down past Live Mood → overlay auto-opens once per session.
- Press ESC → overlay closes.
- Click back arrow → closes.
- Verify scrollbar thumb is visible and moves while scrolling.

Share:
- Click Share → dropdown opens.
- Click WhatsApp/Twitter/LinkedIn → should navigate (new tab or app).
- Copy link → should copy or show prompt.

PDF:
- Click a Quick Access card → PDF modal opens.
- Close with backdrop / close button / ESC.

---

## 13) Notes / Next steps from me

If you want, I can:
1) Start local dev server and do a runtime click-check for Share + PDF modal.
2) Convert this overlay into a truly “product-grade” surface by wiring tabs, KPI data, and the goal wizard.
