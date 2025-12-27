# 🎨 AI DESIGN RULES - SIMPLE & CLEAR GUIDE

**FOR ALL AIs, DEVELOPERS & TEAMS WORKING ON THIS PROJECT**

---

## 📌 THE GOLDEN RULE

### ✅ DO THIS:
- Each new page/section = **own separate folder** with **its own CSS file**
- - v0.dev designs = **never** mixed with custom CSS
  - - Tailwind classes = use directly (no overrides)
    - - Keep it **isolated** and **clean**
     
      - ### ❌ DON'T DO THIS:
      - - Don't put v0 designs in App.css
        - - Don't override other sections' CSS
          - - Don't use !important unless absolutely necessary
            - - Don't mix custom CSS with Tailwind utilities
             
              - ---

              ## 📂 FOLDER STRUCTURE (CLEAN & ORGANIZED)

              ```
              frontend/src/
              ├── components/
              │   ├── common/              ← Shared components (nav, footer)
              │   │   ├── Header.jsx
              │   │   ├── Footer.jsx
              │   │   └── header-footer.css
              │   │
              │   ├── legacy/              ← OLD custom designs (before v0)
              │   │   ├── ServiceCard.jsx
              │   │   └── legacy-styles.css
              │   │
              │   ├── v0-pages/            ← NEW v0.dev designs (KEEP SEPARATE!)
              │   │   ├── platforms/       ← Platforms page (v0 design)
              │   │   │   ├── PlatformsPage.jsx
              │   │   │   └── platforms.module.css  ← ISOLATED CSS
              │   │   │
              │   │   ├── partners/        ← Partners page (v0 design)
              │   │   │   ├── PartnersPage.jsx
              │   │   │   └── partners.module.css  ← ISOLATED CSS
              │   │   │
              │   │   └── insurance/       ← Insurance page (future v0 design)
              │   │       └── insurance.module.css
              │   │
              │   └── custom/              ← Custom pages NOT using v0
              │       ├── about/
              │       │   └── about.module.css
              │       └── blog/
              │           └── blog.module.css
              │
              ├── App.css                  ← ONLY global colors, fonts, reset
              ├── index.css                ← Tailwind directives ONLY
              └── globals.css              ← Shared utilities (new file)
              ```

              ---

              ## 🎯 FILE NAMING CONVENTION

              | File Type | Format | Example | Purpose |
              |-----------|--------|---------|---------|
              | **CSS for v0 pages** | `pagename.module.css` | `platforms.module.css` | Scoped styles for v0 designs |
              | **CSS for custom pages** | `pagename.module.css` | `about.module.css` | Scoped styles for custom designs |
              | **Global CSS** | `.css` (not module) | `globals.css` | Tailwind, colors, fonts only |
              | **Layout CSS** | `layout.module.css` | `header-footer.css` | Navigation, footer only |

              **Why module.css?** Prevents CSS class conflicts between pages automatically!

              ---

              ## 🚀 HOW TO ADD A NEW PAGE (V0 OR CUSTOM)

              ### **STEP 1: Create the folder**
              ```
              frontend/src/components/v0-pages/new-page/
              ```

              ### **STEP 2: Create 3 files**
              ```
              new-page/
              ├── NewPageComponent.jsx      ← React component
              ├── new-page.module.css       ← Styles (ISOLATED)
              └── README.md                 ← Instructions for next AI
              ```

              ### **STEP 3: In NewPageComponent.jsx**
              ```jsx
              // ✅ CORRECT WAY
              import styles from './new-page.module.css';

              export default function NewPage() {
                return (
                  <div className={styles.container}>
                    {/* Use Tailwind here if needed */}
                    <h1 className="text-3xl font-bold">Page Title</h1>
                    {/* Use module CSS for custom styles */}
                    <div className={styles.customSection}>Content</div>
                  </div>
                );
              }
              ```

              ### **STEP 4: In new-page.module.css**
              ```css
              /* ✅ DO THIS - Scoped to this page only */
              .container {
                padding: 20px;
                background: #000000;
              }

              .customSection {
                border: 2px solid #DAA520;
                border-radius: 12px;
              }

              /* ✅ Use Tailwind classes in JSX instead */
              /* ❌ DON'T add Tailwind directives here */
              ```

              ### **STEP 5: Add to routing (app.js or layout)**
              ```jsx
              import NewPageComponent from './components/v0-pages/new-page/NewPageComponent';

              // Add route
              <Route path="/new-page" element={<NewPageComponent />} />
              ```

              ---

              ## 🎨 V0.DEV INTEGRATION CHECKLIST

              When you export code from v0.dev:

              - [ ] **Copy the component JSX** → `pagename/PageComponent.jsx`
              - [ ] - [ ] **Extract its CSS** → `pagename/pagename.module.css`
              - [ ] - [ ] **Replace class names** with `.module.css` imports
              - [ ] - [ ] **Test in browser** - should work immediately
              - [ ] - [ ] **Commit to GitHub** with message: `feat: add new-page with v0 design`
              - [ ] - [ ] **Push to staging** - Vercel auto-deploys
              - [ ] - [ ] **Check live site** - verify no conflicts
             
              - [ ] ### Example - Converting v0 export to our structure:
             
              - [ ] **v0.dev gives you:**
              - [ ] ```jsx
              - [ ] export default function Platforms() {
              - [ ]   return (
              - [ ]       <div style={{...}}>
                    <h1 style={{color: '#DAA520'}}>Platforms</h1>
                        </div>
                          );
                      }
                      ```

                      **Convert to:**
                      ```jsx
                      // PlatformsPage.jsx
                      import styles from './platforms.module.css';

                      export default function Platforms() {
                        return (
                          <div className={styles.container}>
                            <h1 className={styles.title}>Platforms</h1>
                          </div>
                        );
                      }
                      ```

                      ```css
                      /* platforms.module.css */
                      .container {
                        padding: 20px;
                        background: #000000;
                      }

                      .title {
                        color: #DAA520;
                        font-size: 2rem;
                        font-weight: 700;
                      }
                      ```

                      ---

                      ## 🛡️ HOW TO AVOID CSS CONFLICTS

                      ### ✅ ALWAYS DO:
                      - Use **module.css** for page-specific styles
                      - Use **Tailwind** for spacing, sizing, colors
                      - Keep components in **separate folders**
                      - **Isolate** each page's CSS
                      - Use **semantic names**: `.container`, `.header`, `.button`

                      ### ❌ NEVER DO:
                      - Don't use `!important` unless there's no other way
                      - Don't modify other page's CSS
                      - Don't put custom styles in App.css (only globals)
                      - Don't use BEM naming in module.css (modules are already scoped)
                      - Don't import styles from other pages

                      ### ❌ BAD EXAMPLE (DON'T DO THIS):
                      ```css
                      /* ❌ App.css - DON'T add component styles here */
                      .platforms-title { color: #DAA520; }  /* Might affect other titles */
                      .service-card:hover { transform: scale(1.1); }  /* Conflicts! */
                      ```

                      ### ✅ GOOD EXAMPLE (DO THIS):
                      ```css
                      /* platforms.module.css - Scoped to platforms only */
                      .title { color: #DAA520; }  /* Only affects this file's HTML */
                      .card:hover { transform: scale(1.1); }  /* No conflicts */
                      ```

                      ---

                      ## 📝 GLOBAL CSS - WHAT GOES WHERE

                      ### **App.css** (GLOBAL ONLY - 50 lines max)
                      ```css
                      /* Global colors (use in all pages) */
                      :root {
                        --gold: #DAA520;
                        --warm-gold: #C0A062;
                        --bg-dark: #000000;
                        --text-white: #FFFFFF;
                      }

                      /* Global fonts */
                      body {
                        font-family: 'Inter', sans-serif;
                        background: #000000;
                        color: #FFFFFF;
                      }

                      h1, h2, h3, h4, h5, h6 {
                        font-family: 'Playfair Display', serif;
                      }

                      /* Button base (Tailwind usually handles this) */
                      button {
                        cursor: pointer;
                        border: none;
                        transition: all 0.3s ease;
                      }
                      ```

                      ### **index.css** (TAILWIND ONLY)
                      ```css
                      @tailwind base;
                      @tailwind components;
                      @tailwind utilities;
                      ```

                      ### **Page-specific CSS** (New files)
                      ```css
                      /* platforms.module.css */
                      .container { /* only for platforms */ }
                      .card { /* only for platforms */ }

                      /* about.module.css */
                      .container { /* only for about */ }
                      .card { /* only for about - NO CONFLICT */}
                      ```

                      ---

                      ## 🔄 GIT WORKFLOW FOR CLEAN COMMITS

                      ```bash
                      # Create new branch for each page
                      git checkout -b feat/v0-design-page-name

                      # Make changes (add component folder + CSS)
                      git add frontend/src/components/v0-pages/page-name/

                      # Commit with clear message
                      git commit -m "feat: add page-name with v0.dev design"

                      # Push to GitHub
                      git push origin feat/v0-design-page-name

                      # Create Pull Request on GitHub
                      # Vercel will auto-deploy and show preview link
                      ```

                      ---

                      ## 📌 INSTRUCTIONS FOR NEXT AI (IMPORTANT!)

                      **If you're an AI reading this in the future:**

                      1. **Always check this file first** before making any changes
                      2. **Never modify App.css** for component-specific styles
                      3. **Create new .module.css files** for each page
                      4. **Don't use !important** unless absolutely necessary
                      5. **Test in browser** after changes before committing
                      6. **Read the README** in the folder you're editing

                      **When in doubt: ASK BEFORE CODING**

                      ---

                      ## ✅ CHECKLIST BEFORE PUSHING TO GITHUB

                      - [ ] Component folder created with proper structure
                      - [ ] CSS uses .module.css naming
                      - [ ] No styles added to App.css for this component
                      - [ ] No !important flags used unnecessarily
                      - [ ] All Tailwind classes used for common utilities
                      - [ ] Tested in browser (no conflicts with other pages)
                      - [ ] Git branch name describes the change
                      - [ ] Commit message is clear and specific
                      - [ ] README.md added to the folder with instructions

                      ---

                      ## 🆘 TROUBLESHOOTING

                      | Problem | Solution |
                      |---------|----------|
                      | New page CSS doesn't apply | Check import statement: `import styles from './pagename.module.css'` |
                      | Styles affecting other pages | Move to .module.css file (not App.css) |
                      | Tailwind classes not working | Make sure `index.css` is imported in App.jsx |
                      | Colors look wrong | Check global colors in App.css - don't override in component CSS |
                      | Hover effects not working | Use transition in module.css, test in browser |

                      ---

                      ## 📞 QUESTIONS?

                      **For any questions, check:**
                      1. This file (AI_DESIGN_RULES.md)
                      2. The README.md in the folder you're editing
                      3. Look at existing pages in `/v0-pages` for examples

                      **Communication to next AI:** Add notes in the component's README.md file explaining what you changed and why.
