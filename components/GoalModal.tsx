'use client';

import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';

type GoalDraft = {
  name: string;
  targetAmount: string;
  timeline: string;
  category: string;
};

const KEY = 'investmentGoal';

export function AddGoalButton(props: { className?: string; style?: CSSProperties }) {
  const [isOpen, setIsOpen] = useState(false);
  const [goal, setGoal] = useState<GoalDraft>({
    name: '',
    targetAmount: '',
    timeline: '',
    category: 'wealth',
  });

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen]);

  const handleSave = () => {
    try {
      window.localStorage.setItem(KEY, JSON.stringify({ ...goal, savedAt: new Date().toISOString() }));
      window.dispatchEvent(new CustomEvent('li-goal-updated'));
      // eslint-disable-next-line no-alert
      alert('Goal saved!');
      setIsOpen(false);
    } catch {
      // eslint-disable-next-line no-alert
      alert('Could not save goal.');
    }
  };

  return (
    <>
      <button
        type="button"
        className={props.className}
        style={props.style}
        onClick={() => setIsOpen(true)}
      >
        + Add Goal
      </button>

      {isOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Investment Goal"
          onMouseDown={() => setIsOpen(false)}
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
              maxWidth: 520,
              borderRadius: 14,
              background: 'rgba(15, 18, 25, 0.98)',
              border: '1px solid rgba(100, 160, 255, 0.22)',
              boxShadow: '0 18px 60px rgba(0,0,0,0.55)',
              padding: 16,
              color: 'rgba(235, 242, 255, 0.92)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 800 }}>📌 Investment Goal</div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
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
                ✕
              </button>
            </div>

            <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
              <input
                type="text"
                placeholder="Goal name (e.g., Retirement)"
                value={goal.name}
                onChange={(e) => setGoal((g) => ({ ...g, name: e.target.value }))}
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
                value={goal.targetAmount}
                onChange={(e) => setGoal((g) => ({ ...g, targetAmount: e.target.value }))}
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
                value={goal.timeline}
                onChange={(e) => setGoal((g) => ({ ...g, timeline: e.target.value }))}
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
                value={goal.category}
                onChange={(e) => setGoal((g) => ({ ...g, category: e.target.value }))}
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
                  onClick={handleSave}
                  style={{
                    flex: 1,
                    borderRadius: 12,
                    padding: '10px 12px',
                    border: '1px solid rgba(140,220,180,0.35)',
                    background: 'linear-gradient(135deg, rgba(140,220,180,0.16) 0%, rgba(100,180,255,0.10) 100%)',
                    color: 'rgba(245,248,255,0.95)',
                    fontWeight: 800,
                    cursor: 'pointer',
                  }}
                >
                  Save Goal
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  style={{
                    flex: 1,
                    borderRadius: 12,
                    padding: '10px 12px',
                    border: '1px solid rgba(255,255,255,0.10)',
                    background: 'rgba(10,10,12,0.65)',
                    color: 'rgba(235,242,255,0.85)',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
              </div>

              <div style={{ marginTop: 2, fontSize: 11, color: 'rgba(200,215,240,0.45)', lineHeight: 1.4 }}>
                Saved locally on this device. No personal financial data is uploaded.
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
