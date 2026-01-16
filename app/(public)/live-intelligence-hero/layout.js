/**
 * FILE: app/(public)/live-intelligence-hero/layout.js
 * PURPOSE: Layout with SEO metadata for Live Intelligence page
 * CATEGORY: app
 */

export const metadata = {
  title: "Live Market Intelligence Dashboard | BM Wealth",
  description: "Real-time market intelligence, portfolio insights, signals and financial context. Educational, SEBI-safe dashboard by BM Wealth.",
  openGraph: {
    title: "Live Market Intelligence Dashboard | BM Wealth",
    description: "Real-time market intelligence, portfolio insights, signals and financial context. Educational, SEBI-safe dashboard by BM Wealth.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Live Market Intelligence Dashboard | BM Wealth",
    description: "Real-time market intelligence, portfolio insights, signals and financial context. Educational, SEBI-safe dashboard by BM Wealth.",
  },
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
