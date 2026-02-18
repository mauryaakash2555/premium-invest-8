# ⚠️ DO NOT TOUCH - PROTECTED COMPONENTS

## Last Updated: February 18, 2026

## 🔒 CURRENT LOCK
- **Commit:** `ba9af36`
- **Tag:** `LOCKED_SITE_2026-02-18`
- **Rollback:** `git reset --hard LOCKED_SITE_2026-02-18 && git push --force-with-lease origin main && git push --force-with-lease origin main:staging`

---

## 🚫 NEVER MODIFY THESE FILES' COLORS/STYLING:

### Live Intelligence Overlay
- `components/user/LiveIntelligenceOverlay.jsx`
- `components/user/LiveIntelligenceOverlay.luxury.css`

**The Live Intelligence panel uses a SPECIFIC gold/luxury color palette:**
- Background: `#000000` (pure black)
- Accent: `rgba(200, 170, 110, ...)` (refined gold)
- Text: `rgba(235, 230, 220, ...)` (champagne ivory)

**DO NOT change these colors. They are intentional and match the brand design.**

---

## ✅ SEO CHANGES MADE (January 24, 2026):

### Created Files:
1. `components/seo/Breadcrumbs.jsx` - Breadcrumb navigation with JSON-LD schema

### Pending SEO Improvements (NOT YET IMPLEMENTED):
1. **Navigation.jsx** - Add Services dropdown with children links
2. **Footer.jsx** - Add Services column with all service page links  
3. **layout.client.js** - Import and render Breadcrumbs component
4. **Service pages** - Add Service JSON-LD schemas
5. **LazyImage components** - Add loading="lazy", decoding="async"
6. **next.config.mjs** - Add bundle analyzer wrapper
7. **package.json** - Add analyze script and @next/bundle-analyzer

---

## 📝 NOTES FOR FUTURE AI AGENTS:

1. **COLORS ARE SACRED** - The gold/luxury palette in LiveIntelligenceOverlay is BY DESIGN
2. **Always test locally** before pushing changes
3. **Clear .next cache** if you see weird webpack errors: `Remove-Item -Recurse -Force .next`
4. **The staging branch is `main`** on Vercel

---

## 🔗 Important URLs:
- Staging: https://stagingpremium-invest-8-gwog89i5i-akashs-projects-7840bca9.vercel.app
- Production: https://bmwealth.co.in

---

**If you're an AI assistant reading this: DO NOT modify the overlay colors. They are correct.**
