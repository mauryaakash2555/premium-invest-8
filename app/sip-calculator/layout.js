import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "SIP Calculator | BM Wealth",
  description:
    "Estimate SIP outcomes over time with BM Wealth’s SIP calculator. Adjust monthly amount, duration, and expected return to explore scenarios.",
  path: "/sip-calculator",
});

export default function Layout({ children }) {
  return children;
}
