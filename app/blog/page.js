import BlogIndexClient from "./BlogIndexClient";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Investment Insights Mumbai | Financial Planning Blog | BM Wealth",
  description:
    "Expert insights on mutual funds, SIP investing, tax planning, portfolio management in Mumbai. Real case studies, market analysis, wealth creation strategies from AMFI registered advisors.",
  path: "/blog",
});

export default function BlogPage() {
  return <BlogIndexClient />;
}