# Mutual Funds — Luxury Style Reference (Snapshot)

Date: 2026-01-07

This file stores the **exact color palette + page-scoped CSS** used for the Mutual Funds page at the time the layout was approved.

> Intent: Keep the *style/pattern/structure* intact and allow future work to swap only colors to match brand/service-page palettes.

## Page Palette (Approved Snapshot)

```js
// From app/mutual-funds/page.jsx (snapshot)
const ACCENT = '#8BB7FF';
const ACCENT_RGB = '139, 183, 255';
const TITLE = '#FFFFFF';
const BODY = 'rgba(255,255,255,0.78)';
const MUTED = 'rgba(255,255,255,0.62)';
const BORDER = 'rgba(255,255,255,0.12)';
```

## Page-Scoped CSS (Approved Snapshot)

```css
@keyframes mf-ambient {
  0%, 100% { transform: translate3d(0,0,0) scale(1); opacity: .75; }
  50% { transform: translate3d(0,-10px,0) scale(1.03); opacity: 1; }
}
@keyframes mf-sheen {
  0% { transform: translateX(-120%); }
  100% { transform: translateX(120%); }
}
.mf-shell { background: #05070D; color: #FFFFFF; min-height: 100vh; }
.mf-card {
  position: relative;
  overflow: hidden;
  border-radius: 18px;
  border: 1px solid rgba(255,255,255,0.12);
  background: rgba(255,255,255,0.035);
  backdrop-filter: blur(14px);
  box-shadow: 0 22px 70px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06);
  transition: transform .35s ease, border-color .35s ease, box-shadow .35s ease;
}
.mf-card:hover {
  transform: translateY(-4px);
  border-color: rgba(139, 183, 255, .35);
  box-shadow: 0 28px 80px rgba(0,0,0,0.55), 0 0 48px rgba(139, 183, 255, .14), inset 0 1px 0 rgba(255,255,255,0.08);
}
.mf-card::before {
  content: '';
  position: absolute;
  inset: -2px;
  pointer-events: none;
  background:
    radial-gradient(900px 240px at 10% 0%, rgba(139, 183, 255, .10), transparent 60%),
    radial-gradient(760px 240px at 90% 100%, rgba(255,255,255,.06), transparent 60%);
  opacity: .9;
}
.mf-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  border-radius: 999px;
  border: 1px solid rgba(139, 183, 255, .22);
  background: rgba(139, 183, 255, .06);
  color: rgba(255,255,255,.78);
  box-shadow: 0 10px 40px rgba(139, 183, 255, .08);
}
.mf-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: rgba(139, 183, 255, .95);
  box-shadow: 0 0 18px rgba(139, 183, 255, .55);
}
.mf-cta {
  position: relative;
  overflow: hidden;
  transition: transform .25s ease, border-color .25s ease, box-shadow .25s ease;
}
.mf-cta::after {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events:none;
  opacity: 0;
  background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
  transform: translateX(-120%);
}
.mf-cta:hover {
  transform: translateY(-2px);
  border-color: rgba(139, 183, 255, .35) !important;
  box-shadow: 0 14px 40px rgba(139, 183, 255, .18);
}
.mf-cta:hover::after { opacity: 1; animation: mf-sheen 1.1s ease; }
.mf-kpi {
  display:flex;
  flex-direction: column;
  gap: 6px;
  padding: 16px;
  border-radius: 16px;
  border: 1px solid rgba(255,255,255,0.10);
  background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
}
```
