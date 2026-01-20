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

import { Playfair_Display, Inter } from "next/font/google";
import { useEffect } from "react";
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
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({ children, buildId: buildIdProp }) {
  // Used only for deploy verification/debugging (no visual output)
  const buildId = buildIdProp || 'local';
  const pathname = usePathname();
  const isLaserPage = pathname === '/live-intelligence';
  const isClientPortal = pathname === '/client-portal';
  // Pages with their own custom footer - don't add global Footer
  const hasCustomFooter = isLaserPage || isClientPortal;

  useEffect(() => {
    // Opt-in reset for stale SW/caches that can cause hydration mismatches.
    // Visit any page with `?resetSW=1` (or `?reset-sw=1`) once.
    if (typeof window === 'undefined') return;

    const url = new URL(window.location.href);
    const params = url.searchParams;
    const shouldReset =
      params.get('resetSW') === '1' ||
      params.get('reset-sw') === '1' ||
      params.has('resetSW') ||
      params.has('reset-sw');

    if (!shouldReset) return;

    const run = async () => {
      try {
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          await Promise.all(registrations.map((r) => r.unregister()));
        }

        if ('caches' in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        }
      } catch (e) {
        // Swallow errors; this is a best-effort dev recovery path.
        console.warn('[resetSW] failed', e);
      } finally {
        params.delete('resetSW');
        params.delete('reset-sw');
        url.search = params.toString();
        window.location.replace(url.toString());
      }
    };

    run();
  }, []);

  const siteUrl = metadata.metadataBase?.toString?.() || "https://bmwealth.co.in";
  return (
    <html lang="en">
      <head>
        <meta name="x-ui-build" content={buildId} />

  {/* Google Analytics */}
  {GA4_MEASUREMENT_ID && (
            <>
              <script async src={`https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`} />
              <script
                dangerouslySetInnerHTML={{
                                __html: `
                                                window.dataLayer = window.dataLayer || [];
                                                                function gtag(){dataLayer.push(arguments);}
                                                                                gtag('js', new Date());
                                                                                                gtag('config', '${GA4_MEASUREMENT_ID}');
                                                                                                              `,
                }}
            />
              </>
                    )}
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
