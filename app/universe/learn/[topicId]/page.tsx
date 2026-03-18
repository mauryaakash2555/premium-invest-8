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
  const [expandedExampleDetails, setExpandedExampleDetails] = useState<Record<number, boolean>>({});
  const [expandedPractice, setExpandedPractice] = useState(false);
  const [expandedFlashcards, setExpandedFlashcards] = useState(false);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [currentFlashcardIndex, setCurrentFlashcardIndex] = useState(0);
  const INITIAL_SHOW_COUNT = 3;

  // 🎮 GAMIFICATION STATE
  const [hasStarted, setHasStarted] = useState(false); // User chooses to start
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationType, setCelebrationType] = useState<'correct' | 'complete' | 'streak'>('correct');
  const [flashcardRatings, setFlashcardRatings] = useState<Record<number, 'got-it' | 'practice'>>({});
  const [completedSections, setCompletedSections] = useState<Set<Tab>>(new Set());

  // Motivational messages
  const MOTIVATIONAL_MESSAGES = [
    "You're doing amazing! 🌟",
    "Keep going, champion! 💪",
    "Knowledge is power! ⚡",
    "You've got this! 🚀",
    "Learning superstar! ⭐",
    "Brilliant work! 🎯",
    "Your brain is growing! 🧠",
    "Unstoppable! 🔥",
  ];

  const getRandomMotivation = () => MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];

  // XP rewards
  const XP_VALUES = {
    correct_answer: 10,
    streak_bonus: 5, // per streak level
    section_complete: 25,
    flashcard_got_it: 5,
    practice_reveal: 3,
  };

  const triggerCelebration = (type: 'correct' | 'complete' | 'streak') => {
    setCelebrationType(type);
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2000);
  };

  const awardXp = (amount: number) => {
    setXp((prev) => prev + amount);
  };

  const abortRef = useRef<AbortController | null>(null);
  const prefetchedRef = useRef<Record<string, boolean>>({});
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);

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

  // Handle starting the learning session
  const handleStartLearning = () => {
    setHasStarted(true);
    awardXp(5); // Bonus XP for starting!
  };

  // Calculate overall progress
  const calculateProgress = () => {
    let total = 0;
    let completed = 0;
    
    // Explain is considered complete if content loaded
    if (content && activeTab === 'explain') {
      total += 1;
      completed += 1;
    }
    
    // Count completed sections
    total += 4; // examples, practice, flashcards, quiz
    completed += completedSections.size;
    
    return Math.round((completed / Math.max(total, 1)) * 100);
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
            {idx === 0 && <span className="ai-lead-glyph">✦ </span>}
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
    setExpandedExampleDetails({});
    setExpandedPractice(false);
    setExpandedFlashcards(false);
    setCurrentQuizIndex(0);
    setCurrentFlashcardIndex(0);
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

    // Strategy 1: Strip ALL markdown code fences (```json ... ```, including nested)
    raw = raw.replace(/```(?:json|JSON)?\s*/g, '').replace(/```/g, '').trim();

    // Strategy 2: Direct parse if it looks like JSON
    if (raw.startsWith('[') || raw.startsWith('{')) {
      try {
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        // continue to other strategies
      }
    }

    // Strategy 3: Extract the largest JSON array from anywhere in the text
    // Find all potential JSON array boundaries
    const arrayStart = raw.indexOf('[');
    const arrayEnd = raw.lastIndexOf(']');
    if (arrayStart !== -1 && arrayEnd > arrayStart) {
      try {
        const candidate = raw.slice(arrayStart, arrayEnd + 1);
        const parsed = JSON.parse(candidate);
        return Array.isArray(parsed) ? parsed : null;
      } catch {
        // continue
      }
    }

    // Strategy 4: Extract the largest JSON object from the text
    const objStart = raw.indexOf('{');
    const objEnd = raw.lastIndexOf('}');
    if (objStart !== -1 && objEnd > objStart) {
      try {
        const candidate = raw.slice(objStart, objEnd + 1);
        const parsed = JSON.parse(candidate);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        // continue
      }
    }

    // Strategy 5: Try to fix common JSON issues (trailing commas, single quotes)
    if (arrayStart !== -1 && arrayEnd > arrayStart) {
      try {
        let candidate = raw.slice(arrayStart, arrayEnd + 1);
        // Remove trailing commas before ] or }
        candidate = candidate.replace(/,\s*([\]}])/g, '$1');
        // Fix single quotes to double quotes (careful with apostrophes inside values)
        const parsed = JSON.parse(candidate);
        return Array.isArray(parsed) ? parsed : null;
      } catch {
        // give up
      }
    }

    return null;
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
          {visibleItems.map((ex: any, i: number) => {
            const isOpen = Boolean(expandedExampleDetails[i]);
            const title = String(ex?.Title || ex?.title || `Example ${i + 1}`);
            const scenario = String(ex?.Scenario || ex?.scenario || '');
            const steps = Array.isArray(ex?.Steps || ex?.steps) ? (ex?.Steps || ex?.steps) : [];
            const outcome = String(ex?.Outcome || ex?.outcome || '');
            // Show short scenario (first sentence) when collapsed
            const shortScenario = scenario.split(/[.!?]\s/)[0] + (scenario.includes('.') ? '.' : '');
            return (
              <div key={i} className={`example-card ${isOpen ? 'example-card--open' : ''}`}>
                <button
                  type="button"
                  className="example-header-btn"
                  onClick={() => setExpandedExampleDetails(prev => ({ ...prev, [i]: !prev[i] }))}
                >
                  <div className="example-number">{i + 1}</div>
                  <div className="example-header-text">
                    <div className="example-title">{title}</div>
                    {!isOpen && scenario && <div className="example-snippet">{shortScenario}</div>}
                  </div>
                  <span className={`example-chevron ${isOpen ? 'example-chevron--open' : ''}`}>▾</span>
                </button>
                {isOpen && (
                  <div className="example-body">
                    {scenario && <div className="example-scenario">{scenario}</div>}
                    {steps.length > 0 && (
                      <div className="example-steps">
                        {steps.slice(0, 5).map((s: any, si: number) => (
                          <div key={si} className="example-step">
                            <span className="step-number">{si + 1}</span>
                            <span className="step-text">{String(s)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {outcome && (
                      <div className="example-outcome">
                        <span className="outcome-icon">✨</span>
                        <span>{outcome}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {hasMore && (
            <button
              type="button"
              className="show-more-btn"
              onClick={() => setExpandedExamples(!expandedExamples)}
            >
              {expandedExamples ? '↑ Show Less' : `✦ ${parsed.length - INITIAL_SHOW_COUNT} More Examples`}
            </button>
          )}
        </div>
      );
    }

    if (tab === 'practice') {
      const visibleItems = expandedPractice ? parsed : parsed.slice(0, INITIAL_SHOW_COUNT);
      const hasMore = parsed.length > INITIAL_SHOW_COUNT;
      const revealedCount = Object.values(revealedPractice).filter(Boolean).length;
      return (
        <div className="ai-content ai-content--visible">
          <div className="section-header">
            <span className="section-icon">🧠</span>
            <span className="section-title">Q &amp; A</span>
            <span className="section-count">
              {revealedCount > 0 ? `${revealedCount}/${parsed.length} revealed` : 'Tap to reveal'}
            </span>
          </div>
          <div className="qa-grid">
            {visibleItems.map((q: any, i: number) => {
              const isRevealed = Boolean(revealedPractice[i]);
              return (
                <div key={i} className={`qa-card ${isRevealed ? 'qa-card--revealed' : ''}`}>
                  <div className="qa-badge">Q{i + 1}</div>
                  <div className="qa-question">{String(q?.Question || q?.question || '')}</div>
                  {isRevealed ? (
                    <div className="qa-answer">
                      <div className="qa-answer-divider">
                        <span className="qa-answer-label">Answer</span>
                      </div>
                      <div className="qa-answer-text">{String(q?.Answer || q?.answer || '')}</div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="qa-reveal-btn"
                      onClick={() => {
                        setRevealedPractice((prev) => ({ ...prev, [i]: true }));
                        awardXp(XP_VALUES.practice_reveal);
                        const newRevealed = { ...revealedPractice, [i]: true };
                        const newCount = Object.values(newRevealed).filter(Boolean).length;
                        if (newCount >= parsed.length) {
                          setCompletedSections(prev => new Set([...prev, 'practice']));
                          triggerCelebration('complete');
                        }
                      }}
                    >
                      <span className="qa-reveal-icon">✦</span>
                      <span>Reveal Answer</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          {hasMore && (
            <button
              type="button"
              className="show-more-btn"
              onClick={() => setExpandedPractice(!expandedPractice)}
            >
              {expandedPractice ? '↑ Show Less' : `✦ ${parsed.length - INITIAL_SHOW_COUNT} More Questions`}
            </button>
          )}
        </div>
      );
    }

    if (tab === 'flashcards') {
      const total = parsed.length;
      const ci = Math.min(currentFlashcardIndex, total - 1);
      const c: any = parsed[ci] || {};
      const isFlipped = Boolean(flippedCards[ci]);
      const rating = flashcardRatings[ci];
      const ratedCount = Object.keys(flashcardRatings).length;
      const gotItCount = Object.values(flashcardRatings).filter(r => r === 'got-it').length;

      return (
        <div className="ai-content ai-content--visible">
          <div className="section-header">
            <span className="section-icon">🎴</span>
            <span className="section-title">Flash Cards</span>
            <span className="section-count">
              {ratedCount > 0 ? (
                <span className="rating-summary">
                  <span className="got-it-badge">✓ {gotItCount}</span>
                  <span className="practice-badge">↻ {ratedCount - gotItCount}</span>
                </span>
              ) : `${total} cards`}
            </span>
          </div>

          {/* Card counter dots */}
          <div className="fc-dots">
            {parsed.map((_: any, idx: number) => {
              const r = flashcardRatings[idx];
              let dotCls = 'fc-dot';
              if (idx === ci) dotCls += ' fc-dot--active';
              if (r === 'got-it') dotCls += ' fc-dot--mastered';
              if (r === 'practice') dotCls += ' fc-dot--review';
              return (
                <button key={idx} type="button" className={dotCls} onClick={() => { setCurrentFlashcardIndex(idx); setFlippedCards({}); }} aria-label={`Card ${idx + 1}`} />
              );
            })}
          </div>

          {/* Single big card */}
          <div className="fc-stage">
            <div className={`fc-wrapper ${rating ? `fc-wrapper--${rating}` : ''}`}>
              <button
                type="button"
                className={`fc-card ${isFlipped ? 'fc-card--flipped' : ''}`}
                onClick={() => setFlippedCards((prev) => ({ ...prev, [ci]: !prev[ci] }))}
              >
                <div className="fc-inner">
                  <div className="fc-face fc-front">
                    <span className="fc-label-badge">Question</span>
                    <span className="fc-main-text">{String(c?.Front || c?.front || '')}</span>
                    <span className="fc-tap-hint">tap to flip ✦</span>
                  </div>
                  <div className="fc-face fc-back">
                    <span className="fc-label-badge fc-label-badge--answer">Answer</span>
                    <span className="fc-main-text">{String(c?.Back || c?.back || '')}</span>
                  </div>
                </div>
              </button>

              {/* Rating buttons — show after flip */}
              {isFlipped && !rating && (
                <div className="fc-rating">
                  <button
                    type="button"
                    className="fc-rate-btn fc-rate-btn--got-it"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFlashcardRatings((prev) => ({ ...prev, [ci]: 'got-it' }));
                      awardXp(XP_VALUES.flashcard_got_it);
                      if (ratedCount + 1 >= total) {
                        setCompletedSections(prev => new Set([...prev, 'flashcards']));
                        triggerCelebration('complete');
                      }
                    }}
                  >
                    ✓ Got it!
                  </button>
                  <button
                    type="button"
                    className="fc-rate-btn fc-rate-btn--again"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFlashcardRatings((prev) => ({ ...prev, [ci]: 'practice' }));
                      if (ratedCount + 1 >= total) {
                        setCompletedSections(prev => new Set([...prev, 'flashcards']));
                      }
                    }}
                  >
                    ↻ Again
                  </button>
                </div>
              )}
              {rating && (
                <div className={`fc-rated fc-rated--${rating}`}>
                  {rating === 'got-it' ? '✓ Mastered' : '↻ Review later'}
                </div>
              )}
            </div>
          </div>

          {/* Navigation arrows */}
          <div className="fc-nav">
            <button
              type="button"
              className="fc-nav-btn"
              disabled={ci === 0}
              onClick={() => { setCurrentFlashcardIndex(ci - 1); setFlippedCards({}); }}
            >
              ← Previous
            </button>
            <span className="fc-counter">{ci + 1} / {total}</span>
            <button
              type="button"
              className="fc-nav-btn fc-nav-btn--primary"
              disabled={ci === total - 1}
              onClick={() => { setCurrentFlashcardIndex(ci + 1); setFlippedCards({}); }}
            >
              Next →
            </button>
          </div>
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

      // Calculate current streak for display
      const currentStreak = (() => {
        let s = 0;
        for (let i = answeredCount - 1; i >= 0; i--) {
          const wasCorrect = selectedQuizAnswers[i] === Number(parsed[i]?.Correct ?? parsed[i]?.correct);
          if (wasCorrect) s++;
          else break;
        }
        return s;
      })();

      return (
        <div className="ai-content ai-content--visible">
          <div className="section-header">
            <span className="section-icon">🎯</span>
            <span className="section-title">Quiz Mode</span>
            <span className="section-count">
              {answeredCount > 0 ? (
                <>
                  {correctCount}/{answeredCount} correct
                  {streak >= 3 && <span className="streak-badge">🔥 {streak} streak!</span>}
                </>
              ) : ''}
            </span>
          </div>

          {/* XP indicator */}
          <div className="quiz-xp-bar">
            <span className="xp-label">+{xp} XP</span>
            {streak >= 2 && (
              <span className="streak-indicator">
                🔥 {streak} in a row! (+{XP_VALUES.streak_bonus * streak} bonus)
              </span>
            )}
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
                    onClick={() => {
                      setSelectedQuizAnswers((prev) => ({ ...prev, [currentQuizIndex]: oi }));
                      const isCorrect = oi === correct;
                      if (isCorrect) {
                        // Award XP with streak bonus
                        const newStreak = streak + 1;
                        setStreak(newStreak);
                        const bonus = newStreak >= 2 ? XP_VALUES.streak_bonus * newStreak : 0;
                        awardXp(XP_VALUES.correct_answer + bonus);
                        if (newStreak >= 3) {
                          triggerCelebration('streak');
                        } else {
                          triggerCelebration('correct');
                        }
                      } else {
                        setStreak(0); // Reset streak on wrong answer
                      }
                      // Check if quiz complete
                      const newAnswered = answeredCount + 1;
                      if (newAnswered >= totalQuestions) {
                        setCompletedSections(prev => new Set([...prev, 'quiz']));
                        awardXp(XP_VALUES.section_complete);
                        setTimeout(() => triggerCelebration('complete'), 500);
                      }
                    }}
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
                  <div className="quiz-final-score">
                    <span className="quiz-trophy">{correctCount === totalQuestions ? '🏆' : correctCount >= totalQuestions * 0.7 ? '🎉' : '💪'}</span>
                    <span className="quiz-result">
                      Score: {correctCount}/{totalQuestions}
                    </span>
                    <span className="quiz-grade">
                      {correctCount === totalQuestions ? 'Perfect!' : 
                       correctCount >= totalQuestions * 0.8 ? 'Excellent!' :
                       correctCount >= totalQuestions * 0.6 ? 'Good job!' : 'Keep practicing!'}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return renderExplain(text);
  };

  // Loading timeout: if loading takes >30s, auto-set error
  useEffect(() => {
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
    if (isLoading) {
      loadingTimerRef.current = setTimeout(() => {
        const key = makeKey(topicId, depth, activeTab);
        setLoadingByKey((prev) => ({ ...prev, [key]: false }));
        setErrorByKey((prev) => ({ ...prev, [key]: 'Taking too long — the AI might be busy. Please retry.' }));
      }, 30_000);
    }
    return () => {
      if (loadingTimerRef.current) clearTimeout(loadingTimerRef.current);
    };
  }, [isLoading, topicId, depth, activeTab]);

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
        <p className="placeholder-lead">Editorial note</p>
        <p className="placeholder-text">
          This topic is being prepared by our editorial team.
        </p>
        <p className="placeholder-text">
          Explore our blog for related financial insights.
        </p>
      </div>
    ),
    examples: (
      <div className="placeholder-content">
        <p className="placeholder-lead">Editorial note</p>
        <p className="placeholder-text">
          This topic is being prepared by our editorial team. Explore our blog for related financial insights.
        </p>
      </div>
    ),
    practice: (
      <div className="placeholder-content">
        <p className="placeholder-lead">Editorial note</p>
        <p className="placeholder-text">
          This topic is being prepared by our editorial team. Explore our blog for related financial insights.
        </p>
      </div>
    ),
    flashcards: (
      <div className="placeholder-content">
        <p className="placeholder-lead">Editorial note</p>
        <p className="placeholder-text">
          This topic is being prepared by our editorial team. Explore our blog for related financial insights.
        </p>
      </div>
    ),
    quiz: (
      <div className="placeholder-content">
        <p className="placeholder-lead">Editorial note</p>
        <p className="placeholder-text">
          This topic is being prepared by our editorial team. Explore our blog for related financial insights.
        </p>
      </div>
    ),
  };

  return (
    <main className="learning-page">
      {/* Celebration overlay */}
      {showCelebration && (
        <div className={`celebration celebration--${celebrationType}`}>
          <div className="celebration-content">
            {celebrationType === 'correct' && <span className="celebration-emoji">✨</span>}
            {celebrationType === 'streak' && <span className="celebration-emoji">🔥</span>}
            {celebrationType === 'complete' && <span className="celebration-emoji">🎉</span>}
            <span className="celebration-text">
              {celebrationType === 'correct' && 'Correct!'}
              {celebrationType === 'streak' && `${streak} in a row!`}
              {celebrationType === 'complete' && 'Section Complete!'}
            </span>
          </div>
          {/* Confetti particles */}
          <div className="confetti-container" aria-hidden="true">
            {Array.from({ length: 30 }).map((_, i) => (
              <div 
                key={i} 
                className="confetti" 
                style={{
                  '--delay': `${Math.random() * 0.5}s`,
                  '--x': `${Math.random() * 100}%`,
                  '--color': ['#64B5F6', '#90CAF9', '#3b82f6', '#a78bfa', '#f43f5e'][Math.floor(Math.random() * 5)],
                } as React.CSSProperties}
              />
            ))}
          </div>
        </div>
      )}

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

      {/* Welcome Screen - User Choice */}
      {!hasStarted && mounted && (
        <div className="welcome-overlay">
          <div className="welcome-card">
            <div className="welcome-icon">🚀</div>
            <h2 className="welcome-title">Ready to learn?</h2>
            <p className="welcome-topic">{topicTitle}</p>
            <p className="welcome-desc">
              Interactive lessons with examples, practice questions, flashcards, and quizzes.
              Learn at your own pace!
            </p>
            <div className="welcome-features">
              <div className="welcome-feature">
                <span className="feature-icon">⚡</span>
                <span>Earn XP</span>
              </div>
              <div className="welcome-feature">
                <span className="feature-icon">🔥</span>
                <span>Build streaks</span>
              </div>
              <div className="welcome-feature">
                <span className="feature-icon">🎯</span>
                <span>Track progress</span>
              </div>
            </div>
            <button type="button" className="welcome-start-btn" onClick={handleStartLearning}>
              <span>Start Learning</span>
              <span className="start-arrow">→</span>
            </button>
            <button type="button" className="welcome-skip-btn" onClick={() => router.push('/universe/learn')}>
              ← Browse other topics
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="header">
        <button type="button" onClick={handleBack} className="header-back">
          ← {activeTab !== 'explain' ? 'Back to Explain' : 'Back'}
        </button>
        {hasStarted && (
          <div className="header-xp">
            <span className="xp-icon">⚡</span>
            <span className="xp-value">{xp} XP</span>
          </div>
        )}
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

        {/* Progress bar */}
        {hasStarted && (
          <div className="progress-section">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${calculateProgress()}%` }}
              />
            </div>
            <div className="progress-info">
              <span className="progress-percent">{calculateProgress()}% complete</span>
              <span className="progress-motivation">{getRandomMotivation()}</span>
            </div>
          </div>
        )}

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

        {/* Tabs — progressive unlock: each tab unlocks after visiting the previous one */}
        <div className="tabs">
          {(['explain', 'examples', 'practice', 'flashcards', 'quiz'] as Tab[]).map((t, idx) => {
            const isComplete = completedSections.has(t);
            const tabIcon = {
              explain: '📖',
              examples: '📚',
              practice: '🧠',
              flashcards: '🎴',
              quiz: '🎯',
            }[t];
            // Progressive unlock: a tab is available if it's explain, or the previous tab has been visited (has content loaded)
            const tabOrder: Tab[] = ['explain', 'examples', 'practice', 'flashcards', 'quiz'];
            const prevTab = idx > 0 ? tabOrder[idx - 1] : null;
            const prevKey = prevTab ? makeKey(topicId, depth, prevTab) : null;
            const isUnlocked = idx === 0 || (prevKey ? Boolean(contentByKey[prevKey]) : false);
            return (
              <button
                key={t}
                type="button"
                onClick={() => isUnlocked && setActiveTab(t)}
                className={`tab-btn ${activeTab === t ? 'tab-btn--active' : ''} ${isComplete ? 'tab-btn--complete' : ''} ${!isUnlocked ? 'tab-btn--locked' : ''}`}
                disabled={!isUnlocked}
                title={!isUnlocked ? `Complete ${prevTab ? TAB_LABELS[prevTab] : ''} first` : TAB_LABELS[t]}
              >
                <span className="tab-icon">{!isUnlocked ? '🔒' : isComplete ? '✓' : tabIcon}</span>
                <span className="tab-label">{TAB_LABELS[t]}</span>
              </button>
            );
          })}
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

        .header-xp {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 14px;
          background: linear-gradient(135deg, rgba(100, 181, 246, 0.15) 0%, rgba(66, 165, 245, 0.08) 100%);
          border: 1px solid rgba(100, 181, 246, 0.3);
          border-radius: 20px;
          animation: pulse-glow 2s ease-in-out infinite;
        }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 10px rgba(100, 181, 246, 0.2); }
          50% { box-shadow: 0 0 20px rgba(100, 181, 246, 0.4); }
        }

        .xp-icon {
          font-size: 14px;
        }

        .xp-value {
          font-size: 14px;
          font-weight: 600;
          color: #64B5F6;
        }

        /* ═══════════════════════════════════════════
           WELCOME OVERLAY
           ═══════════════════════════════════════════ */
        .welcome-overlay {
          position: fixed;
          inset: 0;
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          background: rgba(0, 0, 0, 0.9);
          backdrop-filter: blur(20px);
          animation: fadeIn 400ms ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .welcome-card {
          max-width: 480px;
          padding: 48px 40px;
          background: linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          text-align: center;
          animation: slideUp 500ms cubic-bezier(0.23, 1, 0.32, 1);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .welcome-icon {
          font-size: 64px;
          margin-bottom: 20px;
          animation: float 3s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .welcome-title {
          font-size: 28px;
          font-weight: 300;
          color: #ffffff;
          margin: 0 0 8px;
        }

        .welcome-topic {
          font-size: 20px;
          font-weight: 500;
          color: #64B5F6;
          margin: 0 0 16px;
        }

        .welcome-desc {
          font-size: 15px;
          color: #9ca3af;
          line-height: 1.7;
          margin: 0 0 28px;
        }

        .welcome-features {
          display: flex;
          justify-content: center;
          gap: 24px;
          margin-bottom: 32px;
        }

        .welcome-feature {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .feature-icon {
          font-size: 24px;
        }

        .welcome-feature span:last-child {
          font-size: 12px;
          color: #737373;
        }

        .welcome-start-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          width: 100%;
          padding: 18px 32px;
          font-size: 16px;
          font-weight: 600;
          color: #000;
          background: linear-gradient(135deg, #64B5F6 0%, #42A5F5 100%);
          border: none;
          border-radius: 14px;
          cursor: pointer;
          transition: all 300ms cubic-bezier(0.23, 1, 0.32, 1);
        }

        .welcome-start-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 8px 30px rgba(100, 181, 246, 0.4);
        }

        .start-arrow {
          transition: transform 300ms ease;
        }

        .welcome-start-btn:hover .start-arrow {
          transform: translateX(5px);
        }

        .welcome-skip-btn {
          margin-top: 16px;
          font-size: 14px;
          color: #737373;
          background: none;
          border: none;
          cursor: pointer;
          transition: color 200ms ease;
        }

        .welcome-skip-btn:hover {
          color: #ffffff;
        }

        /* ═══════════════════════════════════════════
           CELEBRATION OVERLAY
           ═══════════════════════════════════════════ */
        .celebration {
          position: fixed;
          inset: 0;
          z-index: 300;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
          animation: celebrationFade 2s ease-out forwards;
        }

        @keyframes celebrationFade {
          0% { opacity: 0; }
          15% { opacity: 1; }
          70% { opacity: 1; }
          100% { opacity: 0; }
        }

        .celebration-content {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px 32px;
          background: rgba(0, 0, 0, 0.9);
          border-radius: 16px;
          animation: celebrationPop 500ms cubic-bezier(0.23, 1, 0.32, 1);
        }

        @keyframes celebrationPop {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 1; }
        }

        .celebration--correct .celebration-content {
          border: 2px solid rgba(100, 181, 246, 0.5);
        }

        .celebration--streak .celebration-content {
          border: 2px solid rgba(100, 181, 246, 0.5);
        }

        .celebration--complete .celebration-content {
          border: 2px solid rgba(139, 92, 246, 0.5);
        }

        .celebration-emoji {
          font-size: 32px;
          animation: bounce 500ms ease-in-out;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .celebration-text {
          font-size: 20px;
          font-weight: 600;
          color: #ffffff;
        }

        .confetti-container {
          position: absolute;
          inset: 0;
          overflow: hidden;
        }

        .confetti {
          position: absolute;
          top: 50%;
          left: var(--x);
          width: 10px;
          height: 10px;
          background: var(--color);
          border-radius: 2px;
          animation: confettiFall 1.5s ease-out var(--delay) forwards;
        }

        @keyframes confettiFall {
          0% { 
            transform: translateY(0) rotate(0deg); 
            opacity: 1;
          }
          100% { 
            transform: translateY(200px) rotate(720deg); 
            opacity: 0;
          }
        }

        /* ═══════════════════════════════════════════
           PROGRESS BAR
           ═══════════════════════════════════════════ */
        .progress-section {
          margin-bottom: 32px;
        }

        .progress-bar {
          height: 6px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
          overflow: hidden;
          margin-bottom: 10px;
        }

        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #64B5F6, #42A5F5);
          border-radius: 3px;
          transition: width 500ms cubic-bezier(0.23, 1, 0.32, 1);
        }

        .progress-info {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .progress-percent {
          font-size: 13px;
          color: #64B5F6;
          font-weight: 500;
        }

        .progress-motivation {
          font-size: 13px;
          color: #737373;
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
          display: flex;
          align-items: center;
          gap: 8px;
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

        .tab-icon {
          font-size: 16px;
        }

        .tab-label {
          font-size: 14px;
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

        .tab-btn--complete {
          color: #64B5F6;
        }

        .tab-btn--complete .tab-icon {
          background: rgba(100, 181, 246, 0.2);
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          font-size: 12px;
        }

        .tab-btn--locked {
          opacity: 0.35;
          cursor: not-allowed;
          pointer-events: none;
        }

        .tab-btn--locked .tab-icon {
          font-size: 14px;
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

        .ai-lead-glyph {
          color: #64B5F6;
          font-size: 16px;
        }

        .ai-lead {
          font-size: 19px;
          font-weight: 500;
          color: #f5f5f5;
          line-height: 1.75;
          margin: 0 0 20px;
          padding: 20px 24px;
          background: linear-gradient(135deg, rgba(100,181,246,0.06) 0%, rgba(100,181,246,0.01) 100%);
          border-radius: 16px;
          border-left: 3px solid rgba(100,181,246,0.35);
        }

        .ai-paragraph {
          font-size: 16px;
          font-weight: 400;
          color: #a3a3a3;
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
           INTERACTIVE EXAMPLES — Collapsible Cards
           ═══════════════════════════════════════════ */
        .example-card {
          border-radius: 16px;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.07);
          margin-bottom: 12px;
          overflow: hidden;
          transition: border-color 300ms ease, box-shadow 300ms ease;
        }
        .example-card--open {
          border-color: rgba(100,181,246,0.25);
          box-shadow: 0 0 30px rgba(100,181,246,0.06);
        }
        .example-header-btn {
          display: flex;
          align-items: center;
          gap: 14px;
          width: 100%;
          padding: 18px 20px;
          background: none;
          border: none;
          cursor: pointer;
          text-align: left;
          color: inherit;
        }
        .example-header-btn:hover { background: rgba(255,255,255,0.03); }
        .example-number {
          width: 34px; height: 34px;
          display: flex; align-items: center; justify-content: center;
          font-size: 13px; font-weight: 700;
          color: #000;
          background: linear-gradient(135deg, #64B5F6 0%, #42A5F5 100%);
          border-radius: 10px;
          flex-shrink: 0;
        }
        .example-header-text { flex: 1; min-width: 0; }
        .example-title {
          font-size: 15px; font-weight: 600; color: #fff;
          margin: 0 0 2px;
        }
        .example-snippet {
          font-size: 13px; color: #737373;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .example-chevron {
          font-size: 16px; color: #525252;
          transition: transform 300ms ease;
          flex-shrink: 0;
        }
        .example-chevron--open { transform: rotate(180deg); color: #64B5F6; }
        .example-body {
          padding: 0 20px 20px 68px;
          animation: slideReveal 350ms cubic-bezier(0.23,1,0.32,1);
        }
        @keyframes slideReveal {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .example-scenario {
          font-size: 14px; color: #a3a3a3; line-height: 1.7; margin: 0 0 14px;
        }
        .example-steps {
          display: flex; flex-direction: column; gap: 8px; margin-bottom: 14px;
        }
        .example-step {
          display: flex; align-items: flex-start; gap: 10px;
        }
        .step-number {
          width: 22px; height: 22px;
          display: inline-flex; align-items: center; justify-content: center;
          font-size: 11px; font-weight: 700;
          color: #64B5F6; background: rgba(100,181,246,0.12);
          border-radius: 6px; flex-shrink: 0; margin-top: 1px;
        }
        .step-text { font-size: 13px; color: #a3a3a3; line-height: 1.6; }
        .example-outcome {
          display: flex; align-items: flex-start; gap: 8px;
          padding: 12px 14px;
          background: rgba(100,181,246,0.06);
          border: 1px solid rgba(100,181,246,0.15);
          border-radius: 12px;
        }
        .outcome-icon { font-size: 14px; flex-shrink: 0; }
        .example-outcome span:last-child {
          font-size: 13px; color: #90CAF9; line-height: 1.6;
        }

        /* ═══════════════════════════════════════════
           Q & A — Card-Based Reveal
           ═══════════════════════════════════════════ */
        .qa-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
        }
        .qa-card {
          position: relative;
          padding: 24px;
          background: linear-gradient(135deg, rgba(167,139,250,0.04) 0%, rgba(139,92,246,0.02) 100%);
          border: 1px solid rgba(167,139,250,0.12);
          border-radius: 18px;
          transition: all 350ms cubic-bezier(0.23,1,0.32,1);
        }
        .qa-card--revealed {
          border-color: rgba(167,139,250,0.25);
          box-shadow: 0 8px 32px rgba(167,139,250,0.08);
        }
        .qa-badge {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 4px 12px;
          font-size: 11px; font-weight: 800;
          color: #a78bfa;
          background: rgba(167,139,250,0.12);
          border-radius: 999px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 14px;
        }
        .qa-question {
          font-size: 16px; font-weight: 600; color: #fff;
          line-height: 1.6; margin: 0 0 18px;
        }
        .qa-reveal-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 12px 24px;
          font-size: 13px; font-weight: 700;
          color: #a78bfa;
          background: rgba(167,139,250,0.08);
          border: 1px solid rgba(167,139,250,0.25);
          border-radius: 12px;
          cursor: pointer;
          transition: all 250ms ease;
          letter-spacing: 0.02em;
        }
        .qa-reveal-btn:hover {
          background: rgba(167,139,250,0.16);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(167,139,250,0.15);
        }
        .qa-reveal-icon {
          font-size: 12px;
          animation: sparkle 1.5s ease-in-out infinite;
        }
        @keyframes sparkle {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.3); }
        }
        .qa-answer {
          margin-top: 18px;
          animation: slideReveal 350ms cubic-bezier(0.23,1,0.32,1);
        }
        .qa-answer-divider {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 12px;
        }
        .qa-answer-divider::before, .qa-answer-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(167,139,250,0.15);
        }
        .qa-answer-label {
          font-size: 10px; font-weight: 800;
          color: #a78bfa;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .qa-answer-text {
          font-size: 14px; color: #d4d4d4; line-height: 1.75;
          padding: 16px;
          background: rgba(167,139,250,0.04);
          border-radius: 12px;
          border-left: 3px solid rgba(167,139,250,0.3);
        }

        /* ═══════════════════════════════════════════
           FLASH CARDS — Single-Card Carousel (3D Flip)
           ═══════════════════════════════════════════ */
        .fc-dots {
          display: flex; justify-content: center; gap: 6px;
          margin-bottom: 24px;
        }
        .fc-dot {
          width: 10px; height: 10px;
          border-radius: 999px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.08);
          cursor: pointer;
          transition: all 250ms ease;
          padding: 0;
        }
        .fc-dot:hover { background: rgba(255,255,255,0.2); }
        .fc-dot--active {
          width: 28px;
          background: linear-gradient(135deg, #3b82f6, #64B5F6);
          border-color: transparent;
        }
        .fc-dot--mastered { background: rgba(100,181,246,0.5); border-color: transparent; }
        .fc-dot--review { background: rgba(251,191,36,0.4); border-color: transparent; }

        .fc-stage {
          display: flex; justify-content: center;
          perspective: 1200px;
          margin-bottom: 20px;
        }
        .fc-wrapper {
          width: 100%; max-width: 420px;
          display: flex; flex-direction: column; gap: 14px;
        }
        .fc-wrapper--got-it { opacity: 0.55; }

        .fc-card {
          width: 100%; height: 260px;
          background: none; border: none; cursor: pointer; padding: 0;
          perspective: 1200px;
        }
        .fc-inner {
          position: relative; width: 100%; height: 100%;
          transform-style: preserve-3d;
          transition: transform 600ms cubic-bezier(0.23,1,0.32,1);
        }
        .fc-card--flipped .fc-inner { transform: rotateY(180deg); }
        .fc-card:hover:not(.fc-card--flipped) .fc-inner {
          transform: rotateY(8deg) scale(1.02);
        }
        .fc-card--flipped:hover .fc-inner {
          transform: rotateY(180deg) scale(1.02);
        }

        .fc-face {
          position: absolute; inset: 0;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          gap: 16px; padding: 28px;
          border-radius: 20px;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          text-align: center;
        }
        .fc-front {
          background: linear-gradient(145deg, rgba(59,130,246,0.14) 0%, rgba(59,130,246,0.04) 100%);
          border: 1px solid rgba(59,130,246,0.25);
          box-shadow: 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05);
        }
        .fc-back {
          background: linear-gradient(145deg, rgba(100,181,246,0.14) 0%, rgba(100,181,246,0.04) 100%);
          border: 1px solid rgba(100,181,246,0.3);
          box-shadow: 0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05);
          transform: rotateY(180deg);
        }

        .fc-label-badge {
          padding: 4px 14px;
          font-size: 10px; font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #3b82f6;
          background: rgba(59,130,246,0.12);
          border-radius: 999px;
        }
        .fc-label-badge--answer {
          color: #64B5F6;
          background: rgba(100,181,246,0.12);
        }
        .fc-main-text {
          font-size: 16px; font-weight: 500; color: #e5e5e5;
          line-height: 1.65; max-width: 32ch;
        }
        .fc-tap-hint {
          font-size: 11px; color: #525252;
          letter-spacing: 0.04em;
          animation: sparkle 2s ease-in-out infinite;
        }

        .fc-rating {
          display: flex; gap: 10px;
          animation: slideReveal 300ms ease-out;
        }
        .fc-rate-btn {
          flex: 1; padding: 14px;
          font-size: 13px; font-weight: 700;
          border: none; border-radius: 12px;
          cursor: pointer; transition: all 200ms ease;
        }
        .fc-rate-btn--got-it {
          color: #fff;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
        }
        .fc-rate-btn--got-it:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59,130,246,0.35);
        }
        .fc-rate-btn--again {
          color: #90CAF9;
          background: rgba(100,181,246,0.12);
          border: 1px solid rgba(100,181,246,0.25);
        }
        .fc-rate-btn--again:hover { background: rgba(100,181,246,0.22); }

        .fc-rated {
          padding: 12px; font-size: 12px; font-weight: 600;
          text-align: center; border-radius: 10px;
        }
        .fc-rated--got-it { color: #64B5F6; background: rgba(100,181,246,0.08); }
        .fc-rated--practice { color: #90CAF9; background: rgba(100,181,246,0.08); }

        .fc-nav {
          display: flex; align-items: center; justify-content: space-between;
          gap: 14px; padding-top: 6px;
        }
        .fc-counter {
          font-size: 13px; font-weight: 600; color: #525252;
        }
        .fc-nav-btn {
          padding: 10px 18px; font-size: 13px; font-weight: 600;
          color: #737373; background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08); border-radius: 10px;
          cursor: pointer; transition: all 200ms ease;
        }
        .fc-nav-btn:hover:not(:disabled) {
          background: rgba(255,255,255,0.08); color: #fff;
        }
        .fc-nav-btn:disabled { opacity: 0.3; cursor: not-allowed; }
        .fc-nav-btn--primary {
          color: #000;
          background: linear-gradient(135deg, #64B5F6 0%, #42A5F5 100%);
          border: none;
        }
        .fc-nav-btn--primary:hover:not(:disabled) {
          transform: translateX(3px);
          box-shadow: 0 4px 14px rgba(100,181,246,0.3);
        }

        .rating-summary { display: flex; gap: 12px; }
        .got-it-badge { color: #64B5F6; }
        .practice-badge { color: #90CAF9; }

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
          background: linear-gradient(135deg, #64B5F6 0%, #42A5F5 100%);
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
          color: #64B5F6;
        }

        .quiz-x {
          color: #ef4444;
        }

        .quiz-option--correct {
          background: rgba(100, 181, 246, 0.1);
          border-color: rgba(100, 181, 246, 0.3);
        }

        .quiz-option--correct .quiz-option-letter {
          color: #64B5F6;
          background: rgba(100, 181, 246, 0.2);
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
          background: rgba(100, 181, 246, 0.08);
          border: 1px solid rgba(100, 181, 246, 0.2);
          border-radius: 10px;
          font-size: 13px;
          color: #b3d4fc;
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
          gap: 12px;
          margin-bottom: 28px;
          padding: 14px 18px;
          background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
        }

        .section-icon {
          font-size: 22px;
          filter: drop-shadow(0 0 6px rgba(100,181,246,0.3));
        }

        .section-title {
          font-size: 17px;
          font-weight: 700;
          color: #ffffff;
          letter-spacing: 0.01em;
        }

        .section-count {
          margin-left: auto;
          font-size: 12px;
          color: #525252;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .streak-badge {
          padding: 4px 10px;
          font-size: 12px;
          font-weight: 600;
          color: #64B5F6;
          background: rgba(100, 181, 246, 0.15);
          border-radius: 12px;
          animation: pulse-glow 2s ease-in-out infinite;
        }

        /* ═══════════════════════════════════════════
           QUIZ XP BAR
           ═══════════════════════════════════════════ */
        .quiz-xp-bar {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: rgba(100, 181, 246, 0.08);
          border: 1px solid rgba(100, 181, 246, 0.2);
          border-radius: 10px;
          margin-bottom: 20px;
        }

        .xp-label {
          font-size: 14px;
          font-weight: 600;
          color: #64B5F6;
        }

        .streak-indicator {
          font-size: 13px;
          color: #42A5F5;
          margin-left: auto;
        }

        /* ═══════════════════════════════════════════
           QUIZ FINAL SCORE
           ═══════════════════════════════════════════ */
        .quiz-final-score {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          background: linear-gradient(135deg, rgba(100, 181, 246, 0.15) 0%, rgba(100, 181, 246, 0.05) 100%);
          border: 1px solid rgba(100, 181, 246, 0.3);
          border-radius: 12px;
          animation: popIn 400ms cubic-bezier(0.23, 1, 0.32, 1);
        }

        @keyframes popIn {
          0% { transform: scale(0.9); opacity: 0; }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }

        .quiz-trophy {
          font-size: 24px;
        }

        .quiz-result {
          font-size: 16px;
          font-weight: 600;
          color: #64B5F6;
        }

        .quiz-grade {
          font-size: 14px;
          color: #90CAF9;
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
          font-size: 13px;
          font-weight: 700;
          color: #64B5F6;
          background: linear-gradient(135deg, rgba(100,181,246,0.06) 0%, rgba(100,181,246,0.02) 100%);
          border: 1px solid rgba(100,181,246,0.15);
          border-radius: 14px;
          cursor: pointer;
          transition: all 250ms cubic-bezier(0.23, 1, 0.32, 1);
          letter-spacing: 0.03em;
        }

        .show-more-btn:hover {
          background: linear-gradient(135deg, rgba(100,181,246,0.12) 0%, rgba(100,181,246,0.06) 100%);
          border-color: rgba(100,181,246,0.3);
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(100,181,246,0.1);
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
          background: linear-gradient(135deg, #64B5F6 0%, #42A5F5 100%);
          border-color: transparent;
        }

        .quiz-dot--correct {
          color: #fff;
          background: rgba(100, 181, 246, 0.9);
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
          background: linear-gradient(135deg, #64B5F6 0%, #42A5F5 100%);
          border: none;
        }

        .quiz-nav-btn--primary:hover:not(:disabled) {
          transform: translateX(4px);
          box-shadow: 0 4px 14px rgba(100, 181, 246, 0.3);
        }

        .quiz-complete {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .quiz-result {
          font-size: 16px;
          font-weight: 600;
          color: #64B5F6;
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
