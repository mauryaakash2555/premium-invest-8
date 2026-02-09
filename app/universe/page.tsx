'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';

type Star = {
  id: number;
  leftPct: number;
  topPct: number;
  sizePx: number;
  opacity: number;
  driftX: number;
  driftY: number;
  delayS: number;
};

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export default function UniversePortalPage() {
  const router = useRouter();

  useEffect(() => {
    const t = window.setTimeout(() => {
      router.push('/universe/learn');
    }, 4000);
    return () => window.clearTimeout(t);
  }, [router]);

  // Generate 220 stars with different sizes and properties
  const stars = useMemo<Star[]>(() => {
    const rand = mulberry32(20260209);
    const count = 220;
    const out: Star[] = [];

    for (let i = 0; i < count; i++) {
      const sizes = [1, 1, 1, 2, 2, 3]; // weighted toward smaller
      const sizePx = sizes[Math.floor(rand() * sizes.length)];
      out.push({
        id: i,
        leftPct: rand() * 100,
        topPct: rand() * 100,
        sizePx,
        opacity: 0.2 + rand() * 0.8, // 0.2 to 1.0
        driftX: (rand() - 0.5) * 80,
        driftY: (rand() - 0.5) * 80,
        delayS: rand() * 10,
      });
    }
    return out;
  }, []);

  return (
    <main className="portal-root">
      {/* Starfield layer */}
      <div className="portal-starfield" aria-hidden="true">
        {stars.map((s) => (
          <span
            key={s.id}
            className="portal-star"
            style={{
              left: `${s.leftPct}%`,
              top: `${s.topPct}%`,
              width: `${s.sizePx}px`,
              height: `${s.sizePx}px`,
              opacity: s.opacity,
              ['--drift-x' as string]: `${s.driftX}px`,
              ['--drift-y' as string]: `${s.driftY}px`,
              animationDelay: `${s.delayS}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Portal vortex */}
      <div className="portal-center">
        <div className="portal-vortex" aria-hidden="true">
          <div className="portal-ring portal-ring-1" />
          <div className="portal-ring portal-ring-2" />
          <div className="portal-ring portal-ring-3" />
          <div className="portal-core" />
        </div>
      </div>

      {/* Text overlay */}
      <div className="portal-text-wrap">
        <h1 className="portal-title">✨ Entering Your Learning Universe...</h1>
      </div>

      <style jsx global>{`
        .portal-root {
          position: fixed;
          inset: 0;
          width: 100vw;
          height: 100vh;
          background: #000000;
          overflow: hidden;
          opacity: 0;
          animation: portalFadeIn 0.5s ease-out forwards;
        }

        @keyframes portalFadeIn {
          to { opacity: 1; }
        }

        /* ═══════════════════════════════════════════════════════════
           STARFIELD
           ═══════════════════════════════════════════════════════════ */
        .portal-starfield {
          position: absolute;
          inset: 0;
          opacity: 0;
          animation: starsAppear 0.8s ease-out forwards;
          animation-delay: 0.5s;
        }

        @keyframes starsAppear {
          to { opacity: 1; }
        }

        .portal-star {
          position: absolute;
          border-radius: 50%;
          background: #ffffff;
          animation: starDrift 60s linear infinite;
          will-change: transform;
        }

        @keyframes starDrift {
          0% { transform: translate(0, 0); }
          50% { transform: translate(var(--drift-x), var(--drift-y)); }
          100% { transform: translate(0, 0); }
        }

        /* ═══════════════════════════════════════════════════════════
           PORTAL VORTEX
           ═══════════════════════════════════════════════════════════ */
        .portal-center {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }

        .portal-vortex {
          position: relative;
          width: 10px;
          height: 10px;
          animation: portalExpand 2.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
          animation-delay: 1s;
        }

        @keyframes portalExpand {
          0% {
            width: 10px;
            height: 10px;
          }
          100% {
            width: 2000px;
            height: 2000px;
          }
        }

        .portal-ring {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          animation: portalSpin 8s linear infinite;
        }

        .portal-ring-1 {
          background: radial-gradient(
            circle at 50% 50%,
            rgba(30, 58, 138, 0.95) 0%,
            rgba(30, 58, 138, 0.6) 30%,
            rgba(124, 58, 237, 0.4) 55%,
            rgba(217, 119, 6, 0.2) 75%,
            transparent 100%
          );
          box-shadow:
            0 0 60px rgba(30, 58, 138, 0.5),
            0 0 120px rgba(124, 58, 237, 0.3),
            0 0 200px rgba(217, 119, 6, 0.15),
            inset 0 0 80px rgba(30, 58, 138, 0.4);
        }

        .portal-ring-2 {
          background: radial-gradient(
            circle at 50% 50%,
            transparent 0%,
            rgba(124, 58, 237, 0.15) 40%,
            rgba(217, 119, 6, 0.1) 60%,
            transparent 80%
          );
          animation-duration: 12s;
          animation-direction: reverse;
        }

        .portal-ring-3 {
          background: radial-gradient(
            circle at 50% 50%,
            transparent 20%,
            rgba(255, 255, 255, 0.05) 50%,
            transparent 70%
          );
          animation-duration: 20s;
        }

        .portal-core {
          position: absolute;
          inset: 35%;
          border-radius: 50%;
          background: radial-gradient(
            circle at 50% 50%,
            rgba(255, 255, 255, 0.9) 0%,
            rgba(147, 197, 253, 0.6) 20%,
            rgba(30, 58, 138, 0.8) 50%,
            transparent 100%
          );
          box-shadow:
            0 0 40px rgba(255, 255, 255, 0.4),
            0 0 80px rgba(147, 197, 253, 0.3);
          animation: portalPulse 2s ease-in-out infinite;
        }

        @keyframes portalSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes portalPulse {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }

        /* ═══════════════════════════════════════════════════════════
           TEXT
           ═══════════════════════════════════════════════════════════ */
        .portal-text-wrap {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          pointer-events: none;
          z-index: 10;
        }

        .portal-title {
          font-family: 'Playfair Display', Georgia, 'Times New Roman', serif;
          font-size: clamp(28px, 5vw, 48px);
          font-weight: 500;
          color: #ffffff;
          text-align: center;
          letter-spacing: -0.02em;
          opacity: 0;
          animation: textFadeFloat 1s ease-out forwards;
          animation-delay: 2s;
          text-shadow:
            0 0 20px rgba(255, 255, 255, 0.5),
            0 0 40px rgba(124, 58, 237, 0.4),
            0 0 60px rgba(30, 58, 138, 0.3);
        }

        @keyframes textFadeFloat {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* Subtle float after appearing */
        .portal-title {
          animation: textFadeFloat 1s ease-out forwards, textFloat 3s ease-in-out infinite;
          animation-delay: 2s, 3s;
        }

        @keyframes textFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        /* ═══════════════════════════════════════════════════════════
           REDUCED MOTION
           ═══════════════════════════════════════════════════════════ */
        @media (prefers-reduced-motion: reduce) {
          .portal-root,
          .portal-starfield,
          .portal-star,
          .portal-vortex,
          .portal-ring,
          .portal-core,
          .portal-title {
            animation: none !important;
          }
          .portal-starfield { opacity: 1; }
          .portal-vortex { width: 2000px; height: 2000px; }
          .portal-title { opacity: 1; transform: none; }
        }
      `}</style>
    </main>
  );
}
