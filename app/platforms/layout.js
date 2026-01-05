import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = {
  ...buildMetadata({
    title: "Investment Platforms | BM Wealth Mumbai",
    description: "Explore popular investment platforms we cover. Compare Zerodha, Smallcase, and Groww for trading and investing.",
    path: "/platforms",
  }),
  keywords: "investment platforms, trading platforms, Zerodha, Smallcase, Groww, Mumbai investment",
};

export default function Layout({ children }) {
  return children;
}