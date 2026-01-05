"use client";

import { Button } from "@/components/ui/button";

export function PremiumUnlockButton({ onClick }) {
  return (
    <Button
      onClick={onClick}
      className="calculator-premium-cta w-full py-6 rounded-xl text-lg"
    >
      Show Me How — ₹299
    </Button>
  );
}
