/**
 * FILE: app\blog\[slug]\page.js
 * PURPOSE: (auto-added) Explain what this file does.
 * CATEGORY: app
 *
 * DEPENDENCIES:
 * - react
 * - next/link
 * - lucide-react
 * - @/data/staticBlogData
 *
 * USED BY:
 * - (search the repo for this filename)
 *
 * SIMPLE EXPLANATION:
 * This file is part of the app.
 * It helps one specific feature work correctly.
 *
 * TO MODIFY:
 * - 🔧 Search for "TO MODIFY" notes inside the file.
 */

'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Calendar, User, ArrowLeft, ChevronUp } from 'lucide-react';
import { staticBlogData, staticBlogPost } from '@/data/staticBlogData';

function isMobileViewport() {
  if (typeof window === 'undefined') return false;
  const w = window.innerWidth || 0;
  const hasMatchMedia = typeof window.matchMedia === 'function';
  const coarsePointer = hasMatchMedia ? window.matchMedia('(pointer: coarse)').matches : false;
  const noHover = hasMatchMedia ? window.matchMedia('(hover: none)').matches : false;
  const touch =
    (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0) ||
    // eslint-disable-next-line no-prototype-builtins
    ('ontouchstart' in window);

  // iOS/iPadOS/Android WebViews can misreport hover/pointer; treat "touch-ish" and
  // smaller screens as mobile/tablet so the reader HUD renders consistently.
  return w <= 900 || ((touch || coarsePointer || noHover) && w <= 1024);
}

function normalizeBlogHtmlForPremium(html) {
  if (typeof html !== 'string') return html;
  // Convert "bright yellow" accents into premium matte gold across blog HTML.
  return html
    .replace(/#DAA520/gi, '#C0A062')
    .replace(/#B8860B/gi, '#C0A062')
    .replace(/rgba\(\s*218\s*,\s*165\s*,\s*32\s*,/gi, 'rgba(192, 160, 98,')
    .replace(/rgba\(\s*184\s*,\s*134\s*,\s*11\s*,/gi, 'rgba(192, 160, 98,')
    // Content is already live; rename label everywhere consistently.
    .replace(/Coming Next:/gi, 'Next Read:')
    .replace(/Coming Next/gi, 'Next Read');
}

export default function BlogDetailClient({ slug }) {
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scrollBoostSeed, setScrollBoostSeed] = useState(0);
  const articleRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [readProgress, setReadProgress] = useState(0); // 0..1
  const [showBackToTop, setShowBackToTop] = useState(false);
  // Keep overlay simple: % only (no timer)

  useEffect(() => {\n    window.scrollTo(0, 0);\n  }, []);

  useEffect(() => {
    if (!slug) return;
    
    // Find the post from staticBlogData
    const allBlogs = Array.isArray(staticBlogData) && staticBlogData.length > 0
      ? staticBlogData
      : [staticBlogPost];
    
    const foundPost = allBlogs.find(p => p.slug === slug);
    setPost(foundPost || null);
    setIsLoading(false);
    // re-run DOM enhancements when content changes
    setScrollBoostSeed((s) => s + 1);
  }, [slug]);

  useEffect(() => {
    const set = () => setIsMobile(isMobileViewport());
    set();
    window.addEventListener('resize', set, { passive: true });
    return () => window.removeEventListener('resize', set);
  }, []);

  const rawHtml = useMemo(() => {
    if (!post) return '';
    return typeof post.content === 'string'
      ? post.content
      : (Array.isArray(post.content) ? post.content.join('') : '');
  }, [post]);

  const renderedHtml = useMemo(() => {
    return normalizeBlogHtmlForPremium(rawHtml);
  }, [rawHtml]);

  // Mobile-only reading progress + back-to-top
  useEffect(() => {
    if (!isMobile) return;

    const compute = () => {
      const doc = document.documentElement;
      const scrollTop = window.scrollY || doc.scrollTop || 0;
      const max = Math.max(1, doc.scrollHeight - window.innerHeight);
      const p = Math.min(1, Math.max(0, scrollTop / max));
      setReadProgress(p);
      setShowBackToTop(scrollTop > 220);
    };

    compute();
    window.addEventListener('scroll', compute, { passive: true });
    window.addEventListener('resize', compute, { passive: true });
    return () => {
      window.removeEventListener('scroll', compute);
      window.removeEventListener('resize', compute);
    };
  }, [isMobile]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // Emulate hover for "Coming Next"/"Next Read" + blog WhatsApp CTA on scroll, and rename label.
  // Also: mobile-only tone-down of bright yellows inside blog content to premium gold.
  useEffect(() => {
    if (!post) return;
    if (typeof window === 'undefined') return;

    // Search the entire document, not just articleRef
    const root = document;

    // Detect "Next Read" blocks and WhatsApp CTAs by multiple methods
    const allLinks = Array.from(root.querySelectorAll('a'));
    const allDivs = Array.from(root.querySelectorAll('div'));
    
    // Method 1: Elements with the class already
    let comingBlocks = Array.from(root.querySelectorAll('.coming-next-block'));
    // IMPORTANT: Never touch the floating WhatsApp button
    let waCtas = Array.from(root.querySelectorAll('.whatsapp-cta-btn')).filter(
      (a) => !a.classList?.contains?.('whatsapp-float')
    );
    
    // Method 2: Links containing "next read" or "coming next" text
    allLinks.forEach(a => {
      const text = (a.textContent || '').toLowerCase();
      if (text.includes('coming next') || text.includes('next read')) {
        a.classList.add('coming-next-block');
        if (!comingBlocks.includes(a)) comingBlocks.push(a);
      }
    });

    // Method 3: Links to wa.me or whatsapp.com
    allLinks.forEach(a => {
      if (a.classList.contains('whatsapp-float')) return; // never touch floating WhatsApp
      const href = (a.getAttribute('href') || '').toLowerCase();
      if (href.includes('wa.me') || href.includes('whatsapp.com')) {
        a.classList.add('whatsapp-cta-btn');
        if (!waCtas.includes(a)) waCtas.push(a);
      }
    });

    // Method 4: Divs with border-left styling that contain "Next Read" (the inner wrapper)
    allDivs.forEach(div => {
      const text = (div.textContent || '').toLowerCase();
      const style = div.getAttribute('style') || '';
      if ((text.includes('next read') || text.includes('coming next')) && style.includes('border-left')) {
        div.classList.add('coming-next-block');
        if (!comingBlocks.includes(div)) comingBlocks.push(div);
      }
    });

    // Debug: Log what we found
    const debug = new URLSearchParams(window.location.search).get('debug') === '1';
    if (debug) {
      console.log('[Scroll Boost] Found coming-next blocks:', comingBlocks.length);
      console.log('[Scroll Boost] Found whatsapp CTAs:', waCtas.length);
    }

    // Rename label text (content already live, so it's not "coming next" anymore)
    comingBlocks.forEach((block) => {
      const pTags = Array.from(block.querySelectorAll('p'));
      pTags.forEach(p => {
        const txt = (p.textContent || '').trim();
        if (txt.toLowerCase().startsWith('coming next')) {
          p.textContent = txt.replace(/coming next/gi, 'Next Read');
        }
      });
    });

    if (comingBlocks.length === 0 && waCtas.length === 0) return;

    // "Scroll hover" should be reliable and persistent while the element is in view.
    // Avoid short pulses that can be missed during fast scrolling.
    const setBoost = (el, on) => {
      if (!el) return;
      if (on) el.classList.add('is-scroll-boost');
      else el.classList.remove('is-scroll-boost');
    };

    const targets = [...comingBlocks, ...waCtas];
    const cleanups = [];

    // ROBUST SCROLL TRACKING: Trigger glow when element is in the "eye-line" (middle 60% of screen)
    const updateBoost = () => {
      const vh = window.innerHeight || 0;
      const center = vh / 2;
      
      targets.forEach((el) => {
        const rect = el.getBoundingClientRect();
        // If the element is anywhere in the middle 70% of the viewport, make it glow
        const isInEyeLine = rect.top < vh * 0.85 && rect.bottom > vh * 0.15;
        
        if (isInEyeLine) {
          el.classList.add('is-scroll-boost');
        } else {
          el.classList.remove('is-scroll-boost');
        }
      });
    };

    const onScroll = () => {
      window.requestAnimationFrame(updateBoost);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateBoost, { passive: true });
    
    // Initial check
    setTimeout(updateBoost, 100);

    // Hover/tap fallback: if CSS hover is blocked by wrapping links or browser quirks,
    // force the same visual by toggling the class.
    const addHoverHandlers = (el) => {
      const onEnter = () => el.classList.add('is-scroll-boost');
      const onLeave = () => {
        const vh = window.innerHeight || 0;
        const rect = el.getBoundingClientRect();
        const isInEyeLine = rect.top < vh * 0.85 && rect.bottom > vh * 0.15;
        if (!isInEyeLine) el.classList.remove('is-scroll-boost');
      };
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('mouseleave', onLeave);
      el.addEventListener('touchstart', onEnter, { passive: true });
      cleanups.push(() => {
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('mouseleave', onLeave);
        el.removeEventListener('touchstart', onEnter);
      });
    };

    targets.forEach(addHoverHandlers);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', updateBoost);
      cleanups.forEach((fn) => fn());
    };
  }, [post, scrollBoostSeed]);

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: '#C0A062', fontSize: '18px' }}>Loading...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#0a0a0a',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px'
      }}>
        <h1 style={{ color: '#fff', fontSize: '48px', marginBottom: '16px' }}>404</h1>
        <p style={{ color: '#999', fontSize: '18px', marginBottom: '32px' }}>Blog post not found</p>
        <Link href="/blog" style={{
          color: '#C0A062',
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <ArrowLeft size={20} />
          Back to Blog
        </Link>
      </div>
    );
  }

  const heroImage = post.imageUrl || post.image_url || post.image || null;

  return (
    <div className="blog-detail-page" style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', paddingTop: '100px' }}>
      {/* Mobile-only reading progress */}
      {isMobile && (
        <>
          <div
            aria-hidden="true"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              zIndex: 10002,
              background: 'rgba(0,0,0,0.45)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${Math.round(readProgress * 100)}%`,
                background: 'linear-gradient(90deg, rgba(192,160,98,0.10), rgba(192,160,98,0.95), rgba(255,255,255,0.18))',
                boxShadow: '0 0 22px rgba(192,160,98,0.55)',
                transition: 'width 90ms linear',
              }}
            />
          </div>

          {/* Mobile-only ultra-premium progress ring */}
          {showBackToTop && (() => {
            const pct = Math.round(readProgress * 100);
            const radius = 20;
            const stroke = 2;
            const circumference = 2 * Math.PI * radius;
            const offset = circumference - (readProgress * circumference);
            return (
              <button
                onClick={scrollToTop}
                aria-label="Reading progress (tap to go to top)"
                style={{
                  position: 'fixed',
                  left: 16,
                  bottom: 115,
                  zIndex: 10002,
                  width: 50,
                  height: 50,
                  padding: 0,
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  outline: 'none',
                  transition: 'transform 200ms ease',
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
              >
                <svg width="50" height="50" viewBox="0 0 50 50">
                  {/* Background ring */}
                  <circle
                    cx="25"
                    cy="25"
                    r={radius}
                    fill="none"
                    stroke="rgba(255,255,255,0.08)"
                    strokeWidth={stroke}
                  />
                  {/* Progress ring */}
                  <circle
                    cx="25"
                    cy="25"
                    r={radius}
                    fill="none"
                    stroke="url(#goldGradient)"
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    style={{
                      transform: 'rotate(-90deg)',
                      transformOrigin: '50% 50%',
                      transition: 'stroke-dashoffset 150ms ease',
                    }}
                  />
                  <defs>
                    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#E8D5A3" />
                      <stop offset="50%" stopColor="#C9A962" />
                      <stop offset="100%" stopColor="#A08040" />
                    </linearGradient>
                  </defs>
                  {/* Percentage text */}
                  <text
                    x="25"
                    y="26"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#C9A962"
                    fontSize="11"
                    fontWeight="500"
                    fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
                    letterSpacing="0.3"
                  >
                    {pct}%
                  </text>
                </svg>
              </button>
            );
          })()}
        </>
      )}

      {/* Hero Image */}
      {heroImage && (
        <div style={{
          width: '100%',
          maxWidth: '1000px',
          margin: '0 auto 40px auto',
          padding: '0 20px',
          position: 'relative'
        }}>
          {/* Darken image inside blog detail so reading stays the focus */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '12px',
              pointerEvents: 'none',
              background:
                'linear-gradient(180deg, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.72) 60%, rgba(10,10,10,0.82) 100%)',
            }}
          />
          <img
            src={heroImage}
            alt={post.title}
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '400px',
              aspectRatio: '16/9',
              objectFit: 'cover',
              borderRadius: '12px',
              filter: 'brightness(0.4) saturate(0.9) contrast(1.1)',
              opacity: 0.8
            }}
          />
        </div>
      )}

      {/* Article Content */}
      <article
        ref={articleRef}
        style={{
        maxWidth: '800px',
        margin: '0 auto',
        padding: '0 20px 80px 20px'
      }}>
        {/* Back Link */}
        <Link href="/blog" style={{
          color: '#C0A062',
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '32px',
          fontSize: '14px'
        }}>
          <ArrowLeft size={16} />
          Back to Blog
        </Link>

        {/* Category Tag */}
        {post.category && (
          <div style={{
            display: 'inline-block',
            backgroundColor: 'rgba(192, 160, 98, 0.16)',
            color: '#C0A062',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '500',
            marginBottom: '16px'
          }}>
            {post.category}
          </div>
        )}

        {/* Title */}
        <h1 style={{
          fontFamily: '"Playfair Display", Georgia, serif',
          fontSize: 'clamp(28px, 5vw, 42px)',
          fontWeight: '600',
          color: '#C0A062',
          lineHeight: '1.2',
          marginBottom: '24px'
        }}>
          {post.title}
        </h1>

        {/* Meta Info */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '20px',
          alignItems: 'center',
          marginBottom: '32px',
          paddingBottom: '32px',
          borderBottom: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#999',
            fontSize: '14px'
          }}>
            <Calendar size={16} />
            {post.publishDate || post.published || 'December 2025'}
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#999',
            fontSize: '14px'
          }}>
            <User size={16} />
            {post.author || 'BM Wealth Editorial Team'}
          </div>
          {post.readTime && (
            <div style={{ color: '#999', fontSize: '14px' }}>
              {post.readTime}
            </div>
          )}
        </div>

        {/* Summary/Excerpt */}
        {post.excerpt && (
          <p style={{
            fontSize: '18px',
            lineHeight: '1.7',
            color: '#ccc',
            fontStyle: 'italic',
            marginBottom: '40px',
            paddingLeft: '20px',
            borderLeft: '3px solid rgba(192, 160, 98, 0.7)'
          }}>
            {post.excerpt}
          </p>
        )}

        {/* Content */}
        <div
          className="blog-html"
          style={{ color: '#e5e5e5', lineHeight: '1.8' }}
          dangerouslySetInnerHTML={{ 
            __html: renderedHtml || 'No content available.'
          }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div style={{
            marginTop: '40px',
            paddingTop: '32px',
            borderTop: '1px solid rgba(255,255,255,0.1)'
          }}>
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              {post.tags.map((tag, index) => (
                <span key={index} style={{
                  backgroundColor: 'rgba(255,255,255,0.05)',
                  color: '#999',
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '13px'
                }}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Back to Blog */}
        <div style={{ marginTop: '60px', textAlign: 'center' }}>
          <Link href="/blog" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            backgroundColor: '#C0A062',
            color: '#0a0a0a',
            padding: '14px 32px',
            borderRadius: '30px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '15px',
            transition: 'all 0.3s ease'
          }}>
            <ArrowLeft size={18} />
            Back to All Articles
          </Link>
        </div>
      </article>

      {/* Embedded responsive styles */}
      <style jsx>{`
        @media (max-width: 768px) {
          article {
            padding: 0 16px 60px 16px !important;
          }

          /* Mobile-only: enforce premium gold for Playfair headings (keeps FAQ Inter questions white/grey) */
          article :global(h2[style*="Playfair Display"]),
          article :global(h3[style*="Playfair Display"]),
          article :global(h4[style*="Playfair Display"]) {
            color: #C0A062 !important;
          }

          /* Mobile reading typography polish (safe: only inside blog detail page) */
          .blog-detail-page article :global(p) {
            font-size: 16px !important;
            line-height: 1.95 !important;
            letter-spacing: 0.1px !important;
          }

          .blog-detail-page article :global(ul),
          .blog-detail-page article :global(ol) {
            font-size: 16px !important;
            line-height: 1.9 !important;
          }

          /* Reduce "wall of text" feel */
          .blog-detail-page article :global(p + p) {
            margin-top: 14px !important;
          }
        }

        /* Blog HTML content: enforce premium gold headings (fix "random white headings") */
        .blog-detail-page .blog-html :global(h2),
        .blog-detail-page .blog-html :global(h3),
        .blog-detail-page .blog-html :global(h4) {
          color: #C0A062 !important;
        }
      `}</style>
    </div>
  );
}
