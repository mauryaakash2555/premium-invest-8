'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type Star = {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  twinkleDelay: number;
};

function seededRandom(seed: number) {
  return function () {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

export default function UniversePortalPage() {
  const router = useRouter();
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 200);
    const t2 = setTimeout(() => setPhase(2), 600);
    const t3 = setTimeout(() => setPhase(3), 1800);
    const t4 = setTimeout(() => router.push('/universe/learn'), 4000);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [router]);

  const stars = useMemo<Star[]>(() => {
    const rand = seededRandom(42);
    return Array.from({ length: 200 }, (_, i) => ({
      id: i,
      x: rand() * 100,
      y: rand() * 100,
      size: rand() < 0.7 ? 1 : rand() < 0.9 ? 2 : 3,
      opacity: 0.3 + rand() * 0.7,
      twinkleDelay: rand() * 8,
    }));
  }, []);

  return (
    <>
      <div className={`portal-page ${phase >= 1 ? 'phase-1' : ''} ${phase >= 2 ? 'phase-2' : ''} ${phase >= 3 ? 'phase-3' : ''}`}>
        {/* Stars - white only */}
        <div className="starfield">
          {stars.map((star) => (
            <div
              key={star.id}
              className="star"
              style={{
                left: `${star.x}%`,
                top: `${star.y}%`,
                width: star.size,
                height: star.size,
                '--opacity': star.opacity,
                animationDelay: `${star.twinkleDelay}s`,
              } as React.CSSProperties}
            />
          ))}
        </div>

        {/* Portal - pure white light */}
        <div className="portal-wrapper">
          <div className="portal-glow" />
          <div className="portal-ring ring-outer" />
          <div className="portal-ring ring-middle" />
          <div className="portal-ring ring-inner" />
          <div className="portal-core" />
          <div className="pulse-wave wave-1" />
          <div className="pulse-wave wave-2" />
        </div>

        {/* Text - monochrome */}
        <div className="portal-text">
          <span className="text-upper">Entering Your</span>
          <span className="text-main">Learning Universe</span>
        </div>

        {/* Vignette */}
        <div className="vignette" />
      </div>

      <style jsx>{`
        .portal-page {
          position: fixed;
          inset: 0;
          background: #000000;
          overflow: hidden;
          opacity: 0;
          transition: opacity 0.6s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .portal-page.phase-1 {
          opacity: 1;
        }

        /* ═══════════════════════════════════════════
           STARFIELD - Pure white dots
           ═══════════════════════════════════════════ */
        .starfield {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 1.2s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .phase-1 .starfield {
          opacity: 1;
        }

        .star {
          position: absolute;
          background: #ffffff;
          border-radius: 50%;
          opacity: var(--opacity);
          animation: twinkle 6s ease-in-out infinite;
        }

        @keyframes twinkle {
          0%, 100% { opacity: calc(var(--opacity) * 0.4); }
          50% { opacity: var(--opacity); }
        }

        /* ═══════════════════════════════════════════
           PORTAL - Monochrome white light
           ═══════════════════════════════════════════ */
        .portal-wrapper {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 500px;
          height: 500px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Outer glow - pure white */
        .portal-glow {
          position: absolute;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.2) 0%,
            rgba(255, 255, 255, 0.08) 40%,
            transparent 70%
          );
          filter: blur(60px);
          opacity: 0;
          transition: all 2.5s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .phase-2 .portal-glow {
          width: 700px;
          height: 700px;
          opacity: 1;
        }

        /* Portal rings - white borders only */
        .portal-ring {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.12);
          opacity: 0;
          transition: all 2.5s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .ring-outer {
          width: 10px;
          height: 10px;
          border-color: rgba(255, 255, 255, 0.08);
        }

        .ring-middle {
          width: 8px;
          height: 8px;
          border-color: rgba(255, 255, 255, 0.12);
        }

        .ring-inner {
          width: 6px;
          height: 6px;
          border-color: rgba(255, 255, 255, 0.18);
        }

        .phase-1 .portal-ring {
          opacity: 1;
        }

        .phase-2 .ring-outer {
          width: 320px;
          height: 320px;
        }

        .phase-2 .ring-middle {
          width: 200px;
          height: 200px;
        }

        .phase-2 .ring-inner {
          width: 100px;
          height: 100px;
        }

        /* Portal core - pure white light */
        .portal-core {
          position: absolute;
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #ffffff;
          opacity: 0;
          box-shadow:
            0 0 15px rgba(255, 255, 255, 0.9),
            0 0 30px rgba(255, 255, 255, 0.7),
            0 0 60px rgba(255, 255, 255, 0.5);
          transition: all 2.5s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .phase-1 .portal-core {
          opacity: 1;
        }

        .phase-2 .portal-core {
          width: 50px;
          height: 50px;
          box-shadow:
            0 0 40px rgba(255, 255, 255, 0.95),
            0 0 80px rgba(255, 255, 255, 0.7),
            0 0 140px rgba(255, 255, 255, 0.5),
            0 0 220px rgba(255, 255, 255, 0.3);
        }

        /* Pulse waves - white only */
        .pulse-wave {
          position: absolute;
          border-radius: 50%;
          border: 1px solid rgba(255, 255, 255, 0.2);
          opacity: 0;
        }

        .phase-2 .pulse-wave {
          animation: pulseExpand 4s ease-out infinite;
        }

        .wave-1 { animation-delay: 0s; }
        .wave-2 { animation-delay: 2s; }

        @keyframes pulseExpand {
          0% {
            width: 50px;
            height: 50px;
            opacity: 0.4;
          }
          100% {
            width: 600px;
            height: 600px;
            opacity: 0;
          }
        }

        /* ═══════════════════════════════════════════
           TEXT - Light weight, white/gray only
           ═══════════════════════════════════════════ */
        .portal-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          z-index: 10;
          opacity: 0;
          transition: opacity 1s cubic-bezier(0.23, 1, 0.32, 1);
        }

        .phase-3 .portal-text {
          opacity: 1;
        }

        .text-upper {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', 'Segoe UI', sans-serif;
          font-size: clamp(16px, 2.5vw, 24px);
          font-weight: 400;
          color: #737373;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .text-main {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', 'Segoe UI', sans-serif;
          font-size: clamp(36px, 7vw, 72px);
          font-weight: 300;
          color: #ffffff;
          letter-spacing: -0.03em;
        }

        /* Vignette */
        .vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            ellipse at center,
            transparent 0%,
            transparent 40%,
            rgba(0, 0, 0, 0.6) 100%
          );
          pointer-events: none;
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .star,
          .pulse-wave {
            animation: none;
          }

          .portal-glow,
          .portal-ring,
          .portal-core,
          .portal-text,
          .starfield {
            transition-duration: 0.1s;
          }
        }
      `}</style>
    </>
  );
}
