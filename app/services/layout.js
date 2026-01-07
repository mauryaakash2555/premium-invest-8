import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = {
  ...buildMetadata({
    title: "Services | Portfolio Management (PMS), Mutual Funds, SIP | BM Wealth",
    description: "Premium portfolio management (PMS-first) and wealth services across mutual funds, SIP, insurance, trading & demat, and portfolio planning.",
    path: "/services",
  }),
};

export default function Layout({ children }) {
  return children;
}