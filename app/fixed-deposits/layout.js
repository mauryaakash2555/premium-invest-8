import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Fixed Deposits Guidance | BM Wealth Mumbai",
  description:
    "Fixed deposit guidance in Mumbai: comparing bank vs corporate FDs, laddering, liquidity, and risk basics.",
  path: "/fixed-deposits",
});

export default function Layout({ children }) {
  return children;
}
