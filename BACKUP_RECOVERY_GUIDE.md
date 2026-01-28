# 🔒 BACKUP & RECOVERY GUIDE
## Created: January 6, 2026

---

## ✅ Current Lock (January 28, 2026)

### Live Intelligence locked folder (fast restore)

- Folder: `backup/live-intelligence-locked-2026-01-28/`
- Restore steps: see `backup/live-intelligence-locked-2026-01-28/RESTORE_GUIDE.md`

### Full website zip snapshot (clean backup)

- Script: `.tools/backup-site.ps1`
- Output: `backup/site-snapshots/<timestamp>_<name>/repo.zip`


---

## 🛡️ MULTIPLE LAYERS OF PROTECTION

Your codebase has **5 independent backup layers**. If anything goes wrong, you can recover.

---

## 1️⃣ GIT TAG (Locked Production Build)

**Tag Name:** `LOCKED_GOOD_BUILD_2026-01-06`  
**Commit:** `cbff0d3` (Property vs SIP copy update)  
**Location:** Local + GitHub

### To restore:
```powershell
git checkout LOCKED_GOOD_BUILD_2026-01-06
# or create a branch from it:
git checkout -b recovery-from-tag LOCKED_GOOD_BUILD_2026-01-06
```

---

## 2️⃣ BACKUP BRANCH (All Local Changes Preserved)

**Branch:** `backup/pre-cleanup-2026-01-06`  
**Commit:** `7ebd690`  
**Location:** Local + GitHub (`origin/backup/pre-cleanup-2026-01-06`)

### To restore all deleted/modified files:
```powershell
git checkout backup/pre-cleanup-2026-01-06
# or cherry-pick specific files:
git checkout backup/pre-cleanup-2026-01-06 -- path/to/specific/file.jsx
```

---

## 3️⃣ DELETED FILES FOLDER

**Location:** `C:\Users\admin\BACKUPS_premium-invest-8\DELETED_FILES\`  
**Contents:** 210+ files that were deleted from your working tree

### To recover a specific file:
```powershell
# Example: recover PropertyVsSipCalculator.jsx
Copy-Item "C:\Users\admin\BACKUPS_premium-invest-8\DELETED_FILES\components\calculators\PropertyVsSipCalculator.jsx" `
          "C:\Users\admin\premium-invest-8\components\calculators\"
```

### File categories recovered:
- `app/tools/*` - Calculator pages
- `app/api/*` - API routes (razorpay, email, pdf, etc.)
- `components/calculators/*` - All calculator components
- `components/shared/*` - Shared UI components
- `lib/*` - Utility libraries (pdf, email templates, etc.)
- `scripts/*` - Development scripts

---

## 4️⃣ GIT STASH

**Check available stashes:**
```powershell
git stash list
```

**Key stash:** `BACKUP_2026-01-06_all_local_changes_before_cleanup`

### To recover:
```powershell
git stash apply stash@{0}
# or pop (apply + remove from stash list):
git stash pop stash@{0}
```

---

## 5️⃣ GITHUB REMOTE

All important branches and tags are pushed to GitHub:

| Type | Name | Commit |
|------|------|--------|
| Tag | `LOCKED_GOOD_BUILD_2026-01-06` | `cbff0d3` |
| Branch | `backup/pre-cleanup-2026-01-06` | `7ebd690` |
| Branch | `main` | `cbff0d3` |
| Branch | `staging` | `cbff0d3` |

---

## 🔄 QUICK RECOVERY SCENARIOS

### "I need to go back to the exact production build"
```powershell
git checkout main
git reset --hard LOCKED_GOOD_BUILD_2026-01-06
```

### "I need a deleted calculator component"
```powershell
git checkout backup/pre-cleanup-2026-01-06 -- components/calculators/PropertyVsSipCalculator.jsx
```

### "I need all the deleted API routes back"
```powershell
git checkout backup/pre-cleanup-2026-01-06 -- app/api/
```

### "I want to see what files were different"
```powershell
git diff main..backup/pre-cleanup-2026-01-06 --stat
```

### "I need everything back exactly as it was before cleanup"
```powershell
git checkout backup/pre-cleanup-2026-01-06
```

---

## ⚠️ DO NOT DELETE

- Tag: `LOCKED_GOOD_BUILD_2026-01-06`
- Branch: `backup/pre-cleanup-2026-01-06`  
- Folder: `C:\Users\admin\BACKUPS_premium-invest-8\`

---

## 📋 BACKUP INVENTORY

| Item | Count |
|------|-------|
| Deleted files recovered | 210+ |
| Git stashes available | 8 |
| Backup branches | 5 |
| Remote backup branches | 6+ |

---

*This guide was auto-generated during cleanup on January 6, 2026*
