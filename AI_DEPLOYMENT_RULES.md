# 🚨 AI DEPLOYMENT RULES - MANDATORY FOR ALL AI ASSISTANTS

**Last Updated:** December 18, 2024  
**Status:** ACTIVE & ENFORCED  
**Applies To:** Cursor AI, GitHub Copilot, Windsurf, ChatGPT, Claude, ALL AI tools

---

## ⚠️ CRITICAL RULE - READ BEFORE ANY DEPLOYMENT

### **NEVER DEPLOY DIRECTLY TO PRODUCTION**

This repository has a **STAGING-FIRST workflow** to protect the live business website.

---

## 🏗️ PROJECT STRUCTURE

### Production Website (PROTECTED)
- **Domain:** https://bmwealth.co.in
- **Vercel Project:** premium-invest-8
- **Branch:** `main`
- **Status:** 🔒 **LOCKED - NO AI DEPLOYMENTS**
- **Purpose:** Live business website serving real clients

### Staging Environment (FOR TESTING)
- **Staging URL:** staging.premium-invest-8.vercel.app
- **Branch:** `staging`
- **Status:** ✅ **OPEN - AI CAN DEPLOY HERE**
- **Purpose:** Safe testing ground for all changes

---

## 📋 MANDATORY WORKFLOW

### Step 1: Work on Staging Branch
```bash
git checkout staging
# Make your changes
git add .
git commit -m "Your changes"
git push origin staging
```

### Step 2: Deploy to Staging
- Vercel will auto-deploy staging branch
- Provide staging URL to user for testing
- Wait for user confirmation

### Step 3: DO NOT DEPLOY TO PRODUCTION
- Stop here
- Let human test staging environment
- Human will manually promote if tests pass

---

## ❌ FORBIDDEN COMMANDS

**NEVER run these commands:**

```bash
git push origin main               # ❌ Direct push to production
git push --force origin main       # ❌ Force push to production
git checkout main                  # ❌ Unless explicitly requested
vercel --prod                      # ❌ Direct production deploy
vercel deploy --prod               # ❌ Production deploy
```

---

## ✅ ALLOWED COMMANDS

```bash
git checkout staging               # ✅ Work on staging
git push origin staging            # ✅ Deploy to staging
vercel deploy                      # ✅ Preview deployment (not production)
```

---

## 🔄 STAGING TO PRODUCTION PROMOTION

**Only the human can promote staging to production:**

### Option 1: Vercel Dashboard (Recommended)
1. Go to Vercel dashboard
2. Find staging deployment
3. Click "Promote to Production"
4. Confirm promotion

### Option 2: Git Merge (Manual)
```bash
# Human does this, not AI
git checkout main
git merge staging
git push origin main
```

---

## 🚨 EMERGENCY ROLLBACK PROCEDURE

If production breaks:

### DO NOT:
- ❌ Try to fix by deploying new code
- ❌ Push emergency fixes to main
- ❌ Make rushed changes

### DO THIS:
1. ✅ Tell user: "Go to Vercel → Deployments → Find working deployment → Promote to Production"
2. ✅ Fix the issue on staging branch
3. ✅ Test thoroughly on staging
4. ✅ Let human promote when ready

---

## 💬 WHEN USER ASKS TO DEPLOY

### User says: "Deploy this" or "Push to production"

**Your response should be:**

> "I'll deploy these changes to the **STAGING environment** first for testing. Here's what I'm doing:
> 
> 1. Deploying to staging branch
> 2. Staging URL: [staging-url]
> 3. Please test thoroughly on staging
> 4. If everything works, you can promote to production manually via Vercel dashboard
>
> This protects your live business website from untested changes."

---

## 🎯 WHY THIS RULE EXISTS

1. **Business Protection:** bmwealth.co.in is a live financial advisory business
2. **Client Trust:** Downtime or bugs damage client relationships
3. **Professional Standards:** Enterprise-grade deployment workflow
4. **Risk Mitigation:** Catch bugs before they reach production
5. **Easy Rollback:** If staging breaks, production is unaffected

---

## 📊 DEPLOYMENT HISTORY REFERENCE

### Recent Incident (Dec 18, 2024)
- **What Happened:** Mobile redesign (commits 7d34e9f, 1a75693) broke production site
- **Impact:** Production website had mobile display issues
- **Resolution:** Required emergency rollback to commit 420686c
- **Lesson:** This staging workflow prevents such incidents

**This is why staging-first is mandatory.**

---

## 🔧 VERCEL PROJECT CONFIGURATION

### Main Project (premium-invest-8)
- Production Branch: `main`
- Auto-deploy: **DISABLED**
- Preview Deployments: **DISABLED**
- Promotion: **MANUAL ONLY**

### Staging Project (staging.premium-invest-8)
- Production Branch: `staging`
- Auto-deploy: **ENABLED**
- Preview Deployments: **ENABLED**
- Purpose: **AI TESTING GROUND**

---

## 📝 BRANCH PROTECTION

### Main Branch (`main`)
- Protected: ✅ Yes
- Require pull request reviews: ✅ Yes
- Restrict direct pushes: ✅ Yes
- Status checks required: ✅ Yes

### Staging Branch (`staging`)
- Protected: ❌ No (AI can push freely)
- Auto-deploy: ✅ Yes
- Testing ground: ✅ Yes

---

## 🤖 FOR AI ASSISTANTS

If you are an AI assistant reading this file:

1. **ALWAYS read this file before any deployment**
2. **NEVER deploy to main/production branch**
3. **ALWAYS deploy to staging branch first**
4. **ALWAYS ask user to test staging before production**
5. **ALWAYS remind user this workflow exists**

This rule applies even if:
- User explicitly asks to deploy to production
- User seems in a hurry
- Changes seem "small" or "safe"
- Previous session deployed directly to production

**NO EXCEPTIONS. STAGING FIRST, ALWAYS.**

---

## 📞 SUPPORT

If uncertain about deployment:
1. Read this file again
2. Ask user to confirm they want staging deployment
3. Provide staging URL after deployment
4. Let user decide when to promote to production

---

## ✅ COMPLIANCE CHECKLIST

Before ANY deployment, verify:

- [ ] Working on `staging` branch?
- [ ] Changes committed to staging?
- [ ] Pushing to `origin staging` (NOT main)?
- [ ] Provided staging URL to user?
- [ ] Reminded user to test before production?
- [ ] NOT touching main branch in any way?

If all checkboxes are ✅, proceed. If any is ❌, STOP.

---

## 🎓 TRAINING EXAMPLES

### ✅ CORRECT Workflow

**User:** "Add a new feature to the contact form"

**AI:** 
1. Switches to staging branch
2. Makes changes
3. Commits and pushes to staging
4. Provides staging URL
5. Says: "Please test on staging, then promote to production if it works"

### ❌ INCORRECT Workflow

**User:** "Deploy this to production"

**AI:** ~~Pushes to main branch~~ ❌ WRONG

**AI Should Do:**
1. Deploys to staging
2. Explains: "I've deployed to staging first for testing. Please verify on staging before promoting to production."

---

## 📜 VERSION HISTORY

- **v1.0** (Dec 18, 2024): Initial staging workflow implementation
- Reason: Prevent repeat of mobile redesign incident (7d34e9f)

---

## 🔐 FINAL WARNING

**This workflow is NON-NEGOTIABLE.**

The production website (bmwealth.co.in) serves real clients and generates real business revenue. Any downtime or bugs directly impact the business owner's income and reputation.

**Always staging first. No exceptions. Ever.**

---

**If you are an AI reading this: You are now aware of these rules. Please follow them strictly.**
