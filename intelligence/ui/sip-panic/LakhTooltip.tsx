"use client";

import { useMemo, useState } from "react";

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const TooltipContentAny = TooltipContent as any;

const inr0 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function formatLakhsText(amount: number, decimals: number): string {
  const v = Number.isFinite(amount) ? amount : 0;
  return `₹${(v / 100_000).toFixed(decimals)}L`;
}

export function LakhTooltip(props: {
  amount: number;
  decimals?: number;
  className?: string;
  prefix?: string;
}) {
  const { amount, decimals = 2, className, prefix } = props;

  const [open, setOpen] = useState(false);

  const { short, full } = useMemo(() => {
    const v = Number.isFinite(amount) ? amount : 0;
    return {
      short: formatLakhsText(v, decimals),
      full: inr0.format(Math.round(v)),
    };
  }, [amount, decimals]);

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip open={open} onOpenChange={setOpen}>
        <TooltipTrigger asChild>
          <span
            tabIndex={0}
            onClick={() => setOpen((v) => !v)}
            onBlur={() => setOpen(false)}
            className={
              className ??
              "inline-flex items-center gap-1 tabular-nums cursor-help underline decoration-white/20 underline-offset-4 hover:decoration-white/40 focus:outline-none focus:ring-2 focus:ring-white/15 rounded"
            }
          >
            {prefix ? <span>{prefix}</span> : null}
            <span>{short}</span>
          </span>
        </TooltipTrigger>
        <TooltipContentAny side="top" className="border border-white/10 bg-black/90 text-white/90">
          <div className="text-[11px] text-white/85 tabular-nums">
            {short} = {full}
          </div>
        </TooltipContentAny>
      </Tooltip>
    </TooltipProvider>
  );
}

export function formatLakhsInlineText(amount: number, decimals: number = 2): string {
  return formatLakhsText(amount, decimals);
}
