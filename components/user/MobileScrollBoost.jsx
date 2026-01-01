/**
 * FILE: components\user\MobileScrollBoost.jsx
 * PURPOSE: (auto-added) Explain what this file does.
 * CATEGORY: user
 *
 * DEPENDENCIES:
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

import { useEffect, useRef, useState } from 'react';
import { useIsMobile } from '@/hooks/useIsMobile';

/**
 * MobileScrollBoost
 * - Mobile-only: triggers an â€œactiveâ€ class when element enters an eye-line band
 * - Uses IntersectionObserver + RAF-throttled scroll fallback (reliable across devices)
 * - Holds for holdMs then resets
 */
export default function MobileScrollBoost({
  as: Tag = 'div',
  className = '',
  activeClassName = 'is-scroll-boost',
  holdMs = 6000,
  bandTop = 0.42,
  bandBottom = 0.58,
  style,
  onTouchStart,
  children,
  ...rest
}) {
  const ref = useRef(null);
  const isMobile = useIsMobile();
  const [active, setActive] = useState(false);
  const cooldownRef = useRef(false);

  useEffect(() => {
    if (!isMobile) return;
    const el = ref.current;
    if (!el) return;

    const debug = false;
    const trigger = (label) => {
      if (cooldownRef.current) return;
      cooldownRef.current = true;
      // debug disabled
      setActive(true);
      window.setTimeout(() => {
        setActive(false);
        cooldownRef.current = false;
      }, holdMs);
    };

    const inEyeLine = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight || 0;
      const centerY = (rect.top + rect.bottom) / 2;
      const visible =
        vh > 0 &&
        centerY >= vh * bandTop &&
        centerY <= vh * bandBottom &&
        rect.bottom > 0 &&
        rect.top < vh;
      return visible;
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        if (!inEyeLine()) return;
        trigger('io');
      },
      { threshold: 0.1, rootMargin: '0px' }
    );

    observer.observe(el);

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        raf = 0;
        if (!inEyeLine()) return;
        trigger('scroll');
      });
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [isMobile, holdMs, bandTop, bandBottom]);

  const finalClassName = `${className}${isMobile && active ? ` ${activeClassName}` : ''}`.trim();

  return (
    <Tag
      ref={ref}
      className={finalClassName}
      style={style}
      onTouchStart={(e) => {
        if (isMobile) {
          setActive(true);
          window.setTimeout(() => setActive(false), holdMs);
        }
        onTouchStart?.(e);
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}





