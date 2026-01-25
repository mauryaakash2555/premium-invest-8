'use client';

import React, { useMemo, useState, useEffect, useRef } from 'react';

/**
 * LazyTradingView - Intersection Observer wrapper for TradingView widgets
 * Only loads the heavy TradingView iframe when it's about to enter the viewport.
 * Saves ~2MB+ of third-party JS until actually needed.
 */
export default function LazyTradingView({
  children,
  minHeight = 400,
  rootMargin = '200px',
  placeholder = null,
  fallbackLoadAfterMs = 3000,
  contentKey = undefined,
  entryDelayMs = 80,
  loadingLabel = 'Loading chart…',
}) {
  const [shouldLoad, setShouldLoad] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const ref = useRef(null);
  const hasIframeRef = useRef(false);

  useEffect(() => {
    if (shouldLoad) return;

    if (typeof IntersectionObserver === 'undefined') {
      setShouldLoad(true);
      return;
    }

    const node = ref.current;
    if (!node) return;

    let fallbackTimer = null;
    if (typeof fallbackLoadAfterMs === 'number' && fallbackLoadAfterMs > 0) {
      fallbackTimer = setTimeout(() => setShouldLoad(true), fallbackLoadAfterMs);
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      if (fallbackTimer) clearTimeout(fallbackTimer);
    };
  }, [rootMargin, fallbackLoadAfterMs, shouldLoad]);

  useEffect(() => {
    if (!shouldLoad) {
      setIframeLoaded(false);
      return;
    }
    // When the embedded content changes (e.g., timeframe switch), re-show loader.
    setIframeLoaded(false);
  }, [shouldLoad, contentKey]);

  const enhancedChildren = useMemo(() => {
    let foundIframe = false;

    const enhance = (node) => {
      if (!React.isValidElement(node)) return node;

      if (node.type === 'iframe') {
        foundIframe = true;
        const existingOnLoad = node.props?.onLoad;
        const className = [node.props?.className, 'li-tv-iframe'].filter(Boolean).join(' ');
        return React.cloneElement(node, {
          className,
          onLoad: (e) => {
            setIframeLoaded(true);
            if (typeof existingOnLoad === 'function') existingOnLoad(e);
          },
        });
      }

      const childChildren = node.props?.children;
      if (!childChildren) return node;

      return React.cloneElement(node, {
        children: React.Children.map(childChildren, enhance),
      });
    };

    const next = React.Children.map(children, enhance);
    hasIframeRef.current = foundIframe;
    return next;
  }, [children]);

  const defaultPlaceholder = (
    <div className="li-tv-shell" style={{ minHeight }}>
      <div className="li-tv-skeleton" aria-hidden="true">
        <div className="li-tv-skeleton-bar" />
        <div className="li-tv-skeleton-grid" />
        <div className="li-tv-skeleton-caption">{loadingLabel}</div>
      </div>
    </div>
  );

  return (
    <div
      ref={ref}
      style={{ minHeight }}
      className={[
        'li-tv-shell',
        shouldLoad ? 'li-tv-mounted' : '',
        shouldLoad && iframeLoaded ? 'li-tv-loaded' : '',
      ].filter(Boolean).join(' ')}
    >
      {shouldLoad ? (
        <div
          className={['li-tv-entry', iframeLoaded ? 'li-tv-entry-in' : 'li-tv-entry-out'].join(' ')}
          style={{ ['--li-delay']: `${Math.max(0, Number(entryDelayMs) || 0)}ms` }}
        >
          {enhancedChildren}
        </div>
      ) : (placeholder || defaultPlaceholder)}

      {shouldLoad && hasIframeRef.current && !iframeLoaded && (
        <div className="li-tv-skeleton li-tv-skeleton-overlay" aria-hidden="true">
          <div className="li-tv-skeleton-bar" />
          <div className="li-tv-skeleton-grid" />
          <div className="li-tv-skeleton-caption">{loadingLabel}</div>
        </div>
      )}
    </div>
  );
}
