import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = {
  ...buildMetadata({
    title: "Curated Partners | BM Wealth Mumbai",
    description: "Educational directory of curated partners and tools. No investment advice or guarantees.",
    path: "/curated-partners",
  }),
  keywords: "curated partners, investing tools, BM Wealth, Mumbai, AMFI, IRDAI",
};

export default function Layout({ children }) {
  return children;
}