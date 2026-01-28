'use client';

import type { CSSProperties } from 'react';
import { useEffect, useMemo, useState } from 'react';

type Goal = {
  id: string;
  name: string;
  targetAmount: string;
  timeline: string;
  category: string;
  savedAt: string;
};

const KEY_LIST = 'li_goals_v1';
const KEY_LEGACY = 'investmentGoal';

function safeJsonParse<T>(value: string | null, fallback: T): T {
  try {
    if (!value) return fallback;
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function nowIso() {
  return new Date().toISOString();
}

function readGoals(): Goal[] {
  if (typeof window === 'undefined') return [];

  const list = safeJsonParse<any>(window.localStorage.getItem(KEY_LIST), null);
  if (Array.isArray(list)) {
    return list
      .map((g) => ({
        id: String(g?.id || ''),
        name: String(g?.name || ''),
        targetAmount: String(g?.targetAmount || ''),
        timeline: String(g?.timeline || ''),
        category: String(g?.category || ''),
        savedAt: String(g?.savedAt || ''),
      }))
      .filter((g) => g.id && g.name)
      .slice(0, 50);
  }

  const legacy = safeJsonParse<any>(window.localStorage.getItem(KEY_LEGACY), null);
  if (legacy && typeof legacy === 'object' && legacy.name) {
    return [
      {
        id: String(legacy?.savedAt || Date.now()),
        name: String(legacy.name),
        targetAmount: String(legacy?.targetAmount || ''),
        timeline: String(legacy?.timeline || ''),
        category: String(legacy?.category || 'wealth'),
        savedAt: String(legacy?.savedAt || nowIso()),
      },
    ];
  }

  return [];
}

function writeGoals(goals: Goal[]) {
  window.localStorage.setItem(KEY_LIST, JSON.stringify(goals.slice(0, 50)));
  try {
    window.dispatchEvent(new CustomEvent('li-goal-updated'));
  } catch {
    // ignore
  }
}

function formatSavedAt(iso: string) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '';
  }
}

function labelTimeline(value: string) {
  if (!value) return '—';
  return `${value}y`;
}

function labelCategory(value: string) {
  const v = String(value || '').trim();
  if (!v) return '—';
  return v[0].toUpperCase() + v.slice(1);
}

function GoalEditorModal(props: {
  open: boolean;
  initial?: Goal | null;
  onClose: () => void;
  onSave: (goal: Goal) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Goal>(() =>
    props.initial
      ? props.initial
      : {
          id: String(Date.now()),
          name: '',
          targetAmount: '',
          timeline: '',
          category: 'wealth',
          savedAt: nowIso(),
        }
  );

  useEffect(() => {
    if (!props.open) return;
    setError(null);
    setDraft(
      props.initial
        ? props.initial
        : {
            id: String(Date.now()),
            name: '',
            targetAmount: '',
            timeline: '',
            category: 'wealth',
            savedAt: nowIso(),
          }
    );
  }, [props.open, props.initial]);

  useEffect(() => {
    if (!props.open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') props.onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [props.open, props.onClose]);

  if (!props.open) return null;

  const save = () => {
    const name = draft.name.trim();
    if (!name) {
      setError('Please enter a goal name.');
      return;
    }
    setError(null);
    props.onSave({ ...draft, name, savedAt: nowIso() });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Manage goal"
      onMouseDown={props.onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100000,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onMouseDown={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 560,
          borderRadius: 14,
          background: 'rgba(15, 18, 25, 0.98)',
          border: '1px solid rgba(100, 160, 255, 0.22)',
          boxShadow: '0 18px 60px rgba(0,0,0,0.55)',
          padding: 16,
          color: 'rgba(235, 242, 255, 0.92)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 900 }}>Goal</div>
          <button
            type="button"
            onClick={props.onClose}
            style={{
              appearance: 'none',
              border: 'none',
              background: 'transparent',
              color: 'rgba(200,215,240,0.7)',
              cursor: 'pointer',
              fontSize: 16,
              padding: 6,
            }}
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
          {error ? (
            <div
              role="status"
              style={{
                padding: '10px 12px',
                borderRadius: 12,
                background: 'rgba(255, 100, 100, 0.08)',
                border: '1px solid rgba(255, 100, 100, 0.18)',
                color: 'rgba(255, 170, 170, 0.90)',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {error}
            </div>
          ) : null}

          <input
            type="text"
            placeholder="Goal name (e.g., Retirement)"
            value={draft.name}
            onChange={(e) => setDraft((g) => ({ ...g, name: e.target.value }))}
            style={{
              width: '100%',
              background: 'rgba(10,10,12,0.65)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 12,
              padding: '10px 12px',
              color: 'rgba(235, 242, 255, 0.92)',
              outline: 'none',
            }}
          />

          <input
            type="number"
            placeholder="Target amount (₹)"
            value={draft.targetAmount}
            onChange={(e) => setDraft((g) => ({ ...g, targetAmount: e.target.value }))}
            style={{
              width: '100%',
              background: 'rgba(10,10,12,0.65)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 12,
              padding: '10px 12px',
              color: 'rgba(235, 242, 255, 0.92)',
              outline: 'none',
            }}
          />

          <select
            value={draft.timeline}
            onChange={(e) => setDraft((g) => ({ ...g, timeline: e.target.value }))}
            style={{
              width: '100%',
              background: 'rgba(10,10,12,0.65)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 12,
              padding: '10px 12px',
              color: 'rgba(235, 242, 255, 0.92)',
              outline: 'none',
            }}
          >
            <option value="">Select timeline</option>
            <option value="1">1 year</option>
            <option value="5">5 years</option>
            <option value="10">10 years</option>
            <option value="20">20 years</option>
          </select>

          <select
            value={draft.category}
            onChange={(e) => setDraft((g) => ({ ...g, category: e.target.value }))}
            style={{
              width: '100%',
              background: 'rgba(10,10,12,0.65)',
              border: '1px solid rgba(255,255,255,0.10)',
              borderRadius: 12,
              padding: '10px 12px',
              color: 'rgba(235, 242, 255, 0.92)',
              outline: 'none',
            }}
          >
            <option value="wealth">Wealth</option>
            <option value="retirement">Retirement</option>
            <option value="home">Home</option>
            <option value="education">Education</option>
          </select>

          <div style={{ display: 'flex', gap: 10, marginTop: 6 }}>
            <button
              type="button"
              onClick={save}
              style={{
                flex: 1,
                borderRadius: 12,
                padding: '10px 12px',
                border: '1px solid rgba(140,220,180,0.35)',
                background: 'linear-gradient(135deg, rgba(140,220,180,0.16) 0%, rgba(100,180,255,0.10) 100%)',
                color: 'rgba(245,248,255,0.95)',
                fontWeight: 900,
                cursor: 'pointer',
              }}
            >
              Save
            </button>
            <button
              type="button"
              onClick={props.onClose}
              style={{
                flex: 1,
                borderRadius: 12,
                padding: '10px 12px',
                border: '1px solid rgba(255,255,255,0.10)',
                background: 'rgba(10,10,12,0.65)',
                color: 'rgba(235,242,255,0.85)',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>

          <div style={{ marginTop: 2, fontSize: 11, color: 'rgba(200,215,240,0.45)', lineHeight: 1.4 }}>
            Saved locally on this device.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GoalsPanel(props: { style?: CSSProperties }) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [open, setOpen] = useState(false);
  const [edit, setEdit] = useState<Goal | null>(null);

  useEffect(() => {
    const sync = () => setGoals(readGoals());
    sync();
    window.addEventListener('li-goal-updated', sync as any);
    window.addEventListener('storage', (e) => {
      if (!e || e.key === KEY_LIST || e.key === KEY_LEGACY) sync();
    });
    return () => {
      window.removeEventListener('li-goal-updated', sync as any);
    };
  }, []);

  const primary = goals.length ? goals[0] : null;

  const summary = useMemo(() => {
    if (!primary) return 'Add a goal to keep the hub oriented to intent.';
    const parts: string[] = [];
    if (primary.targetAmount) parts.push(`Target ₹${primary.targetAmount}`);
    if (primary.timeline) parts.push(`${labelTimeline(primary.timeline)} timeline`);
    if (primary.category) parts.push(labelCategory(primary.category));
    return parts.length ? parts.join(' • ') : '—';
  }, [primary]);

  const onSave = (g: Goal) => {
    const list = readGoals();
    const idx = list.findIndex((x) => x.id === g.id);
    const next = [...list];
    if (idx >= 0) next[idx] = g;
    else next.unshift(g);
    writeGoals(next);
    setOpen(false);
    setEdit(null);
  };

  const onDelete = (id: string) => {
    const next = readGoals().filter((g) => g.id !== id);
    writeGoals(next);
  };

  return (
    <div
      className="li-fade-in"
      style={{
        padding: '16px',
        borderRadius: '12px',
        background: 'rgba(100,160,255,0.04)',
        border: '1px solid rgba(100,160,255,0.12)',
        ...props.style,
      }}
      aria-label="Goals"
    >
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ color: 'rgba(200,215,240,0.75)', fontSize: 12, fontWeight: 600, letterSpacing: '0.02em' }}>
            Goals
          </div>
          <div style={{ marginTop: 3, color: 'rgba(200,215,240,0.45)', fontSize: 11 }}>
            {primary ? primary.name : 'Not set'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button
            type="button"
            onClick={() => {
              setEdit(null);
              setOpen(true);
            }}
            style={{
              appearance: 'none',
              border: '1px solid rgba(170,198,255,0.18)',
              background: 'rgba(10,10,12,0.55)',
              color: 'rgba(235,242,255,0.88)',
              padding: '7px 10px',
              borderRadius: 10,
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: 900,
            }}
          >
            Add
          </button>
        </div>
      </div>

      <div style={{ marginTop: 10, color: 'rgba(200,215,240,0.55)', fontSize: 11, lineHeight: 1.45 }}>
        {summary}
      </div>

      <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {goals.length ? (
          goals.slice(0, 5).map((g) => (
            <div
              key={g.id}
              style={{
                padding: '10px 10px',
                borderRadius: 12,
                background: 'rgba(10,10,12,0.45)',
                border: '1px solid rgba(170,198,255,0.10)',
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) auto',
                gap: 10,
                alignItems: 'center',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ color: 'rgba(245,248,255,0.92)', fontSize: 12, fontWeight: 900, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {g.name}
                </div>
                <div style={{ marginTop: 3, color: 'rgba(200,215,240,0.45)', fontSize: 11, lineHeight: 1.35 }}>
                  {g.targetAmount ? `₹${g.targetAmount}` : '—'} • {labelTimeline(g.timeline)} • {labelCategory(g.category)}
                  {g.savedAt ? <span style={{ marginLeft: 8, color: 'rgba(200,215,240,0.35)' }}>• {formatSavedAt(g.savedAt)}</span> : null}
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={() => {
                    setEdit(g);
                    setOpen(true);
                  }}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 10,
                    fontSize: 11,
                    fontWeight: 900,
                    cursor: 'pointer',
                    background: 'rgba(170,198,255,0.10)',
                    border: '1px solid rgba(170,198,255,0.14)',
                    color: 'rgba(210,225,255,0.90)',
                  }}
                  title="Edit goal"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(g.id)}
                  style={{
                    padding: '6px 10px',
                    borderRadius: 10,
                    fontSize: 11,
                    fontWeight: 900,
                    cursor: 'pointer',
                    background: 'rgba(255, 100, 100, 0.08)',
                    border: '1px solid rgba(255, 100, 100, 0.18)',
                    color: 'rgba(255, 170, 170, 0.90)',
                  }}
                  title="Delete goal"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div
            style={{
              padding: '12px 12px',
              borderRadius: 12,
              background: 'rgba(10,10,12,0.45)',
              border: '1px dashed rgba(170,198,255,0.12)',
              color: 'rgba(200,215,240,0.45)',
              fontSize: 11,
              lineHeight: 1.5,
            }}
          >
            No goals yet. Add one to track intent.
          </div>
        )}
      </div>

      <GoalEditorModal
        open={open}
        initial={edit}
        onClose={() => {
          setOpen(false);
          setEdit(null);
        }}
        onSave={onSave}
      />
    </div>
  );
}
