import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Sitemap | BM Wealth Mumbai",
  description: "Complete sitemap of BM Wealth website.",
  path: "/sitemap-page",
});

export const robots = {
  index: false,
  follow: false,
};

export default function Layout({ children }) {
  return children;
}
