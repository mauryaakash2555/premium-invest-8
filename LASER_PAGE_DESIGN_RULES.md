# 🚨 LASER PAGE DESIGN RULES - CRITICAL

## ABSOLUTE RULE: Laser Page UI is UNIQUE

The Live Intelligence Hero page (`/live-intelligence-hero`) has a **COMPLETELY DIFFERENT** design system from all other pages on the site. 

### ❌ NEVER DO THIS:
- Copy styles from home page to laser page
- Use gold/amber/brown colors on laser page
- Apply warm tones anywhere on laser page
- Use the same CTA styles as other pages
- Make laser page look like any other page

### ✅ ALWAYS DO THIS:
- Use ICY, COOL color palette (blues, whites, cool grays)
- NSE CLOSED badge: `rgba(120, 150, 200)` - icy blue-gray, NOT brown/amber
- NSE OPEN badge: `rgba(100, 220, 180)` - cool teal green
- Backgrounds: `#131722` (TradingView dark) or pure black `#000`
- Accents: `rgba(170, 198, 255)` - icy blue
- Text: Cool whites and blue-tinted grays
- Borders: `rgba(100, 180, 255, 0.15)` - subtle blue glow

---

## COLOR PALETTE COMPARISON

### Laser Page (Live Intelligence Hero)
```css
--li-panel-accent: rgba(170, 198, 255, 0.70);      /* Icy blue */
--li-panel-accent-strong: rgba(170, 198, 255, 0.82);
--li-panel-title: rgba(235, 242, 255, 0.94);       /* Cool white */
--li-panel-body: rgba(220, 230, 255, 0.70);        /* Blue-tinted gray */
--li-panel-muted: rgba(220, 230, 255, 0.62);
--li-panel-border: rgba(170, 198, 255, 0.22);
```

### Other Pages (Home, Services, etc.)
```css
--color-matte-gold: #C0A062;                       /* Warm gold */
--color-gold-glow: rgba(218, 165, 32, 0.3);        /* Golden glow */
--color-luxury-black: #0a0a0a;
/* Uses warm amber, gold, and brown accents */
```

---

## SPECIFIC ELEMENT RULES

### Badges/Status Indicators
| State | Laser Page Color | Other Pages |
|-------|-----------------|-------------|
| OPEN/Active | `rgba(100, 220, 180)` teal | Gold/Green |
| CLOSED/Inactive | `rgba(120, 150, 200)` icy blue | ❌ Never brown/amber |
| Error | `rgba(255, 120, 120)` cool red | Standard red |

### CTAs/Buttons
- Laser page: Glass/transparent with icy blue borders
- Other pages: Premium gold gradient with shimmer animation

### Backgrounds
- Laser page: `#131722` or `#000000` (pure dark)
- Other pages: Can use slightly warmer blacks

---

## CHECKLIST BEFORE EDITING LASER PAGE

Before making ANY change to `/live-intelligence-hero`:

1. ☐ Is this color cool/icy? (Not warm/amber/gold)
2. ☐ Does it match the panel palette above?
3. ☐ Is the badge color icy blue-gray? (NOT brown)
4. ☐ Are backgrounds pure dark (#131722 or #000)?
5. ☐ Do borders have blue tint, not gold?

---

## WHY THIS MATTERS

The laser page represents our "AI Intelligence" brand - futuristic, cool, technical.
The other pages represent our "Premium Wealth" brand - warm, luxurious, gold.

**MIXING THESE DESTROYS THE BRAND IDENTITY.**

---

## FILE REFERENCES

- Main page: `app/(public)/live-intelligence-hero/page.jsx`
- Laser footer: `components/user/LaserFooter.jsx`
- CSS overrides: `app/globals.css` (search for `data-laser-active`)

---

Last Updated: January 13, 2026
