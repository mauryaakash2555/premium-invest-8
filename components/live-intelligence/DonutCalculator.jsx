'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';

/**
 * DonutCalculator - Collapsible Calculator
 * The donut UI is in the overlay - this is just the calculator controls
 */

const CALC_MODES = {
  sip: { key: 'sip', label: 'SIP', icon: '📈' },
  lumpsum: { key: 'lumpsum', label: 'Lumpsum', icon: '💰' },
  goal: { key: 'goal', label: 'Goal', icon: '🎯' },
  retirement: { key: 'retirement', label: 'Retire', icon: '🏖️' },
};

const fmt = (n) => {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
};

const calcSIP = (m, y, r) => {
  const n = y * 12, rate = r / 100 / 12;
  const inv = m * n;
  const fv = m * ((Math.pow(1 + rate, n) - 1) / rate) * (1 + rate);
  return { invested: inv, futureValue: fv, returns: fv - inv, cagr: r, years: y };
};

const calcLump = (p, y, r) => {
  const fv = p * Math.pow(1 + r / 100, y);
  return { invested: p, futureValue: fv, returns: fv - p, cagr: r, years: y };
};

const calcGoal = (t, y, r) => {
  const n = y * 12, rate = r / 100 / 12;
  const sip = t * rate / ((Math.pow(1 + rate, n) - 1) * (1 + rate));
  const inv = sip * n;
  return { invested: inv, futureValue: t, returns: t - inv, monthlySIP: Math.ceil(sip), cagr: r, years: y };
};

const calcRetire = (exp, age, retAge) => {
  const yrs = retAge - age, retYrs = 85 - retAge;
  const futExp = exp * Math.pow(1.06, yrs);
  const corpus = futExp * 12 * retYrs * 1.3;
  const n = yrs * 12, rate = 0.12 / 12;
  const sip = corpus * rate / ((Math.pow(1 + rate, n) - 1) * (1 + rate));
  return { invested: sip * n, futureValue: corpus, returns: corpus - sip * n, monthlySIP: Math.ceil(sip), futureExp: Math.round(futExp), cagr: 12, years: yrs };
};

export default function DonutCalculator() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('sip');
  
  const [sipAmt, setSipAmt] = useState(10000);
  const [sipYrs, setSipYrs] = useState(10);
  const [sipRate, setSipRate] = useState(12);
  const [lumpAmt, setLumpAmt] = useState(500000);
  const [lumpYrs, setLumpYrs] = useState(5);
  const [lumpRate, setLumpRate] = useState(12);
  const [goalAmt, setGoalAmt] = useState(2500000);
  const [goalYrs, setGoalYrs] = useState(10);
  const [goalRate, setGoalRate] = useState(12);
  const [retExp, setRetExp] = useState(50000);
  const [currAge, setCurrAge] = useState(30);
  const [retAge, setRetAge] = useState(55);

  const result = useMemo(() => {
    switch (mode) {
      case 'sip': return calcSIP(sipAmt, sipYrs, sipRate);
      case 'lumpsum': return calcLump(lumpAmt, lumpYrs, lumpRate);
      case 'goal': return calcGoal(goalAmt, goalYrs, goalRate);
      case 'retirement': return calcRetire(retExp, currAge, retAge);
      default: return calcSIP(10000, 10, 12);
    }
  }, [mode, sipAmt, sipYrs, sipRate, lumpAmt, lumpYrs, lumpRate, goalAmt, goalYrs, goalRate, retExp, currAge, retAge]);

  return (
    <div className="calc-wrap">
      <button type="button" className="calc-toggle" onClick={() => setIsOpen(!isOpen)}>
        <span className="calc-toggle-icon">🧮</span>
        <span className="calc-toggle-text">Investment Calculator</span>
        <span className={`calc-toggle-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>

      {isOpen && (
        <div className="calc-content">
          <div className="calc-tabs">
            {Object.values(CALC_MODES).map(m => (
              <button
                key={m.key}
                type="button"
                className={`calc-tab ${mode === m.key ? 'active' : ''}`}
                onClick={() => setMode(m.key)}
              >
                <span>{m.icon}</span>
                <span>{m.label}</span>
              </button>
            ))}
          </div>

          <div className="calc-inputs">
            {mode === 'sip' && (
              <>
                <div className="calc-field">
                  <label>Monthly (₹)</label>
                  <input type="text" inputMode="numeric" value={sipAmt} onChange={e => setSipAmt(+e.target.value.replace(/\D/g, '') || 500)} />
                </div>
                <div className="calc-field">
                  <label>Years</label>
                  <input type="text" inputMode="numeric" value={sipYrs} onChange={e => setSipYrs(Math.min(40, +e.target.value.replace(/\D/g, '') || 1))} />
                </div>
                <div className="calc-field">
                  <label>Rate %</label>
                  <input type="text" inputMode="decimal" value={sipRate} onChange={e => setSipRate(+e.target.value.replace(/[^\d.]/g, '') || 1)} />
                </div>
              </>
            )}
            {mode === 'lumpsum' && (
              <>
                <div className="calc-field">
                  <label>Amount (₹)</label>
                  <input type="text" inputMode="numeric" value={lumpAmt} onChange={e => setLumpAmt(+e.target.value.replace(/\D/g, '') || 1000)} />
                </div>
                <div className="calc-field">
                  <label>Years</label>
                  <input type="text" inputMode="numeric" value={lumpYrs} onChange={e => setLumpYrs(Math.min(40, +e.target.value.replace(/\D/g, '') || 1))} />
                </div>
                <div className="calc-field">
                  <label>Rate %</label>
                  <input type="text" inputMode="decimal" value={lumpRate} onChange={e => setLumpRate(+e.target.value.replace(/[^\d.]/g, '') || 1)} />
                </div>
              </>
            )}
            {mode === 'goal' && (
              <>
                <div className="calc-field">
                  <label>Target (₹)</label>
                  <input type="text" inputMode="numeric" value={goalAmt} onChange={e => setGoalAmt(+e.target.value.replace(/\D/g, '') || 10000)} />
                </div>
                <div className="calc-field">
                  <label>Years</label>
                  <input type="text" inputMode="numeric" value={goalYrs} onChange={e => setGoalYrs(Math.min(40, +e.target.value.replace(/\D/g, '') || 1))} />
                </div>
                <div className="calc-field">
                  <label>Rate %</label>
                  <input type="text" inputMode="decimal" value={goalRate} onChange={e => setGoalRate(+e.target.value.replace(/[^\d.]/g, '') || 1)} />
                </div>
              </>
            )}
            {mode === 'retirement' && (
              <>
                <div className="calc-field">
                  <label>Expense/mo (₹)</label>
                  <input type="text" inputMode="numeric" value={retExp} onChange={e => setRetExp(+e.target.value.replace(/\D/g, '') || 10000)} />
                </div>
                <div className="calc-field">
                  <label>Age</label>
                  <input type="text" inputMode="numeric" value={currAge} onChange={e => setCurrAge(Math.min(60, +e.target.value.replace(/\D/g, '') || 18))} />
                </div>
                <div className="calc-field">
                  <label>Retire at</label>
                  <input type="text" inputMode="numeric" value={retAge} onChange={e => setRetAge(Math.max(currAge + 5, +e.target.value.replace(/\D/g, '') || 55))} />
                </div>
              </>
            )}
          </div>

          <div className="calc-results">
            <div className="calc-result">
              <span className="calc-result-label">{mode === 'goal' || mode === 'retirement' ? 'SIP Needed' : 'Invested'}</span>
              <span className="calc-result-value">
                {mode === 'goal' || mode === 'retirement' ? fmt(result.monthlySIP) + '/mo' : fmt(result.invested)}
              </span>
            </div>
            <div className="calc-result highlight">
              <span className="calc-result-label">Future Value</span>
              <span className="calc-result-value">{fmt(result.futureValue)}</span>
            </div>
            <div className="calc-result">
              <span className="calc-result-label">Returns</span>
              <span className="calc-result-value gain">+{fmt(result.returns)}</span>
            </div>
          </div>

          <div className="calc-cta">
            <button type="button" onClick={() => router.push('/tools')}>📥 More Tools</button>
          </div>
        </div>
      )}

      <style jsx>{`
        .calc-wrap {
          margin-top: 16px;
          border-radius: 12px;
          overflow: hidden;
          background: rgba(10, 15, 25, 0.5);
          border: 1px solid rgba(100, 180, 255, 0.08);
        }
        .calc-toggle {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
        }
        .calc-toggle:hover { background: rgba(100, 180, 255, 0.05); }
        .calc-toggle-icon { font-size: 16px; }
        .calc-toggle-text {
          flex: 1;
          text-align: left;
          color: rgba(180, 200, 230, 0.7);
          font-size: 12px;
          font-weight: 500;
        }
        .calc-toggle-arrow {
          color: rgba(150, 180, 220, 0.4);
          font-size: 9px;
          transition: transform 0.2s;
        }
        .calc-toggle-arrow.open { transform: rotate(180deg); }
        .calc-content {
          padding: 0 14px 14px;
          animation: fadeIn 0.2s ease-out;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .calc-tabs {
          display: flex;
          gap: 6px;
          margin-bottom: 12px;
        }
        .calc-tab {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2px;
          padding: 8px 4px;
          background: rgba(100, 180, 255, 0.04);
          border: 1px solid rgba(100, 180, 255, 0.06);
          border-radius: 8px;
          color: rgba(150, 180, 220, 0.5);
          font-size: 9px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .calc-tab span:first-child { font-size: 14px; }
        .calc-tab:hover {
          background: rgba(100, 180, 255, 0.08);
          color: rgba(180, 210, 255, 0.7);
        }
        .calc-tab.active {
          background: rgba(100, 180, 255, 0.12);
          border-color: rgba(100, 180, 255, 0.2);
          color: rgba(130, 200, 255, 0.9);
        }
        .calc-inputs {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }
        .calc-field { flex: 1; }
        .calc-field label {
          display: block;
          font-size: 9px;
          color: rgba(150, 180, 220, 0.5);
          margin-bottom: 4px;
        }
        .calc-field input {
          width: 100%;
          padding: 8px 10px;
          background: rgba(10, 18, 30, 0.7);
          border: 1px solid rgba(100, 180, 255, 0.1);
          border-radius: 6px;
          color: rgba(220, 235, 255, 0.95);
          font-size: 14px;
          font-weight: 600;
          text-align: center;
          outline: none;
          -moz-appearance: textfield;
        }
        .calc-field input::-webkit-outer-spin-button,
        .calc-field input::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }
        .calc-field input:focus { border-color: rgba(100, 180, 255, 0.3); }
        .calc-results {
          display: flex;
          gap: 8px;
          margin-bottom: 12px;
        }
        .calc-result {
          flex: 1;
          padding: 10px 8px;
          background: rgba(15, 22, 35, 0.5);
          border: 1px solid rgba(100, 180, 255, 0.05);
          border-radius: 8px;
          text-align: center;
        }
        .calc-result.highlight {
          background: rgba(100, 180, 255, 0.08);
          border-color: rgba(100, 180, 255, 0.12);
        }
        .calc-result-label {
          display: block;
          font-size: 9px;
          color: rgba(150, 180, 220, 0.5);
          margin-bottom: 4px;
        }
        .calc-result-value {
          font-size: 13px;
          font-weight: 700;
          color: rgba(220, 235, 255, 0.95);
        }
        .calc-result-value.gain { color: rgba(100, 220, 160, 0.9); }
        .calc-cta { display: flex; justify-content: center; }
        .calc-cta button {
          padding: 10px 20px;
          background: rgba(100, 180, 255, 0.08);
          border: 1px solid rgba(100, 180, 255, 0.15);
          border-radius: 8px;
          color: rgba(130, 200, 255, 0.85);
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .calc-cta button:hover { background: rgba(100, 180, 255, 0.15); }
        @media (max-width: 500px) {
          .calc-inputs { flex-wrap: wrap; }
          .calc-field { min-width: calc(50% - 4px); }
          .calc-results { flex-wrap: wrap; }
          .calc-result { min-width: calc(50% - 4px); }
        }
      `}</style>
    </div>
  );
}
