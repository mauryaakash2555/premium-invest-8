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
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";

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

export const metadata = {
  title: "BM Wealth - Mumbai's Distinguished Wealth Architecture | Mutual Funds, SIP, PMS | ARN 90008",
  description: "BM Wealth offers expert wealth distribution, mutual funds, SIP, portfolio curation, and insurance services in Mumbai. IRDAI Licensed & AMFI Registered ARN 90008.",
  icons: {
    icon: [
      { url: '/favicon.ico?v=2', sizes: 'any' },
      { url: '/favicon-32x32.png?v=2', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png?v=2', type: 'image/png', sizes: '16x16' },
    ],
    shortcut: ['/favicon-32x32.png?v=2'],
    apple: [
      { url: '/apple-touch-icon.png?v=2', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${inter.variable}`} style={{ backgroundColor: '#000', color: '#fff', margin: 0, overflowX: 'hidden', maxWidth: '100%', width: '100%' }}>
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



