'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';

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

type Depth = 'simple' | 'normal' | 'deep';
type Tab = 'explain' | 'examples' | 'practice' | 'flashcards' | 'quiz';

const DEPTH_LABELS: Record<Depth, { label: string; desc: string }> = {
  simple: { label: 'Simple', desc: 'Quick overview' },
  normal: { label: 'Normal', desc: 'Balanced depth' },
  deep: { label: 'Deep', desc: 'Full analysis' },
};

const TAB_LABELS: Record<Tab, string> = {
  explain: 'Explain',
  examples: 'Examples',
  practice: 'Practice',
  flashcards: 'Flashcards',
  quiz: 'Quiz',
};

function getNextTopics(topicId: string): { title: string; description: string; slug: string }[] {
  const t = String(topicId || '').toLowerCase();
  if (!t) {
    return [
      { title: 'Personal Finance Basics', description: 'Build strong fundamentals', slug: 'personal-finance-basics' },
      { title: 'Risk & Return', description: 'Understand what drives outcomes', slug: 'risk-and-return' },
      { title: 'Tax Planning', description: 'Learn 80C, LTCG, STCG basics', slug: 'tax-planning-india' },
    ];
  }

  if (t.includes('sip')) {
    return [
      { title: 'Mutual Funds', description: 'Types, NAV, expense ratio, and risks', slug: 'mutual-funds' },
      { title: 'Asset Allocation', description: 'Balance equity, debt, gold, and cash', slug: 'asset-allocation' },
      { title: 'Tax Benefits', description: 'ELSS, LTCG/STCG, and basics of 80C', slug: 'tax-benefits-investments' },
    ];
  }

  if (t.includes('bitcoin') || t.includes('crypto')) {
    return [
      { title: 'Crypto Basics', description: 'Wallets, exchanges, and key risks', slug: 'cryptocurrency-basics' },
      { title: 'Blockchain', description: 'How blocks, miners/validators work', slug: 'blockchain' },
      { title: 'Crypto Tax (India)', description: 'Basics of VDA taxes and reporting', slug: 'crypto-tax-india' },
    ];
  }

  if (t.includes('amfi') || t.includes('nism') || t.includes('exam')) {
    return [
      { title: 'Mutual Fund Types', description: 'Equity, debt, hybrid, and index funds', slug: 'mutual-fund-types' },
      { title: 'Regulatory Framework', description: 'SEBI/AMFI roles and key rules', slug: 'mutual-fund-regulatory-framework' },
      { title: 'Portfolio Construction', description: 'Risk profiling and fund selection', slug: 'portfolio-construction' },
    ];
  }

  return [
    { title: 'How It’s Regulated', description: 'SEBI/RBI rules that matter', slug: 'indian-finance-regulation' },
    { title: 'Common Mistakes', description: 'Avoid typical investor pitfalls', slug: 'common-investing-mistakes' },
    { title: 'Tax Basics (India)', description: 'LTCG, STCG, 80C, and reporting', slug: 'tax-basics-india' },
  ];
}

function seededRandom(seed: number) {
  return function () {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

function slugToTitle(slug: string): string {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

const STORAGE_KEY = 'universe_topics_explored_v1';
const PROGRESS_KEY = 'universe_topic_progress_v1';

export default function TopicLearningPage() {
  const params = useParams();
  const router = useRouter();
  const topicId = typeof params?.topicId === 'string' ? params.topicId : '';
  const topicTitle = slugToTitle(topicId);

  const [depth, setDepth] = useState<Depth>('normal');
  const [activeTab, setActiveTab] = useState<Tab>('explain');
  const [mounted, setMounted] = useState(false);

  const [contentByKey, setContentByKey] = useState<Record<string, string>>({});
  const [loadingByKey, setLoadingByKey] = useState<Record<string, boolean>>({});
  const [errorByKey, setErrorByKey] = useState<Record<string, string>>({});
  const [fallbackByKey, setFallbackByKey] = useState<Record<string, boolean>>({});

  const abortRef = useRef<AbortController | null>(null);
  const prefetchedRef = useRef<Record<string, boolean>>({});

  const nextTopics = useMemo(() => getNextTopics(topicId), [topicId]);

  const makeKey = (topic: string, d: Depth, tab: Tab) => `${topic}|${d}|${tab}`;

  const fetchContent = async (tab: Tab, d: Depth, opts?: { force?: boolean; background?: boolean }) => {
    const force = Boolean(opts?.force);
    const background = Boolean(opts?.background);

    if (!topicId) return;
    const key = makeKey(topicId, d, tab);

    if (!force && contentByKey[key]) return;

    if (!background) {
      abortRef.current?.abort();
      abortRef.current = new AbortController();
    }

    const signal = abortRef.current?.signal;

    setLoadingByKey((prev) => ({ ...prev, [key]: true }));
    setErrorByKey((prev) => ({ ...prev, [key]: '' }));
    setFallbackByKey((prev) => ({ ...prev, [key]: false }));

    try {
      const response = await fetch('/api/universe/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: topicId, depth: d, section: tab }),
        signal,
      });

      const data = (await response.json().catch(() => ({}))) as any;
      if (!response.ok) {
        const message = String(data?.error || 'Failed to load content');
        throw new Error(message);
      }

      const content = String(data?.content || '').trim();
      if (!content) throw new Error('Empty content');

      setContentByKey((prev) => ({ ...prev, [key]: content }));
      setErrorByKey((prev) => ({ ...prev, [key]: '' }));
    } catch (e: any) {
      if (String(e?.name || '') === 'AbortError') return;
      const msg = String(e?.message || 'Failed to load content');
      setErrorByKey((prev) => ({ ...prev, [key]: msg }));
      throw e;
    } finally {
      setLoadingByKey((prev) => ({ ...prev, [key]: false }));
    }
  };

  const fetchWithRetries = async (tab: Tab, d: Depth, opts?: { force?: boolean }) => {
    const key = makeKey(topicId, d, tab);
    const force = Boolean(opts?.force);

    for (let attempt = 1; attempt <= 2; attempt += 1) {
      try {
        await fetchContent(tab, d, { force });
        return;
      } catch {
        if (attempt < 2) await new Promise((r) => setTimeout(r, 400 * attempt));
      }
    }

    // Fallback (explain only): show placeholder if all retries fail
    if (tab === 'explain') {
      setFallbackByKey((prev) => ({ ...prev, [key]: true }));
    }
  };

  useEffect(() => {
    setMounted(true);
    // Track exploration
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const arr = raw ? (JSON.parse(raw) as unknown) : [];
      const next = Array.isArray(arr) ? [...arr] : [];
      if (!next.includes(topicId)) {
        next.push(topicId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      }
    } catch {
      // ignore
    }
    // Load progress
    try {
      const progressRaw = localStorage.getItem(PROGRESS_KEY);
      const progressMap = progressRaw ? (JSON.parse(progressRaw) as Record<string, { depth: Depth; tab: Tab }>) : {};
      if (progressMap[topicId]) {
        setDepth(progressMap[topicId].depth);
        setActiveTab(progressMap[topicId].tab);
      }
    } catch {
      // ignore
    }
  }, [topicId]);

  useEffect(() => {
    if (!mounted) return;
    try {
      const progressRaw = localStorage.getItem(PROGRESS_KEY);
      const progressMap = progressRaw ? (JSON.parse(progressRaw) as Record<string, { depth: Depth; tab: Tab }>) : {};
      progressMap[topicId] = { depth, tab: activeTab };
      localStorage.setItem(PROGRESS_KEY, JSON.stringify(progressMap));
    } catch {
      // ignore
    }
  }, [depth, activeTab, topicId, mounted]);

  const stars = useMemo<Star[]>(() => {
    const rand = seededRandom(20260211);
    return Array.from({ length: 150 }, (_, i) => ({
      id: i,
      x: rand() * 100,
      y: rand() * 100,
      size: rand() < 0.8 ? 1 : 2,
      opacity: 0.15 + rand() * 0.4,
      driftX: (rand() - 0.5) * 40,
      driftY: (rand() - 0.5) * 40,
      delay: rand() * 12,
    }));
  }, []);

  const handleNavigate = (slug: string) => {
    router.push(`/universe/learn/${slug}`);
  };

  const currentKey = makeKey(topicId, depth, activeTab);
  const isLoading = Boolean(loadingByKey[currentKey]);
  const error = String(errorByKey[currentKey] || '');
  const isFallback = Boolean(fallbackByKey[currentKey]);
  const content = contentByKey[currentKey] || '';

  useEffect(() => {
    if (!mounted) return;
    if (!topicId) return;
    fetchWithRetries(activeTab, depth).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, topicId, activeTab, depth]);

  useEffect(() => {
    // Preload ONE related topic in background after the first explain loads.
    if (!mounted) return;
    if (!topicId) return;
    const explainKey = makeKey(topicId, depth, 'explain');
    if (!contentByKey[explainKey]) return;
    const target = nextTopics?.[0]?.slug;
    if (!target) return;
    const prefetchKey = `${topicId}|${depth}|prefetch|${target}`;
    if (prefetchedRef.current[prefetchKey]) return;
    prefetchedRef.current[prefetchKey] = true;

    const doPrefetch = () => {
      fetch('/api/universe/generate-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: target, depth: 'normal', section: 'explain' }),
      }).catch(() => {});
    };

    // Prefer idle time when available
    // @ts-ignore
    if (typeof window !== 'undefined' && typeof (window as any).requestIdleCallback === 'function') {
      // @ts-ignore
      (window as any).requestIdleCallback(doPrefetch, { timeout: 2000 });
    } else {
      setTimeout(doPrefetch, 600);
    }
  }, [mounted, topicId, depth, contentByKey, nextTopics]);

  const renderExplain = (text: string) => {
    const blocks = String(text || '')
      .replace(/\r\n/g, '\n')
      .split(/\n\s*\n/)
      .map((x) => x.trim())
      .filter(Boolean);

    return (
      <div className={`ai-content ${text ? 'ai-content--visible' : ''}`}>
        {blocks.map((b, idx) => (
          <p key={idx} className={idx === 0 ? 'ai-lead' : 'ai-paragraph'}>
            {b}
          </p>
        ))}
      </div>
    );
  };

  const renderJsonOrText = (tab: Tab, text: string) => {
    const raw = String(text || '').trim();
    const looksJson = raw.startsWith('[') || raw.startsWith('{');
    if (!looksJson) return renderExplain(raw);

    try {
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return renderExplain(raw);

      if (tab === 'examples') {
        return (
          <div className={`ai-content ${raw ? 'ai-content--visible' : ''}`}>
            {parsed.map((ex: any, i: number) => (
              <div key={i} className="ai-block">
                <div className="ai-block-title">{String(ex?.Title || ex?.title || `Example ${i + 1}`)}</div>
                {ex?.Scenario || ex?.scenario ? <div className="ai-block-text">{String(ex?.Scenario || ex?.scenario)}</div> : null}
                {Array.isArray(ex?.Steps || ex?.steps) ? (
                  <ol className="ai-steps">
                    {(ex?.Steps || ex?.steps).slice(0, 10).map((s: any, si: number) => (
                      <li key={si}>{String(s)}</li>
                    ))}
                  </ol>
                ) : ex?.Steps || ex?.steps ? (
                  <div className="ai-block-text">{String(ex?.Steps || ex?.steps)}</div>
                ) : null}
                {ex?.Outcome || ex?.outcome ? <div className="ai-block-outcome">{String(ex?.Outcome || ex?.outcome)}</div> : null}
              </div>
            ))}
          </div>
        );
      }

      if (tab === 'practice') {
        return (
          <div className={`ai-content ${raw ? 'ai-content--visible' : ''}`}>
            {parsed.map((q: any, i: number) => (
              <div key={i} className="ai-block">
                <div className="ai-block-title">Q{i + 1}. {String(q?.Question || q?.question || '')}</div>
                <div className="ai-block-text">{String(q?.Answer || q?.answer || '')}</div>
              </div>
            ))}
          </div>
        );
      }

      if (tab === 'flashcards') {
        return (
          <div className={`ai-content ${raw ? 'ai-content--visible' : ''}`}>
            <div className="ai-grid">
              {parsed.map((c: any, i: number) => (
                <div key={i} className="ai-card">
                  <div className="ai-card-front">{String(c?.Front || c?.front || '')}</div>
                  <div className="ai-card-back">{String(c?.Back || c?.back || '')}</div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      if (tab === 'quiz') {
        return (
          <div className={`ai-content ${raw ? 'ai-content--visible' : ''}`}>
            {parsed.map((q: any, i: number) => {
              const options = Array.isArray(q?.Options || q?.options) ? (q?.Options || q?.options) : [];
              const correct = Number(q?.Correct ?? q?.correct);
              return (
                <div key={i} className="ai-block">
                  <div className="ai-block-title">Q{i + 1}. {String(q?.Question || q?.question || '')}</div>
                  <ul className="ai-options">
                    {options.slice(0, 4).map((opt: any, oi: number) => (
                      <li key={oi} className={oi === correct ? 'ai-option ai-option--correct' : 'ai-option'}>
                        {String(opt)}
                      </li>
                    ))}
                  </ul>
                  {q?.Explanation || q?.explanation ? (
                    <div className="ai-block-outcome">{String(q?.Explanation || q?.explanation)}</div>
                  ) : null}
                </div>
              );
            })}
          </div>
        );
      }

      return renderExplain(raw);
    } catch {
      return renderExplain(raw);
    }
  };

  const renderActiveContent = () => {
    if (isLoading) {
      return (
        <div className="skeleton" aria-busy="true" aria-live="polite">
          <div className="skeleton-meta">Generating with AI…</div>
          <div className="skeleton-title" />
          <div className="skeleton-line" />
          <div className="skeleton-line" />
          <div className="skeleton-line" />
          <div className="skeleton-line short" />
          <div className="skeleton-block" />
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-box">
          <div className="error-title">Failed to load content. Try again?</div>
          <div className="error-desc">{error}</div>
          <div className="error-actions">
            <button
              type="button"
              className="retry-btn"
              onClick={() => fetchWithRetries(activeTab, depth, { force: true }).catch(() => {})}
            >
              Retry
            </button>
          </div>
          {isFallback ? <div className="fallback">{placeholderContent[activeTab]}</div> : null}
        </div>
      );
    }

    if (content) {
      return activeTab === 'explain' ? renderExplain(content) : renderJsonOrText(activeTab, content);
    }

    return placeholderContent[activeTab];
  };

  const placeholderContent: Record<Tab, React.ReactNode> = {
    explain: (
      <div className="placeholder-content">
        <p className="placeholder-lead">What is {topicTitle}?</p>
        <p className="placeholder-text">
          This section will provide a comprehensive explanation of {topicTitle.toLowerCase()} at the{' '}
          <strong>{DEPTH_LABELS[depth].label.toLowerCase()}</strong> level.
        </p>
        <p className="placeholder-text">
          Content will be dynamically generated using AI to match your selected depth and learning pace.
        </p>
      </div>
    ),
    examples: (
      <div className="placeholder-content">
        <p className="placeholder-lead">Real-World Examples</p>
        <p className="placeholder-text">
          Practical examples demonstrating {topicTitle.toLowerCase()} in action. Each example will be tailored to the{' '}
          <strong>{DEPTH_LABELS[depth].label.toLowerCase()}</strong> complexity level.
        </p>
      </div>
    ),
    practice: (
      <div className="placeholder-content">
        <p className="placeholder-lead">Practice Problems</p>
        <p className="placeholder-text">
          Interactive exercises to solidify your understanding of {topicTitle.toLowerCase()}. Problems will scale based
          on the <strong>{DEPTH_LABELS[depth].label.toLowerCase()}</strong> setting.
        </p>
      </div>
    ),
    flashcards: (
      <div className="placeholder-content">
        <p className="placeholder-lead">Flashcards</p>
        <p className="placeholder-text">
          Key concepts from {topicTitle.toLowerCase()} presented as flashcards for quick review and memorization.
        </p>
      </div>
    ),
    quiz: (
      <div className="placeholder-content">
        <p className="placeholder-lead">Knowledge Check</p>
        <p className="placeholder-text">
          Test your understanding of {topicTitle.toLowerCase()} with a quiz tailored to your{' '}
          <strong>{DEPTH_LABELS[depth].label.toLowerCase()}</strong> depth setting.
        </p>
      </div>
    ),
  };

  return (
    <main className="learning-page">
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
        <button type="button" onClick={() => router.push('/universe/learn')} className="header-back">
          ← Back
        </button>
      </header>

      {/* Content */}
      <div className={`content ${mounted ? 'content--visible' : ''}`}>
        {/* Breadcrumbs */}
        <nav className="breadcrumb" aria-label="Breadcrumb">
          <button type="button" onClick={() => router.push('/universe')} className="bread-link">
            Universe
          </button>
          <span className="bread-sep">/</span>
          <button type="button" onClick={() => router.push('/universe/learn')} className="bread-link">
            Learn
          </button>
          <span className="bread-sep">/</span>
          <span className="bread-current">{topicTitle}</span>
        </nav>

        {/* Title */}
        <h1 className="title">{topicTitle}</h1>

        {/* Depth selector */}
        <div className="depth-selector">
          {(['simple', 'normal', 'deep'] as Depth[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDepth(d)}
              className={`depth-btn ${depth === d ? 'depth-btn--active' : ''}`}
            >
              <span className="depth-label">{DEPTH_LABELS[d].label}</span>
              <span className="depth-desc">{DEPTH_LABELS[d].desc}</span>
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="tabs">
          {(['explain', 'examples', 'practice', 'flashcards', 'quiz'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setActiveTab(t)}
              className={`tab-btn ${activeTab === t ? 'tab-btn--active' : ''}`}
            >
              {TAB_LABELS[t]}
            </button>
          ))}
        </div>

        {/* Content area */}
        <div className="content-card">{renderActiveContent()}</div>

        {/* Where next */}
        <section className="next-section">
          <h2 className="next-title">Where next?</h2>
          <div className="next-grid">
            {nextTopics.map((nd) => (
              <button
                key={nd.slug}
                type="button"
                onClick={() => handleNavigate(nd.slug)}
                className="next-card"
              >
                <div className="next-card-content">
                  <h3 className="next-card-title">{nd.title}</h3>
                  <p className="next-card-desc">{nd.description}</p>
                </div>
                <span className="next-card-arrow">→</span>
              </button>
            ))}
          </div>
        </section>
      </div>

      <style jsx>{`
        /* ═══════════════════════════════════════════
           BASE
           ═══════════════════════════════════════════ */
        .learning-page {
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
          animation: drift 80s linear infinite;
        }

        @keyframes drift {
          0% {
            transform: translate(0, 0);
          }
          50% {
            transform: translate(var(--drift-x), var(--drift-y));
          }
          100% {
            transform: translate(0, 0);
          }
        }

        /* ═══════════════════════════════════════════
           HEADER
           ═══════════════════════════════════════════ */
        .header {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          height: 72px;
          padding: 0 32px;
          display: flex;
          align-items: center;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .header-back {
          font-size: 14px;
          font-weight: 400;
          color: #737373;
          background: none;
          border: none;
          cursor: pointer;
          transition: color 300ms cubic-bezier(0.23, 1, 0.32, 1);
        }

        .header-back:hover {
          color: #ffffff;
        }

        /* ═══════════════════════════════════════════
           CONTENT
           ═══════════════════════════════════════════ */
        .content {
          position: relative;
          z-index: 10;
          max-width: 800px;
          margin: 0 auto;
          padding: 120px 24px 100px;
          opacity: 0;
          transform: translateY(20px);
          transition: all 400ms cubic-bezier(0.23, 1, 0.32, 1);
        }

        .content--visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* ═══════════════════════════════════════════
           BREADCRUMB
           ═══════════════════════════════════════════ */
        .breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 24px;
          font-size: 14px;
        }

        .bread-link {
          color: #737373;
          background: none;
          border: none;
          cursor: pointer;
          transition: color 300ms cubic-bezier(0.23, 1, 0.32, 1);
        }

        .bread-link:hover {
          color: #ffffff;
        }

        .bread-sep {
          color: #404040;
        }

        .bread-current {
          color: #e5e5e5;
        }

        /* ═══════════════════════════════════════════
           TITLE
           ═══════════════════════════════════════════ */
        .title {
          font-size: clamp(32px, 6vw, 48px);
          font-weight: 300;
          color: #ffffff;
          letter-spacing: -0.03em;
          margin: 0 0 40px;
        }

        /* ═══════════════════════════════════════════
           DEPTH SELECTOR
           ═══════════════════════════════════════════ */
        .depth-selector {
          display: flex;
          gap: 16px;
          margin-bottom: 32px;
        }

        .depth-btn {
          flex: 1;
          padding: 20px 16px;
          text-align: center;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          cursor: pointer;
          transition: all 300ms cubic-bezier(0.23, 1, 0.32, 1);
        }

        .depth-btn:hover {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.1);
        }

        .depth-btn--active {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: 0 0 24px rgba(255, 255, 255, 0.06);
        }

        .depth-label {
          display: block;
          font-size: 16px;
          font-weight: 500;
          color: #ffffff;
          margin-bottom: 4px;
        }

        .depth-desc {
          display: block;
          font-size: 12px;
          color: #737373;
        }

        @media (max-width: 640px) {
          .depth-selector {
            flex-direction: column;
          }
          .depth-btn {
            padding: 16px;
          }
        }

        /* ═══════════════════════════════════════════
           TABS
           ═══════════════════════════════════════════ */
        .tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 24px;
          overflow-x: auto;
          padding-bottom: 4px;
        }

        .tab-btn {
          padding: 12px 20px;
          font-size: 14px;
          font-weight: 400;
          color: #737373;
          background: transparent;
          border: 1px solid transparent;
          border-radius: 8px;
          cursor: pointer;
          white-space: nowrap;
          transition: all 300ms cubic-bezier(0.23, 1, 0.32, 1);
        }

        .tab-btn:hover {
          color: #e5e5e5;
          background: rgba(255, 255, 255, 0.03);
        }

        .tab-btn--active {
          color: #ffffff;
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.1);
        }

        /* ═══════════════════════════════════════════
           CONTENT CARD
           ═══════════════════════════════════════════ */
        .content-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 48px 40px;
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
          min-height: 300px;
        }

        .placeholder-content {
          max-width: 600px;
        }

        .placeholder-lead {
          font-size: 24px;
          font-weight: 300;
          color: #ffffff;
          margin: 0 0 24px;
          letter-spacing: -0.02em;
        }

        .placeholder-text {
          font-size: 16px;
          font-weight: 400;
          color: #9ca3af;
          line-height: 1.7;
          margin: 0 0 16px;
        }

        .placeholder-text strong {
          color: #e5e5e5;
        }

        /* ═══════════════════════════════════════════
           AI CONTENT + STATES
           ═══════════════════════════════════════════ */
        .ai-content {
          opacity: 0;
          transform: translateY(6px);
          transition: opacity 280ms cubic-bezier(0.23, 1, 0.32, 1), transform 280ms cubic-bezier(0.23, 1, 0.32, 1);
        }

        .ai-content--visible {
          opacity: 1;
          transform: translateY(0);
        }

        .ai-lead {
          font-size: 18px;
          font-weight: 400;
          color: #e5e5e5;
          line-height: 1.75;
          margin: 0 0 18px;
        }

        .ai-paragraph {
          font-size: 16px;
          font-weight: 400;
          color: #9ca3af;
          line-height: 1.8;
          margin: 0 0 16px;
          white-space: pre-wrap;
        }

        .ai-block {
          padding: 20px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          margin-bottom: 16px;
        }

        .ai-block-title {
          font-size: 15px;
          font-weight: 500;
          color: #ffffff;
          margin: 0 0 10px;
        }

        .ai-block-text {
          font-size: 14px;
          color: #9ca3af;
          line-height: 1.7;
          margin: 0 0 10px;
          white-space: pre-wrap;
        }

        .ai-block-outcome {
          font-size: 13px;
          color: #e5e5e5;
          line-height: 1.7;
          margin: 0;
          opacity: 0.9;
          white-space: pre-wrap;
        }

        .ai-steps {
          margin: 10px 0 0;
          padding-left: 18px;
          color: #9ca3af;
          line-height: 1.7;
        }

        .ai-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 14px;
        }

        @media (max-width: 640px) {
          .ai-grid {
            grid-template-columns: 1fr;
          }
        }

        .ai-card {
          padding: 18px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
        }

        .ai-card-front {
          font-size: 14px;
          font-weight: 500;
          color: #ffffff;
          margin: 0 0 10px;
        }

        .ai-card-back {
          font-size: 13px;
          color: #9ca3af;
          line-height: 1.7;
          margin: 0;
        }

        .ai-options {
          margin: 10px 0;
          padding-left: 0;
          list-style: none;
          display: grid;
          gap: 8px;
        }

        .ai-option {
          padding: 10px 12px;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          color: #9ca3af;
          line-height: 1.5;
        }

        .ai-option--correct {
          color: #ffffff;
          border-color: rgba(255, 255, 255, 0.16);
          background: rgba(255, 255, 255, 0.05);
        }

        .skeleton {
          max-width: 640px;
        }

        .skeleton-meta {
          font-size: 13px;
          color: #737373;
          margin: 0 0 14px;
        }

        .skeleton-title,
        .skeleton-line,
        .skeleton-block {
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.06);
          animation: pulse 1.2s ease-in-out infinite;
        }

        .skeleton-title {
          height: 22px;
          width: 55%;
          margin-bottom: 16px;
        }

        .skeleton-line {
          height: 12px;
          width: 100%;
          margin-bottom: 12px;
        }

        .skeleton-line.short {
          width: 78%;
        }

        .skeleton-block {
          height: 90px;
          width: 100%;
          margin-top: 18px;
        }

        @keyframes pulse {
          0% {
            opacity: 0.55;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.55;
          }
        }

        .error-box {
          max-width: 640px;
        }

        .error-title {
          font-size: 18px;
          font-weight: 500;
          color: #ffffff;
          margin: 0 0 10px;
        }

        .error-desc {
          font-size: 14px;
          color: #9ca3af;
          line-height: 1.7;
          margin: 0 0 18px;
        }

        .error-actions {
          display: flex;
          gap: 10px;
          margin-bottom: 18px;
        }

        .retry-btn {
          padding: 10px 14px;
          font-size: 14px;
          color: #ffffff;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 10px;
          cursor: pointer;
          transition: all 250ms cubic-bezier(0.23, 1, 0.32, 1);
        }

        .retry-btn:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.16);
        }

        .fallback {
          margin-top: 8px;
        }

        @media (max-width: 640px) {
          .content-card {
            padding: 32px 24px;
          }
        }

        /* ═══════════════════════════════════════════
           WHERE NEXT
           ═══════════════════════════════════════════ */
        .next-section {
          margin-top: 64px;
        }

        .next-title {
          font-size: 20px;
          font-weight: 300;
          color: #e5e5e5;
          margin: 0 0 24px;
          letter-spacing: -0.01em;
        }

        .next-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        @media (max-width: 768px) {
          .next-grid {
            grid-template-columns: 1fr;
          }
        }

        .next-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 24px;
          text-align: left;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          cursor: pointer;
          transition: all 300ms cubic-bezier(0.23, 1, 0.32, 1);
        }

        .next-card:hover {
          transform: translateY(-4px);
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.12);
          box-shadow: 0 0 40px rgba(255, 255, 255, 0.08);
        }

        .next-card-content {
          flex: 1;
          min-width: 0;
        }

        .next-card-title {
          font-size: 16px;
          font-weight: 500;
          color: #ffffff;
          margin: 0 0 4px;
        }

        .next-card-desc {
          font-size: 13px;
          color: #737373;
          margin: 0;
        }

        .next-card-arrow {
          flex-shrink: 0;
          font-size: 18px;
          color: #404040;
          transition: all 300ms cubic-bezier(0.23, 1, 0.32, 1);
        }

        .next-card:hover .next-card-arrow {
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
          .depth-btn,
          .tab-btn,
          .next-card,
          .header-back,
          .bread-link,
          .next-card-arrow {
            transition-duration: 0.1s;
          }
        }
      `}</style>
    </main>
  );
}
