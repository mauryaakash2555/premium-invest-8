import BlogIndexClient from "./BlogIndexClient";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "BM Wealth Blog | Financial Insights & Market Analysis",
  description:
    "Elite insights, market analysis, and updates from BM Wealth Talks.",
  path: "/blog",
});

export default function BlogPage() {
  return <BlogIndexClient />;
}