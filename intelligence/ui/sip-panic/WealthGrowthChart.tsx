"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

import type { ChartDataPoint } from "@/intelligence/simulations/sip-vs-panic";

const inr0 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function formatLakhs(amount: number): string {
  const v = Number.isFinite(amount) ? amount : 0;
  return `₹${(v / 100_000).toFixed(2)}L`;
}

interface WealthGrowthChartProps {
  data: ChartDataPoint[];
  title?: string;
  subtitle?: string;
  showPanic20?: boolean;
  showPanic40?: boolean;
  showAnyFall?: boolean;
  showCustom?: boolean;
}

export function WealthGrowthChart(props: WealthGrowthChartProps) {
  const {
    data,
    title = "📊 Wealth Growth Visualization",
    subtitle = "See how discipline compounds over time — calm vs panic",
    showPanic20 = true,
    showPanic40 = false,
    showAnyFall = false,
    showCustom = false,
  } = props;

  const chartData = useMemo(() => {
    if (!data || !data.length) return [];
    
    // Sample every 3rd month if data is large, plus always include first/last
    const sampled: ChartDataPoint[] = [];
    for (let i = 0; i < data.length; i++) {
      if (i === 0 || i === data.length - 1 || i % 3 === 0) {
        sampled.push(data[i]);
      }
    }
    return sampled;
  }, [data]);

  const { minY, maxY, minX, maxX } = useMemo(() => {
    if (!chartData.length) return { minY: 0, maxY: 100000, minX: 0, maxX: 120 };
    
    let minY = Infinity;
    let maxY = -Infinity;
    
    for (const d of chartData) {
      const vals = [
        d.perfectDisciplineValue ?? 0,
        d.panic20Value ?? 0,
        d.panic40Value ?? 0,
        (d as any).anyFallValue ?? 0,
        (d as any).customValue ?? 0,
        d.investedAmount ?? 0,
      ].filter((v) => v > 0);
      
      for (const v of vals) {
        if (v < minY) minY = v;
        if (v > maxY) maxY = v;
      }
    }
    
    // Add 10% padding
    const range = maxY - minY;
    minY = Math.max(0, minY - range * 0.05);
    maxY = maxY + range * 0.1;
    
    return {
      minY: Math.floor(minY),
      maxY: Math.ceil(maxY),
      minX: chartData[0]?.monthNumber ?? 0,
      maxX: chartData[chartData.length - 1]?.monthNumber ?? 120,
    };
  }, [chartData]);

  const width = 600;
  const height = 300;
  const padding = { l: 60, r: 20, t: 20, b: 40 };

  const scaleX = (month: number) => {
    const range = maxX - minX || 1;
    return padding.l + ((month - minX) / range) * (width - padding.l - padding.r);
  };

  const scaleY = (value: number) => {
    const range = maxY - minY || 1;
    return height - padding.b - ((value - minY) / range) * (height - padding.t - padding.b);
  };

  const buildPath = (getValue: (d: ChartDataPoint) => number) => {
    if (!chartData.length) return "";
    const points = chartData.map((d) => ({
      x: scaleX(d.monthNumber ?? 0),
      y: scaleY(getValue(d)),
    }));
    return points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  };

  const disciplinePath = buildPath((d) => d.perfectDisciplineValue ?? 0);
  const panic20Path = showPanic20 ? buildPath((d) => d.panic20Value ?? 0) : "";
  const panic40Path = showPanic40 ? buildPath((d) => d.panic40Value ?? 0) : "";
  const anyFallPath = showAnyFall ? buildPath((d) => (d as any).anyFallValue ?? 0) : "";
  const customPath = showCustom ? buildPath((d) => (d as any).customValue ?? 0) : "";
  const investedPath = buildPath((d) => d.investedAmount ?? 0);

  // Y-axis ticks
  const yTicks = useMemo(() => {
    const ticks: number[] = [];
    const step = (maxY - minY) / 5;
    for (let i = 0; i <= 5; i++) {
      ticks.push(minY + step * i);
    }
    return ticks;
  }, [minY, maxY]);

  // X-axis ticks (months)
  const xTicks = useMemo(() => {
    const ticks: number[] = [];
    const totalMonths = maxX - minX;
    const step = Math.ceil(totalMonths / 6);
    for (let i = minX; i <= maxX; i += step) {
      ticks.push(i);
    }
    if (ticks[ticks.length - 1] !== maxX) ticks.push(maxX);
    return ticks;
  }, [minX, maxX]);

  if (!chartData.length) {
    return (
      <div className="wealth-growth-chart-container rounded-2xl border border-white/10 ultra-luxury-glass gold-grain-texture p-6">
        <div className="text-white/60 text-sm">Run a simulation to see the wealth growth chart.</div>
      </div>
    );
  }

  const lastData = chartData[chartData.length - 1];
  const disciplineFinal = lastData?.perfectDisciplineValue ?? 0;
  const panic20Final = lastData?.panic20Value ?? 0;
  const gap = disciplineFinal - panic20Final;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="wealth-growth-chart-container rounded-2xl border border-white/10 ultra-luxury-glass gold-grain-texture p-6"
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="text-base font-semibold gold-gradient-text-static">{title}</h3>
          <p className="mt-1 text-xs text-white/70">{subtitle}</p>
        </div>
        
        {gap > 0 && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
            className="flex flex-col items-end"
          >
            <span className="text-[10px] uppercase tracking-wider text-white/50">Gap at end</span>
            <span className="text-lg font-bold gold-gradient-text-static">{formatLakhs(gap)}</span>
          </motion.div>
        )}
      </div>

      <div className="relative overflow-hidden rounded-xl bg-black/30 border border-white/5">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto"
          style={{ minHeight: 280 }}
        >
          {/* Grid lines */}
          <g className="grid-lines">
            {yTicks.map((tick, i) => (
              <line
                key={`y-${i}`}
                x1={padding.l}
                x2={width - padding.r}
                y1={scaleY(tick)}
                y2={scaleY(tick)}
                stroke="rgba(255,255,255,0.06)"
                strokeDasharray="4 4"
              />
            ))}
            {xTicks.map((tick, i) => (
              <line
                key={`x-${i}`}
                x1={scaleX(tick)}
                x2={scaleX(tick)}
                y1={padding.t}
                y2={height - padding.b}
                stroke="rgba(255,255,255,0.04)"
                strokeDasharray="4 4"
              />
            ))}
          </g>

          {/* Y-axis labels */}
          <g className="y-axis">
            {yTicks.map((tick, i) => (
              <text
                key={`yl-${i}`}
                x={padding.l - 8}
                y={scaleY(tick)}
                textAnchor="end"
                dominantBaseline="middle"
                fill="rgba(255,255,255,0.5)"
                fontSize="10"
              >
                {formatLakhs(tick)}
              </text>
            ))}
          </g>

          {/* X-axis labels */}
          <g className="x-axis">
            {xTicks.map((tick, i) => (
              <text
                key={`xl-${i}`}
                x={scaleX(tick)}
                y={height - padding.b + 20}
                textAnchor="middle"
                fill="rgba(255,255,255,0.5)"
                fontSize="10"
              >
                {tick}m
              </text>
            ))}
          </g>

          {/* Invested line (dashed grey) */}
          <motion.path
            d={investedPath}
            fill="none"
            stroke="rgba(255,255,255,0.25)"
            strokeWidth="2"
            strokeDasharray="6 4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />

          {/* Panic lines (red variants) */}
          {panic20Path && (
            <motion.path
              d={panic20Path}
              fill="none"
              stroke="color-mix(in oklab, var(--lux-foreground) 70%, transparent)"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
            />
          )}
          {panic40Path && (
            <motion.path
              d={panic40Path}
              fill="none"
              stroke="color-mix(in oklab, var(--lux-foreground) 45%, transparent)"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.3 }}
            />
          )}
          {anyFallPath && (
            <motion.path
              d={anyFallPath}
              fill="none"
              stroke="color-mix(in oklab, var(--lux-accent) 28%, var(--lux-foreground-40))"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.4 }}
            />
          )}
          {customPath && (
            <motion.path
              d={customPath}
              fill="none"
              stroke="color-mix(in oklab, var(--lux-accent) 55%, var(--lux-foreground))"
              strokeWidth="2"
              strokeLinecap="round"
              strokeDasharray="8 4"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.2, ease: "easeOut", delay: 0.5 }}
            />
          )}

          {/* Discipline line (green) - drawn last so it's on top */}
          <motion.path
            d={disciplinePath}
            fill="none"
            stroke="var(--lux-accent)"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />

          {/* End markers */}
          <motion.circle
            cx={scaleX(maxX)}
            cy={scaleY(disciplineFinal)}
            r="6"
            fill="var(--lux-accent)"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1.5, duration: 0.3 }}
          />
          {showPanic20 && panic20Final > 0 && (
            <motion.circle
              cx={scaleX(maxX)}
              cy={scaleY(panic20Final)}
              r="5"
              fill="color-mix(in oklab, var(--lux-foreground) 70%, transparent)"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.3, duration: 0.3 }}
            />
          )}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-1 rounded-full bg-[color:var(--lux-accent)]" />
          <span className="text-white/80">💚 Stay calm & keep investing</span>
        </div>
        {showPanic20 && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 rounded-full bg-[color:var(--lux-foreground-60)]" />
            <span className="text-white/80">⚠️ Stop SIP at -20%</span>
          </div>
        )}
        {showPanic40 && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-1 rounded-full bg-[color:var(--lux-foreground-40)]" />
            <span className="text-white/80">Stop SIP at -40%</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <div className="w-4 h-0.5 rounded-full bg-white/30" style={{ borderStyle: "dashed" }} />
          <span className="text-white/60">Total invested</span>
        </div>
      </div>

      {/* Final values summary */}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.6, duration: 0.3 }}
          className="rounded-xl border border-white/15 bg-[color:var(--lux-foreground-05)] p-3"
        >
          <div className="text-[10px] uppercase tracking-wider text-white/60">Disciplined</div>
          <div className="text-lg font-bold text-[color:var(--lux-accent)] tabular-nums">{formatLakhs(disciplineFinal)}</div>
        </motion.div>
        {showPanic20 && panic20Final > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.7, duration: 0.3 }}
            className="rounded-xl border border-white/10 bg-black/20 p-3"
          >
            <div className="text-[10px] uppercase tracking-wider text-white/60">Panic at -20%</div>
            <div className="text-lg font-bold text-white/85 tabular-nums">{formatLakhs(panic20Final)}</div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
