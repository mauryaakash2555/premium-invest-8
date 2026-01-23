"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

import type { ChartDataPoint, SIPSimulationResult } from "@/intelligence/simulations/sip-vs-panic";

function formatInr0(amount: number): string {
  const v = Number.isFinite(amount) ? Math.max(0, amount) : 0;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);
}

type Row = {
  month: number;
  marketMovePct: number;
  missedSoFar: number;
  note: string;
};

function getSeriesValue(p: ChartDataPoint, key: "discipline" | "panic20" | "panic40"): number {
  if (key === "discipline") return p.perfectDisciplineValue;
  if (key === "panic20") return p.panic20Value;
  return p.panic40Value;
}

function getWorstValue(p: ChartDataPoint, worst: SIPSimulationResult): number {
  if (worst.scenario?.behaviorType === "custom") {
    return Number.isFinite(p.customValue as number) ? (p.customValue as number) : p.panic20Value;
  }
  if (worst.scenario?.behaviorType === "panic" && worst.scenario?.panicThreshold === -1) {
    return Number.isFinite((p as any).anyFallValue as number) ? ((p as any).anyFallValue as number) : p.panic20Value;
  }
  if (worst.scenario?.behaviorType === "panic" && worst.scenario?.panicThreshold === -40) return p.panic40Value;
  if (worst.scenario?.behaviorType === "panic" && worst.scenario?.panicThreshold === -20) return p.panic20Value;
  // Fallback: the chart always has panic20Value.
  return p.panic20Value;
}

export function MissedRecoveryAnimation(props: {
  discipline: SIPSimulationResult | null;
  worst: SIPSimulationResult | null;
  chartData: ChartDataPoint[];
  monthlyAmount: number;
}) {
  const { discipline, worst, chartData, monthlyAmount } = props;

  const rows = useMemo(() => {
    if (!discipline || !worst || !chartData?.length) return [] as Row[];

    const panicAt = worst.calculation?.panickedAtMonth;
    if (panicAt === null || panicAt === undefined) return [] as Row[];

    // Show from panic trigger through recovery (or fallback to 12 months).
    const start = Math.max(0, panicAt);
    let end = Math.min(chartData.length - 1, start + 12);
    for (let i = start; i < chartData.length; i += 1) {
      if ((chartData[i]?.marketDrawdown ?? -100) >= -2) {
        end = i;
        break;
      }
    }

    const out: Row[] = [];

    const sipPerMonth = Number.isFinite(monthlyAmount) ? Math.max(0, Math.round(monthlyAmount)) : 0;

    type WorstStatusKey = "panic20" | "panic40" | "anyFall" | "custom";
    const statusKey: WorstStatusKey =
      worst.scenario.behaviorType === "custom"
        ? "custom"
        : worst.scenario.behaviorType === "panic" && worst.scenario.panicThreshold === -1
          ? "anyFall"
          : worst.scenario.behaviorType === "panic" && worst.scenario.panicThreshold === -40
            ? "panic40"
            : "panic20";

    const getWorstStatus = (p: ChartDataPoint): "active" | "paused" => {
      if (statusKey === "custom") return p.sipStatus?.custom ?? "active";
      if (statusKey === "anyFall") return ((p.sipStatus as any)?.anyFall ?? "active") as "active" | "paused";
      if (statusKey === "panic40") return p.sipStatus?.panic40 ?? "active";
      return p.sipStatus?.panic20 ?? "active";
    };

    // Track months where the worst-behavior investor did NOT buy equity.
    // Then value those missed contributions at the current month's market index.
    const missedBuys: number[] = [];
    for (let i = start; i <= end; i += 1) {
      const prev = chartData[i - 1];
      const cur = chartData[i];
      if (!cur) continue;

      const marketMovePct = prev?.marketIndex ? ((cur.marketIndex / prev.marketIndex) - 1) * 100 : 0;

      const drawdownImproving = typeof prev?.marketDrawdown === "number" ? cur.marketDrawdown > prev.marketDrawdown : marketMovePct > 0;

      const worstStatus = getWorstStatus(cur);

      const curIndex = Number.isFinite(cur.marketIndex) ? cur.marketIndex : NaN;

      // IMPORTANT: SIP buys happen at the *start* of the month (see simulation engine: marketIndexAtStart).
      // Chart points store end-of-month marketIndex, so use previous point as the buy index proxy.
      const buyIndex = Number.isFinite(prev?.marketIndex) ? (prev?.marketIndex as number) : curIndex;

      if (worstStatus === "paused" && sipPerMonth > 0 && Number.isFinite(buyIndex) && buyIndex > 0) {
        missedBuys.push(buyIndex);
      }

      const missedSoFar = (() => {
        if (sipPerMonth <= 0) return 0;
        if (!Number.isFinite(curIndex) || curIndex <= 0) {
          // Fallback to portfolio-diff method if we don't have market index.
          const discV = getSeriesValue(cur, "discipline");
          const panicV = getWorstValue(cur, worst);
          return Math.max(0, discV - panicV);
        }
        let sum = 0;
        for (const buyIndex of missedBuys) {
          if (!Number.isFinite(buyIndex) || buyIndex <= 0) continue;
          // Count only the *recovery gain* you missed (profit over principal).
          // This keeps the metric ~0 during crash/underwater months and increases as recovery happens.
          sum += sipPerMonth * Math.max(0, (curIndex / buyIndex) - 1);
        }
        return Math.max(0, sum);
      })();

      out.push({
        month: cur.monthNumber,
        marketMovePct,
        missedSoFar,
        note: worstStatus === "paused" ? "You paused SIP" : drawdownImproving ? "Recovery month" : "Volatility month",
      });
    }

    return out;
  }, [chartData, discipline, monthlyAmount, worst]);

  if (!rows.length) return null;

  return (
    <div className="mt-10 rounded-2xl border border-white/10 ultra-luxury-glass gold-grain-texture p-5">
      <h2 className="text-base font-semibold gold-gradient-text">What You Missed By Panicking</h2>
      <p className="mt-2 text-xs text-white/70">A month-by-month highlight of the recovery window after your panic trigger.</p>

      <div className="mt-4 grid grid-cols-1 gap-2">
        {rows.map((r, idx) => (
          <motion.div
            key={r.month}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: Math.min(1.6, idx * 0.12) }}
            className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-xs"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-white/80">
                <span className="font-semibold text-white/90">Month {r.month}</span>
                <span className="text-white/40"> • </span>
                <span className="text-white/70">{r.note}</span>
              </div>
              <div className="text-white/70 tabular-nums">Market: {r.marketMovePct >= 0 ? "+" : ""}{r.marketMovePct.toFixed(1)}%</div>
            </div>
            <div className="mt-2 flex items-center justify-between gap-3">
              <div className="text-white/55">Missed value so far</div>
              <div className="font-semibold" style={{ color: "var(--color-destructive)" }}>{formatInr0(r.missedSoFar)}</div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
