import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title:
    "BM Wealth — Educational Guides | Mutual Funds, SIP, Insurance",
  description:
    "Educational guides and tools on mutual funds, SIPs, insurance, and portfolio basics. Not SEBI-registered investment advice; no guarantees.",
  path: "/",
});

export default function Layout({ children }) {
  return children;
}