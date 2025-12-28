import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import { LuxuryMobileDock } from "@/components/LuxuryMobileDock";
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
  title: "BM Wealth - Mumbai's Distinguished Financial Advisory | Mutual Funds, SIP, PMS | ARN 90008",
  description: "BM Wealth offers expert investment advisory, mutual funds, SIP, portfolio management, and insurance services in Mumbai. IRDAI Licensed & AMFI Registered ARN 90008.",
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-32x32.png',
    apple: '/apple-touch-icon.png',
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
