import { buildMetadata } from "@/lib/seo/metadata";
import { redirect } from "next/navigation";

export const metadata = buildMetadata({
  title: "Investment Insights Mumbai | Financial Planning Blog | BM Wealth",
  description:
    "Expert insights on mutual funds, SIP investing, tax planning, portfolio management in Mumbai. Real case studies, market analysis, and wealth creation strategies from AMFI registered distributors.",
  path: "/blog",
});

export default function BlogPage() {
  redirect("/blog/editorial");
}