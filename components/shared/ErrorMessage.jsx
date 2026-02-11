/**
 * Reusable Error Message Component
 */

'use client';

export function ErrorMessage({ children }) {
  const text = String(children || "").trim();
  if (!text) return null;
  return (
    <div
      role="alert"
      style={{
        marginTop: 8,
        fontSize: 12,
        color: "rgba(255,120,120,0.95)",
      }}
    >
      {text}
    </div>
  );
}







