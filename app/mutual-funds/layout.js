import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Mutual Funds Mumbai | AMFI Registered Distributor ARN 90008 | BM Wealth",
  description:
    "Mutual fund distribution and investor guidance in Mumbai. AMFI Registered (ARN 90008). Equity, debt, and hybrid funds. SIP planning and portfolio review.",
  path: "/mutual-funds",
});

export default function Layout({ children }) {
  return children;
}
