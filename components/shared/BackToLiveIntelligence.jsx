'use client';

import Link from 'next/link';

/**
 * BackToLiveIntelligence - A floating back button that links to the Live Intelligence overlay
 * Used on service pages to provide easy navigation back to the dashboard
 */
export default function BackToLiveIntelligence() {
  return (
    <>
      <Link
        href="/live-intelligence"
        className="back-to-li"
        aria-label="Back to Live Intelligence"
      >
        <svg 
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <polyline points="15 18 9 12 15 6" />
        </svg>
        <span>Live Intelligence</span>
      </Link>

      <style jsx>{`
        .back-to-li {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px 10px 12px;
          background: linear-gradient(180deg, rgba(20, 25, 35, 0.95) 0%, rgba(12, 14, 20, 0.98) 100%);
          border: 1px solid rgba(100, 160, 255, 0.25);
          border-radius: 999px;
          color: rgba(140, 190, 255, 0.95);
          font-size: 13px;
          font-weight: 500;
          text-decoration: none;
          letter-spacing: 0.01em;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35), 0 0 30px rgba(100, 160, 255, 0.08);
          backdrop-filter: blur(10px);
        }

        .back-to-li:hover {
          background: linear-gradient(180deg, rgba(25, 32, 45, 0.98) 0%, rgba(15, 18, 25, 0.99) 100%);
          border-color: rgba(100, 160, 255, 0.45);
          transform: translateX(-4px);
          box-shadow: 0 6px 24px rgba(0, 0, 0, 0.45), 0 0 40px rgba(100, 160, 255, 0.15);
        }

        .back-to-li svg {
          transition: transform 0.3s ease;
        }

        .back-to-li:hover svg {
          transform: translateX(-3px);
        }

        @media (max-width: 640px) {
          .back-to-li {
            padding: 8px 14px 8px 10px;
            font-size: 12px;
          }

          .back-to-li svg {
            width: 14px;
            height: 14px;
          }
        }
      `}</style>
    </>
  );
}
