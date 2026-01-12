'use client';

import { useEffect } from 'react';

const LASER_ASSET_VERSION = 'seamless-xfade-fade-2026-01-11';
const VIDEO_SRC = `/videos/laser-beam.mp4?v=${LASER_ASSET_VERSION}`; // LOCKED

export default function LiveIntelligenceHeroPage() {
  // Hide the mobile dock on this page only (does not affect scroll)
  useEffect(() => {
    document.body.setAttribute('data-laser-active', 'true');
    return () => document.body.removeAttribute('data-laser-active');
  }, []);

  return (
    <main style={{ width: '100%', margin: 0, padding: 0 }}>
      {/* LASER (LOCKED): fullscreen, no filters, no overlays, no masking */}
      <section
        aria-label="Live Intelligence Laser"
        style={{
          position: 'relative',
          width: '100vw',
          height: '100vh',
          overflow: 'hidden',
          background: '#090A0C',
        }}
      >
        <video
          src={VIDEO_SRC}
          autoPlay
          muted
          playsInline
          loop
          preload="auto"
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center bottom',
            pointerEvents: 'none',
            filter: 'none',
            transform: 'none',
            opacity: 1,
          }}
        />
      </section>

      {/* PANEL: starts immediately after laser (no gap). Transition layer lives INSIDE panel only. */}
      <section
        aria-label="Live Intelligence Panel"
        style={{
          position: 'relative',
          width: '100vw',
          margin: 0,
          padding: 0,
          background: '#090A0C',
        }}
      >
        {/* Soft connection at TOP of panel only (does not touch the laser) */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: '220px',
            pointerEvents: 'none',
            background:
              'linear-gradient(180deg, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.00) 78%),' +
              'radial-gradient(76% 175% at 50% 0%, rgba(145,190,255,0.22) 0%, rgba(145,190,255,0.00) 66%),' +
              'radial-gradient(36% 110% at 50% 0%, rgba(220,238,255,0.16) 0%, rgba(220,238,255,0.00) 58%),' +
              'linear-gradient(180deg, rgba(105,150,255,0.14) 0%, rgba(105,150,255,0.00) 72%),' +
              'repeating-linear-gradient(90deg, rgba(255,255,255,0.020) 0px, rgba(255,255,255,0.020) 1px, rgba(0,0,0,0.00) 2px, rgba(0,0,0,0.00) 7px),' +
              'repeating-linear-gradient(0deg, rgba(255,255,255,0.010) 0px, rgba(255,255,255,0.010) 1px, rgba(0,0,0,0.00) 2px, rgba(0,0,0,0.00) 9px)',
            opacity: 0.95,
          }}
        />

        {/* Thin energy seam line (inside the panel) */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: '1px',
            pointerEvents: 'none',
            background: 'linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(170,198,255,0.65) 50%, rgba(0,0,0,0) 100%)',
            boxShadow: '0 0 18px rgba(140,190,255,0.30), 0 0 42px rgba(120,160,255,0.14)',
            opacity: 0.7,
          }}
        />

        {/* Intake glow (panel-only): makes the boundary feel connected without touching the laser */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: 0,
            height: '86px',
            pointerEvents: 'none',
            background:
              'radial-gradient(62% 140% at 50% 0%, rgba(235,250,255,0.30) 0%, rgba(235,250,255,0.00) 62%),' +
              'linear-gradient(180deg, rgba(120,175,255,0.22) 0%, rgba(120,175,255,0.00) 78%),' +
              'repeating-linear-gradient(90deg, rgba(255,255,255,0.018) 0px, rgba(255,255,255,0.018) 1px, rgba(0,0,0,0.00) 2px, rgba(0,0,0,0.00) 10px)',
            opacity: 0.95,
          }}
        />

        {/* Energy intake (panel-only): feels like the laser continues into the panel */}
        <div aria-hidden="true" className="li-panel-intake" />

        <style>{`
          .li-panel-intake {
            position: absolute;
            left: 0;
            right: 0;
            top: 0;
            height: 260px;
            pointer-events: none;
            opacity: 0.80;
            mix-blend-mode: screen;
            background:
              radial-gradient(70% 170% at 50% 0%, rgba(245, 250, 255, 0.20) 0%, rgba(245, 250, 255, 0.00) 55%),
              radial-gradient(28% 120% at 50% 0%, rgba(170, 198, 255, 0.18) 0%, rgba(170, 198, 255, 0.00) 62%),
              linear-gradient(180deg, rgba(140, 190, 255, 0.10) 0%, rgba(140, 190, 255, 0.00) 70%),
              repeating-linear-gradient(
                90deg,
                rgba(245, 250, 255, 0.00) 0px,
                rgba(245, 250, 255, 0.00) 10px,
                rgba(245, 250, 255, 0.020) 12px,
                rgba(245, 250, 255, 0.00) 14px,
                rgba(245, 250, 255, 0.00) 24px
              );
            background-size: 100% 100%, 100% 100%, 100% 100%, 240px 100%;
            animation: liIntakeScan 2.2s linear infinite;
          }

          @keyframes liIntakeScan {
            0% { background-position: 0 0, 0 0, 0 0, 0 0; }
            100% { background-position: 0 0, 0 0, 0 0, 240px 0; }
          }

          @media (prefers-reduced-motion: reduce) {
            .li-panel-intake { animation: none; }
          }
        `}</style>

        <div
          style={{
            position: 'relative',
            padding: '14px 20px 96px',
            maxWidth: '1240px',
            margin: '0 auto',
          }}
        >
          {/* Dashboard header */}
          <div
            style={{
              justifyContent: 'space-between',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <h2 style={{ margin: 0, color: 'rgba(235,242,255,0.94)', fontSize: '30px', letterSpacing: '-0.02em' }}>
                Live Intelligence
              </h2>
              <p style={{ margin: '10px 0 0', color: 'rgba(220,230,255,0.70)', maxWidth: '72ch', lineHeight: 1.55 }}>
                Your financial command center — portfolio health, opportunities, and real-time signals.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                type="button"
                style={{
                  appearance: 'none',
                  border: '1px solid rgba(255,255,255,0.14)',
                  background: 'rgba(10,10,12,0.70)',
                  color: 'rgba(235,242,255,0.88)',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                Export
              </button>
              <button
                type="button"
                style={{
                  appearance: 'none',
                  border: '1px solid rgba(170,198,255,0.55)',
                  background: 'linear-gradient(180deg, rgba(130,160,255,0.22) 0%, rgba(10,10,12,0.65) 100%)',
                  color: 'rgba(245,248,255,0.94)',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  fontSize: '13px',
                }}
              >
                Add Goal
              </button>
            </div>
          </div>

          {/* KPI row */}
          <div
            style={{
              marginTop: '22px',
              display: 'grid',
              gridTemplateColumns: 'repeat(12, 1fr)',
              gap: '14px',
            }}
          >
            {[{
              label: 'Total Invested',
              value: '₹ 24.8L',
              hint: 'Across MF + PMS + FD',
            }, {
              label: 'Current Value',
              value: '₹ 28.3L',
              hint: '+₹ 3.5L unrealized',
            }, {
              label: 'XIRR',
              value: '14.2%',
              hint: 'Last 12 months',
            }, {
              label: 'Risk Score',
              value: 'Moderate',
              hint: 'Aligned to goals',
            }].map((card) => (
              <div
                key={card.label}
                style={{
                  gridColumn: 'span 12',
                  borderRadius: '18px',
                  border: '1px solid rgba(255,255,255,0.10)',
                  background: 'rgba(10,10,12,0.86)',
                  boxShadow: '0 24px 70px rgba(0,0,0,0.55)',
                  padding: '16px 16px',
                }}
              >
                <div style={{ color: 'rgba(220,230,255,0.64)', fontSize: '12px', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                  {card.label}
                </div>
                <div style={{ marginTop: '8px', color: 'rgba(245,248,255,0.94)', fontSize: '22px', letterSpacing: '-0.02em' }}>
                  {card.value}
                </div>
                <div style={{ marginTop: '6px', color: 'rgba(220,230,255,0.62)', fontSize: '13px', lineHeight: 1.4 }}>
                  {card.hint}
                </div>
              </div>
            ))}
          </div>

          {/* Main dashboard grid */}
          <div
            style={{
              marginTop: '14px',
              display: 'grid',
              gridTemplateColumns: 'repeat(12, 1fr)',
              gap: '14px',
            }}
          >
            <div
              style={{
                gridColumn: 'span 12',
                borderRadius: '18px',
                border: '1px solid rgba(255,255,255,0.10)',
                background: 'rgba(10,10,12,0.86)',
                boxShadow: '0 24px 70px rgba(0,0,0,0.55)',
                padding: '16px 16px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                  <div style={{ color: 'rgba(235,242,255,0.86)', fontSize: '15px', letterSpacing: '-0.01em' }}>
                    Allocation Overview
                  </div>
                  <div style={{ marginTop: '6px', color: 'rgba(220,230,255,0.62)', fontSize: '13px' }}>
                    Diversification snapshot by asset class
                  </div>
                </div>
                <div style={{ color: 'rgba(220,230,255,0.62)', fontSize: '12px' }}>Updated just now</div>
              </div>

              <div
                aria-hidden="true"
                style={{
                  marginTop: '14px',
                  height: '220px',
                  borderRadius: '14px',
                  border: '1px solid rgba(170,198,255,0.18)',
                  background:
                    'radial-gradient(55% 85% at 50% 0%, rgba(160,190,255,0.20) 0%, rgba(10,10,12,0.0) 65%),' +
                    'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.00) 50%),' +
                    'repeating-linear-gradient(90deg, rgba(255,255,255,0.014) 0px, rgba(255,255,255,0.014) 1px, rgba(0,0,0,0.00) 2px, rgba(0,0,0,0.00) 8px)',
                  overflow: 'hidden',
                }}
              />

              <div style={{ marginTop: '12px', display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '10px' }}>
                {[
                  { k: 'Equity', v: '58%' },
                  { k: 'Debt', v: '24%' },
                  { k: 'Gold', v: '8%' },
                  { k: 'Cash', v: '10%' },
                ].map((item) => (
                  <div key={item.k} style={{ gridColumn: 'span 6', padding: '10px 12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(0,0,0,0.22)' }}>
                    <div style={{ color: 'rgba(220,230,255,0.62)', fontSize: '12px' }}>{item.k}</div>
                    <div style={{ marginTop: '4px', color: 'rgba(245,248,255,0.92)', fontSize: '16px' }}>{item.v}</div>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                gridColumn: 'span 12',
                borderRadius: '18px',
                border: '1px solid rgba(255,255,255,0.10)',
                background: 'rgba(10,10,12,0.86)',
                boxShadow: '0 24px 70px rgba(0,0,0,0.55)',
                padding: '16px 16px',
              }}
            >
              <div style={{ color: 'rgba(235,242,255,0.86)', fontSize: '15px', letterSpacing: '-0.01em' }}>
                Live Signals
              </div>
              <div style={{ marginTop: '6px', color: 'rgba(220,230,255,0.62)', fontSize: '13px' }}>
                Market + portfolio alerts (examples)
              </div>

              <div style={{ marginTop: '14px', display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '10px' }}>
                {[
                  { t: 'Rebalance opportunity', d: 'Equity drift +4.8% vs target', s: 'Medium' },
                  { t: 'SIP consistency', d: '3 SIPs processed successfully', s: 'Good' },
                  { t: 'Tax harvesting', d: 'Potential LTCG optimization available', s: 'High' },
                  { t: 'Cash buffer', d: '3.2 months expenses covered', s: 'Good' },
                ].map((it) => (
                  <div
                    key={it.t}
                    style={{
                      gridColumn: 'span 12',
                      padding: '12px 12px',
                      borderRadius: '14px',
                      border: '1px solid rgba(170,198,255,0.16)',
                      background: 'linear-gradient(180deg, rgba(130,160,255,0.10) 0%, rgba(0,0,0,0.22) 100%)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'baseline', flexWrap: 'wrap' }}>
                      <div style={{ color: 'rgba(245,248,255,0.92)', fontSize: '14px' }}>{it.t}</div>
                      <div style={{ color: 'rgba(220,230,255,0.60)', fontSize: '12px' }}>{it.s}</div>
                    </div>
                    <div style={{ marginTop: '6px', color: 'rgba(220,230,255,0.70)', fontSize: '13px', lineHeight: 1.45 }}>{it.d}</div>
                  </div>
                ))}
              </div>
            </div>

            <div
              style={{
                gridColumn: 'span 12',
                borderRadius: '18px',
                border: '1px solid rgba(255,255,255,0.10)',
                background: 'rgba(10,10,12,0.86)',
                boxShadow: '0 24px 70px rgba(0,0,0,0.55)',
                padding: '16px 16px',
              }}
            >
              <div style={{ color: 'rgba(235,242,255,0.86)', fontSize: '15px', letterSpacing: '-0.01em' }}>
                Holdings (sample)
              </div>
              <div style={{ marginTop: '6px', color: 'rgba(220,230,255,0.62)', fontSize: '13px' }}>
                Scrollable table-like list
              </div>

              <div style={{ marginTop: '12px', borderRadius: '14px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '2.2fr 1fr 1fr 1fr', gap: '10px', padding: '10px 12px', background: 'rgba(255,255,255,0.04)' }}>
                  {['Instrument', 'Value', '1D', 'P/L'].map((h) => (
                    <div key={h} style={{ color: 'rgba(220,230,255,0.68)', fontSize: '12px', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                      {h}
                    </div>
                  ))}
                </div>

                {[
                  { n: 'Nifty 50 Index Fund', v: '₹ 6.4L', d: '+0.42%', p: '+₹ 1.1L' },
                  { n: 'Flexi Cap Fund', v: '₹ 4.9L', d: '+0.18%', p: '+₹ 0.8L' },
                  { n: 'Corporate Bond Fund', v: '₹ 3.1L', d: '+0.05%', p: '+₹ 0.2L' },
                  { n: 'SGB / Gold', v: '₹ 2.2L', d: '-0.12%', p: '+₹ 0.3L' },
                  { n: 'Fixed Deposits', v: '₹ 3.7L', d: '—', p: '+₹ 0.2L' },
                  { n: 'Cash / Liquid', v: '₹ 1.8L', d: '—', p: '—' },
                ].map((row, idx) => (
                  <div
                    key={row.n}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2.2fr 1fr 1fr 1fr',
                      gap: '10px',
                      padding: '12px 12px',
                      background: idx % 2 === 0 ? 'rgba(0,0,0,0.22)' : 'rgba(0,0,0,0.10)',
                      borderTop: idx === 0 ? 'none' : '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div style={{ color: 'rgba(245,248,255,0.90)', fontSize: '13px', lineHeight: 1.35 }}>{row.n}</div>
                    <div style={{ color: 'rgba(220,230,255,0.80)', fontSize: '13px' }}>{row.v}</div>
                    <div style={{ color: 'rgba(220,230,255,0.70)', fontSize: '13px' }}>{row.d}</div>
                    <div style={{ color: 'rgba(220,230,255,0.80)', fontSize: '13px' }}>{row.p}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
