'use client';

import React from 'react';

type Size = 'sm' | 'md' | 'lg';

type Props = {
  size?: Size;
  color?: string;
  ariaLabel?: string;
  className?: string;
};

const SIZE_PX: Record<Size, number> = {
  sm: 14,
  md: 18,
  lg: 24,
};

export default function LoadingSpinner({
  size = 'md',
  color = 'rgba(235, 245, 255, 0.9)',
  ariaLabel = 'Loading',
  className,
}: Props) {
  const px = SIZE_PX[size] ?? SIZE_PX.md;

  return (
    <span
      role="status"
      aria-label={ariaLabel}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: px,
        height: px,
      }}
    >
      <span
        className="spin gpu-accelerated"
        aria-hidden="true"
        style={{
          width: px,
          height: px,
          borderRadius: 999,
          border: `2px solid rgba(255,255,255,0.18)`,
          borderTopColor: color,
          boxSizing: 'border-box',
        }}
      />
    </span>
  );
}
