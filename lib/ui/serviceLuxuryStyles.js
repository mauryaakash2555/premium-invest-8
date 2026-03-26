export function getServiceLuxuryStyles({
  accentRgb,
  accentColor,
  title = '#FFFFFF',
  border = 'rgba(255,255,255,0.12)',
  shellBg = '#05070D',
} = {}) {
  const rgb = accentRgb || '214, 179, 106';
  const accent = accentColor || `rgb(${rgb})`;

  return `
  @keyframes svc-ambient {
    0%, 100% { transform: translate3d(0,0,0) scale(1); opacity: .75; }
    50% { transform: translate3d(0,-10px,0) scale(1.03); opacity: 1; }
  }
  @keyframes svc-sheen {
    0% { transform: translateX(-120%); }
    100% { transform: translateX(120%); }
  }
  @keyframes svc-glowbreath {
    0%, 100% { box-shadow: 0 22px 70px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06); }
    50% { box-shadow: 0 28px 80px rgba(0,0,0,0.55), 0 0 54px color-mix(in oklab, ${accent} 14%, transparent), inset 0 1px 0 rgba(255,255,255,0.08); }
  }
  @keyframes svc-sweep {
    0% { transform: translateX(-140%); opacity: 0; }
    12% { opacity: 1; }
    55% { opacity: 1; }
    100% { transform: translateX(140%); opacity: 0; }
  }

  .svc-shell { background: ${shellBg}; color: ${title}; min-height: 100vh; }

  .svc-card {
    position: relative;
    overflow: hidden;
    border-radius: 18px;
    border: 1px solid ${border};
    background: rgba(255,255,255,0.035);
    backdrop-filter: blur(14px);
    box-shadow: 0 22px 70px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.06);
    transition: transform .35s ease, border-color .35s ease, box-shadow .35s ease;
  }
  .svc-card:hover {
    transform: translateY(-4px);
    border-color: color-mix(in oklab, ${accent} 35%, transparent);
    box-shadow: 0 28px 80px rgba(0,0,0,0.55), 0 0 48px color-mix(in oklab, ${accent} 14%, transparent), inset 0 1px 0 rgba(255,255,255,0.08);
  }
  .svc-card::before {
    content: '';
    position: absolute;
    inset: -2px;
    pointer-events: none;
    background:
      radial-gradient(900px 240px at 10% 0%, color-mix(in oklab, ${accent} 10%, transparent), transparent 60%),
      radial-gradient(760px 240px at 90% 100%, rgba(255,255,255,.06), transparent 60%);
    opacity: .9;
  }

  .svc-cta {
    position: relative;
    overflow: hidden;
    z-index: 0;
    background: oklch(0.95 0.01 85) !important;
    color: oklch(0.06 0.005 280) !important;
    border: 1px solid rgba(255,255,255,0.14) !important;
    border-radius: 0 !important;
    box-shadow: 0 16px 60px rgba(0,0,0,0.55);
    backdrop-filter: none !important;
    font-weight: 600;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    transition: transform .25s ease, box-shadow .25s ease, filter .25s ease;
  }
  .svc-cta::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: var(--lux-accent);
    transform: translateX(-101%);
    transition: transform 0.5s cubic-bezier(0.16, 1, 0.3, 1);
    z-index: -1;
  }
  .svc-cta:hover {
    transform: translateY(-2px);
    box-shadow: 0 22px 90px rgba(0,0,0,0.68) !important;
    border-color: rgba(255,255,255,0.14) !important;
    filter: brightness(1.02);
  }
  .svc-cta:hover::after { transform: translateX(0); }

  .svc-kpi {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 16px;
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,0.10);
    background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
  }

  /* Mobile-first: simulate hover + add gentle motion so service pages feel alive */
  @media (hover: none), (pointer: coarse) {
    .svc-hero { padding: 96px 0 56px 0 !important; margin-top: 64px !important; }
    .svc-hero-inner { padding: 0 16px !important; }

    .svc-card:active,
    .svc-cta:active {
      transform: translateY(-2px);
      box-shadow: 0 22px 90px rgba(0,0,0,0.68);
    }

    .svc-card.svc-mobile-pulse {
      transform: translateY(-3px);
      border-color: color-mix(in oklab, ${accent} 42%, transparent);
      animation: svc-glowbreath 2.6s ease-in-out 1;
    }
    .svc-card.svc-mobile-pulse::after {
      content: '';
      position: absolute;
      inset: 0;
      pointer-events: none;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.16), transparent);
      transform: translateX(-140%);
      animation: svc-sweep 1.15s ease 1;
      opacity: 0;
    }

    .svc-cta.svc-mobile-pulse::after {
      opacity: 1;
      animation: svc-sheen 1.1s ease;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .svc-card, .svc-cta { transition: none !important; }
    .svc-card.svc-mobile-pulse { animation: none !important; transform: none !important; }
    .svc-card.svc-mobile-pulse::after, .svc-cta.svc-mobile-pulse::after { animation: none !important; opacity: 0 !important; }
  }
`;
}
