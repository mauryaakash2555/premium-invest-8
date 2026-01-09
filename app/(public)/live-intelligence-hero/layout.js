/**
 * FILE: app/(public)/live-intelligence-hero/layout.js
 * PURPOSE: Isolated layout for Huly hero replica preview
 * CATEGORY: app
 *
 * This layout provides Huly-specific viewport and theme settings
 * without affecting the main site layout.
 */

export const metadata = {
  title: "Live Intelligence Hero | Preview",
  description: "Isolated Huly.io hero section replica for development preview",
  themeColor: "#090a0c",
  viewport: {
    width: "device-width",
    initialScale: 1,
    viewportFit: "cover",
  },
};

export default function LiveIntelligenceHeroLayout({ children }) {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#090a0c",
        WebkitFontSmoothing: "antialiased",
        MozOsxFontSmoothing: "grayscale",
      }}
    >
      {children}
    </div>
  );
}
