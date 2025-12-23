import Link from "next/link";
import MobileNavDock from "./components/MobileNavDock";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/login", label: "Login" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/blog", label: "Blog" },
  { href: "/products", label: "Products" },
  { href: "/sip-calculator", label: "SIP Calculator" },
];

export const metadata = {
  title: "BM Wealth Next",
  description: "Next.js 15 sandbox for BM Wealth with demo routes.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-950 text-slate-50`}
      >
        <div className="mx-auto max-w-6xl px-4 py-6">
          <header className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-blue-500/10 backdrop-blur">
            <div className="text-lg font-semibold tracking-tight">
              BM Wealth Next
            </div>
            <nav className="flex flex-wrap gap-2 text-sm">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-lg border border-white/10 px-3 py-2 transition hover:border-white/40 hover:bg-white/10"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </header>
          <main className="mt-8 space-y-8">{children}</main>
        </div>
                            <MobileNavDock />
      </body>
    </html>
  );
}
