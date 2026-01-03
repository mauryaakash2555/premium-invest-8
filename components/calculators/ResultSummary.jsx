"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ResultSummary({ options = [], winnerKey = null, emphasizeWinner = false }) {
  return (
    <div className="grid grid-cols-2 gap-4 animate-in fade-in">
      {options.map((opt) => {
        const isWinner = winnerKey && opt.key === winnerKey;
        return (
          <Card
            key={opt.key}
            className={
              "bg-white/5 border relative glass-effect transition-transform duration-300 hover:-translate-y-0.5 premium-hover-glow " +
              (isWinner && emphasizeWinner
                ? "border-[color:var(--color-matte-gold)] bg-[color:color-mix(in oklab, var(--color-matte-gold) 8%, transparent)] ambient-glow-pulse"
                : isWinner
                  ? "border-[color:var(--color-matte-gold)]"
                  : "border-white/10")
            }
          >
            {isWinner ? (
              <Badge className="absolute -top-3 right-3 bg-[color:var(--color-matte-gold)] text-black ambient-glow-pulse">
                WINNER
              </Badge>
            ) : null}
            <CardContent className="p-4 space-y-2">
              <h3 className={"text-sm " + (opt.labelAccent ? "text-[color:var(--color-matte-gold)]" : "text-slate-200/70")}>
                {opt.label}
              </h3>

              <p className="text-xl font-semibold text-[color:var(--color-matte-gold)]">{opt.amount}</p>
              {opt.amountNote ? <p className="text-[11px] text-slate-200/60">{opt.amountNote}</p> : null}

              {opt.statusText ? (
                <p
                  className={
                    "text-[11px] leading-snug " +
                    (opt.statusTone === "good"
                      ? "text-emerald-200/80"
                      : opt.statusTone === "bad"
                        ? "text-rose-200/70"
                        : "text-slate-200/60")
                  }
                >
                  {opt.statusText}
                </p>
              ) : null}

              {opt.metaLines?.map((line) => (
                <p key={line} className="text-xs text-slate-200/60">
                  {line}
                </p>
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
