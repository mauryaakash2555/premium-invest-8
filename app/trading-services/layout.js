import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Trading & Demat — Educational Guide | BM Wealth",
  description:
    "Educational overview of trading basics, demat accounts, and risk management concepts. No tips, no guarantees.",
  path: "/trading-services",
});

export default function Layout({ children }) {
  return children;
}
