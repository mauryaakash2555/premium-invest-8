# 🔒 BACKUP & RECOVERY GUIDE
## Last Updated: February 18, 2026

---

## ✅ Current Lock (February 18, 2026)

**Lock commit:** `ba9af36` (`ba9af3662ee10bcc595e74441db981b0be80926a`)
**Git tag:** `LOCKED_SITE_2026-02-18`
**Branch:** `main` (= `origin/main` = `origin/staging`)

### What's locked:
- Live Intelligence feed/mood pipeline: fully working
- Homepage MarketMoodStrip + headline rotation: verified live
- RSS fallback with freshness-filter bypass for live feeds
- Mood text from NSE indices (rule-based or Gemini)
- Fetch timeouts for serverless resilience
- All ITR, chat, blog, calculator, and service features

### Instant rollback:
```powershell
cd "C:\Users\admin\premium-invest-8"
git fetch origin
git reset --hard LOCKED_SITE_2026-02-18
git push --force-with-lease origin main
git push --force-with-lease origin main:staging
```

Or: Vercel Dashboard → Deployments → Promote the `ba9af36` deployment.

---

## 🛡️ BACKUP LAYERS

### 1. Git Tag (primary lock)
- **Tag:** `LOCKED_SITE_2026-02-18`
- **Commit:** `ba9af36`
- Restore: `git reset --hard LOCKED_SITE_2026-02-18`

### 2. GitHub Remote (cloud backup)
- Both `origin/main` and `origin/staging` at `ba9af36`
- Full repo clone: `git clone https://github.com/mauryaakash2555/premium-invest-8.git`

### 3. Vercel Deployments (production snapshots)
- Every push creates an immutable deployment on Vercel
- Promote any past deployment from Vercel Dashboard → Deployments

### 4. Local Working Copy
- `C:\Users\admin\premium-invest-8\` — clean working tree

---

## 📝 NOTES FOR AI AGENTS

- **Always check `ROLLBACK.md`** for the current lock commit before making changes
- **Always verify endpoints** after deployment (feed, mood, indices-snapshot)
- **Tag new locks** with `LOCKED_SITE_<date>` pattern
- **Push tags** with `git push origin <tag>`

---

**If anything fails after a future deployment, run:**
```powershell
git reset --hard LOCKED_SITE_2026-02-18
git push --force-with-lease origin main
git push --force-with-lease origin main:staging
```

| Backup branches | 5 |
| Remote backup branches | 6+ |

---

*This guide was auto-generated during cleanup on January 6, 2026*
