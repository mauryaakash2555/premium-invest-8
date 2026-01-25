"use client";

import type { ReactNode } from "react";
import { useEffect, useMemo, useRef, useState } from "react";

import { motion } from "framer-motion";
import { Contrast, Download, Link2, Printer } from "lucide-react";
import { toast } from "react-hot-toast";
import { trackEvent } from "@/lib/analytics";

import type { ChartDataPoint } from "@/intelligence/simulations/sip-vs-panic";

type SeriesKey = "discipline" | "panic20" | "panic40" | "anyFall" | "custom" | "invested";

type SeriesValues = Record<SeriesKey, number[]>;

type SeriesComputed = {
  values: SeriesValues;
  paths: Record<SeriesKey, string>;
  xTo: (i: number) => number;
  yTo: (v: number) => number;
  yMin: number;
  yMax: number;
};

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

const inr0 = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function formatInr0(amount: number): string {
  const v = Number.isFinite(amount) ? Math.max(0, amount) : 0;
  return inr0.format(Math.round(v));
}

function formatLakhs(amount: number): string {
  const v = Number.isFinite(amount) ? amount : 0;
  return `₹${(v / 100_000).toFixed(1)}L`;
}

async function svgToPngDataUrl(svg: SVGSVGElement, opts?: { background?: string; maxPx?: number }) {
  const viewBox = svg.viewBox?.baseVal;
  const vbW = Math.max(1, Number(viewBox?.width || svg.getAttribute("width") || 900));
  const vbH = Math.max(1, Number(viewBox?.height || svg.getAttribute("height") || 360));

  const maxPx = Math.max(1200, Math.min(6000, Number(opts?.maxPx ?? 3600)));
  const scale = Math.max(2, Math.min(4, maxPx / Math.max(vbW, vbH)));
  const pixelW = Math.round(vbW * scale);
  const pixelH = Math.round(vbH * scale);

  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  clone.setAttribute("width", String(vbW));
  clone.setAttribute("height", String(vbH));

  const xml = new XMLSerializer().serializeToString(clone);
  const blob = new Blob([`<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n${xml}`], {
    type: "image/svg+xml;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);

  try {
    const img = new Image();
    img.decoding = "async";
    img.crossOrigin = "anonymous";

    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to load SVG for PDF export"));
      img.src = url;
    });

    const canvas = document.createElement("canvas");
    canvas.width = pixelW;
    canvas.height = pixelH;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to create canvas context");

    if (opts?.background) {
      ctx.fillStyle = opts.background;
      ctx.fillRect(0, 0, pixelW, pixelH);
    }
    ctx.drawImage(img, 0, 0, pixelW, pixelH);

    return { dataUrl: canvas.toDataURL("image/png"), pixelW, pixelH };
  } finally {
    URL.revokeObjectURL(url);
  }
}

function buildSeries(data: ChartDataPoint[], dims: { width: number; height: number; padding: { l: number; r: number; t: number; b: number } }): SeriesComputed {
  const { width, height, padding } = dims;
  const n = data.length;

  const values: SeriesValues = {
    discipline: data.map((d) => Math.max(0, d?.perfectDisciplineValue ?? 0)),
    panic20: data.map((d) => Math.max(0, d?.panic20Value ?? 0)),
    panic40: data.map((d) => Math.max(0, d?.panic40Value ?? 0)),
    anyFall: data.map((d) => {
      const v = (d as any)?.anyFallValue;
      return Number.isFinite(v) ? Math.max(0, v) : Number.NaN;
    }),
    custom: data.map((d) => {
      const v = (d as any)?.customValue;
      return Number.isFinite(v) ? Math.max(0, v) : Number.NaN;
    }),
    invested: data.map((d) => Math.max(0, d?.investedAmount ?? 0)),
  };

  const finite = (x: number) => Number.isFinite(x);
  const allMax = Math.max(
    1,
    ...values.discipline,
    ...values.panic20,
    ...values.panic40,
    ...values.invested,
    ...values.anyFall.filter(finite),
    ...values.custom.filter(finite)
  );
  const yMin = 0;
  const yMax = allMax * 1.08;

  const plotW = Math.max(1, width - padding.l - padding.r);
  const plotH = Math.max(1, height - padding.t - padding.b);

  const xTo = (i: number) => {
    if (n <= 1) return padding.l;
    const t = clamp(i, 0, n - 1) / (n - 1);
    return padding.l + t * plotW;
  };

  const yTo = (v: number) => {
    const t = (Math.max(yMin, v) - yMin) / Math.max(1e-9, yMax - yMin);
    return padding.t + (1 - t) * plotH;
  };

  const pathFor = (arr: number[]) => {
    if (n === 0) return "";
    let d = "";
    let started = false;
    for (let i = 0; i < n; i += 1) {
      const v = arr[i];
      if (!Number.isFinite(v)) {
        started = false;
        continue;
      }
      if (!started) {
        d += `M ${xTo(i)} ${yTo(v)}`;
        started = true;
      } else {
        d += ` L ${xTo(i)} ${yTo(v)}`;
      }
    }
    return d;
  };

  return {
    values,
    paths: {
      discipline: pathFor(values.discipline),
      panic20: pathFor(values.panic20),
      panic40: pathFor(values.panic40),
      anyFall: pathFor(values.anyFall),
      custom: pathFor(values.custom),
      invested: pathFor(values.invested),
    },
    xTo,
    yTo,
    yMin,
    yMax,
  };
}

export function TimelineChart(props: {
  data: ChartDataPoint[];
  show?: Partial<Record<SeriesKey, boolean>>;
  labels?: Partial<Record<SeriesKey, string>>;
  height?: number;
  title?: string;
  subtitle?: string;
  headerRight?: ReactNode;
  exportId?: string;
}) {
  const { data, show, labels, height = 360, title, subtitle, headerRight, exportId } = props;

  const [showSeries, setShowSeries] = useState<Record<SeriesKey, boolean>>({
    discipline: show?.discipline ?? true,
    panic20: show?.panic20 ?? true,
    panic40: show?.panic40 ?? true,
    anyFall: show?.anyFall ?? false,
    custom: show?.custom ?? false,
    invested: show?.invested ?? false,
  });

  const [highContrast, setHighContrast] = useState(false);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const width = 900; // viewBox units
  const padding = { l: 58, r: 18, t: 20, b: 40 };

  const colors: Record<SeriesKey, { stroke: string; glow: string; label: string }> = {
    discipline: { stroke: "var(--color-matte-gold)", glow: "var(--color-matte-gold)", label: labels?.discipline ?? "Discipline" },
    panic20: { stroke: "var(--color-destructive)", glow: "var(--color-destructive)", label: labels?.panic20 ?? "Stop at 20%" },
    panic40: { stroke: "var(--color-destructive)", glow: "var(--color-destructive)", label: labels?.panic40 ?? "Stop at 40%" },
    anyFall: { stroke: "oklch(0.78 0.00 0 / 0.78)", glow: "oklch(0.78 0.00 0 / 0.20)", label: labels?.anyFall ?? "Pause in Red Months" },
    custom: { stroke: "oklch(0.88 0.03 80 / 0.92)", glow: "oklch(0.88 0.03 80 / 0.25)", label: labels?.custom ?? "Custom" },
    invested: { stroke: "oklch(0.78 0.00 0 / 0.55)", glow: "oklch(0.78 0.00 0 / 0.10)", label: labels?.invested ?? "Invested" },
  };

  useEffect(() => {
    if (!show) return;
    setShowSeries((s) => ({
      ...s,
      discipline: show.discipline ?? s.discipline,
      panic20: show.panic20 ?? s.panic20,
      panic40: show.panic40 ?? s.panic40,
      anyFall: show.anyFall ?? s.anyFall,
      custom: show.custom ?? s.custom,
      invested: show.invested ?? s.invested,
    }));
  }, [show?.anyFall, show?.custom, show?.discipline, show?.invested, show?.panic20, show?.panic40]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isMobile = window.matchMedia?.("(max-width: 768px)")?.matches;
    if (!isMobile) return;
    setShowSeries((s) => ({ ...s, discipline: true, panic20: true, panic40: false, anyFall: false, custom: false, invested: false }));
  }, []);

  const series = useMemo(() => buildSeries(data, { width, height, padding }), [data, height]);

  const crashZone = useMemo(() => {
    const threshold = -10;
    let start: number | null = null;
    let end: number | null = null;
    for (let i = 0; i < data.length; i += 1) {
      if ((data[i]?.marketDrawdown ?? 0) <= threshold) {
        if (start === null) start = i;
        end = i;
      }
    }
    return { start, end };
  }, [data]);

  const recoveryZone = useMemo(() => {
    if (crashZone.start === null || crashZone.end === null) return { start: null, end: null };
    const start = crashZone.end;
    let end: number | null = null;
    for (let i = start; i < data.length; i += 1) {
      if ((data[i]?.marketDrawdown ?? 0) >= -2) {
        end = i;
        break;
      }
    }
    if (end === null) end = Math.min(data.length - 1, start + 12);
    return { start, end };
  }, [crashZone.end, crashZone.start, data]);

  const firstPaused = useMemo(() => {
    const firstFor = (k: "panic20" | "panic40" | "anyFall" | "custom") => {
      for (let i = 0; i < data.length; i += 1) if (data[i]?.sipStatus?.[k] === "paused") return i;
      return null;
    };
    return {
      panic20: firstFor("panic20"),
      panic40: firstFor("panic40"),
      anyFall: firstFor("anyFall"),
      custom: firstFor("custom"),
    };
  }, [data]);

  const topLabelYs = useMemo(() => {
    const baseY = padding.t + 14;
    const rowH = 14;
    const minDx = 170;

    const candidates: Array<{ key: "crash" | "recovery" | "panic20" | "panic40" | "anyFall" | "custom"; x: number }> = [];

    if (crashZone.start !== null) candidates.push({ key: "crash", x: series.xTo(crashZone.start) + 10 });
    if (recoveryZone.start !== null) candidates.push({ key: "recovery", x: series.xTo(recoveryZone.start) + 10 });
    if (firstPaused.panic20 !== null && showSeries.panic20) candidates.push({ key: "panic20", x: series.xTo(firstPaused.panic20) + 6 });
    if (firstPaused.panic40 !== null && showSeries.panic40) candidates.push({ key: "panic40", x: series.xTo(firstPaused.panic40) + 6 });
    if (firstPaused.anyFall !== null && showSeries.anyFall) candidates.push({ key: "anyFall", x: series.xTo(firstPaused.anyFall) + 6 });
    if (firstPaused.custom !== null && showSeries.custom) candidates.push({ key: "custom", x: series.xTo(firstPaused.custom) + 6 });

    candidates.sort((a, b) => a.x - b.x);

    const placed: Array<{ key: (typeof candidates)[number]["key"]; x: number; row: number }> = [];
    for (const c of candidates) {
      let row = 0;
      while (placed.some((p) => p.row === row && Math.abs(p.x - c.x) < minDx)) row += 1;
      placed.push({ ...c, row: Math.min(row, 3) });
    }

    const out: Partial<Record<(typeof candidates)[number]["key"], number>> = {};
    for (const p of placed) out[p.key] = baseY + p.row * rowH;
    return out;
  }, [crashZone.start, firstPaused.anyFall, firstPaused.custom, firstPaused.panic20, firstPaused.panic40, recoveryZone.start, series, showSeries.anyFall, showSeries.custom, showSeries.panic20, showSeries.panic40]);

  const hover = useMemo(() => {
    if (hoverIndex === null) return null;
    const i = clamp(hoverIndex, 0, Math.max(0, data.length - 1));
    const point = data[i];
    if (!point) return null;

    const at = (arr: number[], idx: number) => {
      const v = arr[idx];
      return Number.isFinite(v) ? (v ?? 0) : 0;
    };

    return {
      i,
      x: series.xTo(i),
      label: `MONTH ${point.monthNumber}`,
      values: {
        discipline: at(series.values.discipline, i),
        panic20: at(series.values.panic20, i),
        panic40: at(series.values.panic40, i),
        anyFall: at(series.values.anyFall, i),
        custom: at(series.values.custom, i),
        invested: at(series.values.invested, i),
      },
    };
  }, [data, hoverIndex, series]);

  const legendStats = useMemo(() => {
    const lastIdx = Math.max(0, data.length - 1);
    const endValues = {
      discipline: series.values.discipline[lastIdx] ?? 0,
      panic20: series.values.panic20[lastIdx] ?? 0,
      panic40: series.values.panic40[lastIdx] ?? 0,
      anyFall: Number.isFinite(series.values.anyFall[lastIdx]) ? (series.values.anyFall[lastIdx] ?? 0) : 0,
      custom: Number.isFinite(series.values.custom[lastIdx]) ? (series.values.custom[lastIdx] ?? 0) : 0,
      invested: series.values.invested[lastIdx] ?? 0,
    };
    const d = Math.max(0, endValues.discipline);
    return {
      endValues,
      costVsDiscipline: {
        panic20: d > 0 ? Math.max(0, d - Math.max(0, endValues.panic20)) : 0,
        panic40: d > 0 ? Math.max(0, d - Math.max(0, endValues.panic40)) : 0,
        anyFall: d > 0 ? Math.max(0, d - Math.max(0, endValues.anyFall)) : 0,
        custom: d > 0 ? Math.max(0, d - Math.max(0, endValues.custom)) : 0,
      },
    };
  }, [data.length, series.values.anyFall, series.values.custom, series.values.discipline, series.values.invested, series.values.panic20, series.values.panic40]);

  const setHoverFromClientX = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg || data.length === 0) return;
    const rect = svg.getBoundingClientRect();
    const px = clientX - rect.left;
    const x = (px / rect.width) * width;
    const i = Math.round(((x - padding.l) / Math.max(1, width - padding.l - padding.r)) * Math.max(1, data.length - 1));
    setHoverIndex(clamp(i, 0, data.length - 1));
  };

  const exportAsSvg = () => {
    const svg = svgRef.current;
    if (!svg) return;

    const stamp = new Date().toISOString().slice(0, 10);

    const clone = svg.cloneNode(true) as SVGSVGElement;
    const rootStyle = window.getComputedStyle(document.documentElement);
    const gold = rootStyle.getPropertyValue("--color-matte-gold").trim() || "oklch(0.78 0.08 65)";
    const destructive = rootStyle.getPropertyValue("--color-destructive").trim() || "oklch(0.62 0.20 28)";
    clone.style.setProperty("--color-matte-gold", gold);
    clone.style.setProperty("--color-destructive", destructive);
    clone.style.setProperty("--font-inter", rootStyle.getPropertyValue("--font-inter").trim());
    clone.style.setProperty("--font-playfair", rootStyle.getPropertyValue("--font-playfair").trim());
    clone.style.setProperty("--font-mono", rootStyle.getPropertyValue("--font-mono").trim());

    const xml = new XMLSerializer().serializeToString(clone);
    const withHeader = `<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n${xml}`;
    const blob = new Blob([withHeader], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `sip-vs-panic-chart_${stamp}.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const exportAsPdf = () => {
    const svg = svgRef.current;
    if (!svg) return;

    void (async () => {
      try {
        const stamp = new Date().toISOString().slice(0, 10);
        const rootStyle = window.getComputedStyle(document.documentElement);
        const gold = rootStyle.getPropertyValue("--color-matte-gold").trim() || "oklch(0.78 0.08 65)";
        const destructive = rootStyle.getPropertyValue("--color-destructive").trim() || "oklch(0.62 0.20 28)";
        const exportSvg = svg.cloneNode(true) as SVGSVGElement;
        exportSvg.style.setProperty("--color-matte-gold", gold);
        exportSvg.style.setProperty("--color-destructive", destructive);
        exportSvg.style.setProperty("--font-inter", rootStyle.getPropertyValue("--font-inter").trim());
        exportSvg.style.setProperty("--font-playfair", rootStyle.getPropertyValue("--font-playfair").trim());
        exportSvg.style.setProperty("--font-mono", rootStyle.getPropertyValue("--font-mono").trim());

        const { dataUrl, pixelW, pixelH } = await svgToPngDataUrl(exportSvg, { background: "#070708", maxPx: 4200 });

        const { jsPDF } = await import("jspdf");
        const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape", compress: true });

        const pageW = doc.internal.pageSize.getWidth();
        const pageH = doc.internal.pageSize.getHeight();
        const margin = 10;

        // Full-page dark background so the PDF matches the on-screen black theme.
        doc.setFillColor(7, 7, 8);
        doc.rect(0, 0, pageW, pageH, "F");

        let y = margin;
        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.setTextColor(212, 175, 55);
        doc.text("Wealth Erosion Simulator", margin, y + 6);

        y += 11;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        doc.setTextColor(185, 185, 185);
        doc.text("DISCIPLINE VS PANIC — AFTER-TAX CORPUS TIMELINE", margin, y + 4);
        y += 9;

        // Subtle container so the chart feels like a card.
        const containerPad = 3;
        const containerX = margin - containerPad;
        const containerY = y - 1;
        const containerW = pageW - (margin - containerPad) * 2;
        const containerH = pageH - containerY - margin + 1;
        doc.setFillColor(12, 12, 13);
        doc.rect(containerX, containerY, containerW, containerH, "F");
        doc.setDrawColor(45, 45, 52);
        doc.setLineWidth(0.35);
        doc.rect(containerX, containerY, containerW, containerH, "S");

        const boxW = pageW - margin * 2;
        const boxH = pageH - y - margin - 4;
        const imgAspect = pixelW / Math.max(1, pixelH);
        let imgW = boxW;
        let imgH = imgW / imgAspect;
        if (imgH > boxH) {
          imgH = boxH;
          imgW = imgH * imgAspect;
        }
        const x = margin + (boxW - imgW) / 2;
        const imgY = y + (boxH - imgH) / 2;

        doc.addImage(dataUrl, "PNG", x, imgY, imgW, imgH, undefined, "SLOW");

        doc.setFontSize(8);
        doc.setTextColor(160, 160, 160);
        doc.text(`Generated ${new Date().toLocaleDateString()}`, margin, pageH - 6);

        doc.save(`sip-vs-panic-chart_${stamp}.pdf`);
      } catch (err) {
        console.error(err);
        exportAsSvg();
      }
    })();
  };

  const copyShareLink = async () => {
    try {
      const url = window.location.href;

      // Prefer async clipboard API (works on localhost/https), but keep a fallback for Safari/iOS quirks.
      const canUseClipboard =
        typeof navigator !== "undefined" &&
        typeof navigator.clipboard?.writeText === "function" &&
        typeof window !== "undefined" &&
        window.isSecureContext;

      if (canUseClipboard) {
        await navigator.clipboard.writeText(url);
      } else {
        const ta = document.createElement("textarea");
        ta.value = url;
        ta.setAttribute("readonly", "true");
        ta.style.position = "fixed";
        ta.style.top = "-9999px";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        ta.setSelectionRange(0, ta.value.length);
        const ok = document.execCommand("copy");
        ta.remove();
        if (!ok) throw new Error("execCommand copy failed");
      }

      trackEvent("sip_link_copied", {
        calculator_type: "sip_vs_panic",
        channel: "copy_link",
      });
      toast.success("✓ Link copied to clipboard!", { duration: 2000 });
    } catch {
      toast.error("Failed to copy. Try manually selecting the URL.", { duration: 2000 });
    }
  };

  const onChartKeyDown = (evt: React.KeyboardEvent) => {
    if (data.length === 0) return;
    if (evt.key !== "ArrowLeft" && evt.key !== "ArrowRight" && evt.key !== "Escape") return;
    evt.preventDefault();
    if (evt.key === "Escape") {
      setHoverIndex(null);
      return;
    }
    const dir = evt.key === "ArrowRight" ? 1 : -1;
    setHoverIndex((prev) => clamp((prev ?? 0) + dir, 0, data.length - 1));
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

  if (!data.length) {
    return (
      <div className="rounded-2xl border border-white/10 ultra-luxury-glass p-5 text-sm text-white/70">
        Run a simulation to see the chart.
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="wealth-chart-container gold-grain-texture p-6 sm:p-10"
    >
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <h2 className="gold-gradient-text font-[var(--font-playfair)] text-[22px] sm:text-[28px] font-semibold tracking-[-0.02em]">
            {title ?? "SIP vs Panic Selling"}
          </h2>
          <div className="mt-1 wealth-chart-subtitle">{subtitle ?? "Discipline vs panic — after-tax corpus timeline"}</div>
        </div>

        <div className="flex flex-wrap items-center justify-start lg:justify-end gap-2">
          {headerRight ? <div className="mr-1">{headerRight}</div> : null}
          <button
            type="button"
            onClick={exportAsSvg}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/85 hover:bg-white/5 min-h-11"
          >
            <Download className="h-4 w-4" /> Export SVG
          </button>
          <button
            type="button"
            onClick={exportAsPdf}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/85 hover:bg-white/5 min-h-11"
          >
            <Printer className="h-4 w-4" /> Export PDF
          </button>
          <button
            type="button"
            onClick={copyShareLink}
            className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/85 hover:bg-white/5 min-h-11"
          >
            <Link2 className="h-4 w-4" /> Copy link
          </button>
          <button
            type="button"
            aria-pressed={highContrast}
            onClick={() => setHighContrast((v) => !v)}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs transition-colors ${
              highContrast
                ? "border-white/20 bg-white/10 text-white"
                : "border-white/10 bg-black/20 text-white/85 hover:bg-white/5"
            }`}
          >
            <Contrast className="h-4 w-4" /> High contrast
          </button>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        {(Object.keys(colors) as SeriesKey[]).map((k) => {
          const active = showSeries[k];
          const isPanic = k === "panic20" || k === "panic40";
          const lineStyle =
            k === "discipline"
              ? "linear-gradient(90deg, var(--color-matte-gold), color-mix(in oklab, var(--color-matte-gold) 60%, white 40%))"
              : isPanic
                ? "linear-gradient(90deg, var(--color-destructive), color-mix(in oklab, var(--color-destructive) 70%, white 30%))"
                : k === "custom"
                  ? "linear-gradient(90deg, oklch(0.88 0.03 80 / 0.85), oklch(0.88 0.03 80 / 0.35))"
                  : k === "anyFall"
                    ? "linear-gradient(90deg, rgba(255,255,255,0.55), rgba(255,255,255,0.20))"
                    : "linear-gradient(90deg, rgba(255,255,255,0.55), rgba(255,255,255,0.25))";

          const end = legendStats.endValues[k] ?? 0;
          const cost =
            k === "panic20"
              ? legendStats.costVsDiscipline.panic20
              : k === "panic40"
                ? legendStats.costVsDiscipline.panic40
                : k === "anyFall"
                  ? legendStats.costVsDiscipline.anyFall
                  : k === "custom"
                    ? legendStats.costVsDiscipline.custom
                    : 0;
          return (
            <button
              key={k}
              type="button"
              data-active={active ? "true" : "false"}
              onClick={() => setShowSeries((s) => ({ ...s, [k]: !s[k] }))}
              className="wealth-legend-item flex items-center gap-3 px-4 py-3 text-left"
            >
              <span className="h-3 w-10 rounded-full" style={{ background: lineStyle }} />
              <span className="min-w-[120px]">
                <div className="text-[13px] font-medium text-white/90">{colors[k].label}</div>
                <div className="wealth-tooltip-value text-[15px] font-semibold text-white tabular-nums">{formatLakhs(end)}</div>
                <div className="mt-0.5 text-[11px] text-white/55 tabular-nums">{formatInr0(end)}</div>
              </span>
              {cost > 0 ? (
                <span className="ml-auto text-right tabular-nums" title={formatInr0(cost)}>
                  <div className="wealth-tooltip-value text-[13px] font-semibold" style={{ color: "var(--color-destructive)" }}>
                    -{formatLakhs(cost)}
                  </div>
                  <div className="mt-0.5 text-[11px] text-white/55">-{formatInr0(cost)}</div>
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="mt-6 relative" onKeyDown={onChartKeyDown} tabIndex={0}>
        <div className="overflow-x-auto">
          <svg
            id={exportId}
            ref={svgRef}
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label="Financial simulation chart showing disciplined SIP vs panic behaviors over time"
            className="w-full min-w-[720px] h-[260px] sm:h-[320px] lg:h-[360px] touch-none"
            onPointerMove={onPointerMove}
            onPointerDown={onPointerDown}
            onMouseMove={onMouseMove}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onPointerLeave={() => setHoverIndex(null)}
            style={{ touchAction: "none" }}
          >
            <defs>
              <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              <linearGradient id="disciplineGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--color-matte-gold)" stopOpacity="0.75" />
                <stop offset="100%" stopColor="var(--color-matte-gold)" stopOpacity="1" />
              </linearGradient>

              <linearGradient id="panicGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--color-destructive)" stopOpacity="0.75" />
                <stop offset="100%" stopColor="var(--color-destructive)" stopOpacity="1" />
              </linearGradient>

              <linearGradient id="crashZoneGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-destructive)" stopOpacity="0.12" />
                <stop offset="100%" stopColor="var(--color-destructive)" stopOpacity="0.04" />
              </linearGradient>

              <linearGradient id="recoveryZoneGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-matte-gold)" stopOpacity="0.10" />
                <stop offset="100%" stopColor="var(--color-matte-gold)" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            <rect x="0" y="0" width={width} height={height} fill="transparent" />

            {crashZone.start !== null && crashZone.end !== null ? (
              <rect
                x={series.xTo(crashZone.start)}
                y={padding.t}
                width={Math.max(0, series.xTo(crashZone.end) - series.xTo(crashZone.start))}
                height={height - padding.t - padding.b}
                fill="url(#crashZoneGradient)"
              />
            ) : null}

            {recoveryZone.start !== null && recoveryZone.end !== null && recoveryZone.end > recoveryZone.start ? (
              <rect
                x={series.xTo(recoveryZone.start)}
                y={padding.t}
                width={Math.max(0, series.xTo(recoveryZone.end) - series.xTo(recoveryZone.start))}
                height={height - padding.t - padding.b}
                fill="url(#recoveryZoneGradient)"
              />
            ) : null}

            {[0.25, 0.5, 0.75].map((t) => {
              const y = padding.t + (height - padding.t - padding.b) * t;
              return (
                <line
                  key={t}
                  x1={padding.l}
                  y1={y}
                  x2={width - padding.r}
                  y2={y}
                  stroke={highContrast ? "rgba(255,255,255,0.14)" : "rgba(255,255,255,0.08)"}
                  strokeWidth={0.8}
                />
              );
            })}

            <line x1={padding.l} y1={height - padding.b} x2={width - padding.r} y2={height - padding.b} stroke={highContrast ? "rgba(255,255,255,0.26)" : "rgba(255,255,255,0.16)"} />
            <line x1={padding.l} y1={padding.t} x2={padding.l} y2={height - padding.b} stroke={highContrast ? "rgba(255,255,255,0.26)" : "rgba(255,255,255,0.16)"} />

            {(() => {
              const ticks = [series.yMin, (series.yMin + series.yMax) / 2, series.yMax];
              return ticks.map((v, idx) => (
                <text
                  key={idx}
                  x={padding.l - 10}
                  y={series.yTo(v) + 4}
                  fill={highContrast ? "rgba(255,255,255,0.82)" : "rgba(255,255,255,0.70)"}
                  fontSize="12"
                  textAnchor="end"
                  fontFamily="var(--font-inter)"
                >
                  <title>{formatInr0(v)}</title>
                  {formatLakhs(v)}
                </text>
              ));
            })()}

            {(() => {
              const n = Math.max(1, data.length - 1);
              const idxs = [0, Math.round(n / 2), n];
              return idxs.map((i, k) => {
                const d = data[i];
                const label = d ? String(d.date.getFullYear()) : "";
                return (
                  <text
                    key={k}
                    x={series.xTo(i)}
                    y={height - 14}
                    fill={highContrast ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.58)"}
                    fontSize="12"
                    textAnchor={k === 0 ? "start" : k === 2 ? "end" : "middle"}
                    fontFamily="var(--font-inter)"
                  >
                    {label}
                  </text>
                );
              });
            })()}

            {crashZone.start !== null && crashZone.end !== null ? (
              <text
                x={series.xTo(crashZone.start) + 10}
                y={topLabelYs.crash ?? padding.t + 14}
                fill="var(--color-destructive)"
                fontSize="10"
                fontFamily="var(--font-inter)"
                letterSpacing="0.08em"
                fontWeight={600}
              >
                MARKET DRAWDOWN
              </text>
            ) : null}
            {recoveryZone.start !== null && recoveryZone.end !== null && recoveryZone.end > recoveryZone.start ? (
              <text
                x={series.xTo(recoveryZone.start) + 10}
                y={topLabelYs.recovery ?? padding.t + 14}
                fill="var(--color-matte-gold)"
                fontSize="10"
                fontFamily="var(--font-inter)"
                letterSpacing="0.08em"
                fontWeight={600}
              >
                RECOVERY WINDOW
              </text>
            ) : null}

            {showSeries.discipline ? (
              <motion.path
                d={series.paths.discipline}
                fill="none"
                stroke={colors.discipline.glow}
                strokeWidth={7}
                filter="url(#softGlow)"
                opacity={0.28}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.28 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              />
            ) : null}
            {showSeries.panic20 ? (
              <motion.path
                d={series.paths.panic20}
                fill="none"
                stroke={colors.panic20.glow}
                strokeWidth={6}
                filter="url(#softGlow)"
                opacity={0.20}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.20 }}
                transition={{ duration: 1.2, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
              />
            ) : null}
            {showSeries.panic40 ? (
              <motion.path
                d={series.paths.panic40}
                fill="none"
                stroke={colors.panic40.glow}
                strokeWidth={6}
                filter="url(#softGlow)"
                opacity={0.16}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.16 }}
                transition={{ duration: 1.2, delay: 0.20, ease: [0.16, 1, 0.3, 1] }}
              />
            ) : null}
            {showSeries.anyFall ? (
              <motion.path
                d={series.paths.anyFall}
                fill="none"
                stroke={colors.anyFall.glow}
                strokeWidth={5}
                filter="url(#softGlow)"
                opacity={0.14}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.14 }}
                transition={{ duration: 1.2, delay: 0.26, ease: [0.16, 1, 0.3, 1] }}
              />
            ) : null}
            {showSeries.custom ? (
              <motion.path
                d={series.paths.custom}
                fill="none"
                stroke={colors.custom.glow}
                strokeWidth={5}
                filter="url(#softGlow)"
                opacity={0.16}
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.16 }}
                transition={{ duration: 1.2, delay: 0.30, ease: [0.16, 1, 0.3, 1] }}
              />
            ) : null}
            {showSeries.invested ? (
              <path d={series.paths.invested} fill="none" stroke={colors.invested.stroke} strokeWidth={2} strokeDasharray="7 6" />
            ) : null}

            {showSeries.discipline ? (
              <motion.path
                d={series.paths.discipline}
                fill="none"
                stroke="url(#disciplineGradient)"
                strokeWidth={3.6}
                initial={{ pathLength: 0, opacity: 0.65 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
              />
            ) : null}
            {showSeries.panic20 ? (
              <motion.path
                d={series.paths.panic20}
                fill="none"
                stroke="url(#panicGradient)"
                strokeWidth={2.8}
                strokeDasharray="0"
                initial={{ pathLength: 0, opacity: 0.55 }}
                animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 1.4, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
              />
            ) : null}
            {showSeries.panic40 ? (
              <motion.path
                d={series.paths.panic40}
                fill="none"
                stroke="url(#panicGradient)"
                strokeWidth={2.6}
                strokeDasharray="8 5"
                initial={{ pathLength: 0, opacity: 0.45 }}
                animate={{ pathLength: 1, opacity: 0.95 }}
                transition={{ duration: 1.4, delay: 0.20, ease: [0.16, 1, 0.3, 1] }}
              />
            ) : null}
            {showSeries.anyFall ? (
              <motion.path
                d={series.paths.anyFall}
                fill="none"
                stroke={colors.anyFall.stroke}
                strokeWidth={2.4}
                strokeDasharray="10 7"
                initial={{ pathLength: 0, opacity: 0.35 }}
                animate={{ pathLength: 1, opacity: 0.92 }}
                transition={{ duration: 1.4, delay: 0.26, ease: [0.16, 1, 0.3, 1] }}
              />
            ) : null}
            {showSeries.custom ? (
              <motion.path
                d={series.paths.custom}
                fill="none"
                stroke={colors.custom.stroke}
                strokeWidth={2.6}
                strokeDasharray="0"
                initial={{ pathLength: 0, opacity: 0.35 }}
                animate={{ pathLength: 1, opacity: 0.98 }}
                transition={{ duration: 1.4, delay: 0.30, ease: [0.16, 1, 0.3, 1] }}
              />
            ) : null}

            {hover ? (
              <g>
                <line x1={hover.x} y1={padding.t} x2={hover.x} y2={height - padding.b} stroke="rgba(255,255,255,0.22)" />
                {showSeries.discipline ? (
                  <circle cx={hover.x} cy={series.yTo(hover.values.discipline)} r={4.5} fill={colors.discipline.stroke} />
                ) : null}
                {showSeries.panic20 ? (
                  <circle cx={hover.x} cy={series.yTo(hover.values.panic20)} r={4} fill={colors.panic20.stroke} />
                ) : null}
                {showSeries.panic40 ? (
                  <circle cx={hover.x} cy={series.yTo(hover.values.panic40)} r={4} fill={colors.panic40.stroke} />
                ) : null}
                {showSeries.anyFall && Number.isFinite(series.values.anyFall[hover.i]) ? (
                  <circle cx={hover.x} cy={series.yTo(series.values.anyFall[hover.i] ?? 0)} r={3.8} fill={colors.anyFall.stroke} />
                ) : null}
                {showSeries.custom && Number.isFinite(series.values.custom[hover.i]) ? (
                  <circle cx={hover.x} cy={series.yTo(series.values.custom[hover.i] ?? 0)} r={3.9} fill={colors.custom.stroke} />
                ) : null}
              </g>
            ) : null}

            {firstPaused.panic20 !== null && showSeries.panic20 ? (
              <g>
                <line
                  x1={series.xTo(firstPaused.panic20)}
                  y1={padding.t}
                  x2={series.xTo(firstPaused.panic20)}
                  y2={height - padding.b}
                  stroke="var(--color-destructive)"
                  strokeDasharray="6 6"
                  strokeOpacity={0.55}
                />
                <circle
                  cx={series.xTo(firstPaused.panic20)}
                  cy={series.yTo(series.values.panic20[firstPaused.panic20] ?? 0)}
                  r={6}
                  fill="var(--color-destructive)"
                  stroke="rgba(0,0,0,0.9)"
                  strokeWidth={2}
                />
                <text
                  x={series.xTo(firstPaused.panic20) + 6}
                  y={topLabelYs.panic20 ?? padding.t + 14}
                  fill="rgba(255,255,255,0.92)"
                  fontSize="11"
                  fontFamily="var(--font-inter)"
                  fontWeight={600}
                  letterSpacing="0.04em"
                >
                  PANIC SOLD HERE (20%)
                </text>
              </g>
            ) : null}
            {firstPaused.panic40 !== null && showSeries.panic40 ? (
              <g>
                <line
                  x1={series.xTo(firstPaused.panic40)}
                  y1={padding.t}
                  x2={series.xTo(firstPaused.panic40)}
                  y2={height - padding.b}
                  stroke="var(--color-destructive)"
                  strokeDasharray="6 6"
                  strokeOpacity={0.45}
                />
                <circle
                  cx={series.xTo(firstPaused.panic40)}
                  cy={series.yTo(series.values.panic40[firstPaused.panic40] ?? 0)}
                  r={6}
                  fill="var(--color-destructive)"
                  stroke="rgba(0,0,0,0.9)"
                  strokeWidth={2}
                />
                <text
                  x={series.xTo(firstPaused.panic40) + 6}
                  y={topLabelYs.panic40 ?? padding.t + 28}
                  fill="rgba(255,255,255,0.88)"
                  fontSize="11"
                  fontFamily="var(--font-inter)"
                  fontWeight={600}
                  letterSpacing="0.04em"
                >
                  PANIC SOLD HERE (40%)
                </text>
              </g>
            ) : null}
            {firstPaused.anyFall !== null && showSeries.anyFall && Number.isFinite(series.values.anyFall[firstPaused.anyFall]) ? (
              <g>
                <line
                  x1={series.xTo(firstPaused.anyFall)}
                  y1={padding.t}
                  x2={series.xTo(firstPaused.anyFall)}
                  y2={height - padding.b}
                  stroke={colors.anyFall.stroke}
                  strokeDasharray="6 6"
                  strokeOpacity={0.40}
                />
                <circle
                  cx={series.xTo(firstPaused.anyFall)}
                  cy={series.yTo(series.values.anyFall[firstPaused.anyFall] ?? 0)}
                  r={6}
                  fill={colors.anyFall.stroke}
                  stroke="rgba(0,0,0,0.9)"
                  strokeWidth={2}
                />
                <text
                  x={series.xTo(firstPaused.anyFall) + 6}
                  y={topLabelYs.anyFall ?? padding.t + 42}
                  fill="rgba(255,255,255,0.85)"
                  fontSize="11"
                  fontFamily="var(--font-inter)"
                  fontWeight={600}
                  letterSpacing="0.04em"
                >
                  PAUSED HERE (RED MONTH)
                </text>
              </g>
            ) : null}
            {firstPaused.custom !== null && showSeries.custom && Number.isFinite(series.values.custom[firstPaused.custom]) ? (
              <g>
                <line
                  x1={series.xTo(firstPaused.custom)}
                  y1={padding.t}
                  x2={series.xTo(firstPaused.custom)}
                  y2={height - padding.b}
                  stroke={colors.custom.stroke}
                  strokeDasharray="6 6"
                  strokeOpacity={0.45}
                />
                <circle
                  cx={series.xTo(firstPaused.custom)}
                  cy={series.yTo(series.values.custom[firstPaused.custom] ?? 0)}
                  r={6}
                  fill={colors.custom.stroke}
                  stroke="rgba(0,0,0,0.9)"
                  strokeWidth={2}
                />
                <text
                  x={series.xTo(firstPaused.custom) + 6}
                  y={topLabelYs.custom ?? padding.t + 56}
                  fill="rgba(255,255,255,0.88)"
                  fontSize="11"
                  fontFamily="var(--font-inter)"
                  fontWeight={600}
                  letterSpacing="0.04em"
                >
                  PAUSED HERE (CUSTOM)
                </text>
              </g>
            ) : null}
          </svg>
        </div>

        {hover ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="wealth-tooltip absolute top-3 left-3 sm:left-auto sm:right-3 px-4 py-3 text-xs text-white"
          >
            <div className="flex items-baseline justify-between gap-4">
              <div className="wealth-chart-subtitle">{hover.label}</div>
              <div className="font-[var(--font-playfair)] text-[16px] font-semibold text-[var(--color-matte-gold)]">
                {data[hover.i]?.date?.toLocaleDateString?.("en-IN", { month: "short", year: "numeric" }) ?? ""}
              </div>
            </div>

            <div className="mt-3 space-y-2">
              {(
                [
                  showSeries.discipline ? ("discipline" as const) : null,
                  showSeries.panic20 ? ("panic20" as const) : null,
                  showSeries.panic40 ? ("panic40" as const) : null,
                  showSeries.anyFall && Number.isFinite(series.values.anyFall[hover.i]) ? ("anyFall" as const) : null,
                  showSeries.custom && Number.isFinite(series.values.custom[hover.i]) ? ("custom" as const) : null,
                  showSeries.invested ? ("invested" as const) : null,
                ].filter(Boolean) as SeriesKey[]
              ).map((k) => (
                <div key={k} className="flex items-center justify-between gap-6">
                  <div className="flex items-center gap-2 text-white/80">
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{
                        background:
                          k === "discipline"
                            ? "var(--color-matte-gold)"
                            : k === "invested"
                              ? "rgba(255,255,255,0.55)"
                              : k === "custom"
                                ? colors.custom.stroke
                                : k === "anyFall"
                                  ? colors.anyFall.stroke
                                  : "var(--color-destructive)",
                      }}
                    />
                    <span>{colors[k].label}</span>
                  </div>
                  <div className="text-right">
                    <div className="wealth-tooltip-value text-[14px] font-semibold text-white tabular-nums">{formatLakhs(hover.values[k])}</div>
                    <div className="mt-0.5 text-[11px] text-white/55 tabular-nums">{formatInr0(hover.values[k])}</div>
                  </div>
                </div>
              ))}
            </div>

            {showSeries.discipline && (showSeries.panic20 || showSeries.panic40 || showSeries.anyFall || showSeries.custom) ? (
              <div className="mt-3 border-t border-white/10 pt-3 flex items-center justify-between gap-6">
                <div className="text-white/70">Behavioral gap</div>
                {(() => {
                  const gap = Math.max(
                    0,
                    hover.values.discipline -
                      Math.max(
                        showSeries.panic20 ? hover.values.panic20 : 0,
                        showSeries.panic40 ? hover.values.panic40 : 0,
                        showSeries.anyFall && Number.isFinite(series.values.anyFall[hover.i]) ? (series.values.anyFall[hover.i] ?? 0) : 0,
                        showSeries.custom && Number.isFinite(series.values.custom[hover.i]) ? (series.values.custom[hover.i] ?? 0) : 0
                      )
                  );
                  return (
                    <div className="text-right" title={formatInr0(gap)}>
                      <div className="wealth-tooltip-value text-[15px] font-bold" style={{ color: "var(--color-destructive)" }}>
                        -{formatLakhs(gap)}
                      </div>
                      <div className="mt-0.5 text-[11px] text-white/55 tabular-nums">-{formatInr0(gap)}</div>
                    </div>
                  );
                })()}
              </div>
            ) : null}
          </motion.div>
        ) : null}
      </div>

      <p className="mt-4 text-[11px] text-white/70">Tip: Hover/tap to inspect. Keyboard: focus chart, use ←/→ to scrub, Esc to clear.</p>
    </motion.div>
  );
}
