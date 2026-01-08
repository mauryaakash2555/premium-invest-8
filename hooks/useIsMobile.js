'use client';
import { useState, useEffect } from 'react';

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const params = new URLSearchParams(window.location.search);
      const forced = params.get('forceMobile') === '1' || params.get('mobile') === '1';

      // Prefer the most accurate viewport width for embedded WebViews (e.g. VS Code Simple Browser).
      const viewportWidth =
        (window.visualViewport && typeof window.visualViewport.width === 'number' ? window.visualViewport.width : 0) ||
        (document.documentElement && document.documentElement.clientWidth ? document.documentElement.clientWidth : 0) ||
        window.innerWidth;

      const isNarrow = viewportWidth < 768;
      const isTouch = window.matchMedia
        ? window.matchMedia('(hover: none), (pointer: coarse)').matches
        : false;

      setIsMobile(forced || isNarrow || isTouch);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}
