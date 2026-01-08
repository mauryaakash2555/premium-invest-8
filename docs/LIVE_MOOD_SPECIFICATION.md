# 🎯 LIVE MOOD - Complete Project Specification
> 📡 LIVE INTELLIGENCE STRIP (NOT a news ticker!)
> Bloomberg × Luxury × BM Wealth DNA
> Last Updated: January 8, 2026

---

## ⚠️ CRITICAL UNDERSTANDING

### What This IS:
- ✅ LIVE INTELLIGENCE STRIP
- ✅ Bloomberg × Luxury × BM Wealth DNA
- ✅ "WHY SHOULD I CARE?" approach
- ✅ Every item implies: Opportunity, Risk, Action, or Reassurance

### What This is NOT:
- ❌ Random news
- ❌ Boring scrolling text
- ❌ Generic finance headlines

### Content Structure (NON-NEGOTIABLE):
```
[CATEGORY] → [WHAT HAPPENED] → [WHY IT MATTERS]
```

**Example:**
> Smart Money Alert: FIIs quietly added ₹2,300 Cr into large-cap banks — accumulation phase visible.

---

## 📋 TABLE OF CONTENTS
1. [Animation Flow](#animation-flow)
2. [The Alpha Vault Concept](#the-alpha-vault-concept)
3. [Design Specifications](#design-specifications)
4. [Content Categories](#content-categories)
5. [Time-Based Content Zones](#time-based-content-zones)
6. [Urgency Levels](#urgency-levels)
7. [Display Modes](#display-modes)
8. [High-End Features](#high-end-features)
9. [AI Strategy](#ai-strategy)
10. [Phase 2 Bonus Features](#phase-2-bonus-features)
11. [Technical Decisions](#technical-decisions)
12. [Level 2 Upgrade](#level-2-upgrade)

---

## 🎬 ANIMATION FLOW

### First Visit Behavior:
1. Website opens **normally** (NO Huly laser on load)
2. User scrolls down the page naturally
3. When they scroll **past the LIVE MOOD section** (just before it) → **ONE TIME ONLY**
4. The Huly laser animation **triggers automatically**
5. **THE PANEL COVERS THE HERO IMAGE FROM THE TOP**
6. Same height/length as Huly's laser - EXACT MATCH
7. Everything becomes animation - user is mesmerized ("what did I click?")
8. When user scrolls DOWN → panel closes, back to normal website
9. Animation completes, beautiful reveal moment

### Return Visits (Same Session):
- Animation does **NOT auto-trigger** again
- User must **CLICK** on LIVE MOOD text to open the panel
- Click target: **TEXT CONTAINER ONLY** (not entire bar)
- Rain button stays separate and safe in DOM
- State is stored in sessionStorage

### Page Refresh:
- Clears the "seen" state
- Animation will auto-trigger again on scroll (fresh experience)

### Technical Implementation:
```javascript
// Pseudo-code for animation trigger
const hasSeenAnimation = sessionStorage.getItem('liveMoodAnimationSeen');

if (!hasSeenAnimation && userScrolledPastTriggerPoint) {
  triggerHulyLaserAnimation();
  expandAlphaVaultPanel(); // Covers hero from top
  sessionStorage.setItem('liveMoodAnimationSeen', 'true');
}

// On scroll down → close panel
if (scrollingDown && panelIsOpen) {
  closeAlphaVaultPanel();
  returnToNormalWebsite();
}
```

---

## 🏛️ THE ALPHA VAULT CONCEPT

### Vision:
> "The $90k Website" - Bloomberg Terminal meets Apple Design
> Moving from simple "News Ticker" to premium intelligence experience
> This justifies high-ticket service pricing

### The Trigger:
- LIVE MOOD scrolling text = "The Key"
- First scroll past = auto-trigger (mesmerizing moment)
- After that = click to expand

### The Reveal:
- Does NOT just "pop up"
- **EXPANDS** into full-screen glassmorphism overlay
- Inspired by Huly.io hero section aesthetic
- Covers hero image from top
- Same height as Huly laser beam

### The Layout - Bento Grid:
- Rounded rectangular cards
- Contains "Actionable Intelligence"
- Each card = different content category
- Premium spacing and proportions

### The Close:
- Scroll down = smooth close
- Returns to normal website
- Feels magical, not jarring

---

## 🎨 DESIGN SPECIFICATIONS

### "$90k Website" Aesthetic Checklist:

#### 1. Deep Onyx Backgrounds (NOT pure black):
| Purpose | Color | Hex | Note |
|---------|-------|-----|------|
| **Primary Onyx** | Rich Dark Grey | `#0A0A0A` | Makes colors POP |
| Deepest BG | Near Black | `#0D1117` | Huly reference |
| Surface 01 | Dark Navy | `#131925` | Card backgrounds |
| Surface 02 | Navy | `#19202E` | Elevated elements |
| Surface 03 | Lighter Navy | `#262F40` | Hover states |

#### 2. Glassmorphism:
| Property | Value | Effect |
|----------|-------|--------|
| Backdrop Blur | `backdrop-blur-xl` | Frosted glass |
| Background | `bg-white/5` | 5% white overlay |
| Border | `border-white/10` | Subtle glass edge |
| Premium Depth | Combined | That exact Huly look |

#### 3. Radial Glows ("Northern Lights" Effect):
| Position | Colors | Purpose |
|----------|--------|---------|
| Behind Cards | `#313D9A` → `#202669` | Ethereal glow |
| Accent Spots | `#5190EC` @ 20% opacity | Blue aurora |
| Warm Spots | `#F47758` @ 15% opacity | Coral accent |

#### 4. Glass Borders:
| Property | Value |
|----------|-------|
| Width | `1px` |
| Style | Gradient: white → transparent |
| Start | `rgba(255, 255, 255, 0.18)` |
| End | `rgba(255, 255, 255, 0.05)` |

#### 5. Noise Texture:
| Property | Value | Reason |
|----------|-------|--------|
| Type | Canvas 2D grain | Fast load, ~90% match |
| Opacity | 3-5% | Subtle, not distracting |
| Feel | Tangible | Not plastic, premium |
| Animation | Static or slow drift | Performance |

#### Accent Colors:
| Purpose | Color | Hex |
|---------|-------|-----|
| Primary Blue | Huly Blue | `#5190EC` |
| Deep Blue | Hover State | `#205DC2` |
| Coral/Orange | Accent | `#F47758` |
| Coral Bright | Active | `#F5694A` |
| White | Text Primary | `#FFFFFF` |
| Muted | Text Secondary | `rgba(255,255,255,0.6)` |

### Texture Approach:
- **Decision:** Canvas 2D Approximation (faster load, ~90% visual match)
- No external dependencies (Unicorn Studio)
- Lightweight noise/grain overlay
- GPU-accelerated with `will-change: transform`

### Laser Beam Effect (Level 1):
- Horizontal sweep animation
- Gradient: transparent → white core → transparent
- Duration: ~2 seconds
- Easing: ease-out for natural feel
- Trails: Subtle blur/glow following main beam
- Height: EXACT match to Huly

### Bento Grid Cards:
| Property | Value |
|----------|-------|
| Shape | Rounded rectangles |
| Corners | `rounded-2xl` or `rounded-3xl` |
| Spacing | Premium gaps (16-24px) |
| Content | Actionable Intelligence |
| Hover | Subtle lift + glow increase |

---

## 📊 CONTENT CATEGORIES (EXPANDED)

| Category | Icon | Content Type | Priority |
|----------|------|--------------|----------|
| 📈 Share Market | 📈 | NIFTY/SENSEX moves, FII/DII flows, top gainers/losers, sector movements | HIGH |
| 💰 Mutual Funds | 💰 | SIP flows data, NFO launches, fund performance, category winners | HIGH |
| 📰 Breaking News | 🔴 | Market-moving headlines, RBI updates, Budget announcements | URGENT |
| 🛡️ Insurance | 🛡️ | LIC updates, new product launches, policy changes, claim settlements | MEDIUM |
| 🏦 FD/RD/Bonds | 🏦 | Best FD rates today, RBI bond updates, corporate FD opportunities | MEDIUM |
| 💎 PMS/AIF | 💎 | HNI-focused updates, PMS performance, AIF launches | LOW (premium) |
| 🏠 Real Estate | 🏠 | Mumbai property updates, RERA news, home loan rates | MEDIUM |
| 💵 Forex/Gold | 💵 | USD/INR, Gold prices, commodity updates | MEDIUM |

### Normal News Format:
> "The Insider Brief: Curated, 1-line summaries of why this matters to your wallet."

---

## ⏰ TIME-BASED CONTENT ZONES (SMART ROTATION)

| Time Slot | Mode Name | Content Focus | Tone |
|-----------|-----------|---------------|------|
| 6AM-9:30AM | **"Morning Briefing"** | Pre-market prep, global cues, gap up/down predictions, what to watch | Alert, Preparatory |
| 9:30AM-3:30PM | **"Live Market Pulse"** | Real-time NIFTY, breaking trades, sector rotation, intraday calls. Visual: Dynamic pulsing indicators (Green/Red). Content: Fast ticker, "Breakouts," "Volume Spikes," "Urgent NFO Closures" | Dynamic, Urgent |
| 3:30PM-5PM | **"Market Close"** | Day summary, top movers, FII/DII data, what worked/failed | Analytical |
| 5PM-9PM | **"Evening Intelligence"** | News digest, expert opinions, next day outlook, global markets, Day's Top Gainers, FII/DII Data, MF NAV updates | Informative |
| 9PM-12AM | **"Night Summary"** | Full day recap, AI-Generated "What You Missed Today" mode, week preview | Comprehensive |
| 12AM-6AM | **"Global Watch"** | US markets, Asia opening, overnight developments | Minimal, Key only |

---

## 🔥 URGENCY LEVELS & VISUAL STYLES

| Urgency | Visual Style | Example |
|---------|--------------|---------|
| 🔴 BREAKING | Red pulse glow, faster scroll | "RBI Emergency Rate Cut: -25bps!" |
| 🟡 IMPORTANT | Gold highlight | "NIFTY crosses 25,000 for first time" |
| 🟢 REGULAR | Normal gold text | "SBI FD rates revised upward" |
| 🔵 EDUCATIONAL | Blue tint | "Tax-saving deadline: 31st March" |
| 💎 PREMIUM TIP | Diamond icon, special glow | "Our clients bought this at 52-week low" |

---

## 📱 DISPLAY MODES

### Mode 1: Single Headline Ticker (Default)
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 LIVE MOOD  │  NIFTY 50: 24,857 (+0.52%) │ FII bought ₹2,847Cr today
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Mode 2: Expanded News Panel (Click to expand)
```
┌─────────────────────────────────────────────────────────┐
│  📈 LIVE MOOD - Evening Intelligence (5:45 PM)          │
├─────────────────────────────────────────────────────────┤
│ 🔴 SENSEX closes at all-time high: 82,890              │
│ 💰 SIP inflows hit record ₹23,000Cr in December        │
│ 🛡️ LIC launches new Jeevan policy with 8.5% returns   │
│ 🏦 HDFC FD rates: Now 7.35% for 1-year                 │
│ 🏠 Mumbai property registrations up 15% YoY            │
├─────────────────────────────────────────────────────────┤
│ [View All Headlines] [🔔 Get Alerts]                    │
└─────────────────────────────────────────────────────────┘
```

### Mode 3: 9PM+ Night Summary Dashboard
```
┌─────────────────────────────────────────────────────────┐
│  🌙 WHAT YOU MISSED TODAY - Jan 7, 2026                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  MARKETS          │  TOP NEWS                           │
│  NIFTY: +127 pts  │  • Budget preparation begins        │
│  SENSEX: +445 pts │  • Q3 results season starts         │
│  Bank Nifty: +1.2%│  • FII turned buyers after 3 days   │
│                   │                                     │
│  YOUR SERVICES    │  TOMORROW'S OUTLOOK                 │
│  🛡️ LIC: New IPO │  • Auto sector results expected     │
│  💰 MF: SIP date  │  • RBI credit policy Thursday       │
│  🏦 FD: Rates up  │  • Global: Fed minutes release      │
│                                                         │
│  [Full Summary PDF] [Set Morning Alert]                 │
└─────────────────────────────────────────────────────────┘
```

---

## ✨ HIGH-END FEATURES ("The More")

### A. Sentiment & Opportunity Tags
Don't just show text. Tag every headline with a luxury badge:
| Tag | Color | Use Case |
|-----|-------|----------|
| **STRONG BUY** | Pulsing Green | Clear opportunity |
| **HIGH VOLATILITY** | Amber Warning | Risk alert |
| **URGENT: CLOSING SOON** | Red | FDs/NFOs ending |
| **DIVIDEND ALERT** | Gold | Income opportunity |

### B. The "Action" Button
Every news item must have a purpose:
- News: "HDFC Bank posts strong results." → Button: `[View HDFC Fund]`
- News: "Gold prices dip." → Button: `[Buy Sovereign Gold Bond]`

### C. The "9 PM Catch-up" Mode (Stories Format)
- Transforms into Instagram/WhatsApp Stories style
- Users tap through 5 slides summarizing the day
- Share requires clicking our link → drives traffic
- Modern, interactive, premium feel

---

## 🔄 CONTENT ROTATION LOGIC

### Rotation Rules:
```
1. MINIMUM Headlines: 5 visible in rotation
2. MAXIMUM Headlines: 15 (excess goes to archive)
3. ROTATION Speed: 8 seconds per headline
4. BREAKING NEWS: Interrupts rotation, shows for 30 seconds
5. CATEGORY Balance: At least 1 from each active category
```

### Priority Formula:
```
Score = (Urgency × 3) + (Recency × 2) + (Category_Weight × 1)

Higher score = Shows first
```

---

## 📡 CONTENT SOURCES (AUTO-UPDATE)

| Source Type | Method | Frequency | Cost |
|-------------|--------|-----------|------|
| Market Data | Free APIs (NSE, BSE) | Real-time (15-min delay free) | FREE |
| News Headlines | RSS Feeds (MoneyControl, ET, Mint) | Every 30 mins | FREE |
| Manual Priority | Admin Panel | As needed | FREE |
| AI Generated | Claude API summary | Daily 6AM, 9PM | ~₹100/month |

---

## 🤖 AI STRATEGY

### Budget Constraint:
- **Maximum:** $50/month (or FREE preferred)
- Must be 2000% reliable for finance
- Current data required
- Live data would be AMAZING

### Hierarchy of AI Usage:
```
┌─────────────────────────────────────────────────�
│  👑 CLAUDE (Main God / Bigger Brain King)   │
│  - Lives in AI Chat Box                     │
│  - Manages all other AIs                    │
│  - Last resort for complex queries          │
│  - Used sparingly (cost management)         │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  🧠 FREE/CHEAP FINANCE-FOCUSED AI           │
│  - Primary for financial summaries          │
│  - MUST be reliable for finance (2000%)     │
│  - Budget: Under $50/month or FREE          │
│                                             │
│  Options to Research:                       │
│  ┌─────────────────────────────────────┐    │
│  │ FREE TIER OPTIONS:                  │    │
│  │ • Groq (Llama 3) - Fast, free tier  │    │
│  │ • Google Gemini - Free tier         │    │
│  │ • Mistral - Free tier               │    │
│  │ • Cohere - Free for startups        │    │
│  └─────────────────────────────────────┘    │
│  ┌─────────────────────────────────────┐    │
│  │ FINANCE SPECIALIZED:                │    │
│  │ • FinGPT - Open source, finance     │    │
│  │ • BloombergGPT - If accessible      │    │
│  │ • Custom fine-tuned Llama           │    │
│  └─────────────────────────────────────┘    │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│  📊 LIVE DATA SOURCES (Priority)            │
│  - NSE/BSE APIs (market data)               │
│  - Yahoo Finance API (free)                 │
│  - Alpha Vantage (free tier)                │
│  - Finnhub (free tier, real-time)           │
│  - RSS Feeds (news aggregation)             │
│  - Twelve Data (free tier)                  │
└─────────────────────────────────────────────┘
```

### AI Chat Box Integration:
- Claude already integrated in existing AI chat box
- Claude manages/oversees other AIs
- Claude is the fallback for complex analysis
- Cost-conscious architecture

### Data Reliability Requirements:
| Data Type | Requirement |
|-----------|-------------|
| Stock Prices | Real-time or 15-min delayed |
| NAV Data | Daily (EOD acceptable) |
| News | As fresh as possible |
| Forex/Gold | Real-time preferred |
| Summaries | AI-generated, fact-checked |

---

## 🎁 PHASE 2 BONUS FEATURES

### 1. WhatsApp Alert Integration
- "Get Breaking News on WhatsApp" CTA
- Lead capture form
- Category subscription preferences
- Scheduled digests (Morning/Evening)

### 2. Personalized Feed
- User selects preferred categories
- Saved in localStorage/account
- Prioritized content display
- "For You" section

### 3. Click Analytics
- Track which headlines get most clicks
- Category performance metrics
- Time-of-day engagement patterns
- A/B testing for headline styles

### 4. Archive Page
- Route: `/news`
- Full history of all headlines
- Searchable by keyword, category, date
- Filter by time zone/urgency
- Pagination or infinite scroll

### 5. Voice Mode (Accessibility)
- Auto-read headlines aloud
- Text-to-speech integration
- Speed control
- Play/Pause/Skip controls
- Works great for commuters

### 6. Dark/Light Toggle
- Match user system preference
- Manual override option
- Smooth transition animation
- Persistent preference (localStorage)

---

## ⚙️ TECHNICAL DECISIONS

### Platform:
- **Mobile First:** 80% of users on mobile
- Same behavior across all devices
- Touch-optimized interactions
- Performance-critical (fast load)

### Admin Panel:
- **Name:** Akash (Super Admin Panel)
- Full control over content
- AI management interface
- Analytics dashboard
- User management

### State Management:
- sessionStorage for animation state
- localStorage for user preferences
- Server-side for persistent data

### Animation Performance:
- CSS animations preferred (GPU-accelerated)
- Canvas 2D for noise texture
- `will-change` hints for smooth renders
- Lazy-load off-screen content

---

## 📅 BUILD PHASES

### Phase 1: DESIGN ONLY (Current Focus)
- [ ] Huly laser animation (exact match)
- [ ] Canvas 2D noise texture
- [ ] Glow effects and gradients
- [ ] LIVE MOOD component shell
- [ ] Mobile-first responsive layout
- [ ] Dark theme (Huly palette)

### Phase 2: Core Functionality
- [ ] Time-zone content logic
- [ ] Ticker component
- [ ] Category switching
- [ ] Expanded panel view

### Phase 3: Data Integration
- [ ] NSE/BSE API connection
- [ ] RSS feed aggregation
- [ ] Free AI integration (summaries)

### Phase 4: 9PM Stories Mode
- [ ] Swipeable stories UI
- [ ] Progress indicators
- [ ] Auto-advance logic

### Phase 5: Admin Panel (Akash)
- [ ] Content management
- [ ] AI oversight
- [ ] Analytics

### Phase 6: Bonus Features
- [ ] WhatsApp integration
- [ ] Personalized feed
- [ ] Click analytics
- [ ] Archive page
- [ ] Voice mode
- [ ] Dark/Light toggle

---

## 🔗 COMPETITOR REFERENCE
> To be researched: Top financial news platforms
- Bloomberg Terminal
- Moneycontrol
- ET Markets
- NSE India
- Trading View
- Zerodha Pulse
- Groww Feed

---

## 📝 NOTES
- Do NOT push until explicitly approved
- Design first, functionality later
- Mobile-first (80% mobile users)
- Claude is the "Main God" AI - use sparingly
- Animation triggers on scroll (first time only per session)

---

*Document maintained by: GitHub Copilot & BM Wealth Team*

---

## 🚀 LEVEL 2 UPGRADE (After Design Complete)

### Reference Video:
- **YouTube:** https://www.youtube.com/watch?v=s2BcbroXWvo
- **Title:** "[Tutorial] Huly 2.0: Blend Modes, Textures, Optimization"

### What Level 2 Adds:
| Feature | Description |
|---------|-------------|
| Blend Modes | Advanced layer blending for depth |
| Enhanced Textures | More sophisticated noise/grain |
| Optimization | Performance improvements |
| Visual Polish | Extra details and refinements |

### When to Upgrade:
- ✅ Level 1 design is complete and working
- ✅ User has approved Level 1
- ✅ Animation flow is smooth
- ✅ Mobile is tested and working
- THEN → Apply Level 2 enhancements

### Notes:
- Level 2 is an UPGRADE, not a replacement
- Build solid foundation first (Level 1)
- Polish comes after core functionality
- Video tutorial will guide enhancements

---

## ✅ PRE-BUILD CONFIRMATION CHECKLIST

Before we start, confirming understanding:

### Animation Flow:
- [x] Website opens normally (no laser on load)
- [x] Scroll past LIVE MOOD = auto-trigger laser + panel
- [x] Panel COVERS hero image from top
- [x] Same height as Huly laser (exact)
- [x] User is mesmerized ("what did I click?")
- [x] Scroll DOWN = closes panel, back to normal
- [x] Click on TEXT only to re-open (rain button safe)
- [x] Page refresh = fresh experience

### Design:
- [x] Deep Onyx `#0A0A0A` (not pure black)
- [x] Radial glows ("Northern Lights")
- [x] Glass borders (1px gradient white→transparent)
- [x] Noise texture (Canvas 2D, tangible feel)
- [x] Glassmorphism (backdrop-blur, bg-white/5, border-white/10)
- [x] Bento Grid layout with rounded cards
- [x] "$90k Website" aesthetic

### Technical:
- [x] Mobile first (80% users)
- [x] Canvas 2D for texture (fast load)
- [x] GPU-accelerated animations
- [x] sessionStorage for animation state

### AI Budget:
- [x] Under $50/month (or FREE)
- [x] Must be 2000% reliable for finance
- [x] Live data if possible
- [x] Claude as "Main God" (used sparingly)

### Phases:
- [x] Phase 1: DESIGN ONLY (current focus)
- [x] Level 2: After design approved (Huly 2.0 tutorial)
- [x] Then: Functionality, data, features

---

## 🎯 READY STATUS

**Design Focus:** ✅ Confirmed
**All Details Saved:** ✅ Yes
**Level 2 Reference:** ✅ Saved
**AI Budget:** ✅ Under $50/month
**Mobile First:** ✅ 80% users

---

## 🔒 LOCKED FEATURES (DO NOT CHANGE)

### ✅ Laser Beam Sweep (LOCKED - User Loves It)
- Horizontal sweep animation
- Blue gradient with white core
- Glow effects (box-shadow)
- 2 second duration
- **STATUS: LOCKED FOREVER** ⭐

### ✅ Alpha Vault Panel (LOCKED)
- Glassmorphism background (frosted glass)
- Northern Lights glows (blue, coral, purple)
- Noise texture (Canvas 2D, subtle grain)
- 8 Bento Grid Cards with all categories
- Scroll down → closes panel
- **STATUS: LOCKED** ⭐

### ✅ Panel Content Cards (LOCKED)
1. Share Market (LIVE badge, green +%)
2. Mutual Funds (gold, inflow)
3. Breaking News (URGENT badge)
4. Insurance (blue, ULIP)
5. FD/Bonds (best rate)
6. PMS/AIF (purple, AUM)
7. Real Estate (teal, Mumbai)
8. Forex/Gold (dual display)

---

## 🚀 NEXT: HULY VERTICAL FLOW

### What to Add:
- Laser flows FROM HEADER → DOWN
- Same length/height as Huly
- THEN reveals the locked panel
- Vertical flow animation before horizontal sweep

### Flow Sequence:
1. User scrolls past LIVE MOOD trigger
2. **NEW:** Huly vertical flow starts from header
3. Flow sweeps DOWN the full height
4. **EXISTING:** Horizontal laser sweep (locked)
5. **EXISTING:** Panel opens (locked)

---

**Waiting for:** User confirmation to BEGIN DESIGN
