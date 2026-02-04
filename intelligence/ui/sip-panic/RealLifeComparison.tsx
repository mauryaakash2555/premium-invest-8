"use client";

import { useMemo, useState } from "react";

function clampInt(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.round(n)));
}

function formatCr(amount: number): string {
  const v = Math.max(0, Number.isFinite(amount) ? amount : 0);
  const cr = v / 10_000_000;
  return `₹${cr.toFixed(2)} Cr`;
}

function formatForSpeech(amount: number): string {
  const v = Math.max(0, Number.isFinite(amount) ? amount : 0);
  if (v >= 10_000_000) return `${(v / 10_000_000).toFixed(2)} crore rupees`;
  if (v >= 100_000) return `${(v / 100_000).toFixed(2)} lakh rupees`;
  return `${Math.round(v)} rupees`;
}

export function RealLifeComparison(props: { amount: number; title?: string }) {
  const amount = Number.isFinite(props.amount) ? props.amount : 0;
  const [speaking, setSpeaking] = useState(false);

  const items = useMemo(() => {
    // Simple, illustrative equivalents (education-only).
    const housesTier2 = clampInt(amount / 17_500_000, 0, 20);
    const fortuners = clampInt(amount / 5_000_000, 0, 99);
    const europeTrips = clampInt(amount / 500_000, 0, 999);
    const collegeYears = clampInt(amount / 1_000_000, 0, 99);

    return [
      { icon: "🏠", text: `${housesTier2 || 1} homes in a tier-2 city`, highlight: housesTier2 >= 1 },
      { icon: "🚗", text: `${fortuners || 1} luxury family cars`, highlight: fortuners >= 1 },
      { icon: "✈️", text: `${europeTrips || 1} international vacations`, highlight: europeTrips >= 5 },
      { icon: "🎓", text: `${collegeYears || 1} years of premium education`, highlight: collegeYears >= 2 },
    ];
  }, [amount]);

  const handleSpeak = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }

    const amountText = formatForSpeech(amount);
    const comparisons = items.map(it => it.text).join(', or ');
    const fullText = `You could lose ${amountText}. That's equivalent to ${comparisons}.`;
    
    const utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = 'en-IN';
    utterance.rate = 0.9;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="mt-4 rounded-2xl border border-[oklch(0.78_0.08_65/0.3)] bg-[oklch(0.10_0.02_264)] p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[11px] font-semibold tracking-wide text-[oklch(0.78_0.08_65)] uppercase">
          {props.title || `What ${formatCr(amount)} could buy`}
        </div>
        <button
          type="button"
          onClick={handleSpeak}
          className="flex items-center gap-1 rounded-lg border border-[oklch(0.78_0.08_65/0.3)] bg-[oklch(0.15_0.02_264)] px-2 py-1 text-[10px] text-[oklch(0.80_0.08_65)] hover:bg-[oklch(0.18_0.02_264)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.78_0.08_65)]"
          aria-label={speaking ? "Stop reading" : "Read aloud"}
        >
          {speaking ? "🔇 Stop" : "🔊 Read"}
        </button>
      </div>
      {/* Responsive grid: 2 cols on mobile, 4 on desktop */}
      <div className="mt-3 grid grid-cols-2 gap-2">
        {items.map((it) => (
          <div 
            key={it.icon + it.text} 
            className={`rounded-xl border px-3 py-3 text-center transition-all ${
              it.highlight 
                ? 'border-[oklch(0.78_0.08_65/0.4)] bg-[oklch(0.78_0.08_65/0.08)]' 
                : 'border-[oklch(0.78_0.08_65/0.15)] bg-[oklch(0.08_0.01_264)]'
            }`}
          >
            <div className="text-2xl" role="img" aria-label={it.text}>{it.icon}</div>
            <div className="mt-1 text-[10px] sm:text-[11px] leading-tight text-[oklch(0.85_0.05_65)]">{it.text}</div>
          </div>
        ))}
      </div>
      <div className="mt-2 text-[10px] text-[oklch(0.50_0.02_264)]">
        Illustrative comparisons to build intuition (not actual prices).
      </div>
    </div>
  );
}
