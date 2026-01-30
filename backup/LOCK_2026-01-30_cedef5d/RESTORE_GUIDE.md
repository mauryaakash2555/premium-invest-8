# Locked Website Backup — 2026-01-30 (cedef5d)

This folder contains a reproducible snapshot of the website code at the exact locked git commit.

## What’s included
- `premium-invest-8_2026-01-30_cedef5d_git-archive.zip`
  - A `git archive` of commit `cedef5d85350c92e1520c1e6626f91d589a63197`
  - Includes tracked source/config files exactly as committed
  - Does **not** include `node_modules`, `.next`, or other build outputs

## How to restore
1. Unzip `premium-invest-8_2026-01-30_cedef5d_git-archive.zip` to a new folder.
2. Install dependencies:
   - `npm ci`
3. Run locally:
   - `npm run dev`
4. Production build check:
   - `npm run build`

## Lock reference
- Tag: `LOCK-2026-01-30-cedef5d`
- Commit: `cedef5d85350c92e1520c1e6626f91d589a63197`

## Notes
- If your deployment needs environment variables, restore them from your secret manager / hosting provider (not stored in this backup).
