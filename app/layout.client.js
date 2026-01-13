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

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isLaserPage = pathname === '/live-intelligence-hero';

  const siteUrl = metadata.metadataBase?.toString?.() || "https://bmwealth.co.in";
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph(siteUrl)) }}
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
          {/* Only render global Footer if not on laser page */}
          {!isLaserPage && <Footer />}
        </div>
        <LuxuryMobileDock />
        <WhatsAppFloat />
        <CookieConsent />
        <AnalyticsGate measurementId={GA4_MEASUREMENT_ID} />
      </body>
    </html>
  );

}
