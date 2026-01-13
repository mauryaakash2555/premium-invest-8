# 🔧 LASER BEAM VIDEO SEAMLESS LOOP FIX - COMPLETE GUIDE

> **Last Updated:** January 11, 2026  
> **Status:** ✅ FIXED AND WORKING  
> **Time to Fix:** Follow this guide = 5 minutes  

> **Repo Note (Jan 12, 2026):** The repo currently keeps **only** `public/videos/laser-beam.mp4`. If this guide mentions additional `.mp4/.webm` variants, treat those references as historical.

---

## 📋 TABLE OF CONTENTS

1. [The Problem](#the-problem)
2. [Why It Happens](#why-it-happens)
3. [The Solution](#the-solution)
4. [Step-by-Step Fix](#step-by-step-fix)
5. [Files Involved](#files-involved)
6. [FFmpeg Commands Explained](#ffmpeg-commands-explained)
7. [Troubleshooting](#troubleshooting)
8. [What NOT To Do](#what-not-to-do)
9. [Quick Reference](#quick-reference)

---

## 🚨 THE PROBLEM

When playing a video with `<video loop>` in HTML5, there is a **visible "twitch" or "black flash"** at the exact moment the video loops back to the beginning. This looks like:

- The laser beam briefly disappears (goes black)
- A quick "blink" or "flicker" 
- The video feels like it "restarts" instead of flowing continuously
- Users notice it every ~30 seconds (or whatever the video duration is)

**This is NOT a code bug.** It's a fundamental browser limitation.

---

## 🔬 WHY IT HAPPENS

### Browser Video Loop Behavior

When an HTML5 `<video>` element reaches the end and loops:

1. The browser's video decoder **seeks** back to frame 0
2. This seek operation causes a brief **decode gap**
3. During this gap, the video element may show:
   - A black frame
   - The last frame frozen briefly
   - A visual "jump" as the new first frame appears

### The Real Issue: Mismatched Frames

The **last frame** of most videos does NOT visually match the **first frame**. So even if the decoder was instant, you'd still see a "jump" because:

- Frame 1: Laser beam at position A
- Frame LAST: Laser beam at position B (different!)
- Loop back → sudden jump from B to A = visible twitch

---

## ✅ THE SOLUTION

### Bake a Seamless Loop INTO the Video File

Instead of trying to fix this with JavaScript (which we tried and failed many times), we **pre-process the video file** to have a smooth crossfade baked in:

```
Original Video:
[Frame 1]...[Frame 2]...[Frame 3]......[Frame LAST-1][Frame LAST]
     ↑                                                      ↓
     └──────── VISIBLE JUMP WHEN LOOPING ──────────────────┘

Seamless Video (after processing):
[Blended Start]...[Middle Content]...[Crossfade Zone]
        ↑                                    ↓
        └──── SMOOTH FADE, NO VISIBLE JUMP ──┘
```

The **crossfade zone** at the end smoothly transitions INTO the start frames, so when the browser loops, the visual difference is imperceptible.

---

## 📝 STEP-BY-STEP FIX

### Prerequisites

1. **FFmpeg installed** in `.tools/ffmpeg/bin/` (run `scripts/setup-ffmpeg.ps1` if missing)
2. **Source video** (e.g., `huly_laser.mp4` in Downloads folder)
3. **PowerShell** terminal

### Step 1: Run the Seamless Loop Script

```powershell
pwsh -NoProfile -ExecutionPolicy Bypass -File "C:\Users\admin\premium-invest-8\scripts\make-seamless-xfade-loop.ps1" -InputMp4 "c:\Users\admin\Downloads\huly_laser.mp4" -SegmentStartSeconds 1.5 -SegmentSeconds 28 -CrossfadeSeconds 0.4 -XfadeTransition "fade"
```

**Parameters Explained:**

| Parameter | Value | Meaning |
|-----------|-------|---------|
| `-InputMp4` | Path to source | Your original video file |
| `-SegmentStartSeconds` | `1.5` | Skip first 1.5s (often has black intro) |
| `-SegmentSeconds` | `28` | Take 28 seconds of footage |
| `-CrossfadeSeconds` | `0.4` | 0.4 second crossfade at loop point |
| `-XfadeTransition` | `"fade"` | Use fade transition (best for laser) |

### Step 2: Copy to Fallback Location

```powershell
Copy-Item "C:\Users\admin\premium-invest-8\public\videos\laser-beam.unicorn.mp4" -Destination "C:\Users\admin\premium-invest-8\public\videos\laser-beam.mp4" -Force
```

### Step 3: Bump Version in page.jsx

Open `app/(public)/live-intelligence-hero/page.jsx` and change:

```javascript
const LASER_ASSET_VERSION = "seamless-xfade-fade-2026-01-11";
```

Change the version string to anything new (e.g., add a letter or date) to bust browser cache.

### Step 4: Test in Browser

1. Open http://localhost:3000/live-intelligence-hero
2. Watch for 30+ seconds to see the loop point
3. The loop should now be smooth with no black flash

---

## 📁 FILES INVOLVED

### Video Files

| File | Location | Purpose |
|------|----------|---------|
| `laser-beam.unicorn.mp4` | `public/videos/` | Primary video (seamless loop baked in) |
| `laser-beam.mp4` | `public/videos/` | Fallback copy of above |
| `laser-beam.unicorn.webm` | `public/videos/` | WebM version (optional, can cause issues) |
| `laser-beam.webm` | `public/videos/` | Fallback WebM |

### Code Files

| File | Location | Purpose |
|------|----------|---------|
| `page.jsx` | `app/(public)/live-intelligence-hero/` | React component that renders the video |
| `HulyHero.module.css` | `app/(public)/live-intelligence-hero/` | Styles for the hero section |
| `make-seamless-xfade-loop.ps1` | `scripts/` | FFmpeg script to create seamless loop |

### Page.jsx - Current Working Version

```jsx
"use client";

import { useEffect, useRef } from "react";
import styles from "./HulyHero.module.css";

export default function LiveIntelligenceHeroPage() {
  const LASER_ASSET_VERSION = "seamless-xfade-fade-2026-01-11";
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const p = video.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  }, []);

  return (
    <main className={styles.stage} aria-label="Live Intelligence Hero preview">
      <video
        ref={videoRef}
        className={styles.laserVideo}
        autoPlay
        muted
        playsInline
        loop
        preload="auto"
      >
        <source src={`/videos/laser-beam.unicorn.mp4?v=${LASER_ASSET_VERSION}`} type="video/mp4" />
        <source src={`/videos/laser-beam.mp4?v=${LASER_ASSET_VERSION}`} type="video/mp4" />
      </video>

      <div className={styles.topFade} aria-hidden="true" />
      <div className={styles.bottomFade} aria-hidden="true" />
    </main>
  );
}
```

**Key Points:**
- Simple! No complex JavaScript tricks
- Uses native `loop` attribute
- The seamless loop is in the VIDEO FILE, not in code
- Version string busts browser cache

---

## 🔧 FFMPEG COMMANDS EXPLAINED

### What the Script Does Internally

The `make-seamless-xfade-loop.ps1` script runs FFmpeg with this strategy:

```
1. TRIM: Extract segment from source (skip black intro)
   ffmpeg -ss 1.5 -t 28 -i source.mp4 ...

2. SPLIT: Create two copies of the trimmed video
   [0:v]split[a][b]

3. ROTATE (optional): Shift start point by crossfade duration
   This prevents a "double seam" problem

4. XFADE: Crossfade the end into the start
   [end][start]xfade=transition=fade:duration=0.4

5. CONCAT: Join the pieces back together

6. ENCODE: Output high-quality H.264 MP4
   -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -movflags +faststart
```

### Manual FFmpeg Command (if script fails)

```bash
ffmpeg -y \
  -ss 1.5 -t 28 -i "source.mp4" \
  -filter_complex "[0:v]split[main][end];[end]trim=start=27.6,setpts=PTS-STARTPTS[endtrim];[main]trim=end=27.6,setpts=PTS-STARTPTS[maintrim];[endtrim][0:v]xfade=transition=fade:duration=0.4:offset=0[faded];[maintrim][faded]concat=n=2:v=1:a=0" \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -movflags +faststart \
  "output-seamless.mp4"
```

---

## 🔍 TROUBLESHOOTING

### Problem: Still seeing a twitch

**Causes & Fixes:**

1. **Browser cache** - Add `?v=newversion` to the video URL or hard refresh (Ctrl+Shift+R)
2. **Crossfade too short** - Try `-CrossfadeSeconds 0.6` or `0.8`
3. **Wrong transition** - Use `"fade"` not `"slideleft"` or other transitions
4. **WebM causing issues** - Remove WebM sources, use MP4 only

### Problem: Video doesn't play

**Causes & Fixes:**

1. **File too small** - Check file size is > 10MB for a 28s video
2. **Encoding failed** - Re-run the script, check for FFmpeg errors
3. **Wrong path** - Verify video exists in `public/videos/`

### Problem: Black intro at start

**Causes & Fixes:**

1. **Source has black intro** - Increase `-SegmentStartSeconds` to skip it
2. **Run blackdetect first:**
   ```powershell
   ffmpeg -i source.mp4 -vf "blackdetect=d=0.02:pix_th=0.20" -an -f null - 2>&1 | Select-String "black_start"
   ```
   This tells you where black frames are.

### Problem: Twitch is now a "fade" instead of black flash

**This is expected!** A subtle fade is much less noticeable than a hard cut. If you want it even more invisible:
- Increase crossfade duration to 0.6-0.8 seconds
- Make sure source video's motion is smooth (no sudden cuts)

---

## ❌ WHAT NOT TO DO

### Things We Tried That DIDN'T Work:

1. **JavaScript opacity hiding at loop point**
   - Tried hiding the video for 0.1s at loop → caused a BLACK FLASH (the thing we're trying to fix!)
   
2. **Two-video crossfade in JavaScript**
   - Created Video A and Video B, swap between them
   - Complex, prone to timing bugs, still has visual issues
   
3. **CSS grain/vignette overlays**
   - Tried to "mask" the twitch with visual noise
   - Doesn't actually fix it, just adds visual clutter
   
4. **Seam brightness boost**
   - Tried increasing brightness/contrast at loop point
   - Made it more obvious, not less
   
5. **Using WebM instead of MP4**
   - WebM sometimes has worse loop behavior on Windows Chrome
   - Stick to MP4 for reliability

### The ONLY reliable fix is baking the loop INTO the video file.

---

## 📋 QUICK REFERENCE

### One-Command Fix (Copy-Paste This)

```powershell
# 1. Create seamless loop
pwsh -NoProfile -ExecutionPolicy Bypass -File "C:\Users\admin\premium-invest-8\scripts\make-seamless-xfade-loop.ps1" -InputMp4 "c:\Users\admin\Downloads\huly_laser.mp4" -SegmentStartSeconds 1.5 -SegmentSeconds 28 -CrossfadeSeconds 0.4 -XfadeTransition "fade"

# 2. Copy to fallback
Copy-Item "C:\Users\admin\premium-invest-8\public\videos\laser-beam.unicorn.mp4" -Destination "C:\Users\admin\premium-invest-8\public\videos\laser-beam.mp4" -Force
```

Then update `LASER_ASSET_VERSION` in `page.jsx` to bust cache.

### Recommended Settings

| Setting | Value | Notes |
|---------|-------|-------|
| SegmentStartSeconds | 1.5 | Skip black intro |
| SegmentSeconds | 28 | Use most of 30s source |
| CrossfadeSeconds | 0.4 | Good balance of smooth vs not obvious |
| XfadeTransition | "fade" | Best for laser effects |

### File Size Check

A properly encoded 28-second seamless loop should be:
- **MP4:** ~30-55 MB
- **WebM:** ~25-45 MB

If it's under 5 MB, something went wrong.

---

## 🎯 SUMMARY

**The Problem:** Browser video loop causes a visual "twitch" or "black flash" because the decoder has to seek back to frame 0.

**The Solution:** Use FFmpeg to bake a crossfade into the video file itself, so the last frames smoothly transition into the first frames.

**The Command:**
```powershell
pwsh -File "scripts/make-seamless-xfade-loop.ps1" -InputMp4 "source.mp4" -CrossfadeSeconds 0.4 -XfadeTransition "fade"
```

**The Result:** Smooth, seamless loop with no visible twitch!

---

## 📞 NEED HELP?

If this guide doesn't work:

1. Check FFmpeg is installed: `Test-Path ".tools\ffmpeg\bin\ffmpeg.exe"`
2. Check source video exists and plays
3. Check output file size (should be > 10 MB)
4. Try different crossfade durations (0.3, 0.5, 0.8)
5. Make sure to bust browser cache with version string

---

*This guide was created after 20+ attempts to fix the loop twitch using various JavaScript, CSS, and encoding approaches. The FFmpeg baked-loop method is the ONLY reliable solution.*
