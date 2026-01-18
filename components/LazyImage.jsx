'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function LazyImage({ src, alt, className, style, priority = false, width, height, fill = true, ...props }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div style={{ position: 'relative', overflow: 'hidden', ...style }}>
      {/* Loading skeleton - always shown until loaded */}
      {!isLoaded && !hasError && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(90deg, rgba(30,30,30,1) 0%, rgba(50,50,50,1) 50%, rgba(30,30,30,1) 100%)',
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.2s ease-in-out infinite',
            borderRadius: style?.borderRadius || '8px',
            zIndex: 1,
          }}
        />
      )}
      
      {/* Actual Image */}
      {!hasError && (
        <Image
          src={src}
          alt={alt || ''}
          className={className}
          fill={fill && !width && !height}
          width={!fill || width ? (width || 400) : undefined}
          height={!fill || height ? (height || 300) : undefined}
          style={{
            objectFit: 'cover',
            opacity: isLoaded ? 1 : 0,
            transition: 'opacity 0.5s ease-in-out',
            zIndex: 2,
          }}
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          priority={priority}
          {...props}
        />
      )}

      {/* Error fallback */}
      {hasError && (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(40,40,40,1)',
            color: 'rgba(192,160,98,0.6)',
            fontSize: '14px',
            borderRadius: style?.borderRadius || '8px',
          }}
        >
          Image unavailable
        </div>
      )}

      {/* Shimmer animation */}
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}
