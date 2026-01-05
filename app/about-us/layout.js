import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = {
  ...buildMetadata({
    title: "About BM Wealth Mumbai | Financial Advisor Brahmdeo Maurya ARN 90008",
    description: "Mumbai-based wealth advisor led by Brahmdeo Maurya. AMFI Registered (ARN 90008) & IRDAI Licensed (277925). Serving 500+ investors with mutual funds, SIP, portfolio management expertise.",
    path: "/about-us",
  }),
};

export default function Layout({ children }) {
  return children;
}