type UTMOptions = {
  source?: string;
  medium: string;
  campaign?: string;
  content?: string;
};

function isBmwealthHostname(hostname: string): boolean {
  const h = String(hostname || "").toLowerCase();
  return h === "bmwealth.co.in" || h.endsWith(".bmwealth.co.in");
}

export function getBestShareOrigin(): string {
  if (typeof window === "undefined") return "https://bmwealth.co.in";

  try {
    const { hostname, origin } = window.location;

    // If we are on the production host(s), always share the canonical non-www origin.
    if (isBmwealthHostname(hostname)) return "https://bmwealth.co.in";

    // Otherwise (localhost/staging previews), keep current origin so links work.
    return origin;
  } catch {
    return "https://bmwealth.co.in";
  }
}

export function addUtmParams(inputUrl: string, options: UTMOptions): string {
  const { source = "share", medium, campaign = "sip_vs_panic", content } = options;

  try {
    const base = typeof window !== "undefined" ? window.location.origin : "https://bmwealth.co.in";
    const url = new URL(inputUrl, base);

    url.searchParams.set("utm_source", source);
    url.searchParams.set("utm_medium", medium);
    url.searchParams.set("utm_campaign", campaign);
    if (content) url.searchParams.set("utm_content", content);

    return url.toString();
  } catch {
    return inputUrl;
  }
}

export function buildShareUrlWithUtm(params: URLSearchParams, options: UTMOptions): string {
  const origin = getBestShareOrigin();
  const url = new URL("/intelligence/sip-vs-panic", origin);

  for (const [k, v] of params.entries()) url.searchParams.set(k, v);

  url.searchParams.set("utm_source", options.source ?? "share");
  url.searchParams.set("utm_medium", options.medium);
  url.searchParams.set("utm_campaign", options.campaign ?? "sip_vs_panic");
  if (options.content) url.searchParams.set("utm_content", options.content);

  return url.toString();
}
