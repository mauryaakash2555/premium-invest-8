'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import LazyImage from '@/components/user/LazyImage';

const ORDERED_KEYS = [
  'portfolio-management',
  'mutual-funds',
  'sip',
  'insurance',
  'trading-services',
  'fixed-deposits',
];

function LuxuryServiceIcon({ serviceKey, title = '' }) {
  const common = {
    width: 24,
    height: 24,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
  };

  const stroke = '#C9A24D';
  const strokeWidth = 1.25;
  const lineProps = {
    stroke,
    strokeWidth,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };

  switch (serviceKey) {
    // Vault icon (PMS)
    case 'portfolio-management':
      return (
        <svg {...common} role="img" aria-label={title || 'Portfolio Management'}>
          <rect x="4" y="6" width="16" height="14" rx="3" {...lineProps} />
          <path d="M7.5 6V5.2c0-1.2 1-2.2 2.2-2.2h4.6c1.2 0 2.2 1 2.2 2.2V6" {...lineProps} />
          <circle cx="12" cy="13" r="2.2" {...lineProps} />
          <path d="M12 10.8v4.4" {...lineProps} />
        </svg>
      );

    // Chart icon (Mutual Funds)
    case 'mutual-funds':
      return (
        <svg {...common} role="img" aria-label={title || 'Mutual Funds'}>
          <path d="M4 19V5" {...lineProps} />
          <path d="M4 19h16" {...lineProps} />
          <path d="M7 15l3-3 3 2 4-5" {...lineProps} />
          <path d="M17 9h2v2" {...lineProps} />
        </svg>
      );

    // Repeat / SIP icon
    case 'sip':
      return (
        <svg {...common} role="img" aria-label={title || 'SIP'}>
          <path d="M17 7h-8a4 4 0 0 0 0 8h8" {...lineProps} />
          <path d="M7 17h8a4 4 0 0 0 0-8H7" {...lineProps} />
          <path d="M17 7l-2-2" {...lineProps} />
          <path d="M17 7l-2 2" {...lineProps} />
          <path d="M7 17l2-2" {...lineProps} />
          <path d="M7 17l2 2" {...lineProps} />
        </svg>
      );

    // Shield check (Insurance)
    case 'insurance':
      return (
        <svg {...common} role="img" aria-label={title || 'Insurance'}>
          <path d="M12 3l7 4v6c0 4.5-3.2 7.6-7 8.8C8.2 20.6 5 17.5 5 13V7l7-4z" {...lineProps} />
          <path d="M9.2 12.2l2 2L15.8 9.6" {...lineProps} />
        </svg>
      );

    // Trading / trend icon
    case 'trading-services':
      return (
        <svg {...common} role="img" aria-label={title || 'Trading Services'}>
          <path d="M4 18V6" {...lineProps} />
          <path d="M4 18h16" {...lineProps} />
          <path d="M7 14l3-3 2 2 5-6" {...lineProps} />
          <path d="M17 7h2v2" {...lineProps} />
        </svg>
      );

    // Bank (Fixed Deposits)
    case 'fixed-deposits':
      return (
        <svg {...common} role="img" aria-label={title || 'Fixed Deposits'}>
          <path d="M4 9l8-4 8 4" {...lineProps} />
          <path d="M6 9v9" {...lineProps} />
          <path d="M10 9v9" {...lineProps} />
          <path d="M14 9v9" {...lineProps} />
          <path d="M18 9v9" {...lineProps} />
          <path d="M5 18h14" {...lineProps} />
        </svg>
      );

    default:
      return null;
  }
}

function orderServices(services) {
  const rank = new Map(ORDERED_KEYS.map((key, index) => [key, index]));
  return [...(services ?? [])].sort((a, b) => {
    const ra = rank.has(a?.key) ? rank.get(a.key) : 999;
    const rb = rank.has(b?.key) ? rank.get(b.key) : 999;
    if (ra !== rb) return ra - rb;
    return String(a?.title ?? '').localeCompare(String(b?.title ?? ''));
  });
}

function clamp01(value) {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(1, value));
}

export default function ServicesShowcase({ services }) {
  const ordered = useMemo(() => orderServices(services), [services]);
  const [activeKey, setActiveKey] = useState(() => ordered?.[0]?.key);
  const itemRefs = useRef(new Map());

  useEffect(() => {
    if (!ordered?.length) return;

    // Keep state valid if data changes
    if (!activeKey || !ordered.some((s) => s.key === activeKey)) {
      setActiveKey(ordered[0].key);
    }
  }, [ordered, activeKey]);

  useEffect(() => {
    if (!ordered?.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Choose the most visible panel
        let best = null;
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const key = entry.target.getAttribute('data-svc-key');
          if (!key) continue;
          const score = entry.intersectionRatio;
          if (!best || score > best.score) best = { key, score };
        }
        if (best?.key) setActiveKey(best.key);
      },
      {
        root: null,
        threshold: [0.15, 0.33, 0.5, 0.66, 0.8],
        // Pull the active state a little earlier for nicer nav feedback
        rootMargin: '-15% 0px -55% 0px',
      }
    );

    for (const service of ordered) {
      const el = itemRefs.current.get(service.key);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [ordered]);

  const scrollToKey = useCallback((key) => {
    const el = itemRefs.current.get(key);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const getNextKey = useCallback(
    (key) => {
      const index = ordered.findIndex((s) => s.key === key);
      if (index < 0) return ordered?.[0]?.key;
      return ordered[(index + 1) % ordered.length].key;
    },
    [ordered]
  );

  const onPanelPointerMove = useCallback((event) => {
    // Subtle, premium tilt effect (desktop only). Runs without layout thrash.
    const panel = event.currentTarget;
    if (!panel) return;

    const rect = panel.getBoundingClientRect();
    const x = clamp01((event.clientX - rect.left) / rect.width);
    const y = clamp01((event.clientY - rect.top) / rect.height);

    panel.style.setProperty('--mx', String(x));
    panel.style.setProperty('--my', String(y));
  }, []);

  const onPanelPointerLeave = useCallback((event) => {
    const panel = event.currentTarget;
    if (!panel) return;
    panel.style.removeProperty('--mx');
    panel.style.removeProperty('--my');
  }, []);

  if (!ordered?.length) return null;

  return (
    <section className="svc-showcase" aria-label="Services">
      <div className="svc-showcase__bg" aria-hidden="true" />

      <div className="section-container">
        <header className="svc-showcase__header">
          <div className="svc-showcase__badge">A new way to explore</div>
          <h2 className="svc-showcase__title">Choose a service. Feel the difference.</h2>
          <p className="svc-showcase__subtitle">
            A portfolio-first operating rhythm — then Mutual Funds and SIP for disciplined execution.
          </p>
        </header>

        <div className="svc-showcase__grid">
          <nav className="svc-rail" aria-label="Services navigation">
            <div className="svc-rail__label">SERVICES</div>

            {ordered.map((service, index) => {
              const isActive = service.key === activeKey;
              return (
                <button
                  key={service.key}
                  type="button"
                  className={isActive ? 'svc-rail__item is-active' : 'svc-rail__item'}
                  onClick={() => scrollToKey(service.key)}
                >
                  <span className="svc-rail__index">{String(index + 1).padStart(2, '0')}</span>
                  <span className="svc-rail__name">{service.title}</span>
                  <span className="svc-rail__dot" aria-hidden="true" />
                </button>
              );
            })}

            <div className="svc-rail__hint">Scroll to discover · Click to jump</div>
          </nav>

          <div className="svc-panels">
            {ordered.map((service, index) => (
              <article
                key={service.key}
                ref={(el) => {
                  if (!el) return;
                  itemRefs.current.set(service.key, el);
                }}
                data-svc-key={service.key}
                className={service.key === activeKey ? 'svc-panel is-active' : 'svc-panel'}
                onPointerMove={onPanelPointerMove}
                onPointerLeave={onPanelPointerLeave}
              >
                <div className="svc-panel__frame">
                  <div className="svc-panel__media" aria-hidden="true">
                    <LazyImage
                      src={service.image}
                      alt={service.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: service.imagePresentation?.objectPosition ?? '50% 50%',
                        filter: 'saturate(1.08) contrast(1.02)',
                      }}
                    />
                    <div className="svc-panel__mediaOverlay" />
                  </div>

                  <div className="svc-panel__content">
                    <div className="svc-panel__meta">
                      <div className="svc-panel__kicker">
                        <span className="svc-panel__kickerIndex">{String(index + 1).padStart(2, '0')}</span>
                        <span className="svc-panel__kickerDivider" aria-hidden="true" />
                        <span className="svc-panel__kickerText">Premium execution + documentation</span>
                      </div>

                      <div className="svc-panel__icon" aria-hidden="true">
                        <LuxuryServiceIcon serviceKey={service.key} title={service.title} />
                      </div>
                    </div>

                    <h3 className="svc-panel__title">{service.title}</h3>
                    <p className="svc-panel__desc">{service.description}</p>

                    <div className="svc-panel__chips" aria-label="Key features">
                      {(service.features ?? []).slice(0, 5).map((feature) => (
                        <span key={feature} className="svc-chip">
                          {feature}
                        </span>
                      ))}
                    </div>

                    <div className="svc-panel__actions">
                      {service.link ? (
                        <Link className="svc-btn svc-btn--primary" href={service.link}>
                          Explore <ArrowRight size={16} />
                        </Link>
                      ) : null}

                      <button
                        type="button"
                        className="svc-btn svc-btn--ghost"
                        onClick={() => scrollToKey(getNextKey(service.key))}
                      >
                        Next <ArrowRight size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        /* ===== Services Showcase (scoped to Services page) ===== */
        .svc-showcase {
          --black-main: #0B0B0C;
          --black-card: #0E0E10;
          --white-main: #EDEDED;
          --white-muted: #B9B9B9;
          --gold-accent: #C9A24D;

          position: relative;
          padding: clamp(56px, 8vw, 88px) 0;
          overflow: clip;
          background: var(--black-main);
          color: var(--white-main);
          font-family: 'Inter', system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
        }

        .svc-showcase__bg {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 0;
          background:
            radial-gradient(1000px 520px at 18% 0%, rgba(201, 162, 77, 0.10), transparent 60%),
            radial-gradient(900px 520px at 88% 10%, rgba(255,255,255,0.05), transparent 65%),
            radial-gradient(1100px 680px at 50% 100%, rgba(0,0,0,0.75), transparent 62%);
          opacity: 1;
        }

        .svc-showcase > .section-container {
          position: relative;
          z-index: 1;
        }

        .svc-showcase__header {
          text-align: center;
          margin-bottom: clamp(28px, 5vw, 48px);
          animation: svcFadeUp 700ms ease both;
        }

        .svc-showcase__badge {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 999px;
          border: 1px solid rgba(192,160,98,0.22);
          background: rgba(255,255,255,0.03);
          color: var(--white-main);
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-size: 12px;
          font-weight: 650;
        }

        .svc-showcase__title {
          margin: 16px 0 10px;
          font-size: clamp(28px, 4.8vw, 52px);
          line-height: 1.08;
          font-family: "Playfair Display", serif;
          font-weight: 600;
          color: var(--white-main);
          text-shadow: 0 10px 30px rgba(0,0,0,0.35);
        }

        .svc-showcase__subtitle {
          margin: 0 auto;
          max-width: 860px;
          font-size: clamp(15px, 2.4vw, 18px);
          line-height: 1.75;
          color: var(--white-muted);
        }

        .svc-showcase__grid {
          display: grid;
          grid-template-columns: 320px minmax(0, 1fr);
          gap: clamp(16px, 3vw, 28px);
          align-items: start;
        }

        .svc-rail {
          position: sticky;
          top: 110px;
          align-self: start;
          padding: 18px;
          border-radius: 18px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.02);
          box-shadow: 0 20px 60px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.04);
          backdrop-filter: blur(10px);
        }

        .svc-rail__label {
          font-size: 12px;
          letter-spacing: 0.24em;
          color: rgba(201,162,77,0.92);
          margin-bottom: 14px;
        }

        .svc-rail__item {
          width: 100%;
          display: grid;
          grid-template-columns: 44px 1fr 10px;
          gap: 10px;
          align-items: center;
          padding: 12px 10px;
          border-radius: 14px;
          border: 1px solid transparent;
          background: transparent;
          color: rgba(237,237,237,0.88);
          cursor: pointer;
          text-align: left;
          transition: transform 200ms ease, background 200ms ease, border-color 200ms ease;
        }

        .svc-rail__item:hover {
          transform: translateY(-1px);
          background: rgba(255,255,255,0.03);
          border-color: rgba(255,255,255,0.10);
        }

        .svc-rail__item.is-active {
          background: rgba(201,162,77,0.08);
          border-color: rgba(201,162,77,0.26);
          color: rgba(255,255,255,0.96);
        }

        .svc-rail__index {
          font-variant-numeric: tabular-nums;
          color: rgba(201,162,77,0.95);
          font-weight: 700;
          letter-spacing: 0.08em;
        }

        .svc-rail__name {
          font-size: 13px;
          line-height: 1.2;
          font-weight: 650;
        }

        .svc-rail__dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(255,255,255,0.18);
        }

        .svc-rail__item.is-active .svc-rail__dot {
          background: rgba(201,162,77,0.95);
          box-shadow: 0 0 0 6px rgba(201,162,77,0.12);
        }

        .svc-rail__hint {
          margin-top: 14px;
          font-size: 12px;
          line-height: 1.5;
          color: rgba(180,180,180,0.9);
        }

        .svc-panels {
          display: flex;
          flex-direction: column;
          gap: clamp(16px, 3vw, 28px);
        }

        .svc-panel {
          --mx: 0.5;
          --my: 0.5;
          position: relative;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.08);
          background: var(--black-card);
          box-shadow: 0 20px 40px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.04);
          overflow: hidden;
          transform: translateZ(0);
        }

        .svc-panel::before {
          content: '';
          position: absolute;
          inset: -2px;
          background:
            radial-gradient(520px 240px at calc(var(--mx) * 100%) calc(var(--my) * 100%), rgba(201,162,77,0.14), transparent 55%),
            linear-gradient(135deg, rgba(255,255,255,0.035), transparent 40%);
          opacity: 1;
          pointer-events: none;
        }

        .svc-panel.is-active {
          border-color: rgba(201,162,77,0.22);
        }

        .svc-panel__frame {
          display: grid;
          grid-template-columns: minmax(240px, 0.95fr) minmax(0, 1.05fr);
          min-height: clamp(360px, 42vw, 520px);
        }

        .svc-panel__media {
          position: relative;
        }

        .svc-panel__mediaOverlay {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(90deg, rgba(0,0,0,0.20) 0%, rgba(0,0,0,0.65) 80%),
            linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.52) 100%);
        }

        .svc-panel__content {
          position: relative;
          padding: clamp(18px, 3.4vw, 42px);
          display: flex;
          flex-direction: column;
          justify-content: center;
          gap: 16px;
        }

        .svc-panel__meta {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 14px;
        }

        .svc-panel__kicker {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(0,0,0,0.20);
          color: rgba(237,237,237,0.92);
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .svc-panel__kickerIndex {
          color: rgba(201,162,77,0.95);
          font-weight: 800;
          font-variant-numeric: tabular-nums;
        }

        .svc-panel__kickerDivider {
          width: 1px;
          height: 14px;
          background: rgba(255,255,255,0.12);
        }



        .svc-panel__icon {
          width: 44px;
          height: 44px;
          display: grid;
          place-items: center;
          border-radius: 14px;
          border: 1px solid rgba(201,162,77,0.24);
          background: rgba(0,0,0,0.18);
          box-shadow: inset 0 1px 0 rgba(255,255,255,0.04);
        }

        .svc-panel__title {
          margin: 0;
          font-size: clamp(22px, 3.4vw, 38px);
          line-height: 1.15;
          font-family: "Playfair Display", serif;
          color: var(--white-main);
        }

        .svc-panel__desc {
          margin: 0;
          font-size: clamp(14px, 2.3vw, 17px);
          line-height: 1.8;
          color: var(--white-muted);
        }

        .svc-panel__chips {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        .svc-chip {
          padding: 10px 12px;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.02);
          color: rgba(237,237,237,0.92);
          font-size: 13px;
          line-height: 1;
        }

        .svc-panel__actions {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-top: 6px;
        }

        .svc-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          padding: 14px 24px;
          border-radius: 50px;
          font-weight: 600;
          font-size: 13px;
          text-decoration: none;
          border: none;
          background: linear-gradient(
            135deg,
            color-mix(in oklab, var(--color-matte-gold) 85%, white 15%) 0%,
            color-mix(in oklab, var(--color-matte-gold) 70%, white 30%) 50%,
            color-mix(in oklab, var(--color-matte-gold) 85%, white 15%) 100%
          );
          background-size: 200% 200%;
          color: var(--color-luxury-black);
          box-shadow:
            0 4px 15px rgba(0, 0, 0, 0.4),
            inset 0 1px 0 rgba(255, 255, 255, 0.2);
          transition: transform 0.3s ease, box-shadow 0.3s ease, filter 0.3s ease;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          animation: premium-cta-gradient 6s ease-in-out infinite;
        }

        .svc-btn::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          pointer-events: none;
          animation: premium-cta-shimmer 2.8s linear infinite;
        }

        .svc-btn:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow:
            0 8px 30px color-mix(in oklab, var(--color-matte-gold) 55%, transparent),
            0 0 40px color-mix(in oklab, var(--color-matte-gold) 40%, transparent);
          filter: brightness(1.08);
        }

        .svc-btn--primary {
          /* Primary uses the gold gradient from above */
        }

        .svc-btn--ghost {
          background: transparent;
          border: 2px solid color-mix(in oklab, var(--color-matte-gold) 50%, transparent);
          color: var(--color-matte-gold);
          box-shadow: 0 0 15px color-mix(in oklab, var(--color-matte-gold) 18%, transparent);
        }

        .svc-btn--ghost::before {
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
        }

        .svc-btn--ghost:hover {
          background: color-mix(in oklab, var(--color-matte-gold) 92%, white 8%);
          color: var(--color-luxury-black);
        }

        @keyframes svcFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* Tilt effect only on devices that support hover */
        @media (hover: hover) and (pointer: fine) {
          .svc-panel {
            transition: transform 320ms ease, border-color 200ms ease;
          }
          .svc-panel:hover {
            transform:
              perspective(1200px)
              rotateX(calc((var(--my) - 0.5) * -6deg))
              rotateY(calc((var(--mx) - 0.5) * 8deg))
              translateY(-2px);
          }
        }

        /* Responsive */
        @media (max-width: 980px) {
          .svc-showcase__grid {
            grid-template-columns: 1fr;
          }
          .svc-rail {
            position: relative;
            top: auto;
            display: flex;
            gap: 10px;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            padding: 12px;
          }
          .svc-rail__label, .svc-rail__hint {
            display: none;
          }
          .svc-rail__item {
            scroll-snap-align: start;
            min-width: 260px;
            grid-template-columns: 44px 1fr 10px;
            flex: 0 0 auto;
          }
          .svc-panel__frame {
            grid-template-columns: 1fr;
            min-height: auto;
          }
          .svc-panel__media {
            height: clamp(220px, 48vw, 360px);
          }
          .svc-panel__mediaOverlay {
            background:
              linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.74) 88%),
              radial-gradient(800px 300px at 50% 0%, rgba(192,160,98,0.10), transparent 60%);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .svc-showcase__header { animation: none; }
          .svc-panel, .svc-btn, .svc-rail__item { transition: none !important; }
          .svc-panel:hover { transform: none !important; }
        }
      `}</style>
    </section>
  );
}
