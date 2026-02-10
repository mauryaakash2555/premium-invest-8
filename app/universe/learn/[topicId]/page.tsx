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

  // Interactive state
  const [flippedCards, setFlippedCards] = useState<Record<number, boolean>>({});
  const [selectedQuizAnswers, setSelectedQuizAnswers] = useState<Record<number, number | null>>({});
  const [revealedPractice, setRevealedPractice] = useState<Record<number, boolean>>({});

  // Collapse/expand state - show 3 initially
  const [expandedExamples, setExpandedExamples] = useState(false);
  const [expandedPractice, setExpandedPractice] = useState(false);
  const [expandedFlashcards, setExpandedFlashcards] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const INITIAL_SHOW_COUNT = 3;

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

  // Reset interactive state when content changes
  useEffect(() => {
    setFlippedCards({});
    setSelectedQuizAnswers({});
    setRevealedPractice({});
    setExpandedExamples(false);
    setExpandedPractice(false);
    setExpandedFlashcards(false);
    setCurrentQuizIndex(0);
  }, [currentKey, content]);

  // Handle back navigation - step by step
  function handleBack() {
    if (activeTab !== 'explain') {
      setActiveTab('explain');
    } else {
      router.push('/universe/learn');
    }
  }

  const parseJsonContent = (text: string): any[] | null => {
    let raw = String(text || '').trim();
    // Strip markdown code fences
    raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
    if (!raw.startsWith('[') && !raw.startsWith('{')) return null;
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  };

  const renderJsonOrText = (tab: Tab, text: string) => {
    const parsed = parseJsonContent(text);
    if (!parsed) return renderExplain(text);

    if (tab === 'examples') {
      const visibleItems = expandedExamples ? parsed : parsed.slice(0, INITIAL_SHOW_COUNT);
      const hasMore = parsed.length > INITIAL_SHOW_COUNT;
      return (
        <div className="ai-content ai-content--visible">
          <div className="section-header">
            <span className="section-icon">📚</span>
            <span className="section-title">Real-World Scenarios</span>
            <span className="section-count">{parsed.length} examples</span>
          </div>
          {visibleItems.map((ex: any, i: number) => (
            <div key={i} className="example-card">
              <div className="example-number">{i + 1}</div>
              <div className="example-content">
                <div className="example-title">{String(ex?.Title || ex?.title || `Example ${i + 1}`)}</div>
                {(ex?.Scenario || ex?.scenario) && (
                  <div className="example-scenario">{String(ex?.Scenario || ex?.scenario)}</div>
                )}
                {Array.isArray(ex?.Steps || ex?.steps) && (
                  <div className="example-steps">
                    {(ex?.Steps || ex?.steps).slice(0, 5).map((s: any, si: number) => (
                      <div key={si} className="example-step">
                        <span className="step-dot" />
                        <span className="step-text">{String(s)}</span>
                      </div>
                    ))}
                  </div>
                )}
                {(ex?.Outcome || ex?.outcome) && (
                  <div className="example-outcome">
                    <span className="outcome-icon">✓</span>
                    <span>{String(ex?.Outcome || ex?.outcome)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {hasMore && (
            <button
              type="button"
              className="show-more-btn"
              onClick={() => setExpandedExamples(!expandedExamples)}
            >
              {expandedExamples ? 'Show Less ↑' : `Show ${parsed.length - INITIAL_SHOW_COUNT} More Examples ↓`}
            </button>
          )}
        </div>
      );
    }

    if (tab === 'practice') {
      const visibleItems = expandedPractice ? parsed : parsed.slice(0, INITIAL_SHOW_COUNT);
      const hasMore = parsed.length > INITIAL_SHOW_COUNT;
      return (
        <div className="ai-content ai-content--visible">
          <div className="section-header">
            <span className="section-icon">🧠</span>
            <span className="section-title">Think & Learn</span>
            <span className="section-count">Click to reveal</span>
          </div>
          {visibleItems.map((q: any, i: number) => {
            const isRevealed = Boolean(revealedPractice[i]);
            return (
              <div key={i} className="practice-card">
                <div className="practice-question">
                  <span className="practice-q-num">Q{i + 1}</span>
                  <span className="practice-q-text">{String(q?.Question || q?.question || '')}</span>
                </div>
                {isRevealed ? (
                  <div className="practice-answer practice-answer--visible">
                    <div className="practice-answer-label">Answer</div>
                    <div className="practice-answer-text">{String(q?.Answer || q?.answer || '')}</div>
                  </div>
                ) : (
                  <button
                    type="button"
                    className="practice-reveal-btn"
                    onClick={() => setRevealedPractice((prev) => ({ ...prev, [i]: true }))}
                  >
                    <span>Show Answer</span>
                    <span className="reveal-icon">↓</span>
                  </button>
                )}
              </div>
            );
          })}
          {hasMore && (
            <button
              type="button"
              className="show-more-btn"
              onClick={() => setExpandedPractice(!expandedPractice)}
            >
              {expandedPractice ? 'Show Less ↑' : `Show ${parsed.length - INITIAL_SHOW_COUNT} More Questions ↓`}
            </button>
          )}
        </div>
      );
    }

    if (tab === 'flashcards') {
      const visibleItems = expandedFlashcards ? parsed : parsed.slice(0, INITIAL_SHOW_COUNT);
      const hasMore = parsed.length > INITIAL_SHOW_COUNT;
      return (
        <div className="ai-content ai-content--visible">
          <div className="section-header">
            <span className="section-icon">🎴</span>
            <span className="section-title">Tap to Flip</span>
            <span className="section-count">{parsed.length} cards</span>
          </div>
          <div className="flashcards-grid">
            {visibleItems.map((c: any, i: number) => {
              const isFlipped = Boolean(flippedCards[i]);
              return (
                <button
                  key={i}
                  type="button"
                  className={`flashcard ${isFlipped ? 'flashcard--flipped' : ''}`}
                  onClick={() => setFlippedCards((prev) => ({ ...prev, [i]: !prev[i] }))}
                >
                  <div className="flashcard-inner">
                    <div className="flashcard-front">
                      <span className="flashcard-label">Q</span>
                      <span className="flashcard-text">{String(c?.Front || c?.front || '')}</span>
                    </div>
                    <div className="flashcard-back">
                      <span className="flashcard-label">A</span>
                      <span className="flashcard-text">{String(c?.Back || c?.back || '')}</span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
          {hasMore && (
            <button
              type="button"
              className="show-more-btn"
              onClick={() => setExpandedFlashcards(!expandedFlashcards)}
            >
              {expandedFlashcards ? 'Show Less ↑' : `Show ${parsed.length - INITIAL_SHOW_COUNT} More Cards ↓`}
            </button>
          )}
        </div>
      );
    }

    if (tab === 'quiz') {
      const totalQuestions = parsed.length;
      const answeredCount = Object.keys(selectedQuizAnswers).filter((k) => selectedQuizAnswers[Number(k)] !== null).length;
      const correctCount = Object.entries(selectedQuizAnswers).filter(([k, v]) => {
        const q = parsed[Number(k)];
        const correct = Number(q?.Correct ?? q?.correct);
        return v === correct;
      }).length;

      // Show one question at a time
      const q = parsed[currentQuizIndex];
      if (!q) return renderExplain(text);

      const options = Array.isArray(q?.Options || q?.options) ? (q?.Options || q?.options) : [];
      const correct = Number(q?.Correct ?? q?.correct);
      const selected = selectedQuizAnswers[currentQuizIndex];
      const hasAnswered = selected !== undefined && selected !== null;

      return (
        <div className="ai-content ai-content--visible">
          <div className="section-header">
            <span className="section-icon">🎯</span>
            <span className="section-title">Quiz Mode</span>
            <span className="section-count">
              {answeredCount > 0 ? `${correctCount}/${answeredCount} correct` : ''}
            </span>
          </div>

          {/* Progress indicator */}
          <div className="quiz-progress">
            {parsed.map((_: any, idx: number) => {
              const isAnswered = selectedQuizAnswers[idx] !== undefined && selectedQuizAnswers[idx] !== null;
              const wasCorrect = isAnswered && selectedQuizAnswers[idx] === Number(parsed[idx]?.Correct ?? parsed[idx]?.correct);
              let dotClass = 'quiz-dot';
              if (idx === currentQuizIndex) dotClass += ' quiz-dot--active';
              else if (isAnswered && wasCorrect) dotClass += ' quiz-dot--correct';
              else if (isAnswered) dotClass += ' quiz-dot--wrong';
              return (
                <button
                  key={idx}
                  type="button"
                  className={dotClass}
                  onClick={() => setCurrentQuizIndex(idx)}
                  aria-label={`Question ${idx + 1}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Single question card */}
          <div className="quiz-card quiz-card--single">
            <div className="quiz-question">
              <span className="quiz-q-num">{currentQuizIndex + 1}/{totalQuestions}</span>
              <span className="quiz-q-text">{String(q?.Question || q?.question || '')}</span>
            </div>
            <div className="quiz-options">
              {options.slice(0, 4).map((opt: any, oi: number) => {
                let optClass = 'quiz-option';
                if (hasAnswered) {
                  if (oi === correct) optClass += ' quiz-option--correct';
                  else if (oi === selected) optClass += ' quiz-option--wrong';
                }
                return (
                  <button
                    key={oi}
                    type="button"
                    className={optClass}
                    disabled={hasAnswered}
                    onClick={() => setSelectedQuizAnswers((prev) => ({ ...prev, [currentQuizIndex]: oi }))}
                  >
                    <span className="quiz-option-letter">{['A', 'B', 'C', 'D'][oi]}</span>
                    <span className="quiz-option-text">{String(opt)}</span>
                    {hasAnswered && oi === correct && <span className="quiz-check">✓</span>}
                    {hasAnswered && oi === selected && oi !== correct && <span className="quiz-x">✗</span>}
                  </button>
                );
              })}
            </div>
            {hasAnswered && (q?.Explanation || q?.explanation) && (
              <div className="quiz-explanation">
                <span className="explanation-icon">💡</span>
                <span>{String(q?.Explanation || q?.explanation)}</span>
              </div>
            )}
          </div>

          {/* Navigation buttons */}
          <div className="quiz-nav">
            <button
              type="button"
              className="quiz-nav-btn"
              disabled={currentQuizIndex === 0}
              onClick={() => setCurrentQuizIndex((p) => Math.max(0, p - 1))}
            >
              ← Previous
            </button>
            {currentQuizIndex < totalQuestions - 1 ? (
              <button
                type="button"
                className="quiz-nav-btn quiz-nav-btn--primary"
                onClick={() => setCurrentQuizIndex((p) => Math.min(totalQuestions - 1, p + 1))}
              >
                Next →
              </button>
            ) : (
              <div className="quiz-complete">
                {answeredCount === totalQuestions && (
                  <span className="quiz-result">
                    🎉 Score: {correctCount}/{totalQuestions}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return renderExplain(text);
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
        <button type="button" onClick={handleBack} className="header-back">
          ← {activeTab !== 'explain' ? 'Back to Explain' : 'Back'}
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
           INTERACTIVE EXAMPLES
           ═══════════════════════════════════════════ */
        .examples-header, .practice-header, .flashcards-header, .quiz-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .examples-icon, .practice-icon, .flashcards-icon, .quiz-icon {
          font-size: 24px;
        }

        .examples-title, .practice-title, .flashcards-title, .quiz-title {
          font-size: 18px;
          font-weight: 500;
          color: #ffffff;
        }

        .practice-hint, .flashcards-count, .quiz-score {
          margin-left: auto;
          font-size: 13px;
          color: #737373;
        }

        .example-card {
          display: flex;
          gap: 16px;
          padding: 20px;
          background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          margin-bottom: 16px;
          transition: all 300ms cubic-bezier(0.23, 1, 0.32, 1);
        }

        .example-card:hover {
          border-color: rgba(255, 255, 255, 0.14);
          transform: translateY(-2px);
        }

        .example-number {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          color: #000;
          background: linear-gradient(135deg, #fff 0%, #d4d4d4 100%);
          border-radius: 50%;
          flex-shrink: 0;
        }

        .example-content {
          flex: 1;
          min-width: 0;
        }

        .example-title {
          font-size: 16px;
          font-weight: 500;
          color: #ffffff;
          margin: 0 0 10px;
        }

        .example-scenario {
          font-size: 14px;
          color: #9ca3af;
          line-height: 1.7;
          margin: 0 0 14px;
        }

        .example-steps {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 14px;
        }

        .example-step {
          display: flex;
          align-items: flex-start;
          gap: 10px;
        }

        .step-dot {
          width: 6px;
          height: 6px;
          background: #737373;
          border-radius: 50%;
          margin-top: 7px;
          flex-shrink: 0;
        }

        .step-text {
          font-size: 13px;
          color: #9ca3af;
          line-height: 1.6;
        }

        .example-outcome {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 12px;
          background: rgba(34, 197, 94, 0.08);
          border: 1px solid rgba(34, 197, 94, 0.2);
          border-radius: 10px;
        }

        .outcome-icon {
          color: #22c55e;
          font-weight: 600;
        }

        .example-outcome span:last-child {
          font-size: 13px;
          color: #a3e635;
          line-height: 1.6;
        }

        /* ═══════════════════════════════════════════
           INTERACTIVE PRACTICE
           ═══════════════════════════════════════════ */
        .practice-card {
          padding: 20px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          margin-bottom: 16px;
        }

        .practice-question {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
        }

        .practice-q-num {
          padding: 4px 10px;
          font-size: 12px;
          font-weight: 600;
          color: #000;
          background: linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%);
          border-radius: 6px;
          flex-shrink: 0;
        }

        .practice-q-text {
          font-size: 15px;
          font-weight: 500;
          color: #ffffff;
          line-height: 1.6;
        }

        .practice-reveal-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 14px;
          font-size: 14px;
          font-weight: 500;
          color: #a78bfa;
          background: rgba(167, 139, 250, 0.08);
          border: 1px dashed rgba(167, 139, 250, 0.3);
          border-radius: 10px;
          cursor: pointer;
          transition: all 250ms cubic-bezier(0.23, 1, 0.32, 1);
        }

        .practice-reveal-btn:hover {
          background: rgba(167, 139, 250, 0.14);
          border-style: solid;
        }

        .reveal-icon {
          font-size: 12px;
        }

        .practice-answer {
          padding: 16px;
          background: rgba(167, 139, 250, 0.06);
          border: 1px solid rgba(167, 139, 250, 0.15);
          border-radius: 10px;
          opacity: 0;
          transform: translateY(-8px);
          animation: fadeSlideIn 300ms cubic-bezier(0.23, 1, 0.32, 1) forwards;
        }

        .practice-answer--visible {
          opacity: 1;
          transform: translateY(0);
        }

        .practice-answer-label {
          font-size: 11px;
          font-weight: 600;
          color: #a78bfa;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 8px;
        }

        .practice-answer-text {
          font-size: 14px;
          color: #e5e5e5;
          line-height: 1.7;
        }

        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        /* ═══════════════════════════════════════════
           INTERACTIVE FLASHCARDS (3D FLIP)
           ═══════════════════════════════════════════ */
        .flashcards-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        @media (max-width: 640px) {
          .flashcards-grid {
            grid-template-columns: 1fr;
          }
        }

        .flashcard {
          perspective: 1000px;
          width: 100%;
          height: 180px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
        }

        .flashcard-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transform-style: preserve-3d;
          transition: transform 500ms cubic-bezier(0.23, 1, 0.32, 1);
        }

        .flashcard--flipped .flashcard-inner {
          transform: rotateY(180deg);
        }

        .flashcard-front, .flashcard-back {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 20px;
          border-radius: 14px;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          text-align: center;
        }

        .flashcard-front {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.12) 0%, rgba(59, 130, 246, 0.04) 100%);
          border: 1px solid rgba(59, 130, 246, 0.25);
        }

        .flashcard-back {
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.12) 0%, rgba(34, 197, 94, 0.04) 100%);
          border: 1px solid rgba(34, 197, 94, 0.25);
          transform: rotateY(180deg);
        }

        .flashcard-label {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          border-radius: 50%;
        }

        .flashcard-front .flashcard-label {
          color: #3b82f6;
          background: rgba(59, 130, 246, 0.2);
        }

        .flashcard-back .flashcard-label {
          color: #22c55e;
          background: rgba(34, 197, 94, 0.2);
        }

        .flashcard-text {
          font-size: 14px;
          line-height: 1.6;
          color: #e5e5e5;
        }

        .flashcard:hover .flashcard-inner {
          transform: scale(1.02);
        }

        .flashcard--flipped:hover .flashcard-inner {
          transform: rotateY(180deg) scale(1.02);
        }

        /* ═══════════════════════════════════════════
           INTERACTIVE QUIZ
           ═══════════════════════════════════════════ */
        .quiz-card {
          padding: 24px;
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          margin-bottom: 20px;
        }

        .quiz-question {
          display: flex;
          gap: 14px;
          margin-bottom: 18px;
        }

        .quiz-q-num {
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 600;
          color: #000;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          border-radius: 50%;
          flex-shrink: 0;
        }

        .quiz-q-text {
          font-size: 16px;
          font-weight: 500;
          color: #ffffff;
          line-height: 1.6;
          padding-top: 2px;
        }

        .quiz-options {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .quiz-option {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 14px 16px;
          font-size: 14px;
          color: #e5e5e5;
          text-align: left;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          cursor: pointer;
          transition: all 200ms cubic-bezier(0.23, 1, 0.32, 1);
        }

        .quiz-option:not(:disabled):hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.15);
          transform: translateX(4px);
        }

        .quiz-option:disabled {
          cursor: default;
        }

        .quiz-option-letter {
          width: 26px;
          height: 26px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          color: #737373;
          background: rgba(255, 255, 255, 0.06);
          border-radius: 6px;
          flex-shrink: 0;
        }

        .quiz-option-text {
          flex: 1;
          line-height: 1.5;
        }

        .quiz-check, .quiz-x {
          font-size: 16px;
          font-weight: 600;
          margin-left: auto;
        }

        .quiz-check {
          color: #22c55e;
        }

        .quiz-x {
          color: #ef4444;
        }

        .quiz-option--correct {
          background: rgba(34, 197, 94, 0.1);
          border-color: rgba(34, 197, 94, 0.3);
        }

        .quiz-option--correct .quiz-option-letter {
          color: #22c55e;
          background: rgba(34, 197, 94, 0.2);
        }

        .quiz-option--wrong {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.3);
        }

        .quiz-option--wrong .quiz-option-letter {
          color: #ef4444;
          background: rgba(239, 68, 68, 0.2);
        }

        .quiz-explanation {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin-top: 16px;
          padding: 14px;
          background: rgba(251, 191, 36, 0.08);
          border: 1px solid rgba(251, 191, 36, 0.2);
          border-radius: 10px;
          font-size: 13px;
          color: #fde68a;
          line-height: 1.6;
          animation: fadeSlideIn 300ms cubic-bezier(0.23, 1, 0.32, 1) forwards;
        }

        .explanation-icon {
          font-size: 16px;
          flex-shrink: 0;
        }

        /* ═══════════════════════════════════════════
           UNIFIED SECTION HEADER
           ═══════════════════════════════════════════ */
        .section-header {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .section-icon {
          font-size: 24px;
        }

        .section-title {
          font-size: 18px;
          font-weight: 500;
          color: #ffffff;
        }

        .section-count {
          margin-left: auto;
          font-size: 13px;
          color: #737373;
        }

        /* ═══════════════════════════════════════════
           SHOW MORE BUTTON
           ═══════════════════════════════════════════ */
        .show-more-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 16px;
          margin-top: 16px;
          font-size: 14px;
          font-weight: 500;
          color: #d4af37;
          background: rgba(212, 175, 55, 0.06);
          border: 1px dashed rgba(212, 175, 55, 0.3);
          border-radius: 12px;
          cursor: pointer;
          transition: all 250ms cubic-bezier(0.23, 1, 0.32, 1);
        }

        .show-more-btn:hover {
          background: rgba(212, 175, 55, 0.12);
          border-style: solid;
          transform: translateY(-2px);
        }

        /* ═══════════════════════════════════════════
           QUIZ NAVIGATION (ONE AT A TIME)
           ═══════════════════════════════════════════ */
        .quiz-progress {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 24px;
          justify-content: center;
        }

        .quiz-dot {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 600;
          color: #737373;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 50%;
          cursor: pointer;
          transition: all 200ms cubic-bezier(0.23, 1, 0.32, 1);
        }

        .quiz-dot:hover {
          background: rgba(255, 255, 255, 0.08);
          border-color: rgba(255, 255, 255, 0.15);
        }

        .quiz-dot--active {
          color: #000;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          border-color: transparent;
        }

        .quiz-dot--correct {
          color: #fff;
          background: rgba(34, 197, 94, 0.9);
          border-color: transparent;
        }

        .quiz-dot--wrong {
          color: #fff;
          background: rgba(239, 68, 68, 0.9);
          border-color: transparent;
        }

        .quiz-card--single {
          margin-bottom: 24px;
        }

        .quiz-nav {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
        }

        .quiz-nav-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          font-size: 14px;
          font-weight: 500;
          color: #9ca3af;
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          cursor: pointer;
          transition: all 200ms cubic-bezier(0.23, 1, 0.32, 1);
        }

        .quiz-nav-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.08);
          color: #ffffff;
        }

        .quiz-nav-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .quiz-nav-btn--primary {
          color: #000;
          background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
          border: none;
        }

        .quiz-nav-btn--primary:hover:not(:disabled) {
          transform: translateX(4px);
          box-shadow: 0 4px 14px rgba(251, 191, 36, 0.3);
        }

        .quiz-complete {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .quiz-result {
          font-size: 16px;
          font-weight: 600;
          color: #22c55e;
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
