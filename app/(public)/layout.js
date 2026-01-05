import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title:
    "Financial Advisor Mumbai | Mutual Funds, SIP, Portfolio Management | BM Wealth ARN 90008",
  description:
    "Mumbai's trusted financial advisor. AMFI Registered (ARN 90008) & IRDAI Licensed. Expert mutual funds, SIP planning, portfolio management, insurance advisory. Serving 500+ Mumbai investors since inception.",
  path: "/",
});

export default function Layout({ children }) {
  return children;
}