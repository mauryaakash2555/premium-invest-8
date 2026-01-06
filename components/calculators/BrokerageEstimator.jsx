"use client";

import { useMemo, useState } from "react";

import { formatINR } from "@/lib/tax-formulas";

function clampNumber(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function percentOf(value, pct) {
  return value * (pct / 100);
}

const TRADE_TYPES = [
  {
    key: "delivery",
    label: "Delivery",
    sttBuyPct: 0.1,
    sttSellPct: 0.1,
    brokeragePerOrder: 0,
  },
  {
    key: "intraday",
    label: "Intraday",
    sttBuyPct: 0,
    sttSellPct: 0.025,
    brokeragePerOrder: 20,
  },
  {
    key: "fo",
    label: "F&O",
    sttBuyPct: 0,
    sttSellPct: 0.0125,
    brokeragePerOrder: 20,
  },
];

export function BrokerageEstimator() {
  const [tradeType, setTradeType] = useState("intraday");
  const [buyPrice, setBuyPrice] = useState(250);
  const [sellPrice, setSellPrice] = useState(275);
  const [quantity, setQuantity] = useState(100);

  // Adjustable “typical” defaults (purely educational)
  const [brokeragePerOrder, setBrokeragePerOrder] = useState(20);
  const [exchangeTxnPct, setExchangeTxnPct] = useState(0.00325);
  const [gstPct, setGstPct] = useState(18);
  const [sebiPct, setSebiPct] = useState(0.0001);
  const [stampDutyBuyPct, setStampDutyBuyPct] = useState(0.003);

  const t = useMemo(() => TRADE_TYPES.find((x) => x.key === tradeType) || TRADE_TYPES[1], [tradeType]);

  const result = useMemo(() => {
    const bp = Math.max(0, clampNumber(buyPrice, 0));
    const sp = Math.max(0, clampNumber(sellPrice, 0));
    const q = Math.max(0, Math.floor(clampNumber(quantity, 0)));

    const buyTurnover = bp * q;
    const sellTurnover = sp * q;
    const turnover = buyTurnover + sellTurnover;

    const grossPnL = sellTurnover - buyTurnover;

    const broPerOrder = tradeType === t.key ? clampNumber(brokeragePerOrder, t.brokeragePerOrder) : clampNumber(brokeragePerOrder, t.brokeragePerOrder);
    const brokerage = Math.max(0, broPerOrder) * 2; // buy + sell

    const stt = percentOf(buyTurnover, t.sttBuyPct) + percentOf(sellTurnover, t.sttSellPct);
    const exchangeTxn = percentOf(turnover, clampNumber(exchangeTxnPct, 0));
    const sebi = percentOf(turnover, clampNumber(sebiPct, 0));
    const stampDuty = percentOf(buyTurnover, clampNumber(stampDutyBuyPct, 0));

    // GST typically applies on brokerage + exchange txn (approx); keep it simple.
    const gstBase = brokerage + exchangeTxn;
    const gst = percentOf(gstBase, clampNumber(gstPct, 0));

    const totalCharges = brokerage + stt + exchangeTxn + sebi + stampDuty + gst;
    const netPnL = grossPnL - totalCharges;

    return {
      buyTurnover,
      sellTurnover,
      turnover,
      grossPnL,
      brokerage,
      stt,
      exchangeTxn,
      sebi,
      stampDuty,
      gst,
      totalCharges,
      netPnL,
    };
  }, [buyPrice, sellPrice, quantity, brokeragePerOrder, exchangeTxnPct, gstPct, sebiPct, stampDutyBuyPct, tradeType, t.key, t.sttBuyPct, t.sttSellPct, t.brokeragePerOrder]);

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

  const pill = (active) => ({
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid rgba(218, 165, 32, 0.22)",
    background: active ? "rgba(218, 165, 32, 0.18)" : "transparent",
    color: active ? "#DAA520" : "#d0d0d0",
    cursor: "pointer",
    fontSize: 13,
  });

  const row = {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    fontSize: 13,
    color: "#e5e5e5",
    padding: "8px 0",
    borderBottom: "1px solid rgba(255,255,255,0.06)",
  };

  return (
    <div style={card}>
      <h3 style={{ margin: "0 0 10px 0", fontSize: 18, color: "#DAA520", fontWeight: 700 }}>
        Brokerage & Charges Estimator (Educational)
      </h3>
      <p style={{ margin: "0 0 16px 0", fontSize: 14, color: "#d0d0d0", lineHeight: 1.75 }}>
        A simplified estimate to help you understand cost components. Actual charges depend on your broker, exchange,
        segment, and regulatory updates.
      </p>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
        {TRADE_TYPES.map((x) => (
          <button key={x.key} type="button" style={pill(tradeType === x.key)} onClick={() => setTradeType(x.key)}>
            {x.label}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        <div>
          <div style={label}>Buy price (₹)</div>
          <input style={field} inputMode="decimal" value={buyPrice} onChange={(e) => setBuyPrice(clampNumber(e.target.value, 0))} />
        </div>
        <div>
          <div style={label}>Sell price (₹)</div>
          <input style={field} inputMode="decimal" value={sellPrice} onChange={(e) => setSellPrice(clampNumber(e.target.value, 0))} />
        </div>
        <div>
          <div style={label}>Quantity</div>
          <input style={field} inputMode="numeric" value={quantity} onChange={(e) => setQuantity(clampNumber(e.target.value, 0))} />
        </div>
      </div>

      <div style={{ marginTop: 14, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        <div>
          <div style={label}>Brokerage per order (₹)</div>
          <input style={field} inputMode="decimal" value={brokeragePerOrder} onChange={(e) => setBrokeragePerOrder(clampNumber(e.target.value, 0))} />
        </div>
        <div>
          <div style={label}>Exchange txn charge (% of turnover)</div>
          <input style={field} inputMode="decimal" value={exchangeTxnPct} onChange={(e) => setExchangeTxnPct(clampNumber(e.target.value, 0))} />
        </div>
        <div>
          <div style={label}>Stamp duty (buy side, %)</div>
          <input style={field} inputMode="decimal" value={stampDutyBuyPct} onChange={(e) => setStampDutyBuyPct(clampNumber(e.target.value, 0))} />
        </div>
        <div>
          <div style={label}>SEBI charges (% of turnover)</div>
          <input style={field} inputMode="decimal" value={sebiPct} onChange={(e) => setSebiPct(clampNumber(e.target.value, 0))} />
        </div>
        <div>
          <div style={label}>GST (% on brokerage + exchange txn)</div>
          <input style={field} inputMode="decimal" value={gstPct} onChange={(e) => setGstPct(clampNumber(e.target.value, 0))} />
        </div>
      </div>

      <div style={{ marginTop: 16, padding: 16, borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
          <div style={{ fontSize: 13, color: "#b8b8b8" }}>Turnover</div>
          <div style={{ fontSize: 14, color: "#fff", fontWeight: 700 }}>{formatINR(result.turnover)}</div>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ fontSize: 13, color: "#b8b8b8" }}>Gross P&L</div>
          <div style={{ fontSize: 14, color: result.grossPnL >= 0 ? "#DAA520" : "#fff", fontWeight: 700 }}>
            {formatINR(result.grossPnL)}
          </div>
        </div>

        <div style={{ marginTop: 12 }}>
          <div style={row}>
            <span>Brokerage</span>
            <strong style={{ color: "#fff" }}>{formatINR(result.brokerage)}</strong>
          </div>
          <div style={row}>
            <span>STT (segment default)</span>
            <strong style={{ color: "#fff" }}>{formatINR(result.stt)}</strong>
          </div>
          <div style={row}>
            <span>Exchange txn</span>
            <strong style={{ color: "#fff" }}>{formatINR(result.exchangeTxn)}</strong>
          </div>
          <div style={row}>
            <span>SEBI charges</span>
            <strong style={{ color: "#fff" }}>{formatINR(result.sebi)}</strong>
          </div>
          <div style={row}>
            <span>Stamp duty (buy side)</span>
            <strong style={{ color: "#fff" }}>{formatINR(result.stampDuty)}</strong>
          </div>
          <div style={{ ...row, borderBottom: "none" }}>
            <span>GST</span>
            <strong style={{ color: "#fff" }}>{formatINR(result.gst)}</strong>
          </div>
        </div>

        <div
          style={{
            marginTop: 14,
            paddingTop: 12,
            borderTop: "1px solid rgba(255,255,255,0.06)",
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <div style={{ fontSize: 13, color: "#b8b8b8" }}>Total charges</div>
          <div style={{ fontSize: 14, color: "#fff", fontWeight: 700 }}>{formatINR(result.totalCharges)}</div>
        </div>
        <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <div style={{ fontSize: 13, color: "#b8b8b8" }}>Net P&L (after charges)</div>
          <div style={{ fontSize: 16, color: result.netPnL >= 0 ? "#DAA520" : "#fff", fontWeight: 800 }}>
            {formatINR(result.netPnL)}
          </div>
        </div>
      </div>

      <p style={{ margin: "12px 0 0 0", fontSize: 12, color: "#999", lineHeight: 1.6 }}>
        This is a simplified estimate for understanding fees, not an official brokerage calculator. Rates differ by segment,
        broker plan, and regulation updates.
      </p>
    </div>
  );
}
