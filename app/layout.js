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
import Script from "next/script";
import { Suspense } from "react";
import "./globals.css";
import Navigation from "@/components/user/Navigation";
import Footer from "@/components/user/Footer";
import WhatsAppFloat from "@/components/user/WhatsAppFloat";
import { LuxuryMobileDock } from "@/components/user/LuxuryMobileDock";
import { GA4PageView } from "@/components/analytics/GA4PageView";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
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
  title: "BM Wealth - Mumbai's Distinguished Wealth Architecture | Mutual Funds, SIP, PMS | ARN 90008",
  description: "BM Wealth offers expert wealth distribution, mutual funds, SIP, portfolio curation, and insurance services in Mumbai. IRDAI Licensed & AMFI Registered ARN 90008.",
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
    title: "BM Wealth - Mumbai's Distinguished Wealth Architecture",
    description:
      "BM Wealth offers expert wealth distribution, mutual funds, SIP, portfolio curation, and insurance services in Mumbai.",
    url: "/",
    siteName: SITE_NAME,
    type: "website",
    locale: "en_IN",
    images: [{ url: DEFAULT_OG_IMAGE, alt: SITE_NAME }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BM Wealth - Mumbai's Distinguished Wealth Architecture",
    description:
      "Expert wealth distribution, mutual funds, SIP, and insurance services in Mumbai.",
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
      <body className={`${playfair.variable} ${inter.variable}`} style={{ backgroundColor: '#000', color: '#fff', margin: 0, overflowX: 'hidden', maxWidth: '100%', width: '100%' }}>
        {GA4_MEASUREMENT_ID ? (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script
              id="ga4-init"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `window.dataLayer = window.dataLayer || [];\nfunction gtag(){dataLayer.push(arguments);}\ngtag('js', new Date());\ngtag('config', '${GA4_MEASUREMENT_ID}', { send_page_view: false });`,
              }}
            />
            <Suspense fallback={null}>
              <GA4PageView measurementId={GA4_MEASUREMENT_ID} />
            </Suspense>
          </>
        ) : null}
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }}
        />
        <div className="main-wrapper" style={{ overflowX: 'hidden', maxWidth: '100%', width: '100%', position: 'relative' }}>
          <Navigation />
          <main style={{ overflowX: 'hidden', maxWidth: '100%', width: '100%' }}>{children}</main>
          <Footer />
        </div>
        <LuxuryMobileDock />
        <WhatsAppFloat />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}



