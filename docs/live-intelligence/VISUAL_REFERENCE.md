# VISUAL REFERENCE

> Visual descriptions and screenshots for Live Intelligence page
> Last Updated: January 13, 2026

---

## PAGE OVERVIEW

The Live Intelligence page is a full-screen immersive experience with three main sections:

```
┌─────────────────────────────────────────────────────────────┐
│  [←]                                    CLOSE BUTTON        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                                                             │
│                    ████  LASER  ████                        │
│                    ████ SECTION ████                        │
│                    ████ (100vh) ████                        │
│                                                             │
│             Pure white/blue laser beam                      │
│             with soft glow radiating outward                │
│             Dark background (#090A0C)                       │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Live Intelligence  [☀️ Morning Briefing | 9:45 AM]  │   │
│  │ Your financial command center...                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│  │ Total   │ │ Current │ │  XIRR   │ │  Risk   │           │
│  │Invested │ │  Value  │ │         │ │  Score  │           │
│  │ ₹24.8L  │ │ ₹28.3L  │ │ 14.2%   │ │Moderate │           │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘           │
│                                                             │
│            PANEL SECTION (Dashboard)                        │
│                                                             │
│   Vertical laser beams flow down through panel              │
│   Premium glass cards with subtle glow                      │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    FOOTER SECTION                           │
│               (Ice-blue LaserFooter)                        │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## SECTION 1: LASER

### Visual Description
- **Background**: Pure black (#090A0C)
- **Beam**: Vertical white/ice-blue laser shooting from top to bottom
- **Glow**: Soft blue/purple radiance around the beam
- **Animation**: Gentle pulsing, feels alive
- **Feel**: Like standing in a dark room with a powerful spotlight

### Key Visual Properties
- No filters, no overlays, no masks
- Video covers entire viewport
- Bottom glow never cropped
- Crystal clear, high contrast

---

## SECTION 2: MODE INDICATOR

### Visual Description
A pill-shaped badge showing current market mode:

```
┌──────────────────────────────────────────────────────────┐
│  ☀️  │ Morning Briefing │ 9:45 AM IST │ ● CLOSED        │
└──────────────────────────────────────────────────────────┘
      │                   │              │        │
   Icon              Mode Label       Time    Market Status
```

### Mode Colors
| Mode | Accent Color | Icon |
|------|-------------|------|
| Morning Briefing | Blue | ☀️ |
| Live Market Pulse | Green | 📡 |
| Market Close | Gold | 📊 |
| Evening Intelligence | Purple | 🌆 |
| Night Summary | Dark Blue | 🌙 |
| Global Watch | Gray | 🌏 |

### Market Status
- **LIVE** (green pulsing dot): Market is open (9:15 AM - 3:30 PM IST, weekdays)
- **CLOSED** (red dim dot): Market is closed

---

## SECTION 3: PANEL

### Visual Description
- **Background**: Matches laser (#090A0C)
- **Connection**: Seamless transition from laser with gradient fade
- **Laser Beams**: 7 vertical beams flowing downward (premium DataBahn style)
- **Cards**: Glass-morphic with subtle blue glow on hover

### KPI Cards Layout
```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│ TOTAL       │ │ CURRENT     │ │ XIRR        │ │ RISK SCORE  │
│ INVESTED    │ │ VALUE       │ │             │ │             │
│             │ │             │ │             │ │             │
│  ₹ 24.8L    │ │  ₹ 28.3L    │ │   14.2%     │ │  Moderate   │
│             │ │             │ │             │ │             │
│ Across MF + │ │ +₹3.5L      │ │ Last 12     │ │ Aligned to  │
│ PMS + FD    │ │ unrealized  │ │ months      │ │ goals       │
└─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘
```

---

## SECTION 4: CLOSE BUTTON

### Visual Description
- **Position**: Fixed, top-right corner
- **Icon**: ← (left arrow)
- **Style**: Minimal, no background, no border
- **Color**: White at 50% opacity
- **Hover**: White at 100% opacity, slides left slightly

---

## SECTION 5: FOOTER

### Visual Description
- Same structure as homepage footer
- Ice-blue theme instead of gold
- Links, disclaimers, copyright
- Visible and scrollable

---

## COLOR PALETTE

### Primary Colors
| Name | Hex | Usage |
|------|-----|-------|
| Background | #090A0C | Page background |
| Laser White | #FFFFFF | Laser core |
| Ice Blue | rgba(170, 198, 255, 1) | Accents, glows |
| Text Primary | rgba(235, 242, 255, 0.96) | Headings |
| Text Secondary | rgba(200, 215, 240, 0.65) | Descriptions |

### Mode Accent Colors
| Mode | Color |
|------|-------|
| Morning | rgba(100, 180, 255, 1) |
| Live | rgba(80, 220, 120, 1) |
| Close | rgba(212, 175, 100, 1) |
| Evening | rgba(180, 120, 220, 1) |
| Night | rgba(100, 140, 220, 1) |
| Global | rgba(140, 150, 170, 1) |

---

## RESPONSIVE BREAKPOINTS

### Desktop (>1024px)
- Full layout with all features
- KPI cards in 4-column grid

### Tablet (768-1024px)
- KPI cards in 2-column grid
- Mode indicator slightly smaller

### Mobile (<768px)
- KPI cards stack vertically
- Mode indicator compact
- Close button same position
