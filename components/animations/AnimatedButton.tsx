'use client';

import React, { forwardRef, useCallback, useState } from 'react';
import LoadingSpinner from './LoadingSpinner';

type Variant = 'primary' | 'secondary' | 'tertiary';

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  loading?: boolean;
  icon?: React.ReactNode;
};

const VARIANT_CLASS: Record<Variant, string> = {
  primary: 'li-cta-primary',
  secondary: 'li-cta-secondary',
  tertiary: '',
};

const AnimatedButton = forwardRef<HTMLButtonElement, Props>(function AnimatedButton(
  { variant = 'primary', loading = false, disabled, children, className, icon, onPointerDown, ...rest },
  ref
) {
  const [rippling, setRippling] = useState(false);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent<HTMLButtonElement>) => {
      const btn = e.currentTarget;
      const rect = btn.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      btn.style.setProperty('--li-ripple-x', `${x}px`);
      btn.style.setProperty('--li-ripple-y', `${y}px`);
      setRippling(true);
      window.setTimeout(() => setRippling(false), 650);

      if (typeof onPointerDown === 'function') onPointerDown(e);
    },
    [onPointerDown]
  );

  const isDisabled = disabled || loading;

  return (
    <button
      ref={ref}
      type={rest.type ?? 'button'}
      disabled={isDisabled}
      onPointerDown={handlePointerDown}
      className={[
        'li-ripple',
        rippling ? 'li-ripple-animate' : '',
        VARIANT_CLASS[variant],
        'hover-lift',
        'smooth-transition',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        padding: '10px 14px',
        borderRadius: 12,
        border: variant === 'tertiary' ? '1px solid rgba(170,198,255,0.14)' : undefined,
        background: variant === 'tertiary' ? 'rgba(255,255,255,0.03)' : undefined,
        color: 'rgba(235,245,255,0.92)',
        fontWeight: 700,
        fontSize: 13,
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.85 : 1,
      }}
      {...rest}
    >
      {loading ? <LoadingSpinner size="sm" ariaLabel="Loading" /> : icon}
      <span style={{ display: 'inline-flex', alignItems: 'center' }}>{children}</span>
    </button>
  );
});

export default AnimatedButton;
