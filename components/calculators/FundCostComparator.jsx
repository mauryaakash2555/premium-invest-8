"use client";

import { useMemo, useState } from "react";

import { formatINR } from "@/lib/tax-formulas";

function clampNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function futureValueLumpsum(principal, annualRatePct, years) {
  const p = Math.max(0, clampNumber(principal, 0));
  const y = Math.max(0, clampNumber(years, 0));
  const r = clampNumber(annualRatePct, 0) / 100;
  return p * Math.pow(1 + r, y);
}

function futureValueSip(monthlyInvestment, annualRatePct, years) {
  const p = Math.max(0, clampNumber(monthlyInvestment, 0));
  const months = Math.round(Math.max(0, clampNumber(years, 0)) * 12);
  const annual = clampNumber(annualRatePct, 0) / 100;
  const r = annual / 12;

  if (months <= 0) return 0;
  if (r === 0) return p * months;

  // Assume contribution at start of month (slightly optimistic) to keep UX simple.
  const fv = p * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
  return fv;
}

function netRate(expectedReturnPct, expenseRatioPct) {
  const gross = clampNumber(expectedReturnPct, 0);
  const exp = clampNumber(expenseRatioPct, 0);
  return gross - exp;
}

export function FundCostComparator() {
  const [lumpsum, setLumpsum] = useState(500000);
  const [sip, setSip] = useState(25000);
  const [years, setYears] = useState(10);

  const [expectedA, setExpectedA] = useState(12);
  const [expenseA, setExpenseA] = useState(1.5);

  const [expectedB, setExpectedB] = useState(12);
  const [expenseB, setExpenseB] = useState(0.6);

  const results = useMemo(() => {
    const netA = netRate(expectedA, expenseA);
    const netB = netRate(expectedB, expenseB);

    const a = futureValueLumpsum(lumpsum, netA, years) + futureValueSip(sip, netA, years);
    const b = futureValueLumpsum(lumpsum, netB, years) + futureValueSip(sip, netB, years);

    return {
      netA,
      netB,
      fvA: a,
      fvB: b,
      delta: b - a,
    };
  }, [lumpsum, sip, years, expectedA, expenseA, expectedB, expenseB]);

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
      <h3
        style={{
          margin: "0 0 10px 0",
          fontSize: 18,
          color: "#DAA520",
          fontWeight: 700,
        }}
      >
        Fund Cost & Return Comparator (Educational)
      </h3>
      <p style={{ margin: "0 0 16px 0", fontSize: 14, color: "#d0d0d0", lineHeight: 1.75 }}>
        This compares two scenarios using your assumptions (expected return and expense ratio). It is not a fund
        recommendation.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
          marginBottom: 14,
        }}
      >
        <div>
          <div style={label}>Lumpsum (₹)</div>
          <input
            style={field}
            inputMode="numeric"
            value={lumpsum}
            onChange={(e) => setLumpsum(clampNumber(e.target.value, 0))}
          />
        </div>
        <div>
          <div style={label}>Monthly SIP (₹)</div>
          <input
            style={field}
            inputMode="numeric"
            value={sip}
            onChange={(e) => setSip(clampNumber(e.target.value, 0))}
          />
        </div>
        <div>
          <div style={label}>Time horizon (years)</div>
          <input
            style={field}
            inputMode="numeric"
            value={years}
            onChange={(e) => setYears(clampNumber(e.target.value, 0))}
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
        <div style={{ padding: 16, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }}>
          <div style={{ fontSize: 13, color: "#C0A062", fontWeight: 700, marginBottom: 10 }}>Scenario A</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div style={label}>Expected return (%/yr)</div>
              <input
                style={field}
                inputMode="decimal"
                value={expectedA}
                onChange={(e) => setExpectedA(clampNumber(e.target.value, 0))}
              />
            </div>
            <div>
              <div style={label}>Expense ratio (%/yr)</div>
              <input
                style={field}
                inputMode="decimal"
                value={expenseA}
                onChange={(e) => setExpenseA(clampNumber(e.target.value, 0))}
              />
            </div>
          </div>
          <p style={{ margin: "12px 0 0 0", fontSize: 12, color: "#b8b8b8" }}>
            Net modeled return: <strong style={{ color: "#fff" }}>{results.netA.toFixed(2)}%</strong>
          </p>
          <p style={{ margin: "10px 0 0 0", fontSize: 13, color: "#e5e5e5" }}>
            Estimated value: <strong style={{ color: "#DAA520" }}>{formatINR(results.fvA)}</strong>
          </p>
        </div>

        <div style={{ padding: 16, border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12 }}>
          <div style={{ fontSize: 13, color: "#C0A062", fontWeight: 700, marginBottom: 10 }}>Scenario B</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <div style={label}>Expected return (%/yr)</div>
              <input
                style={field}
                inputMode="decimal"
                value={expectedB}
                onChange={(e) => setExpectedB(clampNumber(e.target.value, 0))}
              />
            </div>
            <div>
              <div style={label}>Expense ratio (%/yr)</div>
              <input
                style={field}
                inputMode="decimal"
                value={expenseB}
                onChange={(e) => setExpenseB(clampNumber(e.target.value, 0))}
              />
            </div>
          </div>
          <p style={{ margin: "12px 0 0 0", fontSize: 12, color: "#b8b8b8" }}>
            Net modeled return: <strong style={{ color: "#fff" }}>{results.netB.toFixed(2)}%</strong>
          </p>
          <p style={{ margin: "10px 0 0 0", fontSize: 13, color: "#e5e5e5" }}>
            Estimated value: <strong style={{ color: "#DAA520" }}>{formatINR(results.fvB)}</strong>
          </p>
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
            Difference (B − A):{" "}
            <strong style={{ color: results.delta >= 0 ? "#DAA520" : "#fff" }}>{formatINR(results.delta)}</strong>
          </div>
          <div style={{ fontSize: 12, color: "#b8b8b8" }}>Assumption-only • Not advice</div>
        </div>
      </div>

      <p style={{ margin: "12px 0 0 0", fontSize: 12, color: "#999", lineHeight: 1.6 }}>
        Notes: Expense ratios and returns vary over time. Market-linked outcomes can fluctuate. For official numbers,
        confirm from AMC/SEBI/AMFI disclosures.
      </p>
    </div>
  );
}
