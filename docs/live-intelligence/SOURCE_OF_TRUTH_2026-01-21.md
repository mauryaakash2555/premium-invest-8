# LIVE INTELLIGENCE — SOURCE OF TRUTH (Jan 21, 2026)

This document is the **single source of truth** for Live Intelligence behavior/spec going forward.

Notes:
- Do **not** delete older specs/docs; treat them as historical reference only.
- When there is any conflict, **this file wins**.

---

## SECTION 4: TIME-BASED MODES

### MODE DEFINITIONS:

| Time (IST) | Mode Key | Display Name | Rotation | Tone |
|---|---|---|---:|---|
| 06:00–09:30 | morning_brief | Morning Briefing | 10s | Alert, Preparatory |
| 09:30–15:30 | live_market | Live Market Pulse | 6s | Dynamic, Urgent |
| 15:30–17:00 | market_close | Market Close | 10s | Analytical |
| 17:00–21:00 | evening_intel | Evening Intelligence | 8s | Informative |
| 21:00–24:00 | night_summary | What You Missed | 8s | Comprehensive (strip shows only a single minimal line; click to open full summary) |
| 00:00–06:00 | global_watch | Global Watch | 12s | Minimal |

### MODE CONTENT:

**MORNING BRIEFING (6AM–9:30AM)**
- Pre-market preparation
- SGX Nifty indication
- Global cues (US close, Asia opening)
- Gap up/down predictions
- What to watch today
- Visual: Blue accent, ☀️ icon

**LIVE MARKET PULSE (9:30AM–3:30PM)**
- Real-time NIFTY/SENSEX moves
- FII activity live
- Volume spikes
- Sector rotation
- Breaking trades
- Visual: Green/Red dynamic, 📡 icon
- Breaking news interrupts for 30 seconds

**MARKET CLOSE (3:30PM–5PM)**
- Day summary
- Top gainers/losers
- FII/DII final data
- What worked/failed
- Visual: Gold accent, 📊 icon

**EVENING INTELLIGENCE (5PM–9PM)**
- News digest
- Expert opinions
- Next day outlook
- MF NAV updates
- Visual: Purple accent, 🌆 icon

**NIGHT SUMMARY (9PM–12AM)**
- Full day recap
- "What You Missed Today" dashboard
- Tomorrow's events
- Shareable summary
- Visual: Dark blue, 🌙 icon
- Layout: Dashboard (not ticker), swipeable story cards

**GLOBAL WATCH (12AM–6AM)**
- US market close
- Asia opening
- Overnight developments
- Minimal items (max 5)
- Visual: Gray muted, 🌏 icon

### MODE SWITCHING LOGIC:

```js
function getCurrentMode() {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const time = hour + (minute / 60);

  if (time >= 6 && time < 9.5) return 'morning_brief';
  if (time >= 9.5 && time < 15.5) return 'live_market';
  if (time >= 15.5 && time < 17) return 'market_close';
  if (time >= 17 && time < 21) return 'evening_intel';
  if (time >= 21 && time < 24) return 'night_summary';
  return 'global_watch';
}
```

- Check mode every 60 seconds
- Smooth transition when mode changes (fade out → update → fade in)

---

## SECTION 5: CATEGORIES

| Category | Icon | Key | Content | Priority |
|---|---|---|---|---|
| Share Market | 📈 | market | NIFTY/SENSEX, FII/DII flows, sectors | HIGH |
| Mutual Funds | 💰 | mutual_funds | SIP flows, NFO launches, performance | HIGH |
| Breaking News | 🔴 | breaking | RBI, Budget, market-moving | URGENT |
| Insurance | 🛡️ | insurance | LIC updates, new policies | MEDIUM |
| FD/RD/Bonds | 🏦 | fixed_income | Best FD rates, RBI bonds | MEDIUM |
| PMS/AIF | 💎 | pms | HNI updates, PMS performance | LOW |
| Real Estate | 🏠 | real_estate | Mumbai property, RERA, home loans | MEDIUM |
| Forex/Gold/Silver | 💵 | forex_gold | USD/INR, Gold prices | MEDIUM |

CATEGORY FILTER:
- Horizontal scrollable tabs in panel
- "All" selected by default
- Click to filter headlines by category

---

## SECTION 6: HEADLINE STRUCTURE

Each headline MUST contain:

```json
{
  "id": "unique_id",
  "category": "market",
  "icon": "📈",
  "headline": "NIFTY crosses 25,000 for first time",
  "why_it_matters": "Positive sentiment continues, buying opportunity visible",
  "urgency": "IMPORTANT",
  "timestamp": "2:35 PM today",
  "data_point": "NIFTY: 25,047 (+0.38%)",
  "cta_button": {
    "text": "Learn More",
    "link": "/contact",
    "icon": "→"
  },
  "source": "NSE",
  "valid_from": "2026-01-12T09:30:00Z",
  "valid_until": "2026-01-12T15:30:00Z"
}
```

CONTENT FORMAT (NON-NEGOTIABLE):
- `[CATEGORY] → [WHAT HAPPENED] → [WHY IT MATTERS]`

---

## SECTION 7: URGENCY LEVELS

| Urgency | Visual | Duration | Example |
|---|---|---:|---|
| 🔴 BREAKING | Red pulse glow | 30s interrupt | "RBI Emergency Rate Cut!" |
| 🟡 IMPORTANT | Gold highlight | 12s | "NIFTY crosses 25,000" |
| 🟢 REGULAR | Normal | 8s | "SBI FD rates revised" |
| 🔵 EDUCATIONAL | Blue tint | 10s | "Tax-saving deadline: March 31" |
| 💎 PREMIUM | Diamond icon | 15s | "Accumulation phase visible" |

SEBI COMPLIANCE:
- Never use: "STRONG BUY", "SELL NOW", "guaranteed returns"
- Use instead: "ACCUMULATION", "BULLISH TREND", "observational"
- Educational content only
- Public information only

---

## SECTION 8: ROTATION LOGIC

RULES:
- Minimum headlines in rotation: 5
- Maximum headlines: 15 (excess goes to archive)
- Default rotation: 8 seconds
- Breaking news: Interrupts for 30 seconds
- Category balance: At least 1 from each active category

PRIORITY FORMULA:
- `Score = (Urgency × 3) + (Recency × 2) + (Category_Weight × 1)`

URGENCY WEIGHTS:
- BREAKING: 100 points
- IMPORTANT: 50 points
- PREMIUM: 40 points
- REGULAR: 20 points
- EDUCATIONAL: 15 points

---

## SECTION 9: NIGHT SUMMARY LAYOUT (9PM–12AM)

Special dashboard format (not ticker).

Features:
- Swipeable story cards (like Instagram/WhatsApp)
- 5–7 slides summarizing the day
- Shareable to WhatsApp (must visit site for full summary = traffic)
- Generated once at 9PM, cached until midnight

---

## SECTION 10: DATA SOURCES

FREE SOURCES:

| Source | Data | Frequency | Method |
|---|---|---:|---|
| NSE India | NIFTY, stocks (15-min delay) | Every 15 min | API |
| BSE India | SENSEX, stock data | Every 15 min | API |
| Yahoo Finance | Global markets | Real-time-ish | Unofficial API |
| MoneyControl | News headlines | Every 30 min | RSS Feed |
| Economic Times | News | Every 30 min | RSS Feed |
| Mint | News | Every 30 min | RSS Feed |
| RBI Website | Policy rates, bonds | As announced | RSS/Scrape |

PAID (Later):

| Source | Cost | When to add |
|---|---:|---|
| Finnhub | Free tier good | After 100 users |
| Alpha Vantage Premium | $50/month | After 500 users |
| Polygon.io | $29/month | For real-time |

MANUAL:
- Admin panel for overrides
- Breaking news manual entry
- Premium insights

AI GENERATED:
- Daily 6AM morning summary
- Daily 9PM night summary

---

## SECTION 11: AI INTEGRATION

AI TOOLS:
- Use Grok first (cheap)
- For compliance/backups: Gemini and Claude (keep current setup; no change)

AI TASKS:

Morning Summary (6AM)
- Summarize overnight developments
- SGX Nifty indication
- What to watch today

Night Summary (9PM)
- Full day recap
- Key developments
- Tomorrow's preview

Breaking News Processing
- Simplify complex news
- Add “Why it matters”
- SEBI compliance check

AI COMPLIANCE RULES:
- No buy/sell language ever
- Do not claim SEBI registration; use wording aligned to “owner PMS distributor / PMS license” context as applicable

---

## SECTION 12: ANALYTICS TRACKING

EVENTS TO TRACK:
- headline_impression
- headline_pause
- panel_expand
- panel_collapse
- category_click
- cta_click
- share_click
- night_summary_view

PAUSE = INTEREST:
- Headline is interesting if visible_time ≥ 1.5× rotation_interval

DAILY INTELLIGENCE:
- Headlines with highest pause-time → promoted next day
- Categories with low engagement → de-prioritized
- Refine “Why it matters” based on what works

STORAGE:
- Use existing Supabase/MongoDB
- No PII required
- Anonymous engagement data

---

## WHATSAPP (DEFERRED)

WhatsApp opt-in + digests are intentionally **not** part of the active source-of-truth right now.
- Keep the codebase production-ready for later integration.
- Do not treat any WhatsApp behavior/docs as authoritative until WhatsApp API credentials + final flow are provided.

---

## SECTION 14: ADMIN PANEL (Phase 2)

MINIMAL FEATURES:
- Add/edit/delete headlines
- Set urgency level
- Set schedule (valid_from) + expiry time (valid_until)
- Pin to top (override rotation)
- Preview before publish

---

## SECTION 15: PERSONALIZATION (Future)

DUAL-LAYER SYSTEM:
- Layer 1: BASE MODE (same for everyone)
- Layer 2: SMART OVERLAY (personalized)

USER TOGGLE:
- 🌐 Market View (general)
- 👤 My View (personalized)
- 🎓 Learning Mode (educational)

---

## SECTION 16: LEARNING SYSTEM

DAILY MICRO-LESSONS:
- “TODAY'S QUICK LEARN” (30 seconds)

GAMIFICATION:
- Daily streak
- Headlines read
- Learning progress

Badges:
- Early Bird
- Market Scholar
- Streak Master

---

## SECTION 17: MOBILE EXPERIENCE

GESTURES:
- Swipe Up: See detailed story
- Swipe Down: Dismiss/Next headline
- Long Press: Save for later
- Double Tap: Share instantly

RESPONSIVE BREAKPOINTS:
- Mobile (<768px): Full screen panel, swipe gestures
- Tablet (768–1024px): 80% width panel
- Desktop (>1024px): Full experience

---

## SECTION 18: PERFORMANCE TARGETS

| Metric | Target |
|---|---|
| First paint | < 1 second |
| Headline update | < 100ms |
| Panel open animation | < 400ms |
| Mode check interval | 60 seconds |
| Data refresh | Every 5 minutes |

CACHING:
- Headlines: 5-minute cache
- Market data: 15-minute cache
- Night summary: Until midnight
