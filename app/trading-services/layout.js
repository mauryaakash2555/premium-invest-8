import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Trading & Demat | BM Wealth",
  description:
    "Trading and demat support with disciplined process, clear documentation, and risk management basics.",
  path: "/trading-services",
});

export default function Layout({ children }) {
  return children;
}
