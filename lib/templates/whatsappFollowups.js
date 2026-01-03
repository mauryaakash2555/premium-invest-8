// WhatsApp follow-up templates (educational, compliant)
// Usage: personalise with { name }, schedule via your WhatsApp workflow.

export function afterPurchaseInstant(name) {
  const n = String(name || "").trim() || "there";
  return `Hi ${n},\nYour BM Wealth Tax Execution Blueprint (FY 2025–26) is ready.\nDownload link is in your email.\nIf anything is unclear, just reply here.`;
}

export function after24Hours(name) {
  const n = String(name || "").trim() || "there";
  return `Quick check — did you see the month-by-month section?\nThat’s where most people realise what they were missing.`;
}

export function after5to7Days(name) {
  const n = String(name || "").trim() || "there";
  return `Many clients use this once and forget it.\nSome review it mid-year and fix things properly.\nIf you want a quick sanity check, reply REVIEW.`;
}
