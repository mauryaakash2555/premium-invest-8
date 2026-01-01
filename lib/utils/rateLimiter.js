/**
 * FILE: lib/utils/rateLimiter.js
 * PURPOSE: Rate limiter with optional IP/lead/admin keys (best-effort for serverless).
 * CATEGORY: lib
 */

// Best-effort in-memory bucket
const RATE_BUCKETS =
  globalThis.__bmwealth_rate_buckets || (globalThis.__bmwealth_rate_buckets = new Map());

export function consumeRate(key, { max = 10, windowMs = 60_000 } = {}) {
  const now = Date.now();
  const existing = RATE_BUCKETS.get(key);

  if (!existing || now >= existing.resetAt) {
    const next = { count: 1, resetAt: now + windowMs };
    RATE_BUCKETS.set(key, next);
    return {
      allowed: true,
      remainingRequests: Math.max(0, max - next.count),
      resetIn: Math.ceil((next.resetAt - now) / 1000),
      retryAfterMs: 0,
    };
  }

  existing.count += 1;
  RATE_BUCKETS.set(key, existing);

  const allowed = existing.count <= max;
  const retryAfterMs = allowed ? 0 : Math.max(0, existing.resetAt - now);

  return {
    allowed,
    remainingRequests: Math.max(0, max - existing.count),
    resetIn: Math.ceil((existing.resetAt - now) / 1000),
    retryAfterMs,
  };
}

export function makeRateKey({ isAdmin, leadId, ip }) {
  if (leadId) return `${isAdmin ? "admin:" : ""}lead:${leadId}`;
  if (ip) return `${isAdmin ? "admin:" : ""}ip:${ip}`;
  return `${isAdmin ? "admin:" : ""}anon`;
}

// Cleanup old entries every 10 minutes
if (process.env.NODE_ENV !== "test" && !globalThis.__bmwealth_rate_cleanup) {
  globalThis.__bmwealth_rate_cleanup = setInterval(() => {
    const now = Date.now();
    for (const [k, v] of RATE_BUCKETS.entries()) {
      if (!v?.resetAt || now > v.resetAt + 600_000) RATE_BUCKETS.delete(k);
    }
  }, 600_000);
}

