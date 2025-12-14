import Link from "next/link";
import { notFound } from "next/navigation";
import { readFile } from "fs/promises";
import { join } from "path";

export const dynamic = "force-dynamic";
export const revalidate = 0; // Disable static generation and caching
export const fetchCache = 'force-no-store'; // Disable fetch caching
export const runtime = 'nodejs'; // Use Node.js runtime (no edge caching)

export async function generateMetadata({ params }) {
  // Read JSON dynamically for metadata too
  const filePath = join(process.cwd(), 'data', 'blog.json');
  const fileContents = await readFile(filePath, 'utf8');
  const blogPosts = JSON.parse(fileContents);
  
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

  // Check if paragraph contains WhatsApp (for glow styling)
  const containsWhatsApp = paragraph.includes("WhatsApp");
  
  // Check if paragraph is "Coming Next" section
  const isComingNext = paragraph.includes("Coming Next") || paragraph.includes("He Did Everything Right");

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

  // Render numeric emphasis block with reduced loudness and proper ₹ alignment
  if (isNumericBlock) {
    // Extract just the amount if paragraph contains "The opportunity cost:"
    const amountText = paragraph.includes("The opportunity cost:") 
      ? paragraph.split(":")[1].trim() 
      : paragraph;
    
    return (
      <div key={index} className="my-8 rounded-lg bg-white/5 border-l-2 border-amber-600/40 px-4 py-3">
        {paragraph.includes("The opportunity cost:") ? (
          <div>
            <p className="text-base text-slate-300/80 mb-2">The opportunity cost:</p>
            <p className="text-2xl font-semibold text-amber-100/85 leading-tight" style={{ fontVariantNumeric: 'tabular-nums', fontFeatureSettings: '"tnum"' }}>
              {amountText}
            </p>
          </div>
        ) : (
          <p className="text-2xl font-semibold text-amber-100/85 leading-tight" style={{ fontVariantNumeric: 'tabular-nums', fontFeatureSettings: '"tnum"' }}>
            {paragraph}
          </p>
        )}
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
    // Render WhatsApp with glow only behind "WhatsApp" word
    if (containsWhatsApp) {
      const parts = paragraph.split(/(WhatsApp)/);
      return (
        <p key={index} className="text-sm text-slate-300 leading-relaxed">
          {parts.map((part, i) => 
            part === "WhatsApp" ? (
              <span key={i} className="relative inline-block">
                <span className="absolute inset-0 bg-amber-600/20 blur-md rounded" style={{ filter: 'blur(8px)' }} />
                <span className="relative">{part}</span>
              </span>
            ) : part
          )}
        </p>
      );
    }
    return (
      <p key={index} className="text-sm text-slate-300 leading-relaxed">
        {paragraph}
      </p>
    );
  }

  // Render "Coming Next" section with glow on hover
  if (isComingNext) {
    return (
      <div 
        key={index} 
        className="my-8 p-6 rounded-lg bg-white/5 border border-amber-600/20 hover:bg-white/10 transition-all duration-300 cursor-pointer group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-amber-600/0 via-amber-600/10 to-amber-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
        <p className="relative text-slate-100/90 leading-relaxed">{paragraph}</p>
      </div>
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

  // Render highlighted paragraphs with muted-gold left border (NO background, NO glow)
  if (isHighlighted) {
    return (
      <p key={index} className="px-4 py-3 text-slate-100/90 border-l-4 border-amber-600/40 leading-relaxed mb-5">
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

export default async function BlogDetailPage({ params }) {
  // Force dynamic rendering - read JSON file fresh on every request (not bundled)
  const filePath = join(process.cwd(), 'data', 'blog.json');
  const fileContents = await readFile(filePath, 'utf8');
  const blogPosts = JSON.parse(fileContents);
  
  const post = blogPosts.find((entry) => entry.slug === params.slug);

  if (!post) {
    notFound();
  }

  const isBlog1 = post.slug === "47-lakh-investment-mistake-mumbai";
  const mumbaiSkylineUrl = "https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=2000&q=80";

  // Add cache-busting timestamp to ensure fresh content
  const cacheBuster = Date.now();

  return (
    <>
      {/* Mumbai Skyline Hero Image for Blog 1 - Immediate render, no lazy loading */}
      {isBlog1 && (
        <div className="relative w-full h-64 md:h-96 overflow-hidden">
          <img
            src={mumbaiSkylineUrl}
            alt="Mumbai skyline"
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
            decoding="sync"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black" />
        </div>
      )}
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

      {/* Content renders immediately - no lazy loading, no delays */}
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
    </>
  );
}

