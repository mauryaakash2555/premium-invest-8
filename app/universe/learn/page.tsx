'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

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

type FeaturedPath = {
  id: string;
  icon: string;
  title: string;
  description: string;
};

type RelatedTopic = {
  title: string;
  slug: string;
};

const FEATURED_PATHS: FeaturedPath[] = [
  {
    id: 'start-journey',
    icon: '📚',
    title: 'Start Your Journey',
    description: 'The essential foundation every investor needs',
  },
  {
    id: 'exam-prep',
    icon: '🎯',
    title: 'Exam Preparation (AMFI, NISM)',
    description: 'Ace your certification exams with structured learning',
  },
  {
    id: 'wealth-building',
    icon: '💰',
    title: 'Wealth Building Fundamentals',
    description: 'Timeless principles for growing your money',
  },
  {
    id: 'behavioral-finance',
    icon: '🧠',
    title: 'Behavioral Finance',
    description: 'Master the psychology behind financial decisions',
  },
  {
    id: 'advanced-strategies',
    icon: '⚡',
    title: 'Advanced Strategies',
    description: 'Sophisticated techniques for experienced investors',
  },
];

// Related topic suggestions based on keywords
const TOPIC_ASSOCIATIONS: Record<string, RelatedTopic[]> = {
  default: [
    { title: 'Investment Basics', slug: 'investment-basics' },
    { title: 'Risk Management', slug: 'risk-management' },
    { title: 'Tax Planning', slug: 'tax-planning' },
    { title: 'Market Analysis', slug: 'market-analysis' },
  ],
  crypto: [
    { title: 'Cryptocurrency Basics', slug: 'cryptocurrency-basics' },
    { title: 'Blockchain Technology', slug: 'blockchain-technology' },
    { title: 'Digital Assets', slug: 'digital-assets' },
    { title: 'Tax Implications', slug: 'crypto-tax' },
  ],
  stock: [
    { title: 'Stock Market Basics', slug: 'stock-market-basics' },
    { title: 'Technical Analysis', slug: 'technical-analysis' },
    { title: 'Fundamental Analysis', slug: 'fundamental-analysis' },
    { title: 'Portfolio Building', slug: 'portfolio-building' },
  ],
  mutual: [
    { title: 'Mutual Fund Types', slug: 'mutual-fund-types' },
    { title: 'SIP Strategy', slug: 'sip-strategy' },
    { title: 'Fund Selection', slug: 'fund-selection' },
    { title: 'NAV & Returns', slug: 'nav-returns' },
  ],
  tax: [
    { title: 'Section 80C', slug: 'section-80c' },
    { title: 'Capital Gains Tax', slug: 'capital-gains-tax' },
    { title: 'ITR Filing', slug: 'itr-filing' },
    { title: 'Tax-Saving Investments', slug: 'tax-saving-investments' },
  ],
  insurance: [
    { title: 'Term Insurance', slug: 'term-insurance' },
    { title: 'Health Insurance', slug: 'health-insurance' },
    { title: 'ULIP vs Mutual Funds', slug: 'ulip-vs-mutual-funds' },
    { title: 'Claim Process', slug: 'insurance-claim' },
  ],
  retirement: [
    { title: 'NPS Benefits', slug: 'nps-benefits' },
    { title: 'EPF & PPF', slug: 'epf-ppf' },
    { title: 'Retirement Corpus', slug: 'retirement-corpus' },
    { title: 'Pension Plans', slug: 'pension-plans' },
  ],
  real: [
    { title: 'Real Estate Investment', slug: 'real-estate-investment' },
    { title: 'REITs Explained', slug: 'reits-explained' },
    { title: 'Property vs Equity', slug: 'property-vs-equity' },
    { title: 'Home Loan Strategy', slug: 'home-loan-strategy' },
  ],
};

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

function getRelatedTopics(query: string): RelatedTopic[] {
  const q = query.toLowerCase();
  
  if (q.includes('bitcoin') || q.includes('crypto') || q.includes('blockchain') || q.includes('eth')) {
    return TOPIC_ASSOCIATIONS.crypto;
  }
  if (q.includes('stock') || q.includes('share') || q.includes('equity') || q.includes('nifty') || q.includes('sensex')) {
    return TOPIC_ASSOCIATIONS.stock;
  }
  if (q.includes('mutual') || q.includes('fund') || q.includes('sip') || q.includes('nav')) {
    return TOPIC_ASSOCIATIONS.mutual;
  }
  if (q.includes('tax') || q.includes('80c') || q.includes('itr') || q.includes('deduction')) {
    return TOPIC_ASSOCIATIONS.tax;
  }
  if (q.includes('insurance') || q.includes('term') || q.includes('health') || q.includes('ulip')) {
    return TOPIC_ASSOCIATIONS.insurance;
  }
  if (q.includes('retire') || q.includes('pension') || q.includes('nps') || q.includes('epf') || q.includes('ppf')) {
    return TOPIC_ASSOCIATIONS.retirement;
  }
  if (q.includes('real') || q.includes('property') || q.includes('reit') || q.includes('home') || q.includes('house')) {
    return TOPIC_ASSOCIATIONS.real;
  }
  
  return TOPIC_ASSOCIATIONS.default;
}

const STORAGE_KEY = 'universe_topics_explored_v1';

export default function UniverseLearnHubPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [topicsExplored, setTopicsExplored] = useState(0);
  const [mounted, setMounted] = useState(false);

  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

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
    const onScroll = () => setScrolled(window.scrollY > 8);
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

  // Stars
  const stars = useMemo<Star[]>(() => {
    const rand = mulberry32(20260210);
    const count = 180;
    const out: Star[] = [];
    for (let i = 0; i < count; i++) {
      const sizes = [1, 1, 1, 2, 2, 3];
      out.push({
        id: i,
        leftPct: rand() * 100,
        topPct: rand() * 100,
        sizePx: sizes[Math.floor(rand() * sizes.length)],
        opacity: 0.2 + rand() * 0.8,
        driftX: (rand() - 0.5) * 60,
        driftY: (rand() - 0.5) * 60,
        delayS: rand() * 10,
      });
    }
    return out;
  }, []);

  const showSearchResults = debounced.trim().length >= 3;
  const relatedTopics = showSearchResults ? getRelatedTopics(debounced) : [];
  const searchSlug = slugify(debounced);

  const handleNavigate = (slug: string) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const arr = raw ? (JSON.parse(raw) as unknown) : [];
      const next = Array.isArray(arr) ? [...arr] : [];
      if (!next.includes(slug)) next.push(slug);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // ignore
    }
    router.push(`/universe/learn/${slug}`);
  };

  const handleFeaturedPath = (id: string) => {
    handleNavigate(id);
  };

  return (
    <main className="hub-root">
      {/* Starfield */}
      <div className="hub-starfield" aria-hidden="true">
        {stars.map((s) => (
          <span
            key={s.id}
            className="hub-star"
            style={{
              left: `${s.leftPct}%`,
              top: `${s.topPct}%`,
              width: `${s.sizePx}px`,
              height: `${s.sizePx}px`,
              opacity: s.opacity,
              ['--drift-x' as string]: `${s.driftX}px`,
              ['--drift-y' as string]: `${s.driftY}px`,
              animationDelay: `${s.delayS}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Header */}
      <header className={`hub-header ${scrolled ? 'hub-header--scrolled' : ''}`}>
        <div className="hub-header-left">Universe</div>
        <div className="hub-header-right">🎯 {topicsExplored} topics explored</div>
      </header>

      {/* Content */}
      <div className="hub-content">
        <div className={`hub-search-wrap ${showSearchResults ? 'hub-search-wrap--lifted' : ''}`}>
          {/* Search */}
          <div className="hub-search">
            <span className="hub-search-icon">🔍</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What do you want to master today?"
              className="hub-search-input"
              aria-label="Search topics"
            />
          </div>
        </div>

        {/* Results or Featured */}
        <div className={`hub-results ${mounted ? 'hub-results--visible' : ''}`}>
          {showSearchResults ? (
            <>
              {/* Primary: Explore this topic */}
              <button
                type="button"
                onClick={() => handleNavigate(searchSlug || 'explore')}
                className="hub-card hub-card--primary"
              >
                <div className="hub-card-icon">🔍</div>
                <div className="hub-card-body">
                  <h3 className="hub-card-title">Explore: {debounced.trim()}</h3>
                  <p className="hub-card-desc">Deep dive into everything about {debounced.trim().toLowerCase()}</p>
                </div>
                <span className="hub-card-arrow">→</span>
              </button>

              {/* Related topics */}
              <div className="hub-related-grid">
                {relatedTopics.map((topic) => (
                  <button
                    key={topic.slug}
                    type="button"
                    onClick={() => handleNavigate(topic.slug)}
                    className="hub-card hub-card--secondary"
                  >
                    <div className="hub-card-body">
                      <h4 className="hub-card-title-sm">{topic.title}</h4>
                    </div>
                    <span className="hub-card-arrow-sm">→</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            /* Featured learning paths */
            <div className="hub-featured-grid">
              {FEATURED_PATHS.map((path) => (
                <button
                  key={path.id}
                  type="button"
                  onClick={() => handleFeaturedPath(path.id)}
                  className="hub-card hub-card--featured"
                >
                  <div className="hub-card-icon">{path.icon}</div>
                  <div className="hub-card-body">
                    <h3 className="hub-card-title">{path.title}</h3>
                    <p className="hub-card-desc">{path.description}</p>
                  </div>
                  <span className="hub-card-arrow">→</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        /* ═══════════════════════════════════════════════════════════
           BASE
           ═══════════════════════════════════════════════════════════ */
        .hub-root {
          min-height: 100vh;
          background: #000000;
          color: #ffffff;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          overflow-x: hidden;
        }

        /* ═══════════════════════════════════════════════════════════
           STARFIELD
           ═══════════════════════════════════════════════════════════ */
        .hub-starfield {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        .hub-star {
          position: absolute;
          border-radius: 50%;
          background: #ffffff;
          animation: hubStarDrift 60s linear infinite;
          will-change: transform;
        }

        @keyframes hubStarDrift {
          0% { transform: translate(0, 0); }
          50% { transform: translate(var(--drift-x), var(--drift-y)); }
          100% { transform: translate(0, 0); }
        }

        /* ═══════════════════════════════════════════════════════════
           HEADER
           ═══════════════════════════════════════════════════════════ */
        .hub-header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          height: 80px;
          padding: 0 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: transparent;
          transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hub-header--scrolled {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        }

        .hub-header-left {
          font-size: 24px;
          font-weight: 600;
          letter-spacing: -0.02em;
          text-shadow: 0 0 20px rgba(124, 58, 237, 0.3);
        }

        .hub-header-right {
          font-size: 14px;
          color: #9ca3af;
          font-weight: 500;
        }

        /* ═══════════════════════════════════════════════════════════
           CONTENT
           ═══════════════════════════════════════════════════════════ */
        .hub-content {
          position: relative;
          z-index: 10;
          padding: 120px 24px 80px;
          max-width: 900px;
          margin: 0 auto;
        }

        .hub-search-wrap {
          transition: transform 500ms cubic-bezier(0.4, 0, 0.2, 1);
          transform: translateY(20vh);
        }

        .hub-search-wrap--lifted {
          transform: translateY(0);
        }

        /* ═══════════════════════════════════════════════════════════
           SEARCH BAR
           ═══════════════════════════════════════════════════════════ */
        .hub-search {
          position: relative;
          width: 100%;
          max-width: 700px;
          margin: 0 auto;
        }

        .hub-search-icon {
          position: absolute;
          left: 24px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 24px;
          pointer-events: none;
        }

        .hub-search-input {
          width: 100%;
          height: 80px;
          padding: 0 32px 0 64px;
          font-size: 18px;
          font-weight: 400;
          color: #ffffff;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 20px;
          outline: none;
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          transition: all 300ms cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hub-search-input::placeholder {
          color: #6b7280;
        }

        .hub-search-input:focus {
          border-color: rgba(124, 58, 237, 0.4);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.3),
            0 0 0 1px rgba(124, 58, 237, 0.2),
            0 0 40px rgba(124, 58, 237, 0.15);
        }

        @media (max-width: 640px) {
          .hub-search-input {
            height: 64px;
            font-size: 16px;
            padding-left: 56px;
          }
          .hub-search-icon {
            left: 20px;
            font-size: 20px;
          }
        }

        /* ═══════════════════════════════════════════════════════════
           RESULTS
           ═══════════════════════════════════════════════════════════ */
        .hub-results {
          margin-top: 48px;
          opacity: 0;
          transform: translateY(20px);
          transition: all 400ms cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hub-results--visible {
          opacity: 1;
          transform: translateY(0);
        }

        .hub-featured-grid {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .hub-related-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-top: 16px;
        }

        @media (max-width: 640px) {
          .hub-related-grid {
            grid-template-columns: 1fr;
          }
        }

        /* ═══════════════════════════════════════════════════════════
           CARDS
           ═══════════════════════════════════════════════════════════ */
        .hub-card {
          display: flex;
          align-items: center;
          gap: 20px;
          width: 100%;
          min-height: 88px;
          padding: 24px;
          text-align: left;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          backdrop-filter: blur(20px) saturate(180%);
          -webkit-backdrop-filter: blur(20px) saturate(180%);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          cursor: pointer;
          transition: all 200ms cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hub-card:hover {
          transform: translateY(-2px) scale(1.01);
          border-color: rgba(124, 58, 237, 0.3);
          box-shadow: 
            0 12px 40px rgba(0, 0, 0, 0.4),
            0 0 20px rgba(124, 58, 237, 0.2);
        }

        .hub-card:active {
          transform: translateY(0) scale(0.99);
        }

        .hub-card--primary {
          background: linear-gradient(
            135deg,
            rgba(124, 58, 237, 0.15) 0%,
            rgba(59, 130, 246, 0.1) 50%,
            rgba(255, 255, 255, 0.03) 100%
          );
          border-color: rgba(124, 58, 237, 0.25);
        }

        .hub-card--secondary {
          min-height: 64px;
          padding: 16px 20px;
          gap: 12px;
        }

        .hub-card-icon {
          flex-shrink: 0;
          font-size: 32px;
          line-height: 1;
        }

        .hub-card-body {
          flex: 1;
          min-width: 0;
        }

        .hub-card-title {
          font-size: 18px;
          font-weight: 600;
          color: #ffffff;
          margin: 0 0 4px;
          letter-spacing: -0.01em;
        }

        .hub-card-title-sm {
          font-size: 15px;
          font-weight: 500;
          color: #ffffff;
          margin: 0;
        }

        .hub-card-desc {
          font-size: 14px;
          font-weight: 400;
          color: #9ca3af;
          margin: 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .hub-card-arrow {
          flex-shrink: 0;
          font-size: 20px;
          color: #6b7280;
          transition: all 200ms ease;
        }

        .hub-card:hover .hub-card-arrow {
          color: #ffffff;
          transform: translateX(4px);
        }

        .hub-card-arrow-sm {
          flex-shrink: 0;
          font-size: 16px;
          color: #6b7280;
          transition: all 200ms ease;
        }

        .hub-card:hover .hub-card-arrow-sm {
          color: #ffffff;
          transform: translateX(4px);
        }

        /* ═══════════════════════════════════════════════════════════
           REDUCED MOTION
           ═══════════════════════════════════════════════════════════ */
        @media (prefers-reduced-motion: reduce) {
          .hub-star,
          .hub-search-wrap,
          .hub-results,
          .hub-card {
            animation: none !important;
            transition: none !important;
          }
          .hub-search-wrap { transform: none; }
          .hub-results { opacity: 1; transform: none; }
        }
      `}</style>
    </main>
  );
}
