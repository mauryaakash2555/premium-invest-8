# BLOG MASTER RULES

## 🚀 PERFORMANCE RULES

- Blog must render immediately
- No 6-10 second delay
- Content must appear as soon as page loads
- **Lazy loading causing delay = BUG**

---

## 🛠️ HOW TO ADD FUTURE BLOGS

1. Open: `frontend/src/data/staticBlogData.js`
2. Clone Blog-1 structure
3. New variable: `staticBlogPost2`, `staticBlogPost3`, etc.
4. Content must be: **HTML with inline styles** (no JSX, no CSS classes)
5. Add to export array at bottom of file

---

## 🚫 FORBIDDEN ACTIONS

- ❌ Adding emojis
- ❌ Suggesting Next.js for blog
- ❌ Refactoring components
- ❌ Using CSS classes (inline styles only)
- ❌ Touching main branch without permission

---

## 🧠 AI / AUTOMATION RULES

1. Always confirm before running scripts
2. Never touch main automatically
3. Only feature or backup branches
4. Exact file paths must be provided
5. No follow-up questions unless technically impossible

---

## 🆘 EMERGENCY RECOVERY

- Vercel rollback via dashboard preferred
- Git revert preferred over reset
- **Never use `git reset --hard` casually**

---

## 📋 QUICK REFERENCE FOR AI

```
BLOG-1 CONTENT FILE:
C:\Users\admin\premium-invest-8\frontend\src\data\staticBlogData.js

BLOG-1 VARIABLE: staticBlogPost
BLOG-1 CONTENT STARTS: Line 47
BLOG-1 SLUG: 47-lakh-investment-mistake-mumbai

DO NOT TOUCH:
- data/blog.json (Word reference only)
- Any content words
- main branch
```
