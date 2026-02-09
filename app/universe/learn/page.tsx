'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

type Topic = {
  id: string;
  title: string;
  description: string;
  icon: string;
  keywords: string[];
};

type Star = {
  id: number;
  leftPct: number;
  topPct: number;
  sizePx: number;
  opacity: number;
  driftX: number;
  driftY: number;
  delayS: number;
};

const TOPICS: Topic[] = [
  {
    id: 'sip',
    title: 'SIP (Systematic Investment Plan)',
    icon: '🔄',
    description: 'Master the behavior engine of wealth building',
    keywords: ['sip', 'systematic', 'investment', 'plan', 'monthly', 'discipline', 'rupee cost averaging'],
  },
  {
    id: 'mutual-funds',
    title: 'Mutual Funds',
    icon: '📊',
    description: 'From basics to portfolio construction mastery',
    keywords: ['mutual funds', 'nav', 'expense ratio', 'portfolio', 'asset allocation', 'index fund'],
  },
  {
    id: 'emergency-fund',
    title: 'Emergency Fund',
    icon: '🛡️',
    description: 'Your financial airbag - build it right',
    keywords: ['emergency', 'cash', 'liquidity', 'safety', 'rainy day'],
  },
  {
    id: 'risk-management',
    title: 'Risk Management',
    icon: '⚖️',
    description: 'Understand drawdowns, not just returns',
    keywords: ['risk', 'drawdown', 'volatility', 'diversification', 'rebalancing', 'losses'],
  },
  {
    id: 'tax-optimization',
    title: 'Tax Optimization',
    icon: '💰',
    description: 'Keep more of what you earn, legally',
    keywords: ['tax', '80c', 'capital gains', 'itr', 'deductions', 'planning'],
  },
];

const STORAGE_KEY = 'universe_topics_explored_v1';

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

function norm(s: string) {
  return (s || '').toLowerCase().trim();
}

export default function UniverseLearnHubPage() {
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [topicsExplored, setTopicsExplored] = useState(0);

  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(() => {
      setDebounced(query);
    }, 300);

    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query]);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const arr = raw ? (JSON.parse(raw) as unknown) : [];
      if (Array.isArray(arr)) setTopicsExplored(arr.length);
    } catch {
      // ignore
    }
  }, []);

  const stars = useMemo<Star[]>(() => {
    const rand = mulberry32(20260209);
    const count = 140;
    const out: Star[] = [];

    for (let i = 0; i < count; i += 1) {
      const leftPct = rand() * 100;
      const topPct = rand() * 100;
      const sizePx = 1 + rand() * 2;
      const opacity = clamp(0.3 + rand() * 0.7, 0.3, 1);
      const driftX = (rand() - 0.5) * 120;
      const driftY = (rand() - 0.5) * 120;
      const delayS = rand() * 6;

      out.push({ id: i, leftPct, topPct, sizePx, opacity, driftX, driftY, delayS });
    }

    return out;
  }, []);

  const q = norm(debounced);
  const shouldSearch = q.length >= 3;

  const results = useMemo(() => {
    if (!shouldSearch) return TOPICS;

    return TOPICS.filter((t) => {
      const hay = [t.title, t.description, t.keywords.join(' ')].join(' ');
      return norm(hay).includes(q);
    });
  }, [q, shouldSearch]);

  const noMatches = shouldSearch && results.length === 0;

  const handleOpenTopic = (topicId: string) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const arr = raw ? (JSON.parse(raw) as unknown) : [];
      const next = Array.isArray(arr) ? [...arr] : [];
      if (!next.includes(topicId)) next.push(topicId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      setTopicsExplored(next.length);
    } catch {
      // ignore
    }

    router.push(`/universe/learn/${topicId}`);
  };

  const lifted = query.trim().length > 0;

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Background starfield */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div className="universe-stars absolute inset-0">
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
                  ['--dx' as any]: `${s.driftX}`,
                  ['--dy' as any]: `${s.driftY}`,
                  animationDuration: `40s`,
                  animationDelay: `${s.delayS}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      </div>

      {/* Header */}
      <header
        className={
          'fixed top-0 left-0 right-0 z-30 h-20 px-6 flex items-center justify-between transition ' +
          (scrolled ? 'bg-white/5 backdrop-blur-xl border-b border-white/10' : 'bg-transparent')
        }
      >
        <div className="text-[22px] sm:text-[24px] font-medium tracking-wide drop-shadow-[0_0_18px_rgba(124,58,237,0.16)]">
          Universe
        </div>
        <div className="text-sm text-white/80">
          🎯 {topicsExplored} topics explored
        </div>
      </header>

      {/* Content */}
      <div className="relative z-10 pt-24 pb-16 px-6">
        <div
          className={
            'mx-auto w-full max-w-[700px] transition-transform duration-500 ease-out ' +
            (lifted ? 'translate-y-0 md:translate-y-[-20px]' : 'translate-y-[18vh]')
          }
        >
          {/* Search Bar */}
          <div className="relative">
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/80 text-[24px] select-none">
              🔍
            </div>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What do you want to master today?"
              className="w-full h-[60px] rounded-2xl pl-14 pr-5 text-[18px] bg-white/5 backdrop-blur-xl border border-white/10 outline-none transition focus:border-white/15 focus:shadow-[0_0_20px_rgba(147,51,234,0.3)]"
              aria-label="Search learning topics"
            />
          </div>

          {/* Results */}
          <div
            className={
              'mt-8 transition-opacity duration-300 ' +
              (query.trim().length === 0 || query.trim().length >= 3 ? 'opacity-100' : 'opacity-60')
            }
          >
            {noMatches ? (
              <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-lg p-6 text-white/80">
                <div className="text-white font-medium">No results found.</div>
                <div className="mt-2 text-sm text-white/70">
                  Try: SIP, Mutual Funds, Emergency Fund, Risk Management, Tax Optimization
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleOpenTopic(t.id)}
                    className="group text-left rounded-xl border border-white/5 bg-white/5 backdrop-blur-lg p-6 transition duration-200 ease-out hover:-translate-y-1 hover:border-white/10 hover:shadow-[0_0_24px_rgba(147,51,234,0.2)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-[32px] leading-none">{t.icon}</div>
                        <div className="mt-4 text-[20px] font-semibold text-white">{t.title}</div>
                        <div className="mt-2 text-[14px] text-gray-400 truncate">{t.description}</div>
                      </div>
                      <div className="text-white/70 text-xl group-hover:text-white transition">→</div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes universe-star-drift {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(calc(var(--dx) * 1px), calc(var(--dy) * 1px), 0); }
        }

        .universe-stars {
          opacity: 1;
        }

        .universe-star {
          animation-name: universe-star-drift;
          animation-timing-function: linear;
          animation-iteration-count: infinite;
          will-change: transform;
        }

        @media (prefers-reduced-motion: reduce) {
          .universe-star {
            animation: none !important;
          }
        }
      `}</style>
    </main>
  );
}
