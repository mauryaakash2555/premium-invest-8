import Link from "next/link";

import { buildMetadata } from "@/lib/seo/metadata";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = buildMetadata({
  title: "Intelligence | BM Wealth",
  description:
    "BM Wealth Intelligence — simulation engine powering advanced India-first financial tools.",
  path: "/intelligence",
});

export default function IntelligencePage() {
  return (
    <main className="px-6 lg:px-10 py-14 lg:py-20">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-semibold gold-gradient-text">
          Intelligence
        </h1>
        <p className="mt-4 text-sm sm:text-base text-white/75">
          Tools here are powered by our simulation engine (market patterns, behavior, costs, and simplified India-first tax).
        </p>

        <div className="mt-8 grid grid-cols-1 gap-4">
          <Card className="border border-white/10 ultra-luxury-glass premium-hover-glow rounded-none overflow-hidden">
            <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="min-w-0">
                <h2 className="text-base font-semibold gold-gradient-text truncate">SIP vs Panic Selling</h2>
                <p className="mt-1 text-sm text-white/70">
                  See what stopping your SIP during a crash really costs (post-tax) — with timeline + drawdown visualization.
                </p>
              </div>
              <Link href="/intelligence/sip-vs-panic" className="shrink-0 inline-flex">
                <Button className="calculator-premium-cta">Open Simulator</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
