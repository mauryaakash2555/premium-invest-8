# 🚀 VERCEL STAGING → PRODUCTION DEPLOYMENT WORKFLOW

**GOAL:** Protect main website (premium-invest-8) by always testing on staging first

---

## 🌐 CURRENT SETUP

### ✅ Production Website
- **Domain:** https://bmwealth.co.in
- **Vercel Project:** premium-invest-8
- **Branch:** main
- **Auto-deploy:** DISABLED (manual promotion only)

### ✅ Staging Website
- **Vercel Project:** staging.premium-invest-8
- **Primary URL:** https://admin-tiart-alpha-59.vercel.app
- **Branch:** staging
- **Auto-deploy:** ENABLED (AI can deploy here)

---

## 📜 DEPLOYMENT RULES

### RULE 1: NEVER DEPLOY DIRECTLY TO MAIN
- AI tools (Cursor, Copilot, Windsurf) deploy to STAGING only
- Main website is LOCKED from direct deployments
- Production updates require manual promotion

### RULE 2: STAGING FIRST WORKFLOW
1. AI makes changes → Deploy to STAGING
2. Test staging thoroughly (mobile + desktop)
3. If everything works → Manual deploy to MAIN
4. If broken → Fix on staging, repeat

### RULE 3: BRANCH PROTECTION
- **Main branch:** Protected, manual merge only
- **Staging branch:** Open for AI deployments
- **Promotion:** Only manual merge staging → main

---

## 🛠️ IMPLEMENTATION GUIDE

### STEP 1: VERCEL PROJECT CONFIGURATION

#### For MAIN Project (premium-invest-8)
```
Settings → Git:
- Production Branch: "main"
- Preview Deployments: OFF
- Auto-deploy: OFF (manual only)
- Ignored Build Step: Use staging for builds
```

#### For STAGING Project (staging.premium-invest-8)
```
Settings → Git:
- Production Branch: "staging"
- Auto-deploy: ON (AI can deploy here)
- Preview Deployments: ON
```

---

### STEP 2: GITHUB BRANCH SETUP

#### Create Protected Branches

```bash
# Create staging branch if it doesn't exist
git checkout -b staging
git push -u origin staging

# Protect main branch via GitHub UI
# Go to: Settings → Branches → Add rule
```

#### Main Branch Protection Rules:
- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass
- ✅ Restrict who can push to matching branches
- ✅ Do not allow bypassing the above settings

---

### STEP 3: AI DEPLOYMENT INSTRUCTIONS

Add to `.cursorrules` and `AI_DEPLOYMENT_RULES.md`:

```
DEPLOYMENT RULE: 
- NEVER deploy directly to main branch
- ALWAYS deploy to staging branch first
- Let human test staging before production
- Main website is PROTECTED and OFF-LIMITS
```

---

### STEP 4: TESTING WORKFLOW

When AI makes changes:

1. **AI deploys to staging:**
   ```bash
   git checkout staging
   git add .
   git commit -m "Changes description"
   git push origin staging
   ```

2. **You test staging:**
   - Visit: staging.premium-invest-8.vercel.app
   - Test all pages
   - Check mobile responsiveness
   - Verify forms, links, images
   - Check console for errors

3. **If tests pass:**
   - Go to Vercel dashboard
   - Find staging deployment
   - Click "Promote to Production"
   - Or merge staging → main branch

4. **If tests fail:**
   - Tell AI what's broken
   - AI fixes on staging branch
   - Repeat testing process

---

## 🔄 PROMOTION TO PRODUCTION

### Method 1: Vercel Dashboard (Recommended)
1. Go to Vercel → Projects → premium-invest-8
2. Click "Deployments"
3. Find the staging deployment you tested
4. Click three dots → "Promote to Production"
5. Confirm promotion

### Method 2: Git Merge
```bash
git checkout main
git merge staging
git push origin main
# Vercel will deploy automatically (if enabled)
```

---

## 🚨 EMERGENCY ROLLBACK PROCEDURE

If production breaks:

### Quick Rollback (Fastest)
1. Go to Vercel dashboard
2. Click "Deployments"
3. Find last working deployment
4. Click "Visit" to verify it works
5. Click "Promote to Production"
6. Broken version instantly replaced ✅

### Fix and Redeploy
1. Fix issue on staging branch
2. Test thoroughly on staging
3. Once verified, promote to production

---

## ✅ BENEFITS OF THIS APPROACH

✅ Main website never breaks from AI mistakes  
✅ Test everything safely on staging  
✅ Easy rollback if issues found  
✅ Professional development workflow  
✅ Client always sees working website  
✅ AI can work freely without risk  

---

## 📊 STAGING VS PRODUCTION URLs

### STAGING (for testing)
- **Project:** staging.premium-invest-8
- **URL:** https://admin-tiart-alpha-59.vercel.app
- **Branch:** `staging`
- **Purpose:** Safe testing environment

### PRODUCTION (live website)
- https://bmwealth.co.in
- premium-invest-8.vercel.app
- Branch: `main`
- Purpose: Live business website

---

## 🎯 DAILY WORKFLOW EXAMPLE

### Scenario: User wants to update contact page

```
1. User: "Update the contact page with new phone number"

2. AI: 
   - Checks out staging branch
   - Updates contact page
   - Commits changes
   - Pushes to staging branch
   - Provides staging URL

3. You:
   - Visit staging URL
   - Check contact page
   - Verify phone number displays correctly
   - Test mobile view
   - Approve changes

4. You (manual):
   - Go to Vercel dashboard
   - Promote staging deployment to production
   - OR merge staging → main in git

5. Done:
   - Changes live on bmwealth.co.in
   - No downtime, no risks
```

---

## 🔍 VERIFICATION CHECKLIST

Before promoting to production:

- [ ] Staging deployment successful?
- [ ] All pages load correctly?
- [ ] Mobile view looks good?
- [ ] Desktop view looks good?
- [ ] Forms work (if changed)?
- [ ] Images load properly?
- [ ] Navigation works?
- [ ] No console errors?
- [ ] Performance acceptable?

If all ✅, safe to promote to production.

---

## 📝 SAMPLE AI INSTRUCTION

Use this when talking to any AI assistant:

```
DEPLOYMENT INSTRUCTION:
Deploy all changes to STAGING environment only.
Production website (bmwealth.co.in) is protected.

Staging URL: staging.premium-invest-8.vercel.app
Staging Branch: staging

I will test on staging and manually promote to production.
Do NOT push to main branch or production environment.
```

---

## 🎓 RECENT INCIDENT CASE STUDY

### What Happened (Dec 18, 2024)
- AI deployed mobile redesign directly to production (commits 7d34e9f, 1a75693)
- Production website mobile view broke
- Required emergency rollback to commit 420686c
- Caused business disruption

### What Should Have Happened
1. AI deploys mobile redesign to staging
2. User tests on staging, discovers issues
3. AI fixes issues on staging
4. After successful testing, promote to production
5. No business disruption ✅

**This workflow prevents such incidents.**

---

## 🤖 FOR ALL AI ASSISTANTS

If you are reading this:

1. You must ALWAYS deploy to staging first
2. You must NEVER deploy directly to main/production
3. You must ALWAYS provide staging URL for testing
4. You must ALWAYS wait for human approval before production
5. These rules apply even if user explicitly asks for production deploy

**Respond with:** "I'll deploy to staging first for testing. You can promote to production after verifying it works."

---

## 📞 QUESTIONS & TROUBLESHOOTING

### Q: Can AI ever push to main branch?
**A:** NO. Never. Not even for "small changes" or "hotfixes."

### Q: What if user insists on production deploy?
**A:** AI should still deploy to staging, explain the workflow, and let user manually promote.

### Q: What if staging branch doesn't exist?
**A:** AI should create it from main, then deploy there.

### Q: How long should testing take?
**A:** As long as needed. Typically 2-5 minutes for small changes, 10-30 minutes for major updates.

---

## ✅ IMPLEMENTATION STATUS

- [x] `.cursorrules` file created with deployment rules
- [x] `AI_DEPLOYMENT_RULES.md` comprehensive guide created
- [x] `DEPLOYMENT_WORKFLOW.md` workflow documentation created
- [ ] Staging branch created and pushed to GitHub
- [ ] GitHub branch protection configured for main
- [ ] Vercel main project: auto-deploy disabled
- [ ] Vercel staging project: auto-deploy enabled
- [ ] Test deployment to staging
- [ ] Verify promotion workflow

---

**This workflow protects your business website while allowing AI tools to work efficiently!**
