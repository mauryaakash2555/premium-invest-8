# 🎯 STAGING ENVIRONMENT - EXACT DETAILS

**CRITICAL:** All AI deployments MUST go here (not production)

---

## 🌐 STAGING ENVIRONMENT

### Vercel Project:
```
staging.premium-invest-8
```

### Primary Staging URL:
```
https://admin-tiart-alpha-59.vercel.app
```

### Alternative Staging URLs:
```
https://stagingpremium-invest-8-git-main-akashs-projects-7840bca9.vercel.app
https://stagingpremium-invest-8-6qlap3445-akashs-projects-7840bca9.vercel.app
```

### Git Branch:
```
staging
```

### Access Level:
```
✅ OPEN - AI can deploy here freely
```

---

## 🔒 PRODUCTION ENVIRONMENT (OFF LIMITS)

### Vercel Project:
```
premium-invest-8
```

### Production URL:
```
https://bmwealth.co.in
```

### Git Branch:
```
main
```

### Access Level:
```
❌ LOCKED - Only manual human deployment
```

---

## 📋 AI DEPLOYMENT PROTOCOL

### For Cursor AI / Copilot / All AI Tools:

**ALLOWED:**
```
✅ Deploy to: staging.premium-invest-8
✅ Test at: admin-tiart-alpha-59.vercel.app
✅ Push to: staging branch
✅ Commit changes to staging
```

**FORBIDDEN:**
```
❌ Deploy to: premium-invest-8
❌ Touch: bmwealth.co.in
❌ Push to: main branch
❌ Any production deployment
```

---

## 🔄 EXACT DEPLOYMENT WORKFLOW

### Step 1: AI Makes Changes
```bash
git checkout staging
# Make changes to code
git add .
git commit -m "Description of changes"
git push origin staging
```

### Step 2: Vercel Auto-Deploys Staging
- Staging project detects push
- Builds automatically
- Deploys to: admin-tiart-alpha-59.vercel.app

### Step 3: Test on Staging
```
Open: https://admin-tiart-alpha-59.vercel.app
Test: Desktop view
Test: Mobile view (F12 → device toolbar)
Check: All pages work
Check: Forms submit
Check: Images load
Check: Navigation works
```

### Step 4: Human Approval
- If tests pass → Human promotes to production
- If tests fail → AI fixes on staging, repeat

---

## 🚀 MANUAL PROMOTION TO PRODUCTION

**When staging is perfect and tested:**

### Option A: Vercel Dashboard (Easiest)
1. Go to Vercel → staging.premium-invest-8
2. Find the tested deployment
3. Click "Promote to Production" (if available)
4. Or note the deployment URL for reference

### Option B: Git Merge
```bash
git checkout main
git merge staging
git push origin main
```

### Option C: Manual Deploy to Production
1. Go to Vercel → premium-invest-8
2. Trigger manual deployment from main branch
3. Verify deployment succeeds

---

## 🧪 TESTING CHECKLIST

Before promoting to production, verify on staging:

- [ ] Homepage loads correctly
- [ ] Navigation menu works
- [ ] Mobile view (375px, 768px, 1024px)
- [ ] Desktop view (1280px, 1920px)
- [ ] Contact form submits
- [ ] Images load properly
- [ ] Blog pages work
- [ ] Service pages load
- [ ] Legal pages display
- [ ] WhatsApp button works
- [ ] No console errors
- [ ] Performance is acceptable

---

## 🚨 EMERGENCY ROLLBACK

If production breaks:

### Quick Rollback (30 seconds):
1. Go to Vercel → premium-invest-8
2. Click "Deployments"
3. Find last working deployment
4. Click "Promote to Production"
5. ✅ Site restored instantly

### Then Fix Properly:
1. Fix issue on staging branch
2. Deploy to staging
3. Test at: admin-tiart-alpha-59.vercel.app
4. When working, promote to production

---

## 📝 QUICK REFERENCE FOR AI ASSISTANTS

**Staging Project:** `staging.premium-invest-8`  
**Test URL:** `https://admin-tiart-alpha-59.vercel.app`  
**Branch:** `staging`  
**Status:** ✅ Open for AI deployments

**Production Project:** `premium-invest-8`  
**Live URL:** `https://bmwealth.co.in`  
**Branch:** `main`  
**Status:** ❌ Locked from AI deployments

---

## 🎯 ONE-LINE INSTRUCTION FOR AI TOOLS

```
Deploy to staging.premium-invest-8 (admin-tiart-alpha-59.vercel.app), 
test thoroughly, let human promote to production (bmwealth.co.in)
```

---

## 💡 WHY THESE EXACT URLS MATTER

### Staging URLs Show You're Testing:
- `admin-tiart-alpha-59.vercel.app` - clearly a test environment
- Not indexed by Google
- Can break without affecting business

### Production URL is Your Business:
- `bmwealth.co.in` - your professional domain
- Indexed by Google
- Serving real clients
- Must never break

---

## 🔍 HOW TO VERIFY WHICH ENVIRONMENT

### You're on Staging if:
- URL contains: `admin-tiart-alpha-59`
- Or: `stagingpremium-invest-8`
- Or: Git branch is `staging`

### You're on Production if:
- URL is: `bmwealth.co.in`
- Or: Git branch is `main`
- Or: Vercel project is `premium-invest-8`

---

## ✅ VERIFICATION

### Current Setup (Confirmed):

**Staging Environment:** ✅ Exists
- Project: staging.premium-invest-8
- URL: admin-tiart-alpha-59.vercel.app
- Branch: staging

**Production Environment:** ✅ Exists
- Project: premium-invest-8
- URL: bmwealth.co.in
- Branch: main

**Protection:** ✅ Active
- Staging: Open for AI
- Production: Locked from AI

---

## 🎊 SUMMARY

This file contains the **EXACT** staging environment details so any AI assistant knows precisely where to deploy.

**Key Points:**
1. ✅ Always deploy to: `staging.premium-invest-8`
2. ✅ Always test at: `admin-tiart-alpha-59.vercel.app`
3. ❌ Never touch: `premium-invest-8` or `bmwealth.co.in`
4. 👤 Human controls production promotion

**Your live business website is protected!** 🛡️

---

**Last Updated:** December 18, 2024  
**Status:** ACTIVE & OPERATIONAL  
**Environment:** Staging details confirmed from Vercel dashboard
