/**
 * Time helpers (UI)
 *
 * Keep these small and dependency-free.
 */

export function formatTimeAgo(input, nowMs = Date.now()) {
  if (!input) return '—';

  const date = input instanceof Date ? input : new Date(input);
  const t = date.getTime();
  if (!Number.isFinite(t)) return '—';

  const diffMs = Math.max(0, nowMs - t);
  const diffS = Math.floor(diffMs / 1000);

  if (diffS < 10) return 'just now';
  if (diffS < 60) return `${diffS}s ago`;

  const diffM = Math.floor(diffS / 60);
  if (diffM < 60) return `${diffM}m ago`;

  const diffH = Math.floor(diffM / 60);
  if (diffH < 48) return `${diffH}h ago`;

  const diffD = Math.floor(diffH / 24);
  return `${diffD}d ago`;
}
