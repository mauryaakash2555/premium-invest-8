'use client';

import { useEffect, useMemo, useState } from 'react';
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

const NEXT_DIRECTIONS: { title: string; description: string; slug: string }[] = [
  { title: 'Go Deeper', description: 'Explore advanced concepts', slug: 'advanced' },
  { title: 'Related Topic', description: 'Discover connected ideas', slug: 'related' },
  { title: 'Apply Learning', description: 'Real-world examples', slug: 'application' },
];

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
        <div className="content-card">{placeholderContent[activeTab]}</div>

        {/* Where next */}
        <section className="next-section">
          <h2 className="next-title">Where next?</h2>
          <div className="next-grid">
            {NEXT_DIRECTIONS.map((nd) => (
              <button
                key={nd.slug}
                type="button"
                onClick={() => handleNavigate(`${topicId}-${nd.slug}`)}
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
