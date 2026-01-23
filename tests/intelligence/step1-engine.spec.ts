import {
  applyPanicSelling,
  calculateFdReturns,
  calculateInflationErosion,
  calculateMfReturns,
  createTimeline,
  runParallelScenarios,
} from "@/intelligence/engine";

describe("STEP 1 - Core Engine Build (India-first)", () => {
  test("Test 1: Basic SIP (~₹23L pre-tax)", () => {
    const timeline = createTimeline({
      startDate: new Date("2026-01-01"),
      endDate: new Date("2035-12-31"),
      frequency: "monthly",
      holidaysIso: [],
    });

    // STEP_1_PROMPT expects ~12% annual; use a simple monthly 1% series to match the ~₹23L reference output.
    const marketReturns = timeline.map(() => 0.01);

    const result = calculateMfReturns({
      initial: 0,
      timeline,
      sipAmount: 10_000,
      marketReturns,
      expenseRatioAnnual: 0,
      redeemAtEnd: true,
    });

    // Pre-tax corpus ~₹23L
    expect(result.finalValue).toBeGreaterThan(22_00_000);
    expect(result.finalValue).toBeLessThan(24_00_000);

    // Tax should be computed and reduce post-tax value.
    expect(result.taxPaid).toBeGreaterThan(0);
    expect(result.postTaxFinalValue).toBeLessThan(result.finalValue);
  });

  test("Test 2: Panic Selling reduces corpus after Year-3 crash", () => {
    const timeline = createTimeline({
      startDate: new Date("2026-01-01"),
      endDate: new Date("2035-12-31"),
      frequency: "monthly",
      holidaysIso: [],
    });

    const baseReturns = timeline.map(() => 0.01);

    // Crash in Year 3 (month ~24): one deep negative month.
    const crashReturns = baseReturns.map((r, i) => (i === 24 ? -0.25 : r));

    const disciplined = calculateMfReturns({
      initial: 0,
      timeline,
      sipAmount: 10_000,
      marketReturns: crashReturns,
      expenseRatioAnnual: 0,
      redeemAtEnd: true,
    });

    const panicAdjustedReturns = applyPanicSelling(crashReturns, 0.2);

    const panic = calculateMfReturns({
      initial: 0,
      timeline,
      sipAmount: 10_000,
      marketReturns: crashReturns,
      behaviorReturns: panicAdjustedReturns,
      expenseRatioAnnual: 0,
      redeemAtEnd: true,
    });

    expect(panic.finalValue).toBeLessThan(disciplined.finalValue);

    const lostCompounding = disciplined.finalValue - panic.finalValue;
    expect(lostCompounding).toBeGreaterThan(3_00_000);
  });

  test("Test 3: FD vs MF (post-tax + inflation-adjusted)", () => {
    const principal = 10_00_000; // ₹10L

    const fd = calculateFdReturns({
      principal,
      rateAnnual: 0.07,
      tenureYears: 10,
      compounding: "quarterly",
      taxSlabRate: 0.3,
    });

    const timeline = createTimeline({
      startDate: new Date("2026-01-01"),
      endDate: new Date("2035-12-31"),
      frequency: "monthly",
      holidaysIso: [],
    });

    const mfReturns = timeline.map(() => 0.01);

    const mf = calculateMfReturns({
      initial: principal,
      timeline,
      sipAmount: 0,
      marketReturns: mfReturns,
      expenseRatioAnnual: 0,
      redeemAtEnd: true,
    });

    // Post-tax comparison
    expect(mf.postTaxFinalValue).toBeGreaterThan(fd.maturityAmount);

    // Inflation-adjusted (real) comparison at 6% baseline
    const fdReal = calculateInflationErosion({ amount: fd.maturityAmount, years: 10, inflationRateAnnual: 0.06 });
    const mfReal = calculateInflationErosion({ amount: mf.postTaxFinalValue, years: 10, inflationRateAnnual: 0.06 });

    expect(mfReal.realValue).toBeGreaterThan(fdReal.realValue);
  });

  test("Performance: 30-year sim supports 10 parallel scenarios (<1s)", () => {
    const baseConfig = {
      startYear: 2026,
      years: 30,
      inflation: { inflationAnnual: 0.06 },
      market: {
        seed: 42,
        schedule: [{ cycle: "sideways" as const, fromYear: 0, toYear: 29 }],
        volatilityClustering: true,
      },
      behaviour: { toggles: ["perfect_discipline" as const], intensity: 0 },
      taxes: {},
      initialCapital: 0,
      contributions: { monthlyContribution: 10_000 },
      allocation: { equityWeight: 1, debtWeight: 0 },
    };

    const scenarios = Array.from({ length: 10 }, (_, i) => ({
      id: `s${i + 1}`,
      config: {
        ...baseConfig,
        market: { ...baseConfig.market, seed: 100 + i },
      },
    }));

    const t0 = Date.now();
    const out = runParallelScenarios(scenarios);
    const elapsedMs = Date.now() - t0;

    expect(Object.keys(out.scenarios).length).toBe(10);
    expect(elapsedMs).toBeLessThan(1000);
  });
});
