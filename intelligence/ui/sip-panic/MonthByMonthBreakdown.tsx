"use client";

import { useMemo, useState } from "react";

import type { ChartDataPoint } from "@/intelligence/simulations/sip-vs-panic";
import { trackEvent } from "@/lib/analytics";

const inr0 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function formatInr0(amount: number): string {
  const v = Number.isFinite(amount) ? amount : 0;
  return inr0.format(Math.round(Math.max(0, v)));
}

function formatMonth(d: Date | null | undefined): string {
  if (!d) return "";
  try {
    return new Intl.DateTimeFormat("en-IN", { month: "short", year: "numeric" }).format(d);
  } catch {
    return "";
  }
}

type SeriesKey = "discipline" | "panic20" | "panic40" | "anyFall" | "custom" | "invested";

function valueForKey(row: ChartDataPoint, k: SeriesKey): number {
  if (k === "discipline") return row.perfectDisciplineValue ?? 0;
  if (k === "panic20") return row.panic20Value ?? 0;
  if (k === "panic40") return row.panic40Value ?? 0;
  if (k === "invested") return row.investedAmount ?? 0;
  if (k === "anyFall") return Number((row as any).anyFallValue ?? 0);
  if (k === "custom") return Number((row as any).customValue ?? 0);
  return 0;
}

function statusForKey(row: ChartDataPoint, k: SeriesKey): "active" | "paused" | null {
  const s = row.sipStatus as any;
  if (!s) return null;
  if (k === "discipline") return s.discipline ?? null;
  if (k === "panic20") return s.panic20 ?? null;
  if (k === "panic40") return s.panic40 ?? null;
  if (k === "anyFall") return s.anyFall ?? null;
  if (k === "custom") return s.custom ?? null;
  return null;
}

export function MonthByMonthBreakdown(props: {
  data: ChartDataPoint[];
  show: Record<SeriesKey, boolean>;
  labels: Record<SeriesKey, string>;
  defaultRows?: number;
}) {
  const { data, show, labels, defaultRows = 36 } = props;

  const [expanded, setExpanded] = useState(false);

  const columns = useMemo(() => {
    const ordered: SeriesKey[] = ["invested", "discipline", "panic20", "panic40", "anyFall", "custom"];
    return ordered.filter((k) => show[k]);
  }, [show]);

  const rows = expanded ? data : data.slice(0, Math.max(12, Math.min(defaultRows, data.length)));

  return (
    <div className="rounded-2xl border border-white/10 ultra-luxury-glass gold-grain-texture p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold gold-gradient-text-static">Month-by-month breakdown</h3>
          <p className="mt-1 text-xs text-white/75">Invested vs portfolio value for each behavior (education-only).</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              try {
                const header = [
                  "month_number",
                  "month",
                  "market_index",
                  "market_drawdown_pct",
                  "invested_inr",
                  "discipline_inr",
                  "discipline_sip_status",
                  "panic20_inr",
                  "panic20_sip_status",
                  "panic40_inr",
                  "panic40_sip_status",
                  "anyFall_inr",
                  "anyFall_sip_status",
                  "custom_inr",
                  "custom_sip_status",
                ];

                const lines = [header.join(",")];
                for (const r of data) {
                  const line = [
                    String(r.monthNumber ?? ""),
                    JSON.stringify(formatMonth(r.date)),
                    String(Number.isFinite(r.marketIndex) ? r.marketIndex : ""),
                    String(Number.isFinite(r.marketDrawdown) ? r.marketDrawdown : ""),
                    String(Math.round(r.investedAmount ?? 0)),
                    String(Math.round(r.perfectDisciplineValue ?? 0)),
                    String((r.sipStatus as any)?.discipline ?? ""),
                    String(Math.round(r.panic20Value ?? 0)),
                    String((r.sipStatus as any)?.panic20 ?? ""),
                    String(Math.round(r.panic40Value ?? 0)),
                    String((r.sipStatus as any)?.panic40 ?? ""),
                    String(Math.round(((r as any).anyFallValue ?? 0) as number)),
                    String((r.sipStatus as any)?.anyFall ?? ""),
                    String(Math.round(((r as any).customValue ?? 0) as number)),
                    String((r.sipStatus as any)?.custom ?? ""),
                  ];
                  lines.push(line.join(","));
                }

                const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "sip-vs-panic-monthly-breakdown.csv";
                document.body.appendChild(a);
                a.click();
                a.remove();
                URL.revokeObjectURL(url);

                trackEvent("sip_vs_panic_monthly_csv_downloaded", {
                  calculator_type: "sip_vs_panic_selling",
                  rows: data.length,
                });
              } catch {
                // ignore
              }
            }}
            className="min-h-11 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-[11px] text-white/80 hover:border-white/15"
          >
            Download CSV
          </button>

          <button
            type="button"
            onClick={() => {
              setExpanded((v) => !v);
              try {
                trackEvent("sip_vs_panic_monthly_breakdown_toggled", {
                  calculator_type: "sip_vs_panic_selling",
                  expanded: !expanded,
                });
              } catch {
                // ignore
              }
            }}
            className="min-h-11 rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-[11px] text-white/85 hover:border-white/15"
          >
            {expanded ? "Show less" : `Show all (${data.length})`}
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-white/10 bg-black/20">
        <table className="min-w-[980px] w-full text-sm">
          <thead className="text-[11px] uppercase tracking-wide text-white/60">
            <tr className="border-b border-white/10">
              <th className="text-left px-4 py-3">Month</th>
              <th className="text-left px-4 py-3">Date</th>
              <th className="text-right px-4 py-3">Drawdown</th>
              {columns.map((k) => (
                <th key={k} className="text-right px-4 py-3">{labels[k]}</th>
              ))}
            </tr>
          </thead>
          <tbody className="text-white/85">
            {rows.map((r) => {
              const dd = Number.isFinite(r.marketDrawdown) ? r.marketDrawdown : 0;
              const ddColor = dd <= -20 ? "text-[color:var(--lux-accent)]" : dd <= -10 ? "text-white/80" : "text-white/75";

              return (
                <tr key={String(r.monthNumber)} className="border-b border-white/5">
                  <td className="px-4 py-3 text-white/75 tabular-nums">{r.monthNumber}</td>
                  <td className="px-4 py-3 text-white/75">{formatMonth(r.date)}</td>
                  <td className={`px-4 py-3 text-right tabular-nums ${ddColor}`}>{dd.toFixed(1)}%</td>

                  {columns.map((k) => {
                    const v = valueForKey(r, k);
                    const status = statusForKey(r, k);
                    const isPaused = status === "paused";
                    const className = isPaused ? "text-white/80" : "text-white/90";
                    const badge = status ? (
                      <span
                        className={
                          isPaused
                            ? "ml-2 inline-flex items-center rounded-full border border-white/10 bg-black/30 px-2 py-0.5 text-[10px] text-white/60"
                            : "ml-2 inline-flex items-center rounded-full border border-white/15 bg-white/5 px-2 py-0.5 text-[10px] text-[color:var(--lux-accent)]"
                        }
                      >
                        {isPaused ? "paused" : "active"}
                      </span>
                    ) : null;

                    return (
                      <td key={k} className={`px-4 py-3 text-right tabular-nums ${className}`}>
                        <span>{formatInr0(v)}</span>
                        {badge}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-3 text-[11px] text-white/60">
        Tip: use CSV to do your own analysis in Sheets.
      </div>
    </div>
  );
}
