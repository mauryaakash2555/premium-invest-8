'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

type Star = {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  driftX: number;
  driftY: number;
  delay: number;
};

type RelatedTopic = {
  title: string;
  slug: string;
  description: string;
};

const TOPIC_SUGGESTIONS: Record<string, RelatedTopic[]> = {
  bitcoin: [
    { title: 'Cryptocurrency Basics', slug: 'cryptocurrency-basics', description: 'Understanding digital currencies' },
    { title: 'Blockchain Technology', slug: 'blockchain-technology', description: 'The foundation of crypto' },
    { title: 'Digital Assets', slug: 'digital-assets', description: 'Beyond traditional investments' },
    { title: 'Crypto Tax India', slug: 'crypto-tax-india', description: 'Tax implications in India' },
  ],
  crypto: [
    { title: 'Bitcoin Fundamentals', slug: 'bitcoin-fundamentals', description: 'The original cryptocurrency' },
    { title: 'Ethereum & Smart Contracts', slug: 'ethereum-smart-contracts', description: 'Programmable money' },
    { title: 'Crypto Regulations', slug: 'crypto-regulations', description: 'Legal framework' },
    { title: 'Crypto Tax India', slug: 'crypto-tax-india', description: 'Tax implications in India' },
  ],
  sip: [
    { title: 'Mutual Funds', slug: 'mutual-funds', description: 'Pooled investment vehicles' },
    { title: 'Systematic Investing', slug: 'systematic-investing', description: 'Discipline over timing' },
    { title: 'Asset Allocation', slug: 'asset-allocation', description: 'Balancing your portfolio' },
    { title: 'Long-term Wealth', slug: 'long-term-wealth', description: 'Compounding over decades' },
  ],
  mutual: [
    { title: 'SIP Strategy', slug: 'sip-strategy', description: 'Systematic investment plans' },
    { title: 'Fund Selection', slug: 'fund-selection', description: 'Choosing the right fund' },
    { title: 'NAV & Returns', slug: 'nav-returns', description: 'Understanding fund performance' },
    { title: 'Expense Ratios', slug: 'expense-ratios', description: 'Hidden costs of investing' },
  ],
  tax: [
    { title: 'Tax Saving Investments', slug: 'tax-saving-investments', description: 'Section 80C and beyond' },
    { title: '80C Deductions', slug: '80c-deductions', description: 'Maximizing your deductions' },
    { title: 'Capital Gains Tax', slug: 'capital-gains-tax', description: 'LTCG and STCG explained' },
    { title: 'Tax Planning', slug: 'tax-planning', description: 'Strategic tax optimization' },
  ],
  amfi: [
    { title: 'AMFI Exam Prep', slug: 'amfi-exam-prep', description: 'Ace your certification' },
    { title: 'Mutual Fund Basics', slug: 'mutual-fund-basics', description: 'Core concepts' },
    { title: 'Regulatory Framework', slug: 'regulatory-framework', description: 'SEBI and AMFI rules' },
    { title: 'Fund Categories', slug: 'fund-categories', description: 'Equity, debt, hybrid' },
  ],
  stock: [
    { title: 'Stock Market Basics', slug: 'stock-market-basics', description: 'How markets work' },
    { title: 'Technical Analysis', slug: 'technical-analysis', description: 'Charts and patterns' },
    { title: 'Fundamental Analysis', slug: 'fundamental-analysis', description: 'Company valuation' },
    { title: 'Portfolio Building', slug: 'portfolio-building', description: 'Diversification strategies' },
  ],
  default: [
    { title: 'Investment Basics', slug: 'investment-basics', description: 'Foundational concepts' },
    { title: 'Risk Management', slug: 'risk-management', description: 'Protecting your capital' },
    { title: 'Financial Planning', slug: 'financial-planning', description: 'Goal-based approach' },
    { title: 'Market Analysis', slug: 'market-analysis', description: 'Making informed decisions' },
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
  
  if (q.includes('bitcoin') || q.includes('btc')) return TOPIC_SUGGESTIONS.bitcoin;
  if (q.includes('crypto') || q.includes('blockchain') || q.includes('eth')) return TOPIC_SUGGESTIONS.crypto;
  if (q.includes('sip') || q.includes('systematic')) return TOPIC_SUGGESTIONS.sip;
  if (q.includes('mutual') || q.includes('fund') || q.includes('nav')) return TOPIC_SUGGESTIONS.mutual;
  if (q.includes('tax') || q.includes('80c') || q.includes('itr') || q.includes('deduction')) return TOPIC_SUGGESTIONS.tax;
  if (q.includes('amfi') || q.includes('nism') || q.includes('exam')) return TOPIC_SUGGESTIONS.amfi;
  if (q.includes('stock') || q.includes('share') || q.includes('equity') || q.includes('nifty')) return TOPIC_SUGGESTIONS.stock;
  
  return TOPIC_SUGGESTIONS.default;
}

const STORAGE_KEY = 'universe_topics_explored_v1';

export default function UniverseSearchHub() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const [topicsExplored, setTopicsExplored] = useState(0);
  const [mounted, setMounted] = useState(false);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const arr = raw ? (JSON.parse(raw) as unknown) : [];
      if (Array.isArray(arr)) setTopicsExplored(arr.length);
    } catch {
      // ignore
    }
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

  const stars = useMemo<Star[]>(() => {
    const rand = seededRandom(20260210);
    return Array.from({ length: 200 }, (_, i) => ({
      id: i,
      x: rand() * 100,
      y: rand() * 100,
      size: rand() < 0.8 ? 1 : 2,
      opacity: 0.2 + rand() * 0.5,
      driftX: (rand() - 0.5) * 50,
      driftY: (rand() - 0.5) * 50,
      delay: rand() * 10,
    }));
  }, []);

  const hasSearch = debounced.trim().length >= 3;
  const relatedTopics = hasSearch ? getRelatedTopics(debounced) : [];
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

  return (
    <main className="search-hub">
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
              opacity: s.opacity,
              '--drift-x': `${s.driftX}px`,
              '--drift-y': `${s.driftY}px`,
              animationDelay: `${s.delay}s`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* Header */}
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            type="button"
            className="header-back-btn"
            onClick={() => router.push('/')}
            aria-label="Back to home"
          >
            ←
          </button>
          <div className="header-brand">Universe</div>
        </div>
        <div className="header-stat">{topicsExplored} topics explored</div>
      </header>

      {/* Main content */}
      <div className={`content ${hasSearch ? 'content--searching' : ''}`}>
        {/* Search container */}
        <div className="search-container">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What do you want to master today?"
              className="search-input"
              aria-label="Search topics"
            />
          </div>
          
          {!hasSearch && (
            <p className="search-hint">
              Search any finance topic — SIP, Bitcoin, Tax, AMFI Exam...
            </p>
          )}
        </div>

        {/* Results */}
        {hasSearch && (
          <div className={`results ${mounted ? 'results--visible' : ''}`}>
            {/* Primary result */}
            <button
              type="button"
              onClick={() => handleNavigate(searchSlug || 'explore')}
              className="card card--primary"
            >
              <div className="card-content">
                <h2 className="card-title">🔍 Explore: {debounced.trim()}</h2>
                <p className="card-desc">Deep dive into {debounced.trim().toLowerCase()} with unlimited depth</p>
              </div>
              <span className="card-arrow">→</span>
            </button>

            {/* Related suggestions */}
            <div className="related-grid">
              {relatedTopics.map((topic) => (
                <button
                  key={topic.slug}
                  type="button"
                  onClick={() => handleNavigate(topic.slug)}
                  className="card card--secondary"
                >
                  <div className="card-content">
                    <h3 className="card-title-sm">{topic.title}</h3>
                    <p className="card-desc-sm">{topic.description}</p>
                  </div>
                  <span className="card-arrow-sm">→</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        /* ═══════════════════════════════════════════
           BASE
           ═══════════════════════════════════════════ */
        .search-hub {
          min-height: 100vh;
          background: #000000;
          color: #ffffff;
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Inter', sans-serif;
          overflow-x: hidden;
        }

        /* ═══════════════════════════════════════════
           STARFIELD
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
          animation: drift 60s linear infinite;
        }

        @keyframes drift {
          0% { transform: translate(0, 0); }
          50% { transform: translate(var(--drift-x), var(--drift-y)); }
          100% { transform: translate(0, 0); }
        }

        /* ═══════════════════════════════════════════
           HEADER
           ═══════════════════════════════════════════ */
        .header {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          height: 80px;
          padding: 0 40px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: transparent;
        }

        .header-brand {
          font-size: 24px;
          font-weight: 300;
          color: #ffffff;
          letter-spacing: -0.02em;
        }

        .header-back-btn {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          color: #fff;
          font-size: 18px;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          cursor: pointer;
          display: grid;
          place-items: center;
          transition: background 0.2s, border-color 0.2s;
        }

        .header-back-btn:hover {
          background: rgba(255,255,255,0.12);
          border-color: rgba(255,255,255,0.25);
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
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 120px 24px 80px;
          transition: all 500ms cubic-bezier(0.23, 1, 0.32, 1);
        }

        .content--searching {
          justify-content: flex-start;
          padding-top: 160px;
        }

        /* ═══════════════════════════════════════════
           SEARCH
           ═══════════════════════════════════════════ */
        .search-container {
          width: 100%;
          max-width: 700px;
          text-align: center;
        }

        .search-bar {
          position: relative;
          width: 100%;
        }

        .search-icon {
          position: absolute;
          left: 32px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 24px;
          pointer-events: none;
          filter: grayscale(1);
        }

        .search-input {
          width: 100%;
          height: 100px;
          padding: 0 32px 0 80px;
          font-size: 20px;
          font-weight: 400;
          color: #ffffff;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 16px;
          outline: none;
          transition: all 300ms cubic-bezier(0.23, 1, 0.32, 1);
        }

        .search-input::placeholder {
          color: #737373;
        }

        .search-input:focus {
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: 0 0 40px rgba(255, 255, 255, 0.08);
        }

        .search-hint {
          margin-top: 24px;
          font-size: 14px;
          color: #737373;
        }

        @media (max-width: 768px) {
          .search-container {
            max-width: 90vw;
          }
          .search-input {
            height: 72px;
            font-size: 16px;
            padding-left: 64px;
          }
          .search-icon {
            left: 24px;
            font-size: 20px;
          }
        }

        /* ═══════════════════════════════════════════
           RESULTS
           ═══════════════════════════════════════════ */
        .results {
          width: 100%;
          max-width: 700px;
          margin-top: 48px;
          opacity: 0;
          transform: translateY(20px);
          transition: all 400ms cubic-bezier(0.23, 1, 0.32, 1);
        }

        .results--visible {
          opacity: 1;
          transform: translateY(0);
        }

        .related-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
          margin-top: 24px;
        }

        @media (max-width: 640px) {
          .related-grid {
            grid-template-columns: 1fr;
          }
        }

        /* ═══════════════════════════════════════════
           CARDS
           ═══════════════════════════════════════════ */
        .card {
          display: flex;
          align-items: center;
          gap: 24px;
          width: 100%;
          text-align: left;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          cursor: pointer;
          transition: all 300ms cubic-bezier(0.23, 1, 0.32, 1);
        }

        .card:hover {
          transform: translateY(-4px);
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.12);
          box-shadow: 0 0 40px rgba(255, 255, 255, 0.08);
        }

        .card--primary {
          min-height: 120px;
          padding: 32px;
        }

        .card--secondary {
          min-height: 80px;
          padding: 24px;
          gap: 16px;
        }

        .card-content {
          flex: 1;
          min-width: 0;
        }

        .card-title {
          font-size: 28px;
          font-weight: 300;
          color: #ffffff;
          margin: 0 0 8px;
          letter-spacing: -0.02em;
        }

        .card-title-sm {
          font-size: 18px;
          font-weight: 300;
          color: #ffffff;
          margin: 0 0 4px;
        }

        .card-desc {
          font-size: 16px;
          font-weight: 400;
          color: #9ca3af;
          margin: 0;
        }

        .card-desc-sm {
          font-size: 14px;
          font-weight: 400;
          color: #737373;
          margin: 0;
        }

        .card-arrow {
          flex-shrink: 0;
          font-size: 24px;
          color: #404040;
          transition: all 300ms cubic-bezier(0.23, 1, 0.32, 1);
        }

        .card:hover .card-arrow {
          color: #ffffff;
          transform: translateX(6px);
        }

        .card-arrow-sm {
          flex-shrink: 0;
          font-size: 18px;
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
          .star {
            animation: none;
          }
          .content,
          .results,
          .card,
          .search-input,
          .card-arrow,
          .card-arrow-sm {
            transition-duration: 0.1s;
          }
        }
      `}</style>
    </main>
  );
}
