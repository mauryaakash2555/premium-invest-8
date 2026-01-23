"use client";

import { useMemo, useState } from "react";

import { formatINR } from "@/lib/tax-formulas";

function clampNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function RebalanceDriftSnapshot() {
  const [portfolioValue, setPortfolioValue] = useState(5000000);
  const [currentEquityPct, setCurrentEquityPct] = useState(70);
  const [targetEquityPct, setTargetEquityPct] = useState(60);

  const result = useMemo(() => {
    const v = Math.max(0, clampNumber(portfolioValue, 0));
    const current = clampNumber(currentEquityPct, 0);
    const target = clampNumber(targetEquityPct, 0);

    const currentEquity = v * (current / 100);
    const targetEquity = v * (target / 100);
    const delta = targetEquity - currentEquity;

    return {
      delta,
      driftPct: current - target,
    };
  }, [portfolioValue, currentEquityPct, targetEquityPct]);

  const field = {
    width: "100%",
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid color-mix(in oklab, var(--lux-accent) 22%, transparent)",
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
    border: "1px solid color-mix(in oklab, var(--lux-accent) 18%, transparent)",
    borderRadius: 12,
    padding: 18,
  };

  const actionLabel = result.delta > 0 ? "Move into equity (approx)" : result.delta < 0 ? "Reduce equity (approx)" : "On target";

  return (
    <div style={card}>
      <p style={{ margin: "0 0 12px 0", fontSize: 14, color: "#d0d0d0", lineHeight: 1.75 }}>
        A compact drift check between current and target allocation. This is a mechanical illustration, not investment advice.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        <div>
          <div style={label}>Portfolio value (₹)</div>
          <input style={field} inputMode="numeric" value={portfolioValue} onChange={(e) => setPortfolioValue(clampNumber(e.target.value, 0))} />
        </div>
        <div>
          <div style={label}>Current equity (%)</div>
          <input style={field} inputMode="decimal" value={currentEquityPct} onChange={(e) => setCurrentEquityPct(clampNumber(e.target.value, 0))} />
        </div>
        <div>
          <div style={label}>Target equity (%)</div>
          <input style={field} inputMode="decimal" value={targetEquityPct} onChange={(e) => setTargetEquityPct(clampNumber(e.target.value, 0))} />
        </div>
      </div>

      <div
        style={{
          marginTop: 14,
          padding: 14,
          borderRadius: 12,
          border: "1px solid color-mix(in oklab, var(--lux-accent) 18%, transparent)",
          background: "color-mix(in oklab, var(--lux-accent) 6%, transparent)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ fontSize: 13, color: "#e5e5e5" }}>
            Drift: <strong style={{ color: "#fff" }}>{result.driftPct.toFixed(1)}%</strong>
          </div>
          <div style={{ fontSize: 13, color: "#e5e5e5" }}>
            {actionLabel}: <strong style={{ color: "var(--lux-accent)" }}>{formatINR(Math.abs(result.delta))}</strong>
          </div>
        </div>
      </div>

      <p style={{ margin: "12px 0 0 0", fontSize: 12, color: "#999", lineHeight: 1.6 }}>
        Rebalancing involves costs, taxes, and product choice. Use this only as a drift indicator.
      </p>
    </div>
  );
}
