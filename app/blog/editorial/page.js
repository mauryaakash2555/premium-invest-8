import BlogIndexClient from "../BlogIndexClient";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "BM Editorial | Investment Insights Mumbai | BM Wealth",
  description:
    "Premium wealth insights, market analysis, and wealth creation strategies from BM Wealth.",
  path: "/blog/editorial",
});

export default function BlogEditorialPage() {
  return <BlogIndexClient />;
}
