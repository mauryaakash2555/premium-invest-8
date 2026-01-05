import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = {
  ...buildMetadata({
    title: "Financial Services Mumbai | Mutual Funds, SIP, PMS | BM Wealth ARN 90008",
    description: "Comprehensive wealth management in Mumbai. Mutual funds, SIP, portfolio management, insurance, trading services. AMFI & IRDAI licensed. Personalized financial planning for Mumbai investors.",
    path: "/services",
  }),
};

export default function Layout({ children }) {
  return children;
}