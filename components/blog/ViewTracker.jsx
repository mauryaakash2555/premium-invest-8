'use client';

import { useEffect, useRef } from 'react';

export default function ViewTracker({ postId, slug }) {
  const hasTracked = useRef(false);

  useEffect(() => {
    if (hasTracked.current || !postId) return;

    // Delay view tracking by 10 seconds to ensure genuine read
    const timer = setTimeout(async () => {
      try {
        // Use slug as fallback ID if postId not available
        const trackId = postId || slug;
        if (!trackId) return;

        const response = await fetch(`/api/track-view/${trackId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            slug,
            timestamp: new Date().toISOString(),
            referrer: document.referrer || 'direct',
            userAgent: navigator.userAgent
          })
        });

        if (response.ok) {
          hasTracked.current = true;
          console.log('[ViewTracker] View recorded for:', trackId);
        }
      } catch (error) {
        console.error('[ViewTracker] Error tracking view:', error);
      }
    }, 10000); // 10 second delay

    return () => clearTimeout(timer);
  }, [postId, slug]);

  // This component renders nothing
  return null;
}
