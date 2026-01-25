# STEP 1 Verification Report (Core Engine Build)

Date: 2026-01-22

This report documents Step 1 completion for the core India-first financial simulator engine (logic-only).

## What Was Implemented

- **Time engine**: timeline creation, fast-forward, parallel timelines
- **Market engine**: bull/bear/sideways/crash regimes, volatility clustering, drawdowns
- **Asset calculators** (`intelligence/engine/assets/*`): Mutual Fund (SIP), Stocks, FD, Insurance
- **Behavior engine**: panic selling, SIP discontinuation, delay cost (+ toggle aliases)
- **Tax engine**: equity LTCG/STCG, exemption handling, debt MF slab proxy; placeholders for indexation + 80C
- **Cost engine**: opportunity cost, inflation erosion, expense ratio drag, exit load

## India-Specific Rules Implemented (as per STEP_1_PROMPT.md)

- Currency baseline: **₹ (INR)** via constants
- Equity tax baseline:
  - LTCG: **12.5%** (holding >= 12 months)
  - STCG: **20%** (holding < 12 months)
  - Annual LTCG exemption: **₹1.25L** (calculator-level simplification)
- FD:
  - TDS: **10%** if annual interest > **₹40,000** (simplified)
  - Slab tax on interest via `taxSlabRate` (education-only proxy)
- Mutual fund exit load:
  - **1%** if redeemed within **12 months**
- NSE/BSE market hours + holiday support: modeled via timeline “last trading day” selection + pluggable holiday set

## Assumptions / Simplifications (Need Human Review)

- SIP/MF holding period is approximated (average holding = half horizon) for tax categorization.
- LTCG exemption is applied as a single annual exemption on the realized gains at redemption (not lot-by-lot).
- FD taxation is simplified using `taxSlabRate`; TDS is treated as withheld and netted against total tax.
- Insurance is modeled as premium payments + claim probability only (no product-specific rules).
- Market return models are education-focused and not calibrated to historical distributions.

## Self-Verification Checklist

### ✅ Functionality
- [x] All modules import without errors (validated via Jest imports)
- [x] Sample calculations run successfully (Step 1 tests)
- [x] Edge cases handled reasonably (non-negative clamping in calculators)

### ✅ Code Quality
- [x] Public functions are typed and documented with JSDoc
- [x] No UI imports in engine
- [x] Constants centralized in `intelligence/engine/constants.ts`
- [x] No circular imports detected during tests

### ✅ India Compliance
- [x] Currency is ₹
- [x] Tax rates match Step 1 rules
- [x] Market hours + holiday set are supported in the time engine
- [x] Inflation erosion supports 4–9% inputs (caller-driven)

### ✅ Extensibility
- [x] New asset calculators can be added under `intelligence/engine/assets/`
- [x] New behaviors can be added under `intelligence/engine/behavior/modifiers.ts`
- [x] New regimes can be added via `MarketCycle` + market engine mappings

### ✅ Performance
- [x] 30-year simulation completes in < 1s locally
- [x] 10 parallel scenarios supported (verified in Jest performance test)

## Tests Executed

Jest suite: `tests/intelligence/step1-engine.spec.ts`

- Test 1: Basic SIP (~₹23L pre-tax)
- Test 2: Panic selling after Year-3 crash reduces corpus
- Test 3: FD vs MF post-tax and inflation-adjusted comparison
- Performance: 30-year simulation with 10 parallel scenarios (<1s)
