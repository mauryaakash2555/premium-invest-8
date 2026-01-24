import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = {
  ...buildMetadata({
    title: "Investment Platforms | BM Wealth",
    description:
      "Explore investment platforms like Zerodha, Groww, Smallcase and more. Compare features and choose what suits your execution style.",
    path: "/platforms",
  }),
  keywords: "investment platforms, trading platforms, Zerodha, Smallcase, Groww, Mumbai investment",
};

export default function Layout({ children }) {
  return children;
}