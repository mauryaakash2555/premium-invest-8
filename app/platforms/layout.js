import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = {
  ...buildMetadata({
    title: "Recommended Investment Platforms | BM Wealth Mumbai",
    description: "Discover top investment platforms recommended by BM Wealth. Compare Zerodha, Smallcase, and Groww for your trading and investment needs.",
    path: "/platforms",
  }),
  keywords: "investment platforms, trading platforms, Zerodha, Smallcase, Groww, Mumbai investment",
};

export default function Layout({ children }) {
  return children;
}