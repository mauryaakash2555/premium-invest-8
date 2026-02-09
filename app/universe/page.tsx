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

type Particle = {
  id: number;
  angle: number;
  radius: number;
  speed: number;
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
  const [phase, setPhase] = useState(0); // 0: initial, 1: portal visible, 2: expanding, 3: text visible

  useEffect(() => {
    // Phase timing
    const t1 = setTimeout(() => setPhase(1), 300);   // Stars + portal dot
    const t2 = setTimeout(() => setPhase(2), 800);   // Portal starts expanding  
    const t3 = setTimeout(() => setPhase(3), 2000);  // Text appears
    const t4 = setTimeout(() => router.push('/universe/learn'), 4500); // Redirect

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [router]);

  // Generate stars
  const stars = useMemo<Star[]>(() => {
    const rand = seededRandom(42);
    return Array.from({ length: 300 }, (_, i) => ({
      id: i,
      x: rand() * 100,
      y: rand() * 100,
      size: rand() < 0.7 ? 1 : rand() < 0.9 ? 2 : 3,
      opacity: 0.3 + rand() * 0.7,
      twinkleDelay: rand() * 5,
    }));
  }, []);

  // Orbital particles around portal
  const particles = useMemo<Particle[]>(() => {
    const rand = seededRandom(123);
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      angle: rand() * 360,
      radius: 30 + rand() * 40,
      speed: 15 + rand() * 25,
      size: 1 + rand() * 2,
      opacity: 0.3 + rand() * 0.5,
    }));
  }, []);

  return (
    <>
      <div className={`universe-portal ${phase >= 1 ? 'visible' : ''}`}>
        {/* Deep space background with nebula */}
        <div className="nebula-layer" />
        
        {/* Starfield */}
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
                animationDelay: `${star.twinkleDelay}s`,
              }}
            />
          ))}
        </div>

        {/* Portal container */}
        <div className="portal-container">
          {/* Outer glow ring */}
          <div className={`portal-glow ${phase >= 2 ? 'expanding' : ''}`} />
          
          {/* Orbital particles */}
          <div className={`orbital-field ${phase >= 2 ? 'active' : ''}`}>
            {particles.map((p) => (
              <div
                key={p.id}
                className="orbital-particle"
                style={{
                  '--angle': `${p.angle}deg`,
                  '--radius': `${p.radius}%`,
                  '--speed': `${p.speed}s`,
                  '--size': `${p.size}px`,
                  '--opacity': p.opacity,
                } as React.CSSProperties}
              />
            ))}
          </div>

          {/* Main portal rings */}
          <div className={`portal-ring outer ${phase >= 2 ? 'expanding' : ''}`} />
          <div className={`portal-ring middle ${phase >= 2 ? 'expanding' : ''}`} />
          <div className={`portal-ring inner ${phase >= 2 ? 'expanding' : ''}`} />
          
          {/* Portal core */}
          <div className={`portal-core ${phase >= 1 ? 'visible' : ''} ${phase >= 2 ? 'expanding' : ''}`} />
          
          {/* Energy waves */}
          <div className={`energy-wave wave-1 ${phase >= 2 ? 'active' : ''}`} />
          <div className={`energy-wave wave-2 ${phase >= 2 ? 'active' : ''}`} />
          <div className={`energy-wave wave-3 ${phase >= 2 ? 'active' : ''}`} />
        </div>

        {/* Text */}
        <div className={`portal-text ${phase >= 3 ? 'visible' : ''}`}>
          <span className="text-line">Entering Your</span>
          <span className="text-line text-highlight">Learning Universe</span>
        </div>

        {/* Subtle vignette */}
        <div className="vignette" />
      </div>

      <style jsx>{`
        .universe-portal {
          position: fixed;
          inset: 0;
          background: #000;
          overflow: hidden;
          opacity: 0;
          transition: opacity 0.5s ease;
        }
        
        .universe-portal.visible {
          opacity: 1;
        }

        /* Nebula background - very subtle, dark purples and blues */
        .nebula-layer {
          position: absolute;
          inset: 0;
          background: 
            radial-gradient(ellipse 80% 50% at 20% 80%, rgba(59, 7, 100, 0.15) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 20%, rgba(30, 58, 138, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse 100% 80% at 50% 50%, rgba(17, 24, 39, 0.5) 0%, transparent 70%);
        }

        /* Stars */
        .starfield {
          position: absolute;
          inset: 0;
        }

        .star {
          position: absolute;
          background: #fff;
          border-radius: 50%;
          animation: twinkle 3s ease-in-out infinite;
        }

        @keyframes twinkle {
          0%, 100% { opacity: var(--base-opacity, 0.5); transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }

        /* Portal container */
        .portal-container {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 400px;
          height: 400px;
        }

        /* Portal glow - outer atmospheric effect */
        .portal-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 20px;
          height: 20px;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99, 102, 241, 0.3) 0%, rgba(139, 92, 246, 0.1) 40%, transparent 70%);
          filter: blur(30px);
          transition: all 2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .portal-glow.expanding {
          width: 600px;
          height: 600px;
        }

        /* Orbital particles */
        .orbital-field {
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.5s ease;
        }

        .orbital-field.active {
          opacity: 1;
        }

        .orbital-particle {
          position: absolute;
          top: 50%;
          left: 50%;
          width: var(--size);
          height: var(--size);
          background: rgba(167, 139, 250, var(--opacity));
          border-radius: 50%;
          box-shadow: 0 0 6px rgba(167, 139, 250, 0.5);
          animation: orbit var(--speed) linear infinite;
          transform-origin: center center;
        }

        @keyframes orbit {
          from {
            transform: translate(-50%, -50%) rotate(var(--angle)) translateX(calc(var(--radius))) rotate(calc(-1 * var(--angle)));
          }
          to {
            transform: translate(-50%, -50%) rotate(calc(var(--angle) + 360deg)) translateX(calc(var(--radius))) rotate(calc(-1 * var(--angle) - 360deg));
          }
        }

        /* Portal rings */
        .portal-ring {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          border: 1px solid rgba(139, 92, 246, 0.3);
          transition: all 2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .portal-ring.outer {
          width: 30px;
          height: 30px;
          border-color: rgba(99, 102, 241, 0.2);
          animation: ringPulse 4s ease-in-out infinite;
        }

        .portal-ring.middle {
          width: 20px;
          height: 20px;
          border-color: rgba(139, 92, 246, 0.3);
          animation: ringPulse 4s ease-in-out infinite 0.5s;
        }

        .portal-ring.inner {
          width: 12px;
          height: 12px;
          border-color: rgba(167, 139, 250, 0.4);
          animation: ringPulse 4s ease-in-out infinite 1s;
        }

        .portal-ring.outer.expanding { width: 320px; height: 320px; }
        .portal-ring.middle.expanding { width: 240px; height: 240px; }
        .portal-ring.inner.expanding { width: 160px; height: 160px; }

        @keyframes ringPulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }

        /* Portal core */
        .portal-core {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 8px;
          height: 8px;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          background: radial-gradient(circle, #fff 0%, rgba(167, 139, 250, 0.8) 30%, rgba(99, 102, 241, 0.6) 60%, transparent 100%);
          box-shadow: 
            0 0 20px rgba(167, 139, 250, 0.8),
            0 0 40px rgba(139, 92, 246, 0.6),
            0 0 60px rgba(99, 102, 241, 0.4);
          opacity: 0;
          transition: all 2s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .portal-core.visible {
          opacity: 1;
        }

        .portal-core.expanding {
          width: 100px;
          height: 100px;
          box-shadow: 
            0 0 40px rgba(167, 139, 250, 0.9),
            0 0 80px rgba(139, 92, 246, 0.7),
            0 0 120px rgba(99, 102, 241, 0.5),
            0 0 200px rgba(79, 70, 229, 0.3);
        }

        /* Energy waves */
        .energy-wave {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          border-radius: 50%;
          border: 1px solid rgba(167, 139, 250, 0.5);
          opacity: 0;
        }

        .energy-wave.active {
          animation: waveExpand 3s ease-out infinite;
        }

        .wave-1 { animation-delay: 0s; }
        .wave-2 { animation-delay: 1s; }
        .wave-3 { animation-delay: 2s; }

        @keyframes waveExpand {
          0% {
            width: 100px;
            height: 100px;
            opacity: 0.6;
          }
          100% {
            width: 500px;
            height: 500px;
            opacity: 0;
          }
        }

        /* Text */
        .portal-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          z-index: 10;
          opacity: 0;
          transition: opacity 0.8s ease, transform 0.8s ease;
        }

        .portal-text.visible {
          opacity: 1;
        }

        .text-line {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
          font-weight: 300;
          font-size: clamp(24px, 4vw, 40px);
          color: rgba(255, 255, 255, 0.9);
          letter-spacing: 0.05em;
          line-height: 1.4;
        }

        .text-highlight {
          font-weight: 500;
          font-size: clamp(32px, 5vw, 56px);
          background: linear-gradient(135deg, #fff 0%, #a78bfa 50%, #818cf8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: none;
          filter: drop-shadow(0 0 30px rgba(139, 92, 246, 0.5));
        }

        /* Vignette */
        .vignette {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at center, transparent 0%, transparent 50%, rgba(0, 0, 0, 0.4) 100%);
          pointer-events: none;
        }

        /* Reduced motion */
        @media (prefers-reduced-motion: reduce) {
          .star,
          .portal-ring,
          .energy-wave,
          .orbital-particle {
            animation: none;
          }
          
          .portal-glow,
          .portal-core,
          .portal-ring,
          .portal-text {
            transition-duration: 0.1s;
          }
        }
      `}</style>
    </>
  );
}
