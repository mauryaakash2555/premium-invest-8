import BlogIndexClient from "./BlogIndexClient";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Investment Insights Mumbai | Financial Planning Blog | BM Wealth",
  description:
    "BM Wealth insights on SIPs, mutual funds, taxes, and disciplined investing — with practical tools and clear explainers for Indian investors.",
  path: "/blog",
});

export default function BlogPage() {
  return <BlogIndexClient />;
}