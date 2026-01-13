/**
 * FILE: app/(public)/live-intelligence-hero/layout.js
 * PURPOSE: Isolated layout for Huly hero replica preview
 * CATEGORY: app
 */

export const metadata = {
  title: "Live Intelligence Hero | Preview",
  description: "Isolated Huly.io hero section replica for development preview",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#090a0c",
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
