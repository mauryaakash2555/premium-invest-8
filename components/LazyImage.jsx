'use client';

import { useState } from 'react';

export default function LazyImage({ src, alt, className, style, ...props }) {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      style={{
        ...style,
        opacity: isLoaded ? 1 : 0,
        transition: 'opacity 0.3s ease-in-out',
      }}
      onLoad={() => setIsLoaded(true)}
      {...props}
    />
  );
}
