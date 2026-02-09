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
  durationS: number;
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

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export default function UniversePortalPage() {
  const router = useRouter();

  useEffect(() => {
    const t = window.setTimeout(() => {
      router.push('/universe/learn');
    }, 3500);
    return () => window.clearTimeout(t);
  }, [router]);

  const stars = useMemo<Star[]>(() => {
    const rand = mulberry32(20260209);
    const count = 140; // 100+ required

    const out: Star[] = [];
    for (let i = 0; i < count; i += 1) {
      const leftPct = rand() * 100;
      const topPct = rand() * 100;
      const sizePx = 1 + rand() * 2; // 1–3px
      const opacity = clamp(0.3 + rand() * 0.7, 0.3, 1); // 0.3–1.0
      const driftX = (rand() - 0.5) * 120; // px
      const driftY = (rand() - 0.5) * 120; // px
      const durationS = 40; // 40s, infinite
      const delayS = rand() * 6;

      out.push({
        id: i,
        leftPct,
        topPct,
        sizePx,
        opacity,
        driftX,
        driftY,
        durationS,
        delayS,
      });
    }

    return out;
  }, []);

  return (
    <main className="universe-root fixed inset-0 w-screen h-screen overflow-hidden bg-black">
      {/* Starfield */}
      <div className="universe-stars absolute inset-0" aria-hidden="true">
        {stars.map((s) => (
          <span
            key={s.id}
            className="universe-star absolute rounded-full bg-white"
            style={
              {
                left: `${s.leftPct}%`,
                top: `${s.topPct}%`,
                width: `${s.sizePx}px`,
                height: `${s.sizePx}px`,
                opacity: s.opacity,
                // CSS variables for per-star drift
                ['--dx' as any]: `${s.driftX}`,
                ['--dy' as any]: `${s.driftY}`,
                animationDuration: `${s.durationS}s`,
                animationDelay: `${s.delayS}s`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>

      {/* Portal */}
      <div className="absolute inset-0 grid place-items-center">
        <div className="relative">
          <div
            className="universe-portal pointer-events-none"
            aria-hidden="true"
            style={{
              background:
                'radial-gradient(circle at 50% 50%, #1e3a8a 0%, #7c3aed 55%, #f59e0b 100%)',
            }}
          />

          {/* Soft glow halo */}
          <div
            className="universe-portal-glow pointer-events-none"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Text overlay */}
      <div className="absolute inset-0 grid place-items-center">
        <div className="universe-text px-6 text-center">
          <div className="universe-title text-[32px] sm:text-[36px] md:text-[48px] leading-tight text-white">
            ✨ Entering Your Learning Universe...
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* Sequence: fade-in to black (0.5s) */
        @keyframes universeRootFade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .universe-root {
          animation: universeRootFade 0.5s ease-out both;
        }

        /* Stars appear after 0.5s */
        @keyframes universeStarsFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .universe-stars {
          opacity: 0;
          animation: universeStarsFadeIn 0.5s ease-out both;
          animation-delay: 0.5s;
        }

        @keyframes universe-star-drift {
          0% {
            transform: translate3d(0, 0, 0);
          }
          100% {
            transform: translate3d(calc(var(--dx) * 1px), calc(var(--dy) * 1px), 0);
          }
        }

        .universe-star {
          animation-name: universe-star-drift;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          will-change: transform;
        }

        /* Portal: dot appears ~0.3s, then expands over 2s */
        @keyframes universe-portal-expand {
          0% {
            transform: translate3d(0, 0, 0) scale(0);
            opacity: 0;
          }
          1% {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale(0.04);
          }
          100% {
            transform: translate3d(0, 0, 0) scale(30);
            opacity: 1;
          }
        }

        .universe-portal {
          width: 180px;
          height: 180px;
          border-radius: 9999px;
          filter: saturate(1.1);
          box-shadow:
            0 0 44px rgba(30, 58, 138, 0.30),
            0 0 92px rgba(124, 58, 237, 0.24),
            0 0 140px rgba(245, 158, 11, 0.16);
          animation: universe-portal-expand 2s ease-out both;
          animation-delay: 0.3s;
          transform-origin: 50% 50%;
          will-change: transform;
        }

        .universe-portal-glow {
          position: absolute;
          inset: -18px;
          border-radius: 9999px;
          background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.12) 0%, rgba(255, 255, 255, 0.0) 70%);
          mix-blend-mode: screen;
          opacity: 0.9;
        }

        @keyframes universe-text-fade {
          0% {
            opacity: 0;
            transform: translate3d(0, 8px, 0);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        .universe-text {
          opacity: 0;
          animation: universe-text-fade 0.8s ease forwards;
          animation-delay: 1s;
          text-shadow:
            0 0 24px rgba(30, 58, 138, 0.22),
            0 0 36px rgba(124, 58, 237, 0.18);
        }

        .universe-title {
          font-family: "Playfair Display", ui-serif, Georgia, Cambria, "Times New Roman", Times, serif;
          font-weight: 500;
          letter-spacing: -0.01em;
        }

        /* Accessibility: reduce motion */
        @media (prefers-reduced-motion: reduce) {
          .universe-root,
          .universe-stars,
          .universe-star,
          .universe-portal,
          .universe-text {
            animation: none !important;
            transition: none !important;
          }
          .universe-stars {
            opacity: 1 !important;
          }
          .universe-portal {
            transform: translate3d(0, 0, 0) scale(30) !important;
          }
          .universe-text {
            opacity: 1 !important;
            transform: none !important;
          }
        }

        @media (max-width: 380px) {
          .universe-portal {
            width: 150px;
            height: 150px;
          }
        }
      `}</style>
    </main>
  );
}
