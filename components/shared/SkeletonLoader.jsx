'use client';

/**
 * SkeletonLoader - Perceived performance improvement
 * 
 * Shows loading skeleton while content loads.
 * Matches the dark theme of BM Wealth.
 */

// Basic skeleton block with animation
function SkeletonBlock({ className = '', style = {} }) {
  return (
    <div
      className={`skeleton-block ${className}`}
      style={{
        background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.12) 50%, rgba(255,255,255,0.05) 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-shimmer 1.5s ease-in-out infinite',
        borderRadius: '8px',
        ...style,
      }}
    />
  );
}

// Card skeleton
export function CardSkeleton() {
  return (
    <div style={{ padding: '20px', background: 'rgba(20, 25, 35, 0.6)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
      <SkeletonBlock style={{ height: '24px', width: '60%', marginBottom: '16px' }} />
      <SkeletonBlock style={{ height: '14px', width: '100%', marginBottom: '8px' }} />
      <SkeletonBlock style={{ height: '14px', width: '85%', marginBottom: '8px' }} />
      <SkeletonBlock style={{ height: '14px', width: '70%' }} />
    </div>
  );
}

// Headline skeleton for Live Intelligence
export function HeadlineSkeleton() {
  return (
    <div style={{ padding: '18px 20px', background: 'rgba(20, 25, 35, 0.9)', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <SkeletonBlock style={{ height: '24px', width: '80px', borderRadius: '6px' }} />
        <SkeletonBlock style={{ height: '20px', width: '60px', borderRadius: '4px' }} />
        <div style={{ flex: 1 }} />
        <SkeletonBlock style={{ height: '16px', width: '50px' }} />
      </div>
      <SkeletonBlock style={{ height: '20px', width: '90%', marginBottom: '10px' }} />
      <SkeletonBlock style={{ height: '14px', width: '100%', marginBottom: '6px' }} />
      <SkeletonBlock style={{ height: '14px', width: '75%' }} />
    </div>
  );
}

// Hero section skeleton
export function HeroSkeleton() {
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '24px', padding: '40px' }}>
      <SkeletonBlock style={{ height: '48px', width: '300px', maxWidth: '80%' }} />
      <SkeletonBlock style={{ height: '24px', width: '500px', maxWidth: '90%' }} />
      <SkeletonBlock style={{ height: '50px', width: '180px', borderRadius: '25px' }} />
    </div>
  );
}

// Market ticker skeleton
export function TickerSkeleton() {
  return (
    <div style={{ height: '28px', display: 'flex', alignItems: 'center', gap: '24px', padding: '0 20px', overflow: 'hidden' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <SkeletonBlock style={{ height: '16px', width: '60px' }} />
          <SkeletonBlock style={{ height: '16px', width: '80px' }} />
          <SkeletonBlock style={{ height: '14px', width: '50px' }} />
        </div>
      ))}
    </div>
  );
}

// Default loading skeleton
export default function SkeletonLoader({ variant = 'default', count = 1 }) {
  const skeletons = {
    default: () => (
      <div style={{ padding: '16px' }}>
        <SkeletonBlock style={{ height: '32px', width: '60%', marginBottom: '16px' }} />
        <SkeletonBlock style={{ height: '16px', width: '100%', marginBottom: '8px' }} />
        <SkeletonBlock style={{ height: '16px', width: '90%', marginBottom: '8px' }} />
        <SkeletonBlock style={{ height: '16px', width: '75%' }} />
      </div>
    ),
    card: CardSkeleton,
    headline: HeadlineSkeleton,
    hero: HeroSkeleton,
    ticker: TickerSkeleton,
  };

  const SkeletonComponent = skeletons[variant] || skeletons.default;

  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonComponent key={i} />
      ))}
      <style jsx global>{`
        @keyframes skeleton-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </>
  );
}
