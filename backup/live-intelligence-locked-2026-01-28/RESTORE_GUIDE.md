# 🔒 LIVE INTELLIGENCE — LOCKED BACKUP (January 28, 2026)

This folder is a **safe copy** of the Live Intelligence overlay pieces that must not break.

Think of it like a **spare key**.

---

## ✅ What’s inside (files)

| File | Where it belongs | What it is |
|---|---|---|
| `LiveIntelligenceOverlay.jsx` | `components/user/` | Main overlay UI (source of truth) |
| `page.jsx` | `app/live-intelligence/` | Standalone Live Intelligence page |
| `LaserFooter.jsx` | `components/user/` | The icy-blue footer used in overlay pages |
| `MarketMoodStrip.jsx` | `components/user/` | Mood strip UI |
| `AskIntelligencePanel.tsx` | `components/live-intelligence/` | “Ask Intelligence” explainer module |

---

## 🧯 If something breaks: restore in 30 seconds

### Restore everything (recommended)

```powershell
cd c:\Users\admin\premium-invest-8

Copy-Item "backup\live-intelligence-locked-2026-01-28\LiveIntelligenceOverlay.jsx" "components\user\" -Force
Copy-Item "backup\live-intelligence-locked-2026-01-28\page.jsx" "app\live-intelligence\" -Force
Copy-Item "backup\live-intelligence-locked-2026-01-28\LaserFooter.jsx" "components\user\" -Force
Copy-Item "backup\live-intelligence-locked-2026-01-28\MarketMoodStrip.jsx" "components\user\" -Force
Copy-Item "backup\live-intelligence-locked-2026-01-28\AskIntelligencePanel.tsx" "components\live-intelligence\" -Force
```

### Restore only one file

```powershell
# Example: restore just the overlay
Copy-Item "backup\live-intelligence-locked-2026-01-28\LiveIntelligenceOverlay.jsx" "components\user\" -Force
```

---

## 🧠 Kid-simple picture: how restore works

```text
Something breaks
     |
     v
Copy files from backup folder
     |
     v
Run the website again
     |
     v
Fixed ✅
```

---

## ✅ Current status

- Created: January 28, 2026
- Status: LOCKED & WORKING
