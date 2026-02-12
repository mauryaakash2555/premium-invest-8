"use client";

import { cn } from "@/lib/utils";

export type SIPTier = "story" | "learning" | "pro";

function TierCard(props: {
  title: string;
  label: string;
  subtitle: string;
  meta: string;
  active: boolean;
  onClick: () => void;
  icon: string;
}) {
  const { title, label, subtitle, meta, active, onClick, icon } = props;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative text-left rounded-2xl border p-4 sm:p-5 transition-all duration-200",
        "ultra-luxury-glass gold-grain-texture",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-[oklch(0.78_0.08_65)] focus-visible:ring-offset-2 focus-visible:ring-offset-black",
        active
          ? "border-[oklch(0.78_0.08_65)] bg-[oklch(0.78_0.08_65)] text-black shadow-[0_0_20px_rgba(192,160,98,0.3)] scale-[1.02]"
          : "border-white/10 bg-black/20 text-white/85 hover:bg-black/30 hover:border-white/20 hover:scale-[1.01]"
      )}
      aria-pressed={active}
      aria-label={`${label} - ${subtitle}`}
    >
      {/* Active indicator badge */}
      {active && (
        <div className="absolute -top-2 -right-2 bg-[color:var(--lux-accent)] text-black text-[9px] font-bold px-2 py-0.5 rounded-full shadow-lg">
          ✓ ACTIVE
        </div>
      )}
      
      {/* Icon + Label row */}
      <div className="flex items-center gap-2">
        <span className="text-xl" role="img" aria-hidden="true">{icon}</span>
        <span className={cn("text-sm font-bold", active ? "text-black" : "text-white")}>{label}</span>
      </div>
      
      <div className={cn("mt-2 text-xs leading-relaxed", active ? "text-black/80" : "text-white/65")}>{subtitle}</div>
      <div className={cn("mt-3 text-[11px] font-semibold tracking-wide flex items-center gap-1", active ? "text-black/70" : "text-white/55")}>
        <span>⏱</span> {meta}
      </div>
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

        {/* Default mode indicator */}
        <div className="mb-2 text-[10px] text-white/50">
          💡 Not sure? <span className="text-[oklch(0.78_0.08_65)] font-medium">Learning Mode</span> is the default and works for most people.
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="radiogroup" aria-label="Select experience mode">
          <TierCard
            icon="🌱"
            label="Story Mode"
            title="🌱 Story Mode"
            subtitle="Learn through a story (kids + complete beginners)"
            meta="~3 min"
            active={tier === "story"}
            onClick={() => onChange("story")}
          />
          <TierCard
            icon="📚"
            label="Learning Mode"
            title="📚 Learning Mode"
            subtitle="Understand the why (students + working adults)"
            meta="~5–7 min"
            active={tier === "learning"}
            onClick={() => onChange("learning")}
          />
          <TierCard
            icon="🔬"
            label="Pro Mode"
            title="🔬 Professional Mode"
            subtitle="All controls + details (CAs/CFPs/SEO)"
            meta="15+ min"
            active={tier === "pro"}
            onClick={() => onChange("pro")}
          />
        </div>
      </div>
    </div>
  );
}
