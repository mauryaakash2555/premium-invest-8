"use client";

import { useMemo, useState } from "react";

import { formatINR } from "@/lib/tax-formulas";

function clampNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

export function InsuranceCoverSnapshot() {
  const [annualIncome, setAnnualIncome] = useState(1800000);
  const [yearsToReplace, setYearsToReplace] = useState(10);
  const [liabilities, setLiabilities] = useState(2500000);

  const result = useMemo(() => {
    const income = Math.max(0, clampNumber(annualIncome, 0));
    const y = Math.max(0, clampNumber(yearsToReplace, 0));
    const debt = Math.max(0, clampNumber(liabilities, 0));

    // Illustration-only: income replacement + liabilities.
    const base = income * y + debt;

    // Provide a conservative band rather than a single “recommended” number.
    const low = base * 0.85;
    const high = base * 1.15;

    return { low, high };
  }, [annualIncome, yearsToReplace, liabilities]);

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

  return (
    <div style={card}>
      <p style={{ margin: "0 0 12px 0", fontSize: 14, color: "#d0d0d0", lineHeight: 1.75 }}>
        A compact protection band using simple income-replacement + liabilities. This is an illustration, not a product recommendation.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        <div>
          <div style={label}>Annual income (₹)</div>
          <input style={field} inputMode="numeric" value={annualIncome} onChange={(e) => setAnnualIncome(clampNumber(e.target.value, 0))} />
        </div>
        <div>
          <div style={label}>Years to replace income</div>
          <input style={field} inputMode="numeric" value={yearsToReplace} onChange={(e) => setYearsToReplace(clampNumber(e.target.value, 0))} />
        </div>
        <div>
          <div style={label}>Total liabilities (₹)</div>
          <input style={field} inputMode="numeric" value={liabilities} onChange={(e) => setLiabilities(clampNumber(e.target.value, 0))} />
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
            Protection band (illustration):{" "}
            <strong style={{ color: "var(--lux-accent)" }}>
              {formatINR(result.low)} – {formatINR(result.high)}
            </strong>
          </div>
          <div style={{ fontSize: 12, color: "#b8b8b8" }}>Not advice</div>
        </div>
      </div>

      <p style={{ margin: "12px 0 0 0", fontSize: 12, color: "#999", lineHeight: 1.6 }}>
        Actual needs depend on family expenses, dependents, goals, existing cover, and policy terms. Verify with official documents.
      </p>
    </div>
  );
}
