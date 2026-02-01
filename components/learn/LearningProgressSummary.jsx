'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import { getPremiumLearningLevel } from '@/lib/learning/premiumLearning';

const PREMIUM_STORAGE_KEY = 'li_premium_learning_v2';
const QUICKLEARN_STORAGE_KEY = 'li_quicklearn_state';
const DEFAULT_LEVEL_KEY = 'beginner';

function getDayKey(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function safeParseJson(raw) {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export default function LearningProgressSummary({ variant = 'card' }) {
  const [premiumCompletedCount, setPremiumCompletedCount] = useState(0);
  const [quickLearnDoneCount, setQuickLearnDoneCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  const totalLessons = useMemo(() => {
    const level = getPremiumLearningLevel(DEFAULT_LEVEL_KEY);
    const lessons = Array.isArray(level?.lessons) ? level.lessons : [];
    return lessons.length;
  }, []);

  useEffect(() => {
    setMounted(true);

    // Premium Learning progress
    try {
      const raw = window.localStorage.getItem(PREMIUM_STORAGE_KEY);
      const parsed = safeParseJson(raw);
      const completed = parsed && typeof parsed === 'object' ? parsed.completed : null;
      if (completed && typeof completed === 'object') {
        const keys = Object.keys(completed);
        const count = keys.reduce((acc, k) => acc + (completed?.[k] ? 1 : 0), 0);
        setPremiumCompletedCount(count);
      } else {
        setPremiumCompletedCount(0);
      }
    } catch {
      setPremiumCompletedCount(0);
    }

    // QuickLearn daily progress
    try {
      const raw = window.localStorage.getItem(QUICKLEARN_STORAGE_KEY);
      const parsed = safeParseJson(raw);
      const today = parsed && typeof parsed === 'object' ? parsed[getDayKey()] : null;
      const completed = today && typeof today === 'object' ? today.completed : null;
      if (completed && typeof completed === 'object') {
        const keys = Object.keys(completed);
        const count = keys.reduce((acc, k) => acc + (completed?.[k] ? 1 : 0), 0);
        setQuickLearnDoneCount(count);
      } else {
        setQuickLearnDoneCount(0);
      }
    } catch {
      setQuickLearnDoneCount(0);
    }
  }, []);

  // Avoid rendering misleading zeros during SSR hydration.
  if (!mounted) return null;

  const isInline = variant === 'inline';

  return (
    <div
      className={isInline ? undefined : 'li-dash-card'}
      style={
        isInline
          ? undefined
          : {
              gridColumn: '1 / -1',
              padding: '16px 18px',
              borderRadius: '16px',
              border: '1px solid rgba(100, 180, 255, 0.12)',
              background: 'linear-gradient(180deg, rgba(120, 170, 255, 0.10), rgba(20, 30, 50, 0.08))',
              boxShadow: '0 14px 34px rgba(0,0,0,0.24)',
            }
      }
      aria-label="Learning progress summary"
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
        <div>
          <div
            style={{
              fontSize: '12px',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: 'rgba(180, 200, 230, 0.62)',
              marginBottom: '6px',
            }}
          >
            Premium Learning
          </div>
          <div style={{ color: 'rgba(235, 242, 255, 0.95)', fontSize: '15px', fontWeight: 600 }}>
            Progress: {premiumCompletedCount}/{totalLessons || 0} lessons completed
          </div>
          <div style={{ marginTop: '6px', color: 'rgba(180, 200, 230, 0.70)', fontSize: '12px' }}>
            QuickLearn today: {Math.min(quickLearnDoneCount, 3)}/3 done
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          <Link
            href="/learn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: '10px 12px',
              borderRadius: '12px',
              border: '1px solid rgba(170, 198, 255, 0.26)',
              background: 'rgba(170, 198, 255, 0.12)',
              color: 'rgba(235, 242, 255, 0.92)',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'transform 0.15s ease, background 0.15s ease, border-color 0.15s ease',
              boxShadow: '0 10px 26px rgba(0,0,0,0.22)',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.background = 'rgba(170, 198, 255, 0.18)';
              e.currentTarget.style.borderColor = 'rgba(170, 198, 255, 0.40)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = 'rgba(170, 198, 255, 0.12)';
              e.currentTarget.style.borderColor = 'rgba(170, 198, 255, 0.26)';
            }}
          >
            <span aria-hidden="true">🧠</span>
            <span>Open Learning</span>
            <span aria-hidden="true">→</span>
          </Link>

          <div style={{ color: 'rgba(180, 200, 230, 0.55)', fontSize: '11px' }}>
            Uses existing saved progress
          </div>
        </div>
      </div>
    </div>
  );
}
