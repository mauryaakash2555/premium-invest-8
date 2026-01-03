"use client";

export function ZeroTaxBadge({ label }) {
  if (!label) return null;
  return <div className="bm-zero-tax-badge text-[11px] font-semibold">{label}</div>;
}
