'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

const STORAGE_KEY = 'LEARN_KERNEL_V1';

function nowIso() {
  return new Date().toISOString();
}

function safeTrim(s) {
  return typeof s === 'string' ? s.replace(/^\s+|\s+$/g, '') : '';
}

function defaultKernel() {
  return {
    topic: '',
    curiosityGraph: [],
    currentNodeId: '',
    learningStyle: null,
    depth: 0,
    rewards: {
      insightMoments: 0,
      depthUnlocked: 0,
      masterySignals: [],
    },
    userSignals: {
      boredom: false,
      confusion: false,
      excitement: false,
    },
    history: [],
  };
}

function mergeKernel(prev, patch) {
  const next = { ...(prev || {}) };
  if (!patch || typeof patch !== 'object') return next;

  for (const [k, v] of Object.entries(patch)) {
    if (k === 'rewards' && v && typeof v === 'object') {
      next.rewards = { ...(next.rewards || {}), ...v };
      continue;
    }
    if (k === 'userSignals' && v && typeof v === 'object') {
      next.userSignals = { ...(next.userSignals || {}), ...v };
      continue;
    }
    if (k === 'curiosityGraph' && Array.isArray(v)) {
      next.curiosityGraph = v;
      continue;
    }
    if (k === 'history' && Array.isArray(v)) {
      next.history = v;
      continue;
    }
    next[k] = v;
  }

  return next;
}

export default function AskFirstInfiniteLearning() {
  const router = useRouter();

  const inputRef = useRef(null);

  const [isHydrated, setIsHydrated] = useState(false);

  const [stage, setStage] = useState('ask'); // ask | choose | learn
  const [draft, setDraft] = useState('');

  const [kernel, setKernel] = useState(defaultKernel);
  const [options, setOptions] = useState([]);

  const [slice, setSlice] = useState('');
  const [question, setQuestion] = useState('');
  const [rewardLine, setRewardLine] = useState('');

  const [cursor, setCursor] = useState(-1);

  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState('');

  const abortRef = useRef(null);

  useEffect(() => {
    setIsHydrated(true);
    try {
      const raw = window.sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== 'object' || typeof parsed.topic !== 'string') return;

      setKernel(parsed);
      const hist = Array.isArray(parsed.history) ? parsed.history : [];
      if (hist.length) {
        setCursor(hist.length - 1);
        const last = hist[hist.length - 1];
        setSlice(String(last?.slice || ''));
        setQuestion(String(last?.question || ''));
        setRewardLine(String(last?.rewardLine || ''));
      }

      if (parsed.topic && parsed.learningStyle && hist.length) setStage('learn');
      else if (parsed.topic) setStage('choose');
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(kernel));
    } catch {
      // ignore
    }
  }, [kernel]);

  const canSubmitTopic = useMemo(() => safeTrim(draft).length >= 2, [draft]);

  const callApi = useCallback(async ({ action, nextKernel, choice = null, command = null }) => {
    setIsBusy(true);
    setError('');

    if (abortRef.current) {
      try {
        abortRef.current.abort();
      } catch {}
    }
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/learn/ask-first', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, kernel: nextKernel, choice, command }),
        signal: controller.signal,
      });

      const json = await res.json().catch(() => null);
      if (!res.ok || !json || json.ok !== true) {
        throw new Error((json && (json.error || json.detail)) || 'Failed');
      }

      if (json.kind === 'options') {
        setOptions(Array.isArray(json.options) ? json.options : []);
        setQuestion(String(json.question || 'How do you want to explore this?'));
        setRewardLine('');
        setSlice('');
        setStage('choose');
        return;
      }

      if (json.kind === 'slice') {
        setKernel((prev) => {
          const merged = mergeKernel(prev, json.kernelPatch);
          const history = Array.isArray(merged.history) ? merged.history : [];
          const entry = {
            ts: nowIso(),
            depth: merged.depth,
            topic: merged.topic,
            learningStyle: merged.learningStyle,
            nodeId: merged.currentNodeId,
            command: String(command || 'step'),
            slice: String(json.slice || ''),
            question: String(json.question || ''),
            rewardLine: String(json.rewardLine || ''),
          };
          const nextHistory = [...history, entry].slice(-500);
          return { ...merged, history: nextHistory };
        });

        setSlice(String(json.slice || ''));
        setQuestion(String(json.question || 'How do you want to continue?'));
        setRewardLine(String(json.rewardLine || ''));
        setStage('learn');
        return;
      }

      throw new Error('Bad response');
    } catch (e) {
      const aborted = e && typeof e === 'object' && e.name === 'AbortError';
      setError(aborted ? 'Cancelled.' : String(e?.message || 'Failed'));
    } finally {
      setIsBusy(false);
    }
  }, []);

  const requestOptions = useCallback(async (nextKernel) => {
    await callApi({ action: 'options', nextKernel });
  }, [callApi]);

  const requestStep = useCallback(async ({ nextKernel, choice = null, command }) => {
    await callApi({ action: 'step', nextKernel, choice, command });
  }, [callApi]);

  const submitTopic = useCallback(
    async (maybeTopic) => {
      const topic = safeTrim(typeof maybeTopic === 'string' ? maybeTopic : draft);
    if (!topic) return;

    const nextKernel = {
      ...defaultKernel(),
      topic, // sacred
      depth: 0,
      learningStyle: null,
      curiosityGraph: [],
      currentNodeId: '',
      history: [],
    };

    setKernel(nextKernel);
    setOptions([]);
    setSlice('');
    setQuestion('');
    setRewardLine('');
    setCursor(-1);

      await requestOptions(nextKernel);
    },
    [draft, requestOptions]
  );

  const chooseStyle = useCallback(async (opt) => {
    if (!opt || !opt.id) return;
    const nextKernel = {
      ...kernel,
      learningStyle: String(opt.id),
    };

    setKernel(nextKernel);
    setOptions([]);
    await requestStep({ nextKernel, choice: { id: String(opt.id), title: String(opt.title || '') }, command: 'start' });
  }, [kernel, requestStep]);

  const act = useCallback(async (command) => {
    if (!kernel.topic) return;

    if (command === 'switch_style') {
      const nextKernel = {
        ...kernel,
        learningStyle: null,
      };
      setKernel(nextKernel);
      await requestOptions(nextKernel);
      return;
    }

    const nextKernel = {
      ...kernel,
    };
    setKernel(nextKernel);
    await requestStep({ nextKernel, command });
  }, [kernel, requestOptions, requestStep]);

  const reset = useCallback(() => {
    if (abortRef.current) {
      try {
        abortRef.current.abort();
      } catch {}
    }
    setDraft('');
    setKernel(defaultKernel());
    setOptions([]);
    setSlice('');
    setQuestion('');
    setRewardLine('');
    setCursor(-1);
    setError('');
    setIsBusy(false);
    setStage('ask');
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {}
  }, []);

  const backInHistory = useCallback(() => {
    const hist = Array.isArray(kernel.history) ? kernel.history : [];
    if (!hist.length) return;
    const current = cursor >= 0 ? cursor : hist.length - 1;
    const nextCursor = Math.max(0, current - 1);
    const entry = hist[nextCursor];
    setCursor(nextCursor);
    setSlice(String(entry?.slice || ''));
    setQuestion(String(entry?.question || ''));
    setRewardLine(String(entry?.rewardLine || ''));
  }, [cursor, kernel.history]);

  const forwardInHistory = useCallback(() => {
    const hist = Array.isArray(kernel.history) ? kernel.history : [];
    if (!hist.length) return;
    const current = cursor >= 0 ? cursor : hist.length - 1;
    const nextCursor = Math.min(hist.length - 1, current + 1);
    const entry = hist[nextCursor];
    setCursor(nextCursor);
    setSlice(String(entry?.slice || ''));
    setQuestion(String(entry?.question || ''));
    setRewardLine(String(entry?.rewardLine || ''));
  }, [cursor, kernel.history]);

  const historySize = useMemo(() => (Array.isArray(kernel.history) ? kernel.history.length : 0), [kernel.history]);
  const showBack = stage === 'learn' && historySize > 1;
  const showForward = stage === 'learn' && historySize > 1 && cursor >= 0 && cursor < historySize - 1;

  return (
    <div
      data-learn-ready={isHydrated ? '1' : '0'}
      style={{
        height: '100vh',
        width: '100%',
        background: 'var(--li-background)',
        color: 'var(--li-text)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <style>{`
        .lk-wrap { width: min(980px, 92vw); }
        .lk-panel { border: 1px solid var(--li-border); background: var(--li-background-panel); backdrop-filter: blur(var(--li-glass-blur)); -webkit-backdrop-filter: blur(var(--li-glass-blur)); border-radius: 16px; box-shadow: 0 14px 34px rgba(0,0,0,0.28); }
        .lk-input { width: 100%; padding: 18px 16px; border: 1px solid var(--li-border-strong); background: var(--li-background-card); color: var(--li-text); outline: none; border-radius: 14px; font-size: 15px; }
        .lk-input:focus { border-color: var(--li-accent-strong); box-shadow: 0 0 0 3px var(--li-accent-glow); }
        .lk-btn { padding: 10px 12px; border: 1px solid var(--li-border); background: var(--li-button-bg); color: var(--li-text); font-weight: 800; cursor: pointer; border-radius: 12px; transition: background 160ms ease, border-color 160ms ease, transform 160ms ease; }
        .lk-btn:hover { background: var(--li-button-hover); border-color: var(--li-border-strong); transform: translateY(-1px); }
        .lk-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
        .lk-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
        @media (min-width: 860px) { .lk-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
        .lk-opt { text-align: left; padding: 12px 12px; }
        .lk-optTitle { font-weight: 900; color: var(--li-accent-strong); font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; }
        .lk-optSub { margin-top: 6px; color: var(--li-text-muted); font-size: 12px; line-height: 1.4; }
        .lk-slice { white-space: pre-wrap; line-height: 1.85; font-size: 15px; }
        .lk-row { display: flex; gap: 10px; flex-wrap: wrap; align-items: center; }
        .lk-pill { border: 1px solid var(--li-border); padding: 8px 10px; font-size: 11px; color: var(--li-text-muted); letter-spacing: 0.12em; text-transform: uppercase; border-radius: 999px; }
        .lk-hr { height: 1px; width: 100%; background: var(--li-border); opacity: 0.9; }
      `}</style>

      <div className="lk-wrap">
        {stage === 'ask' ? (
          <div className="lk-panel" style={{ padding: 18 }}>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitTopic(inputRef.current?.value);
              }}
            >
              <input
                ref={inputRef}
                className="lk-input"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    submitTopic(e.currentTarget.value);
                  }
                }}
                placeholder="What would you like to understand today?"
                aria-label="What would you like to understand today?"
                autoComplete="off"
                spellCheck={false}
              />
              <button type="submit" disabled={!canSubmitTopic || isBusy} style={{ display: 'none' }} aria-hidden="true" tabIndex={-1}>
                Continue
              </button>
            </form>

            {error ? (
              <div
                style={{
                  marginTop: 12,
                  padding: 12,
                  border: '1px solid var(--li-error)',
                  background: 'color-mix(in srgb, var(--li-error) 18%, transparent)',
                }}
              >
                {error}
              </div>
            ) : null}
          </div>
        ) : null}

        {stage !== 'ask' ? (
          <div className="lk-panel" style={{ padding: 18 }}>
            <div className="lk-row" style={{ justifyContent: 'space-between' }}>
              <div className="lk-row" style={{ gap: 8 }}>
                <div className="lk-pill" title={kernel.topic}>Topic: {kernel.topic}</div>
                <div className="lk-pill">Depth: {kernel.depth}</div>
                <div className="lk-pill">Style: {kernel.learningStyle ? String(kernel.learningStyle) : '—'}</div>
              </div>

              <div className="lk-row" style={{ justifyContent: 'flex-end' }}>
                <button type="button" className="lk-btn" onClick={() => router.push('/live-intelligence')} disabled={isBusy}>
                  Live
                </button>
                <button type="button" className="lk-btn" onClick={reset} disabled={isBusy}>
                  Reset
                </button>
              </div>
            </div>

            <div className="lk-hr" style={{ marginTop: 14, marginBottom: 14 }} />

            {stage === 'choose' ? (
              <div style={{ display: 'grid', gap: 12 }}>
                <div style={{ color: 'var(--li-text)', fontWeight: 900, fontSize: 14 }}>
                  {question || `How do you want to explore “${kernel.topic}”?`}
                </div>

                <div className="lk-grid">
                  {(options || []).map((o) => (
                    <button
                      key={String(o.id)}
                      type="button"
                      className="lk-btn lk-opt"
                      onClick={() => chooseStyle(o)}
                      disabled={isBusy}
                    >
                      <div className="lk-optTitle">{String(o.title || o.id)}</div>
                      <div className="lk-optSub">{String(o.subtitle || '')}</div>
                    </button>
                  ))}
                </div>

                {error ? (
                  <div style={{ padding: 12, border: '1px solid var(--li-error)', background: 'color-mix(in srgb, var(--li-error) 18%, transparent)' }}>
                    {error}
                  </div>
                ) : null}
              </div>
            ) : null}

            {stage === 'learn' ? (
              <div style={{ display: 'grid', gap: 12 }}>
                {rewardLine ? (
                  <div style={{ color: 'var(--li-text-muted)', fontSize: 12 }}>
                    {rewardLine}
                  </div>
                ) : null}

                <div className="lk-slice">{slice}</div>
                <div style={{ color: 'var(--li-text)', fontWeight: 900 }}>
                  {question || 'How do you want to continue?'}
                </div>

                <div className="lk-row" style={{ marginTop: 4 }}>
                  <button type="button" className="lk-btn" onClick={() => act('go_deeper')} disabled={isBusy || !kernel.learningStyle}>
                    Go deeper
                  </button>
                  <button type="button" className="lk-btn" onClick={() => act('branch_sideways')} disabled={isBusy || !kernel.learningStyle}>
                    Branch sideways
                  </button>
                  <button type="button" className="lk-btn" onClick={() => act('challenge_me')} disabled={isBusy || !kernel.learningStyle}>
                    Challenge me
                  </button>
                  <button type="button" className="lk-btn" onClick={() => act('summarize_so_far')} disabled={isBusy || !kernel.learningStyle}>
                    Summarize so far
                  </button>
                  <button type="button" className="lk-btn" onClick={() => act('switch_style')} disabled={isBusy}>
                    Switch style
                  </button>

                  {showBack ? (
                    <button type="button" className="lk-btn" onClick={backInHistory} disabled={isBusy}>
                      Back
                    </button>
                  ) : null}

                  {showForward ? (
                    <button type="button" className="lk-btn" onClick={forwardInHistory} disabled={isBusy}>
                      Forward
                    </button>
                  ) : null}
                </div>

                {error ? (
                  <div style={{ padding: 12, border: '1px solid var(--li-error)', background: 'color-mix(in srgb, var(--li-error) 18%, transparent)' }}>
                    {error}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
