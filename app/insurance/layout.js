import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Insurance Advisor in Mumbai (IRDAI) | BM Wealth",
  description:
    "Insurance planning in Mumbai with clear comparisons, documentation, and claims-ready guidance through IRDAI-licensed distribution support.",
  path: "/insurance",
});

export default function Layout({ children }) {
  return children;
}
