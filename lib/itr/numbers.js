// Strict rule: we NEVER invent or edit numeric values.
// These helpers only parse numbers that already exist in extracted tokens.

export function isLikelyNumberToken(s) {
  const t = String(s || '').trim();
  if (!t) return false;
  // common INR formatting: 1,23,456.78
  return /^[₹\s]*-?[0-9][0-9,]*([.][0-9]{1,2})?[₹\s]*$/.test(t);
}

export function parseInrNumber(s) {
  const t = String(s || '').trim();
  if (!t) return null;
  const cleaned = t.replace(/[₹\s]/g, '').replace(/,/g, '');
  if (!/^-?[0-9]+(\.[0-9]{1,2})?$/.test(cleaned)) return null;
  const n = Number(cleaned);
  if (!Number.isFinite(n)) return null;
  return n;
}
