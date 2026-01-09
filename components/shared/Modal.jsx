/**
 * Reusable Modal Component
 */

'use client';

export function Modal({ open, title = "", children, onClose }) {
  if (!open) return null;
  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.55)",
        display: "grid",
        placeItems: "center",
        zIndex: 60,
        padding: 16,
      }}
      onClick={() => onClose?.()}
    >
      <div
        style={{
          width: "min(520px, 100%)",
          borderRadius: 18,
          border: "1px solid rgba(255,255,255,0.10)",
          background: "rgba(12,12,12,0.92)",
          padding: 16,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {title ? <div style={{ fontWeight: 800, marginBottom: 10 }}>{title}</div> : null}
        {children}
      </div>
    </div>
  );
}




