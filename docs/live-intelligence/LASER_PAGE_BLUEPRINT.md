# LASER PAGE - COMPLETE BLUEPRINT

> Last Updated: January 13, 2026
> Status: LOCKED & WORKING

---

## PAGE IDENTITY

| Property | Value |
|----------|-------|
| **Route** | `/live-intelligence-hero` |
| **File** | `app/(public)/live-intelligence-hero/page.jsx` |
| **Purpose** | Full-screen overlay with laser animation + news panel |
| **Trigger** | Opens when user scrolls past LIVE MOOD bar or clicks it |

---

## PAGE STRUCTURE (Top to Bottom)

### LAYER 1: CLOSE BUTTON (FIXED)
```
Position: fixed, top: 20px, right: 20px
Z-index: 10000
Icon: ← (left arrow)
Style: No border, no background
Color: White 50% opacity → 100% on hover
Size: 28px
Action: Navigate to homepage
```

### LAYER 2: LASER SECTION (TOP) — LOCKED
```
Height: 100vh (fullscreen)
Background: #090A0C
Video: /videos/laser-beam.mp4
Object-fit: cover
Object-position: center bottom
Filter: none (NO filters allowed)
Status: LOCKED - DO NOT MODIFY
```

**Visual Description:**
Imagine standing in a dark room. In the center, a vertical beam of pure white light shoots from top to bottom. Around this beam, soft blue and purple glow radiates outward, fading into the darkness. Behind everything, barely visible fog slowly drifts, giving depth. The beam pulses gently, feeling alive.

### LAYER 3: PANEL SECTION (MIDDLE)
```
Background: #090A0C
Position: relative (normal flow, immediately after laser)
Overflow: hidden
Isolation: isolate
```

**Key Elements:**
- Mode indicator badge (shows current time mode)
- Premium vertical laser beams (DataBahn-style)
- Dashboard shell with KPI cards
- Category filter tabs (Phase 3)
- Headline cards (Phase 3)

**Panel Top Connector:**
- Static top fade gradient (180px)
- Premium energy flow effect
- Ensures seamless visual connection to laser

### LAYER 4: FOOTER SECTION (BOTTOM)
```
Component: LaserFooter (ice-blue themed)
Position: normal flow after panel
Z-index: visible (not hidden)
```

---

## Z-INDEX STACK

| Element | Z-Index |
|---------|---------|
| Close button | 10000 |
| Panel content | 2 |
| Laser beams | 1 |
| Panel background | 0 |

---

## KEY FILES

| File | Purpose |
|------|---------|
| `app/(public)/live-intelligence-hero/page.jsx` | Main page component |
| `app/(public)/live-intelligence-hero/components/ModeIndicator.jsx` | Time-based mode badge |
| `components/user/LaserFooter.jsx` | Ice-blue themed footer |
| `lib/live-intelligence/modes.js` | Mode detection logic |
| `public/videos/laser-beam.mp4` | Laser video asset (LOCKED) |

---

## CSS CRITICAL VALUES

### Laser Section (LOCKED)
```css
section[aria-label="Live Intelligence Laser"] {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: #090A0C;
}

video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center bottom;
  pointer-events: none;
  filter: none;
  transform: none;
  opacity: 1;
}
```

### Panel Section
```css
section[aria-label="Live Intelligence Panel"] {
  position: relative;
  width: 100%;
  margin: 0;
  padding: 0;
  background: #090A0C;
  overflow: hidden;
  isolation: isolate;
}
```

### Close Button
```css
.li-close-btn {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 10000;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 28px;
  cursor: pointer;
}
.li-close-btn:hover {
  color: rgba(255, 255, 255, 1);
  transform: translateX(-3px);
}
```

---

## ANIMATION SPECS

### Laser Beams (Panel)
- 7 vertical beams (1 center, 3 left, 3 right)
- Pulse animation: 3.2s - 6.0s duration
- Travel from top to bottom
- Staggered delays for organic feel

### Mode Indicator
- Fade transition on mode change (300ms)
- Live clock updates every 1 second
- Mode check every 60 seconds
- Market status dot pulses when open

---

## RECOVERY CHECKPOINTS

### If laser not visible:
1. Check video src path
2. Verify video file exists in public/videos/
3. Check for CSS overrides hiding video
4. Ensure height: 100vh on section

### If panel not visible:
1. Check section element exists
2. Verify background color (#090A0C)
3. Check for display: none anywhere

### If footer not visible:
1. Check globals.css for `[data-laser-active] footer` rules
2. Ensure LaserFooter component is imported
3. Verify footer is after panel in DOM

### If close button not working:
1. Check router import
2. Verify onClick handler
3. Check z-index (must be 10000)

---

## BACKUP LOCATIONS

| Backup | Location |
|--------|----------|
| Locked laser video | `backup/laser-locked_2026-01-12/laser-beam.mp4` |
| SHA256 hash | `backup/laser-locked_2026-01-12/laser-beam.sha256.txt` |
| Full page backup | `backup/live-intelligence/` |
