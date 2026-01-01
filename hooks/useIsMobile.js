'use client';
import { useState, useEffect } from 'react';

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const isNarrow = window.innerWidth < 768;
      const isTouch = window.matchMedia
        ? window.matchMedia('(hover: none), (pointer: coarse)').matches
        : false;
      setIsMobile(isNarrow || isTouch);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
}
