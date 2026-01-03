"use client";

export function PremiumBlock({ children }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 animate-in fade-in slide-in-from-bottom-2 transition-colors hover:bg-white/10 hover:border-white/20">
      {children}
    </div>
  );
}
