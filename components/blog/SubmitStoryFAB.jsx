'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SubmitStoryFAB() {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Show FAB after scrolling down 300px
    const handleScroll = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const media = window.matchMedia('(max-width: 768px)');
    const update = () => setIsMobile(Boolean(media.matches));
    update();

    if (typeof media.addEventListener === 'function') {
      media.addEventListener('change', update);
      return () => media.removeEventListener('change', update);
    }

    media.addListener(update);
    return () => media.removeListener(update);
  }, []);

  // Don't show on contact/submit pages
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    if (path.includes('/contact') || path.includes('/submit')) {
      return null;
    }
  }

  return (
    <div 
      className={`fixed bottom-6 right-6 z-50 transition-all duration-300 ${
        isVisible ? 'translate-y-0 opacity-100' : 'translate-y-16 opacity-0 pointer-events-none'
      }`}
      style={{
        // Keep clear of the fixed 3D bot in the bottom-right corner.
        bottom: isMobile
          ? 'calc(var(--li-mobile-dock-clearance, 72px) + env(safe-area-inset-bottom) + 160px)'
          : 'calc(28px + 220px)',
        right: isMobile ? 'calc(env(safe-area-inset-right) + 20px)' : '28px',
      }}
    >
      {/* Expanded Panel */}
      <div 
        className={`absolute bottom-16 right-0 mb-2 transition-all duration-200 ${
          isExpanded 
            ? 'opacity-100 translate-y-0' 
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="border border-[color:var(--lux-foreground-10)] bg-[color:var(--lux-card)]/55 backdrop-blur-xl p-5 shadow-[0_28px_90px_rgba(0,0,0,0.75)] w-72">
          <div className="text-[10px] tracking-[0.5em] uppercase font-semibold text-[color:var(--lux-foreground-60)]">Next step</div>
          <h4 className="mt-4 text-[18px] leading-snug font-medium text-[color:var(--lux-foreground-80)]">
            Do you have a story to share?
          </h4>
          <p className="mt-3 text-[13px] leading-[1.85] tracking-wide font-light text-[color:var(--lux-foreground-60)]">
            Share an investment insight, a lesson learned, or a question on your mind. We may feature it on our blog.
          </p>
          <Link
            href="/contact?type=story"
            className="group relative mt-4 inline-flex w-full items-center justify-center overflow-hidden bg-[color:var(--lux-foreground)] text-[color:var(--lux-background)] px-5 py-3 no-underline"
          >
            <span className="relative z-10 flex items-center gap-4 text-[10px] tracking-[0.25em] uppercase font-semibold">
              Share your story
              <span aria-hidden="true">→</span>
            </span>
            <span
              className="absolute inset-0 bg-[color:var(--lux-accent)] -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-700"
              aria-hidden="true"
            />
          </Link>
        </div>
      </div>

      {/* FAB Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="group relative overflow-hidden bg-[color:var(--lux-foreground)] text-[color:var(--lux-background)] px-6 py-4 shadow-[0_26px_90px_rgba(0,0,0,0.8)] transition-transform duration-300 hover:-translate-y-0.5"
        aria-label="Submit your story"
      >
        <span className="relative z-10 flex items-center gap-4 text-[10px] tracking-[0.25em] uppercase font-semibold whitespace-nowrap">
          {isExpanded ? 'Close' : 'Share your story'}
          <span aria-hidden="true">→</span>
        </span>

        <span
          className="absolute inset-0 bg-[color:var(--lux-accent)] -translate-x-[101%] group-hover:translate-x-0 transition-transform duration-700"
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
