'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Calendar, User, ArrowLeft } from 'lucide-react';
import { staticBlogData, staticBlogPost } from '@/data/staticBlogData';

export default function BlogDetailPage({ params }) {
  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [slug, setSlug] = useState(null);
  const [scrollBoostSeed, setScrollBoostSeed] = useState(0);
  const articleRef = useRef(null);

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

  // Emulate hover for "Coming Next"/"Next Read" + blog WhatsApp CTA on scroll, and rename label.
  // Also: mobile-only tone-down of bright yellows inside blog content to premium gold.
  useEffect(() => {
    if (!post) return;
    if (typeof window === 'undefined') return;

    const root = articleRef.current || document;

    const isMobile = window.matchMedia
      ? window.matchMedia('(max-width: 768px), (hover: none) and (pointer: coarse)').matches
      : window.innerWidth <= 768;

    // Mobile-only: replace overly-bright yellows with premium matte gold in blog article.
    if (isMobile && articleRef.current) {
      // 1) Normalize inline styles that use bright yellows
      const styled = Array.from(articleRef.current.querySelectorAll('[style]'));
      styled.forEach((el) => {
        const s = el.getAttribute('style');
        if (!s) return;
        if (!/(#DAA520|#B8860B|rgba\(\s*218\s*,\s*165\s*,\s*32\s*,|rgba\(\s*184\s*,\s*134\s*,\s*11\s*,)/i.test(s)) return;

        const ns = s
          .replace(/#DAA520/gi, '#C0A062')
          .replace(/#B8860B/gi, '#C0A062')
          .replace(/rgba\(\s*218\s*,\s*165\s*,\s*32\s*,/gi, 'rgba(192, 160, 98,')
          .replace(/rgba\(\s*184\s*,\s*134\s*,\s*11\s*,/gi, 'rgba(192, 160, 98,');

        if (ns !== s) el.setAttribute('style', ns);
      });

      // 2) Make the FAQ block mobile-friendly (keep desktop untouched)
      const faqSections = Array.from(articleRef.current.querySelectorAll('section')).filter((sec) =>
        (sec.textContent || '').includes('Frequently Asked Questions')
      );
      faqSections.forEach((sec) => {
        // tighten spacing for mobile readability
        sec.style.padding = '28px 18px';
        sec.style.margin = '48px 0';
        // border-left color already normalized by the replace above (but enforce)
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
        <div style={{ color: '#B8860B', fontSize: '18px' }}>Loading...</div>
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
          color: '#B8860B',
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

  return (
    <div style={{ backgroundColor: '#0a0a0a', minHeight: '100vh', paddingTop: '100px' }}>
      {/* Hero Image */}
      {post.imageUrl && (
        <div style={{
          width: '100%',
          maxWidth: '1000px',
          margin: '0 auto 40px auto',
          padding: '0 20px'
        }}>
          <img
            src={post.imageUrl}
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
          color: '#B8860B',
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
            backgroundColor: 'rgba(184, 134, 11, 0.2)',
            color: '#B8860B',
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
            borderLeft: '3px solid #B8860B'
          }}>
            {post.excerpt}
          </p>
        )}

        {/* Content */}
        <div 
          style={{ color: '#e5e5e5', lineHeight: '1.8' }}
          dangerouslySetInnerHTML={{ 
            __html: typeof post.content === 'string' 
              ? post.content 
              : (Array.isArray(post.content) ? post.content.join('') : 'No content available.')
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
            backgroundColor: '#B8860B',
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
        }
      `}</style>
    </div>
  );
}
