import crypto from 'node:crypto';

const COOKIE_NAME = 'itr_sid';

export function getSessionIdFromRequest(request) {
  try {
    const cookie = request?.headers?.get?.('cookie') || '';
    const parts = String(cookie).split(';').map((p) => p.trim());
    for (const p of parts) {
      if (p.startsWith(COOKIE_NAME + '=')) {
        const v = p.slice(COOKIE_NAME.length + 1).trim();
        return v || null;
      }
    }
    return null;
  } catch {
    return null;
  }
}

export function ensureSessionId(request) {
  const existing = getSessionIdFromRequest(request);
  if (existing) return { sessionId: existing, setCookie: null };

  const sessionId = crypto.randomBytes(16).toString('hex');
  // 30 days
  const maxAge = 60 * 60 * 24 * 30;
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  const setCookie = `${COOKIE_NAME}=${sessionId}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
  return { sessionId, setCookie };
}
