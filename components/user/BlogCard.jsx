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
    const fullBleedMobile = isMobile;
    const desktopHeroHeight = '400px';
    const desktopContentPadding = 'clamp(30px, 5vw, 50px)';
    const mobileCardHeight = 'clamp(360px, 54vh, 450px)';
    const mobileContentPadding = '18px 16px 22px';

    return (
      <Link href="/blog" style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}>
        <div
          ref={cardRef}
          className={`blog-card-premium blog-card-premium--home-mutual slide-up${mobileAnimating ? ' mutual-premium-pulse' : ''}`}
          onTouchStart={() => {
            if (!isMobile) return;
            setIsScrollAnimating(true);
            window.setTimeout(() => setIsScrollAnimating(false), 1000);
          }}
          style={{
            maxWidth: fullBleedMobile ? '100vw' : '900px',
            width: fullBleedMobile ? '100vw' : '100%',
            margin: fullBleedMobile ? 0 : '0 auto',
            marginLeft: fullBleedMobile ? 'calc(50% - 50vw)' : undefined,
            marginRight: fullBleedMobile ? 'calc(50% - 50vw)' : undefined,
            padding: 0,
            cursor: 'pointer',
            overflow: 'hidden',
            position: 'relative',
            borderRadius: fullBleedMobile ? 0 : undefined,
            height: fullBleedMobile ? mobileCardHeight : undefined,
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
                objectPosition: fullBleedMobile ? '50% 30%' : '62% 42%',
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

          {fullBleedMobile ? (
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 2,
                padding: mobileContentPadding,
                background: 'linear-gradient(180deg, rgba(0,0,0,0.00) 0%, rgba(0,0,0,0.68) 70%, rgba(0,0,0,0.86) 100%)',
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  height: 1,
                  width: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(214,179,106,0.62), transparent)',
                  marginBottom: 12,
                  opacity: 0.9,
                }}
              />

              <div
                style={{
                  display: 'inline-block',
                  padding: '6px 14px',
                  background: mobileAnimating ? 'rgba(255, 255, 255, 0.10)' : 'rgba(255, 255, 255, 0.06)',
                  borderRadius: '20px',
                  fontSize: '12.5px',
                  color: 'rgba(255,255,255,0.78)',
                  marginBottom: '14px',
                  fontWeight: 500,
                  border: '1px solid rgba(255,255,255,0.10)',
                  transition: 'all 0.5s ease',
                }}
              >
                {post.category}
              </div>

              <h3
                style={{
                  fontSize: 'clamp(20px, 5.4vw, 26px)',
                  color: '#FFFFFF',
                  marginBottom: '10px',
                  lineHeight: 1.22,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {post.title}
              </h3>

              <p
                style={{
                  fontSize: 'clamp(14px, 3.9vw, 16px)',
                  color: 'rgba(255,255,255,0.78)',
                  lineHeight: 1.6,
                  marginBottom: '14px',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {post.excerpt}
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'rgba(255, 255, 255, 0.75)', fontSize: '13.5px', fontWeight: 500 }}>
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
