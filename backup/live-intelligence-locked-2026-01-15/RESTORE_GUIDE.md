# 🔒 LIVE INTELLIGENCE - LOCKED BACKUP (January 15, 2026)

## ⚠️ DO NOT MODIFY THESE FILES WITHOUT READING THIS FIRST

This backup contains the **FINAL, WORKING, TESTED** versions of all Live Intelligence components.

---

## 📁 Files in This Backup

| File | Purpose |
|------|---------|
| `LiveIntelligenceOverlay.jsx` | Main overlay + exported panel component (SOURCE OF TRUTH) |
| `page.jsx` | `/live-intelligence` standalone page route |
| `LaserFooter.jsx` | Ice-blue themed footer for overlay |
| `MarketMoodStrip.jsx` | Live mood strip with AI integration |

---

## 🔥 CRITICAL: PROTECTED CODE SECTIONS

### PDF Modal Handlers (DO NOT TOUCH)
```jsx
// ⚠️ PROTECTED CODE - DO NOT MODIFY ⚠️
// PDF modal handlers - Keep simple! Do NOT manipulate body.overflow or scrollTop
// Any overflow/scroll manipulation causes the page to jump to top
const handlePdfOpen = useCallback((url) => {
  setPdfUrl(url);
  setShowPdfModal(true);
}, []);

// ⚠️ PROTECTED CODE - DO NOT MODIFY ⚠️
const handlePdfClose = useCallback(() => {
  setShowPdfModal(false);
  setPdfUrl(null);
}, []);
```

### Mobile Header CSS (LOCKED)
The header is designed to stack vertically on mobile:
- Row 1: Title
- Row 2: Mode indicator + Streak badge
- Row 3: Subtitle
- Row 4: Navigation tabs (wrap)
- Row 5: Share & Add Goal buttons

**DO NOT** add inline `top` values to sticky buttons - use CSS classes only!

---

## 🔄 HOW TO RESTORE

### Option 1: Full Restore (All Files)
```powershell
cd c:\Users\admin\premium-invest-8
Copy-Item "backup\live-intelligence-locked-2026-01-15\LiveIntelligenceOverlay.jsx" "components\user\" -Force
Copy-Item "backup\live-intelligence-locked-2026-01-15\page.jsx" "app\live-intelligence\" -Force
Copy-Item "backup\live-intelligence-locked-2026-01-15\LaserFooter.jsx" "components\user\" -Force
Copy-Item "backup\live-intelligence-locked-2026-01-15\MarketMoodStrip.jsx" "components\user\" -Force
```

### Option 2: Restore Single File
```powershell
# Restore just the overlay
Copy-Item "backup\live-intelligence-locked-2026-01-15\LiveIntelligenceOverlay.jsx" "components\user\" -Force

# Restore just the page
Copy-Item "backup\live-intelligence-locked-2026-01-15\page.jsx" "app\live-intelligence\" -Force
```

### Option 3: Git Restore (if committed)
```powershell
git checkout HEAD -- components/user/LiveIntelligenceOverlay.jsx
git checkout HEAD -- app/live-intelligence/page.jsx
```

---

## ✅ WHAT WAS FIXED IN THIS VERSION

1. **Mobile Header Cutoff** - Header now stacks vertically on mobile, nothing cut off
2. **PDF Scroll Jump** - PDF opens in viewport without scrolling page to top
3. **Safe Area Insets** - Proper handling of mobile notch/status bar
4. **Vertical Stacking** - All header elements wrap properly on small screens

---

## 🚫 COMMON MISTAKES TO AVOID

1. **NEVER** add `document.body.style.overflow = 'hidden'` in PDF handlers
2. **NEVER** add inline `top: 'Xpx'` to `.li-sticky-back-btn` - CSS handles it
3. **NEVER** remove the `flexWrap: 'wrap'` from navigation tabs
4. **NEVER** change padding values without testing on mobile

---

## 📞 QUICK REFERENCE

- Overlay z-index: `9999`
- PDF modal z-index: `999999`
- Mobile breakpoint: `600px`
- Tablet breakpoint: `900px`
- Panel padding mobile: `50px 12px 60px 12px`

---

**Created: January 15, 2026, 7:50 PM IST**
**Status: LOCKED & WORKING**
