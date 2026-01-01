import BlogDetailClient from "./BlogDetailClient";
import { buildMetadata, DEFAULT_OG_IMAGE } from "@/lib/seo/metadata";
import { staticBlogData, staticBlogPost } from "@/data/staticBlogData";

export function generateStaticParams() {
  const all = Array.isArray(staticBlogData) && staticBlogData.length > 0 ? staticBlogData : [staticBlogPost];
  return all
    .map((p) => p?.slug)
    .filter(Boolean)
    .slice(0, 10)
    .map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const resolved = await params;
  const slug = resolved?.slug;
  const all = Array.isArray(staticBlogData) && staticBlogData.length > 0 ? staticBlogData : [staticBlogPost];
  const post = all.find((p) => p?.slug === slug) || null;

  const title = post?.title ? `${post.title} | BM Wealth` : "BM Wealth Blog";
  const description =
    post?.metaDescription || post?.excerpt || post?.summary || "Elite insights, market analysis, and updates from BM Wealth Talks.";

  const image = post?.imageUrl || post?.image_url || post?.image || DEFAULT_OG_IMAGE;

  return buildMetadata({
    title,
    description,
    path: `/blog/${slug}`,
    type: "article",
    image,
  });
}

export default async function BlogDetailPage({ params }) {
  const resolved = await params;
  return <BlogDetailClient slug={resolved?.slug} />;
}