# Modularization (Phase 3) - LEGO Blocks

This repo is structured so features can be toggled, removed, or replaced with minimal coupling.

## Key Directories
- `config/`: runtime configuration (`env`, `constants`, `features`)
- `lib/ai/`: AI providers + orchestrator
- `lib/db/`: database modules (one module per table)
- `lib/plugins/`: plugin hooks
- `components/user|admin|shared/`: UI components grouped by area
- `features/`: feature documentation + plugins
- `templates/`: starter files for new features
- `scripts/build/`: automation scripts (add/remove feature)

## How to Add a New Feature (step-by-step)
1. Decide the module boundary (UI / API / DB).
2. Add a feature flag to `config/features.js`.
3. Document it in `features/FEATURES.md`.
4. (Optional) Add a plugin under `features/plugins/` and register via `features/plugins/index.js`.
5. Wrap usage with `isFeatureEnabled('<FLAG_NAME>')` in UI or API.

## How to Remove a Feature Safely
- Prefer **moving** files into `DELETE_ME/` first (easy rollback).
- Update `features/FEATURES.md` and remove imports from core routes/components.
- Run smoke tests.

## How to Modify an Existing Feature
- Keep changes inside its module:
  - AI provider work in `lib/ai/*`
  - DB work in `lib/db/*`
  - UI work in `components/*`
  - API work in `app/api/*`
- Avoid cross-importing between feature modules; prefer shared utilities in `lib/utils`.
