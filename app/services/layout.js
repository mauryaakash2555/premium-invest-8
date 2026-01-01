import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = {
  ...buildMetadata({
    title: "Financial Services | BM Wealth Mumbai ARN 90008",
    description: "Comprehensive financial services including mutual funds, SIP, portfolio management, and insurance.",
    path: "/services",
  }),
};

export default function Layout({ children }) {
  return children;
}