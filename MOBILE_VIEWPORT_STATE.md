# MOBILE VIEWPORT - CURRENT STATE (Dec 18, 2025)

## ✅ CURRENT WORKING STATE (Before Refresh)

### Git Commit
- **Current commit:** `2d2de39` - "Remove viewport JS - back to simple meta tag only"
- **Branch:** staging
- **Status:** WORKING on first load, BREAKS on refresh

### Viewport Settings (index.html)
```html
<meta name="viewport" content="width=1024, initial-scale=0.65, user-scalable=yes" />
```

### CSS State (App.css)
- **NO mobile CSS** - All `@media (max-width: ...)` rules DELETED
- Mobile uses desktop styles (scaled down via viewport)
- Desktop media query: `@media (min-width: 1024px)`

### Heights
**Mobile (base styles):**
- All pages: 65vh
- Home: 65vh

**Desktop (@media min-width: 1024px):**
- Home: 100vh
- Blog/About/Career: 70vh (`.page-hero-responsive`)

### Files Modified
1. `frontend/public/index.html` - viewport meta tag
2. `frontend/src/App.css` - removed all mobile CSS
3. `frontend/src/pages/About.js` - added `.page-hero-responsive` class
4. `frontend/src/pages/Blog.js` - added `.page-hero-responsive` class

## ❌ CURRENT PROBLEM

**Symptoms:**
- First load: ✅ Perfect (desktop look on mobile, good zoom)
- After 1 refresh: ❌ Everything breaks (zoom out, sizes change, "super big")

**Suspected Cause:**
- Browser caching viewport incorrectly
- React re-rendering causing viewport reset
- Need viewport stabilization without breaking the view

## 🎯 WHAT USER WANTS

1. **Mobile view:** Desktop look (not mobile CSS)
2. **Zoom:** Readable text (currently 0.65 works well)
3. **Consistency:** Same look on every refresh
4. **Reading:** Desktop layout scaled to fit mobile (no horizontal scroll)

## 🚫 WHAT USER DOES NOT WANT

1. Mobile CSS (broken footer, ugly layout)
2. Zoom-out on page load
3. Size changes on refresh
4. Horizontal scrolling

## 📝 NOTES

- User tested ~50 times before, footer fixes didn't work with mobile CSS
- Mobile CSS causes: footer shows 3 columns instead of 4, header too big, broken layout
- Desktop view looks "super cool" on mobile when stable
- Reading long blog text is hard (not priority - fix refresh issue first)

## 🔧 NEXT STEPS TO TRY

1. Try `minimum-scale=0.65, maximum-scale=0.65` (lock zoom completely)
2. Try different initial-scale values (0.7, 0.75)
3. Try CSS-based viewport stabilization
4. Try adding viewport to body/html CSS
5. As last resort: Create custom mobile CSS that mimics desktop exactly

## 📊 COMMIT HISTORY (Recent)

```
2d2de39 - Remove viewport JS - back to simple meta tag only (CURRENT)
bb1aadc - Lock viewport with JS - prevents zoom/size changes on refresh (BROKE - caused mobile view)
7cc6ebd - Trigger Vercel deployment - da9c878 viewport settings
da9c878 - Fix hero heights and zoom - Mobile all 65vh, Desktop Home 100vh others 70vh, zoom 0.65 (GOOD BASE)
```

## 🎯 TO RESTORE THIS STATE

1. `git checkout staging`
2. `git reset --hard 2d2de39`
3. Verify viewport in index.html: `width=1024, initial-scale=0.65, user-scalable=yes`
4. Verify App.css has NO `@media (max-width: ...)` rules
5. Deploy to staging

## 📱 TEST CHECKLIST

- [ ] Open in mobile incognito
- [ ] Check: Desktop look? ✅
- [ ] Check: Text readable? ✅
- [ ] Refresh 3-4 times
- [ ] Check: Still desktop look after refresh? ❌ (Current problem)
- [ ] Check: Same zoom level after refresh? ❌ (Current problem)
