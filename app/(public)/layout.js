import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title:
    "BM Wealth - Mumbai's Distinguished Wealth Architecture | Mutual Funds, SIP, PMS | ARN 90008",
  description:
    "BM Wealth offers expert wealth distribution, mutual funds, SIP, portfolio curation, and insurance services in Mumbai. IRDAI Licensed & AMFI Registered ARN 90008.",
  path: "/",
});

export default function Layout({ children }) {
  return children;
}