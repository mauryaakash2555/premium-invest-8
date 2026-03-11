import { Suspense } from "react";
import BlogDetailClient from "./BlogDetailClient";
import { buildMetadata, DEFAULT_OG_IMAGE, SITE_NAME } from "@/lib/seo/metadata";
import { staticBlogData, staticBlogPost } from "@/data/staticBlogData";
import { notFound } from "next/navigation";
import { getMetadataBase } from "@/lib/seo/metadata";

export function generateStaticParams() {
  const all = Array.isArray(staticBlogData) && staticBlogData.length > 0 ? staticBlogData : [staticBlogPost];
  return all
    .map((p) => p?.slug)
    .filter(Boolean)
    .map((slug) => ({ slug }));
}

export async function generateMetadata({ params }) {
  const resolved = await params;
  const slug = resolved?.slug;
  const all = Array.isArray(staticBlogData) && staticBlogData.length > 0 ? staticBlogData : [staticBlogPost];
  const post = all.find((p) => p?.slug === slug) || null;

  if (!post) {
    return {
      ...buildMetadata({
        title: "Blog | BM Wealth",
        description: "Investment insights and educational articles from BM Wealth.",
        path: "/blog",
        type: "article",
      }),
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = post?.title ? `${post.title} | BM Wealth` : "BM Wealth Blog";
  const description =
    post?.metaDescription || post?.excerpt || post?.summary || "Elite insights, market analysis, and updates from BM Wealth Talks.";

  const image = post?.imageUrl || post?.image_url || post?.image || DEFAULT_OG_IMAGE;

  return buildMetadata({
    title,
    description,
    path: slug ? `/blog/${slug}` : "/blog",
    type: "article",
    image,
  });
}

export default async function BlogDetailPage({ params }) {
  const resolved = await params;
  const slug = resolved?.slug;
  const all = Array.isArray(staticBlogData) && staticBlogData.length > 0 ? staticBlogData : [staticBlogPost];
  const post = all.find((p) => p?.slug === slug) || null;

  if (!post) {
    notFound();
  }

  // Server-rendered JSON-LD for Google (ensures structured data is in initial HTML).
  const siteUrl = getMetadataBase().toString().replace(/\/$/, "");
  const postUrl = `${siteUrl}/blog/${slug}`;
  const postImage = post?.imageUrl || post?.image_url || post?.image || DEFAULT_OG_IMAGE;
  const datePublished = post?.published_date || post?.date_published || post?.datePublished || post?.date || null;
  const dateModified = post?.modified_date || post?.date_modified || datePublished || null;

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post?.title || "BM Wealth Blog",
    description: post?.metaDescription || post?.excerpt || post?.summary || "",
    url: postUrl,
    mainEntityOfPage: { "@type": "WebPage", "@id": postUrl },
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: { "@type": "ImageObject", url: `${siteUrl}/logo.png` },
    },
    ...(datePublished ? { datePublished: String(datePublished).slice(0, 10) } : {}),
    ...(dateModified ? { dateModified: String(dateModified).slice(0, 10) } : {}),
    image: postImage,
    articleSection: post?.category || "Investment Education",
    ...(post?.tags?.length ? { keywords: post.tags.join(", ") } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />
      <Suspense fallback={null}>
        <BlogDetailClient slug={slug} initialPost={post} />
      </Suspense>
    </>
  );
}