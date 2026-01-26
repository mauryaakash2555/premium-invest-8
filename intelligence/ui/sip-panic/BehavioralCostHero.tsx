"use client";

import { useMemo } from "react";

import type { SIPSimulationResult } from "@/intelligence/simulations/sip-vs-panic";
import { LakhTooltip } from "./LakhTooltip";

export interface BehavioralCostHeroProps {
  results: SIPSimulationResult[];
}

export function BehavioralCostHero(props: BehavioralCostHeroProps) {
  const { results } = props;

  const discipline = useMemo(() => results.find((r) => r.scenario.behaviorType === "discipline") ?? null, [results]);

  const worst = useMemo(() => {
    const candidates = results.filter((r) => r.scenario.behaviorType !== "discipline");
    if (!candidates.length) return null;
    return candidates.reduce((best, cur) => (cur.behavioralCost > best.behavioralCost ? cur : best), candidates[0]);
  }, [results]);

  if (!discipline || !worst) return null;

  return (
    <div className="rounded-2xl border border-white/10 ultra-luxury-glass gold-grain-texture p-6">
      <div className="text-[11px] tracking-wide text-white/70 uppercase">Your behavioral cost</div>
      <div className="mt-3 text-4xl sm:text-5xl font-semibold gold-gradient-text">
        <LakhTooltip amount={worst.behavioralCost} className="gold-gradient-text tabular-nums cursor-help" />
      </div>
      <div className="mt-3 text-sm text-white/85">
        This is how much less you end up with (after tax) by following <span className="text-white font-semibold">{worst.scenario.name}</span>,
        compared to staying calm.
      </div>
      <div className="mt-3 flex flex-col sm:flex-row gap-3 text-xs text-white/80">
        <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
          <div className="text-white/55">If you stayed calm</div>
          <div className="mt-1 font-semibold text-white/90">
            <LakhTooltip amount={discipline.postTaxCorpus} className="tabular-nums cursor-help" />
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
          <div className="text-white/55">With this behavior</div>
          <div className="mt-1 font-semibold text-white/90">
            <LakhTooltip amount={worst.postTaxCorpus} className="tabular-nums cursor-help" />
          </div>
        </div>
      </div>
      <div className="mt-3 text-[11px] text-white/65">Showing the worst case among selected behaviors.</div>
    </div>
  );
}
