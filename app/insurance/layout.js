import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Insurance | BM Wealth",
  description:
    "Insurance planning support with clear comparisons, documentation, and claims-ready guidance through IRDAI-licensed distribution.",
  path: "/insurance",
});

export default function Layout({ children }) {
  return children;
}
