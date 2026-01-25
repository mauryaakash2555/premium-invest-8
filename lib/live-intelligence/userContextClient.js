/**
 * Client-only: builds a minimal, non-PII user context payload for explain API.
 *
 * Sources:
 * - li_user_profile (behavioral preferences)
 * - li_saved_headlines (saved items)
 * - li_portfolio_context_v1 (optional, if another surface populates it)
 */

function safeJsonParse(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function uniqStrings(list) {
  const out = [];
  const seen = new Set();
  for (const v of list || []) {
    const s = String(v || '').trim();
    if (!s) continue;
    const key = s.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(s);
  }
  return out;
}

function sanitizePortfolio(raw) {
  if (!raw || typeof raw !== 'object') return null;

  const tickers = uniqStrings(raw.tickers || raw.symbols || []).slice(0, 12);
  const sectors = uniqStrings(raw.sectors || []).slice(0, 12);
  const style = String(raw.style || raw.investorStyle || '').trim() || null;

  if (!tickers.length && !sectors.length && !style) return null;
  return { tickers, sectors, style };
}

function topCategoriesFromProfile(profile, limit = 4) {
  const preferred = profile?.preferred_categories || {};
  const sorted = Object.entries(preferred)
    .filter(([, v]) => typeof v === 'number' && Number.isFinite(v))
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([k]) => k);
  return sorted;
}

function savedCategoriesFromStorage(limit = 6) {
  const saved = safeJsonParse(localStorage.getItem('li_saved_headlines') || '[]', []);
  const cats = saved.map((h) => h?.category).filter(Boolean);
  return uniqStrings(cats).slice(0, limit);
}

export function getExplainUserContext() {
  if (typeof window === 'undefined') return null;

  const profile = safeJsonParse(localStorage.getItem('li_user_profile') || '{}', {});
  const portfolio = sanitizePortfolio(safeJsonParse(localStorage.getItem('li_portfolio_context_v1') || 'null', null));

  const interests = Array.isArray(profile?.interests) ? uniqStrings(profile.interests).slice(0, 8) : [];
  const topCategories = topCategoriesFromProfile(profile, 4);
  const savedCategories = savedCategoriesFromStorage(6);

  return {
    feedMode: String(profile?.feed_mode || '').trim() || null,
    topCategories,
    savedCategories,
    interests,
    portfolio,
  };
}
