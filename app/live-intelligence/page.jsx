'use client';

/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  🔒 LOCKED FILE - /live-intelligence PAGE                                    ║
 * ║  Last Updated: February 14, 2026                                              ║
 * ║                                                                               ║
 * ║  IF YOU BREAK THIS FILE:                                                      ║
 * ║  Copy-Item "backup\live-intelligence-locked-2026-01-15\page.jsx" "app\live-intelligence\" -Force ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LiveIntelligencePanel } from '@/components/user/LiveIntelligenceOverlay';
import LaserFooter from '@/components/user/LaserFooter';
import Link from 'next/link';

/* ─── Cinematic Hero with fog / smoke / glow ─── */
function CinematicVideoHero() {
  const videoRef = useRef(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onReady = () => setVideoLoaded(true);
    v.addEventListener('canplay', onReady);
    // If already loaded (cached)
    if (v.readyState >= 3) setVideoLoaded(true);
    return () => v.removeEventListener('canplay', onReady);
  }, []);

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: 'clamp(340px, 55vh, 520px)' }}
    >
      {/* ── Video layer ── */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        poster="/live-intel-poster.jpg"
        src="/live-intel-bg.mp4"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          opacity: videoLoaded ? 1 : 0,
          transition: 'opacity 1.6s cubic-bezier(0.16,1,0.3,1)',
          willChange: 'opacity',
        }}
      />

      {/* ── Poster fallback (shown until video plays) ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: 'url(/live-intel-poster.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: videoLoaded ? 0 : 1,
          transition: 'opacity 1.2s ease',
        }}
        aria-hidden="true"
      />

      {/* ── Fog / smoke layers ── */}
      {/* Top fog sweep */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(9,10,12,0.92) 0%, rgba(9,10,12,0.35) 35%, transparent 55%)',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />
      {/* Bottom fade into page */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(0deg, #090A0C 0%, rgba(9,10,12,0.85) 18%, transparent 50%)',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />
      {/* Side vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 120% 100% at 50% 50%, transparent 40%, rgba(9,10,12,0.8) 100%)',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />

      {/* ── Animated smoke wisps (CSS-only, no JS overhead) ── */}
      <style>{`
        @keyframes li-drift-a { 0%{transform:translateX(-25%) scaleX(1.3)} 50%{transform:translateX(10%) scaleX(1)} 100%{transform:translateX(-25%) scaleX(1.3)} }
        @keyframes li-drift-b { 0%{transform:translateX(20%) scaleX(1)} 50%{transform:translateX(-15%) scaleX(1.2)} 100%{transform:translateX(20%) scaleX(1)} }
        @keyframes li-pulse   { 0%{opacity:0.25} 50%{opacity:0.55} 100%{opacity:0.25} }
        @keyframes li-glow    { 0%{opacity:0;transform:translateY(8px) scale(0.96)} 100%{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes li-line-expand { 0%{width:0} 100%{width:80px} }
        .li-smoke-a { animation: li-drift-a 18s ease-in-out infinite, li-pulse 12s ease-in-out infinite; }
        .li-smoke-b { animation: li-drift-b 22s ease-in-out infinite, li-pulse 15s ease-in-out infinite 3s; }
        .li-hero-glow { animation: li-glow 1.8s cubic-bezier(0.16,1,0.3,1) forwards; }
        .li-hero-glow-delay { animation: li-glow 1.8s cubic-bezier(0.16,1,0.3,1) 0.3s forwards; opacity: 0; }
        .li-hero-glow-delay2 { animation: li-glow 1.8s cubic-bezier(0.16,1,0.3,1) 0.6s forwards; opacity: 0; }
        .li-hero-glow-delay3 { animation: li-glow 1.8s cubic-bezier(0.16,1,0.3,1) 0.9s forwards; opacity: 0; }
        .li-line-anim { animation: li-line-expand 2s cubic-bezier(0.16,1,0.3,1) 1.2s forwards; width: 0; }
      `}</style>

      {/* Smoke wisp A */}
      <div
        className="li-smoke-a"
        style={{
          position: 'absolute',
          bottom: '5%',
          left: '-10%',
          width: '130%',
          height: '45%',
          background: 'radial-gradient(ellipse at center, rgba(120,180,255,0.08) 0%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />
      {/* Smoke wisp B */}
      <div
        className="li-smoke-b"
        style={{
          position: 'absolute',
          top: '10%',
          left: '-5%',
          width: '110%',
          height: '40%',
          background: 'radial-gradient(ellipse at center, rgba(100,160,255,0.06) 0%, transparent 65%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />

      {/* ── Glowing edge line ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '1px',
          background: 'linear-gradient(90deg, transparent 5%, rgba(120,180,255,0.35) 30%, rgba(120,180,255,0.5) 50%, rgba(120,180,255,0.35) 70%, transparent 95%)',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />
      {/* Glow bloom behind the line */}
      <div
        style={{
          position: 'absolute',
          bottom: '-6px',
          left: '10%',
          right: '10%',
          height: '12px',
          background: 'radial-gradient(ellipse at center, rgba(120,180,255,0.2) 0%, transparent 80%)',
          filter: 'blur(8px)',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      />

      {/* ── Hero text content ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 30,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          padding: '0 24px',
        }}
      >
        <div
          className="li-hero-glow"
          style={{
            fontSize: '10px',
            letterSpacing: '0.5em',
            textTransform: 'uppercase',
            fontWeight: 600,
            color: 'rgba(120,180,255,0.7)',
            marginBottom: '16px',
          }}
        >
          Real-time market pulse
        </div>

        <h1
          className="li-hero-glow-delay"
          style={{
            fontFamily: 'inherit',
            fontSize: 'clamp(28px, 5.5vw, 52px)',
            fontWeight: 300,
            lineHeight: 1.1,
            letterSpacing: '-0.03em',
            color: 'rgba(235,242,255,0.95)',
            margin: 0,
            maxWidth: '700px',
          }}
        >
          Live Intelligence
        </h1>

        <div
          className="li-line-anim"
          style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, rgba(120,180,255,0.6), transparent)',
            margin: '20px auto',
          }}
          aria-hidden="true"
        />

        <p
          className="li-hero-glow-delay3"
          style={{
            fontSize: 'clamp(13px, 1.8vw, 16px)',
            fontWeight: 300,
            lineHeight: 1.9,
            letterSpacing: '0.04em',
            color: 'rgba(235,242,255,0.5)',
            maxWidth: '520px',
            margin: 0,
          }}
        >
          Market mood, index snapshots, and curated analysis — updated continuously.
        </p>
      </div>
    </section>
  );
}

export default function LiveIntelligencePage() {
  const router = useRouter();

  useEffect(() => {
    // Force top-of-page on entry so the sticky close button is visible.
    // Also disable scroll restoration while on this route (Next/browser can restore last scroll).
    let prevRestoration;
    try {
      if (typeof window !== 'undefined' && 'history' in window) {
        prevRestoration = window.history.scrollRestoration;
        window.history.scrollRestoration = 'manual';
      }
    } catch {}
    try {
      if (typeof window !== 'undefined') {
        window.scrollTo(0, 0);
        window.requestAnimationFrame(() => window.scrollTo(0, 0));
      }
    } catch {}

    // Some embedded widgets can steal focus and cause an initial scroll jump.
    // Guard for the first moment after mount.
    let guardTimer;
    const startedAt = Date.now();
    const onScrollGuard = () => {
      if (Date.now() - startedAt > 900) return;
      try {
        if (typeof window !== 'undefined' && window.scrollY > 0) {
          window.scrollTo(0, 0);
        }
      } catch {}
    };
    try {
      if (typeof window !== 'undefined') {
        window.addEventListener('scroll', onScrollGuard, { passive: true });
        guardTimer = window.setTimeout(() => {
          try {
            window.removeEventListener('scroll', onScrollGuard);
          } catch {}
        }, 950);
      }
    } catch {}

    // Set body attribute for consistent styling (hides mobile dock, etc.)
    if (typeof document !== 'undefined' && document.body) {
      document.body.setAttribute('data-laser-active', 'true');
    }
    // Also set on <html> to reliably scope scrollbar styling (some browsers scroll the root element)
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.setAttribute('data-laser-active', 'true');
    }
    return () => {
      try {
        if (typeof window !== 'undefined') {
          if (guardTimer) window.clearTimeout(guardTimer);
          window.removeEventListener('scroll', onScrollGuard);
        }
      } catch {}

      if (typeof document !== 'undefined' && document.body) {
        document.body.removeAttribute('data-laser-active');
      }
      if (typeof document !== 'undefined' && document.documentElement) {
        document.documentElement.removeAttribute('data-laser-active');
      }

      try {
        if (typeof window !== 'undefined' && prevRestoration) {
          window.history.scrollRestoration = prevRestoration;
        }
      } catch {}
    };
  }, []);

  // Handle the back/close button - navigate to home
  const handleClose = () => {
    router.push('/');
  };

  return (
    <div
      className="li-page-wrapper"
      style={{
        minHeight: '100vh',
        paddingTop: 'env(safe-area-inset-top, 0px)',
        background: '#090A0C',
        color: 'rgba(235, 242, 255, 0.95)',
        overflowX: 'hidden',
      }}
    >
      {/* Cinematic video hero at the top */}
      <CinematicVideoHero />

      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '14px 12px 0',
          position: 'relative',
          zIndex: 200,
        }}
      >
        {/* Intentionally blank: no learning widgets on /live-intelligence */}
      </div>

      {/* Render the EXACT same panel as the overlay */}
      <LiveIntelligencePanel onClose={handleClose} />

      {/* LaserFooter - the SAME ice-blue themed footer used by the overlay */}
      <div
        className="li-footer-wrapper"
        style={{
          display: 'block',
          visibility: 'visible',
          opacity: 1,
          position: 'relative',
          zIndex: 100,
          width: '100%',
          marginTop: 0,
          background: '#090A0C',
        }}
      >
        <LaserFooter onHomeClick={handleClose} inLiveOverlay={true} />
      </div>
    </div>
  );
}
