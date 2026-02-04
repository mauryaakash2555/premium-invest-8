"use client";

import { useMemo } from "react";

function clampInt(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function formatCr(amount: number): string {
  const v = Math.max(0, Number.isFinite(amount) ? amount : 0);
  const cr = v / 10_000_000;
  return `₹${cr.toFixed(2)} Cr`;
}

export function RealLifeComparison(props: { amount: number; title?: string }) {
  const amount = Number.isFinite(props.amount) ? props.amount : 0;

  const items = useMemo(() => {
    // Simple, illustrative equivalents (education-only).
    const housesTier2 = clampInt(amount / 17_500_000, 0, 20);
    const fortuners = clampInt(amount / 5_000_000, 0, 99);
    const europeTrips = clampInt(amount / 500_000, 0, 999);
    const collegeYears = clampInt(amount / 1_000_000, 0, 99);

    return [
      { icon: "🏠", text: `${housesTier2 || 1} homes in a tier-2 city (roughly)` },
      { icon: "🚗", text: `${fortuners || 1} large family cars (roughly)` },
      { icon: "✈️", text: `${europeTrips || 1} international trips (roughly)` },
      { icon: "🎓", text: `${collegeYears || 1} years of college fees (roughly)` },
    ];
  }, [amount]);

  return (
    <div className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="text-[11px] font-semibold tracking-wide text-white/70 uppercase">
        {props.title || `What ${formatCr(amount)} can mean`}
      </div>
      <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-white/85">
        {items.map((it) => (
          <div key={it.icon + it.text} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
            <div className="flex items-start gap-2">
              <div className="text-base leading-none">{it.icon}</div>
              <div className="text-[12px] leading-snug">{it.text}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-2 text-[11px] text-white/55">Illustrative comparisons to build intuition (not prices/quotes).</div>
    </div>
  );
}
