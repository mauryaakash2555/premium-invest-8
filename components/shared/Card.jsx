/**
 * Reusable Card Component
 */

'use client';

export function Card({ children, className = "" }) {
  return (
    <div
      className={[
        "rounded-2xl border border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.20)] p-4",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}







