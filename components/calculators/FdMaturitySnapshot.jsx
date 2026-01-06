"use client";

import { useMemo, useState } from "react";

import { formatINR } from "@/lib/tax-formulas";

function clampNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function futureValuePrincipal(principal, annualRatePct, years) {
  const p = Math.max(0, clampNumber(principal, 0));
  const y = Math.max(0, clampNumber(years, 0));
  const r = clampNumber(annualRatePct, 0) / 100;
  return p * Math.pow(1 + r, y);
}

export function FdMaturitySnapshot() {
  const [principal, setPrincipal] = useState(500000);
  const [years, setYears] = useState(3);
  const [annualRatePct, setAnnualRatePct] = useState(7.5);

  const result = useMemo(() => {
    const maturity = futureValuePrincipal(principal, annualRatePct, years);
    const interestEarned = maturity - Math.max(0, clampNumber(principal, 0));
    return { maturity, interestEarned };
  }, [principal, annualRatePct, years]);

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
        A calm FD maturity illustration using a simple annual compounding assumption. Actual FD compounding/payout terms can differ by issuer.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        <div>
          <div style={label}>Deposit amount (₹)</div>
          <input style={field} inputMode="numeric" value={principal} onChange={(e) => setPrincipal(clampNumber(e.target.value, 0))} />
        </div>
        <div>
          <div style={label}>Tenure (years)</div>
          <input style={field} inputMode="decimal" value={years} onChange={(e) => setYears(clampNumber(e.target.value, 0))} />
        </div>
        <div>
          <div style={label}>Interest rate (%/yr)</div>
          <input style={field} inputMode="decimal" value={annualRatePct} onChange={(e) => setAnnualRatePct(clampNumber(e.target.value, 0))} />
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
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 8 }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ fontSize: 13, color: "#e5e5e5" }}>Estimated maturity value</div>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#DAA520" }}>{formatINR(result.maturity)}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div style={{ fontSize: 13, color: "#b8b8b8" }}>Estimated interest earned</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{formatINR(result.interestEarned)}</div>
          </div>
        </div>
      </div>

      <p style={{ margin: "12px 0 0 0", fontSize: 12, color: "#999", lineHeight: 1.6 }}>
        Rates, penalties, TDS/tax, and compounding frequency vary. Confirm official terms before investing.
      </p>
    </div>
  );
}
