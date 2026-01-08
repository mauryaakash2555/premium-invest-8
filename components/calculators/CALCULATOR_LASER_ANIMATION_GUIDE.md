# 🔥 Calculator LaserBeam Animation - How It Works

## ✨ The Magic

ALL calculators on the Tools page now have the blue laser animation because it's added to the **MASTER TEMPLATE**!

---

## 📁 Where The Animation Lives

| File | What It Does |
|------|--------------|
| `components/LaserBeamCanvas.jsx` | The laser animation component |
| `components/calculators/BaseCalculatorLayout.jsx` | **MASTER TEMPLATE** - all calculators use this! |

---

## 🎯 Why It Works Everywhere

The `BaseCalculatorLayout.jsx` is the master template. ALL calculators use it:
- Tax Calculator
- Property vs SIP
- Lumpsum Planner
- Retirement Gap
- Insurance Value
- Tax Leak Detector

When you add LaserBeam to `BaseCalculatorLayout`, EVERY calculator gets it automatically!

---

## 🔧 How We Added It

### Step 1: Import LaserBeam in BaseCalculatorLayout.jsx
```jsx
import { LaserBeam } from "@/components/LaserBeamCanvas";
```

### Step 2: Wrap the Content
```jsx
<LaserBeam
  width="100%"
  height="auto"
  color="#c0a062"      // Matte gold - matches calculator theme
  borderRadius={12}
  duration={6}          // Calm, slow movement (6 seconds per loop)
  glowIntensity={18}    // Subtle glow
  beamLength={0.10}     // Short, elegant tail
  borderWidth={0}       // No extra border (calculator has its own)
  backgroundColor="transparent"
>
  {/* Calculator content goes here */}
</LaserBeam>
```

---

## 🎨 Customize Per Calculator

You can pass props to any calculator that uses BaseCalculatorLayout:

```jsx
<BaseCalculatorLayout
  laserColor="#60a5fa"    // Blue color instead of gold
  laserEnabled={false}    // Turn off laser for this calculator
>
```

### Available Props:
| Prop | Default | What It Does |
|------|---------|--------------|
| `laserColor` | `"#c0a062"` | Change laser color (hex) - default is matte gold |
| `laserEnabled` | `true` | Enable/disable laser |

---

## 🖌️ Color Matching Guide

The laser uses **Matte Gold (#c0a062)** to match the calculator theme!

This is the same gold used for:
- Input field text
- Slider accents
- Result highlights
- Premium CTA buttons

Other colors you can use:
- Sky Blue (Blog Card): `#60a5fa`
- Electric Blue: `#0ea5e9`
- Green Success: `#00ff88`
- Purple Special: `#a855f7`

---

## 📍 Files Modified

1. **BaseCalculatorLayout.jsx** - Added LaserBeam wrapper
   - Line 4: Added import
   - Lines 14-38: Wrapped content with LaserBeam

---

## ⚠️ Note About height="auto"

Unlike the Blog Card (which has fixed height), calculators use `height="auto"` because their height changes based on content. The laser still works!

---

## 🔙 How to Remove Animation

If you want to turn off laser for a specific calculator:

```jsx
<BaseCalculatorLayout laserEnabled={false}>
  {/* Calculator content */}
</BaseCalculatorLayout>
```

---

## 📋 All Calculators Using This Template

These automatically get the laser animation:
1. `/tools/tax-optimization` - Tax Calculator
2. `/tools/property-vs-sip` - Property vs SIP
3. `/tools/lumpsum-planner` - Lumpsum Planner
4. `/tools/retirement-gap` - Retirement Gap
5. `/tools/insurance-value` - Insurance Value
6. `/tools/tax-leak-detector` - Tax Leak Detector

---

Created: January 8, 2026
Master Template: components/calculators/BaseCalculatorLayout.jsx
