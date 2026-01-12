# Laser / Live Intelligence Overlay — Lockdown & Recovery Report (2026-01-12)

This document explains, in simple terms, how the **Live Intelligence full-page overlay** works, what files control it, and exactly how to recover if something breaks.

It is written so that anyone can *read and understand* it. **Do not edit the locked files** unless the project owner explicitly says to unlock them.

---

## 1) What you see (the feature)

On the homepage (`/`), there are two things near the bottom of the hero:

1) **LIVE MOOD bar** (scrolling text)
2) **Market Ticker bar**

When you interact with them (or scroll past LIVE MOOD), the app opens a **full-screen Live Intelligence overlay** that contains:

- **Top:** LOCKED laser video (no buttons, no overlays)
- **Middle:** Live Intelligence dashboard panel (donut, KPIs, etc.)
- **Bottom:** The site footer, but recolored to match the laser/panel theme

---

## 2) The strict rules (do not break)

These rules were explicitly required:

- The **laser video is LOCKED**.
  - No buttons placed on top of it.
  - No masks, filters, overlays, or UI on that video.

- LIVE MOOD and Market Ticker are **not redesigned**.
  - Only click behavior is added.

- The special **laser footer theme must only apply in the laser/overlay context**, not globally.

---

## 3) How the overlay opens

There are 2 ways:

### A) Auto-open on scroll (once per session)
- When you scroll down and the **LIVE MOOD** bar leaves the viewport (you scrolled past it), the overlay opens.
- This is controlled by an `IntersectionObserver` watching the LIVE MOOD element.
- It triggers only once “per session” using `sessionStorage`.

Important detail:
- `sessionStorage` normally **survives refresh**.
- To ensure “auto-open after refresh” works (as requested), we clear the `sessionStorage` flag on `beforeunload`.

### B) Manual open (click)
- Clicking the LIVE MOOD scrolling area calls `window.__openLiveIntelligence()`.
- Clicking the Market Ticker bar also calls `window.__openLiveIntelligence()`.
- If the function doesn’t exist (overlay not mounted), these components fall back to navigation (`/live-intelligence-hero`).

---

## 4) How the overlay closes

Two ways:

1) Close arrow (in the dashboard panel header)
   - The arrow is NOT on the laser video.

2) Auto-close when footer is ~75% visible
   - The overlay watches its own footer using another `IntersectionObserver`.
   - When it becomes sufficiently visible, the overlay closes.

There is also:
- ESC key closes the overlay.

---

## 5) The “laser context switch” (why the footer changes)

When the overlay opens, it sets a body attribute:

- `document.body.setAttribute('data-laser-active', 'true')`

When the overlay closes, it removes it.

The file [app/globals.css](app/globals.css) contains a large block of CSS gated by:

- `body[data-laser-active="true"] ...`

That CSS:
- hides normal site chrome (header/nav) while laser overlay is active
- recolors the footer accents (while keeping animations)
- keeps the footer visible

### Important: portal footer vs normal footer
Because the overlay renders its footer inside a portal (attached to `document.body`), it is **not** the same DOM location as `.main-wrapper > footer`.

So we updated the CSS selectors to target both:

- `.main-wrapper > footer` (normal pages)
- `.li-footer-wrapper footer` (portal footer inside overlay)

This is how the footer theme matches **exactly** inside the overlay.

---

## 6) Donut behavior (numbers must change the donut)

Inside the dashboard panel there are editable percentage values:

- Equity
- Debt
- Gold
- Cash

The donut uses a **computed `conic-gradient(...)`** based on those values.

So:
- when numbers change → donut segment angles change immediately

---

## 7) Vault “diamond shine” rule

The Vault icon is used across the site.

Requirement:
- The “diamond shine” animation must **ONLY appear in laser context**, not on other pages.

Solution:
- We removed the shine CSS from the Footer component.
- We added shine CSS in [app/globals.css](app/globals.css) gated by:
  - `body[data-laser-active="true"] ... .vault-diamond`

So the icon is unchanged everywhere else.

---

## 8) Files that control this feature (source of truth)

### Core overlay
- [components/user/LiveIntelligenceOverlay.jsx](components/user/LiveIntelligenceOverlay.jsx)
  - The portal overlay
  - Auto-open logic
  - Close logic
  - Sets/removes `data-laser-active`
  - Contains the dashboard panel and donut

### Homepage wiring
- [app/(public)/page.jsx](app/(public)/page.jsx)
  - Provides `liveMoodRef` (ref to LIVE MOOD bar)
  - Mounts the overlay
  - Passes `<Footer />` into the overlay

### Manual triggers
- [components/user/MarketMoodStrip.jsx](components/user/MarketMoodStrip.jsx)
  - Clicking the scrolling text opens the overlay

- [core/marketTicker/MarketTicker.jsx](core/marketTicker/MarketTicker.jsx)
  - Clicking the ticker opens the overlay

### Footer theme (laser-only)
- [app/globals.css](app/globals.css)
  - The `body[data-laser-active="true"]` scoped footer theme
  - Portal footer support via `.li-footer-wrapper footer`
  - Vault diamond shine scoped to laser context only

### Footer component
- [components/user/Footer.jsx](components/user/Footer.jsx)
  - The actual footer markup
  - Contains the Vault icon wrapper element `span.vault-diamond`

---

## 9) Backup (how to recover)

A backup snapshot was created in:

- `backup/laser-overlay-lockdown-2026-01-12/`

It contains copies of:
- `LiveIntelligenceOverlay.jsx`
- `globals.css`
- `page.jsx`
- `MarketMoodStrip.jsx`
- `MarketTicker.jsx`
- `Footer.jsx`

### A) Restore everything (fast recovery)
Run in PowerShell from the repo root:

```powershell
$root = "C:\Users\admin\premium-invest-8"
$src  = Join-Path $root "backup\laser-overlay-lockdown-2026-01-12"
Copy-Item -Force (Join-Path $src "LiveIntelligenceOverlay.jsx") (Join-Path $root "components\user\LiveIntelligenceOverlay.jsx")
Copy-Item -Force (Join-Path $src "globals.css") (Join-Path $root "app\globals.css")
Copy-Item -Force (Join-Path $src "page.jsx") (Join-Path $root "app\(public)\page.jsx")
Copy-Item -Force (Join-Path $src "MarketMoodStrip.jsx") (Join-Path $root "components\user\MarketMoodStrip.jsx")
Copy-Item -Force (Join-Path $src "MarketTicker.jsx") (Join-Path $root "core\marketTicker\MarketTicker.jsx")
Copy-Item -Force (Join-Path $src "Footer.jsx") (Join-Path $root "components\user\Footer.jsx")
```

### B) Restore only one file
Example:

```powershell
Copy-Item -Force "backup\laser-overlay-lockdown-2026-01-12\LiveIntelligenceOverlay.jsx" "components\user\LiveIntelligenceOverlay.jsx"
```

---

## 10) Lockdown (read-only files)

The owner requested these files be **read-only** (Windows attribute) until explicitly unlocked:

- `components/user/LiveIntelligenceOverlay.jsx`
- `app/globals.css`
- `app/(public)/page.jsx`
- `components/user/MarketMoodStrip.jsx`
- `core/marketTicker/MarketTicker.jsx`
- `components/user/Footer.jsx`

### How to unlock (ONLY if owner says)

```powershell
attrib -R "components\user\LiveIntelligenceOverlay.jsx"
attrib -R "app\globals.css"
attrib -R "app\(public)\page.jsx"
attrib -R "components\user\MarketMoodStrip.jsx"
attrib -R "core\marketTicker\MarketTicker.jsx"
attrib -R "components\user\Footer.jsx"
```

### How to lock again

```powershell
attrib +R "components\user\LiveIntelligenceOverlay.jsx"
attrib +R "app\globals.css"
attrib +R "app\(public)\page.jsx"
attrib +R "components\user\MarketMoodStrip.jsx"
attrib +R "core\marketTicker\MarketTicker.jsx"
attrib +R "components\user\Footer.jsx"
```

---

## 11) Quick troubleshooting guide

### Problem: Auto-open doesn’t trigger
Checklist:
1) Confirm you are on the homepage `/`.
2) Scroll down until LIVE MOOD is out of view.
3) If it still doesn’t open:
   - Ensure the overlay is mounted in [app/(public)/page.jsx](app/(public)/page.jsx)
   - Ensure the LIVE MOOD wrapper actually has `ref={liveMoodRef}`
   - Ensure no JS error stops `IntersectionObserver`

### Problem: Footer theme doesn’t match the laser version
Checklist:
1) When overlay is open, inspect `<body>` and confirm it contains `data-laser-active="true"`.
2) Confirm the footer inside overlay is rendered inside `.li-footer-wrapper`.
3) Confirm [app/globals.css](app/globals.css) includes selectors targeting `.li-footer-wrapper footer`.

### Problem: Donut doesn’t change when numbers change
Checklist:
1) Ensure donut element has `style={{ background: donutGradient }}`.
2) Ensure `donutGradient` is computed from `allocations`.

---

## 12) What to never do

- Never place the close arrow on the laser video section.
- Never add overlays/filters/masks on the laser video.
- Never move the laser-only footer theme out of `body[data-laser-active="true"]`.
- Never apply Vault shine globally.

---

End of report.
