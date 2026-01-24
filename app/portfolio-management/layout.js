import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Portfolio Management Services (PMS) in India | BM Wealth",
  description:
    "Portfolio Management (PMS support) in Mumbai: allocation frameworks, disciplined rebalancing, and periodic review with clear documentation.",
  path: "/portfolio-management",
});

export default function Layout({ children }) {
  return children;
}
