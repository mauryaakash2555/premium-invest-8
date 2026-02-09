'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

type Star = {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
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
    const t1 = setTimeout(() => setPhase(1), 100);
    const t2 = setTimeout(() => setPhase(2), 400);
    const t3 = setTimeout(() => setPhase(3), 1600);
    const t4 = setTimeout(() => router.push('/universe/learn'), 3800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [router]);

  const stars = useMemo<Star[]>(() => {
    const rand = seededRandom(42);
    return Array.from({ length: 150 }, (_, i) => ({
      id: i,
      x: rand() * 100,
      y: rand() * 100,
      size: rand() < 0.8 ? 1 : 2,
      opacity: 0.2 + rand() * 0.6,
    }));
  }, []);

  return (
    <>
      <div className={`portal-page ${phase >= 1 ? 'phase-1' : ''} ${phase >= 2 ? 'phase-2' : ''} ${phase >= 3 ? 'phase-3' : ''}`}>
        {/* Stars */}
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
                opacity: star.opacity,
              }}
            />
          ))}
        </div>

        {/* The Sun - supernatural, real, no animation */}
        <div className="sun-container">
          {/* Outermost corona - very subtle */}
          <div className="sun-corona-outer" />
          {/* Corona */}
          <div className="sun-corona" />
          {/* Photosphere glow */}
          <div className="sun-glow" />
          {/* Core - pure white */}
          <div className="sun-core" />
        </div>

        {/* Text - small and refined */}
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
          transition: opacity 0.8s ease;
        }

        .portal-page.phase-1 {
          opacity: 1;
        }

        /* ═══════════════════════════════════════════
           STARFIELD
           ═══════════════════════════════════════════ */
        .starfield {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 1.5s ease;
        }

        .phase-1 .starfield {
          opacity: 1;
        }

        .star {
          position: absolute;
          background: #ffffff;
          border-radius: 50%;
        }

        /* ═══════════════════════════════════════════
           THE SUN - Supernatural, real, static
           No animation - just pure light
           ═══════════════════════════════════════════ */
        .sun-container {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 600px;
          height: 600px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        /* Outermost corona - barely visible haze */
        .sun-corona-outer {
          position: absolute;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.03) 0%,
            rgba(255, 255, 255, 0.01) 40%,
            transparent 70%
          );
          transition: all 2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .phase-2 .sun-corona-outer {
          width: 600px;
          height: 600px;
        }

        /* Corona - soft outer glow */
        .sun-corona {
          position: absolute;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.08) 0%,
            rgba(255, 255, 255, 0.04) 30%,
            rgba(255, 255, 255, 0.01) 60%,
            transparent 100%
          );
          transition: all 2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .phase-2 .sun-corona {
          width: 400px;
          height: 400px;
        }

        /* Photosphere - intense glow around core */
        .sun-glow {
          position: absolute;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(255, 255, 255, 0.5) 0%,
            rgba(255, 255, 255, 0.3) 20%,
            rgba(255, 255, 255, 0.1) 50%,
            transparent 100%
          );
          box-shadow:
            0 0 60px rgba(255, 255, 255, 0.4),
            0 0 120px rgba(255, 255, 255, 0.2);
          transition: all 2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .phase-2 .sun-glow {
          width: 180px;
          height: 180px;
        }

        /* Core - pure white, intense */
        .sun-core {
          position: absolute;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: #ffffff;
          opacity: 0;
          box-shadow:
            0 0 20px #ffffff,
            0 0 40px rgba(255, 255, 255, 0.9),
            0 0 80px rgba(255, 255, 255, 0.7),
            0 0 120px rgba(255, 255, 255, 0.5),
            0 0 200px rgba(255, 255, 255, 0.3);
          transition: all 2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .phase-1 .sun-core {
          width: 4px;
          height: 4px;
          opacity: 1;
        }

        .phase-2 .sun-core {
          width: 40px;
          height: 40px;
          opacity: 1;
        }

        /* ═══════════════════════════════════════════
           TEXT - Small, refined, elegant
           ═══════════════════════════════════════════ */
        .portal-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          z-index: 10;
          opacity: 0;
          transition: opacity 1.2s ease;
        }

        .phase-3 .portal-text {
          opacity: 1;
        }

        .text-upper {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif;
          font-size: 11px;
          font-weight: 500;
          color: #525252;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          margin-bottom: 8px;
        }

        .text-main {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif;
          font-size: 24px;
          font-weight: 400;
          color: #e5e5e5;
          letter-spacing: 0.02em;
        }

        @media (min-width: 768px) {
          .text-upper {
            font-size: 12px;
          }
          .text-main {
            font-size: 28px;
          }
        }

        /* Vignette */
        .vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(
            ellipse at center,
            transparent 0%,
            transparent 30%,
            rgba(0, 0, 0, 0.7) 100%
          );
          pointer-events: none;
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .sun-corona-outer,
          .sun-corona,
          .sun-glow,
          .sun-core,
          .portal-text,
          .starfield {
            transition-duration: 0.1s;
          }
        }
      `}</style>
    </>
  );
}
