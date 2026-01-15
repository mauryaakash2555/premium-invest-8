# Live Intelligence Gap Analysis Report
**Date:** January 15, 2026  
**Comparison:** Master Plan vs Actual Implementation

---

## SECTION 1: CLOSE BUTTON

| Spec | Status | Current Value | Required |
|------|--------|---------------|----------|
| Position | ✅ DONE | `position: fixed` | Fixed |
| Icon | ✅ DONE | `←` (left arrow only) | ← left arrow only |
| Text | ✅ DONE | None | No text |
| Border | ✅ DONE | `border: none` | No border |
| Background | ✅ DONE | `transparent` | No background |
| Color (default) | ⚠️ PARTIAL | `rgba(140, 190, 255, 0.60)` | White 50% opacity |
| Color (hover) | ⚠️ PARTIAL | `rgba(140, 190, 255, 0.95)` | White 100% opacity |
| Size | ✅ DONE | `28px × 28px` | 28px |
| Padding from edges | ⚠️ PARTIAL | `left: 14px`, `top: 18px` | 20px from edges |

**Summary:**
- ✅ DONE - Position, icon, style (no text/border/bg), size
- ⚠️ PARTIAL - Color uses blue instead of white; padding is 14px/18px instead of 20px

**File:** [LiveIntelligenceOverlay.jsx](components/user/LiveIntelligenceOverlay.jsx#L1585-L1616)

---

## SECTION 2: TIME-BASED MODES

| Feature | Status | Details |
|---------|--------|---------|
| Mode-specific accent colors | ⚠️ PARTIAL | Colors defined but NOT matching master plan exactly |
| Morning (6AM-9:30AM) | ⚠️ PARTIAL | Blue `rgba(100, 180, 255, 1)` + ☀️ ✅ |
| Live Market (9:30AM-3:30PM) | ⚠️ PARTIAL | Uses blue NOT green/red + 📡 ✅ |
| Market Close (3:30PM-5PM) | ⚠️ PARTIAL | Uses purple `rgba(180, 140, 220, 1)` NOT gold + 📊 ✅ |
| Evening (5PM-9PM) | ✅ DONE | Purple + 🌆 ✅ |
| Night (9PM-12AM) | ✅ DONE | Dark blue + 🌙 ✅ |
| Global (12AM-6AM) | ✅ DONE | Gray + 🌏 ✅ |
| Mode check interval | ✅ DONE | Runs every **60 seconds** |
| Smooth fade transitions | ✅ DONE | CSS transitions present |

**Mode Color Discrepancies:**
```
Master Plan          Current Implementation
─────────────────    ──────────────────────
Morning = Blue       Blue ✅ Match
Live = Green/Red     Blue ❌ Mismatch (intentional - brand consistency)
Close = Gold         Purple ❌ Mismatch (follows brand, no gold/brown policy)
Evening = Purple     Purple ✅ Match
Night = Dark blue    Dark blue ✅ Match
Global = Gray        Gray ✅ Match
```

**File:** [lib/live-intelligence/modes.js](lib/live-intelligence/modes.js)

**Summary:**
- ⚠️ PARTIAL - Mode system works perfectly, but colors intentionally deviate from master plan to follow laser-blue brand guidelines (no gold/brown)

---

## SECTION 3: BREAKING NEWS

| Feature | Status | Details |
|---------|--------|---------|
| 30-second interrupt | ✅ DONE | `duration: 30000` in breaking-news API |
| Priority over rotation | ✅ DONE | `isBreaking: true` flag + callback system |
| Red pulse glow animation | ❌ MISSING | No red glow CSS found in overlay |
| Breaking news endpoint | ✅ DONE | `/api/breaking-news` with GET/POST/DELETE |
| Admin can trigger | ✅ DONE | POST requires admin auth |
| Supabase logging | ✅ DONE | Logs to `breaking_news_log` table |

**Files:**
- [app/api/breaking-news/route.js](app/api/breaking-news/route.js) - API endpoint
- [lib/live-intelligence/data-sources.js](lib/live-intelligence/data-sources.js#L224-L267) - Client-side handling

**Summary:**
- ✅ DONE - 30-second interrupt mechanism
- ❌ MISSING - Red pulse glow animation (visual indicator for breaking news)

---

## SECTION 4: ROTATION LOGIC

| Feature | Status | Details |
|---------|--------|---------|
| Category balance | ❌ MISSING | No "at least 1 from each category" enforcement |
| Headline expiry check (valid_until) | ⚠️ PARTIAL | `valid_until` field exists but not checked in rotation |
| Priority formula | ✅ DONE | `sortByPriority()` uses urgency weights |
| Mode-based rotation speed | ✅ DONE | Each mode has different `rotationSpeed` |

**Priority System (Implemented):**
```javascript
// lib/live-intelligence/headlines.js#L310-315
const urgencyA = URGENCY_LEVELS[a.urgency]?.weight || 20;
const urgencyB = URGENCY_LEVELS[b.urgency]?.weight || 20;
// Higher weight = higher priority
```

**Summary:**
- ✅ DONE - Priority formula, mode-based speed
- ⚠️ PARTIAL - valid_until exists in DB but not enforced in frontend
- ❌ MISSING - Category balance enforcement

---

## SECTION 5: NIGHT SUMMARY (9PM-12AM)

| Feature | Status | Details |
|---------|--------|---------|
| Dashboard layout | ✅ DONE | `NightSummary.jsx` component |
| Shows only in night_summary mode | ✅ DONE | `if (mode.key !== 'night_summary') return null` |
| Markets recap card | ✅ DONE | NIFTY, SENSEX, Bank Nifty, FII data |
| Key developments card | ✅ DONE | List of 4 developments |
| Tomorrow's watch card | ✅ DONE | Upcoming events with times |
| Swipeable story cards | ❌ MISSING | No Instagram-style carousel |
| 5-7 slides format | ❌ MISSING | Static grid layout, not slides |
| Generated once at 9PM | ❌ MISSING | Uses dummy data, not cached AI generation |
| WhatsApp share | ✅ DONE | `WhatsAppShare` component integrated |

**File:** [app/(public)/live-intelligence-hero/components/NightSummary.jsx](app/(public)/live-intelligence-hero/components/NightSummary.jsx)

**Summary:**
- ✅ DONE - Dashboard layout, mode detection, data cards, WhatsApp share
- ❌ MISSING - Swipeable Instagram-style story cards, 5-7 slide format, cached 9PM generation

---

## SECTION 6: ANALYTICS

| Feature | Status | Details |
|---------|--------|---------|
| Pause detection | ⚠️ PARTIAL | `headline_pause` event tracked, but not "visible > 12s" rule |
| `headline_impression` tracked | ✅ DONE | `HEADLINE_VIEW: 'headline_view'` event |
| `headline_pause` tracked | ✅ DONE | `HEADLINE_PAUSE: 'headline_pause'` event |
| Data stored in Supabase | ✅ DONE | `/api/analytics/live-intelligence` writes to `live_intelligence_analytics` |
| Batched sending | ✅ DONE | 10 events or 5 seconds interval |
| Session management | ✅ DONE | Session ID in sessionStorage |

**Events Tracked:**
- `page_view`, `page_exit`
- `headline_view`, `headline_click`, `headline_share`, `headline_pause`
- `category_filter`, `mode_change`
- `summary_view`, `summary_share`
- `scroll_depth`, `time_on_page`

**File:** [lib/live-intelligence/analytics.js](lib/live-intelligence/analytics.js)

**Summary:**
- ✅ DONE - Core analytics tracking, Supabase storage
- ⚠️ PARTIAL - Pause detection exists but "visible > 12s" threshold not implemented

---

## SECTION 7: WHATSAPP

| Feature | Status | Details |
|---------|--------|---------|
| Conditional display logic | ❌ MISSING | Shows immediately, no 2x expand/3+ pause/9PM rule |
| - Panel expanded 2x | ❌ MISSING | Not tracked |
| - Paused on 3+ headlines | ❌ MISSING | Not tracked |
| - In 9PM summary mode | ⚠️ PARTIAL | WhatsApp shows in NightSummary component |
| Pre-filled WhatsApp message | ✅ DONE | `formatForWhatsApp()` function |
| Opt-in functionality | ✅ DONE | `/api/whatsapp/opt-in` API |
| Backend stores opt-ins | ✅ DONE | `whatsapp_subscribers` table in Supabase |
| Unsubscribe support | ✅ DONE | DELETE endpoint |

**WhatsApp Components:**
- [WhatsAppShare.jsx](app/(public)/live-intelligence-hero/components/WhatsAppShare.jsx) - UI component
- [app/api/whatsapp/opt-in/route.js](app/api/whatsapp/opt-in/route.js) - Backend API

**Summary:**
- ✅ DONE - WhatsApp share, opt-in backend, Supabase storage
- ❌ MISSING - Conditional display triggers (2x expand, 3+ pause)

---

## SECTION 8: ADMIN PANEL

| Feature | Status | Details |
|---------|--------|---------|
| Admin panel exists | ⚠️ PARTIAL | General admin at `/admin-secret-akash`, but NO dedicated Live Intelligence admin |
| Add headlines | ✅ DONE | `/api/admin/headlines` POST endpoint |
| Edit headlines | ❌ MISSING | No PUT endpoint, no edit UI |
| Delete headlines | ✅ DONE | `/api/admin/headlines` DELETE endpoint |
| Set urgency levels | ✅ DONE | `urgency` field in API |
| Set expiry times | ✅ DONE | `valid_until` field in API |
| Preview before publish | ❌ MISSING | No preview UI |
| Live Intelligence section in admin | ❌ MISSING | SuperAdminDashboard has Leads, Analytics, Deliverables - NO Live Intel tab |

**Admin API:** [app/api/admin/headlines/route.js](app/api/admin/headlines/route.js)

**Summary:**
- ✅ DONE - API for add/delete headlines, urgency, expiry
- ❌ MISSING - Dedicated Live Intelligence admin UI, edit functionality, preview

---

## SECTION 9: DATA AUTOMATION

| Feature | Status | Details |
|---------|--------|---------|
| RSS feeds actively fetching | ✅ DONE | `/api/live-intelligence/ingest` with cron |
| RSS Sources | ✅ DONE | Moneycontrol, Economic Times, LiveMint |
| Deduplication | ✅ DONE | SHA256 hash on URL + title |
| Headlines saving to Supabase | ✅ DONE | `intelligence_items` table |
| AI processing running | ✅ DONE | `/api/live-intelligence/process` cron every 15 min |
| Groq classification | ✅ DONE | Llama 3.1 8B for category/urgency |
| Gemini explanation | ✅ DONE | Gemini 1.5 Flash for what_happened/why_it_matters |
| Claude sanitization | ✅ DONE | Claude 3 Haiku for compliance |
| Mood text auto-updating | ✅ DONE | `/api/live-intelligence/mood` cron every 5 min |
| Cron schedules configured | ✅ DONE | vercel.json has all 3 crons |

**Cron Jobs (vercel.json):**
```json
"/api/live-intelligence/ingest": "*/30 * * * *"   // Every 30 min
"/api/live-intelligence/process": "*/15 * * * *"  // Every 15 min
"/api/live-intelligence/mood": "*/5 * * * *"      // Every 5 min
```

**Summary:**
- ✅ DONE - Full automated pipeline working

---

## SECTION 10: SEBI COMPLIANCE

| Feature | Status | Details |
|---------|--------|---------|
| No buy/sell language | ✅ DONE | Explicit filters in all AI prompts |
| No future predictions | ✅ DONE | "FORBIDDEN: will go up, expected to rise" |
| Educational framing only | ✅ DONE | "Educational Only" mandate in prompts |
| Disclaimer present | ✅ DONE | Footer disclaimers site-wide |
| Claude sanitization working | ✅ DONE | `/api/live-intelligence/process` uses Claude |
| Auto-drop if non-compliant | ✅ DONE | `should_drop: true` triggers removal |

**Compliance Rules Enforced (from process/route.js):**
```
❌ "Buy", "Sell", "Hold", "Invest", "Avoid"
❌ "Should", "recommend", "suggest", "consider investing"
❌ "Will go up", "expected to rise", "likely to fall", "target price"
❌ "Forecast", "prediction", "outlook is positive/negative"
❌ ANY future tense about returns or market direction

✅ Past tense facts: "rose", "fell", "announced"
✅ Present tense facts: "is trading at", "currently stands at"
✅ Educational explanations
```

**Master Plan Note:** "We own PMS license"
- **Implication:** Having a PMS (Portfolio Management Services) license from SEBI allows:
  - Managing client portfolios directly
  - Charging fees for investment management
  - Making investment decisions on behalf of clients
- **However:** This does NOT change the Live Intelligence compliance approach because:
  - PMS license applies to client-specific portfolio management, not public broadcasts
  - Public content (like Live Intelligence) still cannot contain investment advice to general public
  - Current compliance approach is CORRECT regardless of PMS license

**Summary:**
- ✅ DONE - Full SEBI compliance pipeline

---

## OVERALL SUMMARY

### ✅ DONE (15 items)
1. Close button icon (←), no text, no border, no background
2. Close button size (28px)
3. Time-based modes with 6 periods
4. Mode check every 60 seconds
5. Breaking news 30-second interrupt
6. Priority sorting formula
7. Night summary dashboard layout
8. Analytics tracking (headline_view, headline_pause)
9. Supabase analytics storage
10. WhatsApp share & opt-in backend
11. Admin API for headlines
12. RSS feed automation (3 sources)
13. AI pipeline (Groq → Gemini → Claude)
14. Mood text auto-generation
15. SEBI compliance throughout

### ⚠️ PARTIAL (6 items)
1. Close button color (blue not white)
2. Close button padding (14px/18px not 20px)
3. Mode colors (follow brand, not master plan colors)
4. valid_until expiry check (exists but not enforced)
5. Pause detection (no 12s threshold)
6. Night summary in 9PM mode (shows but with dummy data)

### ❌ MISSING (8 items)
1. Breaking news red pulse glow animation
2. Category balance enforcement (1 from each)
3. Swipeable Instagram-style story cards
4. 5-7 slide Night Summary format
5. Night Summary cached 9PM generation
6. WhatsApp conditional triggers (2x expand, 3+ pause)
7. Dedicated Live Intelligence admin UI
8. Admin headline edit + preview functionality

---

## PRIORITY RECOMMENDATIONS

### High Priority (Should fix now)
1. **Add Live Intelligence tab to Admin Panel** - Critical for content management
2. **Implement headline expiry check** - valid_until exists but not enforced
3. **Add red pulse glow for breaking news** - Visual distinction needed

### Medium Priority (Next sprint)
4. **WhatsApp conditional triggers** - Improve conversion timing
5. **Category balance in rotation** - Better content diversity
6. **Edit/preview in admin** - Content workflow improvement

### Low Priority (Polish)
7. **Night Summary swipe cards** - Nice-to-have UX improvement
8. **Adjust close button to spec** - Minor visual tweak

---

## MARKMOODSTRIP API CHECK

**Status:** ✅ ALREADY FETCHING FROM API

The [MarketMoodStrip.jsx](components/user/MarketMoodStrip.jsx#L34-L52) correctly:
- Fetches from `/api/live-intelligence/mood` on mount
- Refreshes every 5 minutes (`5 * 60 * 1000`)
- Falls back to headline rotation if API fails
- Displays AI mood text with 📡 prefix when available

```javascript
// Already implemented:
const fetchAiMood = async () => {
  const response = await fetch('/api/live-intelligence/mood');
  if (response.ok) {
    const data = await response.json();
    if (data.mood_text) setAiMoodText(data.mood_text);
  }
};
// Refresh every 5 minutes
const interval = setInterval(fetchAiMood, 5 * 60 * 1000);
```

**No changes needed** - MarketMoodStrip is correctly integrated.

