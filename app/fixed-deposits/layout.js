import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Fixed Deposits (FD) — Educational Guide | BM Wealth",
  description:
    "Educational overview of fixed deposits: where they fit, laddering, liquidity, taxation basics, and common risks. No advice, no guarantees.",
  path: "/fixed-deposits",
});

export default function Layout({ children }) {
  return children;
}
