# 🔥 LaserBeam Animation - Complete Guide

## What is it?
A **blue glowing laser** that moves around the border of any card/box. It looks like a sci-fi beam tracing the edges!

---

## 📁 Files You Need

| File | Location | What it does |
|------|----------|--------------|
| `LaserBeamCanvas.jsx` | `components/LaserBeamCanvas.jsx` | The animation magic |
| `BlogCard.jsx` | `components/user/BlogCard.jsx` | Example: Blog card using laser |

---

## 🚀 How to Add Laser Animation to ANY Component

### Step 1: Import the LaserBeam
At the TOP of your file, add this line:

```jsx
import { LaserBeam } from '@/components/LaserBeamCanvas';
```

### Step 2: Wrap Your Content
Wrap the thing you want the laser around:

```jsx
<LaserBeam
  width="100%"
  height="400px"
  color="#60a5fa"
  borderRadius={16}
  duration={3.5}
  glowIntensity={28}
  beamLength={0.15}
  borderWidth={1}
  backgroundColor="transparent"
>
  {/* YOUR CONTENT GOES HERE */}
  <div>Hello World!</div>
</LaserBeam>
```

### Step 3: Done! ✅
The laser will now trace around the border!

---

## 🎨 Customize the Laser

| Property | What it does | Example |
|----------|--------------|---------|
| `color` | Laser color (hex) | `"#60a5fa"` (blue), `"#00ff88"` (green) |
| `duration` | How fast it moves (seconds) | `3.5` = 3.5 seconds per loop |
| `glowIntensity` | How bright the glow | `28` = nice glow |
| `beamLength` | How long the tail (0-1) | `0.15` = 15% of border |
| `borderRadius` | Corner roundness | `16` = rounded corners |
| `borderWidth` | Border thickness | `1` = thin, `2` = thicker |

---

## 🎯 Color Ideas

| Name | Hex Code | Use For |
|------|----------|---------|
| Sky Blue | `#60a5fa` | Blog card, calculators |
| Electric Blue | `#0ea5e9` | Buttons, CTAs |
| Gold | `#d4af37` | Premium features |
| Green | `#00ff88` | Success, finance |
| Purple | `#a855f7` | Special features |

---

## 📋 Full Working Example

```jsx
'use client';

import { LaserBeam } from '@/components/LaserBeamCanvas';

export default function MyCard() {
  return (
    <LaserBeam
      width="100%"
      height="300px"
      color="#60a5fa"       // Blue color
      borderRadius={12}      // Rounded corners
      duration={3.5}         // 3.5 seconds per loop
      glowIntensity={28}     // Nice glow
      beamLength={0.15}      // 15% tail length
      borderWidth={1}        // Thin border
      backgroundColor="transparent"
    >
      <div style={{ 
        padding: '20px', 
        background: '#0a0a0a',
        height: '100%',
        borderRadius: '12px'
      }}>
        <h2>My Amazing Card</h2>
        <p>Content goes here!</p>
      </div>
    </LaserBeam>
  );
}
```

---

## ⚠️ Important Notes

1. **Use `'use client'`** at top of file (required for animations)
2. **Set height** - The laser needs a defined height to work
3. **Match borderRadius** - Make inner content same radius as LaserBeam
4. **Dark background** - Laser looks best on dark backgrounds

---

## 🔧 Troubleshooting

| Problem | Solution |
|---------|----------|
| Laser not visible | Check if height is set (not `auto`) |
| Laser cut off | Add `overflow: visible` to parent |
| Animation choppy | Lower `glowIntensity` to 20 |
| Wrong color | Use hex format: `"#60a5fa"` not `"blue"` |

---

## 📍 Where We Used It

1. **Home Blog Card** - `components/user/BlogCard.jsx` (homeMutualStyle variant)
2. **Tax Calculator** - (coming soon)
3. **Master Calculator Template** - (coming soon)

---

Created: January 8, 2026
Animation from: V0 (Huly.io style)
