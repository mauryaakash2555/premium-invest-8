'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import QuickLearn from '@/components/live-intelligence/QuickLearn';

import {
  getDailyPremiumLessonId,
  getPremiumLearningLevel,
} from '@/lib/learning/premiumLearning';

const STORAGE_KEY = 'li_premium_learning_v2';
const LEGACY_STORAGE_KEY = 'li_learning_path_v1';
const DEFAULT_LEVEL_KEY = 'beginner';

function TopicIcon({ tag }) {
  const t = String(tag || '').toLowerCase();
  if (t === 'premium') return '💎';
  if (t === 'core') return '🧠';
  if (t === 'markets') return '📈';
  if (t === 'protection') return '🛡️';
  if (t === 'safety') return '🏦';
  if (t === 'advanced') return '⚡';
  return '📘';
}

export default function LearningPathPanel() {
  const level = useMemo(() => getPremiumLearningLevel(DEFAULT_LEVEL_KEY), []);
  const lessons = useMemo(() => (Array.isArray(level?.lessons) ? level.lessons : []), [level]);
  const lessonsById = useMemo(() => new Map(lessons.map((l) => [l.id, l])), [lessons]);
  const dailyLessonId = useMemo(() => getDailyPremiumLessonId(new Date(), DEFAULT_LEVEL_KEY), []);

  const [isExpanded, setIsExpanded] = useState(false);
  const [mode, setMode] = useState('daily'); // 'daily' | 'path'
  const [openKey, setOpenKey] = useState('pl_beg_01_goals');
  const [completed, setCompleted] = useState({});
  const [toast, setToast] = useState('');

  const [quizPick, setQuizPick] = useState(null);
  const [quizChecked, setQuizChecked] = useState(false);

  // Learning style controls (for lessons that support the richer format)
  const [learnTab, setLearnTab] = useState('explain'); // 'explain' | 'examples' | 'practice' | 'flashcards' | 'quiz'
  const [explainLevel, setExplainLevel] = useState('simple'); // 'simple' | 'normal' | 'deep'
  const [revealedPractice, setRevealedPractice] = useState({});
  const [revealedCards, setRevealedCards] = useState({});

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null;
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed && typeof parsed === 'object') {
        if (parsed.openKey && typeof parsed.openKey === 'string') setOpenKey(parsed.openKey);
        if (parsed.completed && typeof parsed.completed === 'object') setCompleted(parsed.completed);
        if (parsed.mode && (parsed.mode === 'daily' || parsed.mode === 'path')) setMode(parsed.mode);
        return;
      }

      // Migrate legacy progress (best-effort): map legacy topic keys to first lessons.
      const legacyRaw = typeof window !== 'undefined' ? window.localStorage.getItem(LEGACY_STORAGE_KEY) : null;
      const legacy = legacyRaw ? JSON.parse(legacyRaw) : null;
      if (legacy && typeof legacy === 'object') {
        const legacyCompleted = legacy.completed && typeof legacy.completed === 'object' ? legacy.completed : null;
        if (legacyCompleted) {
          // A tiny migration map: completed topics -> mark a few foundational lessons.
          const next = {};
          if (legacyCompleted.mf) next.pl_beg_05_nav = true;
          if (legacyCompleted.sip) next.pl_beg_04_sip = true;
          if (legacyCompleted.fd || legacyCompleted.rd) next.pl_beg_02_emergency = true;
          if (legacyCompleted.stocks) next.pl_beg_03_risk = true;
          if (Object.keys(next).length) setCompleted(next);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ openKey, completed, mode, updatedAt: new Date().toISOString() })
      );
    } catch {
      // ignore
    }
  }, [openKey, completed, mode]);

  const openLesson = useMemo(() => lessonsById.get(openKey) || lessons[0], [lessons, lessonsById, openKey]);

  useEffect(() => {
    // Reset quiz UI when switching lessons.
    setQuizPick(null);
    setQuizChecked(false);

    // Reset learning-style UI per lesson.
    setLearnTab('explain');
    setExplainLevel('simple');
    setRevealedPractice({});
    setRevealedCards({});
  }, [openKey]);

  const completedCount = useMemo(() => {
    const keys = Object.keys(completed || {});
    return keys.reduce((acc, k) => acc + (completed?.[k] ? 1 : 0), 0);
  }, [completed]);

  const onSelect = useCallback((key) => {
    setOpenKey((prev) => (prev === key ? prev : key));
  }, []);

  const markDone = useCallback(() => {
    setCompleted((prev) => {
      const next = { ...(prev || {}) };
      if (openLesson?.id) next[openLesson.id] = true;
      return next;
    });
    setToast(`Lesson complete: ${openLesson?.title || 'Completed'}`);
    window.clearTimeout((window).__li_lp_toast_timer);
    (window).__li_lp_toast_timer = window.setTimeout(() => setToast(''), 1400);
  }, [openLesson?.id, openLesson?.title]);

  return (
    <section className="lp-wrap" aria-label="Premium Learning">
      <div className="lp-header">
        <div className="lp-titleRow">
          <div className="lp-badge">Premium Learning</div>
          <div className="lp-title">Learn in 2 ways</div>
          <div className="lp-progress">
            Level: <span>{level?.label || 'Beginner'}</span> • {completedCount}/{lessons.length || 10} completed
          </div>
        </div>
        <div className="lp-sub">
          Tap one mode. Keep it simple. Education-only.
        </div>
      </div>

      {!isExpanded ? (
        <div className="lp-choose">
          <button
            type="button"
            className="lp-modeCard"
            onClick={() => {
              setMode('daily');
              setIsExpanded(true);
            }}
          >
            <div className="lp-modeTop">
              <div className="lp-modeIcon" aria-hidden="true">⚡</div>
              <div className="lp-modeName">Daily (30s)</div>
            </div>
            <div className="lp-modeDesc">3 micro-lessons. Just press “Got it!”.</div>
            <div className="lp-modeHint">Best if you’re busy</div>
          </button>

          <button
            type="button"
            className="lp-modeCard"
            onClick={() => {
              setMode('path');
              setIsExpanded(true);
            }}
          >
            <div className="lp-modeTop">
              <div className="lp-modeIcon" aria-hidden="true">🧠</div>
              <div className="lp-modeName">Continue Path</div>
            </div>
            <div className="lp-modeDesc">Pick a topic → 3 takeaways → mark complete.</div>
            <div className="lp-modeHint">Unlock levels as you finish</div>
          </button>
        </div>
      ) : (
        <>
          <div className="lp-tabs">
            <button
              type="button"
              className="lp-tab"
              data-active={mode === 'daily' ? '1' : '0'}
              onClick={() => setMode('daily')}
            >
              Daily 30s
            </button>
            <button
              type="button"
              className="lp-tab"
              data-active={mode === 'path' ? '1' : '0'}
              onClick={() => setMode('path')}
            >
              Continue Path
            </button>
            <button type="button" className="lp-close" onClick={() => setIsExpanded(false)}>Hide</button>
          </div>

          {mode === 'daily' ? (
            <div className="lp-daily">
              <QuickLearn />

              {dailyLessonId ? (
                <div className="lp-today">
                  <div className="lp-todayTitle">Today’s lesson</div>
                  <div className="lp-todayCard">
                    <div className="lp-todayName">{lessonsById.get(dailyLessonId)?.title || 'Premium lesson'}</div>
                    <div className="lp-todayMeta">~{lessonsById.get(dailyLessonId)?.minutes || 4} min • {lessonsById.get(dailyLessonId)?.tag || 'Core'}</div>
                    <button
                      type="button"
                      className="lp-cta"
                      onClick={() => {
                        setMode('path');
                        setOpenKey(dailyLessonId);
                      }}
                    >
                      Start lesson
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="lp-disclaimer">Educational only. Not investment advice.</div>
            </div>
          ) : (
            <div className="lp-grid">
              <div className="lp-list" role="list">
                {lessons.map((t) => {
                  const active = t.id === openKey;
                  const done = !!completed?.[t.id];
                  return (
                    <button
                      key={t.id}
                      type="button"
                      className="lp-item"
                      data-active={active ? '1' : '0'}
                      data-done={done ? '1' : '0'}
                      onClick={() => onSelect(t.id)}
                    >
                      <div className="lp-itemLeft">
                        <div className="lp-icon" aria-hidden="true">{TopicIcon({ tag: t.tag })}</div>
                        <div className="lp-itemText">
                          <div className="lp-itemLabel">{t.title}</div>
                          <div className="lp-meta">
                            <span className="lp-tag">{t.tag}</span>
                            <span className="lp-dot" aria-hidden="true">•</span>
                            <span className="lp-time">{t.minutes} min</span>
                            {done ? <span className="lp-done">Done</span> : null}
                          </div>
                        </div>
                      </div>
                      <div className="lp-chevron" aria-hidden="true">›</div>
                    </button>
                  );
                })}
              </div>

              <div className="lp-detail" aria-live="polite">
                <div className="lp-detailTop">
                  <div className="lp-detailBadge">Now Learning</div>
                  <div className="lp-detailTitle">{openLesson?.title || 'Lesson'}</div>
                  <div className="lp-detailHint">Education-only. No hype. No promises.</div>
                </div>

                {openLesson?.coreIdea ? (
                  <div className="lp-core">
                    <div className="lp-coreTitle">Core idea</div>
                    <div className="lp-coreText">{openLesson.coreIdea}</div>
                  </div>
                ) : null}

                {openLesson?.whyItMatters ? (
                  <div className="lp-core" style={{ marginTop: 10 }}>
                    <div className="lp-coreTitle">Why it matters</div>
                    <div className="lp-coreText">{openLesson.whyItMatters}</div>
                  </div>
                ) : null}

                <div className="lp-points">
                  {openLesson?.objective ? (
                    <div className="lp-point" style={{ alignItems: 'flex-start' }}>
                      <span className="lp-bullet" aria-hidden="true" />
                      <span className="lp-pointText"><b>Objective:</b> {openLesson.objective}</span>
                    </div>
                  ) : null}

                  {openLesson?.explain ? (
                    <div className="lp-learn">
                      <div className="lp-learnTop">
                        <div className="lp-learnTitle">Choose how you want to learn</div>
                        <div className="lp-pillRow" role="tablist" aria-label="Learning modes">
                          <button
                            type="button"
                            className="lp-pill"
                            data-active={learnTab === 'explain' ? '1' : '0'}
                            onClick={() => setLearnTab('explain')}
                          >
                            Explain
                          </button>
                          <button
                            type="button"
                            className="lp-pill"
                            data-active={learnTab === 'examples' ? '1' : '0'}
                            onClick={() => setLearnTab('examples')}
                          >
                            Examples
                          </button>
                          <button
                            type="button"
                            className="lp-pill"
                            data-active={learnTab === 'practice' ? '1' : '0'}
                            onClick={() => setLearnTab('practice')}
                          >
                            Practice
                          </button>
                          <button
                            type="button"
                            className="lp-pill"
                            data-active={learnTab === 'flashcards' ? '1' : '0'}
                            onClick={() => setLearnTab('flashcards')}
                          >
                            Flashcards
                          </button>
                          {openLesson?.quiz ? (
                            <button
                              type="button"
                              className="lp-pill"
                              data-active={learnTab === 'quiz' ? '1' : '0'}
                              onClick={() => setLearnTab('quiz')}
                            >
                              Quiz
                            </button>
                          ) : null}
                        </div>
                      </div>

                      {learnTab === 'explain' ? (
                        <>
                          <div className="lp-segRow" role="tablist" aria-label="Explanation depth">
                            <button
                              type="button"
                              className="lp-seg"
                              data-active={explainLevel === 'simple' ? '1' : '0'}
                              onClick={() => setExplainLevel('simple')}
                            >
                              Very simple
                            </button>
                            <button
                              type="button"
                              className="lp-seg"
                              data-active={explainLevel === 'normal' ? '1' : '0'}
                              onClick={() => setExplainLevel('normal')}
                            >
                              Normal
                            </button>
                            <button
                              type="button"
                              className="lp-seg"
                              data-active={explainLevel === 'deep' ? '1' : '0'}
                              onClick={() => setExplainLevel('deep')}
                            >
                              Deep dive
                            </button>
                          </div>

                          {(openLesson?.explain?.[explainLevel] || []).map((p, idx) => (
                            <div key={idx} className="lp-point">
                              <span className="lp-bullet" aria-hidden="true" />
                              <span className="lp-pointText">{p}</span>
                            </div>
                          ))}

                          {Array.isArray(openLesson?.checklist) && openLesson.checklist.length ? (
                            <div className="lp-card" style={{ marginTop: 12 }}>
                              <div className="lp-cardTitle">Checklist</div>
                              <div className="lp-cardList">
                                {openLesson.checklist.map((t, idx) => (
                                  <div key={idx} className="lp-cardRow">
                                    <span className="lp-quizDot" aria-hidden="true" />
                                    <span>{t}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}

                          {Array.isArray(openLesson?.commonMistakes) && openLesson.commonMistakes.length ? (
                            <div className="lp-card" style={{ marginTop: 12 }}>
                              <div className="lp-cardTitle">Common mistakes</div>
                              <div className="lp-cardList">
                                {openLesson.commonMistakes.map((t, idx) => (
                                  <div key={idx} className="lp-cardRow">
                                    <span className="lp-quizDot" aria-hidden="true" />
                                    <span>{t}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : null}
                        </>
                      ) : null}

                      {learnTab === 'examples' ? (
                        <>
                          {(openLesson?.examples || []).length ? (
                            <div className="lp-examples">
                              {openLesson.examples.map((ex, idx) => (
                                <div key={idx} className="lp-example">
                                  <div className="lp-exampleTitle">{ex.title || `Example ${idx + 1}`}</div>
                                  {ex.scenario ? <div className="lp-exampleScenario">{ex.scenario}</div> : null}
                                  {Array.isArray(ex.steps) && ex.steps.length ? (
                                    <div className="lp-exampleSteps">
                                      {ex.steps.map((s, sIdx) => (
                                        <div key={sIdx} className="lp-point">
                                          <span className="lp-bullet" aria-hidden="true" />
                                          <span className="lp-pointText">{s}</span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : null}
                                  {ex.result ? <div className="lp-exampleResult">{ex.result}</div> : null}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="lp-empty">No examples for this lesson yet.</div>
                          )}
                        </>
                      ) : null}

                      {learnTab === 'practice' ? (
                        <>
                          {Array.isArray(openLesson?.practice?.prompts) && openLesson.practice.prompts.length ? (
                            <div className="lp-practice">
                              {openLesson.practice.prompts.map((pr, idx) => {
                                const isOpen = !!revealedPractice?.[idx];
                                return (
                                  <div key={idx} className="lp-practiceItem">
                                    <div className="lp-practiceQ">Q{idx + 1}. {pr.q}</div>
                                    <button
                                      type="button"
                                      className="lp-ghostBtn"
                                      onClick={() =>
                                        setRevealedPractice((prev) => ({ ...(prev || {}), [idx]: !prev?.[idx] }))
                                      }
                                    >
                                      {isOpen ? 'Hide answer' : 'Show answer'}
                                    </button>
                                    {isOpen ? <div className="lp-practiceA">{pr.a}</div> : null}
                                  </div>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="lp-empty">No practice prompts for this lesson yet.</div>
                          )}
                        </>
                      ) : null}

                      {learnTab === 'flashcards' ? (
                        <>
                          {Array.isArray(openLesson?.flashcards) && openLesson.flashcards.length ? (
                            <div className="lp-flashcards">
                              {openLesson.flashcards.map((c, idx) => {
                                const open = !!revealedCards?.[idx];
                                return (
                                  <button
                                    key={idx}
                                    type="button"
                                    className="lp-cardBtn"
                                    data-open={open ? '1' : '0'}
                                    onClick={() =>
                                      setRevealedCards((prev) => ({ ...(prev || {}), [idx]: !prev?.[idx] }))
                                    }
                                  >
                                    <div className="lp-cardQ">{c.q}</div>
                                    <div className="lp-cardA">{open ? c.a : 'Tap to reveal'}</div>
                                  </button>
                                );
                              })}
                            </div>
                          ) : (
                            <div className="lp-empty">No flashcards for this lesson yet.</div>
                          )}
                        </>
                      ) : null}

                      {learnTab === 'quiz' ? null : null}
                    </div>
                  ) : (
                    (openLesson?.content || []).map((p, idx) => (
                      <div key={idx} className="lp-point">
                        <span className="lp-bullet" aria-hidden="true" />
                        <span className="lp-pointText">{p}</span>
                      </div>
                    ))
                  )}

                  {Array.isArray(openLesson?.takeaways) && openLesson.takeaways.length ? (
                    <div className="lp-quiz" style={{ marginTop: 14 }}>
                      <div className="lp-quizTitle">Key takeaways</div>
                      <div className="lp-quizList">
                        {openLesson.takeaways.map((t, idx) => (
                          <div key={idx} className="lp-quizRow">
                            <span className="lp-quizDot" aria-hidden="true" />
                            <span>{t}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  {openLesson?.quiz && (!openLesson?.explain || learnTab === 'quiz') ? (
                    <div className="lp-quiz" style={{ marginTop: 14 }}>
                      <div className="lp-quizTitle">Quick check</div>
                      <div className="lp-quizQ">{openLesson.quiz.question}</div>
                      <div className="lp-quizOpts">
                        {openLesson.quiz.options.map((opt, idx) => {
                          const picked = quizPick === idx;
                          const correct = quizChecked && idx === openLesson.quiz.answerIndex;
                          const wrongPicked = quizChecked && picked && idx !== openLesson.quiz.answerIndex;
                          return (
                            <button
                              key={idx}
                              type="button"
                              className="lp-quizOpt"
                              data-picked={picked ? '1' : '0'}
                              data-correct={correct ? '1' : '0'}
                              data-wrong={wrongPicked ? '1' : '0'}
                              onClick={() => {
                                setQuizPick(idx);
                                setQuizChecked(false);
                              }}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                      <div className="lp-quizActions">
                        <button
                          type="button"
                          className="lp-ghostBtn"
                          onClick={() => setQuizChecked(true)}
                          disabled={quizPick == null}
                        >
                          Check
                        </button>
                        <button
                          type="button"
                          className="lp-ghostBtn"
                          onClick={() => {
                            setQuizPick(null);
                            setQuizChecked(false);
                          }}
                        >
                          Reset
                        </button>
                      </div>
                      {quizChecked ? (
                        <div className="lp-quizExplain" data-ok={quizPick === openLesson.quiz.answerIndex ? '1' : '0'}>
                          {openLesson.quiz.explanation}
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                </div>

                <div className="lp-actions">
                  {!completed?.[openLesson?.id] ? (
                    <button type="button" className="lp-cta" onClick={markDone}>
                      Mark Complete
                    </button>
                  ) : (
                    <div className="lp-complete">✅ Completed</div>
                  )}
                  <Link className="lp-ghost" href="/blog">Read an article</Link>
                </div>

                <div className="lp-disclaimer">Educational only. Not investment advice.</div>
              </div>
            </div>
          )}
        </>
      )}

      {toast ? <div className="lp-toast" role="status">{toast}</div> : null}

      <style jsx>{`
        .lp-wrap {
          border-radius: 18px;
          border: 1px solid rgba(170, 198, 255, 0.16);
          background: linear-gradient(180deg, rgba(14, 18, 28, 0.88) 0%, rgba(8, 10, 14, 0.92) 100%);
          box-shadow: 0 22px 70px rgba(0, 0, 0, 0.55);
          overflow: hidden;
        }

        .lp-header {
          padding: 16px 18px;
          border-bottom: 1px solid rgba(170, 198, 255, 0.10);
          background: radial-gradient(900px 300px at 30% 0%, rgba(170, 198, 255, 0.10), rgba(0,0,0,0));
        }

        .lp-titleRow {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .lp-progress {
          margin-left: auto;
          font-size: 11px;
          color: rgba(180, 200, 230, 0.62);
          display: inline-flex;
          gap: 6px;
          align-items: baseline;
          white-space: nowrap;
        }
        .lp-progress span {
          color: rgba(235, 245, 255, 0.92);
          font-weight: 800;
        }

        .lp-badge {
          font-size: 10px;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: 5px 10px;
          border-radius: 999px;
          border: 1px solid rgba(180, 120, 220, 0.28);
          background: rgba(180, 120, 220, 0.10);
          color: rgba(230, 240, 255, 0.92);
        }

        .lp-title {
          font-size: 15px;
          font-weight: 650;
          letter-spacing: -0.01em;
          color: rgba(235, 245, 255, 0.96);
        }

        .lp-sub {
          margin-top: 6px;
          font-size: 12px;
          color: rgba(180, 200, 230, 0.62);
        }

        .lp-today {
          margin-top: 14px;
          padding: 10px 0 0;
          border-top: 1px solid rgba(170, 198, 255, 0.10);
        }
        .lp-todayTitle {
          font-size: 12px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(180, 200, 230, 0.66);
          margin-bottom: 10px;
        }
        .lp-todayCard {
          border-radius: 16px;
          border: 1px solid rgba(170, 198, 255, 0.14);
          background: linear-gradient(135deg, rgba(20, 28, 44, 0.55) 0%, rgba(10, 10, 14, 0.65) 100%);
          padding: 14px 14px;
        }
        .lp-todayName {
          font-size: 14px;
          font-weight: 750;
          color: rgba(235, 245, 255, 0.95);
          letter-spacing: -0.01em;
        }
        .lp-todayMeta {
          margin-top: 6px;
          font-size: 12px;
          color: rgba(180, 200, 230, 0.62);
          margin-bottom: 10px;
        }

        .lp-quizTitle {
          font-size: 12px;
          font-weight: 850;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(200, 220, 255, 0.88);
          margin-bottom: 10px;
        }
        .lp-quizQ {
          font-size: 13px;
          color: rgba(235, 245, 255, 0.92);
          margin-bottom: 10px;
          line-height: 1.45;
        }
        .lp-quizOpts {
          display: grid;
          grid-template-columns: 1fr;
          gap: 8px;
        }
        .lp-quizOpt {
          text-align: left;
          border-radius: 14px;
          border: 1px solid rgba(170, 198, 255, 0.12);
          background: rgba(10, 12, 18, 0.55);
          padding: 10px 12px;
          color: rgba(235, 245, 255, 0.90);
          cursor: pointer;
          transition: transform 0.16s ease, border-color 0.16s ease, box-shadow 0.16s ease;
        }
        .lp-quizOpt[data-picked='1'] {
          border-color: rgba(140, 190, 255, 0.55);
          box-shadow: 0 18px 60px rgba(0,0,0,0.45);
          transform: translateY(-1px);
        }
        .lp-quizOpt[data-correct='1'] {
          border-color: rgba(140, 220, 180, 0.65);
          background: rgba(10, 18, 14, 0.55);
        }
        .lp-quizOpt[data-wrong='1'] {
          border-color: rgba(255, 120, 120, 0.55);
          background: rgba(24, 10, 12, 0.55);
        }
        .lp-quizActions {
          display: flex;
          gap: 10px;
          margin-top: 10px;
        }
        .lp-ghostBtn {
          border-radius: 12px;
          border: 1px solid rgba(170, 198, 255, 0.14);
          background: rgba(0,0,0,0.25);
          color: rgba(235, 245, 255, 0.88);
          padding: 8px 10px;
          font-weight: 750;
          font-size: 12px;
          cursor: pointer;
        }
        .lp-ghostBtn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }
        .lp-quizExplain {
          margin-top: 10px;
          font-size: 12px;
          line-height: 1.55;
          color: rgba(235, 245, 255, 0.84);
          border-radius: 14px;
          border: 1px solid rgba(170, 198, 255, 0.12);
          background: rgba(0,0,0,0.22);
          padding: 10px 12px;
        }
        .lp-quizExplain[data-ok='1'] {
          border-color: rgba(140, 220, 180, 0.35);
        }

        .lp-grid {
          display: grid;
          grid-template-columns: 1fr;
        }

        .lp-choose {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          padding: 14px 16px 16px;
        }

        .lp-modeCard {
          text-align: left;
          border-radius: 16px;
          border: 1px solid rgba(170, 198, 255, 0.14);
          background: linear-gradient(135deg, rgba(20, 28, 44, 0.55) 0%, rgba(10, 10, 14, 0.65) 100%);
          padding: 14px 14px;
          cursor: pointer;
          transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
        }
        .lp-modeCard:hover {
          transform: translateY(-1px);
          border-color: rgba(170, 198, 255, 0.26);
          box-shadow: 0 20px 80px rgba(0,0,0,0.55), 0 0 0 1px rgba(170,198,255,0.08) inset;
        }
        .lp-modeTop {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .lp-modeIcon {
          width: 34px;
          height: 34px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          background: rgba(170, 198, 255, 0.08);
          border: 1px solid rgba(170, 198, 255, 0.16);
          font-size: 16px;
        }
        .lp-modeName {
          font-size: 14px;
          font-weight: 850;
          color: rgba(235, 245, 255, 0.96);
        }
        .lp-modeDesc {
          margin-top: 8px;
          font-size: 12px;
          line-height: 1.45;
          color: rgba(200, 215, 240, 0.62);
        }
        .lp-modeHint {
          margin-top: 10px;
          font-size: 11px;
          color: rgba(200, 215, 240, 0.45);
        }

        .lp-tabs {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 16px 0;
        }
        .lp-tab {
          appearance: none;
          border: 1px solid rgba(170, 198, 255, 0.12);
          background: rgba(10,10,12,0.35);
          color: rgba(235,242,255,0.88);
          border-radius: 999px;
          padding: 8px 12px;
          font-size: 12px;
          font-weight: 850;
          cursor: pointer;
        }
        .lp-tab[data-active='1'] {
          border-color: rgba(170, 198, 255, 0.30);
          background: rgba(170, 198, 255, 0.10);
        }
        .lp-close {
          margin-left: auto;
          appearance: none;
          border: 1px solid rgba(255,255,255,0.10);
          background: rgba(10,10,12,0.35);
          color: rgba(235,242,255,0.78);
          border-radius: 999px;
          padding: 8px 12px;
          font-size: 12px;
          cursor: pointer;
        }

        .lp-daily {
          padding: 14px 16px 16px;
        }

        .lp-done {
          margin-left: 10px;
          font-size: 11px;
          color: rgba(100, 255, 150, 0.80);
          border: 1px solid rgba(100, 255, 150, 0.22);
          padding: 2px 8px;
          border-radius: 999px;
        }

        .lp-complete {
          font-size: 12px;
          color: rgba(100, 255, 150, 0.88);
          font-weight: 900;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid rgba(100, 255, 150, 0.18);
          background: rgba(100, 255, 150, 0.08);
        }

        .lp-toast {
          position: absolute;
          right: 14px;
          bottom: 14px;
          padding: 10px 12px;
          border-radius: 12px;
          background: rgba(10,10,12,0.78);
          border: 1px solid rgba(170,198,255,0.18);
          color: rgba(235,242,255,0.88);
          font-size: 12px;
          font-weight: 850;
          box-shadow: 0 18px 80px rgba(0,0,0,0.55);
        }

        .lp-wrap { position: relative; }

        .lp-list {
          display: grid;
          grid-template-columns: 1fr;
          padding: 10px;
          gap: 8px;
          border-bottom: 1px solid rgba(170, 198, 255, 0.08);
          background: rgba(0, 0, 0, 0.35);
        }

        .lp-item {
          width: 100%;
          text-align: left;
          border-radius: 14px;
          border: 1px solid rgba(170, 198, 255, 0.14);
          background: rgba(20, 30, 50, 0.48);
          color: rgba(235, 245, 255, 0.92);
          padding: 12px 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          transition: transform 0.15s ease, border-color 0.15s ease, background 0.15s ease, box-shadow 0.15s ease;
        }

        .lp-item:hover {
          transform: translateY(-1px);
          border-color: rgba(170, 198, 255, 0.26);
          box-shadow: 0 14px 34px rgba(0, 0, 0, 0.45);
          background: rgba(20, 30, 50, 0.62);
        }

        .lp-item[data-active='1'] {
          border-color: rgba(170, 198, 255, 0.42);
          box-shadow: 0 0 26px rgba(170, 198, 255, 0.10);
          background: linear-gradient(180deg, rgba(170, 198, 255, 0.16), rgba(20, 30, 50, 0.55));
        }

        .lp-itemLeft {
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 0;
        }

        .lp-icon {
          width: 34px;
          height: 34px;
          border-radius: 12px;
          display: grid;
          place-items: center;
          background: rgba(170, 198, 255, 0.10);
          border: 1px solid rgba(170, 198, 255, 0.14);
          flex: 0 0 auto;
        }

        .lp-itemText {
          min-width: 0;
        }

        .lp-itemLabel {
          font-size: 13px;
          font-weight: 600;
          color: rgba(235, 245, 255, 0.94);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .lp-meta {
          margin-top: 3px;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 11px;
          color: rgba(180, 200, 230, 0.60);
        }

        .lp-tag {
          padding: 2px 8px;
          border-radius: 999px;
          border: 1px solid rgba(170, 198, 255, 0.16);
          background: rgba(170, 198, 255, 0.08);
          color: rgba(200, 220, 255, 0.78);
        }

        .lp-dot {
          opacity: 0.55;
        }

        .lp-chevron {
          font-size: 22px;
          line-height: 1;
          color: rgba(170, 198, 255, 0.55);
          flex: 0 0 auto;
        }

        .lp-detail {
          padding: 16px 18px 18px;
          background: radial-gradient(800px 400px at 70% 0%, rgba(170, 198, 255, 0.10), rgba(0,0,0,0));
        }

        .lp-detailTop {
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(170, 198, 255, 0.10);
        }

        .lp-detailBadge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 10px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          padding: 5px 10px;
          border-radius: 999px;
          border: 1px solid rgba(170, 198, 255, 0.22);
          background: rgba(170, 198, 255, 0.10);
          color: rgba(230, 240, 255, 0.92);
        }

        .lp-detailTitle {
          margin-top: 10px;
          font-size: 15px;
          font-weight: 650;
          letter-spacing: -0.01em;
          color: rgba(235, 245, 255, 0.96);
        }

        .lp-detailHint {
          margin-top: 5px;
          font-size: 12px;
          color: rgba(180, 200, 230, 0.60);
        }

        .lp-points {
          margin-top: 14px;
          display: grid;
          gap: 10px;
        }

        .lp-point {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 14px;
          border: 1px solid rgba(170, 198, 255, 0.12);
          background: rgba(10, 14, 22, 0.55);
        }

        .lp-bullet {
          width: 10px;
          height: 10px;
          border-radius: 999px;
          background: rgba(170, 198, 255, 0.65);
          box-shadow: 0 0 14px rgba(170, 198, 255, 0.22);
          margin-top: 4px;
          flex: 0 0 auto;
        }

        .lp-pointText {
          font-size: 13px;
          line-height: 1.45;
          color: rgba(230, 240, 255, 0.86);
        }

        .lp-core {
          margin-top: 12px;
          padding: 12px 12px;
          border-radius: 14px;
          border: 1px solid rgba(170, 198, 255, 0.12);
          background: rgba(10, 12, 18, 0.45);
        }
        .lp-coreTitle {
          font-size: 11px;
          font-weight: 850;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(200, 220, 255, 0.78);
          margin-bottom: 8px;
        }
        .lp-coreText {
          font-size: 13px;
          line-height: 1.5;
          color: rgba(235, 245, 255, 0.90);
        }

        .lp-learn {
          margin-top: 10px;
          display: grid;
          gap: 10px;
        }
        .lp-learnTop {
          display: grid;
          gap: 8px;
        }
        .lp-learnTitle {
          font-size: 12px;
          font-weight: 850;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(200, 220, 255, 0.88);
        }
        .lp-pillRow {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .lp-pill {
          border-radius: 999px;
          border: 1px solid rgba(170, 198, 255, 0.14);
          background: rgba(0,0,0,0.22);
          color: rgba(235, 245, 255, 0.86);
          padding: 7px 10px;
          font-size: 12px;
          font-weight: 750;
          cursor: pointer;
          transition: transform 0.16s ease, border-color 0.16s ease, background 0.16s ease;
        }
        .lp-pill[data-active='1'] {
          border-color: rgba(140, 190, 255, 0.55);
          background: rgba(140, 190, 255, 0.14);
          transform: translateY(-1px);
        }

        .lp-segRow {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 4px;
          margin-bottom: 4px;
        }
        .lp-seg {
          border-radius: 12px;
          border: 1px solid rgba(170, 198, 255, 0.14);
          background: rgba(10, 12, 18, 0.35);
          color: rgba(235, 245, 255, 0.86);
          padding: 8px 10px;
          font-size: 12px;
          font-weight: 750;
          cursor: pointer;
        }
        .lp-seg[data-active='1'] {
          border-color: rgba(140, 220, 180, 0.45);
          background: rgba(10, 18, 14, 0.35);
        }

        .lp-card {
          border-radius: 14px;
          border: 1px solid rgba(170, 198, 255, 0.12);
          background: rgba(0,0,0,0.22);
          padding: 12px 12px;
        }
        .lp-cardTitle {
          font-size: 12px;
          font-weight: 850;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: rgba(200, 220, 255, 0.88);
          margin-bottom: 10px;
        }
        .lp-cardList {
          display: grid;
          gap: 8px;
          font-size: 13px;
          color: rgba(235, 245, 255, 0.86);
        }
        .lp-cardRow {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          line-height: 1.45;
        }

        .lp-empty {
          padding: 12px 12px;
          border-radius: 14px;
          border: 1px dashed rgba(170, 198, 255, 0.16);
          color: rgba(180, 200, 230, 0.70);
          background: rgba(0,0,0,0.18);
          font-size: 12px;
        }

        .lp-examples {
          display: grid;
          gap: 12px;
        }
        .lp-example {
          border-radius: 14px;
          border: 1px solid rgba(170, 198, 255, 0.12);
          background: rgba(10, 14, 22, 0.45);
          padding: 12px 12px;
        }
        .lp-exampleTitle {
          font-size: 13px;
          font-weight: 850;
          color: rgba(235, 245, 255, 0.94);
          margin-bottom: 6px;
        }
        .lp-exampleScenario {
          font-size: 12px;
          color: rgba(200, 220, 255, 0.80);
          margin-bottom: 10px;
        }
        .lp-exampleResult {
          margin-top: 10px;
          font-size: 12px;
          line-height: 1.5;
          color: rgba(235, 245, 255, 0.84);
          border-radius: 12px;
          border: 1px solid rgba(170, 198, 255, 0.10);
          background: rgba(0,0,0,0.22);
          padding: 10px 10px;
        }

        .lp-practice {
          display: grid;
          gap: 12px;
        }
        .lp-practiceItem {
          border-radius: 14px;
          border: 1px solid rgba(170, 198, 255, 0.12);
          background: rgba(10, 14, 22, 0.45);
          padding: 12px 12px;
          display: grid;
          gap: 10px;
        }
        .lp-practiceQ {
          font-size: 13px;
          font-weight: 700;
          color: rgba(235, 245, 255, 0.92);
          line-height: 1.45;
        }
        .lp-practiceA {
          font-size: 12.5px;
          line-height: 1.55;
          color: rgba(235, 245, 255, 0.84);
          border-radius: 12px;
          border: 1px solid rgba(140, 220, 180, 0.24);
          background: rgba(10, 18, 14, 0.30);
          padding: 10px 10px;
        }

        .lp-flashcards {
          display: grid;
          gap: 10px;
        }
        .lp-cardBtn {
          text-align: left;
          border-radius: 14px;
          border: 1px solid rgba(170, 198, 255, 0.12);
          background: rgba(10, 12, 18, 0.45);
          padding: 12px 12px;
          cursor: pointer;
          transition: transform 0.16s ease, border-color 0.16s ease;
        }
        .lp-cardBtn:hover {
          transform: translateY(-1px);
          border-color: rgba(140, 190, 255, 0.35);
        }
        .lp-cardBtn[data-open='1'] {
          border-color: rgba(140, 220, 180, 0.35);
        }
        .lp-cardQ {
          font-size: 13px;
          font-weight: 800;
          color: rgba(235, 245, 255, 0.94);
          margin-bottom: 8px;
        }
        .lp-cardA {
          font-size: 12.5px;
          line-height: 1.55;
          color: rgba(235, 245, 255, 0.82);
        }

        .lp-actions {
          margin-top: 14px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .lp-cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid rgba(170, 198, 255, 0.28);
          background: rgba(170, 198, 255, 0.16);
          color: rgba(235, 245, 255, 0.95);
          font-size: 12px;
          font-weight: 600;
          text-decoration: none;
          transition: transform 0.15s ease, background 0.15s ease, border-color 0.15s ease;
        }

        .lp-cta:hover {
          transform: translateY(-1px);
          background: rgba(170, 198, 255, 0.22);
          border-color: rgba(170, 198, 255, 0.40);
        }

        .lp-ghost {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid rgba(170, 198, 255, 0.16);
          background: rgba(0, 0, 0, 0.20);
          color: rgba(200, 220, 255, 0.78);
          font-size: 12px;
          font-weight: 600;
          text-decoration: none;
          transition: transform 0.15s ease, background 0.15s ease, border-color 0.15s ease;
        }

        .lp-ghost:hover {
          transform: translateY(-1px);
          border-color: rgba(170, 198, 255, 0.26);
          background: rgba(20, 30, 50, 0.35);
        }

        .lp-disclaimer {
          margin-top: 12px;
          font-size: 10.5px;
          color: rgba(180, 200, 230, 0.50);
        }

        @media (min-width: 900px) {
          .lp-grid {
            grid-template-columns: 1.05fr 1fr;
          }

          .lp-list {
            border-bottom: none;
            border-right: 1px solid rgba(170, 198, 255, 0.08);
          }
        }
      `}</style>
    </section>
  );
}
