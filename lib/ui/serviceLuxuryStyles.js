export function getServiceLuxuryStyles({
  accentRgb,
  title = '#FFFFFF',
  border = 'rgba(255,255,255,0.12)',
  shellBg = '#05070D',
} = {}) {
  const rgb = accentRgb || '214, 179, 106';

  return `
  @keyframes svc-ambient {
    0%, 100% { transform: translate3d(0,0,0) scale(1); opacity: .75; }
    50% { transform: translate3d(0,-10px,0) scale(1.03); opacity: 1; }
  }
  @keyframes svc-sheen {
    0% { transform: translateX(-120%); }
    100% { transform: translateX(120%); }
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
    border-color: rgba(${rgb}, .35);
    box-shadow: 0 28px 80px rgba(0,0,0,0.55), 0 0 48px rgba(${rgb}, .14), inset 0 1px 0 rgba(255,255,255,0.08);
  }
  .svc-card::before {
    content: '';
    position: absolute;
    inset: -2px;
    pointer-events: none;
    background:
      radial-gradient(900px 240px at 10% 0%, rgba(${rgb}, .10), transparent 60%),
      radial-gradient(760px 240px at 90% 100%, rgba(255,255,255,.06), transparent 60%);
    opacity: .9;
  }

  .svc-cta {
    position: relative;
    overflow: hidden;
    transition: transform .25s ease, border-color .25s ease, box-shadow .25s ease;
  }
  .svc-cta::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent);
    transform: translateX(-120%);
  }
  .svc-cta:hover {
    transform: translateY(-2px);
    border-color: rgba(${rgb}, .35) !important;
    box-shadow: 0 14px 40px rgba(${rgb}, .18);
  }
  .svc-cta:hover::after { opacity: 1; animation: svc-sheen 1.1s ease; }

  .svc-kpi {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 16px;
    border-radius: 16px;
    border: 1px solid rgba(255,255,255,0.10);
    background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02));
  }
`;
}
