"use client";

import { Button } from "@/components/ui/button";

export function PremiumUnlockButton({ onClick }) {
  return (
    <Button
      onClick={onClick}
      className="bm-btn bm-btn-primary w-full py-6 rounded-xl text-lg"
    >
      Get My Execution Plan — ₹299
    </Button>
  );
}
