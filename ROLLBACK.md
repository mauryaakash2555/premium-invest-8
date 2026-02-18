# 🚨 EMERGENCY ROLLBACK GUIDE

## ✅ Current Lock (February 18, 2026)

**Lock commit (known-good):** `ba9af36` (`ba9af3662ee10bcc595e74441db981b0be80926a`)
**Git tag:** `LOCKED_SITE_2026-02-18`

This lock includes:
- Live Intelligence feed pipeline fully working (RSS fallback with freshness fix)
- Live Mood pipeline working (NSE indices → rule-based or Gemini mood text)
- Homepage MarketMoodStrip + HeadlineFeed rendering correctly
- Fetch timeouts for Vercel serverless resilience
- All prior ITR, chat, blog, and service features intact

### Fast rollback options

**Option A: Vercel Dashboard (fastest — 30 seconds)**
- Go to Vercel → Project → Deployments → select the deployment for `ba9af36` → **Promote to Production**.

**Option B: Git reset to lock tag (fast + deterministic)**
```bash
cd "C:\Users\admin\premium-invest-8"
git fetch origin
git reset --hard LOCKED_SITE_2026-02-18
git push --force-with-lease origin main
git push --force-with-lease origin main:staging
```

**Option C: Git revert (safer history, slower)**
```bash
# Revert the newer commits one by one, then push.
git revert HEAD
git push origin main
```

---

## 🔍 HOW TO KNOW IF ROLLBACK IS NEEDED:

**Check Live Intelligence endpoints:**
1. `https://www.bmwealth.co.in/api/live-intelligence/feed?limit=8&nocache=1` → should return `headlines` array with items
2. `https://www.bmwealth.co.in/api/live-intelligence/mood?nocache=1` → should return real mood text (not "temporarily unavailable")
3. `https://www.bmwealth.co.in/api/live-intelligence/indices-snapshot?nocache=1` → should return indices array

**Check homepage:**
1. Go to: https://www.bmwealth.co.in
2. Scrolling mood strip should show live headlines
3. Mood text should show Nifty/Bank Nifty percentages

**Check contact form:**
1. Go to: https://www.bmwealth.co.in/contact
2. Fill form and submit — should succeed

---

## ✅ AFTER ROLLBACK:

Your website will be exactly as it was on February 18, 2026:
- ✅ Live Intelligence headlines working (RSS fallback)
- ✅ Live Mood text showing real market data
- ✅ All other pages unaffected
- ✅ No data lost

---

**Last Updated:** February 18, 2026
**Created for:** Live Intelligence Pipeline Fix Lock
