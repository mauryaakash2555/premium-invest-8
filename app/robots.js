import { headers } from "next/headers";
import { getMetadataBase } from "@/lib/seo/metadata";

function getNormalizedHost(hdrs) {
  const rawHost = hdrs.get("x-forwarded-host") || hdrs.get("host") || "";
  const host = String(rawHost).split(",")[0].trim().toLowerCase();
  const hostNoPort = host.split(":")[0];
  return hostNoPort.startsWith("www.") ? hostNoPort.slice(4) : hostNoPort;
}

export default async function robots() {
  const hdrs = await headers();
  const normalizedHost = getNormalizedHost(hdrs);
  const isStoreHost = normalizedHost === "store.bmwealth.co.in";

  const base = (isStoreHost ? "https://store.bmwealth.co.in" : getMetadataBase().toString()).replace(/\/$/, "");

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/cdn-cgi/",
          "/_next/",
          "/api/",
          "/admin-secret-akash",
          "/admin-secret-xyz",
          // Legacy store prefix (should never be indexed on main host)
          "/_store",
          "/_store/",
          // Internal store shell is only meant for store subdomain via host rewrite.
          "/store",
          "/store/",
          // Utility/private routes (must not be indexed)
          "/login",
          "/dashboard",
          "/dashboard/",
          "/client-portal",
          "/client-portal/",
          "/embed",
          "/embed/",
          "/payment-success",
          "/payment-failed",
          "/v0-test",
          // Block legacy query variants from being crawled/indexed
          "/?live=",
          "/*?live=",
        ],
      },
    ],
    sitemap: `${base}/sitemap.xml`,
  };
}
