import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Portfolio Planning | BM Wealth",
  description:
    "Portfolio planning and periodic review with a premium, process-led approach: allocation, rebalancing, and documentation.",
  path: "/portfolio-management",
});

export default function Layout({ children }) {
  return children;
}
