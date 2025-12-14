import Link from "next/link";
import { notFound } from "next/navigation";
import blogPosts from "@/data/blog.json";

export const dynamic = "force-dynamic";
export const revalidate = 0; // Disable static generation and caching

export function generateMetadata({ params }) {
  const post = blogPosts.find((entry) => entry.slug === params.slug);
  return {
    title: post ? `${post.title} · Blog` : "Blog post",
    description: post?.summary ?? "BM Wealth blog post",
  };
}

function renderParagraph(paragraph, index) {
  // Editorial highlights for Blog-1 (marked RED in source document)
  const highlights = [
    "Not ₹47,000. Not ₹4.7 lakh. Nearly half a crore rupees in potential wealth—gone.",
    "If someone this financially aware can lose ₹47 lakh in opportunity cost, imagine what's happening to families without this background.",
    'If you answered "I\'m not sure" or "I don\'t know" to even one of these questions, there may be gaps that could cost you significantly over time.'
  ];

  // Check if this paragraph contains highlighted text
  const isHighlighted = highlights.some(highlight => paragraph.includes(highlight));

  // Check if paragraph is a section heading
  const isHeading = [
    "The Number That Changed Everything",
    "How Does This Even Happen?",
    "The Part That Hurts Most",
    "What Every Investor Must Understand",
    "Are You in the Same Situation?",
    "What Changed for This Family"
  ].includes(paragraph);

  // Check if paragraph is numeric emphasis block
  const isNumericBlock = paragraph.includes("₹47,00,000") || paragraph === "The opportunity cost: ₹47,00,000";

  // Check if paragraph is part of CTA section
  const isCTASection = [
    "━━━━━━━━━━━━━━━━━━━━━━━━",
    "Get a Free Educational Consultation",
    "Understand Your Current Financial Position",
    "We'll help you understand:"
  ].includes(paragraph);

  // Check if paragraph is disclaimer section
  const isDisclaimer = paragraph.startsWith("Educational Content:") || 
                       paragraph.startsWith("Investment Risks:") ||
                       paragraph.startsWith("Regulatory Status:") ||
                       paragraph.startsWith("Due Diligence:") ||
                       paragraph.startsWith("No Guarantees:") ||
                       paragraph === "Important Disclaimers & Regulatory Information:";

  // Render section headings with increased spacing
  if (isHeading) {
    return (
      <h2 key={index} className="text-xl font-semibold text-white mt-12 mb-6">
        {paragraph}
      </h2>
    );
  }

  // Render numeric emphasis block with reduced loudness
  if (isNumericBlock) {
    return (
      <div key={index} className="my-8 rounded-lg bg-white/5 border-l-2 border-amber-600/40 px-5 py-4">
        <p className="text-2xl font-medium text-amber-100/90">
          {paragraph}
        </p>
      </div>
    );
  }

  // Render CTA section with calm, educational styling
  if (isCTASection) {
    if (paragraph === "━━━━━━━━━━━━━━━━━━━━━━━━") {
      return <hr key={index} className="my-12 border-t border-amber-600/20" />;
    }
    if (paragraph === "Get a Free Educational Consultation") {
      return (
        <h3 key={index} className="text-lg font-semibold text-amber-100/90 mt-8 mb-4">
          {paragraph}
        </h3>
      );
    }
    if (paragraph === "Understand Your Current Financial Position") {
      return (
        <p key={index} className="text-base text-slate-200 mb-4">
          {paragraph}
        </p>
      );
    }
    return (
      <p key={index} className="text-sm text-slate-300 leading-relaxed">
        {paragraph}
      </p>
    );
  }

  // Render disclaimer with subdued styling
  if (isDisclaimer) {
    return (
      <p key={index} className="text-xs text-slate-400/80 leading-relaxed mt-4">
        {paragraph}
      </p>
    );
  }

  // Render highlighted paragraphs with muted-gold left border
  if (isHighlighted) {
    return (
      <p key={index} className="rounded-lg bg-white/5 px-4 py-3 text-slate-100/90 border-l-3 border-l-amber-600/50 leading-relaxed">
        {paragraph}
      </p>
    );
  }

  // Default paragraph rendering with increased vertical spacing
  return (
    <p key={index} className="rounded-lg bg-white/5 px-4 py-3 text-slate-100/90 leading-relaxed mb-5">
      {paragraph}
    </p>
  );
}

export default function BlogDetailPage({ params }) {
  const post = blogPosts.find((entry) => entry.slug === params.slug);

  if (!post) {
    notFound();
  }

  const isBlog1 = post.slug === "how-regular-mutual-fund-plans-cost-mumbai-investor-47-lakh";

  return (
    <article className="card space-y-6 p-6 max-w-4xl mx-auto">
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

      <div className="space-y-1 text-sm leading-7 text-slate-100">
        {isBlog1 
          ? post.content.map((paragraph, index) => renderParagraph(paragraph, index))
          : post.content.map((paragraph, index) => (
              <p key={index} className="rounded-lg bg-white/5 px-4 py-3 text-slate-100/90">
                {paragraph}
              </p>
            ))
        }
      </div>

      <div className="flex items-center justify-between border-t border-white/5 pt-4 text-sm text-slate-200 mt-12">
        <Link href="/blog" className="font-semibold text-blue-200 hover:text-white">
          ← Back to blog
        </Link>
      </div>
    </article>
  );
}

