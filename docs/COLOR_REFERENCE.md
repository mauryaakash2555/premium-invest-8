# 🎨 COLOR REFERENCE - LIVE INTELLIGENCE & OVERLAY

> ⚠️ **CRITICAL FOR ALL AIs**: This document defines the OFFICIAL color palette for Live Intelligence components.
> DO NOT use gold/brown/orange colors in these components.

## 🔵 LIVE INTELLIGENCE THEME: LASER BLUE

The Live Intelligence page and Overlay use a **LASER BLUE** theme - cold, premium, tech-forward.

### Primary Colors

| Name | Value | Usage |
|------|-------|-------|
| **Primary Blue** | `rgba(100, 160, 255, 1)` | Main accent, active states |
| **Primary Blue Dim** | `rgba(100, 160, 255, 0.12)` | Badge backgrounds, subtle fills |
| **Secondary Blue** | `rgba(140, 190, 255, 0.95)` | Badge text, secondary highlights |
| **Accent Glow** | `rgba(100, 180, 255, 0.25)` | Glows, shadows |

### Text Colors

| Name | Value | Usage |
|------|-------|-------|
| **Text Primary** | `rgba(245, 248, 255, 0.94)` | Main headings, important text |
| **Text Secondary** | `rgba(235, 242, 255, 0.94)` | Card titles |
| **Text Muted** | `rgba(200, 215, 240, 0.55)` | Descriptions, labels |
| **Text Subtle** | `rgba(200, 215, 240, 0.45)` | Placeholder text |

### Status Colors

| Name | Value | Usage |
|------|-------|-------|
| **Success/Positive** | `rgba(140, 220, 180, 0.90)` | Green for gains, good status |
| **Warning** | `rgba(255, 180, 140, 0.90)` | Orange-ish for losses, warnings |
| **Live Indicator** | `rgba(100, 220, 150, 1)` | Green dot when data is live |

### Background Colors

| Name | Value | Usage |
|------|-------|-------|
| **Card Background** | `rgba(20, 25, 35, 0.95)` | Card containers |
| **Overlay Background** | `rgba(8, 12, 20, 0.98)` | Main overlay backdrop |
| **Surface** | `rgba(100, 160, 255, 0.04)` | Subtle card fills |
| **Border** | `rgba(100, 160, 255, 0.10)` | Subtle borders |
| **Border Active** | `rgba(100, 160, 255, 0.25)` | Active state borders |

### Badge Styles

**Standard Badge (e.g., "COMING SOON", "NEW", counts)**
```jsx
{
  background: 'rgba(100, 160, 255, 0.12)',
  color: 'rgba(140, 190, 255, 0.95)',
  border: 'none',
  padding: '3px 10px',
  borderRadius: '8px',
  fontSize: '10px',
  fontWeight: 600,
  letterSpacing: '0.05em',
}
```

**Success Badge (e.g., "GOOD", "COMPLETED")**
```jsx
{
  background: 'rgba(140, 220, 180, 0.12)',
  color: 'rgba(140, 220, 180, 0.90)',
}
```

---

## ❌ FORBIDDEN COLORS

**DO NOT USE THESE IN LIVE INTELLIGENCE / OVERLAY:**

| Forbidden | Why |
|-----------|-----|
| `rgba(255, 200, 100, *)` | Gold/amber - not part of laser blue theme |
| `rgba(212, 175, 55, *)` | Premium gold - use only on main website pages |
| `rgba(255, 215, 0, *)` | Bright gold |
| `#d4af37`, `#c9a227` | Gold hex variants |
| `rgba(180, 140, 80, *)` | Brown/tan tones |

---

## 📍 WHERE THIS APPLIES

These colors apply to:
- `components/user/LiveIntelligenceOverlay.jsx`
- `components/user/MarketMoodStrip.jsx`
- `components/live-intelligence/*.jsx` (all files)
- `app/(public)/live-intelligence/page.jsx`

---

## 📍 WHERE GOLD IS ALLOWED

Gold/premium colors are allowed on:
- Main website pages (`/`, `/services`, `/about`, etc.)
- CTAs and buttons on marketing pages
- NOT in Live Intelligence components

---

## 🔄 OVERLAY BEHAVIOR

**Session-based auto-open:**
- Overlay triggers ONCE per browser session when user scrolls past "Live Mood" bar
- Uses `sessionStorage` with key `li-overlay-auto-opened`
- DO NOT clear this flag on page refresh
- Flag only clears when browser/tab is closed

---

Last Updated: January 17, 2026
