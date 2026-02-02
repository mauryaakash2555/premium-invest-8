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
        /* Hide the main site navbar */
        .learn-universe-layout ~ header,
        .learn-universe-layout ~ nav,
        body > header,
        body > nav,
        #main-navbar,
        .main-navbar,
        [data-navbar="main"] {
          display: none !important;
        }
        
        /* Hide main site footer */
        .learn-universe-layout ~ footer,
        body > footer:not(.laser-footer),
        #main-footer,
        .main-footer,
        [data-footer="main"] {
          display: none !important;
        }
        
        /* Reset any overflow issues */
        .learn-universe-layout {
          min-height: 100vh;
          background: #090A0C;
        }
      `}</style>
      
      {children}
    </div>
  );
}
