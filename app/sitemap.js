import { getMetadataBase } from "@/lib/seo/metadata";

function url(base, path) {
  const cleanBase = String(base || "").replace(/\/$/, "");
  const cleanPath = path === "/" ? "" : String(path || "").replace(/^\//, "");
  return cleanPath ? `${cleanBase}/${cleanPath}` : `${cleanBase}/`;
}

export default function sitemap() {
  const base = getMetadataBase().toString();
  const lastModified = new Date();

  const routes = [
    "/",
    "/tools",
    "/tools/property-vs-sip",
    "/tools/tax-optimization",
    "/tools/itr-filing-help",
    "/blog",
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

  return routes.map((path) => ({
    url: url(base, path),
    lastModified,
  }));
}
