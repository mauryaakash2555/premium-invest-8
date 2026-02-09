'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

type Star = {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  delay: number;
};

type FeaturedPath = {
  id: string;
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
    title: 'Start Your Journey',
    description: 'The essential foundation every investor needs',
  },
  {
    id: 'exam-prep',
    title: 'Exam Preparation',
    description: 'Ace your AMFI and NISM certification exams',
  },
  {
    id: 'wealth-building',
    title: 'Wealth Building',
    description: 'Timeless principles for growing your money',
  },
  {
    id: 'behavioral-finance',
    title: 'Behavioral Finance',
    description: 'Master the psychology behind decisions',
  },
  {
    id: 'advanced-strategies',
    title: 'Advanced Strategies',
    description: 'Sophisticated techniques for experienced investors',
  },
];

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

function seededRandom(seed: number) {
  return function () {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
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

  const stars = useMemo<Star[]>(() => {
    const rand = seededRandom(20260210);
    return Array.from({ length: 150 }, (_, i) => ({
      id: i,
      x: rand() * 100,
      y: rand() * 100,
      size: rand() < 0.7 ? 1 : rand() < 0.9 ? 2 : 3,
      opacity: 0.3 + rand() * 0.7,
      delay: rand() * 8,
    }));
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
    <main className="hub-page">
      {/* Starfield */}
      <div className="starfield" aria-hidden="true">
        {stars.map((s) => (
          <div
            key={s.id}
            className="star"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
              '--opacity': s.opacity,
              animationDelay: `${s.delay}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Header */}
      <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
        <div className="header-brand">Universe</div>
        <div className="header-stat">{topicsExplored} explored</div>
      </header>

      {/* Content */}
      <div className="content">
        {/* Hero text */}
        <div className={`hero ${showSearchResults ? 'hero--lifted' : ''}`}>
          <h1 className="hero-title">What would you like to learn?</h1>
          <p className="hero-subtitle">Search any topic or choose a curated path below</p>
        </div>

        {/* Search */}
        <div className={`search-container ${showSearchResults ? 'search--lifted' : ''}`}>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search any topic..."
            className="search-input"
            aria-label="Search topics"
          />
        </div>

        {/* Results */}
        <div className={`results ${mounted ? 'results--visible' : ''}`}>
          {showSearchResults ? (
            <>
              {/* Primary explore card */}
              <button
                type="button"
                onClick={() => handleNavigate(searchSlug || 'explore')}
                className="card card--primary"
              >
                <div className="card-content">
                  <h3 className="card-title">Explore: {debounced.trim()}</h3>
                  <p className="card-desc">Deep dive into everything about this topic</p>
                </div>
                <span className="card-arrow">→</span>
              </button>

              {/* Related topics */}
              <div className="related-grid">
                {relatedTopics.map((topic) => (
                  <button
                    key={topic.slug}
                    type="button"
                    onClick={() => handleNavigate(topic.slug)}
                    className="card card--secondary"
                  >
                    <span className="card-title-sm">{topic.title}</span>
                    <span className="card-arrow-sm">→</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            /* Featured paths */
            <div className="featured-grid">
              {FEATURED_PATHS.map((path, index) => (
                <button
                  key={path.id}
                  type="button"
                  onClick={() => handleFeaturedPath(path.id)}
                  className="card card--featured"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="card-number">{String(index + 1).padStart(2, '0')}</div>
                  <div className="card-content">
                    <h3 className="card-title">{path.title}</h3>
                    <p className="card-desc">{path.description}</p>
                  </div>
                  <span className="card-arrow">→</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        /* ═══════════════════════════════════════════
           BASE - Pure monochrome
           ═══════════════════════════════════════════ */
        .hub-page {
          min-height: 100vh;
          background: #000000;
          color: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', 'Segoe UI', sans-serif;
          line-height: 1.6;
          overflow-x: hidden;
        }

        /* ═══════════════════════════════════════════
           STARFIELD - White only
           ═══════════════════════════════════════════ */
        .starfield {
          position: fixed;
          inset: 0;
          pointer-events: none;
          z-index: 0;
        }

        .star {
          position: absolute;
          background: #ffffff;
          border-radius: 50%;
          opacity: var(--opacity);
          animation: twinkle 6s ease-in-out infinite;
        }

        @keyframes twinkle {
          0%, 100% { opacity: calc(var(--opacity) * 0.4); }
          50% { opacity: var(--opacity); }
        }

        /* ═══════════════════════════════════════════
           HEADER - Monochrome glass
           ═══════════════════════════════════════════ */
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          height: 72px;
          padding: 0 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: transparent;
          transition: all 300ms cubic-bezier(0.23, 1, 0.32, 1);
        }

        .header--scrolled {
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .header-brand {
          font-size: 20px;
          font-weight: 600;
          color: #ffffff;
          letter-spacing: -0.02em;
        }

        .header-stat {
          font-size: 14px;
          font-weight: 400;
          color: #737373;
        }

        /* ═══════════════════════════════════════════
           CONTENT
           ═══════════════════════════════════════════ */
        .content {
          position: relative;
          z-index: 10;
          padding: 160px 32px 100px;
          max-width: 800px;
          margin: 0 auto;
        }

        /* ═══════════════════════════════════════════
           HERO
           ═══════════════════════════════════════════ */
        .hero {
          text-align: center;
          margin-bottom: 48px;
          transition: all 500ms cubic-bezier(0.23, 1, 0.32, 1);
        }

        .hero--lifted {
          margin-bottom: 32px;
        }

        .hero-title {
          font-size: clamp(32px, 5vw, 48px);
          font-weight: 300;
          color: #ffffff;
          letter-spacing: -0.03em;
          margin: 0 0 16px;
        }

        .hero-subtitle {
          font-size: 16px;
          font-weight: 400;
          color: #737373;
          margin: 0;
        }

        /* ═══════════════════════════════════════════
           SEARCH - Monochrome, 100px height
           ═══════════════════════════════════════════ */
        .search-container {
          max-width: 640px;
          margin: 0 auto 64px;
          transition: all 500ms cubic-bezier(0.23, 1, 0.32, 1);
        }

        .search--lifted {
          margin-bottom: 48px;
        }

        .search-input {
          width: 100%;
          height: 100px;
          padding: 0 40px;
          font-size: 20px;
          font-weight: 400;
          color: #ffffff;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          outline: none;
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
          transition: all 300ms cubic-bezier(0.23, 1, 0.32, 1);
        }

        .search-input::placeholder {
          color: #737373;
        }

        .search-input:focus {
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: 
            0 8px 32px rgba(0, 0, 0, 0.6),
            0 0 30px rgba(255, 255, 255, 0.1);
        }

        @media (max-width: 640px) {
          .search-input {
            height: 72px;
            font-size: 16px;
            padding: 0 28px;
            border-radius: 20px;
          }
        }

        /* ═══════════════════════════════════════════
           RESULTS
           ═══════════════════════════════════════════ */
        .results {
          opacity: 0;
          transform: translateY(20px);
          transition: all 400ms cubic-bezier(0.23, 1, 0.32, 1);
        }

        .results--visible {
          opacity: 1;
          transform: translateY(0);
        }

        .featured-grid {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .related-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-top: 24px;
        }

        @media (max-width: 640px) {
          .related-grid {
            grid-template-columns: 1fr;
          }
        }

        /* ═══════════════════════════════════════════
           CARDS - Monochrome glass
           ═══════════════════════════════════════════ */
        .card {
          display: flex;
          align-items: center;
          gap: 24px;
          width: 100%;
          padding: 32px;
          text-align: left;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.6);
          cursor: pointer;
          transition: all 300ms cubic-bezier(0.23, 1, 0.32, 1);
        }

        .card:hover {
          transform: translateY(-4px);
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.12);
          box-shadow: 
            0 16px 48px rgba(0, 0, 0, 0.7),
            0 0 40px rgba(255, 255, 255, 0.08);
        }

        .card:active {
          transform: translateY(-2px);
        }

        .card--primary {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.08);
        }

        .card--secondary {
          padding: 24px;
          gap: 16px;
        }

        .card--featured {
          animation: fadeInUp 400ms cubic-bezier(0.23, 1, 0.32, 1) backwards;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .card-number {
          flex-shrink: 0;
          font-size: 14px;
          font-weight: 400;
          color: #404040;
          font-variant-numeric: tabular-nums;
        }

        .card-content {
          flex: 1;
          min-width: 0;
        }

        .card-title {
          font-size: 18px;
          font-weight: 500;
          color: #ffffff;
          margin: 0 0 6px;
          letter-spacing: -0.01em;
        }

        .card-title-sm {
          font-size: 15px;
          font-weight: 500;
          color: #e5e5e5;
        }

        .card-desc {
          font-size: 14px;
          font-weight: 400;
          color: #737373;
          margin: 0;
        }

        .card-arrow {
          flex-shrink: 0;
          font-size: 20px;
          color: #404040;
          transition: all 300ms cubic-bezier(0.23, 1, 0.32, 1);
        }

        .card:hover .card-arrow {
          color: #ffffff;
          transform: translateX(6px);
        }

        .card-arrow-sm {
          flex-shrink: 0;
          font-size: 16px;
          color: #404040;
          transition: all 300ms cubic-bezier(0.23, 1, 0.32, 1);
        }

        .card:hover .card-arrow-sm {
          color: #ffffff;
          transform: translateX(6px);
        }

        /* ═══════════════════════════════════════════
           REDUCED MOTION
           ═══════════════════════════════════════════ */
        @media (prefers-reduced-motion: reduce) {
          .star,
          .card--featured {
            animation: none;
          }
          
          .hero,
          .search-container,
          .results,
          .card,
          .card-arrow,
          .card-arrow-sm,
          .search-input,
          .header {
            transition-duration: 0.1s;
          }
        }
      `}</style>
    </main>
  );
}
