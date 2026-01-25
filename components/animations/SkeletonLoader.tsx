'use client';

import React from 'react';

type Variant = 'block' | 'text' | 'circle';

type Props = {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  className?: string;
  style?: React.CSSProperties;
  variant?: Variant;
  ariaBusy?: boolean;
};

export default function SkeletonLoader({
  width = '100%',
  height = 16,
  radius,
  className,
  style,
  variant = 'block',
  ariaBusy = true,
}: Props) {
  const borderRadius =
    radius ?? (variant === 'circle' ? '999px' : variant === 'text' ? '8px' : '12px');

  const computedHeight = variant === 'text' ? 12 : height;
  const computedWidth = variant === 'circle' ? height : width;

  return (
    <div
      aria-busy={ariaBusy}
      className={['li-skeleton', className].filter(Boolean).join(' ')}
      style={{
        width: computedWidth,
        height: computedHeight,
        borderRadius,
        ...style,
      }}
    />
  );
}
