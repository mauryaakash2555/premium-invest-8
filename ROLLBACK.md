# 🚨 EMERGENCY ROLLBACK GUIDE

## If Contact Form Breaks After Deployment

### ⚡ INSTANT ROLLBACK (30 seconds):

**Method 1: Vercel Dashboard (FASTEST)**
1. Go to: https://vercel.com/dashboard
2. Click on your project
3. Go to "Deployments" tab
4. Find the deployment BEFORE the contact form change
5. Click "..." menu on that deployment
6. Click "Promote to Production"
7. ✅ Done! Live site reverted in 30 seconds

---

**Method 2: Git Revert (2 minutes)**
```bash
cd "C:\Users\admin\premium-invest-8"
git revert HEAD
git push origin main
```
Vercel auto-deploys the previous version

---

**Method 3: Quick File Change (1 minute)**
File: `frontend/src/pages/Contact.js`

Find line:
```javascript
const API_URL = '/api/contact'; // New Vercel endpoint
```

Change to:
```javascript
const API_URL = 'https://bmwealth-backend.onrender.com/api/contact'; // Old Render backend
```

Save, commit, push:
```bash
git add frontend/src/pages/Contact.js
git commit -m "fix: Revert to Render backend temporarily"
git push origin main
```

---

### 🔍 HOW TO KNOW IF ROLLBACK IS NEEDED:

**Check contact form:**
1. Go to: https://bmwealth.co.in/contact
2. Fill form and submit
3. If shows error or doesn't work after 10 seconds → ROLLBACK

**Check Vercel deployment:**
1. Go to Vercel Dashboard → Deployments
2. If latest deployment shows "Failed" → ROLLBACK

---

### ✅ AFTER ROLLBACK:

Your website will be exactly as it was before:
- ✅ Contact form works (via Render backend)
- ✅ All other pages unaffected
- ✅ No data lost
- ✅ No content changed

Then you can debug the issue offline and re-deploy when fixed.

---

### 📞 IF YOU NEED HELP:

**The changes only affected:**
- `api/contact.js` (new serverless function)
- `frontend/src/pages/Contact.js` (API endpoint change)

**Everything else is untouched:**
- ✅ Blog content
- ✅ Home/About/Services pages
- ✅ Navigation
- ✅ Styling
- ✅ Database

**Contact form is isolated - safe to experiment!**

---

**Last Updated:** December 14, 2025  
**Created for:** Vercel Serverless Migration Safety
