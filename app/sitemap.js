import { getMetadataBase } from "@/lib/seo/metadata";
import { staticBlogData, staticBlogPost } from "@/data/staticBlogData";
import fs from "fs";
import path from "path";

function url(base, path) {
  const cleanBase = String(base || "").replace(/\/$/, "");
  const cleanPath = path === "/" ? "" : String(path || "").replace(/^\//, "");
  return cleanPath ? `${cleanBase}/${cleanPath}` : `${cleanBase}/`;
}

export default function sitemap() {
  const base = getMetadataBase().toString();
  const lastModified = new Date();

  const blogs = Array.isArray(staticBlogData) && staticBlogData.length > 0 ? staticBlogData : [staticBlogPost];
  const blogRoutes = blogs
    .map((b) => (b?.slug ? `/blog/${String(b.slug).replace(/^\/+/, "")}` : null))
    .filter(Boolean);

  const discoverAppRoutes = () => {
    const appDir = path.join(process.cwd(), "app");
    const discovered = new Set();

    const shouldExcludeSegment = (segment) => {
      if (!segment) return true;
      if (segment === "api") return true;
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

  const appRoutes = discoverAppRoutes();

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

  const unique = Array.from(new Set([...routes, ...appRoutes, ...blogRoutes]));

  return unique.map((path) => ({
    url: url(base, path),
    lastModified,
  }));
}
