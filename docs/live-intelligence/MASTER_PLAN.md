# LIVE INTELLIGENCE - COMPLETE MASTER PLAN

> Last updated: January 13, 2026
> Status: Phase 1 COMPLETE, starting Phase 2

---

## SECTION 1: CORE CONCEPT ✅ DONE

**What it is:**
- NOT a news ticker
- A LIVE INTELLIGENCE STRIP
- Bloomberg × Luxury × BM Wealth DNA
- Covers entire homepage when triggered
- Full page with: Laser (top) + Panel (middle) + Footer (bottom)

**Why users care:**
- Every item answers: "Is this good or bad for MY money?"
- Implies: Opportunity, Risk, Action, or Reassurance
- Saves 2-3 hours daily research
- Personalized to their holdings

---

## SECTION 2: PAGE STRUCTURE ✅ DONE

```
HOMEPAGE (bmwealth.co.in)
│
├── Navigation
├── Hero Section
├── LIVE MOOD/market ticker Bar (rotating text) ← TRIGGER POINT
├── Rest of homepage content
├── Homepage Footer
│
└── LIVE INTELLIGENCE PAGE (overlay when triggered)   
    ├── Laser Section (top) - Unicorn style animation ✅
    ├── Panel Content (middle) - Headlines, categories ✅
    └── Live Intelligence Footer (bottom) ✅
```

---

## SECTION 3: OPEN/CLOSE BEHAVIOR ✅ DONE

### OPEN TRIGGERS:
| Trigger | When |
|---------|------|
| Auto-open (first time) | User scrolls PAST LIVE MOOD bar |
| Manual open | User clicks LIVE MOOD/market ticker bar |
| After refresh | Auto-open resets, will trigger once again |

### CLOSE TRIGGERS:
| Trigger | When |
|---------|------|
| Manual close | User clicks ← arrow (top-right) |

### CLOSE BUTTON SPECS: ✅
- Position: Fixed, top-right
- Icon: ← (left arrow, meaning "go back")
- Style: No text, no border, no background
- Color: White, 50% opacity
- Hover: White, 100% opacity
- Size: 28px
- Padding: 20px from edges

---

## SECTION 4: TIME-BASED MODES 🔄 NEXT UP

### MODE DEFINITIONS:

| Time (IST) | Mode Key | Display Name | Rotation | Tone |
|------------|----------|--------------|----------|------|
| 06:00-09:30 | morning_brief | Morning Briefing | 10s | Alert, Preparatory |
| 09:30-15:30 | live_market | Live Market Pulse | 6s | Dynamic, Urgent |
| 15:30-17:00 | market_close | Market Close | 10s | Analytical |
| 17:00-21:00 | evening_intel | Evening Intelligence | 8s | Informative |
| 21:00-24:00 | night_summary | What You Missed | 8s | Comprehensive |
| 00:00-06:00 | global_watch | Global Watch | 12s | Minimal |

### MODE CONTENT:

**1. MORNING BRIEFING (6AM-9:30AM)**
- Pre-market preparation
- SGX Nifty indication
- Global cues (US close, Asia opening)
- Gap up/down predictions
- What to watch today
- Visual: Blue accent, ☀️ icon

**2. LIVE MARKET PULSE (9:30AM-3:30PM)**
- Real-time NIFTY/SENSEX moves
- FII activity live
- Volume spikes
- Sector rotation
- Breaking trades
- Visual: Green/Red dynamic, 📡 icon
- Breaking news interrupts for 30 seconds

**3. MARKET CLOSE (3:30PM-5PM)**
- Day summary
- Top gainers/losers
- FII/DII final data
- What worked/failed
- Visual: Gold accent, 📊 icon

**4. EVENING INTELLIGENCE (5PM-9PM)**
- News digest
- Expert opinions
- Next day outlook
- MF NAV updates
- Visual: Purple accent, 🌆 icon

**5. NIGHT SUMMARY (9PM-12AM)**
- Full day recap
- "What You Missed Today" dashboard
- Tomorrow's events
- Shareable summary
- Visual: Dark blue, 🌙 icon
- Layout: Dashboard (not ticker), swipeable story cards

**6. GLOBAL WATCH (12AM-6AM)**
- US market close
- Asia opening
- Overnight developments
- Minimal items (max 5)
- Visual: Gray muted, 🌏 icon

### MODE SWITCHING LOGIC:
```javascript
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
|----------|------|-----|---------|----------|
| Share Market | 📈 | market | NIFTY/SENSEX, FII/DII flows, sectors | HIGH |
| Mutual Funds | 💰 | mutual_funds | SIP flows, NFO launches, performance | HIGH |
| Breaking News | 🔴 | breaking | RBI, Budget, market-moving | URGENT |
| Insurance | 🛡️ | insurance | LIC updates, new policies | MEDIUM |
| FD/RD/Bonds | 🏦 | fixed_income | Best FD rates, RBI bonds | MEDIUM |
| PMS/AIF | 💎 | pms | HNI updates, PMS performance | LOW |
| Real Estate | 🏠 | real_estate | Mumbai property, RERA, home loans | MEDIUM |
| Forex/Gold/Silver | 💵 | forex_gold | USD/INR, Gold prices | MEDIUM |

### CATEGORY FILTER:
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

### CONTENT FORMAT (NON-NEGOTIABLE):
`[CATEGORY] → [WHAT HAPPENED] → [WHY IT MATTERS]`

Example:
> Smart Money Alert: FIIs quietly added ₹2,300 Cr into large-cap banks — accumulation phase visible.

---

## SECTION 7: URGENCY LEVELS

| Urgency | Visual | Duration | Example |
|---------|--------|----------|---------|
| 🔴 BREAKING | Red pulse glow, faster scroll | 30s interrupt | "RBI Emergency Rate Cut!" |
| 🟡 IMPORTANT | Gold highlight | 12s | "NIFTY crosses 25,000" |
| 🟢 REGULAR | Normal gold text | 8s | "SBI FD rates revised" |
| 🔵 EDUCATIONAL | Blue tint | 10s | "Tax-saving deadline: March 31" |
| 💎 PREMIUM | Diamond icon, special glow | 15s | "Accumulation phase visible" |

### SEBI COMPLIANCE:
- ❌ Never use: "STRONG BUY", "SELL NOW", "guaranteed returns"
- ✅ Use instead: "ACCUMULATION", "BULLISH TREND", "observational"
- All content is educational, not advice
- Public information only

---

## SECTION 8: ROTATION LOGIC

### RULES:
- Minimum headlines in rotation: 5
- Maximum headlines: 15 (excess goes to archive)
- Default rotation: 8 seconds
- Breaking news: Interrupts for 30 seconds
- Category balance: At least 1 from each active category

### PRIORITY FORMULA:
```
Score = (Urgency × 3) + (Recency × 2) + (Category_Weight × 1)
```
Higher score = Shows first

### URGENCY WEIGHTS:
- BREAKING: 100 points
- IMPORTANT: 50 points
- PREMIUM: 40 points
- REGULAR: 20 points
- EDUCATIONAL: 15 points

---

## SECTION 9: NIGHT SUMMARY LAYOUT (9PM-12AM)

Special dashboard format (not ticker):
```
┌─────────────────────────────────────────────────┐
│  🌙 WHAT YOU MISSED TODAY — Jan 12, 2026        │
├─────────────────────────────────────────────────┤
│                                                 │
│  MARKETS                                        │
│  • NIFTY: 24,987 (+127 pts, +0.51%)            │
│  • SENSEX: 82,450 (+412 pts)                   │
│  • Bank Nifty: +1.8%                           │
│  • FII: Net buyers ₹2,847Cr                    │
│                                                 │
│  KEY DEVELOPMENTS                               │
│  • RBI signals rate cut possibility            │
│  • SIP inflows hit all-time high               │
│  • Q3 results season begins tomorrow           │
│                                                 │
│  TOMORROW'S WATCH                               │
│  • TCS, Infy results post-market               │
│  • US CPI data release                         │
│  • FII trend continuation?                     │
│                                                 │
│  [Share Summary] [← Back]                      │
└─────────────────────────────────────────────────┘
```

Features:
- Swipeable story cards (like Instagram/WhatsApp)
- 5-7 slides summarizing the day
- Shareable to WhatsApp
- Generated once at 9PM, cached until midnight

---

## IMPLEMENTATION PHASES

### PHASE 1: Core UX ✅ COMPLETE
- ✅ Laser + Panel design
- ✅ Open/close behavior
- ✅ Scroll triggers
- ✅ Close button
- ✅ Footer visible

### PHASE 2: Time-based modes ✅ COMPLETE
- ✅ Mode detection logic
- ✅ Mode-specific visuals
- ✅ Rotation speed changes
- ✅ Mode badge display
- ✅ Night summary dashboard

### PHASE 3: Content system ✅ COMPLETE
- ✅ Dummy headlines
- ✅ Category filters
- ✅ Urgency badges
- ✅ Rotation logic

### PHASE 4: Data integration ✅ COMPLETE
- ✅ NSE/BSE API connection
- ✅ RSS feed integration
- ✅ Manual admin override
- ✅ Breaking news system

### PHASE 5: AI integration ✅ COMPLETE
- ✅ Morning summary generation
- ✅ Night summary generation
- ✅ "Why it matters" auto-generation
- ✅ Compliance checking

### PHASE 6: Analytics + WhatsApp ✅ COMPLETE
- ✅ Event tracking
- ✅ Engagement metrics
- ✅ WhatsApp opt-in
- ✅ Share functionality

### PHASE 7: Personalization ✅ COMPLETE
- ✅ Behavioral tracking
- ✅ Category preferences
- ✅ Learning streaks
- ✅ Gamification

---

## SEBI COMPLIANCE CHECKLIST

### ALWAYS:
- ✅ Public information only
- ✅ Educational framing
- ✅ Observational tone
- ✅ Disclaimer on AI content
- ✅ "Not investment advice" footer

### NEVER:
- ❌ "Buy", "Sell", "Invest now"
- ❌ Guaranteed returns
- ❌ Specific stock tips
- ❌ "Our clients made X%"
- ❌ Urgency language like "Act now"

### SAFE ALTERNATIVES:
- "STRONG BUY" → "ACCUMULATION PHASE"
- "SELL NOW" → "CAUTION: HIGH VOLATILITY"
- "Guaranteed" → "Historical average"
- "Best stock" → "Top performer this week"

---

## FILE STRUCTURE

```
/app
  /(public)
    /live-intelligence-hero
      page.jsx ✅
      components/
        ModeIndicator.jsx ✅
        HeadlineCard.jsx ✅
        CategoryFilter.jsx ✅
        HeadlineFeed.jsx ✅
        NightSummary.jsx ✅
        WhatsAppShare.jsx ✅
        StreakBadge.jsx ✅

/lib
  /live-intelligence
    modes.js ✅
    headlines.js ✅
    data-sources.js ✅
    ai-summary.js ✅
    analytics.js ✅
    personalization.js ✅
    
/app/api
  /rss-proxy/route.js ✅
  /admin/headlines/route.js ✅
  /breaking-news/route.js ✅
  /ai/generate-summary/route.js ✅
  /analytics/live-intelligence/route.js ✅
  /whatsapp/opt-in/route.js ✅

/supabase/migrations
  20260113_live_intelligence.sql ✅
    
/docs
  /live-intelligence
    MASTER_PLAN.md (this file)
    LASER_PAGE_BLUEPRINT.md
    RECOVERY_GUIDE.md
    COMPONENT_CODES.md
    VISUAL_REFERENCE.md
    TEST_RESULTS.md
    CHANGELOG.md
    TODO_CHECKLIST.md
```

---

## CURRENT STATUS

**Last updated:** January 13, 2026  
**Current phase:** ALL PHASES COMPLETE ✅  
**Blockers:** None  
**Next action:** Testing & refinement
