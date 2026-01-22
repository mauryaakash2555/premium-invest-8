# VS CODE AGENT TASK: STEP 1 - CORE ENGINE BUILD

## YOUR MISSION
Build the core real-world financial simulator engine for India.

**Focus ONLY on logic, not UI.**

---

## WHAT YOU MUST BUILD

### 1. TIME ENGINE (`/engine/time.py` or `/engine/time.ts`)
- Simulate time progression (months/years)
- Support fast-forward and parallel timelines
- Handle calendar logic (trading days, holidays)

### 2. MARKET ENGINE (`/engine/market.py` or `/engine/market.ts`)
- Simulate market regimes: bull, bear, sideways, crash
- Generate realistic returns distribution
- Model volatility clustering
- Include drawdown events

### 3. ASSET CALCULATORS (`/engine/assets/`)
Each asset type gets own module:

**MutualFund:**
- NAV calculation
- Exit load logic (1% if <1 year)
- Tax treatment (LTCG 12.5%, STCG 20%)
- Expense ratio drag
- SIP variant (rupee cost averaging)

**Stocks:**
- Price simulation
- Dividend modeling
- STT + brokerage costs
- Tax (LTCG 12.5% above ₹1.25L, STCG 20%)

**FD (Fixed Deposit):**
- Interest calculation (quarterly/annual)
- TDS deduction (10% if interest > ₹40k)
- Premature withdrawal penalty (1-2%)

**Insurance:**
- Premium calculation
- Coverage simulation
- Claim probability modeling

### 4. BEHAVIOR ENGINE (`/engine/behavior.py` or `/engine/behavior.ts`)
Model investor behaviors:
- `panic_sell`: Sells at X% drawdown
- `stop_sip`: Pauses SIP during fall
- `delay_start`: Postpones by N months
- `perfect_discipline`: Never deviates
- `overconfident`: Increases risk after gains

### 5. TAX ENGINE (`/engine/tax.py` or `/engine/tax.ts`)
- LTCG/STCG calculations
- TDS logic
- Indexation benefit (where applicable)
- Section 80C deductions

### 6. COST ENGINE (`/engine/costs.py` or `/engine/costs.ts`)
- Opportunity cost of delay
- Inflation erosion
- Exit loads
- Expense ratios
- Transaction costs

---

## TECH REQUIREMENTS

### Language Choice
- **Python:** Use if numerical computing focus
- **TypeScript:** Use if web integration focus

### Code Quality Standards
- Type hints/types on all functions
- Docstrings on all public functions
- No magic numbers (use named constants)
- Pure functions (no side effects)
- Unit tests for each module

### Performance
- Simulate 30 years in <1 second
- Support 10 parallel scenarios
- Efficient memory usage

---

## INDIA-SPECIFIC RULES (NON-NEGOTIABLE)

### Currency
- Always ₹ (INR)
- Never $ or other currency

### Tax Rules (As of 2025)
- Equity MF LTCG: 12.5% (>1 year)
- Equity MF STCG: 20% (<1 year)
- Debt MF: Taxed at slab rate
- FD: TDS 10% if interest > ₹40,000

### Inflation
- Use 5-7% annual baseline
- Model variation (4-9% range)

### Market Hours
- NSE/BSE: 9:15 AM - 3:30 PM
- Account for holidays

---

## OUTPUT STRUCTURE

Your code should export these core functions:

```python
# or TypeScript equivalent

# Time Engine
def create_timeline(start_date, end_date, frequency='monthly')
def fast_forward(timeline, years)
def create_parallel_timelines(base_timeline, count)

# Market Engine
def simulate_market_regime(timeline, regime_type, volatility)
def generate_returns(timeline, asset_class, market_regime)
def calculate_drawdowns(returns_array)

# Asset Calculators
def calculate_mf_returns(initial, timeline, sip_amount, market_returns, behavior)
def calculate_stock_returns(initial, timeline, market_returns, dividends, behavior)
def calculate_fd_returns(principal, rate, tenure, tax_slab)

# Behavior Modifiers
def apply_panic_selling(returns, threshold)
def apply_sip_discontinuation(sip_flow, trigger_event)
def apply_delay_cost(timeline, delay_months)

# Tax Engine
def calculate_capital_gains_tax(gains, holding_period, asset_type)

# Cost Engine
def calculate_opportunity_cost(delayed_amount, market_returns, delay_period)
def calculate_inflation_erosion(amount, years, inflation_rate)
```

---

## SELF-VERIFICATION CHECKLIST

After building, you MUST verify:

### ✅ Functionality
- [ ] All modules can be imported without errors
- [ ] Sample calculations run successfully
- [ ] Edge cases handled (zero, negative, very large numbers)

### ✅ Code Quality
- [ ] No hardcoded values (except constants file)
- [ ] Type hints present
- [ ] Docstrings clear
- [ ] No circular imports

### ✅ India Compliance
- [ ] Currency is ₹
- [ ] Tax rates match current rules
- [ ] Market hours realistic
- [ ] Inflation rates realistic

### ✅ Extensibility
- [ ] New asset types can be added easily
- [ ] New behaviors can be plugged in
- [ ] New market regimes can be added

### ✅ Performance
- [ ] 30-year simulation completes in <1s
- [ ] Memory usage is reasonable
- [ ] Can run multiple scenarios in parallel

---

## TEST CASES YOU MUST RUN

### Test 1: Basic SIP
```
Input:
- ₹10,000/month SIP
- 10 years
- 12% annual return (equity MF)
- Perfect discipline (no panic)

Expected Output:
- Final corpus: ~₹23L
- XIRR: ~12%
- Tax on gains calculated correctly
```

### Test 2: Panic Selling
```
Input:
- Same as Test 1
- But: Sell everything if market falls 20%
- Market crash in Year 3

Expected Output:
- Lower final corpus
- Lost compounding quantified
- Behavioral cost highlighted
```

### Test 3: FD vs MF
```
Input:
- ₹10L invested
- FD: 7% (with TDS)
- MF: 12% (with LTCG)
- 10 years

Expected Output:
- Post-tax comparison
- Inflation-adjusted real returns
```

---

## WHAT NOT TO BUILD YET

❌ Don't build UI components
❌ Don't build API endpoints
❌ Don't build database schemas
❌ Don't build product catalogs
❌ Don't build recommendation logic

Focus ONLY on pure simulation logic.

---

## FINAL INSTRUCTION

After completing the build:

1. Run all test cases
2. Document any assumptions made
3. List any India-specific rules you implemented
4. Note any areas that need human review
5. Report completion with verification checklist

---

**Remember:** This engine will power 200+ tools later.
Build it bulletproof.
No shortcuts.
