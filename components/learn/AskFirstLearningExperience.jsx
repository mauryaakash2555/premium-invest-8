'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { LEARN_STYLES, styleById } from './learnStyles';
import { detectFollowUpIntent, resolveStyleUpdate } from './intentRouter';

const SESSION_KEY = 'ask_first_learn_session_v1';

function safeJsonParse(raw) {
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function normalizeTopic(raw) {
  return String(raw || '').trim();
}

function toDepthHint(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0;
  return Math.max(0, Math.min(50, Math.round(x)));
}

function splitParagraphs(text) {
  const t = String(text || '').trim();
  if (!t) return [];
  return t.split(/\n\s*\n+/g).map((p) => p.trim()).filter(Boolean);
}

async function explore({ topic, styleId, followUp, depthHint, signal }) {
  const res = await fetch('/api/learn/explore', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      topic,
      styleId,
      followUp,
      depthHint,
    }),
    signal,
  });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.ok) {
    const msg = data?.error || 'Unable to explore right now.';
    throw new Error(String(msg));
  }
  return String(data.text || '').trim();
}

const LazyLearningPathPanel = dynamic(() => import('@/components/live-intelligence/LearningPathPanel'), {
  ssr: false,
  loading: () => <div className="askfirst-loading">Opening…</div>,
});

export default function AskFirstLearningExperience() {
  const [stage, setStage] = useState('ask'); // ask | styles | explore | engine
  const [topic, setTopic] = useState('');
  const [draft, setDraft] = useState('');
  const [styleId, setStyleId] = useState('simple');
  const [showStylePicker, setShowStylePicker] = useState(false);
  const [depthHint, setDepthHint] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [output, setOutput] = useState('');
  const [followUp, setFollowUp] = useState('');

  const abortRef = useRef(null);
  const askInputRef = useRef(null);

  const selectedStyle = useMemo(() => styleById(styleId) || LEARN_STYLES[0], [styleId]);

  useEffect(() => {
    try {
      const raw = typeof window !== 'undefined' ? window.sessionStorage.getItem(SESSION_KEY) : null;
      const s = raw ? safeJsonParse(raw) : null;
      if (!s || typeof s !== 'object') return;

      const nextTopic = normalizeTopic(s.topic);
      const nextStyleId = String(s.styleId || 'simple');
      const nextDepth = toDepthHint(s.depthHint);
      const nextOutput = String(s.output || '');

      if (nextTopic) {
        setTopic(nextTopic);
        setDraft(nextTopic);
        setStyleId(styleById(nextStyleId)?.id || 'simple');
        setDepthHint(nextDepth);
        setOutput(nextOutput);
        setStage(nextOutput ? 'explore' : 'styles');
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      window.sessionStorage.setItem(
        SESSION_KEY,
        JSON.stringify({
          topic,
          styleId,
          depthHint,
          output,
          updatedAt: new Date().toISOString(),
        })
      );
    } catch {
      // ignore
    }
  }, [topic, styleId, depthHint, output]);

  useEffect(() => {
    if (stage === 'ask') {
      setTimeout(() => {
        try {
          askInputRef.current?.focus?.();
        } catch {
          // ignore
        }
      }, 50);
    }
  }, [stage]);

  const begin = useCallback(() => {
    const t = normalizeTopic(draft);
    setError('');
    if (!t) return;
    setTopic(t);
    setStage('styles');
    setShowStylePicker(true);
  }, [draft]);

  const openEngine = useCallback(() => {
    setError('');
    setShowStylePicker(false);
    setStage('engine');
  }, []);

  const runExplore = useCallback(
    async ({ nextStyleId, followUpText, nextDepthHint }) => {
      const t = normalizeTopic(topic);
      if (!t) return;

      const sid = String(nextStyleId || styleId);
      setLoading(true);
      setError('');

      try {
        if (abortRef.current) abortRef.current.abort();
      } catch {}

      const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
      abortRef.current = ctrl;

      try {
        const text = await explore({
          topic: t,
          styleId: sid,
          followUp: followUpText || '',
          depthHint: toDepthHint(nextDepthHint),
          signal: ctrl?.signal,
        });
        setOutput(text);
        setStage('explore');
      } catch (e) {
        setError(String(e?.message || 'Unable to explore right now.'));
      } finally {
        setLoading(false);
      }
    },
    [styleId, topic]
  );

  const chooseStyle = useCallback(
    async (sid) => {
      const resolved = styleById(sid)?.id;
      if (!resolved) return;
      setStyleId(resolved);
      setShowStylePicker(false);
      await runExplore({ nextStyleId: resolved, followUpText: '', nextDepthHint: depthHint });
    },
    [depthHint, runExplore]
  );

  const onFollowUp = useCallback(
    async (raw) => {
      const cmd = String(raw || '').trim();
      if (!cmd) return;
      setFollowUp('');

      const intent = detectFollowUpIntent(cmd);
      const { nextStyleId, needsPicker } = resolveStyleUpdate(intent, styleId);

      if (intent.type === 'depth') {
        const next = intent.direction === 'deeper' ? toDepthHint(depthHint + 1) : toDepthHint(depthHint - 1);
        setDepthHint(next);
        await runExplore({ nextStyleId: styleId, followUpText: cmd, nextDepthHint: next });
        return;
      }

      if (needsPicker) {
        setShowStylePicker(true);
        return;
      }

      if (nextStyleId !== styleId) {
        setStyleId(nextStyleId);
        await runExplore({ nextStyleId, followUpText: cmd, nextDepthHint: depthHint });
        return;
      }

      await runExplore({ nextStyleId: styleId, followUpText: cmd, nextDepthHint: depthHint });
    },
    [depthHint, runExplore, styleId]
  );

  const reset = useCallback(() => {
    try {
      if (abortRef.current) abortRef.current.abort();
    } catch {}
    setStage('ask');
    setTopic('');
    setDraft('');
    setOutput('');
    setFollowUp('');
    setDepthHint(0);
    setError('');
    setLoading(false);
    setShowStylePicker(false);
    try {
      if (typeof window !== 'undefined') window.sessionStorage.removeItem(SESSION_KEY);
    } catch {}
  }, []);

  const paragraphs = useMemo(() => splitParagraphs(output), [output]);

  return (
    <div className="askfirst-wrap">
      <div className="askfirst-shell">
        {stage === 'ask' ? (
          <div className="askfirst-center">
            <div className="askfirst-title">What would you like to explore?</div>
            <div className="askfirst-sub">Any finance topic. One line is enough.</div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                begin();
              }}
              className="askfirst-form"
            >
              <input
                ref={askInputRef}
                className="askfirst-input"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="e.g., why do mutual funds fall when rates rise?"
                aria-label="Ask what you want to learn"
                autoComplete="off"
              />
              <button type="submit" className="askfirst-btn" disabled={!normalizeTopic(draft)}>
                Continue
              </button>
            </form>
          </div>
        ) : null}

        {stage !== 'ask' ? (
          <div className="askfirst-topbar">
            <button type="button" className="askfirst-ghost" onClick={reset} aria-label="Start over">
              New ask
            </button>

            {stage === 'engine' ? (
              <button
                type="button"
                className="askfirst-ghost"
                onClick={() => {
                  setStage('styles');
                  setShowStylePicker(true);
                }}
                aria-label="Back to learning styles"
              >
                Back to styles
              </button>
            ) : null}

            <div className="askfirst-pill" title={topic}>
              <span className="askfirst-pillLabel">Topic</span>
              <span className="askfirst-pillValue">{topic}</span>
            </div>

            <button
              type="button"
              className="askfirst-styleBtn"
              onClick={() => setShowStylePicker((v) => !v)}
              aria-label="Switch learning style"
            >
              <span className="askfirst-styleLabel">Style</span>
              <span className="askfirst-styleValue">{selectedStyle?.label}</span>
            </button>
          </div>
        ) : null}

        {stage === 'styles' ? (
          <div className="askfirst-center" style={{ paddingTop: 26 }}>
            <div className="askfirst-title">How would you like to explore this?</div>
            <div className="askfirst-sub">Pick a door. You can switch anytime.</div>
          </div>
        ) : null}

        {showStylePicker ? (
          <div className="askfirst-styleGrid" role="dialog" aria-label="Choose a learning style">
            {LEARN_STYLES.map((s) => (
              <button
                key={s.id}
                type="button"
                className="askfirst-styleCard"
                data-active={s.id === styleId ? '1' : '0'}
                onClick={() => chooseStyle(s.id)}
                disabled={loading}
              >
                <div className="askfirst-styleCardTitle">{s.label}</div>
                <div className="askfirst-styleCardHint">{s.hint}</div>
              </button>
            ))}

            <button
              type="button"
              className="askfirst-styleCard askfirst-engineCard"
              onClick={openEngine}
              disabled={loading}
            >
              <div className="askfirst-styleCardTitle">Explore deeply (lesson engine)</div>
              <div className="askfirst-styleCardHint">
                Optional: open the existing premium lesson engine (separate from this sanctuary).
              </div>
            </button>
          </div>
        ) : null}

        {stage === 'explore' ? (
          <div className="askfirst-content">
            {error ? <div className="askfirst-error">{error}</div> : null}

            {!error ? (
              <div className="askfirst-card" aria-label="Learning output">
                {loading ? <div className="askfirst-loading">Opening…</div> : null}
                {!loading && paragraphs.length ? (
                  <div className="askfirst-text">
                    {paragraphs.map((p, idx) => (
                      <p key={idx}>{p}</p>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="askfirst-follow">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onFollowUp(followUp);
                }}
                className="askfirst-followForm"
              >
                <input
                  className="askfirst-followInput"
                  value={followUp}
                  onChange={(e) => setFollowUp(e.target.value)}
                  placeholder="Try: go deeper • explain differently • give an example • challenge me"
                  aria-label="Follow-up command"
                  autoComplete="off"
                />
                <button type="submit" className="askfirst-btn" disabled={!String(followUp || '').trim() || loading}>
                  Ask
                </button>
              </form>
              <div className="askfirst-hints">
                <button type="button" className="askfirst-chip" onClick={() => onFollowUp('go deeper')} disabled={loading}>
                  go deeper
                </button>
                <button type="button" className="askfirst-chip" onClick={() => onFollowUp('give an example')} disabled={loading}>
                  give example
                </button>
                <button type="button" className="askfirst-chip" onClick={() => onFollowUp('explain differently')} disabled={loading}>
                  explain differently
                </button>
                <button type="button" className="askfirst-chip" onClick={() => onFollowUp('challenge me')} disabled={loading}>
                  challenge me
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {stage === 'engine' ? (
          <div className="askfirst-engine" aria-label="Deep learning engine">
            {error ? <div className="askfirst-error">{error}</div> : null}
            <div className="askfirst-card">
              <LazyLearningPathPanel />
            </div>
          </div>
        ) : null}

        {stage === 'styles' && loading ? <div className="askfirst-loading" style={{ marginTop: 18 }}>Opening…</div> : null}
        {stage === 'styles' && error ? <div className="askfirst-error">{error}</div> : null}
      </div>

      <style jsx>{`
        .askfirst-wrap {
          min-height: 100vh;
          background: radial-gradient(120% 120% at 50% 0%, rgba(110, 180, 255, 0.10) 0%, rgba(8, 9, 11, 0.98) 58%, rgba(0, 0, 0, 1) 100%);
          color: rgba(235, 242, 255, 0.92);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 22px;
          overflow: hidden;
        }

        .askfirst-shell {
          width: min(880px, 100%);
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .askfirst-center {
          text-align: center;
        }

        .askfirst-title {
          font-size: 18px;
          font-weight: 650;
          letter-spacing: -0.01em;
          color: rgba(235, 242, 255, 0.96);
        }

        .askfirst-sub {
          margin-top: 8px;
          font-size: 13px;
          color: rgba(180, 200, 230, 0.62);
        }

        .askfirst-form {
          margin-top: 18px;
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 10px;
          align-items: center;
        }

        .askfirst-input {
          height: 46px;
          border-radius: 14px;
          border: 1px solid rgba(170, 198, 255, 0.18);
          background: rgba(0, 0, 0, 0.38);
          color: rgba(235, 242, 255, 0.92);
          padding: 0 14px;
          outline: none;
          transition: border-color 180ms ease, box-shadow 180ms ease;
        }

        .askfirst-input:focus {
          border-color: rgba(120, 180, 255, 0.38);
          box-shadow: 0 0 0 4px rgba(120, 180, 255, 0.10);
        }

        .askfirst-btn {
          height: 46px;
          border-radius: 14px;
          border: 1px solid rgba(170, 198, 255, 0.22);
          background: rgba(110, 180, 255, 0.12);
          color: rgba(235, 242, 255, 0.92);
          font-weight: 650;
          padding: 0 16px;
          cursor: pointer;
          transition: transform 160ms ease, background 160ms ease, border-color 160ms ease;
        }

        .askfirst-btn:disabled {
          opacity: 0.5;
          cursor: default;
        }

        .askfirst-topbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
        }

        .askfirst-ghost {
          border: 1px solid rgba(170, 198, 255, 0.14);
          background: rgba(0, 0, 0, 0.22);
          color: rgba(200, 215, 240, 0.80);
          border-radius: 12px;
          padding: 10px 12px;
          cursor: pointer;
        }

        .askfirst-pill {
          flex: 1;
          min-width: 220px;
          display: flex;
          align-items: baseline;
          gap: 10px;
          padding: 10px 12px;
          border-radius: 12px;
          border: 1px solid rgba(170, 198, 255, 0.12);
          background: rgba(0, 0, 0, 0.24);
          overflow: hidden;
        }

        .askfirst-pillLabel {
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(170, 198, 255, 0.62);
          font-weight: 700;
          white-space: nowrap;
        }

        .askfirst-pillValue {
          font-size: 13px;
          color: rgba(235, 242, 255, 0.90);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .askfirst-styleBtn {
          border: 1px solid rgba(170, 198, 255, 0.18);
          background: rgba(110, 180, 255, 0.10);
          color: rgba(235, 242, 255, 0.92);
          border-radius: 12px;
          padding: 10px 12px;
          cursor: pointer;
          display: inline-flex;
          align-items: baseline;
          gap: 10px;
        }

        .askfirst-styleLabel {
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(170, 198, 255, 0.62);
          font-weight: 700;
        }

        .askfirst-styleValue {
          font-size: 13px;
          font-weight: 650;
        }

        .askfirst-styleGrid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 10px;
          margin-top: 6px;
          animation: fadeIn 240ms ease both;
        }

        .askfirst-styleCard {
          text-align: left;
          border-radius: 16px;
          border: 1px solid rgba(170, 198, 255, 0.14);
          background: rgba(0, 0, 0, 0.28);
          padding: 14px 14px;
          cursor: pointer;
          transition: transform 160ms ease, border-color 160ms ease, background 160ms ease;
        }

        .askfirst-engineCard {
          border-color: rgba(120, 180, 255, 0.22);
          background: rgba(110, 180, 255, 0.06);
        }

        .askfirst-styleCard[data-active='1'] {
          border-color: rgba(120, 180, 255, 0.34);
          background: rgba(110, 180, 255, 0.10);
        }

        .askfirst-styleCardTitle {
          font-size: 13px;
          font-weight: 700;
          color: rgba(235, 242, 255, 0.94);
        }

        .askfirst-styleCardHint {
          margin-top: 6px;
          font-size: 12px;
          color: rgba(180, 200, 230, 0.62);
          line-height: 1.4;
        }

        .askfirst-content {
          display: grid;
          gap: 12px;
        }

        .askfirst-engine {
          display: grid;
          gap: 12px;
        }

        .askfirst-card {
          border-radius: 18px;
          border: 1px solid rgba(170, 198, 255, 0.12);
          background: rgba(0, 0, 0, 0.28);
          padding: 16px 16px;
          box-shadow: 0 30px 100px rgba(0, 0, 0, 0.45);
        }

        .askfirst-text p {
          margin: 0 0 10px;
          color: rgba(220, 235, 255, 0.86);
          font-size: 13px;
          line-height: 1.6;
        }

        .askfirst-text p:last-child {
          margin-bottom: 0;
        }

        .askfirst-follow {
          display: grid;
          gap: 10px;
        }

        .askfirst-followForm {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 10px;
        }

        .askfirst-followInput {
          height: 44px;
          border-radius: 14px;
          border: 1px solid rgba(170, 198, 255, 0.14);
          background: rgba(0, 0, 0, 0.22);
          color: rgba(235, 242, 255, 0.90);
          padding: 0 14px;
          outline: none;
        }

        .askfirst-hints {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .askfirst-chip {
          border-radius: 999px;
          border: 1px solid rgba(170, 198, 255, 0.12);
          background: rgba(0, 0, 0, 0.18);
          color: rgba(200, 215, 240, 0.80);
          padding: 8px 10px;
          font-size: 12px;
          cursor: pointer;
        }

        .askfirst-loading {
          color: rgba(170, 198, 255, 0.72);
          font-size: 12px;
          text-align: center;
        }

        .askfirst-error {
          border-radius: 14px;
          border: 1px solid rgba(255, 120, 120, 0.18);
          background: rgba(40, 0, 0, 0.28);
          color: rgba(255, 200, 200, 0.90);
          padding: 12px 12px;
          font-size: 12px;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0px); }
        }

        @media (max-width: 740px) {
          .askfirst-styleGrid {
            grid-template-columns: 1fr;
          }

          .askfirst-form {
            grid-template-columns: 1fr;
          }

          .askfirst-followForm {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
