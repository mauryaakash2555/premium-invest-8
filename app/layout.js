import { Playfair_Display, Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

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
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${inter.variable}`} style={{ backgroundColor: '#000', color: '#fff', margin: 0 }}>
        <Navigation />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
