import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Stock Trading Services Mumbai | Demat Account Guidance | BM Wealth",
  description:
    "Stock trading and demat account services in Mumbai. Platform guidance for Zerodha, Groww, and Smallcase. Equity, derivatives, and commodities support.",
  path: "/trading-services",
});

export default function Layout({ children }) {
  return children;
}
