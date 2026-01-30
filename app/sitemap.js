import { getMetadataBase } from "@/lib/seo/metadata";
import { staticBlogData, staticBlogPost } from "@/data/staticBlogData";
import storeProducts from "@/data/store-products.json";
import { headers } from "next/headers";
import fs from "fs";
import path from "path";

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
  const lastModified = new Date();

  const blogs = Array.isArray(staticBlogData) && staticBlogData.length > 0 ? staticBlogData : [staticBlogPost];
  const blogRoutes = isStoreHost
    ? []
    : blogs
        .map((b) => (b?.slug ? `/blog/${String(b.slug).replace(/^\/+/, "")}` : null))
        .filter(Boolean);

  const discoverAppRoutes = () => {
    const appDir = path.join(process.cwd(), "app");
    const discovered = new Set();

    const shouldExcludeSegment = (segment) => {
      if (!segment) return true;
      if (segment === "api") return true;
      if (segment === "store") return true; // internal store shell; exposed via store hostname rewrite
      if (segment === "products") return true; // blocked on main host; store has clean /products
      if (segment === "login") return true;
      if (segment === "dashboard") return true;
      if (segment === "client-portal") return true;
      if (segment === "embed") return true;
      if (segment === "cdn-cgi") return true;
      if (segment === "track") return true;
      if (segment === "v0-test") return true;
      if (segment === "sitemap-page") return true;
      if (segment.startsWith("_")) return true;
      if (segment.startsWith("__")) return true;
      if (segment.startsWith("admin-secret")) return true;
      if (segment.startsWith("[")) return true; // dynamic segment
      return false;
    };

    const isGroupSegment = (segment) => segment.startsWith("(") && segment.endsWith(")");

    const walk = (dir) => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.name.startsWith(".")) continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (shouldExcludeSegment(entry.name)) continue;
          walk(full);
        } else if (entry.isFile()) {
          if (!/^page\.(js|jsx|ts|tsx)$/.test(entry.name)) continue;
          const relDir = path.relative(appDir, dir);
          const segments = relDir
            .split(path.sep)
            .filter(Boolean)
            .filter((s) => !isGroupSegment(s))
            .filter((s) => !shouldExcludeSegment(s));

          const route = `/${segments.join("/")}`.replace(/\/+$/, "");
          discovered.add(route === "" ? "/" : route);
        }
      }
    };

    try {
      if (fs.existsSync(appDir)) walk(appDir);
    } catch {
      // ignore discovery errors; sitemap will still include manual + blog routes
    }

    return Array.from(discovered);
  };

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
    return unique.map((p) => ({ url: url(base, p), lastModified }));
  }

  const appRoutes = discoverAppRoutes();

  // Explicit public surface for main site (kept small + stable).
  const routes = [
    "/",
    "/tools",
    "/tools/property-vs-sip",
    "/tools/tax-optimization",
    "/tools/itr-filing-help",
    "/blog",
    "/best-credit-cards-high-income-india",
    "/live-intelligence",
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
    "/terms",
    "/disclaimer",
    "/refund",
    "/compliance",
    "/sitemap",
  ];

  // Exclude known non-indexable or blocked URLs from the sitemap.
  const excludedExact = new Set([
    "/about",
    "/privacy-policy",
    "/terms-and-conditions",
    "/refund-policy",
    "/payment-success",
    "/payment-failed",
    "/live-intel",
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

  const unique = Array.from(new Set([ ...routes, ...appRoutes, ...blogRoutes].map(normalizePathname)))
    .filter((p) => !isExcluded(p));

  return unique.map((p) => ({ url: url(base, p), lastModified }));
}
