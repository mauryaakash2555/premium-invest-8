# 🎨 AI DESIGN RULES - NEXT.JS LUXURY EDITION

**FOR ALL AIs, DEVELOPERS & TEAMS WORKING ON THIS PROJECT**

---

## �🚫🚫 BANNED COLORS - MANDATORY READING 🚫🚫🚫

**⛔ BEFORE ANY STYLING, READ: `BANNED_COLORS.md` ⛔**

**NEVER USE THESE TAILWIND CLASSES:**
```
❌ bg-green-*, text-green-*, border-green-*
❌ bg-yellow-*, text-yellow-*, border-yellow-*
❌ bg-amber-*, text-amber-*, border-amber-*
❌ bg-red-*, text-red-*, border-red-*
❌ bg-orange-*, text-orange-*, border-orange-*
```

**ONLY USE LUX CSS VARIABLES:**
```
✅ bg-[color:var(--lux-background)]
✅ text-[color:var(--lux-foreground)]
✅ border-[color:var(--lux-accent)]
✅ text-[color:var(--lux-foreground-60)]
✅ bg-[color:var(--lux-foreground-10)]
```

**The project owner HATES muddy yellow/brown/green colors. This has caused extreme frustration multiple times. ZERO TOLERANCE.**

---

## �📌 THE GOLDEN RULE

### ✅ DO THIS:
- **Isolation:** Each new page or complex section should be treated as an isolated unit.
- **CSS Modules:** Use `[name].module.css` for page-specific or component-specific styles to prevent global leakage.
- **v0.dev Integration:** Keep v0.dev logic clean. Use Tailwind classes directly in the JSX as much as possible.
- **Utility First:** Use the `cn()` utility (`lib/utils.js`) for all conditional classes.
- **Global Safety:** ONLY core brand colors, typography, and the Tailwind configuration should be in `globals.css`.

### ❌ DON'T DO THIS:
- **No Global Clutter:** Do not add styles for specific pages (like "Platforms" or "About") into `globals.css`.
- **No !important Overuse:** Only use `!important` as a last resort for library overrides.
- **No Direct Style Tags:** Avoid massive inline `style={{...}}` blocks in JSX; move them to Tailwind or CSS Modules.

---

## 📂 FOLDER STRUCTURE (NEXT.JS APP ROUTER)

```
/
├── app/
│   ├── globals.css          ← Core Tailwind, Brand Fonts, Base Animations
│   ├── layout.js            ← Root layout, Global Components (Nav, Footer, Dock)
│   ├── (pages)/             ← Each folder here is a route
│   │   ├── platforms/
│   │   │   ├── page.jsx
│   │   │   └── platforms.module.css  ← PAGE-SPECIFIC STYLES
│   │   └── blog/
│   │       ├── page.js
│   │       └── blog.module.css
│   └── api/                 ← Backend routes
│
├── components/              ← Reusable UI Components
│   ├── ui/                  ← Shadcn/UI primitives
│   ├── luxury/              ← Custom high-end components
│   │   ├── Navigation.jsx
│   │   └── LuxuryMobileDock.jsx
│   └── common/              ← Shared components
│
├── lib/                     ← Utilities
│   └── utils.js             ← cn() function
│
└── public/                  ← High-res assets (logo.webp, etc.)
```

---

## 🎯 FILE NAMING CONVENTION

| File Type | Format | Example | Purpose |
|-----------|--------|---------|---------|
| **Page Styles** | `[name].module.css` | `about.module.css` | Scoped styles for a route |
| **Component Styles** | `[Name].module.css` | `Card.module.css` | Scoped styles for a component |
| **Global Config** | `globals.css` | `globals.css` | Tailwind directives & brand variables |

---

## 🚀 HOW TO ADD A NEW V0.DEV COMPONENT

### **STEP 1: Create the Component**
If it's a new page, create `app/[route]/page.jsx`. If it's a section, put it in `components/`.

### **STEP 2: Use CSS Modules for v0 Overrides**
If v0.dev provides complex CSS that Tailwind can't easily do:
```javascript
import styles from './page.module.css';
import { cn } from '@/lib/utils';

export default function NewPage() {
  return (
    <div className={cn(styles.container, "bg-black text-white")}>
      <h1 className="text-gold">Tailwind + Module CSS</h1>
    </div>
  );
}
```

---

## 🎨 BRAND STANDARDS

- **CRITICAL COLOR LOCK (READ FIRST):**
  - ✅ Use ONLY: `var(--lux-accent)` (defined in `app/globals.css` as `oklch(0.78 0.08 65)`)
  - ❌ NEVER use muddy browns/tans/bronze shades.
  - ❌ NEVER introduce alternate golds (examples forbidden: `#DAA520`, `#C0A062`, `#C6A15B`, `#B8860B`).
  - If you need depth, use neutrals + `color-mix(in oklab, var(--lux-accent) …, transparent)`.

### Automated Guardrails (MANDATORY)

- Run `npm run lint:palette` before shipping.
- If legacy files still contain forbidden colors, run `npm run fix:palette` (then re-run `npm run lint:palette`).
- Exceptions (do not edit per current product constraints):
  - `components/user/LuxuryMobileDock.jsx`
  - `frontend/src/components/LuxuryMobileDock.js`
  - `lib/live-intelligence/modes.js`
- **Luxury Glass:** `rgba(255, 255, 255, 0.03)` with `backdrop-filter: blur(20px)`
- **Fonts:** `Playfair Display` for headings, `Inter` for body.

---

## 📌 INSTRUCTIONS FOR FUTURE AIs (CRITICAL)

1. **READ THIS FIRST:** Do not change `globals.css` unless updating the brand palette.
2. **ISOLATE:** If you are adding a feature, keep your CSS in a `.module.css` file.
3. **CHECK NAV:** Do not break the `Navigation` or `LuxuryMobileDock` logic.
4. **NO REVERTS:** If something breaks, fix the specific conflict—do not revert the entire project to a broken state.

---

## ✅ CHECKLIST BEFORE COMMITTING
- [ ] No new global CSS rules added for local UI.
- [ ] `cn()` utility used for all dynamic classes.
- [ ] Mobile view tested (especially `LuxuryMobileDock` and `WhatsAppFloat`).
- [ ] No corrupted characters in any file.


