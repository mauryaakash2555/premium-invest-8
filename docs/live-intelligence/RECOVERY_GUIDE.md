# LASER PAGE RECOVERY GUIDE

> Emergency procedures to restore the Live Intelligence page if anything breaks

---

## QUICK DIAGNOSTICS

### 1. Page Won't Load At All
```
Check: Browser console for errors
Check: Next.js terminal for build errors
Check: File exists at app/(public)/live-intelligence-hero/page.jsx
Fix: Copy from COMPONENT_CODES.md backup
```

### 2. Laser Video Not Playing
```
Check: /public/videos/laser-beam.mp4 exists
Check: Video src path is correct
Check: No CSS filter/opacity hiding it
Check: autoPlay, muted, playsInline attributes present
Fix: Restore from backup/laser-locked_2026-01-12/
```

### 3. Panel Not Visible
```
Check: Section element renders in DOM
Check: Background is #090A0C (not transparent)
Check: No height: 0 or display: none
Fix: Copy panel section from COMPONENT_CODES.md
```

### 4. Footer Not Showing
```
Check: app/globals.css for data-laser-active rules
Check: LaserFooter import in page.jsx
Check: Footer is AFTER panel in JSX order
Fix: Ensure footer visibility rules exist in globals.css
```

### 5. Close Button Not Working
```
Check: useRouter imported from next/navigation
Check: onClick={handleClose} on button
Check: z-index: 10000 in styles
Fix: Copy close button code from COMPONENT_CODES.md
```

### 6. Mode Indicator Missing
```
Check: ModeIndicator component exists
Check: Import path is correct
Check: modes.js exists in lib/live-intelligence/
Fix: Copy from COMPONENT_CODES.md
```

---

## NUCLEAR RESET PROCEDURE

If nothing works, follow these steps in order:

### Step 1: Backup Current State
```powershell
mkdir backup/emergency-$(Get-Date -Format "yyyy-MM-dd-HHmm")
cp app/(public)/live-intelligence-hero/page.jsx backup/emergency-*/
cp lib/live-intelligence/modes.js backup/emergency-*/
```

### Step 2: Delete Broken Files
```powershell
rm app/(public)/live-intelligence-hero/page.jsx
rm app/(public)/live-intelligence-hero/components/*.jsx
rm lib/live-intelligence/*.js
```

### Step 3: Recreate From Backups
Copy all code from `docs/live-intelligence/COMPONENT_CODES.md` to recreate:
1. `page.jsx`
2. `ModeIndicator.jsx`
3. `modes.js`

### Step 4: Restore Laser Video
```powershell
cp backup/laser-locked_2026-01-12/laser-beam.mp4 public/videos/
```

### Step 5: Verify Hash
```powershell
Get-FileHash public/videos/laser-beam.mp4 -Algorithm SHA256
# Compare with backup/laser-locked_2026-01-12/laser-beam.sha256.txt
```

### Step 6: Clear Cache & Restart
```powershell
rm -rf .next
npm run dev
```

---

## FILE DEPENDENCIES

```
page.jsx
├── imports: useEffect, useRouter (next/navigation)
├── imports: LaserFooter (@/components/user/LaserFooter)
├── imports: ModeIndicator (./components/ModeIndicator)
└── requires: /videos/laser-beam.mp4

ModeIndicator.jsx
├── imports: useState, useEffect (react)
└── imports: getCurrentModeConfig, getISTTime, isMarketOpen (@/lib/live-intelligence/modes)

modes.js
└── exports: MODES, getCurrentMode, getCurrentModeConfig, getISTTime, getTimeUntilNextMode, isMarketOpen
```

---

## COMMON CSS ISSUES

### Issue: Gap between laser and panel
```
Cause: margin or padding on panel section
Fix: Ensure margin: 0, padding: 0 on panel section
```

### Issue: Laser cropped or stretched
```
Cause: Wrong object-fit or height
Fix: object-fit: cover, height: 100vh
```

### Issue: Panel overlapping laser
```
Cause: Negative margin or absolute positioning
Fix: Use normal flow (position: relative), no negative margins
```

### Issue: Footer hidden by dock styles
```
Cause: globals.css hiding footer on laser pages
Fix: Add visibility override in globals.css for [data-laser-active]
```

---

## CONTACT FOR HELP

If this guide doesn't resolve the issue:
1. Check git history: `git log --oneline app/(public)/live-intelligence-hero/`
2. Revert to last working commit: `git checkout <commit-hash> -- app/(public)/live-intelligence-hero/`
3. Check locked backups in `backup/laser-locked_*/`
