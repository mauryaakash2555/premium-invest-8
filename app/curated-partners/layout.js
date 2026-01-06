import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = {
  ...buildMetadata({
    title: "Curated Partners | BM Wealth Mumbai",
    description: "Curated partners and tools, selected for quality and transparency.",
    path: "/curated-partners",
  }),
  keywords: "curated partners, investing tools, BM Wealth, Mumbai, AMFI, IRDAI",
};

export default function Layout({ children }) {
  return children;
}