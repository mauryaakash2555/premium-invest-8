/**
 * FILE: lib/utils/rateLimiter.js
 * PURPOSE: Simple in-memory rate limiter helper (best-effort for serverless).
 * CATEGORY: lib
 *
 * SIMPLE EXPLANATION:
 * This keeps a small counter in memory for a short time window.
 * It helps stop spam by limiting how fast someone can send messages.
 */

// 🔵 RATE LIMIT BUCKETS (best-effort)
// ⚠️ In serverless, memory can reset between requests.
const RATE_BUCKETS =
  globalThis.__bmwealth_rate_buckets || (globalThis.__bmwealth_rate_buckets = new Map());

export function consumeRate(key, { max, windowMs } = {}) {
  const now = Date.now();
  const existing = RATE_BUCKETS.get(key);

  if (!existing || now >= existing.resetAt) {
    RATE_BUCKETS.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterMs: 0 };
  }

  if (existing.count >= max) {
    return { allowed: false, retryAfterMs: Math.max(0, existing.resetAt - now) };
  }

  existing.count += 1;
  return { allowed: true, retryAfterMs: 0 };
}

export function makeRateKey({ isAdmin, leadId, ip }) {
  if (leadId) return `${isAdmin ? 'admin:' : ''}lead:${leadId}`;
  if (ip) return `${isAdmin ? 'admin:' : ''}ip:${ip}`;
  return `${isAdmin ? 'admin:' : ''}anon`;
}
