"use client";

import { cn } from "@/lib/utils";

export type SIPTier = "story" | "learning" | "pro";

function TierCard(props: {
  title: string;
  subtitle: string;
  meta: string;
  active: boolean;
  onClick: () => void;
}) {
  const { title, subtitle, meta, active, onClick } = props;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-left rounded-2xl border p-4 sm:p-5 transition-colors",
        "ultra-luxury-glass gold-grain-texture",
        active
          ? "border-white/25 bg-[color:var(--lux-accent)] text-black"
          : "border-white/10 bg-black/20 text-white/85 hover:bg-black/30"
      )}
      aria-pressed={active}
    >
      <div className={cn("text-sm font-semibold", active ? "text-black" : "text-white/90")}>{title}</div>
      <div className={cn("mt-1 text-xs", active ? "text-black/80" : "text-white/65")}>{subtitle}</div>
      <div className={cn("mt-3 text-[11px] font-semibold tracking-wide", active ? "text-black/70" : "text-white/55")}>{meta}</div>
    </button>
  );
}

export function TierSelector(props: { tier: SIPTier; onChange: (tier: SIPTier) => void }) {
  const { tier, onChange } = props;

  return (
    <div className="mb-6 rounded-2xl border border-white/10 ultra-luxury-glass gold-grain-texture p-4 sm:p-5">
      <div className="flex flex-col gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white/90">Which one describes you best?</p>
          <p className="mt-0.5 text-xs text-white/65">Start simple, then open more detail if you want.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <TierCard
            title="🌱 Story Mode"
            subtitle="Learn through a story (kids + complete beginners)"
            meta="Time: ~3 min"
            active={tier === "story"}
            onClick={() => onChange("story")}
          />
          <TierCard
            title="📚 Learning Mode"
            subtitle="Understand the why (students + working adults)"
            meta="Time: ~5–7 min"
            active={tier === "learning"}
            onClick={() => onChange("learning")}
          />
          <TierCard
            title="🔬 Professional Mode"
            subtitle="All controls + details (CAs/CFPs/SEO)"
            meta="Time: 15+ min"
            active={tier === "pro"}
            onClick={() => onChange("pro")}
          />
        </div>
      </div>
    </div>
  );
}
