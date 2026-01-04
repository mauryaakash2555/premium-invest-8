# 🤖 START HERE IF YOU'RE AN AI

## ⚠️ STOP BEFORE YOU CODE!

## ✅ DEV SERVER (1-CLICK, RELIABLE)

Use the VS Code Task (recommended):

- Task: start-dev-premium-invest-8 (reliable, waits ready)
  - What it does: kills anything stuck on port 3000 → starts Next dev in premium-invest-8 → waits until http://localhost:3000/ is reachable.

Optional stop task:

- Task: stop-dev-premium-invest-8 (3000)

Logs if startup fails:

- premium-invest-8/dev_out.log
- premium-invest-8/dev_err.log

If you need to run scripts manually:

- premium-invest-8/scripts/start-dev-server.ps1
- premium-invest-8/scripts/stop-dev-server.ps1

## 💳 RAZORPAY (TEST MODE) REQUIRED ENV VARS

If the UI shows "razorpay_not_configured", set these (do NOT commit real values):

- RAZORPAY_KEY_ID
- RAZORPAY_KEY_SECRET

See premium-invest-8/.env.example for placeholders.

**You must read these 2 files FIRST:**

### 1️⃣ **`AI_DESIGN_RULES.md`** ← MASTER GUIDE
- How to add new pages without conflicts
- - CSS structure and organization
  - - v0.dev integration instructions
    - - File naming conventions
      - - Examples and templates
       
        - ### 2️⃣ **`.github/CONTRIBUTING.md`** ← QUICK CHECKLIST
        - - Quick summary of rules
          - - Common mistakes to avoid
            - - When you're unsure, stop and ask
              - 
              ---

              ## 🚨 WHY THIS MATTERS

              This project uses **specific CSS rules** to prevent conflicts between:
              - Multiple AIs working on the same project
              - - v0.dev designs and custom CSS
                - - Different pages and components
                 
                  - **If you don't follow these rules, you WILL break the design.**
                 
                  - ---

                  ## ⏱️ QUICK START (5 MINUTES)

                  1. **Read:** `AI_DESIGN_RULES.md` (full guide - 10 min)
                  2. 2. **Skim:** `.github/CONTRIBUTING.md` (checklist - 2 min)
                     3. 3. **Look:** at existing pages in `frontend/src/components/v0-pages/` (examples)
                        4. 4. **Then:** Start coding following the patterns you see
                          
                           5. ---
                          
                           6. ## 📌 THE GOLDEN RULE
                          
                           7. **Every new page/component gets:**
                           8. - ✅ Its own folder in `frontend/src/components/v0-pages/pagename/`
                              - - ✅ Its own CSS file: `pagename.module.css`
                                - - ✅ Its own component: `PageNameComponent.jsx`
                                  - - ✅ README.md with instructions
                                   
                                    - **This = ZERO conflicts, clean organization**
                                   
                                    - ---

                                    ## 🚫 DON'T DO THIS

                                    ```
                                    ❌ Add CSS to App.css for a specific page
                                    ❌ Copy styles from other pages
                                    ❌ Use !important flags everywhere
                                    ❌ Mix v0 designs with custom CSS
                                    ❌ Change other pages' CSS files
                                    ```

                                    ---

                                    ## ✅ DO THIS INSTEAD

                                    ```
                                    ✅ Create new .module.css file
                                    ✅ Keep styles isolated and scoped
                                    ✅ Use Tailwind for common utilities
                                    ✅ Keep v0 designs separate
                                    ✅ Document your changes
                                    ```

                                    ---

                                    ## 📚 FILES YOU NEED TO READ

                                    | File | Purpose | Time |
                                    |------|---------|------|
                                    | `AI_DESIGN_RULES.md` | Complete guide | 10 min |
                                    | `.github/CONTRIBUTING.md` | Quick checklist | 2 min |
                                    | Existing pages | Real examples | 5 min |

                                    ---

                                    ##  I'M AN AI, WHAT DO I DO NOW?

                                    **Step 1:** Navigate to the root of this repo
                                    **Step 2:** Open file: `AI_DESIGN_RULES.md`
                                    **Step 3:** Read the entire file
                                    **Step 4:** Then start making changes

                                    **If you're unsure about something, ASK BEFORE CODING.**

                                    ---

                                    ## 🆘 EMERGENCY QUESTIONS?

                                    - "Where do I put the CSS?" → Read `AI_DESIGN_RULES.md` section "File Naming Convention"
                                    - - "Should I use App.css?" → NO. Use module.css. See examples.
                                      - - "Will this affect other pages?" → Only if you ignore the rules. Follow the structure.
                                        - - "How do I add a v0 design?" → See `AI_DESIGN_RULES.md` section "V0.DEV INTEGRATION CHECKLIST"
                                         
                                          - ---

                                          ## ✨ YOU'RE READY!

                                          Once you've read both files, you know everything you need to work on this project WITHOUT breaking it.

                                          **Good luck! 🚀**
