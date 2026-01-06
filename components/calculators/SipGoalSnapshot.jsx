"use client";

import { useMemo, useState } from "react";

import { formatINR } from "@/lib/tax-formulas";

function clampNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function requiredMonthlySipForGoal({ goalAmount, annualReturnPct, years }) {
  const fv = Math.max(0, clampNumber(goalAmount, 0));
  const y = Math.max(0, clampNumber(years, 0));
  const months = Math.round(y * 12);
  const r = (clampNumber(annualReturnPct, 0) / 100) / 12;

  if (months <= 0) return 0;
  if (r === 0) return fv / months;

  // Assume contribution at start of month (slightly optimistic)
  const factor = (Math.pow(1 + r, months) - 1) / r;
  const sip = fv / (factor * (1 + r));
  return sip;
}

export function SipGoalSnapshot() {
  const [goalAmount, setGoalAmount] = useState(2500000);
  const [years, setYears] = useState(10);
  const [annualReturnPct, setAnnualReturnPct] = useState(12);

  const result = useMemo(() => {
    const sip = requiredMonthlySipForGoal({ goalAmount, annualReturnPct, years });
    return { sip };
  }, [goalAmount, annualReturnPct, years]);

  const field = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(218, 165, 32, 0.22)",
    background: "rgba(255,255,255,0.03)",
    color: "#fff",
    outline: "none",
  };

  const label = {
    fontSize: 12,
    color: "#d0d0d0",
    marginBottom: 6,
  };

  const card = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(218, 165, 32, 0.18)",
    borderRadius: 12,
    padding: 18,
  };

  return (
    <div style={card}>
      <p style={{ margin: "0 0 12px 0", fontSize: 14, color: "#d0d0d0", lineHeight: 1.75 }}>
        A quick goal-to-SIP estimate using your assumptions. This is an illustration, not a return assurance.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        <div>
          <div style={label}>Goal amount (₹)</div>
          <input style={field} inputMode="numeric" value={goalAmount} onChange={(e) => setGoalAmount(clampNumber(e.target.value, 0))} />
        </div>
        <div>
          <div style={label}>Time horizon (years)</div>
          <input style={field} inputMode="numeric" value={years} onChange={(e) => setYears(clampNumber(e.target.value, 0))} />
        </div>
        <div>
          <div style={label}>Assumed return (%/yr)</div>
          <input style={field} inputMode="decimal" value={annualReturnPct} onChange={(e) => setAnnualReturnPct(clampNumber(e.target.value, 0))} />
        </div>
      </div>

      <div
        style={{
          marginTop: 14,
          padding: 14,
          borderRadius: 12,
          border: "1px solid rgba(218, 165, 32, 0.18)",
          background: "rgba(218, 165, 32, 0.06)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ fontSize: 13, color: "#e5e5e5" }}>
            Estimated required SIP (monthly): <strong style={{ color: "#DAA520" }}>{formatINR(result.sip)}</strong>
          </div>
          <div style={{ fontSize: 12, color: "#b8b8b8" }}>Illustration only</div>
        </div>
      </div>

      <p style={{ margin: "12px 0 0 0", fontSize: 12, color: "#999", lineHeight: 1.6 }}>
        Market-linked outcomes can vary. For planning, use a conservative assumption and review periodically.
      </p>
    </div>
  );
}
