import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = {
  ...buildMetadata({
    title: "Services — Educational Guides | Mutual Funds, SIP, Insurance, Trading | BM Wealth",
    description: "Educational guides on mutual funds, SIPs, insurance, trading, and portfolio basics. No investment advice or guarantees.",
    path: "/services",
  }),
};

export default function Layout({ children }) {
  return children;
}