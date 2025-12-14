import Link from "next/link";
import { readFile } from "fs/promises";
import { join } from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export const metadata = {
  title: "Blog",
  description: "Sample blog list for BM Wealth Next.",
};

export default async function BlogPage() {
  // Read JSON dynamically on every request (not bundled at build time)
  const filePath = join(process.cwd(), 'data', 'blog.json');
  const fileContents = await readFile(filePath, 'utf8');
  const blogPosts = JSON.parse(fileContents);
  
  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-blue-200/70">Insights</p>
        <h1 className="text-3xl font-semibold text-white">Blog</h1>
        <p className="text-sm text-slate-200/80">
          Demo content to wire up your CMS or API later. Links route to slug pages.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {blogPosts.map((post) => (
          <article key={post.slug} className="card flex flex-col gap-3 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-300/70">
                {new Date(post.published).toLocaleDateString("en-IN", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
              <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-slate-100">
                {post.author}
              </span>
            </div>
            <h2 className="text-lg font-semibold text-white">{post.title}</h2>
            <p className="text-sm text-slate-200/80">{post.summary}</p>
            <div className="flex flex-wrap gap-2 text-xs text-blue-100">
              {post.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-blue-500/15 px-2 py-1">
                  {tag}
                </span>
              ))}
            </div>
            <Link
              href={`/blog/${post.slug}`}
              className="mt-auto inline-flex items-center text-sm font-semibold text-blue-200 hover:text-white"
            >
              Read post →
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}

