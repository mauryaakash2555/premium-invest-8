'use client';

import Link from 'next/link';
import { ArrowRight, Calculator, FileText, Download, ExternalLink } from 'lucide-react';
import { TOOL_MAPPINGS, enhancePost } from '@/lib/blog/schema';

/**
 * Related Tools Block - Shows relevant calculators after blog content
 */
export function RelatedToolsBlock({ post, className = '' }) {
  const enhanced = enhancePost(post);
  if (!enhanced) return null;

  // Get tools from post tags or explicit relatedTools
  const tools = [];
  
  // From explicit relatedTools
  if (enhanced.relatedTools?.length) {
    enhanced.relatedTools.forEach(toolId => {
      if (typeof toolId === 'object' && toolId.path) {
        tools.push(toolId);
      } else if (typeof toolId === 'string' && TOOL_MAPPINGS[toolId]) {
        tools.push(TOOL_MAPPINGS[toolId]);
      }
    });
  }

  // From tags (backup)
  if (tools.length === 0) {
    (enhanced.tags || []).forEach(tag => {
      if (TOOL_MAPPINGS[tag] && tools.length < 2) {
        tools.push(TOOL_MAPPINGS[tag]);
      }
    });
  }

  if (tools.length === 0) return null;

  return (
    <div className={`border border-[color:var(--lux-foreground-10)] bg-[color:var(--lux-card)]/70 p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Calculator className="w-5 h-5 text-[color:var(--lux-accent)]" />
        <h3 className="text-lg font-semibold text-[color:var(--lux-foreground)]">
          Try Our Calculators
        </h3>
      </div>
      <p className="text-sm text-[color:var(--lux-foreground-60)] mb-4">
        Put these concepts into practice with our free tools:
      </p>
      <div className="grid gap-3">
        {tools.map((tool, i) => (
          <Link
            key={i}
            href={tool.path}
            className="group flex items-center justify-between p-4 border border-[color:var(--lux-foreground-10)] bg-[color:var(--lux-background)] hover:border-[color:var(--lux-accent)]/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{tool.icon}</span>
              <div>
                <div className="font-medium text-[color:var(--lux-foreground)] group-hover:text-[color:var(--lux-accent)] transition-colors">
                  {tool.name}
                </div>
                <div className="text-xs text-[color:var(--lux-foreground-40)]">
                  Free • No signup required
                </div>
              </div>
            </div>
            <ArrowRight className="w-5 h-5 text-[color:var(--lux-foreground-10)] group-hover:text-[color:var(--lux-accent)] transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}

/**
 * Downloads Block - Shows downloadable resources
 */
export function DownloadsBlock({ post, className = '' }) {
  const enhanced = enhancePost(post);
  if (!enhanced?.downloads) return null;

  const downloadItems = Object.entries(enhanced.downloads);
  if (downloadItems.length === 0) return null;

  return (
    <div className={`border border-[color:var(--lux-foreground-10)] bg-[color:var(--lux-card)]/70 p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <Download className="w-5 h-5 text-[color:var(--lux-accent)]" />
        <h3 className="text-lg font-semibold text-[color:var(--lux-foreground)]">
          Free Downloads
        </h3>
      </div>
      <div className="grid gap-3">
        {downloadItems.map(([key, item]) => (
          <a
            key={key}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center justify-between p-4 border border-[color:var(--lux-foreground-10)] bg-[color:var(--lux-background)] hover:border-[color:var(--lux-accent)]/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <FileText className="w-6 h-6 text-[color:var(--lux-accent)]" />
              <div>
                <div className="font-medium text-[color:var(--lux-foreground)] group-hover:text-[color:var(--lux-accent)] transition-colors">
                  {item.title}
                </div>
                <div className="text-xs text-[color:var(--lux-foreground-40)]">
                  {key === 'checklist' ? 'PDF Checklist' : key === 'template' ? 'Google Sheet' : 'Download'}
                </div>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-[color:var(--lux-foreground-10)] group-hover:text-[color:var(--lux-accent)] transition-colors" />
          </a>
        ))}
      </div>
    </div>
  );
}

/**
 * Related Posts Block - Shows related blog posts
 */
export function RelatedPostsBlock({ currentSlug, posts = [], className = '' }) {
  // Filter out current post and limit to 3
  const relatedPosts = posts
    .filter(p => p.slug !== currentSlug)
    .slice(0, 3);

  if (relatedPosts.length === 0) return null;

  return (
    <div className={`border border-[color:var(--lux-foreground-10)] bg-[color:var(--lux-card)]/70 p-6 ${className}`}>
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-[color:var(--lux-accent)]" />
        <h3 className="text-lg font-semibold text-[color:var(--lux-foreground)]">
          Related Reading
        </h3>
      </div>
      <div className="grid gap-3">
        {relatedPosts.map(post => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group flex items-start gap-3 p-3 border border-[color:var(--lux-foreground-10)] bg-[color:var(--lux-background)] hover:border-[color:var(--lux-accent)]/50 transition-colors"
          >
            <div className="flex-1 min-w-0">
              <div className="font-medium text-[color:var(--lux-foreground)] group-hover:text-[color:var(--lux-accent)] transition-colors line-clamp-2 text-sm">
                {post.title}
              </div>
              <div className="text-xs text-[color:var(--lux-foreground-40)] mt-1">
                {enhancePost(post)?.readingTime || 5} min read
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-[color:var(--lux-foreground-10)] group-hover:text-[color:var(--lux-accent)] transition-colors flex-shrink-0 mt-1" />
          </Link>
        ))}
      </div>
    </div>
  );
}

/**
 * Calculator Results to Blog CTA - Shows after calculator results
 */
export function CalculatorToBlogCTA({ toolId, title, className = '' }) {
  // Map tool IDs to relevant blog posts
  const blogMappings = {
    'tax-optimization': [
      { slug: 'how-regular-mutual-fund-plans-cost-mumbai-investor-47-lakh', title: 'He Lost ₹47L Following Wrong Advice' },
      { slug: 'ca-tax-trap-80c-mistakes', title: "CA's Tax Trap: 5 Ways You're Wasting 80C" },
      { slug: 'mumbai-it-professional-saved-2-lakh-tax', title: 'How a Mumbai IT Pro Saved ₹2.1L Tax' },
    ],
    'sip-calculator': [
      { slug: 'sip-vs-lumpsum-when-to-use-which', title: 'SIP vs Lump Sum: The Decision Tree' },
      { slug: 'property-vs-sip-mumbai-deep-dive', title: 'Property vs SIP in Mumbai' },
    ],
    'property-vs-sip': [
      { slug: 'property-vs-sip-mumbai-deep-dive', title: 'Property vs SIP: The ₹1.5Cr Decision' },
      { slug: 'sip-vs-lumpsum-when-to-use-which', title: 'SIP vs Lump Sum: When to Use Which' },
    ],
    'retirement-gap': [
      { slug: 'retirement-gap-calculator-engineering', title: 'How We Built the Retirement Calculator' },
    ],
  };

  const relatedBlogs = blogMappings[toolId] || [];
  if (relatedBlogs.length === 0) return null;

  return (
    <div className={`border border-[color:var(--lux-foreground-10)] bg-[color:var(--lux-card)]/50 p-5 ${className}`}>
      <div className="text-xs uppercase tracking-wider text-[color:var(--lux-foreground-40)] mb-3">
        {title || 'Deepen Your Understanding'}
      </div>
      <div className="space-y-2">
        {relatedBlogs.slice(0, 2).map(blog => (
          <Link
            key={blog.slug}
            href={`/blog/${blog.slug}`}
            className="group flex items-center justify-between p-3 border border-[color:var(--lux-foreground-10)] bg-[color:var(--lux-background)] hover:border-[color:var(--lux-accent)]/50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-[color:var(--lux-accent)]" />
              <span className="text-sm text-[color:var(--lux-foreground)] group-hover:text-[color:var(--lux-accent)] transition-colors">
                {blog.title}
              </span>
            </div>
            <ArrowRight className="w-4 h-4 text-[color:var(--lux-foreground-10)] group-hover:text-[color:var(--lux-accent)] transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  );
}

/**
 * WhatsApp CTA Block - Appears after reading
 */
export function WhatsAppCTABlock({ post, className = '' }) {
  const enhanced = enhancePost(post);
  if (!enhanced) return null;

  const message = encodeURIComponent(
    `Hi BM Wealth, I just read: ${enhanced.title}\n\nI want help with:`
  );
  const href = `https://wa.me/918850977259?text=${message}`;

  return (
    <div className={`border border-[color:var(--lux-accent)]/30 bg-[color:var(--lux-accent)]/5 p-6 text-center ${className}`}>
      <h3 className="text-lg font-semibold text-[color:var(--lux-foreground)] mb-2">
        Need Help With This?
      </h3>
      <p className="text-sm text-[color:var(--lux-foreground-60)] mb-4">
        Get a free consultation on your specific situation
      </p>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white font-medium hover:bg-[#20BD5A] transition-colors"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        Chat on WhatsApp
      </a>
      <div className="mt-3 text-xs text-[color:var(--lux-foreground-40)]">
        AMFI ARN 90008 • Free consultation • No spam
      </div>
    </div>
  );
}

export default {
  RelatedToolsBlock,
  DownloadsBlock,
  RelatedPostsBlock,
  CalculatorToBlogCTA,
  WhatsAppCTABlock,
};
