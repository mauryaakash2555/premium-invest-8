# 🎯 LIVE MOOD - Complete Project Specification

> IMPORTANT (Jan 21, 2026): The current source-of-truth spec is `docs/live-intelligence/SOURCE_OF_TRUTH_2026-01-21.md`.
> Keep this document as historical reference; when there is conflict, the source-of-truth file wins.

> **Note**: Original Huly laser reference replaced with our custom proprietary laser animation.
> The seamless loop video is now at `public/videos/laser-beam.mp4` (see `LASER_LOOP_FIX_GUIDE.md` for details).

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

The Live Intelligence Hero section features:
1. **Laser beam animation** - Custom proprietary laser (seamless loop, baked crossfade)
2. **Canvas 2D noise texture** - Subtle grain overlay for premium feel
3. **Glow effects and gradients** - Atmospheric lighting
4. **LIVE MOOD component** - Real-time market mood display
5. **Premium Market Ticker** - Scrolling market data

---

## 🏦 THE ALPHA VAULT CONCEPT

A premium, exclusive-feeling interface that makes users feel they're accessing insider financial intelligence.

Key principles:
- **Dark, sophisticated palette** (blacks, deep grays, gold accents)
- **Subtle animations** (nothing jarring or cheap-looking)
- **Information density** without clutter
- **Mobile-first** responsive design

---

## 🎨 DESIGN SPECIFICATIONS

### Color Palette
| Name | Hex | Usage |
|------|-----|-------|
| Deep Black | `#0A0A0A` | Primary background |
| Charcoal | `#1A1A1A` | Secondary surfaces |
| Gold Accent | `#C0A062` / `#DAA520` | Highlights, CTAs |
| Soft White | `#F5F5F5` | Primary text |
| Muted Gray | `#666666` | Secondary text |

### Typography
- **Headlines**: Playfair Display (serif, elegant)
- **Body**: Inter or system sans-serif
- **Data/Numbers**: Monospace for financial figures

### Spacing
- Mobile: 16px base padding
- Desktop: 24-32px base padding
- Generous whitespace for luxury feel

---

## 📊 CONTENT CATEGORIES

| Category | Icon | Content Type | Priority |
|----------|------|--------------|----------|
| 📈 Share Market | 📈 | NIFTY/SENSEX moves, FII/DII flows, top gainers/losers, sector movements | HIGH |
| 💰 Mutual Funds | 💰 | SIP flows data, NFO launches, fund performance, category winners | HIGH |
| 📰 Breaking News | 🔴 | Market-moving headlines, RBI updates, Budget announcements | URGENT |
| 🛡️ Insurance | 🛡️ | LIC updates, new product launches, policy changes, claim settlements | MEDIUM |
| 🏦 FD/RD/Bonds | 🏦 | Best FD rates today, RBI bond updates, corporate FD opportunities | MEDIUM |
| 💎 PMS/AIF | 💎 | HNI-focused updates, PMS performance, AIF launches | LOW (premium) |

---

## ⏰ TIME-BASED CONTENT ZONES

### Morning Zone (6 AM - 9 AM)
- Pre-market setup
- Global market overnight summary
- SGX Nifty levels
- FII/DII data from previous day

### Market Hours (9:15 AM - 3:30 PM)
- Live market updates
- Sector movements
- Breaking news
- Top gainers/losers

### Post-Market (3:30 PM - 6 PM)
- Market close summary
- Day's highlights
- Institutional activity

### Evening Zone (6 PM - 9 PM)
- Analysis and outlook
- Expert opinions
- Tomorrow's expectations

### Night Zone (9 PM - 6 AM)
- Global market updates
- US market moves
- Commodities and crypto
- Next day preview

---

## 🚨 URGENCY LEVELS

| Level | Visual | Trigger |
|-------|--------|---------|
| 🔴 URGENT | Red pulse, sound option | RBI announcements, major crashes, breaking news |
| 🟡 HIGH | Gold highlight | Market swings >1%, major fund launches |
| 🟢 NORMAL | Standard display | Regular updates, educational content |
| ⚪ LOW | Subtle, muted | Background info, scheduled content |

---

## 📱 DISPLAY MODES

### 1. Compact Strip (Default)
- Single line ticker
- Category icon + headline + time
- Scrolling animation

### 2. Expanded Panel
- Click/tap to expand
- Full headline + summary
- Related links
- Share buttons

### 3. Stories Mode (9 PM Special)
- Full-screen swipeable cards
- Auto-advance with progress indicator
- Day's top 5-10 stories
- Immersive experience

---

## ✨ HIGH-END FEATURES

### 1. Smart Scrolling
- Pause on hover/touch
- Speed control
- Manual navigation

### 2. Category Filtering
- Quick filter buttons
- Remember user preferences
- "For You" personalized section

### 3. Sound Notifications (Optional)
- Subtle chime for urgent news
- User opt-in only
- Customizable per category

### 4. Offline Support
- Cache last 20 headlines
- Show cached content when offline
- Sync on reconnect

---

## 🤖 AI STRATEGY

### Content Generation
- Use free AI APIs for headline summarization
- Extract key numbers and metrics
- Generate brief, punchy headlines

### Personalization
- Track user interests (localStorage)
- Prioritize preferred categories
- Learn from clicks/engagement

### Safety
- No investment advice
- Educational/informational only
- SEBI compliance maintained

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
- Respect system preference
- Manual override
- Smooth transition animation

---

## 🔧 TECHNICAL DECISIONS

### Frontend
- Next.js App Router
- CSS Modules for styling
- Framer Motion for animations
- Canvas API for noise/grain effects

### Video
- MP4 format (best compatibility)
- Seamless loop baked with FFmpeg (see `LASER_LOOP_FIX_GUIDE.md`)
- `mix-blend-mode: lighten` for laser effect
- Preload for smooth playback

### Data Sources (Phase 3)
- NSE/BSE APIs for market data
- RSS feeds for news aggregation
- Free AI APIs for summarization

### State Management
- React Context for global state
- localStorage for user preferences
- SWR/React Query for data fetching

---

## 📅 BUILD PHASES

### Phase 1: DESIGN ONLY (Current Focus) ✅
- [x] Custom laser animation (seamless loop) ← **COMPLETED**
- [ ] Canvas 2D noise texture
- [ ] Glow effects and gradients
- [ ] LIVE MOOD component shell
- [ ] Mobile-first responsive layout
- [ ] Dark theme (gold accents)

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
- [ ] Voice mode
- [ ] Archive page

---

## 🚀 LEVEL 2 UPGRADE

Future enhancements after core is stable:
- Push notifications
- Mobile app version
- Premium subscriber-only content
- Real-time WebSocket updates
- Advanced analytics dashboard

---

## 📁 RELATED FILES

| File | Purpose |
|------|---------|
| `app/(public)/live-intelligence-hero/page.jsx` | Main hero component |
| `app/(public)/live-intelligence-hero/HulyHero.module.css` | Hero styles |
| `app/(public)/live-intelligence-hero/LASER_LOOP_FIX_GUIDE.md` | Video loop fix documentation |
| `public/videos/laser-beam.mp4` | Seamless loop laser video |
| `components/user/MarketMoodStrip.jsx` | Live Mood strip component |
| `components/user/PremiumMarketTicker.jsx` | Market ticker component |
| `scripts/make-seamless-xfade-loop.ps1` | FFmpeg seamless loop script |

---

*Last updated: January 11, 2026*
*Custom laser video: No copyright issues - proprietary asset*
