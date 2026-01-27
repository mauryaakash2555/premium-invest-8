"use client";

import { useEffect, useMemo, useState } from "react";

import { BarChart3 } from "lucide-react";

type ChallengeStats = {
  ok: boolean;
  windowDays: number;
  opens: number;
  completes: number;
  completionPct: number;
};

export function ChallengeStatsBanner() {
  const [stats, setStats] = useState<ChallengeStats | null>(null);

  useEffect(() => {
    let mounted = true;
    void (async () => {
      try {
        const res = await fetch("/api/intelligence/sip-vs-panic/challenge-stats", { cache: "no-store" });
        const json = (await res.json()) as ChallengeStats;
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
    if (!stats || !stats.ok || stats.opens < 25) return null;
    return stats;
  }, [stats]);

  if (!view) return null;

  return (
    <div className="mt-3 rounded-2xl border border-white/10 bg-black/25 px-4 py-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="inline-flex items-center gap-2 text-xs text-white/75">
          <BarChart3 className="h-4 w-4 text-[oklch(0.78_0.08_65)]" />
          <span className="font-semibold text-white/85">Challenge conversion</span>
          <span className="text-white/50">(last {view.windowDays} days)</span>
        </div>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/80">
          <span>
            <span className="font-semibold text-white tabular-nums">{view.completionPct}%</span> finish
          </span>
          <span className="text-white/35">•</span>
          <span>
            <span className="font-semibold text-white tabular-nums">{view.opens}</span> opens
          </span>
          <span className="text-white/35">•</span>
          <span>
            <span className="font-semibold text-white tabular-nums">{view.completes}</span> completions
          </span>
        </div>
      </div>

      <div className="mt-1 text-[11px] text-white/55">Live from real challenge opens → story completions (no curated numbers).</div>
    </div>
  );
}
