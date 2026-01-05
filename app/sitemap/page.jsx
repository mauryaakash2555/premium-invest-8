import SitemapPage from "../sitemap-page/page";

import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "BM Wealth Sitemap | BM Wealth",
  description: "Complete website navigation for BM Wealth.",
  path: "/sitemap",
});

export default function Sitemap() {
  return <SitemapPage />;
}
