'use client';

/**
 * MarketMoodIndicator - Global market sentiment display
 * Shows what the market is saying - similar to Bloomberg/Reuters style
 * 
 * @file components/live-intelligence/MarketMoodIndicator.jsx
 */

import { useState, useEffect, useMemo, useRef } from 'react';
import { useAnimation } from '@/hooks/useAnimation';
import { LiveBadge } from '@/components/LiveBadge';

// Market mood levels with colors (laser blue theme - NO gold/tan/orange)
const MOOD_LEVELS = {
  'very_bullish': {
    label: 'Very Bullish',
    color: 'rgba(100, 220, 140, 0.95)',
    bgColor: 'rgba(100, 220, 140, 0.12)',
    borderColor: 'rgba(100, 220, 140, 0.25)',
    description: 'Strong positive sentiment - markets charging ahead',
  },
  'bullish': {
    label: 'Bullish',
    color: 'rgba(120, 200, 160, 0.95)',
    bgColor: 'rgba(120, 200, 160, 0.10)',
    borderColor: 'rgba(120, 200, 160, 0.20)',
    description: 'Positive outlook - investors feeling confident',
  },
  'cautiously_optimistic': {
    label: 'Cautiously Optimistic',
    color: 'rgba(140, 190, 255, 0.95)',
    bgColor: 'rgba(140, 190, 255, 0.10)',
    borderColor: 'rgba(140, 190, 255, 0.20)',
    description: 'Careful optimism - watching for confirmation',
  },
  'neutral': {
    label: 'Neutral',
    color: 'rgba(180, 195, 220, 0.85)',
    bgColor: 'rgba(180, 195, 220, 0.08)',
    borderColor: 'rgba(180, 195, 220, 0.15)',
    description: 'Markets digesting information - no clear direction',
  },
  'cautious': {
    label: 'Cautious',
    color: 'rgba(180, 160, 220, 0.95)',
    bgColor: 'rgba(180, 160, 220, 0.10)',
    borderColor: 'rgba(180, 160, 220, 0.20)',
    description: 'Uncertainty rising - investors pulling back',
  },
  'bearish': {
    label: 'Bearish',
    color: 'rgba(255, 140, 140, 0.95)',
    bgColor: 'rgba(255, 140, 140, 0.10)',
    borderColor: 'rgba(255, 140, 140, 0.20)',
    description: 'Negative sentiment - risk-off mode active',
  },
};

function MoodIcon({ color = 'rgba(200,215,240,0.8)' }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 19V5" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 19V11" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M12 19V8" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M16 19V13" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <path d="M20 19V6" stroke={color} strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function MarketMoodIndicator() {
  const [mood, setMood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [history, setHistory] = useState([]);
  const [moodError, setMoodError] = useState(null);
  const refreshTimerRef = useRef(null);
  const { prefersReducedMotion } = useAnimation();

  const scoreForLevel = useMemo(
    () => ({
      very_bullish: 0.9,
      bullish: 0.75,
      cautiously_optimistic: 0.6,
      neutral: 0.5,
      cautious: 0.4,
      bearish: 0.2,
    }),
    []
  );

  // Spark polyline points - MUST be called before any early returns (Rules of Hooks)
  const spark = useMemo(() => {
    const pts = Array.isArray(history) ? history : [];
    const n = pts.length;
    if (n === 0) return '';
    const w = 120;
    const h = 24;
    const pad = 2;
    return pts
      .map((v, i) => {
        const x = n === 1 ? w / 2 : (i / (n - 1)) * w;
        const y = pad + (1 - Math.max(0, Math.min(1, v))) * (h - pad * 2);
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(' ');
  }, [history]);

  // Trend UI - MUST be called before any early returns (Rules of Hooks)
  const trendUi = useMemo(() => {
    const pts = Array.isArray(history) ? history : [];
    if (pts.length < 2) return { label: 'Awaiting', dir: 'flat' };
    const a = pts[pts.length - 2];
    const b = pts[pts.length - 1];
    const delta = b - a;
    if (delta > 0.05) return { label: 'Rising', dir: 'up' };
    if (delta < -0.05) return { label: 'Falling', dir: 'down' };
    return { label: 'Stable', dir: 'flat' };
  }, [history]);

  useEffect(() => {
    fetchMarketMood();
    // Lightweight refresh so time + sparkline stays meaningful
    refreshTimerRef.current = window.setInterval(fetchMarketMood, 60 * 1000);
    return () => {
      if (refreshTimerRef.current) window.clearInterval(refreshTimerRef.current);
      refreshTimerRef.current = null;
    };
    
  }, []);

  const fetchMarketMood = async () => {
    try {
      const response = await fetch('/api/live-intelligence/mood', { cache: 'no-store' });

      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        const msg = String(data?.error || `mood_unavailable_${response.status}`);
        setMoodError(msg);
        // Keep previous mood if we have one; otherwise show unavailable.
        setMood((prev) =>
          prev || {
            level: 'neutral',
            summary: 'Live mood unavailable',
            factors: [],
            lastUpdated: new Date().toISOString(),
          }
        );
        return;
      }

      if (data?.success && data?.mood) {
        setMoodError(null);
        // Map API mood_type to our level
        const levelMap = {
          bullish: 'bullish',
          very_bullish: 'very_bullish',
          bearish: 'bearish',
          volatile: 'cautious',
          mixed: 'neutral',
          neutral: 'neutral',
          cautiously_optimistic: 'cautiously_optimistic',
        };

        const lvl = levelMap[data.mood.mood_type] || 'neutral';

        setMood({
          level: lvl,
          summary: data.mood.mood_text || 'Market data loading...',
          factors: [],
          lastUpdated: data.mood.generated_at || data.mood.created_at || new Date().toISOString(),
        });

        const score = scoreForLevel[lvl] ?? 0.5;
        setHistory((prev) => {
          const next = [...(Array.isArray(prev) ? prev : []), score];
          return next.slice(-12);
        });
      } else {
        setMoodError('invalid_mood_payload');
        setMood((prev) =>
          prev || {
            level: 'neutral',
            summary: 'Live mood unavailable',
            factors: [],
            lastUpdated: new Date().toISOString(),
          }
        );
      }
    } catch (error) {
      setMoodError(String(error?.message || 'unavailable'));
      setMood((prev) =>
        prev || {
          level: 'neutral',
          summary: 'Live mood unavailable',
          factors: [],
          lastUpdated: new Date().toISOString(),
        }
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        background: 'rgba(20, 30, 50, 0.6)',
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '16px',
        border: '1px solid rgba(100, 160, 255, 0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: 'rgba(100, 160, 255, 0.3)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }} />
          <span style={{ color: 'rgba(180, 195, 220, 0.6)', fontSize: '14px' }}>
            Loading market mood...
          </span>
        </div>
      </div>
    );
  }

  if (!mood) return null;

  const moodConfig = MOOD_LEVELS[mood.level] || MOOD_LEVELS.neutral;
  const score = scoreForLevel[mood.level] ?? 0.5;
  const needlePct = Math.max(0, Math.min(100, Math.round(score * 100)));

  return (
    <div 
      style={{
        background: `linear-gradient(135deg, ${moodConfig.bgColor} 0%, rgba(20, 30, 50, 0.6) 100%)`,
        borderRadius: '12px',
        padding: '16px 20px',
        marginBottom: '16px',
        border: `1px solid ${moodConfig.borderColor}`,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
      }}
      onClick={() => setExpanded(!expanded)}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = moodConfig.color;
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = moodConfig.borderColor;
      }}
    >
      {/* Header Row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span
            style={{
              width: 34,
              height: 34,
              borderRadius: 12,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(10,10,12,0.45)',
              border: `1px solid ${moodConfig.borderColor}`,
              boxShadow: `0 0 0 4px ${moodConfig.bgColor}`,
              flex: '0 0 auto',
            }}
            aria-hidden="true"
          >
            <MoodIcon color={moodConfig.color} />
          </span>
          <div>
            <div style={{
              fontSize: '10px',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'rgba(180, 195, 220, 0.55)',
              marginBottom: '2px',
            }}>
              Market Mood
            </div>
            <div style={{
              fontSize: '16px',
              fontWeight: 600,
              color: moodConfig.color,
            }}>
              {moodConfig.label}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          <LiveBadge lastUpdate={mood.lastUpdated || new Date().toISOString()} />
          <div
            style={{
              fontSize: '18px',
              color: 'rgba(180, 195, 220, 0.4)',
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.2s ease',
              lineHeight: 1,
            }}
          >
            ▼
          </div>
        </div>
      </div>

      {/* Gauge */}
      <div style={{
        marginTop: '10px',
        position: 'relative',
        height: '10px',
        borderRadius: '999px',
        overflow: 'hidden',
        background: 'rgba(100, 160, 255, 0.08)',
        border: '1px solid rgba(100, 160, 255, 0.12)',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, rgba(255,140,140,0.55) 0%, rgba(140,190,255,0.45) 50%, rgba(100,220,140,0.55) 100%)',
        }} />

        <div style={{
          position: 'absolute',
          left: `${needlePct}%`,
          top: -6,
          width: 0,
          height: 0,
          transform: 'translateX(-50%)',
          transition: prefersReducedMotion ? 'none' : 'left 600ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        }} aria-hidden="true">
          <div style={{
            width: '2px',
            height: '22px',
            borderRadius: '2px',
            background: moodConfig.color,
            boxShadow: `0 0 12px ${moodConfig.borderColor}`,
          }} />
        </div>
      </div>

      {/* Summary - always visible */}
      <p style={{
        color: 'rgba(220, 235, 255, 0.75)',
        fontSize: '13px',
        margin: '10px 0 0',
        lineHeight: 1.5,
      }}>
        {mood.summary || moodConfig.description}
      </p>

      {/* Sparkline */}
      <div style={{
        marginTop: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px',
      }}>
        <div style={{
          fontSize: '10px',
          color: 'rgba(180, 195, 220, 0.45)',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }} title="Educational indicator; not investment advice">
          Trend · {trendUi.label}
        </div>
        <svg width="120" height="24" viewBox="0 0 120 24" aria-hidden="true" style={{ opacity: 0.9 }}>
          <polyline
            points={spark}
            fill="none"
            stroke={moodConfig.color}
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
            style={{
              filter: `drop-shadow(0 0 6px ${moodConfig.borderColor})`,
              transition: prefersReducedMotion ? 'none' : 'stroke 300ms ease',
            }}
          />
        </svg>
      </div>

      <div style={{ marginTop: '10px', color: 'rgba(200,215,240,0.45)', fontSize: '11px', lineHeight: 1.35 }}>
        Educational context only — not investment advice.
      </div>

      {/* Expanded Section */}
      {expanded && mood.factors && mood.factors.length > 0 && (
        <div style={{
          marginTop: '14px',
          paddingTop: '14px',
          borderTop: '1px solid rgba(100, 160, 255, 0.1)',
        }}>
          <div style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: 'rgba(140, 180, 255, 0.6)',
            marginBottom: '8px',
          }}>
            Key Factors
          </div>
          <ul style={{
            margin: 0,
            padding: 0,
            listStyle: 'none',
          }}>
            {mood.factors.map((factor, idx) => (
              <li key={idx} style={{
                color: 'rgba(200, 215, 240, 0.75)',
                fontSize: '12px',
                padding: '4px 0',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
              }}>
                <span style={{ color: moodConfig.color }}>•</span>
                {factor}
              </li>
            ))}
          </ul>
          
          {mood.lastUpdated && (
            <div style={{
              marginTop: '12px',
              fontSize: '10px',
              color: 'rgba(180, 195, 220, 0.4)',
            }}>
              Last updated: {new Date(mood.lastUpdated).toLocaleTimeString('en-IN', { 
                hour: '2-digit', 
                minute: '2-digit',
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
