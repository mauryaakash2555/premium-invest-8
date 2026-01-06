import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Fixed Deposits (FD) | BM Wealth",
  description:
    "Fixed deposit comparisons across tenure, payout, and liquidity—supported with a premium, process-led approach and clear documentation.",
  path: "/fixed-deposits",
});

export default function Layout({ children }) {
  return children;
}
