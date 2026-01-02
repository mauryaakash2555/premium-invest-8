'use client';

const KEY = 'bm_admin_token_v1';

export function getAdminToken() {
  try {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function setAdminToken(token) {
  try {
    if (typeof window === 'undefined') return;
    const t = String(token || '').trim();
    if (!t) return;
    window.localStorage.setItem(KEY, t);
  } catch {
    // ignore
  }
}

export function clearAdminToken() {
  try {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

export async function fetchAdminJSON(url, opts = {}) {
  const token = getAdminToken();
  const headers = new Headers(opts.headers || {});
  if (token) headers.set('x-bm-admin-token', token);

  const r = await fetch(url, {
    ...opts,
    headers,
    credentials: 'include',
    cache: opts.cache ?? 'no-store',
  });

  const j = await r.json().catch(() => null);
  return { r, j };
}
