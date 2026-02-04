import { buildMetadata, getMetadataBase } from '@/lib/seo/metadata';
import LearnBodyClass from './LearnBodyClass.client';

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
      <LearnBodyClass />

      {/* Hide main navbar and footer for this route */}
      <style>{`
        /*
          Learning Sanctuary must open with ONLY the ask box.
          We scope via a body/html class so it works consistently across browsers.
        */

        body.learn-universe {
          overflow: hidden !important;
          background: var(--li-background) !important;
        }

        body.learn-universe nav,
        body.learn-universe header,
        body.learn-universe footer,
        body.learn-universe [role="contentinfo"] {
          display: none !important;
        }

        /* Hide global floating UI on /learn (dock + chat float + consent) */
        body.learn-universe [aria-label="Open chat"],
        body.learn-universe [aria-label="WhatsApp Us Concierge"],
        body.learn-universe [data-cookie-consent],
        body.learn-universe .luxury-mobile-dock,
        body.learn-universe [data-luxury-dock],
        body.learn-universe .ai-chat-float {
          display: none !important;
        }

        .learn-universe-layout {
          min-height: 100vh;
          height: 100vh;
          background: var(--li-background);
        }
      `}</style>
      
      {children}
    </div>
  );
}
