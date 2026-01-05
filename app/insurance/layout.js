import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Insurance Advisory Mumbai | Life & Health Insurance | IRDAI 277925",
  description:
    "Comprehensive insurance advisory in Mumbai. Term life insurance, health insurance, and family protection plans. IRDAI Licensed (277925).",
  path: "/insurance",
});

export default function Layout({ children }) {
  return children;
}
