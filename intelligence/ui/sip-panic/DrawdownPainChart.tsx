"use client";

import type { ReactNode } from "react";
import { useMemo, useRef, useState } from "react";

import type { ChartDataPoint } from "@/intelligence/simulations/sip-vs-panic";

function clamp(n: number, min: number, max: number): number {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, n));
}

function formatPct(n: number): string {
  const v = Number.isFinite(n) ? n : 0;
  return `${v.toFixed(0)}%`;
}

function formatMonthLabel(i: number): string {
  const month = i + 1;
  const year = Math.floor((month - 1) / 12) + 1;
  const monthInYear = ((month - 1) % 12) + 1;
  return `Month ${month} (Year ${year}, Month ${monthInYear})`;
}

export function DrawdownPainChart(props: {
  data: ChartDataPoint[];
  title?: string;
  subtitle?: string;
  headerRight?: ReactNode;
}) {
  const { data, title, subtitle, headerRight } = props;

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const series = useMemo(() => {
    if (!data.length) return { maxPain: 0, points: [] as number[] };
    const points = data.map((d) => Math.abs(Number.isFinite(d.marketDrawdown) ? d.marketDrawdown : 0));
    const maxPain = points.reduce((m, v) => Math.max(m, v), 0);
    return { maxPain, points };
  }, [data]);

  const width = 760;
  const height = 180;
  const padX = 18;
  const padY = 16;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  // Keep a stable reference scale so the “pain zones” don’t collapse/overlap
  // on mild drawdown paths.
  const scaleMax = Math.max(40, series.maxPain, 1);

  const path = useMemo(() => {
    const pts = series.points;
    if (!pts.length) return "";
    const max = scaleMax;

    const xFor = (i: number) => padX + (i / Math.max(1, pts.length - 1)) * innerW;
    const yFor = (v: number) => padY + (1 - clamp(v / max, 0, 1)) * innerH;

    let d = `M ${xFor(0)} ${yFor(pts[0])}`;
    for (let i = 1; i < pts.length; i += 1) d += ` L ${xFor(i)} ${yFor(pts[i])}`;
    const baseY = padY + innerH;
    d += ` L ${xFor(pts.length - 1)} ${baseY} L ${xFor(0)} ${baseY} Z`;
    return d;
  }, [series.points, innerW, innerH, padX, padY, scaleMax]);

  const maxPainLabel = useMemo(() => formatPct(series.maxPain), [series.maxPain]);

  const hover = useMemo(() => {
    if (hoverIndex === null) return null;
    if (!data.length) return null;
    const i = clamp(hoverIndex, 0, Math.max(0, data.length - 1));
    const v = Math.abs(Number.isFinite(data[i]?.marketDrawdown) ? (data[i]?.marketDrawdown as number) : 0);
    const x = padX + (i / Math.max(1, data.length - 1)) * innerW;
    const y = padY + (1 - clamp(v / scaleMax, 0, 1)) * innerH;
    const label = data[i]?.date
      ? data[i].date.toLocaleDateString?.("en-IN", { month: "short", year: "numeric" }) ?? ""
      : "";
    return {
      i,
      x,
      y,
      value: v,
      label: label || formatMonthLabel(i),
    };
  }, [data, hoverIndex, innerW, innerH, padX, padY, scaleMax]);

  const setHoverFromClientX = (clientX: number) => {
    const el = wrapRef.current;
    if (!el || !data.length) return;
    const rect = el.getBoundingClientRect();
    const x = clamp(clientX - rect.left, 0, rect.width);
    const ratio = rect.width <= 1 ? 0 : x / rect.width;
    const i = Math.round(ratio * Math.max(1, data.length - 1));
    setHoverIndex(clamp(i, 0, data.length - 1));
  };

  const onPointerMove = (evt: React.PointerEvent) => setHoverFromClientX(evt.clientX);
  const onPointerDown = (evt: React.PointerEvent) => setHoverFromClientX(evt.clientX);
  const onMouseMove = (evt: React.MouseEvent) => setHoverFromClientX(evt.clientX);
  const onTouchMove = (evt: React.TouchEvent) => {
    const t = evt.touches?.[0];
    if (!t) return;
    setHoverFromClientX(t.clientX);
  };
  const onTouchStart = (evt: React.TouchEvent) => {
    const t = evt.touches?.[0];
    if (!t) return;
    setHoverFromClientX(t.clientX);
  };

  return (
    <section className="wealth-chart-container gold-grain-texture p-6 sm:p-10">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold gold-gradient-text-static">{title ?? "Drawdown Pain (Market)"}</h3>
          <p className="mt-1 text-xs text-white/70">
            {subtitle ?? "How deep the market goes below its previous peak during the journey."}
          </p>
        </div>
        <div className="shrink-0 flex items-start gap-2">
          {headerRight}
          <div className="rounded-xl border border-white/10 bg-black/25 px-3 py-2">
            <div className="text-[11px] text-white/60">Max drawdown</div>
            <div className="mt-1 font-semibold text-white/90 tabular-nums">{maxPainLabel}</div>
          </div>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <div ref={wrapRef} className="min-w-[720px] relative">
          <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label="Market drawdown over time"
            onPointerMove={onPointerMove}
            onPointerDown={onPointerDown}
            onPointerLeave={() => setHoverIndex(null)}
            onMouseMove={onMouseMove}
            onMouseLeave={() => setHoverIndex(null)}
            onTouchMove={onTouchMove}
            onTouchStart={onTouchStart}
          >
            <defs>
              <linearGradient id="ddFill" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="var(--color-destructive)" stopOpacity="0.28" />
                <stop offset="100%" stopColor="var(--color-destructive)" stopOpacity="0.02" />
              </linearGradient>
              <linearGradient id="ddStroke" x1="0" x2="1" y1="0" y2="0">
                <stop offset="0%" stopColor="var(--color-destructive)" stopOpacity="0.75" />
                <stop offset="100%" stopColor="var(--color-destructive)" stopOpacity="0.35" />
              </linearGradient>
            </defs>

            {/* Pain zones */}
            {([5, 10, 20, 30, 40] as const).map((t) => {
              const y = padY + (1 - clamp(t / scaleMax, 0, 1)) * innerH;
              const label = t === 5 ? "Annoying" : t === 10 ? "Uncomfortable" : t === 20 ? "Scary" : t === 30 ? "Panic" : "Capitulation";
              return (
                <g key={t}>
                  <line x1={padX} x2={padX + innerW} y1={y} y2={y} stroke="rgba(255,255,255,0.10)" strokeDasharray="3 4" />
                  <text x={padX + innerW} y={y - 4} textAnchor="end" fontSize="10" fill="rgba(255,255,255,0.55)">
                    {t}% • {label}
                  </text>
                </g>
              );
            })}

            {path ? <path d={path} fill="url(#ddFill)" stroke="url(#ddStroke)" strokeWidth={2} /> : null}

            {hover ? (
              <g>
                <line x1={hover.x} y1={padY} x2={hover.x} y2={padY + innerH} stroke="rgba(255,255,255,0.22)" />
                <circle cx={hover.x} cy={hover.y} r={4.5} fill="var(--color-destructive)" />
                <circle cx={hover.x} cy={hover.y} r={8} fill="rgba(255,255,255,0.06)" />
              </g>
            ) : null}

            {/* Frame */}
            <rect x={1} y={1} width={width - 2} height={height - 2} rx={18} ry={18} fill="none" stroke="rgba(255,255,255,0.08)" />
          </svg>

          {hover ? (
            <div className="wealth-tooltip absolute top-3 left-3 sm:left-auto sm:right-3 px-4 py-3 text-xs text-white">
              <div className="wealth-chart-subtitle">{hover.label}</div>
              <div className="mt-2 flex items-center justify-between gap-6">
                <div className="text-white/70">Drawdown</div>
                <div className="wealth-tooltip-value text-[14px] font-semibold" style={{ color: "var(--color-destructive)" }}>
                  {formatPct(hover.value)}
                </div>
              </div>
              <div className="mt-2 text-[11px] text-white/65">
                Tip: This is the market’s fall from its previous peak — not your portfolio’s return.
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <p className="mt-3 text-[11px] text-white/65">
        Drawdown is shown as the market’s fall from its previous peak. This chart helps explain why most people panic at the worst time.
      </p>

      <p className="mt-2 text-[11px] text-white/60">Tip: Hover/tap to inspect. (On mobile, drag your finger across.)</p>
    </section>
  );
}
