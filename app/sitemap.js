import { getMetadataBase } from "@/lib/seo/metadata";
import { staticBlogData, staticBlogPost } from "@/data/staticBlogData";
import storeProducts from "@/data/store-products.json";
import { headers } from "next/headers";

function url(base, path) {
  const cleanBase = String(base || "").replace(/\/$/, "");
  const cleanPath = path === "/" ? "" : String(path || "").replace(/^\//, "");
  return cleanPath ? `${cleanBase}/${cleanPath}` : `${cleanBase}/`;
}

function getNormalizedHost(hdrs) {
  const rawHost = hdrs.get("x-forwarded-host") || hdrs.get("host") || "";
  const host = String(rawHost).split(",")[0].trim().toLowerCase();
  const hostNoPort = host.split(":")[0];
  return hostNoPort.startsWith("www.") ? hostNoPort.slice(4) : hostNoPort;
}

function normalizePathname(p) {
  const s = String(p || "").trim();
  if (!s) return "/";
  if (!s.startsWith("/")) return `/${s}`;
  return s;
}

export default async function sitemap() {
  const hdrs = await headers();
  const normalizedHost = getNormalizedHost(hdrs);
  const isStoreHost = normalizedHost === "store.bmwealth.co.in";

  const base = (isStoreHost ? "https://store.bmwealth.co.in" : getMetadataBase().toString()).replace(/\/$/, "");

  // Use realistic per-page dates instead of always-now (wastes crawl budget).
  const LAST_STATIC_UPDATE = new Date("2026-02-18");

  const blogs = Array.isArray(staticBlogData) && staticBlogData.length > 0 ? staticBlogData : [staticBlogPost];

  // Build a lookup of blog slug → published date for accurate lastModified.
  const blogDateMap = new Map();
  for (const b of blogs) {
    if (!b?.slug) continue;
    const d = b.published_date || b.date_published || b.datePublished || b.date;
    if (d) {
      try { blogDateMap.set(b.slug, new Date(d)); } catch { /* skip */ }
    }
  }

  const blogRoutes = isStoreHost
    ? []
    : blogs
        .map((b) => (b?.slug ? `/blog/${String(b.slug).replace(/^\/+/, "")}` : null))
        .filter(Boolean);

  if (isStoreHost) {
    const productRoutes = Array.isArray(storeProducts)
      ? storeProducts
          .map((p) => (p?.slug ? `/products/${String(p.slug).replace(/^\/+/, "")}` : null))
          .filter(Boolean)
      : [];

    const storeRoutes = [
      "/",
      "/products",
      "/about",
      "/contact",
      "/delivery",
      "/privacy",
      "/terms",
      "/refund",
      ...productRoutes,
    ];

    const unique = Array.from(new Set(storeRoutes.map(normalizePathname)));
    return unique.map((p) => ({ url: url(base, p), lastModified: LAST_STATIC_UPDATE }));
  }

  // Strict allowlist for main site (kept small + stable).
  const routes = [
    "/",
    "/tools",
    "/tools/property-vs-sip",
    "/tools/retirement-gap",
    "/tools/lumpsum-planner",
    "/tools/insurance-value",
    "/tools/tax-optimization",
    "/tools/itr-filing-help",
    // /blog is the canonical blog index (must not be a redirect-only URL)
    "/blog",
    "/execution-partners",
    "/legal-disclosures",
    "/contact",
    "/about-us",
    "/services",
    "/platforms",
    "/mutual-funds",
    "/portfolio-management",
    "/insurance",
    "/fixed-deposits",
    "/trading-services",
    "/sip",
    "/privacy",
    "/terms-and-conditions",
    "/disclaimer",
    "/refund",
    "/compliance",
  ];

  // Exclude known non-indexable or blocked URLs from the sitemap.
  const excludedExact = new Set([
    "/about",
    "/delivery",
    "/privacy-policy",
    "/terms",
    "/refund-policy",
    "/payment-success",
    "/payment-failed",
    "/live-intelligence",
    "/live-intel",
    "/submit",
    "/sitemap",
    "/tools/blog-image",
    "/tools/calc-share",
    "/universe",
    "/universe/learn",
    "/blog/dev",
    "/blog/impact",
    "/blog/guest",
    // Legacy redirect-only URL (canonical is the blog post under /blog/)
    "/best-credit-cards-high-income-india",
  ]);

  const excludedPrefix = [
    "/store",
    "/_store",
    "/products",
    "/checkout",
    "/admin-secret",
    "/api",
    "/cdn-cgi",
    "/login",
    "/client-portal",
    "/dashboard",
    "/embed",
  ];

  const isExcluded = (p) => {
    const pathname = normalizePathname(p);
    if (excludedExact.has(pathname)) return true;
    return excludedPrefix.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  };

  const unique = Array.from(new Set([ ...routes, ...blogRoutes].map(normalizePathname)))
    .filter((p) => !isExcluded(p));

  // Frequently updated pages get today's date; static pages get LAST_STATIC_UPDATE; blogs get their published date.
  const frequentlyUpdated = new Set(["/", "/blog"]);

  return unique.map((p) => {
    let lastMod = LAST_STATIC_UPDATE;

    if (frequentlyUpdated.has(p)) {
      lastMod = new Date(); // genuinely changes often
    } else if (p.startsWith("/blog/")) {
      const slug = p.replace("/blog/", "");
      lastMod = blogDateMap.get(slug) || LAST_STATIC_UPDATE;
    }

    return {
      url: url(base, p),
      lastModified: lastMod,
      changeFrequency: frequentlyUpdated.has(p) ? "daily" : p.startsWith("/blog/") ? "monthly" : "weekly",
      priority: p === "/" ? 1.0 : frequentlyUpdated.has(p) ? 0.9 : p.startsWith("/blog/") ? 0.7 : 0.8,
    };
  });
}
