# 🔒 CORE PROTECTED MODULES - DO NOT EDIT

## ⚠️ CRITICAL WARNING FOR ALL AI ASSISTANTS AND DEVELOPERS

**THIS FOLDER CONTAINS LOCKED, PRODUCTION-CRITICAL CODE.**

### Rules:
1. **NEVER modify files in this folder** unless specifically instructed by Akash
2. **NEVER import anything into these files** from outside the core folder
3. **NEVER refactor, rename, or move** any file in this folder
4. **NEVER add dependencies** to these modules

### What's Protected:
- `marketTicker/` - Live market data ticker (home page)
- `chat/` - AI chat widget and all chat logic
- `admin/` - Admin login, authentication, session management

### Why This Exists:
These components broke repeatedly due to:
1. Accidental edits during unrelated refactors
2. Import path changes breaking dependencies
3. Shared state mutations
4. CSS class name conflicts

### How It Works:
1. Each module is 100% self-contained
2. Zero external dependencies (except React/Next.js basics)
3. All styles are CSS modules (scoped)
4. All state is local (no global stores)
5. All API calls are isolated within each module

### If You MUST Edit:
1. Create a backup first
2. Test in isolation
3. Get explicit approval
4. Document the change

---
Last locked: 2026-01-07
Locked by: Copilot under instruction from Akash
