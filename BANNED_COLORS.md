# 🚫🚫🚫 BANNED COLORS - READ BEFORE ANY STYLING 🚫🚫🚫

## ⛔ ABSOLUTE BAN - ZERO TOLERANCE ⛔

**THIS IS NOT A SUGGESTION. THIS IS A HARD RULE.**

The following colors are **PERMANENTLY BANNED** from this project.
Any AI or developer who uses these will cause immediate user frustration.

---

## 🔴 BANNED COLOR LIST (NEVER USE THESE)

### Category 1: MUDDY YELLOWS/BROWNS (WORST OFFENDERS)
```
❌ bg-yellow-*       (ALL yellow Tailwind classes)
❌ bg-amber-*        (ALL amber Tailwind classes)  
❌ bg-orange-*       (ALL orange Tailwind classes)
❌ text-yellow-*     (ALL yellow text classes)
❌ text-amber-*      (ALL amber text classes)
❌ border-yellow-*   (ALL yellow border classes)
❌ yellow-300, yellow-400, yellow-500, yellow-600, yellow-700, yellow-800, yellow-900
❌ amber-300, amber-400, amber-500, amber-600, amber-700, amber-800, amber-900
```

### Category 2: GREENS (ALSO BANNED)
```
❌ bg-green-*        (ALL green Tailwind classes)
❌ text-green-*      (ALL green text classes)
❌ border-green-*    (ALL green border classes)
❌ green-300, green-400, green-500, green-600, green-700, green-800, green-900
❌ emerald-*         (ALL emerald classes)
❌ lime-*            (ALL lime classes)
❌ teal-*            (ALL teal classes)
```

### Category 3: REDS (ALSO BANNED)
```
❌ bg-red-*          (ALL red Tailwind classes)
❌ text-red-*        (ALL red text classes)
❌ border-red-*      (ALL red border classes)
❌ red-300, red-400, red-500, red-600, red-700, red-800, red-900
❌ rose-*            (ALL rose classes)
```

### Category 4: SPECIFIC HEX CODES (BANNED FOREVER)
```
❌ #DAA520  (goldenrod - MUDDY)
❌ #C0A062  (tan - MUDDY)
❌ #C6A15B  (bronze - MUDDY)  
❌ #B8860B  (dark goldenrod - MUDDY)
❌ #FFD700  (gold - TOO BRIGHT)
❌ #FFA500  (orange - BANNED)
❌ #FFFF00  (yellow - BANNED)
❌ #808000  (olive - MUDDY)
❌ #6B8E23  (olive drab - MUDDY)
❌ #9ACD32  (yellow green - MUDDY)
❌ #ADFF2F  (green yellow - BANNED)
```

---

## ✅ ONLY ALLOWED COLORS

Use ONLY the LUX theme CSS variables defined in globals.css:

```css
/* THESE ARE THE ONLY COLORS YOU CAN USE */

--lux-background: oklch(0.06 0.005 280)     /* Near black */
--lux-foreground: oklch(0.95 0.01 85)       /* Off-white/cream */
--lux-card: oklch(0.10 0.005 280)           /* Dark card bg */
--lux-muted: oklch(0.55 0.01 85)            /* Muted text */
--lux-accent: oklch(0.78 0.08 65)           /* Subtle gold accent */
```

### In Tailwind/JSX use:
```jsx
// ✅ CORRECT - Use CSS variables
className="bg-[color:var(--lux-background)]"
className="text-[color:var(--lux-foreground)]"
className="border-[color:var(--lux-accent)]"
className="text-[color:var(--lux-foreground-60)]"
className="bg-[color:var(--lux-foreground-10)]"

// ❌ WRONG - Never use raw Tailwind colors
className="bg-yellow-500"      // BANNED
className="text-green-400"     // BANNED  
className="bg-amber-900/20"    // BANNED
className="border-red-500"     // BANNED
```

---

## 🎯 VALID OPACITY VARIANTS

If you need transparency, use these LUX variables:
```
var(--lux-foreground-80)  = 80% opacity of foreground
var(--lux-foreground-60)  = 60% opacity of foreground
var(--lux-foreground-40)  = 40% opacity of foreground
var(--lux-foreground-10)  = 10% opacity of foreground
var(--lux-foreground-05)  = 5% opacity of foreground
```

---

## ⚠️ FOR CONFIDENCE INDICATORS

If you need to show confidence levels, success/warning/error states, etc:

```jsx
// ✅ CORRECT: Use opacity variations of LUX colors
// High confidence / Success:
'bg-[color:var(--lux-foreground)]/10 border-[color:var(--lux-accent)]/50'

// Medium confidence / Warning:
'bg-[color:var(--lux-foreground-10)] border-[color:var(--lux-foreground-40)]'

// Low confidence / Needs attention:
'bg-[color:var(--lux-foreground-05)] border-[color:var(--lux-foreground-40)]'

// ❌ WRONG: Never use semantic Tailwind colors
'bg-green-900/20'   // BANNED
'bg-yellow-900/20'  // BANNED  
'bg-red-900/20'     // BANNED
'text-green-400'    // BANNED
'text-yellow-300'   // BANNED
```

---

## 📢 MESSAGE TO AIs

**READ THIS CAREFULLY:**

1. The owner of this project HATES muddy yellow/brown/green colors
2. Using these colors causes extreme frustration
3. This has happened multiple times and must NEVER happen again
4. If you're about to use `green-*`, `yellow-*`, `amber-*`, `red-*` - STOP
5. Use ONLY the `--lux-*` CSS variables
6. When in doubt, use grayscale with `--lux-foreground` opacity variants

**BEFORE ANY STYLE CHANGE, ASK YOURSELF:**
- Am I using a raw Tailwind color? → DON'T
- Am I using green/yellow/red/amber? → DON'T  
- Am I using a --lux-* variable? → GOOD, PROCEED

---

## 🔒 ENFORCEMENT

This file exists in the root of the project.
All AIs MUST read this file before making ANY style changes.
Violations will require immediate reverting of changes.

---

**Last Updated:** February 11, 2026
**Reason:** User expressed extreme frustration about muddy colors being used repeatedly
**Enforced by:** Project owner mandate
