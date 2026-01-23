import fs from "node:fs";
import path from "node:path";

import { REQUIRED_SCENARIOS, simulateSIPVsPanic } from "@/intelligence/simulations/sip-vs-panic";

describe("STEP 2 - SIP vs Panic Simulator", () => {
  test("Edge case: 1y and 2y runs do not apply the Year-3 crash (no panic trigger)", () => {
    for (const years of [1, 2]) {
      const results = simulateSIPVsPanic(10_000, years, REQUIRED_SCENARIOS, undefined, {
        afterStopMode: "cash",
        riskComfort: "moderate",
      });

      const discipline = results.find((r) => r.scenario.behaviorType === "discipline")!;
      const panic20 = results.find((r) => r.scenario.name.includes("20%"))!;

      // Expected: positive XIRR on short stable-growth horizons.
      expect(discipline.xirr).toBeGreaterThan(0);
      expect(panic20.xirr).toBeGreaterThan(0);

      // Expected: no crash drawdown big enough to trigger panic.
      expect(panic20.calculation.panickedAtMonth).toBeNull();
      const firstPaused = panic20.chartData.findIndex((p) => p.sipStatus.panic20 === "paused");
      expect(firstPaused).toBe(-1);

      // If no panic is triggered, panic20 should behave identically to discipline.
      expect(Math.abs(discipline.finalCorpus - panic20.finalCorpus)).toBeLessThan(1);
      expect(Math.abs(discipline.postTaxCorpus - panic20.postTaxCorpus)).toBeLessThan(1);
    }
  });

  test("Edge case: 3y run applies a late Year-3 crash (panic trigger around Month 30)", () => {
    const years = 3;
    const results = simulateSIPVsPanic(10_000, years, REQUIRED_SCENARIOS, undefined, {
      afterStopMode: "cash",
      riskComfort: "moderate",
    });

    const discipline = results.find((r) => r.scenario.behaviorType === "discipline")!;
    const panic20 = results.find((r) => r.scenario.name.includes("20%"))!;

    // Expected: still generally positive (education-only path with compressed recovery).
    expect(discipline.xirr).toBeGreaterThan(0);

    // Expected: panic triggers late in the run.
    const firstPaused = panic20.chartData.findIndex((p) => p.sipStatus.panic20 === "paused");
    expect(firstPaused).toBeGreaterThanOrEqual(28);
    expect(firstPaused).toBeLessThanOrEqual(35);
    expect(panic20.calculation.panickedAtMonth).not.toBeNull();
  });

  test("Sanity matrix: invariants hold across amounts/durations", () => {
    const amounts = [1_000, 3_000, 10_000, 50_000, 100_000, 500_000];
    const durations = [1, 2, 3, 4, 5, 6, 10, 20, 30];

    for (const monthly of amounts) {
      for (const years of durations) {
        const out = simulateSIPVsPanic(monthly, years, REQUIRED_SCENARIOS, undefined, {
          afterStopMode: "cash",
          riskComfort: "moderate",
          tax: { applyCess: true, cessRate: 0.04, applySurcharge: true, surchargeRate: 0.1 },
        });

        const discipline = out.find((r) => r.scenario.behaviorType === "discipline")!;
        const panic20 = out.find((r) => r.scenario.name.includes("20%"))!;

        // Basic numeric sanity.
        expect(Number.isFinite(discipline.finalCorpus)).toBe(true);
        expect(Number.isFinite(discipline.postTaxCorpus)).toBe(true);
        expect(Number.isFinite(discipline.taxPaid)).toBe(true);
        expect(Number.isFinite(discipline.xirr)).toBe(true);

        expect(discipline.totalInvested).toBeGreaterThan(0);
        expect(discipline.finalCorpus).toBeGreaterThanOrEqual(0);
        expect(discipline.postTaxCorpus).toBeGreaterThanOrEqual(0);
        expect(discipline.taxPaid).toBeGreaterThanOrEqual(0);

        // Post-tax math invariant: postTax = max(0, final - taxPaid) (matches simulator contract).
        expect(discipline.postTaxCorpus).toBeCloseTo(Math.max(0, discipline.finalCorpus - discipline.taxPaid), 6);
        expect(panic20.postTaxCorpus).toBeCloseTo(Math.max(0, panic20.finalCorpus - panic20.taxPaid), 6);

        // Panic trigger expectations by horizon:
        // - 1-2y: stable growth only => should not trigger.
        // - 3y: late crash injected around Month ~30 => should trigger.
        // - 4-5y: small correction (~15%) => may not trigger 20%.
        // - 6y+: crash regime includes >=25% crash or full scenario => should trigger.
        const expectsTrigger = years === 3 || years >= 6;
        if (!expectsTrigger) {
          expect(panic20.calculation.panickedAtMonth).toBeNull();
          const firstPaused = panic20.chartData.findIndex((p) => p.sipStatus.panic20 === "paused");
          expect(firstPaused).toBe(-1);
          expect(Math.abs(discipline.finalCorpus - panic20.finalCorpus)).toBeLessThan(1);
        } else {
          expect(panic20.calculation.panickedAtMonth).not.toBeNull();
          const firstPaused = panic20.chartData.findIndex((p) => p.sipStatus.panic20 === "paused");
          expect(firstPaused).toBeGreaterThanOrEqual(0);
        }

        // Behavior should never outperform discipline in this model.
        expect(discipline.postTaxCorpus).toBeGreaterThanOrEqual(panic20.postTaxCorpus);
      }
    }
  });

  test("Test 1: Perfect Discipline vs Panic (20%)", () => {
    const results = simulateSIPVsPanic(10_000, 10, REQUIRED_SCENARIOS, {
      crashDepthPct: -35,
      crashStartMonth: 30,
      crashDurationMonths: 6,
      recoveryGainPct: 45,
      recoveryDurationMonths: 12,
    });

    const discipline = results.find((r) => r.scenario.behaviorType === "discipline")!;
    const panic20 = results.find((r) => r.scenario.name.includes("20%"))!;

    // Expected ranges per Step 2 spec (education-focused deterministic market pattern)
    expect(discipline.finalCorpus).toBeGreaterThan(23_00_000);
    expect(discipline.finalCorpus).toBeLessThan(25_50_000);

    expect(panic20.finalCorpus).toBeGreaterThan(15_00_000);
    expect(panic20.finalCorpus).toBeLessThan(18_50_000);

    const behavioralCost = discipline.finalCorpus - panic20.finalCorpus;
    expect(behavioralCost).toBeGreaterThan(5_00_000);
    expect(behavioralCost).toBeLessThan(9_00_000);

    // Panic should flip to paused around the crash window.
    const firstPaused = panic20.chartData.findIndex((p) => p.sipStatus.panic20 === "paused");
    expect(firstPaused).toBeGreaterThanOrEqual(30);
    expect(firstPaused).toBeLessThanOrEqual(40);

    // Write a sample output artifact for the verification report.
    const sample = {
      discipline: results.find((r) => r.scenario.name === "Perfect Discipline"),
      panic20: results.find((r) => r.scenario.name.includes("20%")),
    };
    const outPath = path.join(process.cwd(), ".tmp_step2_sample.json");
    fs.writeFileSync(outPath, JSON.stringify(sample, null, 2), "utf8");
  });

  test("Test 1b: Pure-stop mode is materially worse than cash-bucket", () => {
    const baseMarket = {
      crashDepthPct: -35,
      crashStartMonth: 30,
      crashDurationMonths: 6,
      recoveryGainPct: 45,
      recoveryDurationMonths: 12,
    };

    const cashMode = simulateSIPVsPanic(10_000, 10, REQUIRED_SCENARIOS, baseMarket, {
      afterStopMode: "cash",
      cashAnnualRatePct: 6,
    });

    const stopMode = simulateSIPVsPanic(10_000, 10, REQUIRED_SCENARIOS, baseMarket, {
      afterStopMode: "stop",
    });

    const cashD = cashMode.find((r) => r.scenario.behaviorType === "discipline")!;
    const cashP20 = cashMode.find((r) => r.scenario.name.includes("20%"))!;

    const stopD = stopMode.find((r) => r.scenario.behaviorType === "discipline")!;
    const stopP20 = stopMode.find((r) => r.scenario.name.includes("20%"))!;

    // Discipline should be invariant across modes.
    expect(Math.abs(cashD.finalCorpus - stopD.finalCorpus)).toBeLessThan(1);

    // Pure-stop should produce a much lower panic corpus than redirecting savings to cash.
    expect(stopP20.finalCorpus).toBeLessThan(cashP20.finalCorpus);

    // And thus a larger behavioral cost vs discipline.
    expect(stopP20.behavioralCost).toBeGreaterThan(cashP20.behavioralCost);
  });

  test("Test 2: Multiple panic thresholds show correct hierarchy", () => {
    const scenarios = [
      { name: "Perfect Discipline", description: "", behaviorType: "discipline" as const },
      { name: "Panic 20", description: "", behaviorType: "panic" as const, panicThreshold: -20 },
      { name: "Panic 30", description: "", behaviorType: "panic" as const, panicThreshold: -30 },
      { name: "Panic 40", description: "", behaviorType: "panic" as const, panicThreshold: -40 },
    ];

    const results = simulateSIPVsPanic(10_000, 10, scenarios, {
      crashDepthPct: -35,
      crashStartMonth: 30,
      crashDurationMonths: 6,
      recoveryGainPct: 45,
      recoveryDurationMonths: 12,
    });

    const d = results.find((r) => r.scenario.name === "Perfect Discipline")!.finalCorpus;
    const p20 = results.find((r) => r.scenario.name === "Panic 20")!.finalCorpus;
    const p30 = results.find((r) => r.scenario.name === "Panic 30")!.finalCorpus;
    const p40 = results.find((r) => r.scenario.name === "Panic 40")!.finalCorpus;

    expect(d).toBeGreaterThan(p40);
    expect(p40).toBeGreaterThan(p30);
    expect(p30).toBeGreaterThan(p20);
  });

  test("Test 3: Custom with auto-resume beats never-resume but trails discipline", () => {
    const scenarios = [
      { name: "Perfect Discipline", description: "", behaviorType: "discipline" as const },
      { name: "Panic 30 Never Resume", description: "", behaviorType: "panic" as const, panicThreshold: -30 },
      { name: "Custom 30 Resume 6", description: "", behaviorType: "custom" as const, panicThreshold: -30, stopDuration: 6 },
    ];

    const results = simulateSIPVsPanic(10_000, 10, scenarios, {
      crashDepthPct: -35,
      crashStartMonth: 30,
      crashDurationMonths: 6,
      recoveryGainPct: 45,
      recoveryDurationMonths: 12,
    });

    const d = results.find((r) => r.scenario.name === "Perfect Discipline")!.finalCorpus;
    const never = results.find((r) => r.scenario.name === "Panic 30 Never Resume")!.finalCorpus;
    const custom = results.find((r) => r.scenario.name === "Custom 30 Resume 6")!.finalCorpus;

    expect(custom).toBeGreaterThan(never);
    expect(d).toBeGreaterThan(custom);
  });

  it("Regression: 2-year horizon should not include Year-3 crash", () => {
    const results = simulateSIPVsPanic(1_000, 2, REQUIRED_SCENARIOS);
    const discipline = results.find((r) => r.scenario.behaviorType === "discipline");
    expect(discipline).toBeTruthy();
    if (!discipline) return;

    // Should be positive and reasonable for a stable-growth 2y educational path.
    expect(discipline.xirr).toBeGreaterThan(0);

    // Market drawdown should not show a large crash for <=2y.
    const minDrawdown = Math.min(...discipline.chartData.map((d) => d.marketDrawdown));
    expect(minDrawdown).toBeGreaterThan(-10);

    // Gains should be far below the annual LTCG exemption in this small run.
    expect(discipline.taxPaid).toBe(0);
    expect(discipline.postTaxCorpus).toBeCloseTo(discipline.finalCorpus, 6);
  });

  it("Regression: 1-year horizon should not include Year-3 crash", () => {
    const results = simulateSIPVsPanic(10_000, 1, REQUIRED_SCENARIOS);
    const discipline = results.find((r) => r.scenario.behaviorType === "discipline");
    expect(discipline).toBeTruthy();
    if (!discipline) return;

    expect(discipline.xirr).toBeGreaterThan(0);

    const minDrawdown = Math.min(...discipline.chartData.map((d) => d.marketDrawdown));
    expect(minDrawdown).toBeGreaterThan(-10);

    expect(discipline.taxPaid).toBe(0);
    expect(discipline.postTaxCorpus).toBeCloseTo(discipline.finalCorpus, 6);
  });

  it("Verification: 3-year horizon includes Year-3 crash timing (month ~30)", () => {
    const results = simulateSIPVsPanic(10_000, 3, REQUIRED_SCENARIOS, {
      crashDepthPct: -35,
      crashStartMonth: 30,
      crashDurationMonths: 6,
      recoveryGainPct: 45,
      recoveryDurationMonths: 12,
    });

    const discipline = results.find((r) => r.scenario.behaviorType === "discipline")!;
    expect(discipline.xirr).toBeGreaterThan(0);

    const panic20 = results.find((r) => r.scenario.name.includes("20%"))!;
    const firstPaused = panic20.chartData.findIndex((p) => p.sipStatus.panic20 === "paused");
    expect(firstPaused).toBeGreaterThanOrEqual(30);
    expect(firstPaused).toBeLessThanOrEqual(36);
  });

  it("Crash replay: forceScenario can inject a crash even on short horizons", () => {
    const results = simulateSIPVsPanic(5_000, 2, REQUIRED_SCENARIOS, {
      forceScenario: true,
      crashDepthPct: -40,
      crashStartMonth: 2,
      crashDurationMonths: 2,
      recoveryGainPct: 55,
      recoveryDurationMonths: 6,
      secondaryCorrectionDepthPct: -12,
      secondaryCorrectionDurationMonths: 2,
      secondaryCorrectionStartMonth: 10,
    });

    const discipline = results.find((r) => r.scenario.behaviorType === "discipline")!;
    const minDrawdown = Math.min(...discipline.chartData.map((d) => d.marketDrawdown));
    expect(minDrawdown).toBeLessThan(-15);
  });

  it("Surfaces taxPaid and keeps post-tax math consistent", () => {
    const results = simulateSIPVsPanic(10_000, 10, REQUIRED_SCENARIOS);
    for (const r of results) {
      expect(r.taxPaid).toBeGreaterThanOrEqual(0);
      expect(r.postTaxCorpus).toBeCloseTo(Math.max(0, r.finalCorpus - r.taxPaid), 6);
    }
  });
});
