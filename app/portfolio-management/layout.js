import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Portfolio Planning & Allocation Guidance Mumbai | BM Wealth",
  description:
    "Portfolio planning and asset allocation guidance in Mumbai for long-term wealth building and risk management.",
  path: "/portfolio-management",
});

export default function Layout({ children }) {
  return children;
}
