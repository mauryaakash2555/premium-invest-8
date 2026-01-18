# Dependency Map

Shows what depends on what.

## If you change Supabase schema
- ⚠️ Affects: `lib/db/*.js`
- ⚠️ Affects: `app/api/*` routes that call DB modules
- ✅ Test: lead capture, chat history, admin dashboard, analytics

## If you change AI provider logic
- ⚠️ Affects: `lib/ai/provider.js`, `lib/ai/*`
- ⚠️ Affects: `app/api/chat/route.js` and `app/api/admin/strategy/route.js`
- ✅ Test: chat replies in user mode + admin strategy

## If you change feature flags
- ⚠️ Affects: `config/features.js`
- ⚠️ Affects: any code that imports `isFeatureEnabled`
- ✅ Test: toggle via env (server: `FEATURE_*`, client: `NEXT_PUBLIC_FEATURE_*`)

## If you change constants
- ⚠️ Affects: entire app via `config/constants.js`
- ✅ Test: smoke test core flows

## Safe to change (isolated)
- ✅ UI components in `components/shared/*`
- ✅ Individual plugins in `features/plugins/*`
- ✅ Documentation files






