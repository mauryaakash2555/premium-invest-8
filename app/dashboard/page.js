/**
 * FILE: app\dashboard\page.js
 * PURPOSE: (auto-added) Explain what this file does.
 * CATEGORY: app
 *
 * DEPENDENCIES:
 * - @/data/blog.json
 * - @/data/products.json
 * - @/data/sipPlans.json
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

import Link from "next/link";
import { MessageCircle } from "lucide-react";
import { buildMetadata } from "@/lib/seo/metadata";

const PATH = "/dashboard";
const WHATSAPP_HREF = "https://wa.me/918850977259?text=Hi%20BM%20Wealth%2C%20I%20would%20like%20to%20request%20dashboard%20access.";

export const metadata = {
  ...buildMetadata({
    title: "Dashboard | BM Wealth",
    description: "Private dashboard access is being prepared by BM Wealth.",
    path: PATH,
    robots: { index: false, follow: false },
  }),
};

export default function DashboardPage() {
  return (
    <section className="relative overflow-hidden rounded-none border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.045)_0%,rgba(255,255,255,0.015)_100%)] p-6 md:p-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at top right, rgba(192,160,98,0.16), transparent 35%), radial-gradient(circle at bottom left, rgba(255,255,255,0.06), transparent 32%)",
        }}
      />

      <div className="relative mx-auto max-w-2xl text-center">
        <p className="text-xs uppercase tracking-[0.24em] text-[--lux-foreground-60]">Dashboard Access</p>
        <h1 className="mt-4 text-3xl font-semibold text-[--lux-foreground] md:text-4xl">Client Portal Coming Soon</h1>
        <p className="mt-4 text-base leading-7 text-[--lux-foreground-60]">
          Our client portal is being prepared. Contact us via WhatsApp for account access.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a
            href={WHATSAPP_HREF}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-none border border-[--lux-accent] bg-[--lux-accent] px-5 py-3 text-sm font-semibold text-[--lux-background] transition hover:brightness-110"
          >
            <MessageCircle className="h-4 w-4" />
            Contact on WhatsApp
          </a>
          <Link
            href="/"
            className="inline-flex items-center rounded-none border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-[--lux-foreground] transition hover:border-white/20 hover:bg-white/10"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </section>
  );
}

