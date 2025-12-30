'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';

export default function BlogCard({ post }) {
  const cardRef = useRef(null);
  const isMobile = useIsMobile();
  const [isScrollAnimating, setIsScrollAnimating] = useState(false);

  useEffect(() => {
    if (!isMobile) return;

    const el = cardRef.current;
    if (!el) return;

    const debug = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1';

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (debug) console.log('Blog card visible on mobile');
          setIsScrollAnimating(true);
          window.setTimeout(() => setIsScrollAnimating(false), 1000);
        }
      },
      { threshold: 0.3, rootMargin: '0px 0px -100px 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [isMobile]);

  const mobileAnimating = isMobile && isScrollAnimating;

  return (
    <div
      ref={cardRef}
      className="blog-card-premium"
      onTouchStart={() => {
        if (!isMobile) return;
        setIsScrollAnimating(true);
        window.setTimeout(() => setIsScrollAnimating(false), 1000);
      }}
      style={{
        maxWidth: '900px',
        margin: '0 auto',
        padding: 0,
        border: isMobile ? (mobileAnimating ? '2px solid rgba(198, 161, 91, 0.8)' : '2px solid rgba(198, 161, 91, 0.2)') : undefined,
        boxShadow: isMobile ? (mobileAnimating ? '0 0 30px rgba(198, 161, 91, 0.6)' : '0 0 0 rgba(198, 161, 91, 0)') : undefined,
        transition: isMobile ? 'all 0.5s ease' : undefined,
        cursor: 'pointer',
        overflow: 'hidden',
        willChange: isMobile ? 'border, box-shadow' : 'auto',
      }}
    >
      <Link href="/blog" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        <div>
          <img
            src={post.image_url || post.image}
            alt={post.image_alt || post.title}
            style={{
              width: '100%',
              height: 'auto',
              maxHeight: '400px',
              objectFit: 'cover',
              borderRadius: 0,
              display: 'block',
              marginBottom: 0,
              transform: isMobile ? (mobileAnimating ? 'scale(1.1)' : 'scale(1)') : undefined,
              transition: isMobile ? 'transform 0.8s ease' : undefined,
            }}
          />

          <div style={{ padding: 'clamp(30px, 5vw, 50px)' }}>
            <div
              style={{
                display: 'inline-block',
                padding: '6px 16px',
                background: isMobile ? (mobileAnimating ? 'rgba(192, 160, 98, 0.3)' : 'rgba(192, 160, 98, 0.15)') : 'rgba(192, 160, 98, 0.1)',
                borderRadius: '20px',
                fontSize: '14px',
                color: '#C0A062',
                marginBottom: '20px',
                fontWeight: 500,
                transition: isMobile ? 'all 0.5s ease' : undefined,
              }}
            >
              {post.category}
            </div>

            <h3 style={{ fontSize: 'clamp(24px, 4vw, 32px)', color: '#C0A062', marginBottom: '16px', lineHeight: 1.3 }}>
              {post.title}
            </h3>

            <p style={{ fontSize: 'clamp(16px, 2.5vw, 18px)', color: '#CCCCCC', lineHeight: 1.7, marginBottom: '24px' }}>
              {post.excerpt}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#C0A062', fontSize: '16px', fontWeight: 500 }}>
              <span>Read the full article</span>
              <span aria-hidden="true">→</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
