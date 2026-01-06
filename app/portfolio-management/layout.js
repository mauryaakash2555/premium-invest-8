import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Portfolio Planning — Educational Guide | BM Wealth",
  description:
    "Educational guide to portfolio planning: asset allocation, diversification, rebalancing, and review cadence. No advice, no guarantees.",
  path: "/portfolio-management",
});

export default function Layout({ children }) {
  return children;
}
