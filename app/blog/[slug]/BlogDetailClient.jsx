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
import BlogDisclaimer from '@/components/shared/BlogDisclaimer';
import { trackEvent } from '@/lib/analytics';

function isMobileViewport() {
  if (typeof window === 'undefined') return false;
  const w = window.innerWidth || 0;
  const hasMatchMedia = typeof window.matchMedia === 'function';
  const coarsePointer = hasMatchMedia ? window.matchMedia('(pointer: coarse)').matches : false;
  const noHover = hasMatchMedia ? window.matchMedia('(hover: none)').matches : false;
  const touch =
    (typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0) ||
    ('ontouchstart' in window);

  // iOS/iPadOS/Android WebViews can misreport hover/pointer; treat "touch-ish" and
  // smaller screens as mobile/tablet so the reader HUD renders consistently.
  return w <= 900 || ((touch || coarsePointer || noHover) && w <= 1024);
}

function normalizeBlogHtmlForPremium(html) {
  if (typeof html !== 'string') return html;

  const clamp01 = (n) => {
    const x = Number(n);
    if (!Number.isFinite(x)) return 0;
    return Math.min(1, Math.max(0, x));
  };

  const rgbaToAccent = (_full, a) => {
    const alpha = clamp01(a);
    const pct = Math.round(alpha * 100);
    // Approximates rgba(alpha) using only the canonical accent.
    return `color-mix(in oklab, var(--lux-accent) ${pct}%, transparent)`;
  };

  // Convert legacy "bright yellow" / alt-gold accents into the canonical premium accent.
  // CRITICAL: do not introduce any alternate gold RGB/hex values here.
  return html
    .replace(/var(--lux-accent)/gi, 'var(--lux-accent)')
    .replace(/var(--lux-accent)/gi, 'var(--lux-accent)')
    .replace(/var(--lux-accent)/gi, 'var(--lux-accent)')
    .replace(/var(--lux-accent)/gi, 'var(--lux-accent)')
    // Convert common legacy gold rgba(...) to accent-only color-mix(...)
    .replace(/rgba\(\s*218\s*,\s*165\s*,\s*32\s*,\s*([0-9]*\.?[0-9]+)\s*\)/gi, rgbaToAccent)
    .replace(/rgba\(\s*184\s*,\s*134\s*,\s*11\s*,\s*([0-9]*\.?[0-9]+)\s*\)/gi, rgbaToAccent)
    .replace(/rgba\(\s*192\s*,\s*160\s*,\s*98\s*,\s*([0-9]*\.?[0-9]+)\s*\)/gi, rgbaToAccent)
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

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

  const pageClassName = useMemo(() => {
    const safe = typeof slug === 'string' && slug.trim() ? slug.trim() : 'unknown';
    // Slug-only (already url-safe); used for per-post styling without touching content text.
    return `blog-detail-page blog-detail--${safe}`;
  }, [slug]);

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

    // BLOG 11: Premium affiliate CTA blocks
    // - Full width
    // - Never show raw URLs
    // - Keep lightweight click tracking for the 3 affiliate CTAs only
    const affiliateCleanups = [];
    if (post?.slug === 'best-credit-cards-high-income-india') {
      const affiliateLinks = Array.from(root.querySelectorAll('a.bm-cta-gold-flat'));
      affiliateLinks.forEach((a) => {
        a.classList.add('coming-next-block');
        a.classList.add('bm-affiliate-cta');

        const href = String(a.getAttribute('href') || '');
        const hrefLower = href.toLowerCase();

        let eventName = null;
        let affiliateKey = null;
        let friendlyTitle = 'Check eligibility';
        let friendlySubtitle = 'Sponsored link • Opens in a new tab';
        if (hrefLower.includes('idfcfirstbank')) {
          eventName = 'affiliate_idfc_click';
          affiliateKey = 'idfc';
          friendlyTitle = 'IDFC First Bank Credit Card';
        } else if (hrefLower.includes('aubank')) {
          eventName = 'affiliate_au_click';
          affiliateKey = 'au';
          friendlyTitle = 'AU Bank Credit Options';
        } else if (hrefLower.includes('indusind')) {
          eventName = 'affiliate_indusind_click';
          affiliateKey = 'indusind';
          friendlyTitle = 'IndusInd Bank Credit Card';
        }

        if (affiliateKey) {
          a.setAttribute('data-affiliate', affiliateKey);
        }

        // Replace the raw URL text with a premium card layout.
        // Keep the anchor itself as the clickable target.
        try {
          a.textContent = '';
          a.setAttribute('aria-label', `${friendlyTitle} (sponsored link)`);

          const meta = document.createElement('div');
          meta.className = 'bm-affiliate-meta';

          const titleEl = document.createElement('div');
          titleEl.className = 'bm-affiliate-title';
          titleEl.textContent = friendlyTitle;

          const subEl = document.createElement('div');
          subEl.className = 'bm-affiliate-subtitle';
          subEl.textContent = friendlySubtitle;

          meta.appendChild(titleEl);
          meta.appendChild(subEl);
          a.appendChild(meta);
        } catch {
          // If DOM manipulation fails for any reason, fall back to non-URL text.
          a.textContent = friendlyTitle;
        }

        if (eventName) {
          const onClick = () => {
            trackEvent(eventName, {
              placement: 'blog_11',
              blog_slug: post?.slug,
              href,
            });
          };

          a.addEventListener('click', onClick, true);
          affiliateCleanups.push(() => a.removeEventListener('click', onClick, true));
        }
      });
    }

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
      affiliateCleanups.forEach((fn) => fn());
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
        <div style={{ color: 'var(--lux-accent)', fontSize: '18px' }}>Loading...</div>
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
          color: 'var(--lux-accent)',
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
  const progressPct = Math.round(readProgress * 100);

  return (
    <div className={pageClassName} style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', paddingTop: '100px' }}>
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
                background:
                  'linear-gradient(90deg, color-mix(in oklab, var(--lux-accent) 10%, transparent), color-mix(in oklab, var(--lux-accent) 55%, transparent), rgba(255,255,255,0.14))',
                boxShadow: '0 0 18px color-mix(in oklab, var(--lux-accent) 35%, transparent)',
                transition: 'width 90ms linear',
              }}
            />
          </div>

          {/* Mobile-only reading % HUD (transparent, left-bottom) */}
          <div
            aria-hidden="true"
            style={{
              position: 'fixed',
              left: 14,
              bottom: 16,
              zIndex: 10002,
              padding: '8px 10px',
              borderRadius: 999,
              background: 'rgba(0,0,0,0.35)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255,255,255,0.10)',
              color: 'rgba(255,255,255,0.75)',
              fontSize: 12,
              lineHeight: 1,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
            }}
          >
            {progressPct}%
          </div>

          {/* Mobile-only ultra-premium progress ring */}
          {showBackToTop && (() => {
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
                    {progressPct}%
                  </text>
                </svg>
              </button>
            );
          })()}
        </>
      )}

      {/* Hero Image */}
      {heroImage && !isMobile && (
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
              borderRadius: 0,
              pointerEvents: 'none',
              background:
                'linear-gradient(180deg, rgba(10,10,10,0.55) 0%, rgba(10,10,10,0.72) 60%, rgba(10,10,10,0.82) 100%)',
            }}
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={heroImage}
            alt={post.title}
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '400px',
              aspectRatio: '16/9',
              objectFit: 'cover',
              borderRadius: 0,
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
          color: 'var(--lux-accent)',
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
            backgroundColor: 'color-mix(in oklab, var(--lux-accent) 14%, transparent)',
            color: 'var(--lux-accent)',
            padding: '6px 12px',
            borderRadius: 0,
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
          color: 'var(--lux-accent)',
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
            borderLeft: '3px solid color-mix(in oklab, var(--lux-accent) 55%, transparent)'
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

        <BlogDisclaimer />

        {/* Free Tools CTA */}
        <div style={{
          background:
            'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)',
          border: '1px solid color-mix(in oklab, var(--lux-accent) 26%, transparent)',
          borderRadius: 0,
          padding: '32px',
          margin: '40px 0',
          textAlign: 'center'
        }}>
          <h3 style={{
            fontSize: '24px',
            color: 'var(--lux-accent)',
            marginBottom: '16px',
            fontFamily: '"Playfair Display", serif'
          }}>
            Make Better Financial Decisions with Our Free Tools
          </h3>
          <p style={{
            fontSize: '16px',
            color: '#d0d0d0',
            marginBottom: '24px',
            lineHeight: '1.7'
          }}>
            Use our calculators to analyze investment scenarios and plan your wealth journey
          </p>
          <div style={{
            display: 'flex',
            gap: '16px',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <a 
              href="/tools/property-vs-sip"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                background:
                  'linear-gradient(135deg, var(--lux-accent) 0%, color-mix(in oklab, var(--lux-accent) 60%, white) 100%)',
                color: '#000',
                textDecoration: 'none',
                borderRadius: 0,
                fontWeight: '600',
                fontSize: '15px'
              }}
            >
              Property vs SIP Calculator
            </a>
            <a 
              href="/tools"
              style={{
                display: 'inline-block',
                padding: '12px 24px',
                background: 'transparent',
                color: 'var(--lux-accent)',
                textDecoration: 'none',
                borderRadius: 0,
                fontWeight: '600',
                fontSize: '15px',
                border: '1px solid var(--lux-accent)'
              }}
            >
              View All Tools →
            </a>
          </div>
        </div>

        {/* Internal Links */}
        <div style={{
          background: 'rgba(0,0,0,0.35)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 0,
          padding: '28px',
          margin: '0 0 40px 0'
        }}>
          <h3 style={{
            fontSize: '20px',
            color: 'var(--lux-accent)',
            marginBottom: '14px',
            fontFamily: '"Playfair Display", serif'
          }}>
            Explore Related Pages
          </h3>
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            <Link href="/mutual-funds" style={{
              display: 'inline-block',
              padding: '10px 14px',
              borderRadius: 0,
              backgroundColor: 'color-mix(in oklab, var(--lux-accent) 10%, transparent)',
              border: '1px solid color-mix(in oklab, var(--lux-accent) 22%, transparent)',
              color: '#e5e5e5',
              textDecoration: 'none',
              fontSize: '14px'
            }}>Mutual Funds</Link>
            <Link href="/sip" style={{
              display: 'inline-block',
              padding: '10px 14px',
              borderRadius: 0,
              backgroundColor: 'color-mix(in oklab, var(--lux-accent) 10%, transparent)',
              border: '1px solid color-mix(in oklab, var(--lux-accent) 22%, transparent)',
              color: '#e5e5e5',
              textDecoration: 'none',
              fontSize: '14px'
            }}>SIP Guide</Link>
            <Link href="/insurance" style={{
              display: 'inline-block',
              padding: '10px 14px',
              borderRadius: 0,
              backgroundColor: 'color-mix(in oklab, var(--lux-accent) 10%, transparent)',
              border: '1px solid color-mix(in oklab, var(--lux-accent) 22%, transparent)',
              color: '#e5e5e5',
              textDecoration: 'none',
              fontSize: '14px'
            }}>Insurance</Link>
            <Link href="/tools" style={{
              display: 'inline-block',
              padding: '10px 14px',
              borderRadius: 0,
              backgroundColor: 'color-mix(in oklab, var(--lux-accent) 10%, transparent)',
              border: '1px solid color-mix(in oklab, var(--lux-accent) 22%, transparent)',
              color: '#e5e5e5',
              textDecoration: 'none',
              fontSize: '14px'
            }}>Free Tools</Link>
            <Link href="/contact" style={{
              display: 'inline-block',
              padding: '10px 14px',
              borderRadius: 0,
              backgroundColor: 'color-mix(in oklab, var(--lux-accent) 10%, transparent)',
              border: '1px solid color-mix(in oklab, var(--lux-accent) 22%, transparent)',
              color: '#e5e5e5',
              textDecoration: 'none',
              fontSize: '14px'
            }}>Contact</Link>
          </div>
        </div>

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
                  borderRadius: 0,
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
            backgroundColor: 'var(--lux-accent)',
            color: '#0a0a0a',
            padding: '14px 32px',
            borderRadius: 0,
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
        /* Prevent horizontal overflow on mobile from long URLs/tables/code blocks */
        .blog-detail-page {
          overflow-x: hidden;
        }

        .blog-detail-page .blog-html {
          overflow-wrap: anywhere;
          word-break: break-word;
        }

        .blog-detail-page .blog-html :global(img),
        .blog-detail-page .blog-html :global(video),
        .blog-detail-page .blog-html :global(iframe) {
          max-width: 100% !important;
          height: auto !important;
        }

        .blog-detail-page .blog-html :global(table) {
          display: block;
          max-width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .blog-detail-page .blog-html :global(pre) {
          max-width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        @media (max-width: 768px) {
          article {
            padding: 0 16px 60px 16px !important;
          }

          /* Mobile-only: enforce premium gold for Playfair headings (keeps FAQ Inter questions white/grey) */
          article :global(h2[style*="Playfair Display"]),
          article :global(h3[style*="Playfair Display"]),
          article :global(h4[style*="Playfair Display"]) {
            color: var(--lux-accent) !important;
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
          color: var(--lux-accent) !important;
        }

        /* BLOG 11 ONLY: tighten typography + spacing to match other premium posts */
        .blog-detail--best-credit-cards-high-income-india .blog-html :global(h2) {
          font-family: "Playfair Display", serif;
          font-size: 30px;
          line-height: 1.25;
          letter-spacing: 0.2px;
          margin: 42px 0 14px;
        }

        .blog-detail--best-credit-cards-high-income-india .blog-html :global(h3) {
          font-family: "Playfair Display", serif;
          font-size: 20px;
          line-height: 1.35;
          margin: 22px 0 10px;
        }

        .blog-detail--best-credit-cards-high-income-india .blog-html :global(p) {
          margin: 0 0 16px;
          color: rgba(229, 229, 229, 0.92);
        }

        .blog-detail--best-credit-cards-high-income-india .blog-html :global(ul),
        .blog-detail--best-credit-cards-high-income-india .blog-html :global(ol) {
          margin: 0 0 18px;
          padding-left: 1.2rem;
        }

        .blog-detail--best-credit-cards-high-income-india .blog-html :global(li) {
          margin: 0 0 10px;
          color: rgba(229, 229, 229, 0.9);
        }

        .blog-detail--best-credit-cards-high-income-india .blog-html :global(hr) {
          border: none;
          border-top: 1px solid color-mix(in oklab, var(--lux-accent) 18%, rgba(255,255,255,0.10));
          margin: 34px 0;
        }

        /* ─────────────────────────────────────────────────────────────────────────────
         * AFFILIATE CTA BOXES (BLOG 11)
         * CRITICAL COLOR RULE:
         * - DO NOT introduce any other golds/browns.
         * - Use ONLY var(--lux-accent) + neutrals.
         * ───────────────────────────────────────────────────────────────────────────── */
        .blog-detail--best-credit-cards-high-income-india .blog-html :global(a.bm-cta-gold-flat) {
          position: relative;
          display: block;
          width: 100%;
          max-width: none;
          margin: 24px 0 28px;
          padding: 22px 22px 80px;
          border-radius: 16px;
          border: 1px solid color-mix(in oklab, var(--lux-accent) 22%, rgba(255,255,255,0.12));
          background: linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.04) 100%);
          color: rgba(229, 229, 229, 0.9);
          text-decoration: none;
          font-weight: 600;
          letter-spacing: 0.01em;
          text-transform: none;
          overflow-wrap: anywhere;
          word-break: break-word;
          transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), 
                      box-shadow 0.35s ease, 
                      background 0.35s ease, 
                      border-color 0.35s ease;
        }

        /* Animated shimmer on the CTA box (neutral + accent only) */
        .blog-detail--best-credit-cards-high-income-india .blog-html :global(a.bm-cta-gold-flat)::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          background: linear-gradient(
            105deg,
            transparent 20%,
            color-mix(in oklab, var(--lux-accent) 18%, transparent) 40%,
            color-mix(in oklab, var(--lux-accent) 28%, transparent) 50%,
            color-mix(in oklab, var(--lux-accent) 18%, transparent) 60%,
            transparent 80%
          );
          background-size: 200% 100%;
          animation: affiliateShimmer 3s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes affiliateShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        .blog-detail--best-credit-cards-high-income-india .blog-html :global(.bm-affiliate-meta) {
          position: relative;
          z-index: 2;
        }

        .blog-detail--best-credit-cards-high-income-india .blog-html :global(.bm-affiliate-title) {
          font-family: "Playfair Display", serif;
          font-size: 18px;
          line-height: 1.25;
          color: rgba(245, 245, 245, 0.92);
          margin-bottom: 6px;
        }

        .blog-detail--best-credit-cards-high-income-india .blog-html :global(.bm-affiliate-subtitle) {
          font-size: 12px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: rgba(235, 235, 235, 0.62);
        }

        /* Premium Animated Button with pulse + "Show results"-like sheen */
        .blog-detail--best-credit-cards-high-income-india .blog-html :global(a.bm-cta-gold-flat)::after {
          content: 'Check Eligibility →';
          position: absolute;
          left: 22px;
          bottom: 18px;
          transform: translateX(0);
          padding: 14px 22px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #0a0a0a;
          background: var(--lux-accent);
          box-shadow: 
            0 4px 20px color-mix(in oklab, var(--lux-accent) 45%, transparent),
            0 8px 40px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.25);
          pointer-events: none;
          animation: ctaPulse 2.5s ease-in-out infinite;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        /* Sheen overlay (uses neutral white only; base remains var(--lux-accent)) */
        .blog-detail--best-credit-cards-high-income-india .blog-html :global(a.bm-cta-gold-flat)::after {
          background-image:
            linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.26) 50%, transparent 100%);
          background-size: 220% 100%;
          background-position: 220% 0;
          animation: ctaPulse 2.5s ease-in-out infinite, ctaSheen 2.2s ease-in-out infinite;
        }

        @keyframes ctaSheen {
          0% { background-position: 220% 0; }
          60% { background-position: -120% 0; }
          100% { background-position: -120% 0; }
        }

        @keyframes ctaPulse {
          0%, 100% {
            box-shadow: 
              0 4px 20px color-mix(in oklab, var(--lux-accent) 40%, transparent),
              0 8px 40px rgba(0, 0, 0, 0.5),
              inset 0 1px 0 rgba(255, 255, 255, 0.3);
          }
          50% {
            box-shadow: 
              0 6px 30px color-mix(in oklab, var(--lux-accent) 55%, transparent),
              0 12px 50px rgba(0, 0, 0, 0.6),
              inset 0 1px 0 rgba(255, 255, 255, 0.35);
          }
        }

        .blog-detail--best-credit-cards-high-income-india .blog-html :global(a.bm-cta-gold-flat):hover {
          background: linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.06) 100%);
          transform: translateY(-4px) scale(1.01);
          box-shadow: 0 28px 100px rgba(0,0,0,0.55);
          border-color: color-mix(in oklab, var(--lux-accent) 40%, rgba(255,255,255,0.18));
        }

        .blog-detail--best-credit-cards-high-income-india .blog-html :global(a.bm-cta-gold-flat):hover::after {
          animation: ctaSheen 1.4s ease-in-out infinite;
          box-shadow: 
            0 8px 32px color-mix(in oklab, var(--lux-accent) 70%, transparent),
            0 16px 60px rgba(0, 0, 0, 0.6),
            inset 0 1px 0 rgba(255, 255, 255, 0.4);
          transform: translateX(0) scale(1.03);
        }
      `}</style>
    </div>
  );
}
