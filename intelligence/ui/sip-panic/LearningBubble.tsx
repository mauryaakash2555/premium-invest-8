"use client";

import type { ReactNode } from "react";
import { useId, useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function LearningBubble(props: {
  title: string;
  children: ReactNode;
  disabled: boolean;
  onDisableChange: (disabled: boolean) => void;
}) {
  const { title, children, disabled, onDisableChange } = props;
  const id = useId();
  const [checked, setChecked] = useState(false);
  const PopoverContentAny = PopoverContent as any;

  if (disabled) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-white/15 bg-black/25 text-[12px] text-white/85 transition hover:border-white/25 hover:bg-black/35 focus:outline-none focus:ring-2 focus:ring-[oklch(0.78_0.08_65_/_0.30)]"
          aria-label={title}
        >
          i
        </button>
      </PopoverTrigger>
      <PopoverContentAny
        align="start"
        sideOffset={10}
        className="w-80 border border-white/10 ultra-luxury-glass gold-grain-texture text-white"
      >
        <div className="text-sm font-semibold gold-gradient-text">{title}</div>
        <div className="mt-2 text-xs text-white/80 leading-relaxed">{children}</div>

        <div className="mt-3 flex items-start gap-2">
          <Checkbox
            id={id}
            checked={checked}
            onCheckedChange={(v) => {
              const next = Boolean(v);
              setChecked(next);
              if (next) onDisableChange(true);
            }}
            className="mt-0.5 border-white/25 bg-black/20 data-[state=checked]:bg-[oklch(0.78_0.08_65)] data-[state=checked]:text-black data-[state=checked]:border-[oklch(0.78_0.08_65)]"
          />
          <Label htmlFor={id} className="text-[11px] text-white/70">
            Don’t show learning bubbles again
          </Label>
        </div>
      </PopoverContentAny>
    </Popover>
  );
}
