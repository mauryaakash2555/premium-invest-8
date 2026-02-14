"use client";

import { Button } from "@/components/ui/button";

export function PremiumUnlockButton({ href }) {
  const finalHref = String(href || "https://store.bmwealth.co.in").trim();

  return (
    <Button
      asChild
      className="calculator-premium-cta w-full py-6 rounded-xl text-lg"
    >
      <a href={finalHref} target="_blank" rel="noopener noreferrer">
        Go to Store →
      </a>
    </Button>
  );
}
