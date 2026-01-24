import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Mutual Fund Investment Services | SIP Plans | BM Wealth",
  description:
    "Mutual fund selection and SIP setup in Mumbai with clear comparisons, portfolio fit checks, and disciplined review—documentation-first and transparent.",
  path: "/mutual-funds",
});

export default function Layout({ children }) {
  return children;
}
