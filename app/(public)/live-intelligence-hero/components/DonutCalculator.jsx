'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';

/**
 * DonutCalculator - Ultimate All-Services Calculator
 * 
 * ALL 6 SERVICES:
 * 1. SIP Calculator
 * 2. Lumpsum Calculator
 * 3. Goal Planning
 * 4. Retirement Planning
 * 5. FD Calculator
 * 6. Insurance Calculator
 * 
 * Features:
 * - Scrollable dropdown (morn style)
 * - No arrows on numbers
 * - Modern & premium design
 * - Donut changes when numbers change
 */

// All 6 service calculators
const CALC_MODES = {
  sip: { key: 'sip', label: 'SIP', icon: '📈', desc: 'Monthly investment growth' },
  lumpsum: { key: 'lumpsum', label: 'Lumpsum', icon: '💰', desc: 'One-time investment' },
  goal: { key: 'goal', label: 'Goal', icon: '🎯', desc: 'Target amount planning' },
  retire: { key: 'retire', label: 'Retire', icon: '🏖️', desc: 'Retirement corpus' },
  fd: { key: 'fd', label: 'FD', icon: '🏦', desc: 'Fixed deposit returns' },
  insurance: { key: 'insurance', label: 'Insurance', icon: '🛡️', desc: 'Life cover calculator' },
};

// Format to Indian currency
const fmt = (n) => {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(0)}K`;
  return `₹${Math.round(n).toLocaleString('en-IN')}`;
};

// SIP Calculator
const calcSIP = (m, y, r) => {
  const n = y * 12, rate = r / 100 / 12;
  const inv = m * n;
  const fv = m * ((Math.pow(1 + rate, n) - 1) / rate) * (1 + rate);
  return { invested: inv, futureValue: fv, returns: fv - inv, cagr: r, years: y };
};

// Lumpsum Calculator
const calcLump = (p, y, r) => {
  const fv = p * Math.pow(1 + r / 100, y);
  return { invested: p, futureValue: fv, returns: fv - p, cagr: r, years: y };
};

// Goal Planning Calculator
const calcGoal = (t, y, r) => {
  const n = y * 12, rate = r / 100 / 12;
  const sip = t * rate / ((Math.pow(1 + rate, n) - 1) * (1 + rate));
  const inv = sip * n;
  return { invested: inv, futureValue: t, returns: t - inv, monthlySIP: Math.ceil(sip), cagr: r, years: y };
};

// Retirement Calculator
const calcRetire = (exp, age, retAge) => {
  const yrs = retAge - age, retYrs = 85 - retAge;
  const futExp = exp * Math.pow(1.06, yrs);
  const corpus = futExp * 12 * retYrs * 1.3;
  const n = yrs * 12, rate = 0.12 / 12;
  const sip = corpus * rate / ((Math.pow(1 + rate, n) - 1) * (1 + rate));
  return { invested: sip * n, futureValue: corpus, returns: corpus - sip * n, monthlySIP: Math.ceil(sip), futureExp: Math.round(futExp), cagr: 12, years: yrs };
};

// FD Calculator
const calcFD = (p, y, r, compound = 4) => {
  const n = compound * y;
  const rate = r / 100 / compound;
  const fv = p * Math.pow(1 + rate, n);
  const interest = fv - p;
  return { invested: p, futureValue: fv, returns: interest, interestEarned: interest, cagr: r, years: y };
};

// Insurance Calculator (Life Cover estimation)
const calcInsurance = (age, income, liabilities, dependents) => {
  const workingYears = 60 - age;
  const incomeReplacement = income * 12 * workingYears * 0.7;
  const liabilityCover = liabilities;
  const dependentCover = dependents * 500000;
  const totalCover = incomeReplacement + liabilityCover + dependentCover;
  const annualPremium = totalCover * 0.003 * (1 + (age - 25) * 0.02);
  return { 
    coverNeeded: totalCover, 
    annualPremium: Math.round(annualPremium), 
    monthlyPremium: Math.round(annualPremium / 12),
    incomeReplacement,
    liabilityCover,
    dependentCover,
  };
};

export default function DonutCalculator({ onResultChange }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState('sip');
  
  // SIP inputs
  const [sipAmt, setSipAmt] = useState(10000);
  const [sipYrs, setSipYrs] = useState(10);
  const [sipRate, setSipRate] = useState(12);
  
  // Lumpsum inputs
  const [lumpAmt, setLumpAmt] = useState(500000);
  const [lumpYrs, setLumpYrs] = useState(5);
  const [lumpRate, setLumpRate] = useState(12);
  
  // Goal inputs
  const [goalAmt, setGoalAmt] = useState(2500000);
  const [goalYrs, setGoalYrs] = useState(10);
  const [goalRate, setGoalRate] = useState(12);
  
  // Retirement inputs
  const [retExp, setRetExp] = useState(50000);
  const [currAge, setCurrAge] = useState(30);
  const [retAge, setRetAge] = useState(55);
  
  // FD inputs
  const [fdAmt, setFdAmt] = useState(500000);
  const [fdYrs, setFdYrs] = useState(3);
  const [fdRate, setFdRate] = useState(7.5);
  
  // Insurance inputs
  const [insAge, setInsAge] = useState(30);
  const [insIncome, setInsIncome] = useState(100000);
  const [insLiabilities, setInsLiabilities] = useState(2000000);
  const [insDependents, setInsDependents] = useState(2);

  const result = useMemo(() => {
    switch (mode) {
      case 'sip': return calcSIP(sipAmt, sipYrs, sipRate);
      case 'lumpsum': return calcLump(lumpAmt, lumpYrs, lumpRate);
      case 'goal': return calcGoal(goalAmt, goalYrs, goalRate);
      case 'retire': return calcRetire(retExp, currAge, retAge);
      case 'fd': return calcFD(fdAmt, fdYrs, fdRate);
      case 'insurance': return calcInsurance(insAge, insIncome, insLiabilities, insDependents);
      default: return calcSIP(10000, 10, 12);
    }
  }, [mode, sipAmt, sipYrs, sipRate, lumpAmt, lumpYrs, lumpRate, goalAmt, goalYrs, goalRate, retExp, currAge, retAge, fdAmt, fdYrs, fdRate, insAge, insIncome, insLiabilities, insDependents]);

  // Handle input changes (no arrows)
  const handleNumericInput = (setter, min = 0, max = Infinity) => (e) => {
    const val = e.target.value.replace(/[^\d.]/g, '');
    const num = parseFloat(val) || min;
    setter(Math.min(max, Math.max(min, num)));
  };

  return (
    <div className="calc-wrap">
      {/* Toggle Header */}
      <button type="button" className="calc-toggle" onClick={() => setIsOpen(!isOpen)}>
        <span className="calc-toggle-icon li-calc-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(140, 200, 255, 0.95)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="2" width="16" height="20" rx="2"/>
            <line x1="8" y1="6" x2="16" y2="6"/>
            <line x1="8" y1="10" x2="10" y2="10"/>
            <line x1="14" y1="10" x2="16" y2="10"/>
            <line x1="8" y1="14" x2="10" y2="14"/>
            <line x1="14" y1="14" x2="16" y2="14"/>
            <line x1="8" y1="18" x2="10" y2="18"/>
            <line x1="14" y1="18" x2="16" y2="18"/>
          </svg>
        </span>
        <span className="calc-toggle-text">Ultimate Calculator</span>
        <span className="calc-toggle-badge">6 Services</span>
        <span className={`calc-toggle-arrow ${isOpen ? 'open' : ''}`}>▼</span>
      </button>

      {/* Collapsible Calculator Content - SCROLLABLE */}
      {isOpen && (
        <div className="calc-content">
          {/* Scrollable Tabs */}
          <div className="calc-tabs-scroll">
            <div className="calc-tabs">
              {Object.values(CALC_MODES).map(m => (
                <button
                  key={m.key}
                  type="button"
                  className={`calc-tab ${mode === m.key ? 'active' : ''}`}
                  onClick={() => setMode(m.key)}
                >
                  <span className="calc-tab-icon">{m.icon}</span>
                  <span className="calc-tab-label">{m.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Mode description */}
          <div className="calc-mode-desc">
            {CALC_MODES[mode].desc}
          </div>

          {/* Inputs - varies by mode */}
          <div className="calc-inputs">
            {mode === 'sip' && (
              <>
                <div className="calc-field">
                  <label>Monthly</label>
                  <div className="calc-input-wrap">
                    <span className="calc-input-prefix">₹</span>
                    <input type="text" inputMode="numeric" value={sipAmt} onChange={handleNumericInput(setSipAmt, 500)} />
                  </div>
                </div>
                <div className="calc-field">
                  <label>Years</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="numeric" value={sipYrs} onChange={handleNumericInput(setSipYrs, 1, 40)} />
                    <span className="calc-input-suffix">yrs</span>
                  </div>
                </div>
                <div className="calc-field">
                  <label>Return</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="decimal" value={sipRate} onChange={handleNumericInput(setSipRate, 1, 30)} />
                    <span className="calc-input-suffix">%</span>
                  </div>
                </div>
              </>
            )}
            
            {mode === 'lumpsum' && (
              <>
                <div className="calc-field">
                  <label>Amount</label>
                  <div className="calc-input-wrap">
                    <span className="calc-input-prefix">₹</span>
                    <input type="text" inputMode="numeric" value={lumpAmt} onChange={handleNumericInput(setLumpAmt, 1000)} />
                  </div>
                </div>
                <div className="calc-field">
                  <label>Years</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="numeric" value={lumpYrs} onChange={handleNumericInput(setLumpYrs, 1, 40)} />
                    <span className="calc-input-suffix">yrs</span>
                  </div>
                </div>
                <div className="calc-field">
                  <label>Return</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="decimal" value={lumpRate} onChange={handleNumericInput(setLumpRate, 1, 30)} />
                    <span className="calc-input-suffix">%</span>
                  </div>
                </div>
              </>
            )}
            
            {mode === 'goal' && (
              <>
                <div className="calc-field">
                  <label>Target</label>
                  <div className="calc-input-wrap">
                    <span className="calc-input-prefix">₹</span>
                    <input type="text" inputMode="numeric" value={goalAmt} onChange={handleNumericInput(setGoalAmt, 10000)} />
                  </div>
                </div>
                <div className="calc-field">
                  <label>Years</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="numeric" value={goalYrs} onChange={handleNumericInput(setGoalYrs, 1, 40)} />
                    <span className="calc-input-suffix">yrs</span>
                  </div>
                </div>
                <div className="calc-field">
                  <label>Return</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="decimal" value={goalRate} onChange={handleNumericInput(setGoalRate, 1, 30)} />
                    <span className="calc-input-suffix">%</span>
                  </div>
                </div>
              </>
            )}
            
            {mode === 'retire' && (
              <>
                <div className="calc-field">
                  <label>Expense/mo</label>
                  <div className="calc-input-wrap">
                    <span className="calc-input-prefix">₹</span>
                    <input type="text" inputMode="numeric" value={retExp} onChange={handleNumericInput(setRetExp, 10000)} />
                  </div>
                </div>
                <div className="calc-field">
                  <label>Your Age</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="numeric" value={currAge} onChange={handleNumericInput(setCurrAge, 18, 55)} />
                  </div>
                </div>
                <div className="calc-field">
                  <label>Retire At</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="numeric" value={retAge} onChange={handleNumericInput(setRetAge, currAge + 5, 65)} />
                  </div>
                </div>
              </>
            )}
            
            {mode === 'fd' && (
              <>
                <div className="calc-field">
                  <label>Principal</label>
                  <div className="calc-input-wrap">
                    <span className="calc-input-prefix">₹</span>
                    <input type="text" inputMode="numeric" value={fdAmt} onChange={handleNumericInput(setFdAmt, 1000)} />
                  </div>
                </div>
                <div className="calc-field">
                  <label>Tenure</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="numeric" value={fdYrs} onChange={handleNumericInput(setFdYrs, 1, 10)} />
                    <span className="calc-input-suffix">yrs</span>
                  </div>
                </div>
                <div className="calc-field">
                  <label>Rate</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="decimal" value={fdRate} onChange={handleNumericInput(setFdRate, 3, 10)} />
                    <span className="calc-input-suffix">%</span>
                  </div>
                </div>
              </>
            )}
            
            {mode === 'insurance' && (
              <>
                <div className="calc-field">
                  <label>Your Age</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="numeric" value={insAge} onChange={handleNumericInput(setInsAge, 18, 55)} />
                  </div>
                </div>
                <div className="calc-field">
                  <label>Income/mo</label>
                  <div className="calc-input-wrap">
                    <span className="calc-input-prefix">₹</span>
                    <input type="text" inputMode="numeric" value={insIncome} onChange={handleNumericInput(setInsIncome, 10000)} />
                  </div>
                </div>
                <div className="calc-field">
                  <label>Liabilities</label>
                  <div className="calc-input-wrap">
                    <span className="calc-input-prefix">₹</span>
                    <input type="text" inputMode="numeric" value={insLiabilities} onChange={handleNumericInput(setInsLiabilities, 0)} />
                  </div>
                </div>
                <div className="calc-field">
                  <label>Dependents</label>
                  <div className="calc-input-wrap">
                    <input type="text" inputMode="numeric" value={insDependents} onChange={handleNumericInput(setInsDependents, 0, 10)} />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Results - varies by mode */}
          <div className="calc-results">
            {mode !== 'insurance' ? (
              <>
                <div className="calc-result">
                  <span className="calc-result-label">
                    {mode === 'goal' || mode === 'retire' ? 'SIP Needed' : 'Invested'}
                  </span>
                  <span className="calc-result-value">
                    {mode === 'goal' || mode === 'retire' 
                      ? fmt(result.monthlySIP) + '/mo' 
                      : fmt(result.invested)}
                  </span>
                </div>
                <div className="calc-result highlight">
                  <span className="calc-result-label">
                    {mode === 'fd' ? 'Maturity' : 'Future Value'}
                  </span>
                  <span className="calc-result-value">{fmt(result.futureValue)}</span>
                </div>
                <div className="calc-result">
                  <span className="calc-result-label">
                    {mode === 'fd' ? 'Interest' : 'Returns'}
                  </span>
                  <span className="calc-result-value gain">{fmt(result.returns)}</span>
                </div>
              </>
            ) : (
              <>
                <div className="calc-result highlight">
                  <span className="calc-result-label">Cover Needed</span>
                  <span className="calc-result-value">{fmt(result.coverNeeded)}</span>
                </div>
                <div className="calc-result">
                  <span className="calc-result-label">Annual Premium</span>
                  <span className="calc-result-value">{fmt(result.annualPremium)}</span>
                </div>
                <div className="calc-result">
                  <span className="calc-result-label">Monthly</span>
                  <span className="calc-result-value">{fmt(result.monthlyPremium)}</span>
                </div>
              </>
            )}
          </div>

          {/* CTA */}
          <div className="calc-cta">
            <button type="button" onClick={() => router.push('/tools')}>
              📥 All Calculators
            </button>
            <button type="button" onClick={() => router.push('/contact')} className="calc-cta-primary">
              📞 Talk to Expert
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        .calc-wrap {
          margin-top: 16px;
          border-radius: 14px;
          overflow: hidden;
          background: rgba(8, 12, 20, 0.65);
          border: 1px solid rgba(100, 180, 255, 0.10);
          backdrop-filter: blur(12px);
        }

        .calc-toggle {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 16px;
          background: transparent;
          border: none;
          cursor: pointer;
          transition: background 0.2s;
        }

        .calc-toggle:hover {
          background: rgba(100, 180, 255, 0.06);
        }

        .calc-toggle-icon { 
          font-size: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .calc-toggle-icon svg {
          filter: drop-shadow(0 0 4px rgba(140, 200, 255, 0.4));
          animation: calcIconPulse 3s ease-in-out infinite;
        }
        
        @keyframes calcIconPulse {
          0%, 100% { 
            filter: drop-shadow(0 0 4px rgba(140, 200, 255, 0.4));
            transform: scale(1);
          }
          50% { 
            filter: drop-shadow(0 0 12px rgba(140, 220, 255, 0.8));
            transform: scale(1.08);
          }
        }

        .calc-toggle-text {
          flex: 1;
          text-align: left;
          color: rgba(200, 220, 255, 0.85);
          font-size: 13px;
          font-weight: 600;
        }

        .calc-toggle-badge {
          padding: 3px 8px;
          background: rgba(100, 180, 255, 0.12);
          border: 1px solid rgba(100, 180, 255, 0.20);
          border-radius: 6px;
          color: rgba(140, 200, 255, 0.90);
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        .calc-toggle-arrow {
          color: rgba(150, 180, 220, 0.5);
          font-size: 10px;
          transition: transform 0.25s ease;
        }

        .calc-toggle-arrow.open {
          transform: rotate(180deg);
        }

        .calc-content {
          padding: 0 16px 16px;
          animation: fadeSlide 0.25s ease-out;
        }

        @keyframes fadeSlide {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Scrollable tabs container */
        .calc-tabs-scroll {
          overflow-x: auto;
          overflow-y: hidden;
          margin: 0 -16px;
          padding: 0 16px;
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .calc-tabs-scroll::-webkit-scrollbar {
          display: none;
        }

        .calc-tabs {
          display: flex;
          gap: 6px;
          margin-bottom: 10px;
          min-width: max-content;
          padding-bottom: 4px;
        }

        .calc-tab {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          padding: 10px 14px;
          min-width: 58px;
          background: rgba(100, 180, 255, 0.04);
          border: 1px solid rgba(100, 180, 255, 0.08);
          border-radius: 10px;
          color: rgba(150, 180, 220, 0.55);
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .calc-tab-icon { font-size: 16px; }
        .calc-tab-label { font-size: 10px; font-weight: 600; }

        .calc-tab:hover {
          background: rgba(100, 180, 255, 0.10);
          color: rgba(180, 210, 255, 0.80);
          border-color: rgba(100, 180, 255, 0.15);
        }

        .calc-tab.active {
          background: rgba(100, 180, 255, 0.15);
          border-color: rgba(100, 180, 255, 0.30);
          color: rgba(140, 210, 255, 0.95);
          box-shadow: 0 0 20px rgba(100, 180, 255, 0.12);
        }

        .calc-mode-desc {
          text-align: center;
          color: rgba(150, 180, 220, 0.50);
          font-size: 11px;
          margin-bottom: 14px;
          padding: 0 10px;
        }

        .calc-inputs {
          display: flex;
          gap: 10px;
          margin-bottom: 14px;
          flex-wrap: wrap;
        }

        .calc-field {
          flex: 1;
          min-width: 70px;
        }

        .calc-field label {
          display: block;
          font-size: 10px;
          color: rgba(150, 180, 220, 0.55);
          margin-bottom: 5px;
          font-weight: 500;
        }

        .calc-input-wrap {
          display: flex;
          align-items: center;
          background: rgba(10, 18, 30, 0.75);
          border: 1px solid rgba(100, 180, 255, 0.12);
          border-radius: 8px;
          overflow: hidden;
          transition: border-color 0.2s;
        }

        .calc-input-wrap:focus-within {
          border-color: rgba(100, 180, 255, 0.35);
          box-shadow: 0 0 12px rgba(100, 180, 255, 0.10);
        }

        .calc-input-prefix,
        .calc-input-suffix {
          padding: 0 8px;
          color: rgba(150, 180, 220, 0.45);
          font-size: 12px;
          font-weight: 500;
        }

        .calc-field input {
          flex: 1;
          width: 100%;
          padding: 10px 8px;
          background: transparent;
          border: none;
          color: rgba(230, 245, 255, 0.95);
          font-size: 15px;
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

        .calc-results {
          display: flex;
          gap: 8px;
          margin-bottom: 14px;
          flex-wrap: wrap;
        }

        .calc-result {
          flex: 1;
          min-width: 80px;
          padding: 12px 10px;
          background: rgba(15, 22, 38, 0.55);
          border: 1px solid rgba(100, 180, 255, 0.06);
          border-radius: 10px;
          text-align: center;
        }

        .calc-result.highlight {
          background: linear-gradient(180deg, rgba(100, 180, 255, 0.12) 0%, rgba(100, 180, 255, 0.06) 100%);
          border-color: rgba(100, 180, 255, 0.18);
        }

        .calc-result-label {
          display: block;
          font-size: 9px;
          color: rgba(150, 180, 220, 0.55);
          margin-bottom: 5px;
          text-transform: uppercase;
          letter-spacing: 0.06em;
        }

        .calc-result-value {
          font-size: 14px;
          font-weight: 700;
          color: rgba(230, 245, 255, 0.95);
        }

        .calc-result-value.gain {
          color: rgba(100, 220, 160, 0.95);
        }

        .calc-cta {
          display: flex;
          gap: 10px;
          justify-content: center;
        }

        .calc-cta button {
          padding: 10px 16px;
          background: rgba(100, 180, 255, 0.08);
          border: 1px solid rgba(100, 180, 255, 0.15);
          border-radius: 8px;
          color: rgba(140, 200, 255, 0.85);
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .calc-cta button:hover {
          background: rgba(100, 180, 255, 0.15);
          border-color: rgba(100, 180, 255, 0.25);
        }

        .calc-cta-primary {
          background: linear-gradient(180deg, rgba(100, 180, 255, 0.18) 0%, rgba(100, 180, 255, 0.08) 100%) !important;
          border-color: rgba(100, 180, 255, 0.30) !important;
          color: rgba(200, 230, 255, 0.95) !important;
        }

        .calc-cta-primary:hover {
          background: linear-gradient(180deg, rgba(100, 180, 255, 0.25) 0%, rgba(100, 180, 255, 0.12) 100%) !important;
          box-shadow: 0 0 20px rgba(100, 180, 255, 0.15);
        }

        @media (max-width: 500px) {
          .calc-inputs { gap: 8px; }
          .calc-field { min-width: calc(50% - 4px); }
          .calc-results { gap: 6px; }
          .calc-result { min-width: calc(33% - 4px); padding: 10px 6px; }
          .calc-result-value { font-size: 12px; }
          .calc-cta { flex-wrap: wrap; }
          .calc-cta button { flex: 1; min-width: 120px; }
        }
      `}</style>
    </div>
  );
}
