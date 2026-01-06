# 🤖 START HERE FOR AIs (Fast Navigation)

This repo is a **Next.js 15 (App Router)** project. The goal of this file is to make changes fast and safe: where to edit, what to avoid, and how to run/deploy.

## 0) Don’t waste time in the wrong folder

- **Edit source code in the repo root**: `premium-invest-8/`
- **Avoid editing build output**: `.next/` (generated)
- **Worktrees**: `premium-invest-8.worktrees/` contains alternate checkouts. Only work there if you intentionally opened/are running that worktree.

If you see search results only in `.next/`, that means you’re looking at compiled output — go find the real source in `app/` or `components/`.

## 1) Read first (project rules + structure)

1. `AI_DESIGN_RULES.md` (design + CSS safety rules)
2. `.github/CONTRIBUTING.md` (quick checklist)
3. `docs/ARCHITECTURE.md` (what lives where)

## 2) Quick commands (local dev)

From repo root:

```bash
npm install
npm run dev
```

Default dev URL: `http://localhost:3000`

## 3) Where things live (the 20-second map)

- `app/` — Next.js pages (routes) and layouts
- `app/api/` — Next.js Route Handlers (server endpoints)
- `components/` — shared React components
- `components/calculators/` — calculators (Property vs SIP, etc.)
- `lib/` — utilities, env handling, Supabase admin client, admin session
- `data/` — blog/content JSON + static data
- `public/` — static assets
- `scripts/` — validations, backups, helpers

Legacy / usually ignore unless asked:

- `frontend/` — old CRA frontend
- `backend/` — old Python backend
- `api/` — legacy Vercel serverless functions

## 4) “Where do I edit THIS?” (common locations)

- **Home page** → `app/page.jsx`
- **Static marketing pages** → `app/<route>/page.(js|jsx)`
- **Calculator pages** → usually `app/tools/<tool>/page.(js|jsx)`
- **Calculator UI logic** → `components/calculators/<Name>.jsx`
- **Chat (AI concierge)** → `app/api/chat/route.js`
- **Leads capture** → `app/api/leads/route.js`
- **Admin endpoints** → `app/api/admin/**/route.js`

Example:
- The premium message/copy for Property vs SIP is in `components/calculators/PropertyVsSipCalculator.jsx`.

## 5) Staging deploy (GitHub → Vercel)

Staging is driven by the `staging` branch.

- Script: `update-staging.ps1`
- Important: the script checks out branches and merges. **Commit your changes first** or they can be lost.

Typical safe flow:

```bash
git status
git add -A
git commit -m "<message>"
./update-staging.ps1
```

## 6) Search tips (fast + accurate)

- Prefer searching in: `app/`, `components/`, `lib/`, `data/`.
- If results appear in `.next/` only, the source is elsewhere.
- When copy is dynamic, search by a nearby stable label/CTA (e.g. `₹399`, component name, or section header).

## Golden rules (keep it safe)

- Don’t refactor unrelated files “for cleanliness”.
- Don’t touch `.next/`, `node_modules/`.
- Keep styling consistent with existing Tailwind + design tokens.
- If you’re unsure which folder is the active checkout (root vs worktree), verify before editing.
