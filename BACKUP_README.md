# BM Wealth - Backup Reference

## Current Lock
- **Date:** February 18, 2026
- **Commit:** `ba9af36`
- **Tag:** `LOCKED_SITE_2026-02-18`

## Quick Rollback
```powershell
git reset --hard LOCKED_SITE_2026-02-18
git push --force-with-lease origin main
git push --force-with-lease origin main:staging
```

See `ROLLBACK.md` and `BACKUP_RECOVERY_GUIDE.md` for full details.
