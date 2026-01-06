import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title:
    "BM Wealth | Mutual Funds, SIP, Insurance, Trading",
  description:
    "Premium wealth services and tools across mutual funds, SIP, insurance, trading & demat, and portfolio planning.",
  path: "/",
});

export default function Layout({ children }) {
  return children;
}