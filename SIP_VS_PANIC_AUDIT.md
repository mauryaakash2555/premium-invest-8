# SIP vs Panic Selling Simulator — Audit Checklist (Release-Ready)

Date: 2026-01-22  
Project: `premium-invest-8` (bmwealth.co.in)

This document audits the **SIP vs Panic Selling Simulator** end-to-end: routing, correctness guarantees, UI/UX, SEO/schema, analytics, compliance disclaimers, and QA commands.

---

## 0) Executive Summary

### What this is
A premium, educational simulator at `/intelligence/sip-vs-panic` showing the **behavioural cost of stopping SIPs / panic selling** during market drawdowns.

### What’s verified working (high confidence)
- Canonical route loads successfully (HTTP 200).
- Redirects from legacy slugs → canonical route.
- JSON-LD is present in the HTML.
- Post-tax results include a visible **“Tax paid”** line item (₹0 shown when exempt).
- Learning bubbles (popover tips) render reliably (Radix Popover dependency installed).
- Analytics endpoint returns 200 even when storage backend isn’t configured (reduces local/dev noise).

### Known constraints (intentional)
- The model is a deterministic educational simulation; it is **not** market advice.
- Tax logic is simplified/India-first (e.g., equity LTCG exemption handling); it’s an approximation.

---

## 1) Route + Redirects

### Canonical page
- App Router page: [app/intelligence/sip-vs-panic/page.jsx](app/intelligence/sip-vs-panic/page.jsx)

### Redirect sources
Redirects are defined in Next config:
- [next.config.mjs](next.config.mjs)

Expected behavior:
- `/intelligence/sip-vs-panic-selling` → `/intelligence/sip-vs-panic`
- `/intelligence/sip-vs-panic-simulator` → `/intelligence/sip-vs-panic`
- `/intelligence/stop-sip-during-crash` → `/intelligence/sip-vs-panic`

---

## 2) Core Simulator Logic (Correctness + Determinism)

### Simulation entrypoint
- [intelligence/simulations/sip-vs-panic.ts](intelligence/simulations/sip-vs-panic.ts)

Properties guaranteed by tests:
- Required scenarios execute and return consistent shaped results.
- `taxPaid` is surfaced and consistent with `postTaxCorpus = max(0, finalCorpus - taxPaid)`.

### Tax implementation
- [intelligence/engine/tax.ts](intelligence/engine/tax.ts)

Audit notes:
- Tax computation is intentionally simplified and designed for explanation transparency.
- UI should always show “Tax paid” (including ₹0) to avoid ambiguity.

---

## 3) UI Surface (Spec Alignment)

### Main container
- [intelligence/ui/sip-panic/SIPPanicPage.tsx](intelligence/ui/sip-panic/SIPPanicPage.tsx)

Key subcomponents:
- Inputs: [intelligence/ui/sip-panic/SIPInputForm.tsx](intelligence/ui/sip-panic/SIPInputForm.tsx)
- Scenario selection: [intelligence/ui/sip-panic/ScenarioSelector.tsx](intelligence/ui/sip-panic/ScenarioSelector.tsx)
- Results + KPI cards: [intelligence/ui/sip-panic/ResultsDashboard.tsx](intelligence/ui/sip-panic/ResultsDashboard.tsx)
- Chart 1 (timeline): [intelligence/ui/sip-panic/TimelineChart.tsx](intelligence/ui/sip-panic/TimelineChart.tsx)
- Chart 2 (drawdown pain): [intelligence/ui/sip-panic/DrawdownPainChart.tsx](intelligence/ui/sip-panic/DrawdownPainChart.tsx)
- Expanders/details: [intelligence/ui/sip-panic/CalculationDetails.tsx](intelligence/ui/sip-panic/CalculationDetails.tsx)
- Hero framing: [intelligence/ui/sip-panic/BehavioralCostHero.tsx](intelligence/ui/sip-panic/BehavioralCostHero.tsx)

### “Ultra-luxury” styling constraint
Interactive accents are kept consistent by using the existing gold token (no new hard-coded gold shades).

### Learning bubbles
- Component: [intelligence/ui/sip-panic/LearningBubble.tsx](intelligence/ui/sip-panic/LearningBubble.tsx)
- Popover primitive: [components/ui/popover.jsx](components/ui/popover.jsx)

Audit notes:
- “Don’t show again” preference is persisted to avoid nagging.
- Popover dependency is required: `@radix-ui/react-popover`.

---

## 4) SEO + Schema

### Metadata + JSON-LD
- Page metadata/JSON-LD injection: [app/intelligence/sip-vs-panic/page.jsx](app/intelligence/sip-vs-panic/page.jsx)
- Default site metadata helpers (OG defaults): [lib/seo/metadata.js](lib/seo/metadata.js)

Checklist:
- JSON-LD script tag present: `application/ld+json`
- Canonical URL aligns with `/intelligence/sip-vs-panic`

---

## 5) Analytics + Telemetry (Local Resilience)

### Client → server event sink
- API route: [app/api/events/route.js](app/api/events/route.js)

Expected behavior:
- Returns **HTTP 200** for allowlisted events.
- If storage backend is not configured (local/dev), responds with `{ ok: true, stored: false, error: "setup_required" }` (no 5xx spam).

---

## 6) QA Commands (Repeatable)

### Quick HTTP smoke test (redirects + schema + events)
- Script: [\.tools/qa-sip-vs-panic.ps1](.tools/qa-sip-vs-panic.ps1)

Run:
- `pwsh -NoProfile -ExecutionPolicy Bypass -File .tools\\qa-sip-vs-panic.ps1`

Output:
- Writes report to `.tmp_qa_sip_v_panic.txt`

### Targeted unit tests
Run:
- `npm test -- tests/intelligence/step2-sip-vs-panic.spec.ts tests/intelligence/tax-capital-gains.spec.ts`

---

## 7) Current Audit Status (2026-01-22)

### Automated checks (PASS)
- Redirects → canonical: PASS
- Canonical route status: PASS (200)
- JSON-LD present: PASS
- `/api/events` status: PASS (200)
- Jest (targeted simulator + tax): PASS

---

## 8) Risks / Follow-ups (Optional)

- Consider adding an explicit user-facing note that tax rules are simplified and may differ by instrument/holding period updates.
- Consider basic accessibility pass: keyboard focus order across inputs → charts → details; popover focus trap behavior.
- Consider adding a lightweight Playwright smoke test for `/intelligence/sip-vs-panic` to guard against future runtime/module errors.
