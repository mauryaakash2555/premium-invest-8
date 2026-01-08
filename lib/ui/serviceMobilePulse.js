export function setupServiceMobilePulse({
  selector = ".svc-card, .svc-cta",
  pulseClass = "svc-mobile-pulse",
  threshold = 0.55,
  rootMargin = "0px 0px -10% 0px",
  removeAfterMs = 1800,
} = {}) {
  if (typeof window === "undefined") return () => {};

  const isMobileLike =
    window.matchMedia?.("(hover: none)")?.matches ||
    window.matchMedia?.("(pointer: coarse)")?.matches;

  if (!isMobileLike) return () => {};

  const nodes = Array.from(document.querySelectorAll(selector));
  if (!nodes.length) return () => {};

  const seen = new WeakSet();

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const el = entry.target;
        if (seen.has(el)) continue;
        seen.add(el);

        el.classList.add(pulseClass);
        window.setTimeout(() => {
          el.classList.remove(pulseClass);
        }, removeAfterMs);
      }
    },
    { threshold, rootMargin }
  );

  for (const n of nodes) io.observe(n);

  return () => io.disconnect();
}
