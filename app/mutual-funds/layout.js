import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Mutual Funds | BM Wealth",
  description:
    "Mutual fund support with clear comparisons, portfolio fit, and disciplined review—delivered with premium documentation and transparency.",
  path: "/mutual-funds",
});

export default function Layout({ children }) {
  return children;
}
