'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

import LearningPathPanel from '@/components/live-intelligence/LearningPathPanel';
import LaserFooter from '@/components/user/LaserFooter';

/**
 * 🌌 LEARNING UNIVERSE - MAGICAL PORTAL ENTRY
 * 
 * This is NOT a dashboard. This is NOT a navigation tab.
 * This is an immersive experience where users ENTER a new world.
 * 
 * Entry sequence:
 * 1. Portal gate (full-screen, no distractions)
 * 2. "Begin the Journey" interaction
 * 3. Transition animation (blur → stars → reveal)
 * 4. Learning universe revealed
 */

export default function LearnPage() {
  const [mounted, setMounted] = useState(false);
  const [portalPhase, setPortalPhase] = useState('gate'); // 'gate' | 'transitioning' | 'entered'
  const [starOpacity, setStarOpacity] = useState(0);

  useEffect(() => {
    setMounted(true);

    // Check if user has already entered today (optional: remember entry)
    const hasEntered = sessionStorage.getItem('learn_portal_entered');
    if (hasEntered === 'true') {
      setPortalPhase('entered');
    }

    // Match the laser/live-intelligence scoping so styles remain consistent.
    if (typeof document !== 'undefined' && document.body) {
      document.body.setAttribute('data-laser-active', 'true');
    }
    if (typeof document !== 'undefined' && document.documentElement) {
      document.documentElement.setAttribute('data-laser-active', 'true');
    }

    return () => {
      if (typeof document !== 'undefined' && document.body) {
        document.body.removeAttribute('data-laser-active');
      }
      if (typeof document !== 'undefined' && document.documentElement) {
        document.documentElement.removeAttribute('data-laser-active');
      }
    };
  }, []);

  const handleBeginJourney = useCallback(() => {
    setPortalPhase('transitioning');
    setStarOpacity(1);

    // After transition animation, reveal the learning universe
    setTimeout(() => {
      setPortalPhase('entered');
      sessionStorage.setItem('learn_portal_entered', 'true');
    }, 1800);
  }, []);

  const handleExitUniverse = useCallback(() => {
    sessionStorage.removeItem('learn_portal_entered');
    setPortalPhase('gate');
    setStarOpacity(0);
  }, []);

  if (!mounted) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#050608',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'rgba(170, 198, 255, 0.4)',
          fontSize: '14px',
        }}
      >
        <div style={{ animation: 'pulse 2s ease-in-out infinite' }}>✨</div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // PORTAL GATE - The magical entry point
  // ═══════════════════════════════════════════════════════════════
  if (portalPhase === 'gate' || portalPhase === 'transitioning') {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: '#050608',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          overflow: 'hidden',
          zIndex: 9999,
        }}
      >
        {/* Starfield background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `
              radial-gradient(2px 2px at 20% 30%, rgba(255,255,255,0.8) 0%, transparent 100%),
              radial-gradient(2px 2px at 40% 70%, rgba(200,220,255,0.6) 0%, transparent 100%),
              radial-gradient(1px 1px at 60% 20%, rgba(255,255,255,0.5) 0%, transparent 100%),
              radial-gradient(2px 2px at 80% 50%, rgba(180,200,255,0.7) 0%, transparent 100%),
              radial-gradient(1px 1px at 10% 80%, rgba(255,255,255,0.4) 0%, transparent 100%),
              radial-gradient(1.5px 1.5px at 90% 10%, rgba(200,220,255,0.5) 0%, transparent 100%),
              radial-gradient(1px 1px at 50% 90%, rgba(255,255,255,0.3) 0%, transparent 100%),
              radial-gradient(2px 2px at 30% 50%, rgba(180,200,255,0.4) 0%, transparent 100%)
            `,
            opacity: portalPhase === 'transitioning' ? 1 : 0.3,
            transition: 'opacity 1.2s ease',
            animation: portalPhase === 'transitioning' ? 'starPulse 0.8s ease-in-out infinite' : 'none',
          }}
        />

        {/* Radial glow */}
        <div
          style={{
            position: 'absolute',
            width: '600px',
            height: '600px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(80,120,200,0.15) 0%, rgba(40,60,120,0.05) 40%, transparent 70%)',
            opacity: portalPhase === 'transitioning' ? 1 : 0.5,
            transition: 'opacity 1s ease, transform 1.5s ease',
            transform: portalPhase === 'transitioning' ? 'scale(2.5)' : 'scale(1)',
          }}
        />

        {/* Portal content */}
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            textAlign: 'center',
            maxWidth: '480px',
            opacity: portalPhase === 'transitioning' ? 0 : 1,
            transform: portalPhase === 'transitioning' ? 'scale(0.9) translateY(-20px)' : 'scale(1) translateY(0)',
            transition: 'opacity 0.8s ease, transform 0.8s ease',
          }}
        >
          {/* Icon */}
          <div
            style={{
              fontSize: '48px',
              marginBottom: '24px',
              filter: 'drop-shadow(0 0 20px rgba(140,180,255,0.4))',
            }}
          >
            ✨
          </div>

          {/* Title */}
          <h1
            style={{
              fontSize: '24px',
              fontWeight: 700,
              color: 'rgba(235, 242, 255, 0.95)',
              marginBottom: '16px',
              lineHeight: 1.3,
            }}
          >
            You are about to enter<br />a learning universe
          </h1>

          {/* Subtitle */}
          <p
            style={{
              fontSize: '15px',
              color: 'rgba(180, 200, 230, 0.7)',
              marginBottom: '36px',
              lineHeight: 1.6,
            }}
          >
            This is not a course. This is not a syllabus.<br />
            This changes how you think forever.
          </p>

          {/* Begin button */}
          <button
            onClick={handleBeginJourney}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              padding: '16px 32px',
              borderRadius: '16px',
              border: '1px solid rgba(140, 180, 255, 0.3)',
              background: 'linear-gradient(135deg, rgba(80, 120, 200, 0.2), rgba(60, 100, 180, 0.1))',
              color: 'rgba(235, 242, 255, 0.95)',
              fontSize: '16px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 8px 32px rgba(80, 120, 200, 0.2)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.borderColor = 'rgba(140, 180, 255, 0.5)';
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(80, 120, 200, 0.3), rgba(60, 100, 180, 0.15))';
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 12px 40px rgba(80, 120, 200, 0.3)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.borderColor = 'rgba(140, 180, 255, 0.3)';
              e.currentTarget.style.background = 'linear-gradient(135deg, rgba(80, 120, 200, 0.2), rgba(60, 100, 180, 0.1))';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 8px 32px rgba(80, 120, 200, 0.2)';
            }}
          >
            <span>Begin the Journey</span>
            <span style={{ fontSize: '18px' }}>→</span>
          </button>

          {/* Back link - subtle */}
          <div style={{ marginTop: '32px' }}>
            <Link
              href="/live-intelligence"
              style={{
                fontSize: '13px',
                color: 'rgba(180, 200, 230, 0.4)',
                textDecoration: 'none',
                transition: 'color 0.2s ease',
              }}
              onMouseOver={(e) => e.currentTarget.style.color = 'rgba(180, 200, 230, 0.7)'}
              onMouseOut={(e) => e.currentTarget.style.color = 'rgba(180, 200, 230, 0.4)'}
            >
              ← I'm not ready yet
            </Link>
          </div>
        </div>

        {/* CSS animations */}
        <style jsx global>{`
          @keyframes starPulse {
            0%, 100% { opacity: 0.8; }
            50% { opacity: 1; }
          }
          @keyframes pulse {
            0%, 100% { opacity: 0.4; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.2); }
          }
        `}</style>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // LEARNING UNIVERSE - The actual learning experience
  // ═══════════════════════════════════════════════════════════════
  return (
    <div
      style={{
        minHeight: '100vh',
        paddingTop: 'calc(80px + env(safe-area-inset-top, 0px))', // Account for navbar height
        background: '#090A0C',
        color: 'rgba(235, 242, 255, 0.95)',
        overflowX: 'hidden',
        animation: 'fadeIn 0.8s ease',
      }}
    >
      {/* Minimal header - no navbar clutter */}
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          padding: '24px 16px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '20px' }}>✨</span>
          <span style={{ fontSize: '15px', fontWeight: 600, color: 'rgba(235, 242, 255, 0.9)' }}>
            Learning Universe
          </span>
        </div>

        <button
          onClick={handleExitUniverse}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '10px',
            border: '1px solid rgba(170, 198, 255, 0.15)',
            background: 'rgba(0, 0, 0, 0.2)',
            color: 'rgba(180, 200, 230, 0.7)',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = 'rgba(170, 198, 255, 0.3)';
            e.currentTarget.style.color = 'rgba(180, 200, 230, 0.9)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = 'rgba(170, 198, 255, 0.15)';
            e.currentTarget.style.color = 'rgba(180, 200, 230, 0.7)';
          }}
        >
          <span>←</span>
          <span>Exit Universe</span>
        </button>
      </div>

      {/* Learning content */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '8px 16px 22px' }}>
        <LearningPathPanel />
      </div>

      {/* LaserFooter - proper wrapper */}
      <div
        className="li-footer-wrapper"
        style={{
          display: 'block',
          visibility: 'visible',
          opacity: 1,
          position: 'relative',
          zIndex: 100,
          width: '100%',
          marginTop: '20px',
          background: '#090A0C',
        }}
      >
        <LaserFooter inLiveOverlay={true} />
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
