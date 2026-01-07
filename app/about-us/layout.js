import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = {
  ...buildMetadata({
    title: "About BM Wealth Mumbai | Financial Advisor Brahmdeo Maurya ARN 90008",
    description: "Mumbai-based wealth advisor led by Brahmdeo Maurya. PMS Certification 2430447816 | AMFI Registered (ARN 90008) | IRDAI Licensed (277925). Serving 500+ investors with portfolio management (PMS), mutual funds, SIP, and insurance support.",
    path: "/about-us",
  }),
};

export default function Layout({ children }) {
  return children;
}