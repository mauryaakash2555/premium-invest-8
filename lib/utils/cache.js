/**
 * Simple in-memory cache (best-effort)
 */

const CACHE = globalThis.__bmwealth_cache || (globalThis.__bmwealth_cache = new Map());

export async function getCached(key, fetchFn, ttlSeconds = 300) {
  const now = Date.now();
  const existing = CACHE.get(key);
  if (existing && now < existing.expiresAt) return existing.data;

  const data = await fetchFn();
  CACHE.set(key, { data, expiresAt: now + ttlSeconds * 1000 });
  return data;
}
