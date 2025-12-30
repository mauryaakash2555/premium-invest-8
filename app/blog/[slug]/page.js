'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import { staticBlogData, staticBlogPost } from '@/data/staticBlogData';

function isMobileViewport() {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia) {
    return window.matchMedia('(max-width: 768px), (hover: none) and (pointer: coarse)').matches;
  }
  return window.innerWidth <= 768;
}

function normalizeBlogHtmlForPremium(html) {
  if (typeof html !== 'string') return html;
  // Convert "bright yellow" accents into premium matte gold across blog HTML.
  return html
    .replace(/#DAA520/gi, '#C0A062')
    .replace(/#B8860B/gi, '#C0A062')
    .replace(/rgba\(\s*218\s*,\s*165\s*,\s*32\s*,/gi, 'rgba(192, 160, 98,')
    .replace(/rgba\(\s*184\s*,\s*134\s*,\s*11\s*,/gi, 'rgba(192, 160, 98,');
}

export default function BlogDetailPage({ params }) {
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [slug, setSlug] = useState(null);
  const [scrollBoostSeed, setScrollBoostSeed] = useState(0);
  const articleRef = useRef(null);
  const [isMobile, setIsMobile] = useState(false);
  const [readProgress, setReadProgress] = useState(0); // 0..1
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    // Handle Next.js 15 params (Promise)
    Promise.resolve(params).then(resolvedParams => {
      setSlug(resolvedParams.slug);
    });
  }, [params]);

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

  // Emulate hover for "Coming Next"/"Next Read" + blog WhatsApp CTA on scroll, and rename label.
  // Also: mobile-only tone-down of bright yellows inside blog content to premium gold.
  useEffect(() => {
    if (!post) return;
    if (typeof window === 'undefined') return;

    const root = articleRef.current || document;

    // Mobile-only: make the FAQ block mobile-friendly (keep desktop untouched)
    if (isMobile && articleRef.current) {
      const faqSections = Array.from(articleRef.current.querySelectorAll('section')).filter((sec) =>
        (sec.textContent || '').includes('Frequently Asked Questions')
      );
      faqSections.forEach((sec) => {
        sec.style.padding = '28px 18px';
        sec.style.margin = '48px 0';
        sec.style.borderLeftColor = 'rgba(192, 160, 98, 0.75)';
      });
    }
    const comingBlocks = Array.from(root.querySelectorAll('.coming-next-block'));
    const waCtas = Array.from(root.querySelectorAll('.whatsapp-cta-btn'));

    // Rename label text (content already live, so it's not "coming next" anymore)
    comingBlocks.forEach((block) => {
      const label = block.querySelector('p');
      if (!label) return;
      const txt = (label.textContent || '').trim();
      if (txt === 'Coming Next:' || txt === 'Coming Next') {
        label.textContent = 'Next Read:';
      }
    });

    if (comingBlocks.length === 0 && waCtas.length === 0) return;

    const timeouts = new Map();
    const pulse = (el, ms = 2800) => {
      if (!el) return;
      el.classList.add('is-scroll-boost');
      const prev = timeouts.get(el);
      if (prev) window.clearTimeout(prev);
      const t = window.setTimeout(() => {
        el.classList.remove('is-scroll-boost');
        timeouts.delete(el);
      }, ms);
      timeouts.set(el, t);
    };

    const targets = [...comingBlocks, ...waCtas];
    const cleanups = [];

    const inEyeLine = (el) => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 0;
      const centerY = (rect.top + rect.bottom) / 2;
      return (
        vh > 0 &&
        rect.bottom > 0 &&
        rect.top < vh &&
        // Wider band so it reliably triggers while scrolling
        centerY >= vh * 0.30 &&
        centerY <= vh * 0.80
      );
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target;
          if (!inEyeLine(el)) return;
          pulse(el);
        });
      },
      { threshold: 0.08, rootMargin: '0px' }
    );

    targets.forEach((el) => observer.observe(el));

    // Hover/tap fallback: if CSS hover is blocked by wrapping links or browser quirks,
    // force the same visual by toggling the class.
    const addHoverHandlers = (el) => {
      const onEnter = () => pulse(el, 1800);
      const onDown = () => pulse(el, 2200);
      el.addEventListener('mouseenter', onEnter);
      el.addEventListener('focus', onEnter);
      el.addEventListener('pointerdown', onDown);
      cleanups.push(() => {
        el.removeEventListener('mouseenter', onEnter);
        el.removeEventListener('focus', onEnter);
        el.removeEventListener('pointerdown', onDown);
      });
    };

    targets.forEach(addHoverHandlers);

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        targets.forEach((el) => {
          if (!inEyeLine(el)) return;
          pulse(el, 2200);
        });
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      if (raf) window.cancelAnimationFrame(raf);
      timeouts.forEach((t) => window.clearTimeout(t));
      timeouts.clear();
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
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', paddingTop: '100px' }}>
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
              height: '3px',
              zIndex: 10002,
              background: 'rgba(0,0,0,0.35)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${Math.round(readProgress * 100)}%`,
                background: 'linear-gradient(90deg, rgba(192,160,98,0.15), rgba(192,160,98,0.95), rgba(255,255,255,0.25))',
                boxShadow: '0 0 18px rgba(192,160,98,0.55)',
                transition: 'width 120ms linear',
              }}
            />
          </div>

          {showBackToTop && (
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              style={{
                position: 'fixed',
                left: 14,
                bottom: 110, // above dock
                zIndex: 10002,
                borderRadius: 999,
                border: '1px solid rgba(192,160,98,0.45)',
                background: 'rgba(0,0,0,0.75)',
                color: '#C0A062',
                padding: '10px 12px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 10,
                boxShadow: '0 0 24px rgba(192,160,98,0.25)',
                backdropFilter: 'blur(10px)',
                cursor: 'pointer',
                transition: 'transform 200ms ease, box-shadow 200ms ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 0 34px rgba(192,160,98,0.35)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 0 24px rgba(192,160,98,0.25)';
              }}
              aria-label="Back to top"
            >
              <span style={{ fontSize: 12, fontWeight: 800, letterSpacing: 0.5 }}>
                {Math.round(readProgress * 100)}%
              </span>
              <span style={{ fontSize: 12, opacity: 0.85 }}>Top</span>
            </button>
          )}
        </>
      )}

      {/* Hero Image */}
      {heroImage && (
        <div style={{
          width: '100%',
          maxWidth: '1000px',
          margin: '0 auto 40px auto',
          padding: '0 20px'
        }}>
          <img
            src={heroImage}
            alt={post.title}
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '500px',
              objectFit: 'cover',
              borderRadius: '12px'
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
          color: '#fff',
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
        }
      `}</style>
    </div>
  );
}
