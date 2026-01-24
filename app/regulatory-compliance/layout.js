import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Regulatory Compliance | BM Wealth",
  description:
    "BM Wealth regulatory compliance, disclosures, and investor-first operating principles.",
  path: "/regulatory-compliance",
});

export default function Layout({ children }) {
  return children;
}
