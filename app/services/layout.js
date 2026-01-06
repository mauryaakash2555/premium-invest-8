import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = {
  ...buildMetadata({
    title: "Services | Mutual Funds, SIP, Insurance, Trading | BM Wealth",
    description: "Premium wealth services across mutual funds, SIP, insurance, trading & demat, and portfolio planning.",
    path: "/services",
  }),
};

export default function Layout({ children }) {
  return children;
}