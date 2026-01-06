/**
 * FILE: app\layout.js
 * PURPOSE: (auto-added) Explain what this file does.
 * CATEGORY: app
 *
 * DEPENDENCIES:
 * - next/font/google
 * - @/components/user/Navigation
 * - @/components/user/Footer
 * - @/components/user/WhatsAppFloat
 * - @/components/user/LuxuryMobileDock
 * - @vercel/analytics/react
 * - @vercel/speed-insights/react
 *
 * USED BY:
 * - (search the repo for this filename)
 *
 * SIMPLE EXPLANATION:
 * This file is part of the app.
 * It helps one specific feature work correctly.
 *
 * TO MODIFY:
 * - 🔧 Search for "TO MODIFY" notes inside the file.
 */

import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/user/Navigation";
import Footer from "@/components/user/Footer";
import WhatsAppFloat from "@/components/user/WhatsAppFloat";
import { LuxuryMobileDock } from "@/components/user/LuxuryMobileDock";
import CookieConsent from "@/components/shared/CookieConsent";
import { AnalyticsGate } from "@/components/analytics/AnalyticsGate";
import { DEFAULT_OG_IMAGE, SITE_NAME, getMetadataBase } from "@/lib/seo/metadata";

const GA4_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID || "G-SSN64C0XCY";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadataBase = getMetadataBase();

export const metadata = {
  title: "BM Wealth — Educational Guides | Mutual Funds, SIP, Insurance",
  description: "Educational guides and tools on mutual funds, SIPs, insurance, and portfolio basics. Not SEBI-registered investment advice; no guarantees.",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
    ],
    shortcut: '/favicon-32x32.png',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: "BM Wealth — Educational Guides",
    description:
      "Educational guides and tools on mutual funds, SIPs, insurance, and portfolio basics. No investment advice; no guarantees.",
    url: "/",
    siteName: SITE_NAME,
    type: "website",
    locale: "en_IN",
    images: [{ url: DEFAULT_OG_IMAGE, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BM Wealth — Educational Guides",
    description:
      "Educational guides and tools on mutual funds, SIPs, insurance, and portfolio basics.",
    images: [DEFAULT_OG_IMAGE],
    },
};

export default function RootLayout({ children }) {
  const siteUrl = metadataBase?.toString?.() || "https://bmwealth.co.in";
  const schemaGraph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}#organization`,
        name: SITE_NAME,
        url: siteUrl,
        logo: `${siteUrl}/logo.png`,
        sameAs: [],
      },
      {
        "@type": "LocalBusiness",
        "@id": `${siteUrl}#localbusiness`,
        name: SITE_NAME,
        url: siteUrl,
        image: `${siteUrl}/logo.png`,
        telephone: "+91 88509 77259",
        address: {
          "@type": "PostalAddress",
          addressLocality: "Mumbai",
          addressRegion: "Maharashtra",
          addressCountry: "IN",
        },
        areaServed: "Mumbai",
        parentOrganization: { "@id": `${siteUrl}#organization` },
      },
    ],
  };
  return (
    <html lang="en">
      <body
        className={`${playfair.variable} ${inter.variable}`}
        style={{
          backgroundColor: "#000",
          color: "#fff",
          margin: 0,
          overflowX: "hidden",
          maxWidth: "100%",
          width: "100%",
        }}
      >
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }}
        />
        <div
          className="main-wrapper"
          style={{
            overflowX: "hidden",
            maxWidth: "100%",
            width: "100%",
            position: "relative",
          }}
        >
          <Navigation />
          <main style={{ overflowX: "hidden", maxWidth: "100%", width: "100%" }}>
            {children}
          </main>
          <Footer />
        </div>
        <LuxuryMobileDock />
        <WhatsAppFloat />
        <CookieConsent />
        <AnalyticsGate measurementId={GA4_MEASUREMENT_ID} />
      </body>
    </html>
  );

}



