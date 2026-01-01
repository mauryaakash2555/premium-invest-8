/**
 * FILE: components/shared/LoadingSpinner.jsx
 * PURPOSE: Small loading spinner UI.
 * CATEGORY: shared
 *
 * SIMPLE EXPLANATION:
 * When something is loading, we show a spinning circle.
 */

'use client';

export function LoadingSpinner({ label = "Loading..." }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, opacity: 0.85 }}>
      <span
        aria-hidden="true"
        style={{
          width: 16,
          height: 16,
          borderRadius: 999,
          border: '2px solid rgba(192,160,98,0.25)',
          borderTopColor: 'rgba(192,160,98,0.95)',
          animation: 'bm_spin 0.9s linear infinite',
        }}
      />
      <span style={{ fontSize: 12 }}>{label}</span>
      <style jsx>{`
        @keyframes bm_spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
