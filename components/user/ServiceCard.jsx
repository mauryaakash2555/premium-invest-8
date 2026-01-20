/**
 * FILE: components\user\ServiceCard.jsx
 * PURPOSE: (auto-added) Explain what this file does.
 * CATEGORY: user
 *
 * DEPENDENCIES:
 * - next/link
 * - next/image
 * - lucide-react
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

﻿'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';

export default function ServiceCard({ service, index = 0 }) {
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
          if (debug) console.log('Service card visible on mobile');
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
  const imagePresentation = service?.imagePresentation;
  const imageFit = imagePresentation?.fit === 'contain' ? 'contain' : 'cover';
  const imageBoxHeight = imageFit === 'contain' ? '240px' : '200px';
  const imageBoxPadding = typeof imagePresentation?.padding === 'number' ? `${imagePresentation.padding}px` : '0px';
  const isMutualFunds = service?.key === 'mutual-funds';
  const isPortfolioManagement = service?.key === 'portfolio-management';
  const isInsurance = service?.key === 'insurance';
  const isTradingServices = service?.key === 'trading-services';
  const isFixedDeposits = service?.key === 'fixed-deposits';
  const isSip = service?.key === 'sip';
  const isPremiumImageCard = isMutualFunds || isPortfolioManagement || isInsurance || isTradingServices || isFixedDeposits || isSip;
  const premiumObjectPosition = imagePresentation?.objectPosition || (isPortfolioManagement ? '50% 50%' : '62% 42%');
  const premiumImageClassName = `mutual-bg-image${isPortfolioManagement ? ' mutual-bg-image--pms' : ''}`;

  return (
    <Link href={service.link} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div
        ref={cardRef}
        className={`service-card slide-up${isPremiumImageCard ? ' service-card--mutual' : ''}${
          isPremiumImageCard && mobileAnimating ? ' mutual-premium-pulse' : ''
        }`}
        onMouseOver={(e) => {
          // Desktop unchanged
          if (isMobile) return;
          e.currentTarget.style.transform = 'translateY(-8px)';
        }}
        onMouseOut={(e) => {
          if (isMobile) return;
          e.currentTarget.style.transform = 'translateY(0)';
        }}
        onTouchStart={() => {
          // Mobile: trigger even if user taps
          if (!isMobile) return;
          setIsScrollAnimating(true);
          window.setTimeout(() => setIsScrollAnimating(false), 1000);
        }}
        style={{
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          transform: mobileAnimating ? 'translateY(-8px)' : undefined,
          boxShadow: mobileAnimating ? '0 12px 40px rgba(198, 161, 91, 0.35)' : undefined,
          willChange: isMobile ? 'transform, box-shadow' : 'auto',
          position: 'relative',
          // Keep mobile exactly as-is; restore desktop height for premium image cards.
          minHeight: isPremiumImageCard
            ? isMobile
              ? 'clamp(360px, 54vh, 450px)'
              : '420px'
            : undefined,
        }}
      >
        {isPremiumImageCard ? (
          <>
            {/* Full-card image (Premium image cards) */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 0,
              }}
            >
              <Image
                src={service.image}
                alt=""
                fill
                quality={typeof imagePresentation?.quality === 'number' ? imagePresentation.quality : 90}
                className={premiumImageClassName}
                style={{
                  objectFit: 'cover',
                  objectPosition: premiumObjectPosition,
                }}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={index < 3}
              />
            </div>

            {/* Mobile/scroll premium glow pulse (Premium image cards) */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 0,
                pointerEvents: 'none',
                opacity: isMobile ? (mobileAnimating ? 1 : 0) : 0,
                transition: 'opacity 320ms ease',
                background:
                  'radial-gradient(70% 55% at 50% 75%, rgba(255,255,255,0.10) 0%, rgba(0,0,0,0) 60%), radial-gradient(45% 35% at 35% 30%, color-mix(in oklab, var(--lux-accent) 12%, transparent) 0%, rgba(0,0,0,0) 62%)',
                boxShadow:
                  'inset 0 0 0 1px rgba(255,255,255,0.16), 0 22px 70px rgba(0,0,0,0.55), 0 0 26px color-mix(in oklab, var(--lux-accent) 10%, transparent)',
              }}
            />
            {/* Minimal readability veil (keeps text exactly the same; does not change global colors) */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                zIndex: 0,
                background: 'linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.55) 100%)',
              }}
            />

            {/* Text on image (Premium image cards). Icon removed. */}
            <div style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
              <h3
                style={{
                  fontSize: isMobile ? '20px' : '22px',
                  color: '#FFFFFF',
                  marginBottom: '10px',
                  fontWeight: 600,
                  ...(isMobile
                    ? {
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }
                    : null),
                }}
              >
                {service.title}
              </h3>
              <p
                style={{
                  fontSize: isMobile ? '15px' : '16px',
                  color: '#CCCCCC',
                  lineHeight: 1.6,
                  marginBottom: '16px',
                  ...(isMobile
                    ? {
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }
                    : null),
                }}
              >
                {service.description}
              </p>
              <div
                className="learn-more-arrow"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  color: 'rgba(255, 255, 255, 0.75)',
                  fontSize: '14px',
                  fontWeight: 500,
                  transform: mobileAnimating ? 'translateX(5px)' : undefined,
                  opacity: mobileAnimating ? 1 : 0.7,
                  transition: 'all 0.3s ease',
                }}
              >
                <span>Learn More</span>
                <ArrowRight size={16} />
              </div>
            </div>
          </>
        ) : (
          <>
            <div
              style={{
                position: 'relative',
                width: '100%',
                height: imageBoxHeight,
                marginBottom: '16px',
                borderRadius: '10px',
                overflow: 'hidden',
                backgroundColor: imageFit === 'contain' ? '#0a0a0a' : 'transparent',
                border: imageFit === 'contain' ? '1px solid rgba(255,255,255,0.08)' : 'none',
              }}
            >
              <Image
                src={service.image}
                alt={service.title}
                fill
                quality={typeof imagePresentation?.quality === 'number' ? imagePresentation.quality : undefined}
                style={{
                  objectFit: imageFit,
                  padding: imageFit === 'contain' ? imageBoxPadding : undefined,
                  ...(imagePresentation?.style || {}),
                }}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority={index < 3}
              />
            </div>

            <div style={{ color: 'rgba(255, 255, 255, 0.85)', marginBottom: '12px' }}>{service.icon}</div>

            <h3 style={{ fontSize: '22px', color: '#FFFFFF', marginBottom: '10px', fontWeight: 600 }}>{service.title}</h3>

            <p style={{ fontSize: '16px', color: '#CCCCCC', lineHeight: 1.6, marginBottom: '16px' }}>{service.description}</p>

            <div
              className="learn-more-arrow"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'rgba(255, 255, 255, 0.75)',
                fontSize: '14px',
                fontWeight: 500,
                transform: mobileAnimating ? 'translateX(5px)' : undefined,
                opacity: mobileAnimating ? 1 : 0.7,
                transition: 'all 0.3s ease',
              }}
            >
              <span>Learn More</span>
              <ArrowRight size={16} />
            </div>
          </>
        )}
      </div>
    </Link>
  );
}
