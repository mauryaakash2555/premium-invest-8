# 🚨 IMPORTANT: READ FIRST BEFORE MAKING ANY CHANGES

## ⚠️ ALL AIs, DEVELOPERS, AND TEAM MEMBERS

**BEFORE you make ANY changes to this project, you MUST read:**

# 👉 **`AI_DESIGN_RULES.md`** ← READ THIS FIRST!

---

## Why This Matters

This project uses a **SPECIFIC CSS STRUCTURE** to prevent conflicts between multiple AIs and design changes. If you don't follow these rules, you will:

❌ Break existing pages' styling  
❌ Create CSS conflicts  
❌ Cause design issues  
❌ Make it harder for others to work on the project  

---

## 📋 QUICK CHECKLIST (Before You Start Coding)

- [ ] **Read the file:** `AI_DESIGN_RULES.md` (at root of repo)
- [ ] - [ ] **Understand the folder structure:** See the guide for correct organization
- [ ] - [ ] **Know which file to edit:** App.css vs module.css vs globals.css
- [ ] - [ ] **Check the examples:** Copy the format from existing pages
- [ ] - [ ] **Test in browser:** Make sure your changes don't affect other pages

- [ ] ---

- [ ] ## 🎯 TL;DR (If You're in a Rush)

- [ ] ### For NEW PAGES or COMPONENTS:
- [ ] 1. Create a folder: `frontend/src/components/v0-pages/pagename/`
- [ ] 2. Create files:
- [ ]    - `PageNameComponent.jsx` ← React component
- [ ]       - `pagename.module.css` ← **Scoped CSS (isolated)**
- [ ]      - `README.md` ← Instructions
- [ ]  3. **Don't touch App.css** for component-specific styles
- [ ]  4. Use Tailwind classes for common utilities
- [ ]  5. Commit and push

- [ ]  ### For EXISTING PAGES (Footer, Navigation, etc.):
- [ ]  1. Read `AI_DESIGN_RULES.md` FIRST
- [ ]  2. Check if there's a module.css file for that page
- [ ]  3. Make changes ONLY in that page's CSS file
- [ ]  4. Don't add global overrides in App.css
- [ ]  5. Test in browser before committing

- [ ]  ---

- [ ]  ## 🔗 Key Files

- [ ]  | File | Purpose |
- [ ]  |------|---------|
- [ ]  | `AI_DESIGN_RULES.md` | **MASTER GUIDE** - Read this first! |
- [ ]  | `frontend/src/App.css` | Global styles ONLY (colors, fonts) |
- [ ]  | `frontend/src/index.css` | Tailwind imports ONLY |
- [ ]  | `frontend/src/components/` | Component folder structure |

- [ ]  ---

- [ ]  ## ❌ COMMON MISTAKES (DON'T DO THIS)

- [ ]  ```jsx
- [ ]  ❌ Adding styles to App.css for a specific page
- [ ]  ❌ Using !important flags everywhere
- [ ]  ❌ Putting all CSS in one file
- [ ]  ❌ Not using module.css for component styles
- [ ]  ❌ Modifying other pages' CSS files
- [ ]  ```

- [ ]  ---

- [ ]  ## ✅ RIGHT WAY (DO THIS)

- [ ]  ```jsx
- [ ]  ✅ Create pagename.module.css for each page
- [ ]  ✅ Use CSS modules to scope styles automatically
- [ ]  ✅ Keep App.css for ONLY global styles
- [ ]  ✅ Use Tailwind classes in JSX
- [ ]  ✅ Keep each page's CSS isolated
- [ ]  ```

- [ ]  ---

- [ ]  ## 🆘 If You're Unsure

- [ ]  **STOP and ask BEFORE coding:**
- [ ]  - "Where should I put this CSS?"
- [ ]  - "Should I use App.css or module.css?"
- [ ]  - "Will this affect other pages?"

- [ ]  ---

- [ ]  ## 📌 Quick Links

- [ ]  👉 **Full Guide:** `/AI_DESIGN_RULES.md`
- [ ]  👉 **Folder Structure:** See section in `AI_DESIGN_RULES.md`
- [ ]  👉 **Examples:** Look at existing pages in `/frontend/src/components/v0-pages/`

- [ ]  ---

- [ ]  **Questions? Check `AI_DESIGN_RULES.md` - it has all the answers!**
