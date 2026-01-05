"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function ResultSummary({ options = [], winnerKey = null, emphasizeWinner = false }) {
  if (options.length === 2) {
    const left = options[0];
    const right = options[1];
    const leftWinner = winnerKey && left.key === winnerKey;
    const rightWinner = winnerKey && right.key === winnerKey;

    const renderCard = (opt, isWinner) => (
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

    return (
      <div className="grid grid-cols-1 md:grid-cols-[1fr_72px_1fr] gap-4 md:gap-6 items-stretch animate-in fade-in">
        {renderCard(left, leftWinner)}

        <div className="hidden md:flex items-center justify-center" aria-hidden>
          <div className="h-14 w-14 rounded-full bg-[color:var(--color-matte-gold)] text-black font-extrabold flex items-center justify-center border border-black/40">
            VS
          </div>
        </div>

        {renderCard(right, rightWinner)}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in">
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
