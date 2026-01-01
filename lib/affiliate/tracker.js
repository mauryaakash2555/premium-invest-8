/**
 * Affiliate Link Tracker
 * Wraps affiliate URLs with tracking.
 */

export function createTrackedLink(platform, leadId) {
  const slug = String(platform || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-]/g, "")
    .slice(0, 80);

  if (!slug) return "/";

  return `/track/${slug}${leadId ? `?lead=${encodeURIComponent(String(leadId))}` : ""}`;
}

/**
 * Optional client-side log.
 * Note: actual click attribution is handled by `/track/[platform]`.
 */
export async function logClick(platform, leadId) {
  try {
    await fetch("/api/affiliate/click", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // keepalive helps when the browser navigates immediately after the click
      body: JSON.stringify({ platform, leadId }),
      keepalive: true,
    });
  } catch {
    // ignore
  }
}
