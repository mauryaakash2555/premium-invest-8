import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = {
  ...buildMetadata({
    title: "About BM Wealth | Trusted Wealth Partner in Mumbai",
    description:
      "Meet BM Wealth, led by Brahmdeo Maurya (ARN 90008). Premium financial advisory for high-income families in Mumbai with AMFI/IRDAI compliance.",
    path: "/about-us",
  }),
};

export default function Layout({ children }) {
  return children;
}