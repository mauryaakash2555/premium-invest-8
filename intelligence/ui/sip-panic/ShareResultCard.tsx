"use client";

import { useMemo, useRef, useState } from "react";

import { Download } from "lucide-react";
import { trackEvent } from "@/lib/analytics";

function clamp(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

function formatLakhs(n: number): string {
  const v = Number.isFinite(n) ? n : 0;
  return `₹${(v / 100_000).toFixed(2)}L`;
}

function formatInr0(n: number): string {
  const v = Number.isFinite(n) ? n : 0;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(Math.max(0, v));
}

async function svgToPngDataUrl(svg: SVGSVGElement, opts?: { background?: string; maxPx?: number }) {
  const viewBox = svg.viewBox?.baseVal;
  const vbW = Math.max(1, Number(viewBox?.width || svg.getAttribute("width") || 1080));
  const vbH = Math.max(1, Number(viewBox?.height || svg.getAttribute("height") || 1080));

  const maxPx = Math.max(1080, Math.min(6000, Number(opts?.maxPx ?? 2160)));
  const scale = Math.max(1, Math.min(4, maxPx / Math.max(vbW, vbH)));
  const pixelW = Math.round(vbW * scale);
  const pixelH = Math.round(vbH * scale);

  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
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
      img.onerror = () => reject(new Error("Failed to load SVG"));
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

function downloadDataUrl(filename: string, dataUrl: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export function ShareResultCard(props: {
  calculatorType: string;
  shareUrl: string;
  monthlyAmount: number;
  durationYears: number;
  crashLabel: string;
  taxModeLabel: string;
  disciplinePostTax: number;
  panicPostTax: number;
  behavioralCost: number;
}) {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const view = useMemo(() => {
    const cost = Math.max(0, props.behavioralCost || 0);
    const discipline = Math.max(0, props.disciplinePostTax || 0);
    const panic = Math.max(0, props.panicPostTax || 0);
    const pct = discipline > 0 ? clamp(Math.round((cost / discipline) * 100), 0, 99) : 0;

    const shortUrl = (() => {
      try {
        const u = new URL(props.shareUrl);
        u.searchParams.delete("utm_source");
        u.searchParams.delete("utm_medium");
        u.searchParams.delete("utm_campaign");
        u.searchParams.delete("utm_content");
        return u.toString();
      } catch {
        return props.shareUrl;
      }
    })();

    return {
      cost,
      discipline,
      panic,
      pct,
      shortUrl,
    };
  }, [props.behavioralCost, props.disciplinePostTax, props.panicPostTax, props.shareUrl]);

  const onDownload = async () => {
    if (!svgRef.current) return;

    setIsDownloading(true);
    try {
      const { dataUrl } = await svgToPngDataUrl(svgRef.current, { background: "#050505", maxPx: 2160 });
      downloadDataUrl(`sip-vs-panic-${props.monthlyAmount}-${props.durationYears}y.png`, dataUrl);

      trackEvent("sip_share_card_downloaded", {
        calculator_type: props.calculatorType,
        sip_amount: props.monthlyAmount,
        duration_years: props.durationYears,
        behavioral_cost: Math.round(view.cost),
      });
    } catch {
      // ignore
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="mt-3 rounded-2xl border border-white/10 bg-black/15 p-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="text-xs text-white/75">
          <div className="font-semibold text-white/90">Share card</div>
          <div className="text-[11px] text-white/60">Download a square image for WhatsApp/Instagram/LinkedIn.</div>
        </div>

        <button
          type="button"
          onClick={() => void onDownload()}
          disabled={isDownloading}
          className="min-h-11 inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-black/25 px-4 py-2 text-sm text-white/85 hover:border-white/15 disabled:opacity-60"
        >
          <Download className="h-4 w-4" />
          {isDownloading ? "Preparing…" : "Download PNG"}
        </button>
      </div>

      <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-black/30">
        <svg
          ref={svgRef}
          viewBox="0 0 1080 1080"
          width="1080"
          height="1080"
          role="img"
          aria-label="SIP vs Panic share card"
        >
          <defs>
            <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0b0b0b" />
              <stop offset="100%" stopColor="#050505" />
            </linearGradient>
            <linearGradient id="gold" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#f2d28a" />
              <stop offset="55%" stopColor="#d8b468" />
              <stop offset="100%" stopColor="#f2d28a" />
            </linearGradient>
          </defs>

          <rect x="0" y="0" width="1080" height="1080" fill="url(#bg)" />
          <rect x="48" y="48" width="984" height="984" rx="36" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.08)" />

          <text x="96" y="150" fill="url(#gold)" fontSize="54" fontFamily="ui-sans-serif, system-ui" fontWeight="700">
            SIP vs Panic Selling
          </text>
          <text x="96" y="205" fill="rgba(255,255,255,0.72)" fontSize="26" fontFamily="ui-sans-serif, system-ui" fontWeight="500">
            Education-only simulator • Not investment advice
          </text>

          <g transform="translate(96, 275)">
            <rect x="0" y="0" width="888" height="156" rx="28" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" />
            <text x="28" y="54" fill="rgba(255,255,255,0.60)" fontSize="22" fontFamily="ui-sans-serif, system-ui" fontWeight="600">
              Behavioral cost (after-tax model)
            </text>
            <text x="28" y="122" fill="url(#gold)" fontSize="68" fontFamily="ui-sans-serif, system-ui" fontWeight="800">
              {formatLakhs(view.cost)}
            </text>
            <text x="450" y="120" fill="rgba(255,255,255,0.70)" fontSize="26" fontFamily="ui-sans-serif, system-ui" fontWeight="600">
              {view.pct > 0 ? `(~${view.pct}% of potential)` : ""}
            </text>
          </g>

          <g transform="translate(96, 460)">
            <rect x="0" y="0" width="430" height="230" rx="28" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" />
            <text x="28" y="58" fill="rgba(255,255,255,0.62)" fontSize="22" fontFamily="ui-sans-serif, system-ui" fontWeight="600">
              Stay disciplined
            </text>
            <text x="28" y="134" fill="rgba(255,255,255,0.92)" fontSize="46" fontFamily="ui-sans-serif, system-ui" fontWeight="800">
              {formatInr0(view.discipline)}
            </text>
            <text x="28" y="190" fill="rgba(255,255,255,0.56)" fontSize="18" fontFamily="ui-sans-serif, system-ui" fontWeight="500">
              Post-tax corpus (model)
            </text>
          </g>

          <g transform="translate(554, 460)">
            <rect x="0" y="0" width="430" height="230" rx="28" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" />
            <text x="28" y="58" fill="rgba(255,255,255,0.62)" fontSize="22" fontFamily="ui-sans-serif, system-ui" fontWeight="600">
              Panic behavior
            </text>
            <text x="28" y="134" fill="rgba(255,255,255,0.92)" fontSize="46" fontFamily="ui-sans-serif, system-ui" fontWeight="800">
              {formatInr0(view.panic)}
            </text>
            <text x="28" y="190" fill="rgba(255,255,255,0.56)" fontSize="18" fontFamily="ui-sans-serif, system-ui" fontWeight="500">
              Post-tax corpus (model)
            </text>
          </g>

          <g transform="translate(96, 720)">
            <rect x="0" y="0" width="888" height="190" rx="28" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.08)" />

            <text x="28" y="60" fill="rgba(255,255,255,0.75)" fontSize="22" fontFamily="ui-sans-serif, system-ui" fontWeight="600">
              Inputs
            </text>
            <text x="28" y="108" fill="rgba(255,255,255,0.90)" fontSize="30" fontFamily="ui-sans-serif, system-ui" fontWeight="700">
              {`₹${props.monthlyAmount.toLocaleString("en-IN")}/month • ${props.durationYears} years`}
            </text>

            <text x="28" y="152" fill="rgba(255,255,255,0.60)" fontSize="18" fontFamily="ui-sans-serif, system-ui" fontWeight="500">
              {`Crash preset: ${props.crashLabel}  •  Tax mode: ${props.taxModeLabel}`}
            </text>

            <text x="28" y="184" fill="rgba(255,255,255,0.55)" fontSize="16" fontFamily="ui-sans-serif, system-ui" fontWeight="500">
              {`Try it: ${view.shortUrl}`}
            </text>
          </g>

          <text x="96" y="1008" fill="rgba(255,255,255,0.50)" fontSize="18" fontFamily="ui-sans-serif, system-ui" fontWeight="500">
            BM Wealth Intelligence
          </text>
          <text x="954" y="1008" textAnchor="end" fill="rgba(255,255,255,0.40)" fontSize="16" fontFamily="ui-sans-serif, system-ui" fontWeight="500">
            Past performance does not guarantee future results.
          </text>
        </svg>
      </div>

      <div className="mt-2 text-[11px] text-white/55">
        Tip: Use the WhatsApp button above to share the tracked link (UTM), and this card for social posts.
      </div>
    </div>
  );
}
