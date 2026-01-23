"use client";

import { useEffect, useMemo, useState } from "react";

import { TrendingUp } from "lucide-react";

import { LakhTooltip } from "./LakhTooltip";

type SocialProofStats = {
  ok: boolean;
  windowDays: number;
  total: number;
  panic20OrEarlierPct: number;
  disciplinePct: number;
  avgBehavioralCost: number;
};

export function SocialProofBanner() {
  const [stats, setStats] = useState<SocialProofStats | null>(null);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        const res = await fetch("/api/intelligence/sip-vs-panic/social-proof", { cache: "no-store" });
        const json = (await res.json()) as SocialProofStats;
        if (mounted) setStats(json);
      } catch {
        if (mounted) setStats(null);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const view = useMemo(() => {
    if (!stats || !stats.ok || stats.total < 25) return null;
    return stats;
  }, [stats]);

  if (!view) return null;

  return (
    <div className="mt-6 rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="inline-flex items-center gap-2 text-xs text-white/75">
          <TrendingUp className="h-4 w-4 text-[oklch(0.78_0.08_65)]" />
          <span className="font-semibold text-white/85">Social proof</span>
          <span className="text-white/50">(last {view.windowDays} days)</span>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/80">
          <span>
            <span className="font-semibold text-white">{view.panic20OrEarlierPct}%</span> panic at 20% or earlier
          </span>
          <span className="text-white/35">•</span>
          <span>
            <span className="font-semibold text-white">{view.disciplinePct}%</span> maintain perfect discipline
          </span>
          <span className="text-white/35">•</span>
          <span>
            <span className="font-semibold text-white">Avg cost:</span>{" "}
            <LakhTooltip amount={view.avgBehavioralCost} decimals={1} className="tabular-nums cursor-help underline decoration-white/15 underline-offset-4 hover:decoration-white/30" />
          </span>
        </div>
      </div>

      <div className="mt-1 text-[11px] text-white/55">Where do you fall?</div>
    </div>
  );
}
