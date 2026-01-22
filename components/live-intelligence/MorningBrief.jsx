'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getCurrentModeConfig, getISTTime } from '@/lib/live-intelligence/modes';
import { trackSummaryView } from '@/lib/live-intelligence/analytics';
import WhatsAppShare from './WhatsAppShare';

const DEFAULT_BRIEF = {
  title: 'Morning Briefing',
  date: new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }),
  globalCues: [
    { text: 'Global markets mixed — risk sentiment cautious', sentiment: 'neutral' },
    { text: 'Watch crude, USD/INR, and key macro prints', sentiment: 'neutral' },
  ],
  keyEvents: [
    { time: '9:00 AM', event: 'Pre-open session (NSE) — volatility check' },
    { time: '9:15 AM', event: 'Market opens — focus on breadth + sector rotation' },
  ],
  sectorWatch: [
    { sector: 'Banking', outlook: 'Track rates + liquidity headlines' },
    { sector: 'IT', outlook: 'Watch USD/INR + US cues' },
  ],
  riskFactors: [
    'Global risk-off headlines may increase gap moves',
    'High IV days can cause whipsaws — position sizing matters',
  ],
  overallTone: 'neutral',
  isLive: false,
};

export default function MorningBrief() {
  const [mode, setMode] = useState(null);
  const [time, setTime] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [brief, setBrief] = useState(DEFAULT_BRIEF);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const trackedRef = useRef(false);

  useEffect(() => {
    const checkMode = () => {
      const currentMode = getCurrentModeConfig();
      setMode(currentMode);
      setTime(getISTTime());
      setIsVisible(currentMode?.key === 'morning_brief');
    };

    checkMode();
    const interval = setInterval(checkMode, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    if (trackedRef.current) return;
    trackedRef.current = true;
    trackSummaryView('morning');
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    let cancelled = false;

    async function fetchBrief() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/live-intelligence/morning-brief', { cache: 'no-store' });
        const data = await res.json();
        if (!cancelled && res.ok && data?.ok && data?.brief) {
          setBrief({ ...DEFAULT_BRIEF, ...data.brief, isLive: Boolean(data?.isLive) });
        } else if (!cancelled) {
          setBrief(DEFAULT_BRIEF);
          setError(data?.error || 'Failed to load morning brief');
        }
      } catch (e) {
        if (!cancelled) {
          setBrief(DEFAULT_BRIEF);
          setError('Unable to load morning brief');
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchBrief();
    const refresh = setInterval(fetchBrief, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(refresh);
    };
  }, [isVisible]);

  const tonePill = useMemo(() => {
    const tone = String(brief?.overallTone || 'neutral');
    const map = {
      optimistic: { label: 'Optimistic', bg: 'rgba(100, 220, 150, 0.12)', border: 'rgba(100, 220, 150, 0.30)', color: 'rgba(100, 220, 150, 0.95)' },
      cautious: { label: 'Cautious', bg: 'rgba(255, 190, 80, 0.10)', border: 'rgba(255, 190, 80, 0.28)', color: 'rgba(255, 210, 130, 0.92)' },
      neutral: { label: 'Neutral', bg: 'rgba(120, 150, 200, 0.10)', border: 'rgba(120, 150, 200, 0.26)', color: 'rgba(170, 198, 255, 0.90)' },
    };
    return map[tone] || map.neutral;
  }, [brief?.overallTone]);

  if (!isVisible || !mode) return null;

  return (
    <div style={{ gridColumn: '1 / -1' }}>
      <div
        style={{
          padding: '18px 18px 16px',
          background: 'linear-gradient(180deg, rgba(16, 18, 26, 0.92) 0%, rgba(10, 10, 12, 0.96) 100%)',
          border: '1px solid rgba(170, 198, 255, 0.12)',
          borderRadius: '16px',
          boxShadow: '0 10px 32px rgba(0, 0, 0, 0.45), inset 0 1px 0 rgba(255, 255, 255, 0.03)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '14px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <div
                style={{
                  fontSize: '10px',
                  letterSpacing: '0.22em',
                  textTransform: 'uppercase',
                  color: 'rgba(170, 198, 255, 0.70)',
                  fontWeight: 600,
                }}
              >
                {mode.shortLabel} • {time} IST
              </div>
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  border: `1px solid ${tonePill.border}`,
                  background: tonePill.bg,
                  color: tonePill.color,
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                }}
              >
                {tonePill.label}
              </span>
              <span
                style={{
                  padding: '4px 10px',
                  borderRadius: '999px',
                  border: '1px solid rgba(170, 198, 255, 0.14)',
                  background: 'rgba(0,0,0,0.35)',
                  color: 'rgba(180, 200, 230, 0.65)',
                  fontSize: '10px',
                  fontWeight: 600,
                  letterSpacing: '0.10em',
                  textTransform: 'uppercase',
                }}
              >
                {brief?.isLive ? 'Live' : 'Curated'}
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '12px',
                  display: 'grid',
                  placeItems: 'center',
                  background: 'rgba(170, 198, 255, 0.10)',
                  border: '1px solid rgba(170, 198, 255, 0.18)',
                  color: 'rgba(170, 198, 255, 0.92)',
                  filter: 'drop-shadow(0 0 10px rgba(170, 198, 255, 0.12))',
                }}
              >
                ☀️
              </div>
              <div>
                <div
                  style={{
                    color: 'rgba(235, 245, 255, 0.96)',
                    fontSize: '16px',
                    fontWeight: 650,
                    letterSpacing: '-0.01em',
                  }}
                >
                  {brief?.title || 'Morning Briefing'}
                </div>
                <div style={{ color: 'rgba(180, 200, 230, 0.60)', fontSize: '11px' }}>
                  {brief?.date || DEFAULT_BRIEF.date}
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsLoading(true);
              setError(null);
              fetch('/api/live-intelligence/morning-brief', { cache: 'no-store' })
                .then((r) => r.json().then((j) => ({ r, j })))
                .then(({ r, j }) => {
                  if (r.ok && j?.ok && j?.brief) setBrief({ ...DEFAULT_BRIEF, ...j.brief, isLive: Boolean(j?.isLive) });
                  else setError(j?.error || 'Refresh failed');
                })
                .catch(() => setError('Refresh failed'))
                .finally(() => setIsLoading(false));
            }}
            style={{
              padding: '10px 12px',
              borderRadius: '12px',
              border: '1px solid rgba(170, 198, 255, 0.18)',
              background: 'rgba(170, 198, 255, 0.08)',
              color: 'rgba(235, 245, 255, 0.90)',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.25s ease',
              opacity: isLoading ? 0.7 : 1,
            }}
            disabled={isLoading}
          >
            {isLoading ? 'Updating…' : 'Refresh'}
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={isLoading ? 'loading' : 'loaded'}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.35 }}
            style={{ marginTop: '14px' }}
          >
            {error && (
              <div style={{
                marginBottom: '10px',
                padding: '10px 12px',
                borderRadius: '12px',
                background: 'rgba(255, 90, 90, 0.08)',
                border: '1px solid rgba(255, 90, 90, 0.18)',
                color: 'rgba(255, 160, 160, 0.92)',
                fontSize: '12px',
              }}>
                {error}
              </div>
            )}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(12, 1fr)',
                gap: '12px',
              }}
            >
              <BriefCard title="Global Cues" icon="🌍" span={6} items={brief?.globalCues} kind="cues" />
              <BriefCard title="Today’s Events" icon="📅" span={6} items={brief?.keyEvents} kind="events" />
              <BriefCard title="Sector Watch" icon="🏭" span={6} items={brief?.sectorWatch} kind="sectors" />
              <BriefCard title="Risk Factors" icon="⚠️" span={6} items={brief?.riskFactors} kind="risks" />
            </div>

            <div style={{ marginTop: '12px' }}>
              <WhatsAppShare summary={brief} type="morning" showOptIn={true} />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <style jsx>{`
        @media (max-width: 900px) {
          :global(.li-mb-colspan-6) { grid-column: 1 / -1 !important; }
        }
      `}</style>
    </div>
  );
}

function BriefCard({ title, icon, items, kind, span = 6 }) {
  const className = `li-mb-colspan-${span}`;

  return (
    <div
      className={className}
      style={{
        gridColumn: `span ${span}`,
        padding: '14px 14px',
        background: 'rgba(0,0,0,0.36)',
        border: '1px solid rgba(170, 198, 255, 0.10)',
        borderRadius: '14px',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '10px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ opacity: 0.95 }}>{icon}</span>
          <div style={{
            color: 'rgba(235, 245, 255, 0.92)',
            fontSize: '13px',
            fontWeight: 650,
            letterSpacing: '0.02em',
          }}>
            {title}
          </div>
        </div>
        <div style={{
          width: '44px',
          height: '1px',
          background: 'linear-gradient(90deg, rgba(170, 198, 255, 0.40), transparent)',
          opacity: 0.5,
        }} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {renderItems(items, kind)}
      </div>
    </div>
  );
}

function renderItems(items, kind) {
  if (!items || (Array.isArray(items) && items.length === 0)) {
    return (
      <div style={{
        color: 'rgba(180, 200, 230, 0.55)',
        fontSize: '12px',
      }}>
        No updates yet.
      </div>
    );
  }

  if (kind === 'risks') {
    const riskList = Array.isArray(items) ? items : [];
    return riskList.slice(0, 6).map((text, i) => (
      <div key={i} style={{
        display: 'flex',
        gap: '10px',
        alignItems: 'flex-start',
      }}>
        <span style={{
          width: '8px',
          height: '8px',
          borderRadius: '999px',
          marginTop: '6px',
          background: 'rgba(255, 210, 130, 0.70)',
          boxShadow: '0 0 10px rgba(255, 210, 130, 0.18)',
          flex: '0 0 auto',
        }} />
        <div style={{ color: 'rgba(200, 215, 240, 0.78)', fontSize: '12px', lineHeight: 1.55 }}>
          {String(text)}
        </div>
      </div>
    ));
  }

  if (kind === 'cues') {
    const cueList = Array.isArray(items) ? items : [];
    return cueList.slice(0, 6).map((c, i) => {
      const sentiment = c?.sentiment || 'neutral';
      const dot = sentiment === 'positive'
        ? 'rgba(100, 220, 150, 0.85)'
        : sentiment === 'negative'
          ? 'rgba(255, 90, 90, 0.85)'
          : 'rgba(170, 198, 255, 0.70)';
      return (
        <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '999px', marginTop: '6px', background: dot, flex: '0 0 auto' }} />
          <div style={{ color: 'rgba(200, 215, 240, 0.78)', fontSize: '12px', lineHeight: 1.55 }}>
            {String(c?.text || '')}
          </div>
        </div>
      );
    });
  }

  if (kind === 'events') {
    const eventList = Array.isArray(items) ? items : [];
    return eventList.slice(0, 6).map((e, i) => (
      <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'baseline' }}>
        <div style={{
          minWidth: '64px',
          color: 'rgba(170, 198, 255, 0.85)',
          fontSize: '11px',
          fontWeight: 650,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          fontVariantNumeric: 'tabular-nums',
        }}>
          {String(e?.time || '')}
        </div>
        <div style={{ color: 'rgba(200, 215, 240, 0.78)', fontSize: '12px', lineHeight: 1.55 }}>
          {String(e?.event || '')}
        </div>
      </div>
    ));
  }

  if (kind === 'sectors') {
    const sectorList = Array.isArray(items) ? items : [];
    return sectorList.slice(0, 6).map((s, i) => (
      <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'baseline' }}>
        <div style={{
          minWidth: '92px',
          color: 'rgba(235, 245, 255, 0.88)',
          fontSize: '12px',
          fontWeight: 650,
        }}>
          {String(s?.sector || '')}
        </div>
        <div style={{ color: 'rgba(180, 200, 230, 0.70)', fontSize: '12px', lineHeight: 1.55 }}>
          {String(s?.outlook || '')}
        </div>
      </div>
    ));
  }

  return null;
}
