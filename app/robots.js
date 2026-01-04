import { getMetadataBase } from "@/lib/seo/metadata";

export default function robots() {
  const base = getMetadataBase().toString().replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
