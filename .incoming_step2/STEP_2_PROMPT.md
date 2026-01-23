# VS CODE AGENT TASK: STEP 2 - SIP VS PANIC SIMULATOR

## YOUR MISSION
Build the flagship simulator: **SIP vs Panic Selling**

This will be BM Wealth's viral entry point - the tool that makes people understand behavioral cost.

---

## WHY THIS SIMULATOR MATTERS

Most Indians know SIP is "good" but don't understand:
- What happens if they stop during a crash
- How much they lose by panicking
- Why discipline beats timing

This simulator shows them the **cost of fear**.

---

## WHAT YOU MUST BUILD

Location: `/intelligence/simulations/sip-vs-panic.ts`

### Core Function Signature

```typescript
interface SIPScenario {
  name: string;
  description: string;
  behaviorType: 'discipline' | 'panic' | 'custom';
  panicThreshold?: number; // e.g., -20 means sell at 20% drawdown
  stopDuration?: number; // months to pause SIP
}

interface SIPSimulationResult {
  scenario: SIPScenario;
  timeline: TimelinePoint[];
  finalCorpus: number;
  totalInvested: number;
  absoluteGains: number;
  xirr: number;
  postTaxCorpus: number;
  behavioralCost: number; // vs perfect discipline
  lostOpportunity: number;
  insights: string[];
  chartData: ChartDataPoint[];
}

function simulateSIPVsPanic(
  monthlyAmount: number,
  durationYears: number,
  scenarios: SIPScenario[],
  marketConditions?: MarketConditions
): SIPSimulationResult[]
```

---

## REQUIRED SCENARIOS (Pre-built)

### 1. Perfect Discipline
```typescript
{
  name: "Perfect Discipline",
  description: "Never stops SIP, regardless of market conditions",
  behaviorType: "discipline"
}
```

### 2. Panic at 20% Drawdown
```typescript
{
  name: "Panic at 20% Fall",
  description: "Stops SIP when market falls 20% from peak, never resumes",
  behaviorType: "panic",
  panicThreshold: -20
}
```

### 3. Panic at 40% Drawdown
```typescript
{
  name: "Panic at 40% Fall",
  description: "Stops SIP when market falls 40% from peak, never resumes",
  behaviorType: "panic",
  panicThreshold: -40
}
```

### 4. Stop During Any Fall
```typescript
{
  name: "Stop During Any Fall",
  description: "Pauses SIP during any negative month, resumes when positive",
  behaviorType: "panic",
  panicThreshold: -1
}
```

### 5. Custom (User-defined)
```typescript
{
  name: "Custom Behavior",
  description: "User defines panic threshold and resume logic",
  behaviorType: "custom",
  panicThreshold: -30, // example
  stopDuration: 6 // example: pause for 6 months then auto-resume
}
```

---

## SIMULATION LOGIC (Step-by-Step)

### Phase 1: Setup
1. Create timeline (10-30 years, monthly frequency)
2. Generate market regime (include at least one major crash)
3. Initialize portfolio state for each scenario

### Phase 2: Monthly Loop
For each month in timeline:
1. Check market conditions
2. For each scenario:
   - Check if panic threshold hit
   - If panicked: stop SIP contribution
   - If disciplined: continue SIP
   - Calculate NAV change
   - Record portfolio value
   - Track invested amount

### Phase 3: Crash Injection (Critical)
Ensure timeline includes:
- At least one 30-40% crash (Year 3-5)
- Recovery period (12-24 months)
- Secondary correction (optional, Year 7-8)

This is NOT random - it's designed to teach.

### Phase 4: Final Calculations
For each scenario:
1. Calculate final corpus (pre-tax)
2. Apply LTCG tax (12.5% on gains above ₹1.25L)
3. Calculate XIRR
4. Compute behavioral cost (vs perfect discipline)
5. Generate insights

---

## INSIGHTS GENERATION (VERY IMPORTANT)

System must auto-generate insights based on simulation:

### Required Insights:

**For Perfect Discipline:**
```typescript
[
  "Invested consistently through market crash in Year 3",
  "Lower average purchase price due to rupee-cost averaging",
  "Compounding accelerated post-recovery",
  "Final corpus: ₹XX.XL (XIRR: XX.X%)"
]
```

**For Panic Scenarios:**
```typescript
[
  "Stopped SIP at market bottom (worst possible timing)",
  "Missed entire recovery period from Year X to Y",
  "Lost ₹XX.XL in opportunity cost vs discipline",
  "Emotional decision cost: XX% of potential wealth",
  "If resumed SIP after 6 months, would have recovered ₹XX.XL"
]
```

**Comparative Insight (Always Include):**
```typescript
"Behavioral cost of panic: ₹XX.XL (XX% of disciplined outcome)"
```

---

## CHART DATA OUTPUT

Must generate time-series data for visualization:

```typescript
interface ChartDataPoint {
  date: Date;
  monthNumber: number;
  marketIndex: number; // relative to start (100 = baseline)
  perfectDisciplineValue: number;
  panic20Value: number;
  panic40Value: number;
  investedAmount: number; // cumulative
  marketDrawdown: number; // percentage from peak
  sipStatus: {
    discipline: 'active' | 'paused';
    panic20: 'active' | 'paused';
    panic40: 'active' | 'paused';
  };
}
```

This allows UI to show:
- Portfolio value over time (multiple lines)
- Market drawdown periods (shaded areas)
- SIP pause indicators (markers)
- Cumulative invested amount (area chart)

---

## MARKET CONDITION DESIGN (Educational)

Your market simulation must teach, not just calculate:

### Realistic India Market Pattern (Example: 10 years)

**Year 1-2:** Moderate bull run (+12-15% annually)  
**Year 3:** Major correction (-35% over 6 months) ← TEACHING MOMENT  
**Year 3-4:** Recovery (+45% over 12 months)  
**Year 5-6:** Sideways with volatility (±10%)  
**Year 7:** Secondary correction (-20% over 3 months)  
**Year 7-10:** Strong recovery and growth (+15-18% annually)

This pattern demonstrates:
- Markets do crash
- Crashes recover
- Discipline wins over emotion
- Timing is impossible

---

## INTEGRATION WITH EXISTING ENGINE

Use these from Step 1:

```typescript
import { createTimeline, fastForward } from '../engine/time';
import { simulateMarketRegime, generateReturns } from '../engine/market';
import { calculateMutualFundReturns } from '../engine/assets/mutualFund';
import { applyPanicSelling, applySIPDiscontinuation } from '../engine/behavior';
import { calculateCapitalGainsTax } from '../engine/tax';
import { calculateOpportunityCost } from '../engine/costs';
```

Do NOT rewrite engine logic - compose it.

---

## TEST CASES (Must Pass)

### Test 1: Perfect Discipline vs Panic (20%)
```typescript
Input:
- Monthly SIP: ₹10,000
- Duration: 10 years
- Market includes 35% crash in Year 3
- Panic threshold: -20%

Expected:
- Discipline corpus: ~₹23-25L
- Panic corpus: ~₹15-18L
- Behavioral cost: ₹5-7L
- Panic stopped SIP in Month 30-36
```

### Test 2: Multiple Panic Thresholds
```typescript
Input:
- Same as Test 1
- Compare: 20%, 30%, 40% panic thresholds

Expected:
- 20% panics earliest (loses most)
- 40% survives longer (loses less)
- Clear hierarchy of behavioral cost
```

### Test 3: Custom with Auto-Resume
```typescript
Input:
- Panic at 30% fall
- Auto-resume after 6 months

Expected:
- Better than never-resume
- Still worse than discipline
- Quantified recovery benefit
```

---

## OUTPUT STRUCTURE

Function should return array of results, one per scenario:

```typescript
[
  {
    scenario: { name: "Perfect Discipline", ... },
    finalCorpus: 2450000,
    totalInvested: 1200000,
    absoluteGains: 1250000,
    xirr: 14.2,
    postTaxCorpus: 2343750, // after LTCG
    behavioralCost: 0, // baseline
    lostOpportunity: 0,
    insights: [
      "Invested through crash in Year 3",
      "Lower average NAV during crash period",
      "Compounding accelerated post-recovery"
    ],
    chartData: [...],
    timeline: [...]
  },
  {
    scenario: { name: "Panic at 20%", ... },
    finalCorpus: 1680000,
    behavioralCost: 663750, // vs discipline
    insights: [
      "Stopped SIP at market bottom",
      "Lost ₹6.6L due to panic",
      "Missed 45% recovery rally"
    ],
    ...
  },
  ...
]
```

---

## SELF-VERIFICATION CHECKLIST

After building, verify:

### ✅ Functionality
- [ ] All 5 scenarios run without errors
- [ ] Market crash properly triggers panic behavior
- [ ] Perfect discipline never stops SIP
- [ ] Panic scenarios correctly pause SIP
- [ ] XIRR calculated accurately
- [ ] Tax applied correctly
- [ ] Chart data includes all required fields

### ✅ Educational Quality
- [ ] Behavioral cost is clearly quantified
- [ ] Insights explain WHY discipline wins
- [ ] Market crash timing is realistic
- [ ] Recovery period demonstrates compounding
- [ ] Numbers feel real (not theoretical)

### ✅ Code Quality
- [ ] Uses existing engine (no duplication)
- [ ] Type-safe throughout
- [ ] Documented with JSDoc
- [ ] Edge cases handled (0 amount, 1 year, etc.)

### ✅ India Compliance
- [ ] Currency in ₹
- [ ] Tax rules applied (LTCG 12.5%)
- [ ] Realistic SIP amounts (₹1k - ₹50k range)
- [ ] Market behavior reflects Indian patterns

---

## WHAT NOT TO BUILD YET

❌ Don't build UI components
❌ Don't build API endpoints
❌ Don't create charts/visualizations
❌ Don't add database logic
❌ Don't worry about styling

Focus ONLY on calculation + insight generation logic.

---

## EXAMPLE OUTPUT (What Good Looks Like)

```typescript
const results = simulateSIPVsPanic(
  10000, // ₹10k/month
  10,    // 10 years
  [
    { name: "Perfect Discipline", behaviorType: "discipline" },
    { name: "Panic at 20%", behaviorType: "panic", panicThreshold: -20 }
  ]
);

console.log(results[0]); // Discipline
// finalCorpus: 2450000
// insights: ["Invested through crash", "Compounding accelerated"]

console.log(results[1]); // Panic
// finalCorpus: 1680000
// behavioralCost: 663750
// insights: ["Stopped at bottom", "Lost ₹6.6L due to fear"]
```

---

## FINAL INSTRUCTIONS

1. Build the core simulation logic
2. Implement all 5 scenarios
3. Generate insights automatically
4. Produce chart-ready data
5. Run test cases
6. Document any assumptions
7. Report completion with sample outputs

Remember: This isn't just math.  
This is **teaching Indians why discipline beats emotion.**

Make the numbers hurt (in a good way).

---

**After completion, report:**
1. Test results (all 3 test cases)
2. Sample output from discipline vs panic comparison
3. Any edge cases discovered
4. Performance (time to run 10-year sim)
