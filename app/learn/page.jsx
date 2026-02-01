'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';

import LearningPathPanel from '@/components/live-intelligence/LearningPathPanel';
import LaserFooter from '@/components/user/LaserFooter';

/**
 * �️ THE WEALTH GUILD - Entry Experience
 * 
 * ARCHITECTURE RULE: This is an ENTRY SHELL only.
 * LearningPathPanel is rendered as a pure engine - UNTOUCHED.
 * 
 * Entry sequence:
 * 1. First visit: Show guild entry screen
 * 2. User clicks "Enter"
 * 3. Subtle fade transition (max 1.5s)
 * 4. LearningPathPanel revealed
 * 
 * Subsequent visits: Skip entry, show LearningPathPanel directly
 * 
 * Storage key: wealth_guild_entered (localStorage)
 */

const GUILD_ENTRY_KEY = 'wealth_guild_entered';

export default function LearnPage() {
  const [mounted, setMounted] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Check if user has already entered the guild (persists across sessions)
    const entered = localStorage.getItem(GUILD_ENTRY_KEY);
    if (entered === 'true') {
      setHasEntered(true);
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

  const handleEnterGuild = useCallback(() => {
    setIsTransitioning(true);

    // Subtle transition - max 1.5s as required
    setTimeout(() => {
      setHasEntered(true);
      localStorage.setItem(GUILD_ENTRY_KEY, 'true');
    }, 1200);
  }, []);

  if (!mounted) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: '#08090B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div style={{ color: 'rgba(160, 175, 200, 0.4)', fontSize: '13px' }}>
          Loading...
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // GUILD ENTRY SCREEN - First visit only
  // ═══════════════════════════════════════════════════════════════
  if (!hasEntered) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: '#08090B',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          overflow: 'hidden',
          zIndex: 9999,
          opacity: isTransitioning ? 0 : 1,
          transform: isTransitioning ? 'scale(1.02)' : 'scale(1)',
          transition: 'opacity 1.2s ease, transform 1.2s ease',
        }}
      >
        {/* Subtle ambient glow */}
        <div
          style={{
            position: 'absolute',
            width: '500px',
            height: '500px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(70,90,130,0.08) 0%, transparent 60%)',
            pointerEvents: 'none',
          }}
        />

        {/* Guild crest / icon */}
        <div
          style={{
            fontSize: '36px',
            marginBottom: '28px',
            opacity: 0.9,
          }}
        >
          🏛️
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: '28px',
            fontWeight: 600,
            color: 'rgba(230, 235, 245, 0.95)',
            marginBottom: '12px',
            letterSpacing: '0.02em',
            textAlign: 'center',
          }}
        >
          The Wealth Guild
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: '15px',
            color: 'rgba(160, 175, 200, 0.65)',
            marginBottom: '40px',
            textAlign: 'center',
            maxWidth: '320px',
            lineHeight: 1.5,
          }}
        >
          A place to understand money without noise.
        </p>

        {/* Enter button */}
        <button
          onClick={handleEnterGuild}
          disabled={isTransitioning}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '14px 36px',
            borderRadius: '12px',
            border: '1px solid rgba(140, 160, 200, 0.2)',
            background: 'rgba(60, 80, 120, 0.12)',
            color: 'rgba(220, 230, 245, 0.9)',
            fontSize: '15px',
            fontWeight: 500,
            cursor: isTransitioning ? 'default' : 'pointer',
            transition: 'all 0.25s ease',
            opacity: isTransitioning ? 0.5 : 1,
          }}
          onMouseOver={(e) => {
            if (!isTransitioning) {
              e.currentTarget.style.borderColor = 'rgba(140, 160, 200, 0.35)';
              e.currentTarget.style.background = 'rgba(60, 80, 120, 0.18)';
            }
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = 'rgba(140, 160, 200, 0.2)';
            e.currentTarget.style.background = 'rgba(60, 80, 120, 0.12)';
          }}
        >
          Enter
        </button>

        {/* Back link - very subtle */}
        <div style={{ marginTop: '36px' }}>
          <Link
            href="/live-intelligence"
            style={{
              fontSize: '12px',
              color: 'rgba(140, 155, 180, 0.4)',
              textDecoration: 'none',
              transition: 'color 0.2s ease',
            }}
            onMouseOver={(e) => e.currentTarget.style.color = 'rgba(140, 155, 180, 0.6)'}
            onMouseOut={(e) => e.currentTarget.style.color = 'rgba(140, 155, 180, 0.4)'}
          >
            ← back to live intelligence
          </Link>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════════════
  // GUILD INTERIOR - LearningPathPanel rendered EXACTLY as-is
  // ═══════════════════════════════════════════════════════════════
  return (
    <div
      style={{
        minHeight: '100vh',
        paddingTop: 'calc(80px + env(safe-area-inset-top, 0px))',
        background: '#090A0C',
        color: 'rgba(235, 242, 255, 0.95)',
        overflowX: 'hidden',
        animation: 'guildFadeIn 0.6s ease',
      }}
    >
      {/* Minimal header */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '18px', opacity: 0.85 }}>🏛️</span>
          <span style={{ fontSize: '14px', fontWeight: 500, color: 'rgba(200, 210, 230, 0.8)' }}>
            The Wealth Guild
          </span>
        </div>

        <Link
          href="/live-intelligence"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 14px',
            borderRadius: '10px',
            border: '1px solid rgba(150, 170, 200, 0.12)',
            background: 'rgba(0, 0, 0, 0.15)',
            color: 'rgba(160, 175, 200, 0.7)',
            fontSize: '13px',
            fontWeight: 500,
            textDecoration: 'none',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.borderColor = 'rgba(150, 170, 200, 0.25)';
            e.currentTarget.style.color = 'rgba(160, 175, 200, 0.9)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.borderColor = 'rgba(150, 170, 200, 0.12)';
            e.currentTarget.style.color = 'rgba(160, 175, 200, 0.7)';
          }}
        >
          <span>←</span>
          <span>Back</span>
        </Link>
      </div>

      {/* PHASE 2 — Wealth Guild Orientation (UI-only, no engine changes) */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 16px' }}>
        <section
          aria-label="Wealth Guild Orientation"
          style={{
            padding: '16px 16px 14px',
            borderRadius: '16px',
            border: '1px solid rgba(150, 170, 200, 0.12)',
            background:
              'linear-gradient(180deg, rgba(60, 80, 120, 0.10) 0%, rgba(0, 0, 0, 0.06) 100%)',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: '12px' }}>
            <h2
              style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: 600,
                letterSpacing: '0.01em',
                color: 'rgba(235, 242, 255, 0.92)',
              }}
            >
              Welcome to The Wealth Guild
            </h2>
          </div>

          <p
            style={{
              margin: '8px 0 0',
              fontSize: '14px',
              lineHeight: 1.55,
              color: 'rgba(170, 185, 210, 0.78)',
              maxWidth: '780px',
            }}
          >
            This is not a course. There is no finish line.
            <br />
            You explore what matters. It grows as you grow.
          </p>

          {/* Mode framing (copy/layout only — engine preserved) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '10px',
              marginTop: '14px',
            }}
          >
            <div
              style={{
                padding: '12px 12px',
                borderRadius: '14px',
                border: '1px solid rgba(150, 170, 200, 0.10)',
                background: 'rgba(0, 0, 0, 0.18)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span aria-hidden="true" style={{ opacity: 0.9 }}>
                  ⚡
                </span>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'rgba(220, 230, 245, 0.88)',
                    letterSpacing: '0.01em',
                  }}
                >
                  Daily (30s) — Stay sharp
                </div>
              </div>
              <div style={{ marginTop: '6px', fontSize: '12px', color: 'rgba(160, 175, 200, 0.72)' }}>
                A quick, lightweight check-in for consistency.
              </div>
            </div>

            <div
              style={{
                padding: '12px 12px',
                borderRadius: '14px',
                border: '1px solid rgba(150, 170, 200, 0.10)',
                background: 'rgba(0, 0, 0, 0.18)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span aria-hidden="true" style={{ opacity: 0.9 }}>
                  🧠
                </span>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: 'rgba(220, 230, 245, 0.88)',
                    letterSpacing: '0.01em',
                  }}
                >
                  Explore Freely — Go deep, at your pace
                </div>
              </div>
              <div style={{ marginTop: '6px', fontSize: '12px', color: 'rgba(160, 175, 200, 0.72)' }}>
                Pick what you want, revisit anytime, and linger where it helps.
              </div>
            </div>
          </div>
        </section>

        {/* Subtle divider below orientation panel */}
        <div
          aria-hidden="true"
          style={{
            height: '1px',
            background: 'rgba(150, 170, 200, 0.10)',
            margin: '14px 0 6px',
          }}
        />
      </div>

      {/* LearningPathPanel - RENDERED EXACTLY AS-IS, NO MODIFICATIONS */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '8px 16px 22px' }}>
        <LearningPathPanel />
      </div>

      {/* LaserFooter */}
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
        @keyframes guildFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
