# 📄 BM WEALTH – LIVE INTELLIGENCE HERO
## MASTER HANDOFF SPEC (FOR AI IMPLEMENTATION)

> IMPORTANT (Jan 21, 2026): The current source-of-truth spec is `docs/live-intelligence/SOURCE_OF_TRUTH_2026-01-21.md`.
> Keep this document as historical reference; when there is conflict, the source-of-truth file wins.

> **Version**: FINAL v1  
> **Date**: January 11, 2026  
> **Status**: FROZEN – No changes without explicit approval

---

## 0️⃣ PROJECT INTENT (READ FIRST – NON-NEGOTIABLE)

We are building an exact visual + behavioral replica of huly.io's hero laser + background, adapted to BM Wealth branding and content.

**This is NOT:**
- a news ticker
- a scrolling marquee
- a widget

**This IS:**
A **LIVE INTELLIGENCE STRIP** that feels like **Bloomberg × Luxury × BM Wealth**

**No shortcuts. No "similar". No interpretation.**

---

## 1️⃣ VISUAL GOAL (HULY.IO PARITY)

You must replicate exactly what huly.io ships in production, using standard web platform features.

**Confirmed facts:**
- huly hero effects are CSS + DOM + gradients + blur + blend-modes
- NO WebGL shaders are required for pixel parity
- "Volumetric" look is an illusion, not real 3D

**The following must match:**
- laser / light following interaction
- glow falloff
- foggy background depth
- premium smoothness
- layering and blend behavior

**If the browser DevTools can inspect it → we can replicate it.**

---

## 2️⃣ TECH CONSTRAINTS (LOCKED)

### Stack
- Next.js 15 (App Router)
- React 18 (DO NOT upgrade)
- Tailwind v4
- Inline styles allowed
- Framer Motion → UI only (panel open/close)
- **NO Three.js / NO WebGL** unless explicitly asked later

### Rules
- Desktop-first
- Performance tuning later
- **Design parity first**

---

## 3️⃣ WHERE THIS LIVES

- **Homepage only**
- Inside hero section
- Below navigation
- Above main content

❌ Do not mount globally  
❌ Do not put in layout.js

---

## 4️⃣ LIVE MOOD = STATE MACHINE (CORE IDEA)

LIVE MOOD is **state-driven**, not text-driven.

State depends on:
- time of day
- market phase
- urgency overrides
- user interaction (expanded / collapsed)

---

## 5️⃣ TIME-BASED MODES (AUTOMATIC)

| Time (IST) | Mode |
|------------|------|
| 06:00–09:30 | Morning Brief |
| 09:30–15:30 | Live Market Pulse |
| 15:30–17:00 | Market Close |
| 17:00–21:00 | Evening Intelligence |
| 21:00–24:00 | What You Missed Today |
| 00:00–06:00 | Global Watch |

**At 9:00 PM:**
- NO popup
- NO modal
- Same panel morphs into summary mode

---

## 6️⃣ CONTENT CATEGORIES (LOCKED)

Each item belongs to exactly one:
- Share Market
- Mutual Funds
- News
- Insurance
- FD / RD / Bonds
- PMS / AIF
- Highest Plans

**Rules:**
- observational
- educational
- SEBI-safe
- no buy/sell
- no guarantees

---

## 7️⃣ HEADLINE FORMAT (MANDATORY)

Every item MUST contain:
1. **WHAT** happened
2. **WHY** it matters

Nothing else.

---

## 8️⃣ ROTATION LOGIC (NOT SCROLLING)

- One primary line visible
- Calm rotation every ~6–8 seconds
- Fade → replace → fade
- Breaking news can temporarily override

❌ No horizontal scrolling  
❌ No ticker animation

---

## 9️⃣ VISUAL IMPLEMENTATION (HULY STYLE)

### Laser / Light Effect
Implemented using:
- `mask-image` / `-webkit-mask-image`
- `radial-gradient(...)`
- CSS variables updated via `mousemove`

Smooth lag using:
- `transition: cubic-bezier(0.16, 1, 0.3, 1)`

### Glow / Bloom Illusion
Stacked layers:
1. Sharp radial gradient (core light)
2. Same gradient with `blur(5px)`
3. Large diffused glow with `blur(64px)` and low opacity

### Fog / Atmosphere
- Large radial gradient
- Very low opacity
- Extreme blur
- Positioned bottom / edges
- Static but present

### HDR Illusion
- `mix-blend-mode: lighten`
- Dark background (`#090A0C` range)
- Bright gradients "blow out" naturally

---

## 🔟 LAYER ORDER (CRITICAL)

From bottom → top:
1. Dark background
2. Fog gradients
3. Laser / mask layer
4. Glow layers
5. Hero video / illustration (lighten blend)
6. Glass UI panel
7. Text / CTA

⚠️ **Changing order breaks realism.**

---

## 1️⃣1️⃣ UI INTERACTION (FRAMER MOTION)

Framer Motion handles ONLY:
- panel expand / collapse
- opacity + scale (0.98 → 1)
- duration ~240–320ms
- NO bounce
- NO spring overshoot

**Laser / glow must NOT be animated by Framer.**

---

## 1️⃣2️⃣ LIVE MOOD PANEL BEHAVIOR

### Collapsed
- Single intelligence line
- "LIVE" indicator
- Calm presence

### Expanded
- 5–7 headlines max
- Categories visible
- No clutter

### Night Mode (9PM+)
- "What You Missed Today"
- Market wrap
- Key developments
- Tomorrow's known events

---

## 1️⃣3️⃣ DATA STRATEGY (HYBRID)

**Sources:**
- RSS (Moneycontrol, ET, Mint, etc.)
- Market APIs
- Admin manual override

**Admin can:**
- add / edit headline
- set urgency
- pin
- expire

No heavy CMS.

---

## 1️⃣4️⃣ ANALYTICS (IMPORTANT)

**Track attention, not clicks.**

**Events:**
- `headline_impression`
- `headline_pause` (visible > threshold)
- `panel_expand`
- `summary_view`
- `whatsapp_cta_view` / `click` (DEFERRED)

**Pause = interest.**

This feeds:
- prioritization
- AI summaries
- admin insight

---

## 1️⃣5️⃣ WHATSAPP OPT-IN (SUBTLE)

DEFERRED (Jan 21, 2026): WhatsApp integration is intentionally paused until API credentials + final flow are provided. Do not treat this section as source-of-truth.

Show ONLY when:
- user expands panel multiple times
- pauses on multiple headlines
- or in 9PM summary mode

**Copy (example):**
> "Get important market updates on WhatsApp. No spam."

**Must be:**
- opt-in
- easy unsubscribe
- capped frequency
- SEBI-safe

---

## 1️⃣6️⃣ AI DAILY SUMMARY (OPTIONAL, CONTROLLED)

**AI may:**
- summarize
- explain "why it mattered"
- structure content

**AI must NOT:**
- predict
- recommend
- rate investments

Admin can approve / edit before publish.

---

## 1️⃣7️⃣ COMPLIANCE (NON-NEGOTIABLE)

**Allowed:**
- public data
- educational explanations
- observational language

**Forbidden:**
- "Buy / Sell"
- "Best"
- "Guaranteed"
- Return promises

**Rename examples:**
- ❌ STRONG BUY → ✅ ACCUMULATION / POSITIVE TREND

---

## 1️⃣8️⃣ ACCEPTANCE CHECKLIST (FINAL)

Ship ONLY if:
- [ ] Visual parity with huly hero achieved
- [ ] Laser follows interaction smoothly
- [ ] Glow feels optical, not fake
- [ ] No scrolling ticker exists
- [ ] LIVE MOOD changes with time automatically
- [ ] 9PM summary replaces feed
- [ ] SEBI-safe language everywhere

---

## 1️⃣9️⃣ INSTRUCTION TO AI (IMPORTANT)

When implementing:
- Follow this document exactly
- Do not invent features
- Do not simplify effects
- Do not replace CSS light with fake animations
- Ask ONLY if something blocks parity

---

## ✅ END OF MASTER HANDOFF DOC

**Status: FROZEN**

---

## 📁 RELATED FILES

| File | Purpose |
|------|---------|
| `app/(public)/live-intelligence-hero/page.jsx` | Current hero component |
| `app/(public)/live-intelligence-hero/HulyHero.module.css` | Hero styles |
| `app/(public)/live-intelligence-hero/LASER_LOOP_FIX_GUIDE.md` | Video loop fix docs |
| `public/videos/laser-beam.mp4` | Seamless loop laser video |
| `docs/LIVE_MOOD_SPECIFICATION.md` | Extended specification |

---

*Frozen: January 11, 2026*
