import type { SIPSimulationResult } from "@/intelligence/simulations/sip-vs-panic";

function inr0(amount: number): string {
  const v = Number.isFinite(amount) ? Math.max(0, amount) : 0;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);
}

async function svgToPngDataUrl(svg: SVGSVGElement, opts?: { background?: string; maxPx?: number }) {
  const background = opts?.background ?? "#070708";
  const maxPx = Math.max(800, Math.min(6000, opts?.maxPx ?? 3200));

  const xml = new XMLSerializer().serializeToString(svg);
  const svgBlob = new Blob([`<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n${xml}`], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();
  img.decoding = "async";

  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Failed to load SVG"));
    img.src = url;
  });

  const w = Math.max(1, img.width || 1200);
  const h = Math.max(1, img.height || 630);
  const scale = Math.min(1, maxPx / Math.max(w, h));

  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.fillStyle = background;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  URL.revokeObjectURL(url);

  return canvas.toDataURL("image/png");
}

export async function downloadPremiumReport(params: {
  results: SIPSimulationResult[];
  monthlyAmount: number;
  durationYears: number;
  riskComfort: string;
  taxProfile: string;
  taxCalcMode?: string;
  marketAssumptionTitle?: string;
  chartSvgId: string;
}) {
  const { results, monthlyAmount, durationYears, riskComfort, taxProfile, taxCalcMode, marketAssumptionTitle, chartSvgId } = params;

  const discipline = results.find((r) => r.scenario.behaviorType === "discipline") ?? null;
  const worst = results
    .filter((r) => r.scenario.behaviorType !== "discipline")
    .sort((a, b) => (b.behavioralCost ?? 0) - (a.behavioralCost ?? 0))[0] ?? null;

  const worstRule = (() => {
    if (!worst) return "—";
    if (worst.scenario.behaviorType === "custom") {
      const th = Math.abs(Number(worst.scenario.panicThreshold ?? -30));
      const stop = Number.isFinite((worst.scenario as any).stopDuration) ? Number((worst.scenario as any).stopDuration) : undefined;
      return stop ? `Custom: stop at ${th}% drawdown, resume after ${stop} months` : `Custom: stop at ${th}% drawdown`;
    }
    if (worst.scenario.behaviorType === "panic" && worst.scenario.panicThreshold === -1) return "Pause SIP in any red month";
    if (worst.scenario.behaviorType === "panic" && typeof worst.scenario.panicThreshold === "number") {
      return `Stop SIP at ${Math.abs(worst.scenario.panicThreshold)}% drawdown`;
    }
    return worst.scenario.name;
  })();

  const { jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait", compress: true });

  // Background
  doc.setFillColor(7, 7, 8);
  doc.rect(0, 0, doc.internal.pageSize.getWidth(), doc.internal.pageSize.getHeight(), "F");

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(212, 175, 55);
  doc.text("SIP vs Panic Selling - Your Financial Analysis", 14, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(185, 185, 185);
  doc.text(`Prepared by BM Wealth • ${new Date().toLocaleDateString()}`, 14, 25);

  // Parameters
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text("Client parameters", 14, 36);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(215, 215, 215);
  doc.text(`Monthly investment: ${inr0(monthlyAmount)}`, 14, 43);
  doc.text(`Duration: ${durationYears} years`, 14, 49);
  doc.text(`Risk profile: ${riskComfort}`, 14, 55);
  doc.text("Tax profile:", 14, 61);
  {
    const lines = doc.splitTextToSize(String(taxProfile), 160);
    doc.text(lines, 34, 61);
  }

  doc.text("Panic rule:", 14, 67);
  {
    const lines = doc.splitTextToSize(String(worstRule), 160);
    doc.text(lines, 34, 67);
  }

  if (taxCalcMode) {
    doc.text("Tax mode:", 14, 73);
    const lines = doc.splitTextToSize(String(taxCalcMode), 160);
    doc.text(lines, 34, 73);
  }
  if (marketAssumptionTitle) {
    doc.text("Market assumption:", 14, taxCalcMode ? 79 : 73);
    const lines = doc.splitTextToSize(String(marketAssumptionTitle), 160);
    doc.text(lines, 45, taxCalcMode ? 79 : 73);
  }

  // Headline results
  if (discipline && worst) {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(255, 255, 255);
    doc.text("Summary (after tax)", 14, marketAssumptionTitle || taxCalcMode ? 89 : 80);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(215, 215, 215);
    const baseY = (marketAssumptionTitle || taxCalcMode ? 95 : 86);
    doc.text(`Stay disciplined: ${inr0(discipline.postTaxCorpus)}`, 14, baseY);
    doc.text(`${worstRule}: ${inr0(worst.postTaxCorpus)}`, 14, baseY + 6);
    doc.setTextColor(255, 125, 125);
    doc.text(`Behavioral cost: ${inr0(worst.behavioralCost ?? 0)}`, 14, baseY + 12);
  }

  // Chart
  const svg = document.getElementById(chartSvgId) as unknown as SVGSVGElement | null;
  if (svg) {
    const clone = svg.cloneNode(true) as SVGSVGElement;
    const dataUrl = await svgToPngDataUrl(clone, { background: "#070708", maxPx: 2400 });

    doc.setDrawColor(45, 45, 52);
    doc.setLineWidth(0.4);
    doc.roundedRect(14, 116, 182, 66, 3, 3, "S");
    doc.addImage(dataUrl, "PNG", 15, 117, 180, 64, undefined, "SLOW");
  }

  // Results table
  const rows = results.map((r) => [
    r.scenario.name,
    inr0(r.totalInvested),
    inr0(r.finalCorpus),
    inr0(r.postTaxCorpus),
    `${(Number.isFinite(r.xirr) ? r.xirr : 0).toFixed(1)}%`,
    r.scenario.behaviorType === "discipline" ? "—" : `-${inr0(r.behavioralCost)}`,
  ]);

  autoTable(doc, {
    startY: 192,
    head: [["Scenario", "Invested", "Final", "Post-tax", "XIRR", "Behavioral cost"]],
    body: rows,
    styles: { fontSize: 9, textColor: [230, 230, 230], fillColor: [12, 12, 13], lineColor: [45, 45, 52] },
    headStyles: { fillColor: [0, 0, 0], textColor: [212, 175, 55] },
    theme: "grid",
    margin: { left: 14, right: 14 },
  });

  const endY = (doc as any).lastAutoTable?.finalY ?? 200;

  // Tax breakdown (education-only)
  const taxRows = [
    discipline ? { label: "Discipline", r: discipline } : null,
    worst ? { label: "Worst behavior", r: worst } : null,
  ]
    .filter(Boolean)
    .map((x) => {
      const item = x as { label: string; r: SIPSimulationResult };
      const b = item.r.taxBreakdown;
      const gains = b?.capitalGain ?? item.r.absoluteGains ?? 0;
      return [
        item.label,
        b?.category ?? "—",
        inr0(Math.max(0, gains)),
        inr0(b?.baseTax ?? 0),
        inr0(b?.surcharge ?? 0),
        inr0(b?.cess ?? 0),
        inr0(b?.totalTax ?? item.r.taxPaid ?? 0),
      ];
    });

  autoTable(doc, {
    startY: Math.min(270, endY + 8),
    head: [["Tax breakdown", "Type", "Gains", "Base tax", "Surcharge", "Cess", "Total tax"]],
    body: taxRows,
    styles: { fontSize: 8, textColor: [230, 230, 230], fillColor: [12, 12, 13], lineColor: [45, 45, 52] },
    headStyles: { fillColor: [0, 0, 0], textColor: [212, 175, 55] },
    theme: "grid",
    margin: { left: 14, right: 14 },
  });

  const afterTaxY = (doc as any).lastAutoTable?.finalY ?? endY;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text("Key insights", 14, Math.min(276, afterTaxY + 10));

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(200, 200, 200);

  const insights = [
    worst && discipline ? `Behavioral cost vs discipline: ${inr0(worst.behavioralCost)}` : "Behavioral cost depends on your panic behavior.",
    "Discipline tends to win because you keep buying when prices are down.",
    "A written plan (rules + buffer) reduces the chance of panic selling.",
  ];

  let y = Math.min(276, afterTaxY + 16);
  for (let i = 0; i < insights.length; i += 1) {
    doc.text(`${i + 1}. ${insights[i]}`, 16, y);
    y += 6;
  }

  doc.setFontSize(8);
  doc.setTextColor(160, 160, 160);
  doc.text("Education-only. Not investment/tax/legal advice. Mutual fund investments are subject to market risks.", 14, 287);

  const stamp = new Date().toISOString().slice(0, 10);
  doc.save(`SIP_Panic_Report_${stamp}.pdf`);
}
