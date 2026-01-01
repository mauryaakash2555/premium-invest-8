import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = {
  ...buildMetadata({
    title: "Curated Partners | BM Wealth Mumbai",
    description: "Partner with BM Wealth for premium financial advisory services. AMFI Registered | IRDAI Licensed financial advisors in Mumbai.",
    path: "/curated-partners",
  }),
  keywords: "financial partners, investment advisory, BM Wealth, Mumbai financial advisors, AMFI, IRDAI",
};

export default function Layout({ children }) {
  return children;
}