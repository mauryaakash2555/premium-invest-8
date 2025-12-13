import Link from "next/link";
import { notFound } from "next/navigation";
import blogPosts from "@/data/blog.json";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }) {
  const post = blogPosts.find((entry) => entry.slug === params.slug);
  return {
    title: post ? `${post.title} · Blog` : "Blog post",
    description: post?.summary ?? "BM Wealth blog post",
  };
}

export default function BlogDetailPage({ params }) {
  const post = blogPosts.find((entry) => entry.slug === params.slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="card space-y-6 p-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-300/70">
            {new Date(post.published).toLocaleDateString("en-IN", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
          <h1 className="text-3xl font-semibold text-white">{post.title}</h1>
          <p className="text-sm text-slate-300">{post.summary}</p>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-100">
          {post.author}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 text-xs text-blue-100">
        {post.tags.map((tag) => (
          <span key={tag} className="rounded-full bg-blue-500/15 px-2 py-1">
            {tag}
          </span>
        ))}
      </div>

      <div className="space-y-4 text-sm leading-7 text-slate-100">
        {post.content.map((paragraph, index) => (
          <p key={index} className="rounded-lg bg-white/5 px-4 py-3 text-slate-100/90">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="flex items-center justify-between border-t border-white/5 pt-4 text-sm text-slate-200">
        <Link href="/blog" className="font-semibold text-blue-200 hover:text-white">
          ← Back to blog
        </Link>
        <span className="text-xs text-slate-400">Static demo content</span>
      </div>
    </article>
  );
}

