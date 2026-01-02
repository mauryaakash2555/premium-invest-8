'use client';

const KEY = 'bm_family_token_v1';

export function getFamilyToken() {
  try {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setFamilyToken(token) {
  try {
    if (typeof window === 'undefined') return;
    const t = String(token || '').trim();
    if (!t) return;
    window.localStorage.setItem(KEY, t);
  } catch {
    // ignore
  }
}

export function clearFamilyToken() {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

export async function fetchFamilyJSON(url, opts = {}) {
  const token = getFamilyToken();
  const headers = new Headers(opts.headers || {});
  if (token) headers.set('x-bm-family-token', token);

  const r = await fetch(url, {
    ...opts,
    headers,
    credentials: 'include',
    cache: opts.cache ?? 'no-store',
  });

  const j = await r.json().catch(() => null);
  return { r, j };
}
