# BM WEALTH INTELLIGENCE OS - ARCHITECTURE BLUEPRINT

## VERIFICATION CHECKLIST (VS Code Agent Must Check After Each Build)

### ✅ STEP 0: STRUCTURE VERIFICATION
- [ ] `/intelligence/engine` exists
- [ ] `/intelligence/simulations` exists
- [ ] `/intelligence/decisions` exists
- [ ] `/intelligence/behaviour` exists
- [ ] `/intelligence/learning` exists
- [ ] `/intelligence/ui` exists
- [ ] `/intelligence/data` exists

---

## CORE PRINCIPLES (NON-NEGOTIABLE)

### 1. ONE ENGINE, MANY MODES
- Core simulator is a PURE LOGIC layer
- UI components consume engine outputs
- No business logic in UI
- No UI concerns in engine

### 2. MODULAR & EXTENSIBLE
- Each module can be tested independently
- New asset types can be added without breaking existing logic
- New behaviors can be plugged in
- New market conditions can be simulated

### 3. INDIA-FIRST REALISM
- Tax rules (LTCG, STCG, TDS)
- Inflation patterns
- Regulatory constraints (exit loads, lock-ins)
- Market hours, holidays
- Currency (₹, not $)

### 4. NO ADVICE, ONLY CONSEQUENCES
- Never say "do this"
- Always show "if you do this, then..."
- Multiple parallel outcomes
- User decides, system educates

---

## FOLDER RESPONSIBILITIES

### `/engine`
**Purpose:** Pure simulation logic  
**Contains:**
- Time machine (fast-forward, rewind, parallel)
- Market cycle engine (bull, bear, sideways, shock)
- Asset calculators (MF, SIP, stocks, FD, insurance)
- Behavior modifiers (panic, discipline, delay)
- Tax engine
- Inflation engine
- Cost calculators

**Rules:**
- No UI imports
- No hardcoded product names
- All inputs via parameters
- All outputs as data structures
- Fully deterministic (same inputs = same outputs)

---

### `/simulations`
**Purpose:** Pre-built scenarios using engine  
**Examples:**
- SIP vs Panic Selling
- FD vs MF after tax
- Delay cost simulator
- Life shock scenarios

**Rules:**
- Each simulation is self-contained
- Must have clear learning objective
- Must show consequences, not advice

---

### `/decisions`
**Purpose:** Strategy elimination & fit analysis  
**Examples:**
- MF vs PMS decision map
- Product elimination engine
- Drawdown tolerance tester

**Rules:**
- Never ranks products
- Only shows fit/mismatch
- Behavior-first, returns-second

---

### `/behaviour`
**Purpose:** Behavioral finance systems  
**Examples:**
- Financial autopsy
- Bias detector
- Decision fatigue meter
- Regret attribution

**Rules:**
- Non-judgmental tone
- Evidence-based patterns
- Educational, not prescriptive

---

### `/learning`
**Purpose:** Knowledge translation & explanation  
**Examples:**
- Financial language translator
- RBI policy decoder
- Misunderstanding index

**Rules:**
- Plain language always
- Progressive disclosure
- Context-aware depth

---

### `/ui`
**Purpose:** React components & UX patterns  
**Examples:**
- Bubble tooltip system
- Timeline visualizer
- Comparison cards
- Scenario selectors

**Rules:**
- Consumes engine data only
- No business logic
- Accessible (WCAG)
- Mobile-first

---

### `/data`
**Purpose:** Reference data & constants  
**Examples:**
- Tax slabs
- Inflation benchmarks
- Market historical patterns
- Product structures

**Rules:**
- Easily updatable
- Version controlled
- Source documented

---

## ENGINE ARCHITECTURE (STEP 1 FOCUS)

### Core Modules Required

#### 1. TIME ENGINE
```
Input: start_date, end_date, speed_multiplier
Output: timeline_array with market_state at each point
```

#### 2. MARKET ENGINE
```
Input: timeline, regime (bull/bear/sideways)
Output: returns_array, volatility_array, drawdown_events
```

#### 3. ASSET CALCULATORS
```
MutualFund:
  - NAV simulation
  - Exit load logic
  - Tax treatment (LTCG/STCG)
  - Expense ratio drag

SIP:
  - Rupee cost averaging
  - Compounding logic
  - Discontinuation scenarios

Stocks:
  - Price simulation
  - Dividend logic
  - STT/brokerage

FD:
  - Interest calculation
  - TDS logic
  - Premature withdrawal penalty

Insurance:
  - Coverage simulation
  - Premium logic
  - Claim scenarios
```

#### 4. BEHAVIOR ENGINE
```
Behaviors to model:
  - panic_sell: triggers at X% drawdown
  - delay_start: postpones investment by N months
  - stop_sip: pauses during market fall
  - overconfidence: increases risk after gains
  - inertia: never rebalances
```

#### 5. TAX ENGINE
```
Inputs: asset_type, holding_period, gains
Output: post_tax_returns, effective_rate
```

#### 6. COST ENGINE
```
Calculate:
  - Opportunity cost of delay
  - Inflation erosion
  - Exit loads
  - Expense ratios
  - Transaction costs
```

---

## VERIFICATION PROTOCOL (CRITICAL)

After each module build, VS Code agent must verify:

### ✅ CODE QUALITY
- [ ] No hardcoded values (use constants)
- [ ] All functions have type hints
- [ ] All functions have docstrings
- [ ] No circular dependencies
- [ ] Pure functions (no side effects)

### ✅ TESTING
- [ ] Unit tests for each calculator
- [ ] Edge cases covered (0, negative, infinity)
- [ ] India-specific scenarios tested
- [ ] Behavior combinations tested

### ✅ EXTENSIBILITY
- [ ] Can add new asset type without breaking existing
- [ ] Can add new behavior without refactoring
- [ ] Can add new market regime easily

### ✅ PERFORMANCE
- [ ] Can simulate 30 years in <1 second
- [ ] Can run 10 parallel scenarios simultaneously
- [ ] No memory leaks

### ✅ INDIA COMPLIANCE
- [ ] Tax calculations match current SEBI/IT rules
- [ ] Currency always ₹
- [ ] Market hours realistic
- [ ] Inflation rates realistic (4-8% range)

---

## NEXT STEPS SEQUENCE

1. **TODAY (Step 1):** Build engine core modules
2. **Day 2:** Build decision framework
3. **Day 3:** Build first simulation (SIP vs Panic)
4. **Day 4-7:** Add MF/PMS logic + behavioral systems
5. **Day 8-10:** Build Intelligence Hub UI
6. **Day 11-15:** Internal testing + polish

---

## ANTI-PATTERNS (NEVER DO THIS)

❌ Building UI before engine is solid
❌ Hardcoding product names or recommendations
❌ Mixing business logic with presentation
❌ Using US-centric assumptions (401k, USD, etc.)
❌ Oversimplifying for "MVP" sake
❌ Adding features before core is bulletproof

---

## SUCCESS CRITERIA

This system is ready when:
✅ Staff can ask any "what if" question and get answer
✅ Simulator can run ANY asset combination
✅ Results are defensible (show your math)
✅ SEBI-lawyer would approve
✅ Schools would trust it
✅ CXOs would respect it

---

**LAST REMINDER TO VS CODE AGENT:**

You are not building a tool.
You are building financial cognition infrastructure.
Think 10 years ahead.
Design for 200+ modules.
Build foundation that cannot break.
