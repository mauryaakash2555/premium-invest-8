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

'use client';

import { useEffect } from 'react';
import { Playfair_Display, Inter } from "next/font/google";
import { usePathname } from 'next/navigation';
import "./globals.css";
import Navigation from "@/components/user/Navigation";
import Footer from "@/components/user/Footer";
import WhatsAppFloat from "@/components/user/WhatsAppFloat";
import { LuxuryMobileDock } from "@/components/user/LuxuryMobileDock";
import CookieConsent from "@/components/shared/CookieConsent";
import { AnalyticsGate } from "@/components/analytics/AnalyticsGate";
import { metadata, schemaGraph } from "./metadata";

const GA4_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID?.trim() || null;

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  preload: true,
});

export default function RootLayout({ children, buildId: buildIdProp }) {
  // Used only for deploy verification/debugging (no visual output)
  const buildId = buildIdProp || 'local';
  const pathname = usePathname();
  const isLaserPage = pathname === '/live-intelligence';
  const isClientPortal = pathname === '/client-portal';
  // Pages with their own custom footer - don't add global Footer
  const hasCustomFooter = isLaserPage || isClientPortal;

  const siteUrl = metadata.metadataBase?.toString?.() || "https://bmwealth.co.in";

  // Defer GTM loading by 3 seconds for better LCP
  useEffect(() => {
    if (!GA4_MEASUREMENT_ID) return;
    const timer = setTimeout(() => {
      // Load gtag.js
      const script = document.createElement('script');
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`;
      script.async = true;
      document.head.appendChild(script);
      // Initialize gtag
      script.onload = () => {
        window.dataLayer = window.dataLayer || [];
        function gtag() { window.dataLayer.push(arguments); }
        gtag('js', new Date());
        gtag('config', GA4_MEASUREMENT_ID);
      };
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Register Service Worker for caching (improves repeat visits)
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.warn('[SW] Registration failed:', err);
      });
    }
  }, []);

  return (
    <html lang="en">
      <head>
        <meta name="x-ui-build" content={buildId} />

        {/* Preload LCP hero image (critical for PageSpeed) */}
        <link
          rel="preload"
          as="image"
          href="https://images.unsplash.com/photo-1666289158111-7576ce2ccfae?w=1920&h=1080&fit=crop&auto=format&fm=webp&q=75"
          fetchPriority="high"
        />

        {/* Preconnect hints for third-party resources (perf: saves ~300ms LCP) */}
        <link rel="preconnect" href="https://www.tradingview.com" />
        <link rel="preconnect" href="https://s.tradingview.com" />
        <link rel="preconnect" href="https://www.tradingview-widget.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#090A0C" />
      </head>
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph(siteUrl)) }}
        />
        <div
          className="main-wrapper"
          data-ui-build={buildId}
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
          {/* Only render global Footer if page doesn't have custom footer */}
          {!hasCustomFooter && <Footer />}
        </div>
        <LuxuryMobileDock />
        <WhatsAppFloat />
        <CookieConsent />
        <AnalyticsGate measurementId={GA4_MEASUREMENT_ID} />
      </body>
    </html>
  );

}
