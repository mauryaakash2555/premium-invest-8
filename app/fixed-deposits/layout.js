import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Fixed Deposit Investment Options | BM Wealth",
  description:
    "Compare fixed deposits (FDs) in Mumbai across tenure, payout options, rates, and liquidity—process-led support with clear documentation.",
  path: "/fixed-deposits",
});

export default function Layout({ children }) {
  return children;
}
