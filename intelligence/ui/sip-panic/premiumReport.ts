import type { SIPSimulationResult } from "@/intelligence/simulations/sip-vs-panic";

function inr0(amount: number): string {
  const v = Number.isFinite(amount) ? Math.max(0, amount) : 0;
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);
}

async function svgToPngDataUrl(svg: SVGSVGElement, opts?: { background?: string; maxPx?: number }) {
  const background = opts?.background ?? "#070708";

  const viewBox = svg.viewBox?.baseVal;
  const vbW = Math.max(1, Number(viewBox?.width || svg.getAttribute("width") || 900));
  const vbH = Math.max(1, Number(viewBox?.height || svg.getAttribute("height") || 360));

  const maxPx = Math.max(1200, Math.min(6000, Number(opts?.maxPx ?? 3600)));
  // Force an upscale so charts don't look blurry in PDFs.
  const scale = Math.max(2, Math.min(4, maxPx / Math.max(vbW, vbH)));
  const pixelW = Math.round(vbW * scale);
  const pixelH = Math.round(vbH * scale);

  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("xmlns:xlink", "http://www.w3.org/1999/xlink");
  clone.setAttribute("width", String(vbW));
  clone.setAttribute("height", String(vbH));

  const xml = new XMLSerializer().serializeToString(clone);
  const svgBlob = new Blob([`<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n${xml}`], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

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
    if (!ctx) throw new Error("Canvas not supported");

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    ctx.fillStyle = background;
    ctx.fillRect(0, 0, pixelW, pixelH);
    ctx.drawImage(img, 0, 0, pixelW, pixelH);

    return canvas.toDataURL("image/png");
  } finally {
    URL.revokeObjectURL(url);
  }
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

  const PAGE_W = doc.internal.pageSize.getWidth();
  const PAGE_H = doc.internal.pageSize.getHeight();
  const TITLE = "SIP vs Panic Selling - Your Financial Analysis";
  const preparedOn = new Date().toLocaleDateString("en-IN");

  const drawChrome = () => {
    // Background
    doc.setFillColor(7, 7, 8);
    doc.rect(0, 0, PAGE_W, PAGE_H, "F");

    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(16);
    doc.setTextColor(212, 175, 55);
    doc.text(TITLE, 14, 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(185, 185, 185);
    doc.text(`BM Wealth • Prepared on ${preparedOn}`, 14, 25);

    doc.setDrawColor(45, 45, 52);
    doc.setLineWidth(0.3);
    doc.line(14, 28, 196, 28);

    // Footer
    doc.setDrawColor(45, 45, 52);
    doc.setLineWidth(0.3);
    doc.line(14, 284, 196, 284);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 160);
    doc.text("Education-only. Not investment/tax/legal advice.", 14, 290);
    doc.text("bmwealth.co.in • +91 8850977259 • ARN 90008", 196, 290, { align: "right" });

    const pageNumber = doc.getCurrentPageInfo().pageNumber;
    const total = doc.getNumberOfPages();
    doc.setTextColor(120, 120, 120);
    doc.text(`${pageNumber}/${total}`, 196, 295, { align: "right" });
  };

  // First page chrome
  drawChrome();

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
    const dataUrl = await svgToPngDataUrl(svg, { background: "#070708", maxPx: 3600 });

    doc.setDrawColor(45, 45, 52);
    doc.setLineWidth(0.4);
    doc.roundedRect(14, 116, 182, 66, 3, 3, "S");
    doc.addImage(dataUrl, "PNG", 15, 117, 180, 64, undefined, "SLOW");

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(170, 170, 170);
    doc.text("Chart: post-tax corpus over time (discipline vs selected behaviors).", 15, 186);
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
    styles: {
      fontSize: 9,
      textColor: [230, 230, 230],
      fillColor: [12, 12, 13],
      lineColor: [45, 45, 52],
      lineWidth: 0.2,
      cellPadding: 2.2,
      overflow: "linebreak",
      valign: "middle",
    },
    headStyles: { fillColor: [0, 0, 0], textColor: [212, 175, 55], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [10, 10, 12] },
    theme: "grid",
    margin: { left: 14, right: 14 },
    columnStyles: {
      1: { halign: "right" },
      2: { halign: "right" },
      3: { halign: "right" },
      4: { halign: "right" },
      5: { halign: "right" },
    },
    didDrawPage: () => {
      drawChrome();
    },
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
    styles: {
      fontSize: 8,
      textColor: [230, 230, 230],
      fillColor: [12, 12, 13],
      lineColor: [45, 45, 52],
      lineWidth: 0.2,
      cellPadding: 2,
      overflow: "linebreak",
      valign: "middle",
    },
    headStyles: { fillColor: [0, 0, 0], textColor: [212, 175, 55], fontStyle: "bold" },
    alternateRowStyles: { fillColor: [10, 10, 12] },
    theme: "grid",
    margin: { left: 14, right: 14 },
    columnStyles: {
      2: { halign: "right" },
      3: { halign: "right" },
      4: { halign: "right" },
      5: { halign: "right" },
      6: { halign: "right" },
    },
    didDrawPage: () => {
      drawChrome();
    },
  });

  const afterTaxY = (doc as any).lastAutoTable?.finalY ?? endY;

  // If we're too close to the footer, continue on a new page.
  let y = afterTaxY + 10;
  if (y > 250) {
    doc.addPage();
    drawChrome();
    y = 36;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(255, 255, 255);
  doc.text("Key insights", 14, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(200, 200, 200);

  const insights = [
    worst && discipline ? `Behavioral cost vs discipline: ${inr0(worst.behavioralCost)}` : "Behavioral cost depends on your selected behavior.",
    "Behavioral cost is not a market crash loss; it’s a behavior-driven gap vs staying disciplined.",
    "Discipline tends to win because you keep buying through drawdowns and participate in the recovery.",
  ];

  y += 6;
  for (let i = 0; i < insights.length; i += 1) {
    const lines = doc.splitTextToSize(`${i + 1}. ${insights[i]}`, 182);
    doc.text(lines, 14, y);
    y += lines.length * 5.2;
  }

  y += 4;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text("Action plan (education-only)", 14, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(200, 200, 200);
  const actions = [
    "Write your SIP rule before the next crash (e.g., keep SIP on, rebalance only on dates, not feelings).",
    "Keep an emergency buffer so you’re not forced to stop SIP during volatility.",
    "If panic is likely, automate decisions (SIP auto-debit + a pre-decided rebalancing calendar).",
  ];
  y += 6;
  for (let i = 0; i < actions.length; i += 1) {
    const lines = doc.splitTextToSize(`${i + 1}. ${actions[i]}`, 182);
    doc.text(lines, 14, y);
    y += lines.length * 5.2;
  }

  y += 4;
  if (y > 250) {
    doc.addPage();
    drawChrome();
    y = 36;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(255, 255, 255);
  doc.text("Glossary", 14, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(200, 200, 200);
  const glossary = [
    "SIP: Systematic Investment Plan (a fixed amount invested regularly).",
    "Drawdown: % fall from the market’s recent peak.",
    "XIRR: Annualized return accounting for timing of cashflows.",
    "STCG/LTCG: Short/Long Term Capital Gains (tax categories; simplified here).",
    "Behavioral cost: After-tax gap between staying disciplined and the worst selected behavior.",
  ];
  y += 6;
  for (let i = 0; i < glossary.length; i += 1) {
    const lines = doc.splitTextToSize(`${i + 1}. ${glossary[i]}`, 182);
    doc.text(lines, 14, y);
    y += lines.length * 5.1;
  }

  const stamp = new Date().toISOString().slice(0, 10);
  doc.save(`BM-Wealth_SIP-vs-Panic_${stamp}.pdf`);
}
