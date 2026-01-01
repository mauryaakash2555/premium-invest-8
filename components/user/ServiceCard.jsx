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

  return (
    <Link href={service.link} style={{ textDecoration: 'none', color: 'inherit' }}>
      <div
        ref={cardRef}
        className="service-card slide-up"
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
        }}
      >
        <div style={{ position: 'relative', width: '100%', height: '200px', marginBottom: '20px', borderRadius: '8px', overflow: 'hidden' }}>
          <Image
            src={service.image}
            alt={service.title}
            fill
            style={{ objectFit: 'cover' }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={index < 3}
          />
        </div>

        <div style={{ color: '#DAA520', marginBottom: '16px' }}>{service.icon}</div>

        <h3 style={{ fontSize: '24px', color: '#DAA520', marginBottom: '12px' }}>{service.title}</h3>

        <p style={{ fontSize: '16px', color: '#CCCCCC', lineHeight: 1.6, marginBottom: '16px' }}>{service.description}</p>

        <div
          className="learn-more-arrow"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            color: '#C0A062',
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
    </Link>
  );
}
