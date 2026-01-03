"use client";

import { Button } from "@/components/ui/button";

export function PremiumUnlockButton({ onClick }) {
  return (
    <Button
      onClick={onClick}
      className="w-full py-6 rounded-xl bg-gradient-to-r from-[color:var(--color-matte-gold)] to-[color:var(--color-matte-gold)]/80 text-black text-lg shadow-[0_0_0_1px_rgba(192,160,98,0.35),0_0_30px_rgba(192,160,98,0.28)] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgba(192,160,98,0.5),0_0_45px_rgba(192,160,98,0.35)] active:translate-y-0 active:scale-[0.99]"
    >
      Get My Execution Plan — ₹299
    </Button>
  );
}
