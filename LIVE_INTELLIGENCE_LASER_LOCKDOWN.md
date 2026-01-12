# 🔒 LIVE INTELLIGENCE LASER SYSTEM — PERMANENT LOCKDOWN

> **Created:** January 11, 2026  
> **Status:** ✅ WORKING — DO NOT TOUCH  
> **Reading Time:** 10 minutes  
> **Audience:** Any developer, any AI, any 10-year-old

> **Repo Note (Jan 12, 2026):** To simplify deployment/testing, the repository currently keeps **only** `public/videos/laser-beam.mp4`. Other laser video variants/backups mentioned later may have been deleted.

---

## 📖 WHAT IS THIS DOCUMENT?

This document explains **EVERYTHING** about the laser video system on the BM Wealth website.

If you follow this document, you will:
- ✅ Understand how the laser works
- ✅ Know what you can NEVER change
- ✅ Be able to rebuild it from zero if needed
- ✅ Fix any problem without breaking anything

**Read this BEFORE touching ANY laser code.**

---

## 🎯 SIMPLE EXPLANATION (FOR A 10-YEAR-OLD)

Imagine you have a **cool glowing laser video** that plays on the website.

The laser video is like a **poster on your wall**:
- It goes **behind everything** (fullscreen background)
- It stays **perfectly still** (fixed position)
- Other things (like buttons or text) go **in front of it**

The video must:
- Cover the **entire screen** (no gaps)
- Show the **bottom glow** (the cool curvy part at the bottom)
- Play forever **without blinking or jumping**

That's it. That's the whole system.

---

## 🏗️ HIGH-LEVEL ARCHITECTURE

### The System Has 3 Parts:

```
┌─────────────────────────────────────────────────────────┐
│  PART 1: THE VIDEO FILE                                 │
│  Location: public/videos/laser-beam.mp4                 │
│  What: A special video with a "baked-in" seamless loop  │
│  Made with: Unicorn Studio → FFmpeg processing          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  PART 2: THE REACT COMPONENT                            │
│  Location: app/(public)/live-intelligence-hero/page.jsx │
│  What: Plays the video in a <video> tag                 │
│  Simple: Just autoplay, muted, loop                     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│  PART 3: THE CSS STYLES                                 │
│  Location: LaserOverlay.module.css                      │
│  What: Makes video fullscreen, positions layers         │
│  Critical: position: fixed, 100vw × 100vh               │
└─────────────────────────────────────────────────────────┘
```

---

## 🎬 THE VIDEO SOURCE (UNICORN STUDIO)

### Where the Laser Comes From

| Property | Value |
|----------|-------|
| **Source** | Unicorn Studio (online tool) |
| **Original File** | `SOURCE-BM-LASER.mp4` |
| **Duration** | ~30 seconds raw |
| **Resolution** | 1920×1080 (1080p) |
| **Frame Rate** | 30fps or 60fps (both work) |
| **Codec** | H.264 (MP4 container) |

### Export Settings That Work

When exporting from Unicorn Studio:
- ✅ Format: MP4
- ✅ Codec: H.264
- ✅ Resolution: 1920×1080
- ✅ Frame rate: 30fps (60fps optional)
- ✅ Quality: High/Max
- ❌ DO NOT use: WebM as primary (can cause issues)
- ❌ DO NOT use: VP9 codec
- ❌ DO NOT use: HEVC/H.265 (browser support issues)

### Why the Video Needs Processing

Raw export from Unicorn Studio has a problem: when the video loops, there's a **visible "twitch"** or **black flash**.

This happens because:
1. The browser's video player **jumps** from last frame to first frame
2. The last frame doesn't match the first frame
3. You see an ugly blink every 30 seconds

**Solution:** We use FFmpeg to "bake" a crossfade into the video, so the end smoothly blends into the start.

### The FFmpeg Processing Command

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File "scripts/make-seamless-xfade-loop.ps1" `
  -InputMp4 "path/to/source.mp4" `
  -SegmentStartSeconds 1.5 `
  -SegmentSeconds 28 `
  -CrossfadeSeconds 0.4 `
  -XfadeTransition "fade"
```

This creates: `public/videos/laser-beam.unicorn.mp4`

Then copy to fallback: 
```powershell
Copy-Item "public/videos/laser-beam.unicorn.mp4" "public/videos/laser-beam.mp4" -Force
```

---

## 📁 FILE LOCATIONS (MEMORIZE THESE)

### Video Files

| File | Path | Purpose |
|------|------|---------|
| `laser-beam.mp4` | `public/videos/` | **PRIMARY** — Used in production |
| `laser-beam.unicorn.mp4` | `public/videos/` | Processed seamless loop |
| `SOURCE-BM-LASER.mp4` | `public/videos/` | Original Unicorn export (backup) |

### Code Files

| File | Path | Purpose |
|------|------|---------|
| `page.jsx` | `app/(public)/live-intelligence-hero/` | The React component |
| `LaserOverlay.module.css` | `app/(public)/live-intelligence-hero/` | All the styles |
| `layout.js` | `app/(public)/live-intelligence-hero/` | Simple wrapper layout |

### Scripts

| File | Path | Purpose |
|------|------|---------|
| `make-seamless-xfade-loop.ps1` | `scripts/` | Creates seamless video |
| `import-unicorn-laser.ps1` | `scripts/` | Imports new Unicorn exports |

---

## 🔴 ABSOLUTE RULES (NEVER BREAK THESE)

### Rule 1: The Video is ALWAYS Fixed Fullscreen

```css
/* CORRECT ✅ */
.laserVideo {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
}
```

**NEVER** put the video inside a container with:
- `overflow: hidden`
- `height: 50vh` or any partial height
- `position: relative` (it must be `fixed`)

### Rule 2: Bottom Glow Must ALWAYS Be Visible

```css
/* CORRECT ✅ */
.laserVideo {
  object-fit: cover;
  object-position: center bottom;  /* ← THIS LINE IS CRITICAL */
}
```

This ensures the **bottom curve and glow** of the laser is always visible, even on wide desktop screens.

### Rule 3: NO Filters, Transforms, or Blend Modes on the Video

```css
/* FORBIDDEN ❌ */
.laserVideo {
  filter: blur(5px);           /* NO! */
  transform: scale(1.1);       /* NO! */
  mix-blend-mode: screen;      /* NO! */
  clip-path: polygon(...);     /* NO! */
  -webkit-mask: ...;           /* NO! */
}
```

**Why?** These cause:
- Severe lag on desktop (CSS compositing hell)
- GPU memory spikes
- 60fps → 15fps performance drop
- Visual artifacts

### Rule 4: The Panel is SEPARATE from the Laser

```
CORRECT ✅ (Think in layers):

[ LAYER 1: Fixed fullscreen laser video ]  ← Always visible
[ LAYER 2: Dark backdrop gradient ]        ← Atmosphere
[ LAYER 3: Panel from top (20-30vh) ]      ← Content overlay

WRONG ❌ (Never do this):

[ Panel container ]
    └── [ Laser video inside panel ]  ← NEVER!
```

The laser is a **background layer**. Panels go **on top** of it, not containing it.

### Rule 5: Z-Index Order is Sacred

| Element | Z-Index | Purpose |
|---------|---------|---------|
| `darkBackdrop` | 5000 | Black/gradient background |
| `fogLayer` | 5010 | Atmospheric glow (optional) |
| `panelContainer` | 5015 | Content panels |
| `laserStage` | 5020 | The video container |
| `closeButton` | 5030 | Always clickable |

**NEVER change these z-index values.**

---

## 🐛 PERFORMANCE ISSUES WE ENCOUNTERED (AND FIXED)

### Issue 1: Desktop Lag / Choppy Video

**Symptom:** Video plays at 15fps instead of 30fps on desktop Chrome.

**Cause:** We had `filter`, `transform`, or `mix-blend-mode` on the video or its parent.

**Fix:** Remove ALL of these properties:
```css
/* REMOVE THESE */
filter: brightness(1.1);
transform: translateZ(0);
mix-blend-mode: screen;
backdrop-filter: blur(20px);
```

**Why it happens:** These CSS properties force the browser to create separate GPU layers and composite them every frame. A 1080p video already uses significant GPU bandwidth — adding filters multiplies the work.

### Issue 2: Video Loop "Twitch" / Black Flash

**Symptom:** Every 30 seconds, the video "blinks" or shows a black frame when looping.

**Cause:** Browser video decoder has to seek back to frame 0. During this seek, there's a decode gap.

**Fix:** Bake a crossfade INTO the video file using FFmpeg. The last 0.4 seconds of the video now smoothly blend into the first 0.4 seconds. When the browser loops, the visual difference is imperceptible.

**NOT a fix:** JavaScript tricks, CSS overlays, two-video swapping — we tried all of these and they failed.

### Issue 3: Bottom of Laser Cut Off on Desktop

**Symptom:** On wide desktop monitors, the bottom glow/curve of the laser is cropped.

**Cause:** `object-fit: cover` scales the video to fill the container, cropping top AND bottom equally.

**Fix:** Add `object-position: center bottom` — this anchors the video to the bottom, so any cropping happens at the top instead.

### Issue 4: Video Not Playing on Mobile

**Symptom:** Video shows first frame but doesn't play on iOS Safari.

**Cause:** iOS requires `playsinline` and `muted` attributes, plus user interaction.

**Fix:** Always include these attributes:
```jsx
<video
  autoPlay
  muted
  playsInline    /* ← Required for iOS */
  loop
  preload="auto"
>
```

---

## 📱 DESKTOP VS MOBILE DIFFERENCES

### Desktop Behavior
- Video fills entire viewport (100vw × 100vh)
- On wide screens (21:9 ultrawide), video cropped at **top** (bottom glow preserved)
- Panel can be 25-30vh tall
- Performance depends on GPU — disable filters!

### Mobile Behavior
- Same 100vw × 100vh
- Viewport is taller/narrower, so video fits better naturally
- Panel takes more vertical space (35-40vh)
- `playsinline` required for iOS
- `100vh` on mobile includes/excludes browser chrome depending on browser

### Why Mobile "Just Works"
Mobile viewports are closer to 16:9 (the video's aspect ratio). Desktop monitors are often wider (21:9, 32:9), so more cropping is needed. The `object-position: center bottom` rule ensures the important part (bottom glow) is never cropped.

---

## 🎨 LAYER ARCHITECTURE (VISUAL)

```
┌──────────────────────────────────────────────────────────┐
│                                                          │
│    ┌──────────────────────────────────────────────┐     │
│    │          CLOSE BUTTON (z: 5030)              │     │
│    │                    ✕                          │     │
│    └──────────────────────────────────────────────┘     │
│                                                          │
│    ┌──────────────────────────────────────────────┐     │
│    │                                              │     │
│    │         LASER VIDEO (z: 5020)                │     │
│    │                                              │     │
│    │              ████████████                    │     │
│    │            ██            ██                  │     │
│    │          ██                ██                │     │
│    │        ██     (laser)        ██              │     │
│    │      ██                        ██            │     │
│    │    ██████████████████████████████            │     │
│    │         (bottom glow visible)                │     │
│    └──────────────────────────────────────────────┘     │
│                                                          │
│    ┌──────────────────────────────────────────────┐     │
│    │         PANEL CONTAINER (z: 5015)            │     │
│    │    ┌────────────────────────────────────┐    │     │
│    │    │     Content goes here              │    │     │
│    │    │     (glass panel effect)           │    │     │
│    │    └────────────────────────────────────┘    │     │
│    └──────────────────────────────────────────────┘     │
│                                                          │
│    ┌──────────────────────────────────────────────┐     │
│    │         FOG LAYER (z: 5010)                  │     │
│    │         (subtle radial gradients)            │     │
│    └──────────────────────────────────────────────┘     │
│                                                          │
│    ┌──────────────────────────────────────────────┐     │
│    │         DARK BACKDROP (z: 5000)              │     │
│    │         (covers homepage completely)         │     │
│    └──────────────────────────────────────────────┘     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

## ✅ DEBUG CHECKLIST (WHEN SOMETHING BREAKS)

### Video Not Playing?
- [ ] Check `public/videos/laser-beam.mp4` exists and is > 10MB
- [ ] Check browser console for 404 errors
- [ ] Verify `autoPlay`, `muted`, `playsInline` attributes exist
- [ ] Try hard refresh (Ctrl+Shift+R)
- [ ] Update `LASER_ASSET_VERSION` in page.jsx to bust cache

### Video Lagging / Choppy?
- [ ] Remove ALL `filter`, `transform`, `mix-blend-mode` from video CSS
- [ ] Remove `backdrop-filter` from any parent elements
- [ ] Check if browser extensions are interfering
- [ ] Try incognito mode

### Loop Twitching / Black Flash?
- [ ] Video file wasn't processed with FFmpeg crossfade
- [ ] Re-run `make-seamless-xfade-loop.ps1` script
- [ ] Increase `-CrossfadeSeconds` to 0.5 or 0.6
- [ ] Copy processed file to `laser-beam.mp4`
- [ ] Bust cache with new version string

### Bottom of Laser Cut Off?
- [ ] Check `object-position: center bottom` exists in CSS
- [ ] Check no parent has `overflow: hidden`
- [ ] Check `height: 100vh` is set (not 80vh or similar)

### Video Has Black Intro?
- [ ] Increase `-SegmentStartSeconds` when processing (try 2.0 or 2.5)
- [ ] Check source video for where actual content starts

---

## 🔨 REBUILD FROM SCRATCH (COMPLETE STEPS)

If everything is broken and you need to start over:

### Step 1: Get the Source Video

Find `SOURCE-BM-LASER.mp4` in `public/videos/` (this is the raw Unicorn Studio export).

If missing, re-export from Unicorn Studio:
- 1920×1080, 30fps, H.264 MP4, High Quality

### Step 2: Process with FFmpeg

```powershell
# Make sure FFmpeg is installed
.\.tools\ffmpeg\bin\ffmpeg.exe -version

# If not installed, run:
pwsh scripts/setup-ffmpeg.ps1

# Process the video
pwsh -NoProfile -ExecutionPolicy Bypass -File "scripts/make-seamless-xfade-loop.ps1" `
  -InputMp4 "public/videos/SOURCE-BM-LASER.mp4" `
  -SegmentStartSeconds 1.5 `
  -SegmentSeconds 28 `
  -CrossfadeSeconds 0.4 `
  -XfadeTransition "fade"

# Copy to primary location
Copy-Item "public/videos/laser-beam.unicorn.mp4" "public/videos/laser-beam.mp4" -Force
```

### Step 3: Create the React Component

Create `app/(public)/live-intelligence-hero/page.jsx`:

```jsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import styles from './LaserOverlay.module.css';

const LASER_ASSET_VERSION = "rebuild-2026-01-11";

export default function LiveIntelligenceHeroPage() {
  const videoRef = useRef(null);
  const [overlayActive, setOverlayActive] = useState(false);

  useEffect(() => {
    if (overlayActive && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [overlayActive]);

  return (
    <>
      <button onClick={() => setOverlayActive(true)}>ACTIVATE</button>

      <AnimatePresence>
        {overlayActive && (
          <>
            <motion.div
              className={styles.darkBackdrop}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            <motion.div
              className={styles.laserStage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <video
                ref={videoRef}
                className={styles.laserVideo}
                autoPlay
                muted
                playsInline
                loop
                preload="auto"
              >
                <source src={`/videos/laser-beam.mp4?v=${LASER_ASSET_VERSION}`} type="video/mp4" />
              </video>
            </motion.div>

            <button onClick={() => setOverlayActive(false)}>✕</button>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
```

### Step 4: Create the CSS

Create `app/(public)/live-intelligence-hero/LaserOverlay.module.css`:

```css
.darkBackdrop {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 5000;
  background: #08090B;
}

.laserStage {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 5020;
  pointer-events: none;
  overflow: visible;
}

.laserVideo {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  object-fit: cover;
  object-position: center bottom;
  /* NO filter, NO transform, NO mix-blend-mode */
}
```

### Step 5: Test

1. Run `npm run dev`
2. Go to `http://localhost:3000/live-intelligence-hero?debug=1`
3. Click ACTIVATE
4. Watch for 30+ seconds — loop should be smooth
5. Check bottom glow is visible
6. Check no lag/choppiness

---

## 🚫 THINGS THAT WILL BREAK THE SYSTEM

| Action | Result | Never Do This |
|--------|--------|---------------|
| Add `filter: blur()` to video | Desktop drops to 15fps | ❌ |
| Add `transform: scale()` to video | GPU memory spike | ❌ |
| Add `mix-blend-mode` to video | Visual artifacts | ❌ |
| Put video inside panel container | Bottom gets cut off | ❌ |
| Remove `object-position: center bottom` | Bottom glow cropped | ❌ |
| Use WebM as primary source | Loop issues on Windows | ❌ |
| Skip FFmpeg processing | Loop twitch every 30s | ❌ |
| Change z-index values | Layers overlap wrong | ❌ |
| Add `overflow: hidden` to laserStage | Video cropped | ❌ |
| Remove `playsInline` | Won't play on iOS | ❌ |

---

## 📞 QUICK REFERENCE CARD

### The 5 Critical CSS Properties

```css
.laserVideo {
  position: fixed;              /* 1. Escape all containers */
  width: 100vw;                 /* 2. Full viewport width */
  height: 100vh;                /* 3. Full viewport height */
  object-fit: cover;            /* 4. Fill without distortion */
  object-position: center bottom; /* 5. Keep bottom visible */
}
```

### The 3 Critical Video Attributes

```jsx
<video
  autoPlay    /* Start immediately */
  muted       /* Required for autoplay */
  playsInline /* Required for iOS */
  loop        /* Repeat forever */
>
```

### The 1 Critical FFmpeg Parameter

```
-CrossfadeSeconds 0.4   /* Seamless loop baked in */
```

---

## 🎯 FINAL VISUAL GOAL (ONE SENTENCE)

> **"On any screen size, you should ALWAYS see the bottom glow and curve of the laser, playing smoothly forever without any visible loop jump."**

If that sentence is true when you test → the system is working.

---

## 📋 SIGN-OFF CHECKLIST

Before declaring "laser is done", verify ALL of these:

- [ ] Video plays immediately on page load
- [ ] No black flash at loop point (watch for 60 seconds)
- [ ] Bottom glow/curve visible on desktop
- [ ] No lag/choppiness on desktop
- [ ] Works on mobile (iOS Safari, Android Chrome)
- [ ] No CSS filters/transforms on video element
- [ ] Z-index order is correct (laser above backdrop, below close button)
- [ ] Panel (if any) does NOT contain the video

---

**This document is the FINAL AUTHORITY on the laser system.**

**Any changes require updating this document FIRST.**

**DO NOT TOUCH THE WORKING CODE.**

---

*Document created: January 11, 2026*  
*Last verified working: January 11, 2026*  
*Author: BM Wealth Development Team*
