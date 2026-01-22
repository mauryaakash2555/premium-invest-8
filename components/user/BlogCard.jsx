/**
 * FILE: components\user\BlogCard.jsx
 * PURPOSE: (auto-added) Explain what this file does.
 * CATEGORY: user
 *
 * DEPENDENCIES:
 * - next/link
 * - react
 * - @/hooks/useIsMobile
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

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';
import { LaserBeam } from '@/components/ui/laser-beam';

export default function BlogCard({ post, variant = 'default' }) {
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

  if (variant === 'homeMutualStyle') {
    /**
     * HOME BLOG CARD SIZING (document for future reference):
     * -------------------------------------------------------
     * DESKTOP: maxWidth 900px, height auto (content-driven)
     * MOBILE:  height clamp(420px, 62vh, 520px), width 100% within container
     * Border radius: 16px desktop, 12px mobile
     */
    const desktopHeroHeight = '400px';
    const desktopContentPadding = 'clamp(30px, 5vw, 50px)';
    const mobileCardHeight = 'clamp(420px, 62vh, 520px)'; // BIGGER: was 360-450px
    const mobileContentPadding = '22px 20px 28px';

    return (
      <Link href="/blog" style={{ textDecoration: 'none', color: 'inherit', display: 'block', maxWidth: '900px', margin: '0 auto' }}>
        <LaserBeam
          width="100%"
          height={isMobile ? mobileCardHeight : 'auto'}
          color="var(--accent)"
          borderRadius={isMobile ? 12 : 16}
          duration={5}
          glowIntensity={20}
          beamLength={0.12}
          borderWidth={1}
          baseBorderWidth={0}
          backgroundColor="transparent"
          normalizeToSize
          normalizeBaseWidth={350}
          normalizeBaseHeight={220}
          normalizeBaseBorderRadius={16}
        >
          <div
            ref={cardRef}
            style={{
              width: '100%',
              padding: 0,
              cursor: 'pointer',
              overflow: 'hidden',
              position: 'relative',
              borderRadius: isMobile ? '12px' : '16px',
              height: '100%',
              background: '#0a0a0a',
            }}
          >
          {/* Editorial full-image background (covers entire card) */}
          <div aria-hidden="true" style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.image_url || post.image}
              alt=""
              className="blog-card-home-bg-img"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: isMobile ? '50% 30%' : '62% 42%',
                display: 'block',
              }}
            />
          </div>

          {/* Readability veil across whole card */}
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 1,
              pointerEvents: 'none',
              background:
                'linear-gradient(180deg, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0.45) 55%, rgba(0,0,0,0.78) 100%)',
            }}
          />

          {isMobile ? (
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 2,
                padding: mobileContentPadding,
                background: 'linear-gradient(180deg, rgba(0,0,0,0.00) 0%, rgba(0,0,0,0.72) 65%, rgba(0,0,0,0.92) 100%)',
              }}
            >
              {/* Category badge - premium glass style */}
              <div
                style={{
                  display: 'inline-block',
                  padding: '8px 16px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  backdropFilter: 'blur(8px)',
                  borderRadius: '6px',
                  fontSize: '11px',
                  color: 'rgba(255,255,255,0.85)',
                  marginBottom: '16px',
                  fontWeight: 600,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  border: '1px solid rgba(255,255,255,0.12)',
                }}
              >
                {post.category}
              </div>

              <h3
                style={{
                  fontSize: 'clamp(22px, 6vw, 28px)',
                  color: '#FFFFFF',
                  marginBottom: '12px',
                  lineHeight: 1.18,
                  fontWeight: 600,
                  letterSpacing: '-0.01em',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {post.title}
              </h3>

              <p
                style={{
                  fontSize: 'clamp(14px, 4vw, 16px)',
                  color: 'rgba(255,255,255,0.72)',
                  lineHeight: 1.55,
                  marginBottom: '18px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {post.excerpt}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', fontWeight: 500 }}>
                <span>Read the full article</span>
                <ArrowRight size={16} />
              </div>
            </div>
          ) : (
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div aria-hidden="true" style={{ height: desktopHeroHeight }} />

              <div
                style={{
                  padding: desktopContentPadding,
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.00) 0%, rgba(0,0,0,0.58) 100%)',
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    height: 1,
                    width: '100%',
                      background: 'linear-gradient(90deg, transparent, rgba(214,179,106,0.62), transparent)',
                    marginBottom: 14,
                    opacity: 0.9,
                  }}
                />

                <div
                  style={{
                    display: 'inline-block',
                    padding: '6px 16px',
                    background: 'rgba(255, 255, 255, 0.06)',
                    borderRadius: '20px',
                    fontSize: '13px',
                    color: 'rgba(255,255,255,0.78)',
                    marginBottom: '20px',
                    fontWeight: 500,
                    border: '1px solid rgba(255,255,255,0.10)',
                  }}
                >
                  {post.category}
                </div>

                <h3 style={{ fontSize: 'clamp(24px, 4vw, 32px)', color: '#FFFFFF', marginBottom: '16px', lineHeight: 1.25 }}>
                  {post.title}
                </h3>

                <p style={{ fontSize: 'clamp(16px, 2.5vw, 18px)', color: 'rgba(255,255,255,0.78)', lineHeight: 1.65, marginBottom: '24px' }}>
                  {post.excerpt}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255, 255, 255, 0.75)', fontSize: '14px', fontWeight: 500 }}>
                  <span>Read the full article</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            </div>
          )}
        </div>
        </LaserBeam>
      </Link>
    );
  }

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
        background: 'rgba(255,255,255,0.03)',
        border: isMobile
          ? (mobileAnimating
            ? '1px solid color-mix(in oklab, var(--lux-accent) 38%, rgba(255,255,255,0.10))'
            : '1px solid rgba(255,255,255,0.10)')
          : '1px solid rgba(255,255,255,0.10)',
        boxShadow: isMobile
          ? (mobileAnimating
            ? '0 22px 90px rgba(0,0,0,0.70)'
            : '0 12px 45px rgba(0,0,0,0.45)')
          : '0 12px 45px rgba(0,0,0,0.45)',
        transition: isMobile ? 'all 0.5s ease' : undefined,
        cursor: 'pointer',
        overflow: 'hidden',
        borderRadius: 0,
        willChange: isMobile ? 'border, box-shadow' : 'auto',
      }}
    >
      <Link href="/blog" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        <div>
          {/* Dynamic remote images may not be in next/image allowlist; keep <img>. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
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
                background: isMobile
                  ? (mobileAnimating
                    ? 'color-mix(in oklab, var(--lux-accent) 18%, transparent)'
                    : 'rgba(255,255,255,0.03)')
                  : 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: 0,
                fontSize: '14px',
                color: 'var(--lux-accent)',
                marginBottom: '20px',
                fontWeight: 500,
                transition: isMobile ? 'all 0.5s ease' : undefined,
              }}
            >
              {post.category}
            </div>

            <h3 style={{ fontSize: 'clamp(24px, 4vw, 32px)', color: 'var(--lux-accent)', marginBottom: '16px', lineHeight: 1.3 }}>
              {post.title}
            </h3>

            <p style={{ fontSize: 'clamp(16px, 2.5vw, 18px)', color: '#CCCCCC', lineHeight: 1.7, marginBottom: '24px' }}>
              {post.excerpt}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--lux-accent)', fontSize: '16px', fontWeight: 500 }}>
              <span>Read the full article</span>
              <span aria-hidden="true">→</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
