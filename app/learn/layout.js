import { buildMetadata, getMetadataBase } from '@/lib/seo/metadata';

export const metadata = buildMetadata({
  title: 'Learning Universe | BM Wealth',
  description:
    'Enter the Learning Universe - a transformative journey to understand how money, markets, and minds work together. Not a course. A thinking upgrade.',
  path: '/learn',
});

/**
 * 🌌 LEARNING UNIVERSE LAYOUT
 * 
 * This is a STANDALONE route - no main navbar, no footer interference.
 * The learning experience should feel like entering a separate world.
 */
export default function LearnLayout({ children }) {
  return (
    <div
      className="learn-universe-layout"
      style={{
        // Override any global styles
        isolation: 'isolate',
      }}
    >
      {/* Hide main navbar and footer for this route */}
      <style>{`
        /*
          Learning Sanctuary must open with ONLY the ask box.
          We scope this using :has(.learn-universe-layout) so it applies immediately
          (no client effect needed) and does not leak to other routes.
        */

        body:has(.learn-universe-layout) {
          overflow: hidden !important;
          background: #090A0C !important;
        }

        body:has(.learn-universe-layout) nav,
        body:has(.learn-universe-layout) header,
        body:has(.learn-universe-layout) footer,
        body:has(.learn-universe-layout) [role="contentinfo"] {
          display: none !important;
        }

        /* Hide global floating UI on /learn (dock + chat float + consent) */
        body:has(.learn-universe-layout) [aria-label="Open chat"],
        body:has(.learn-universe-layout) [aria-label="WhatsApp Us Concierge"],
        body:has(.learn-universe-layout) [data-cookie-consent],
        body:has(.learn-universe-layout) .luxury-mobile-dock,
        body:has(.learn-universe-layout) [data-luxury-dock],
        body:has(.learn-universe-layout) .ai-chat-float {
          display: none !important;
        }

        .learn-universe-layout {
          min-height: 100vh;
          height: 100vh;
          background: #090A0C;
        }
      `}</style>
      
      {children}
    </div>
  );
}
