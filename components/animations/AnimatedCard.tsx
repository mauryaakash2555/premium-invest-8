'use client';

import React from 'react';

type Props = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  animateIn?: boolean;
};

export default function AnimatedCard({ children, className, style, animateIn = true }: Props) {
  return (
    <div
      className={['li-card', 'hover-lift', 'li-card-glow', animateIn ? 'fade-in' : '', className]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      {children}
    </div>
  );
}
