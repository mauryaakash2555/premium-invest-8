"use client";

import { useMemo } from "react";

export function RupeeCoach(props: { message: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-start gap-3">
        <div className="text-xl leading-none" aria-hidden="true">
          🦉
        </div>
        <div className="min-w-0">
          <div className="text-xs font-semibold text-white/85">Rupee the Wise Owl</div>
          <div className="mt-1 text-[12px] text-white/70 leading-relaxed">{props.message}</div>
        </div>
      </div>
    </div>
  );
}

export function EmotionTracker(props: {
  step: 0 | 1 | 2;
  choice: "continue" | "stop" | "pause_6" | "pause_12";
}) {
  const { step, choice } = props;

  const state = useMemo(() => {
    if (step === 0) return { icon: "😊", label: "Calm" };
    if (step === 1) return { icon: "😰", label: "Storm" };

    if (choice === "continue") return { icon: "🎉", label: "Victory" };
    if (choice === "stop") return { icon: "😭", label: "Panic" };
    return { icon: "😰", label: "Paused" };
  }, [choice, step]);

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="text-[11px] font-semibold tracking-wide text-white/70 uppercase">Emotion tracker</div>
      <div className="mt-2 flex items-center gap-2 text-sm text-white/85">
        <span aria-hidden="true">{state.icon}</span>
        <span className="font-semibold">{state.label}</span>
      </div>
      <div className="mt-1 text-[11px] text-white/55">Helps beginners name the feeling before acting.</div>
    </div>
  );
}
