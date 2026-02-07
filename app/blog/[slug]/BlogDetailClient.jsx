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
import { useRouter, useSearchParams } from 'next/navigation';
import { Calendar, User, ArrowLeft, ChevronUp } from 'lucide-react';
import { staticBlogData, staticBlogPost } from '@/data/staticBlogData';
import BlogDisclaimer from '@/components/shared/BlogDisclaimer';
import { trackEvent } from '@/lib/analytics';

// Blog engagement components
import Comments from '@/components/blog/Comments';
import SocialShare from '@/components/blog/SocialShare';
import ViewTracker from '@/components/blog/ViewTracker';
import PostBottomCTA from '@/components/blog/PostBottomCTA';
import BlogNavigation from '@/components/BlogNavigation';

// Premium LUX Theme (canonical values - never deviate)
const LUX = {
  background: 'oklch(0.06 0.005 280)',
  foreground: 'oklch(0.95 0.01 85)',
  foreground80: 'oklch(0.95 0.01 85 / 0.80)',
  foreground60: 'oklch(0.95 0.01 85 / 0.60)',
  foreground40: 'oklch(0.95 0.01 85 / 0.40)',
  foreground10: 'oklch(0.95 0.01 85 / 0.10)',
  foreground05: 'oklch(0.95 0.01 85 / 0.05)',
  card: 'oklch(0.10 0.005 280)',
  accent: 'oklch(0.78 0.08 65)',
};

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
    .replace(/var\(--lux-accent\)/gi, 'var(--lux-accent)')
    .replace(/var\(--lux-accent\)/gi, 'var(--lux-accent)')
    .replace(/var\(--lux-accent\)/gi, 'var(--lux-accent)')
    .replace(/var\(--lux-accent\)/gi, 'var(--lux-accent)')
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

  const router = useRouter();
  const searchParams = useSearchParams();

  const backHref = useMemo(() => {
    const raw = searchParams?.get('from');
    if (!raw) return '/blog';
    // Only allow internal blog paths to prevent open redirects.
    if (raw === '/blog/impact' || raw === '/blog/guest' || raw === '/blog/dev' || raw === '/blog' || raw === '/blog/editorial') {
      return raw;
    }
    return '/blog';
  }, [searchParams]);

  const backLabel = useMemo(() => {
    switch (backHref) {
      case '/blog/impact':
        return 'Back to Community Impact';
      case '/blog/guest':
        return 'Back to Guest Columns';
      case '/blog/dev':
        return 'Back to Developer Insight';
      default:
        return 'Back to Blog';
    }
  }, [backHref]);

  const onBackClick = (e) => {
    // Prefer true browser back when available (keeps scroll + filters).
    // Fallback to computed href if opened directly/new tab.
    e?.preventDefault?.();
    try {
      if (typeof window !== 'undefined' && window.history && window.history.length > 1) {
        router.back();
        return;
      }
    } catch {}
    router.push(backHref);
  };

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

  const allBlogs = useMemo(() => {
    return Array.isArray(staticBlogData) && staticBlogData.length > 0
      ? staticBlogData
      : [staticBlogPost];
  }, []);

  const nextPost = useMemo(() => {
    if (!post || !post.slug) return null;
    const idx = allBlogs.findIndex((p) => p && p.slug === post.slug);
    if (idx === -1) return null;
    const next = allBlogs[(idx + 1) % allBlogs.length];
    if (!next || next.slug === post.slug) return null;
    return next;
  }, [allBlogs, post]);

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

  const estimatedReadTime = useMemo(() => {
    // Prefer explicit read time if present
    const raw = String(post?.readTime || post?.read_time || '').trim();
    const m = raw.match(/(\d+)\s*(min|minute)/i);
    if (m) {
      const n = parseInt(m[1], 10);
      if (Number.isFinite(n) && n > 0) return n;
    }

    // Estimate from HTML word count
    const html = String(renderedHtml || '').trim();
    if (!html) return null;
    let text = '';
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');
      text = String(doc?.body?.textContent || '').replace(/\s+/g, ' ').trim();
    } catch {
      text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    }
    const words = text ? text.split(' ').filter(Boolean).length : 0;
    if (!words) return null;
    const minutes = Math.max(1, Math.round(words / 220));
    return minutes;
  }, [post?.readTime, post?.read_time, renderedHtml]);

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
    const borderLeftEls = Array.from(root.querySelectorAll('[style*="border-left"]'));
    
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

    // Premium affiliate CTA blocks
    // - Full width
    // - Never show raw URLs
    // - Keeps click tracking only when an event name is available
    const affiliateCleanups = [];
    const affiliateLinks = Array.from(root.querySelectorAll('a.bm-cta-gold-flat'));
    affiliateLinks.forEach((a) => {
      a.classList.add('coming-next-block');
      a.classList.add('bm-affiliate-cta');

      const href = String(a.getAttribute('href') || '');
      const hrefLower = href.toLowerCase();

      const dataTitle = a.getAttribute('data-bm-title');
      const dataSubtitle = a.getAttribute('data-bm-subtitle');
      const dataEvent = a.getAttribute('data-bm-event');
      const dataAffiliate = a.getAttribute('data-bm-affiliate');
      const dataPlacement = a.getAttribute('data-bm-placement');
      const dataCta = a.getAttribute('data-bm-cta');

      let eventName = dataEvent || null;
      let affiliateKey = dataAffiliate || null;
      let friendlyTitle = dataTitle || 'Check eligibility';
      let friendlySubtitle = dataSubtitle || 'Sponsored link • Opens in a new tab';

      // Backward-compatible defaults for Blog 11's three known partners
      if (!dataTitle || !dataEvent || !dataAffiliate) {
        if (hrefLower.includes('idfcfirstbank')) {
          eventName = dataEvent || 'affiliate_idfc_click';
          affiliateKey = dataAffiliate || 'idfc';
          friendlyTitle = dataTitle || 'IDFC First Bank Credit Card';
        } else if (hrefLower.includes('aubank')) {
          eventName = dataEvent || 'affiliate_au_click';
          affiliateKey = dataAffiliate || 'au';
          friendlyTitle = dataTitle || 'AU Bank Credit Options';
        } else if (hrefLower.includes('indusind')) {
          eventName = dataEvent || 'affiliate_indusind_click';
          affiliateKey = dataAffiliate || 'indusind';
          friendlyTitle = dataTitle || 'IndusInd Bank Credit Card';
        }
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

        const btn = document.createElement('div');
        btn.className = 'bm-affiliate-btn';
        btn.textContent =
          dataCta || (String(affiliateKey || '').toLowerCase() === 'loan_hub' ? 'Check Eligibility' : 'Apply via Official Partner');
        a.appendChild(btn);
      } catch {
        // If DOM manipulation fails for any reason, fall back to non-URL text.
        a.textContent = friendlyTitle;
      }

      if (eventName) {
        const onClick = () => {
          trackEvent(eventName, {
            placement:
              dataPlacement ||
              (post?.slug === 'best-credit-cards-high-income-india'
                ? 'blog_best-credit-cards-high-income-india'
                : 'blog_detail'),
            blog_slug: post?.slug,
            href,
          });
        };

        a.addEventListener('click', onClick, true);
        affiliateCleanups.push(() => a.removeEventListener('click', onClick, true));
      }
    });

    // Method 4: Elements with border-left styling that contain "Next Read" (inner wrapper)
    const maybeMarkNextRead = (el) => {
      if (!el) return;
      const style = String(el.getAttribute?.('style') || '').toLowerCase();
      if (!style.includes('border-left')) return;
      const text = (el.textContent || '').toLowerCase();
      if (!text) return;
      if (!(text.includes('next read') || text.includes('coming next'))) return;
      el.classList.add('coming-next-block');
      if (!comingBlocks.includes(el)) comingBlocks.push(el);
    };

    allDivs.forEach((div) => maybeMarkNextRead(div));
    borderLeftEls.forEach((el) => maybeMarkNextRead(el));

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
        backgroundColor: LUX.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ color: LUX.accent, fontSize: '18px' }}>Loading...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: LUX.background,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px'
      }}>
        <h1 style={{ color: LUX.foreground, fontSize: '48px', marginBottom: '16px' }}>404</h1>
        <p style={{ color: LUX.foreground60, fontSize: '18px', marginBottom: '32px' }}>Blog post not found</p>
        <Link href={backHref} onClick={onBackClick} style={{
          color: LUX.accent,
          textDecoration: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <ArrowLeft size={20} />
          {backLabel}
        </Link>
      </div>
    );
  }

  const heroImage = post.imageUrl || post.image_url || post.image || null;
  const progressPct = Math.round(readProgress * 100);

  return (
    <div className={pageClassName} style={{
      backgroundColor: LUX.background,
      minHeight: '100vh',
      paddingTop: '100px',
      '--lux-background': LUX.background,
      '--lux-foreground': LUX.foreground,
      '--lux-foreground-80': LUX.foreground80,
      '--lux-foreground-60': LUX.foreground60,
      '--lux-foreground-40': LUX.foreground40,
      '--lux-foreground-10': LUX.foreground10,
      '--lux-foreground-05': LUX.foreground05,
      '--lux-card': LUX.card,
      '--lux-accent': LUX.accent,
    }}>
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
                'linear-gradient(180deg, rgba(10,10,10,0.28) 0%, rgba(10,10,10,0.45) 60%, rgba(10,10,10,0.55) 100%)',
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
              filter: 'brightness(0.78) saturate(1.12) contrast(1.05)',
              opacity: 1
            }}
          />
        </div>
      )}

      <section className="section-container" style={{ paddingTop: '0', paddingBottom: '0', maxWidth: '1000px' }}>
        <BlogNavigation />
      </section>

      {/* Article Content */}
      <article
        ref={articleRef}
        style={{
        maxWidth: '860px',
        margin: '0 auto',
        padding: '0 clamp(20px, 4vw, 40px) 80px'
      }}>
        {/* Back Link */}
        <Link href={backHref} onClick={onBackClick} style={{
          color: 'var(--lux-accent)',
          textDecoration: 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '32px',
          fontSize: '14px'
        }}>
          <ArrowLeft size={16} />
          {backLabel}
        </Link>

        {/* Category Tag */}
        {post.category && (
          <div style={{
            display: 'inline-block',
            backgroundColor: 'rgba(0,0,0,0.72)',
            border: '1px solid rgba(170,198,255,0.18)',
            color: 'rgba(235,242,255,0.86)',
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
          marginBottom: '10px'
        }}>
          {post.title}
        </h1>

        {estimatedReadTime ? (
          <div
            style={{
              color: 'var(--lux-foreground-60)',
              fontSize: '14px',
              marginBottom: '22px',
              letterSpacing: '0.02em',
            }}
          >
            Estimated read time: {estimatedReadTime} min
          </div>
        ) : (
          <div style={{ height: 8 }} />
        )}

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
            color: 'var(--lux-foreground-60)',
            fontSize: '14px'
          }}>
            <Calendar size={16} />
            {post.publishDate || post.published || 'December 2025'}
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: 'var(--lux-foreground-60)',
            fontSize: '14px'
          }}>
            <User size={16} />
            {post.author || 'BM Wealth Editorial Team'}
          </div>
          {/* Read time is shown under title for consistency */}
        </div>

        {/* Summary/Excerpt */}
        {post.excerpt && (
          <p style={{
            fontSize: '18px',
            lineHeight: '1.7',
            color: 'var(--lux-foreground-60)',
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
          style={{ color: 'var(--lux-foreground-80)', lineHeight: '1.9', fontSize: '17px' }}
          dangerouslySetInnerHTML={{ 
            __html: renderedHtml || 'No content available.'
          }}
        />

        <BlogDisclaimer />

        {/* Author Block */}
        <div
          style={{
            marginTop: '26px',
            padding: '20px',
            border: '1px solid rgba(255,255,255,0.10)',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: 0,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              aria-hidden="true"
              style={{
                width: 48,
                height: 48,
                borderRadius: 999,
                background:
                  'linear-gradient(135deg, color-mix(in oklab, var(--lux-accent) 40%, transparent) 0%, rgba(255,255,255,0.05) 100%)',
                border: '1px solid rgba(255,255,255,0.10)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'rgba(0,0,0,0.88)',
                fontWeight: 800,
              }}
            >
              {(String(post.author || 'BM')[0] || 'B').toUpperCase()}
            </div>
            <div>
              <div style={{ color: 'var(--lux-foreground)', fontSize: '15px', fontWeight: 800 }}>
                {post.author || 'BM Wealth'}
              </div>
              <div style={{ color: 'var(--lux-foreground-60)', fontSize: '13px' }}>
                {post.author === 'BM Wealth Editorial Team' ? 'Editorial' : 'BM Wealth'}
              </div>
            </div>
          </div>
          <div style={{ marginTop: '12px', color: 'var(--lux-foreground-60)', fontSize: '14px', lineHeight: 1.7 }}>
            Practical, high-signal writing on investing, tax, and better financial decisions.
          </div>
        </div>

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
            color: 'var(--lux-foreground-60)',
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
          background: 'linear-gradient(135deg, rgba(255,255,255,0.045) 0%, rgba(255,255,255,0.018) 100%)',
          border: '1px solid rgba(255,255,255,0.10)',
          borderRadius: 0,
          padding: '28px',
          margin: '0 0 40px 0',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
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
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'var(--lux-foreground-80)',
              textDecoration: 'none',
              fontSize: '14px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
            }}>Mutual Funds</Link>
            <Link href="/sip" style={{
              display: 'inline-block',
              padding: '10px 14px',
              borderRadius: 0,
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'var(--lux-foreground-80)',
              textDecoration: 'none',
              fontSize: '14px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
            }}>SIP Guide</Link>
            <Link href="/insurance" style={{
              display: 'inline-block',
              padding: '10px 14px',
              borderRadius: 0,
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'var(--lux-foreground-80)',
              textDecoration: 'none',
              fontSize: '14px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
            }}>Insurance</Link>
            <Link href="/tools" style={{
              display: 'inline-block',
              padding: '10px 14px',
              borderRadius: 0,
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'var(--lux-foreground-80)',
              textDecoration: 'none',
              fontSize: '14px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
            }}>Free Tools</Link>
            <Link href="/contact" style={{
              display: 'inline-block',
              padding: '10px 14px',
              borderRadius: 0,
              backgroundColor: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'var(--lux-foreground-80)',
              textDecoration: 'none',
              fontSize: '14px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
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
                  color: 'var(--lux-foreground-60)',
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

        {/* View Tracker - tracks view after 10 seconds */}
        <ViewTracker postId={post.id || slug} slug={slug} />

        {/* Social Share Buttons */}
        <SocialShare 
          url={typeof window !== 'undefined' ? window.location.href : `https://bmwealth.co.in/blog/${slug}`}
          title={post.title}
          description={post.excerpt}
          tags={post.tags?.map(t => `#${t.replace(/\s+/g, '')}`)}
        />

        {/* Post Bottom CTA - Newsletter + Submit Story */}
        <PostBottomCTA title="Enjoyed this article?" />

        {/* Comments Section */}
        <Comments postId={post.id || slug} postTitle={post.title} />

        {/* Blog-only: Next Read + WhatsApp CTA (always present, premium, hover-ready) */}
        <div style={{ marginTop: '44px' }}>
          {nextPost ? (
            <Link
              href={`/blog/${nextPost.slug}`}
              className="coming-next-block"
              style={{
                display: 'block',
                textDecoration: 'none',
                padding: '22px',
                border: '1px solid rgba(255,255,255,0.10)',
                background: 'rgba(0,0,0,0.70)',
                marginBottom: '14px',
              }}
            >
              <div style={{
                fontSize: '12px',
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'rgba(245, 248, 255, 0.62)',
                marginBottom: '10px'
              }}>
                Next Read:
              </div>
              <div style={{
                fontFamily: '"Playfair Display", serif',
                fontSize: '20px',
                lineHeight: 1.35,
                color: 'rgba(235, 242, 255, 0.96)'
              }}>
                {nextPost.title}
              </div>
              {nextPost.excerpt ? (
                <div style={{
                  marginTop: '10px',
                  fontSize: '14px',
                  lineHeight: 1.7,
                  color: 'rgba(235, 242, 255, 0.68)'
                }}>
                  {nextPost.excerpt}
                </div>
              ) : null}
              <div style={{
                marginTop: '12px',
                color: 'color-mix(in oklab, var(--lux-accent) 70%, white 30%)',
                fontSize: '13px',
                fontWeight: 600,
              }}>
                Tap to read →
              </div>
            </Link>
          ) : null}

          <a
            className="whatsapp-cta-btn"
            href={`https://wa.me/918850977259?text=${encodeURIComponent(
              `Hi Dev, I just read "${post?.title || 'a BM Wealth blog'}" on BM Wealth. I want help with my next steps.`
            )}`}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
              textDecoration: 'none',
              padding: '18px 22px',
              border: '1px solid rgba(255,255,255,0.10)',
              background: 'rgba(0,0,0,0.70)',
              color: 'rgba(235, 242, 255, 0.92)',
            }}
          >
            <div>
              <div style={{
                fontFamily: '"Playfair Display", serif',
                fontSize: '18px',
                color: 'rgba(235, 242, 255, 0.96)'
              }}>
                WhatsApp Dev
              </div>
              <div style={{
                marginTop: '6px',
                fontSize: '13px',
                lineHeight: 1.6,
                color: 'rgba(235, 242, 255, 0.66)'
              }}>
                Get a quick, no-hype next-step plan. Education-only.
              </div>
            </div>
            <div style={{
              minWidth: '92px',
              textAlign: 'right',
              color: 'color-mix(in oklab, var(--lux-accent) 70%, white 30%)',
              fontSize: '13px',
              fontWeight: 700,
            }}>
              Open →
            </div>
          </a>
        </div>

        {/* Back to Blog */}
        <div style={{ marginTop: '60px', textAlign: 'center' }}>
          <Link href={backHref} onClick={onBackClick} style={{
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
            {backLabel}
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

        /* Affiliate CTA card styling lives in app/globals.css so it applies site-wide. */
      `}</style>
    </div>
  );
}
