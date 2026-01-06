import { jsPDF } from "jspdf";

function safe(v) {
  return String(v ?? "").trim();
}

function formatMoneyCompactINR(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "Rs. 0";
  // Custom Indian number formatting for PDF compatibility
  const absVal = Math.abs(Math.round(n));
  const sign = n < 0 ? "-" : "";
  const str = String(absVal);
  let formatted;
  if (str.length > 3) {
    const lastThree = str.slice(-3);
    const remaining = str.slice(0, -3);
    const groups = [];
    for (let i = remaining.length; i > 0; i -= 2) {
      groups.unshift(remaining.slice(Math.max(0, i - 2), i));
    }
    formatted = groups.join(",") + "," + lastThree;
  } else {
    formatted = str;
  }
  return sign + "Rs. " + formatted;
}

function clampLines(lines, maxLines) {
  const arr = Array.isArray(lines) ? lines.filter(Boolean) : [];
  if (arr.length <= maxLines) return arr;
  const head = arr.slice(0, Math.max(0, maxLines));
  if (!head.length) return [];
  // Deterministic truncation (no AI prose): last line ends with ellipsis.
  head[head.length - 1] = `${String(head[head.length - 1]).replace(/\s+$/, "")}…`;
  return head;
}

function addPageFrame(doc) {
  // Black/white only.
  doc.setTextColor(0, 0, 0);
}

function pageTitle(doc, title) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(title, 18, 28);
}

function sectionLabel(doc, text, y) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(text, 18, y);
}

function paragraph(doc, text, x, y, w, { fontSize = 10, maxLines = 20, lineGap = 5 } = {}) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(fontSize);
  const lines = doc.splitTextToSize(safe(text), w);
  const clamped = clampLines(lines, maxLines);
  doc.text(clamped, x, y);
  return y + clamped.length * lineGap;
}

function bullets(doc, items, x, y, w, { fontSize = 10, maxLines = 14, lineGap = 5 } = {}) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(fontSize);

  const out = [];
  for (const it of items || []) {
    const t = safe(it);
    if (!t) continue;
    const lines = doc.splitTextToSize(t, w - 6);
    for (let i = 0; i < lines.length; i++) {
      out.push(i === 0 ? `• ${lines[i]}` : `  ${lines[i]}`);
    }
  }

  const clamped = clampLines(out, maxLines);
  doc.text(clamped, x, y);
  return y + clamped.length * lineGap;
}

function checkboxList(doc, items, x, y, w, { fontSize = 10, maxLines = 14, lineGap = 6 } = {}) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(fontSize);

  const out = [];
  for (const it of items || []) {
    const t = safe(it);
    if (!t) continue;
    const lines = doc.splitTextToSize(t, w - 10);
    for (let i = 0; i < lines.length; i++) {
      out.push(i === 0 ? `☑ ${lines[i]}` : `   ${lines[i]}`);
    }
  }

  const clamped = clampLines(out, maxLines);
  doc.text(clamped, x, y);
  return y + clamped.length * lineGap;
}

function footer(doc, leftText) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(safe(leftText), 18, 286);
}

function stampFooterAllPages(doc, footerText) {
  const text = safe(footerText);
  if (!text) return;

  const pageCount = doc.getNumberOfPages();
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = Math.max(10, pageWidth - 24);

  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(150);
    const lines = doc.splitTextToSize(text, maxWidth);
    const clamped = clampLines(lines, 3);
    // Draw near the bottom margin.
    doc.text(clamped, pageWidth / 2, 292, { align: "center" });
  }

  // Reset to default black for subsequent drawing.
  doc.setTextColor(0, 0, 0);
}

function ensure15Pages(doc) {
  const total = doc.getNumberOfPages();
  if (total === 15) return;
  if (total > 15) {
    // Deterministic: do not allow > 15 pages.
    // jsPDF has no reliable deletePage across versions; so we throw.
    throw new Error("pdf_page_overflow");
  }
  // Pad with blank framed pages to reach exactly 15.
  for (let i = total + 1; i <= 15; i++) {
    doc.addPage();
    addPageFrame(doc);
  }
}

export function generateBmWealthBlueprint15PdfBytes(payload) {
  const p = payload || {};
  const v = p.variables || {};
  const meta = p.meta || {};
  const b = p.blocks || {};

  const userName = safe(v.userName || "");
  const income = safe(v.income || "");
  const regime = safe(v.regime || "");
  const tax = safe(v.tax || "");
  const savings = safe(v.savings || "");

  const section87A = safe(v.section87A || "");
  const standardDeduction = safe(v.standardDeduction || "");

  const generatedOn = safe(v.generatedOn || new Date().toLocaleString("en-IN"));

  const coverBrand = safe(meta.coverBrand || "BM WEALTH");
  const coverTitle = safe(meta.coverTitle || "Personal Tax Execution Blueprint");
  const coverSubtitle = safe(meta.coverSubtitle || "FY 2025–26");
  const footerLine = safe(meta.footerLine || "ARN 90008 | Educational use only");
  const disclaimerFooter = safe(meta.disclaimerFooter || "");

  const executionPlan = b.executionPlan || {
    APRIL: ["Declare correct regime with employer", "Update investment declarations"],
    JUNE: ["Align actual investments with declaration", "Avoid excess 80C locking"],
    SEPTEMBER: ["Mid-year tax check", "Correct under/over-declaration"],
    DECEMBER: ["Final optimization window", "NPS / insurance decisions (if applicable)"],
    MARCH: ["Final tax proof submission", "Avoid last-minute penalties"],
  };

  const caChecklist = b.caChecklist || [
    "Regime selection confirmation",
    "87A rebate eligibility",
    "Deduction caps not exceeded",
    "No unnecessary tax-saving products",
    "Proper documentation maintained",
  ];

  const checklistSplit = Math.max(1, Math.ceil(caChecklist.length / 2));
  const caChecklistA = caChecklist.slice(0, checklistSplit);
  const caChecklistB = caChecklist.slice(checklistSplit);

  const commonMistakes = b.commonMistakes || [
    "Staying in old regime out of habit",
    "Over-investing in 80C without need",
    "Missing rebate eligibility",
    "Late corrections causing interest",
  ];

  const savingsSteps = b.savingsSteps || [
    "Build emergency fund",
    "Align investments with goals",
    "Avoid forced tax-driven purchases",
  ];

  const doc = new jsPDF({ unit: "mm", format: "a4" });

  // PAGE 1 — COVER
  addPageFrame(doc);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(coverBrand, 18, 32);

  doc.setFontSize(22);
  doc.text(coverTitle, 18, 52);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.text(coverSubtitle, 18, 64);

  const coverLines = Array.isArray(b.coverLines) ? b.coverLines.filter(Boolean) : [];
  if (coverLines.length) {
    doc.setFontSize(12);
    const clamped = clampLines(coverLines.map((x) => safe(x)), 8);
    doc.text(clamped, 18, 92);
  } else {
    doc.setFontSize(12);
    doc.text(`Prepared for: ${userName || ""}`.trim(), 18, 92);
    doc.text(`Annual Income: ${income}`.trim(), 18, 104);
    doc.text(`Generated on: ${generatedOn}`.trim(), 18, 116);
  }
  footer(doc, footerLine);

  // PAGE 2 — EXECUTIVE SNAPSHOT
  doc.addPage();
  addPageFrame(doc);
  pageTitle(doc, safe(b.summaryPageTitle || "SUMMARY"));

  const summaryLines = Array.isArray(b.summaryLines) ? b.summaryLines.filter(Boolean) : [];
  let summaryEndY = 92;
  if (summaryLines.length) {
    let y = 52;
    for (const line of summaryLines.slice(0, 6)) {
      sectionLabel(doc, safe(line), y);
      y += 14;
    }
    summaryEndY = y;
  } else {
    sectionLabel(doc, `Recommended Tax Regime: ${regime}`.trim(), 52);
    sectionLabel(doc, `Your Estimated Tax Liability: ${tax}`.trim(), 66);
    sectionLabel(doc, `Potential Tax Leak Avoided: ${savings}`.trim(), 80);
    summaryEndY = 92;
  }

  const summaryParagraphY = Math.max(104, summaryEndY + 8);

  paragraph(
    doc,
    safe(
      b.summaryParagraph ||
        "This recommendation is based on FY 2025–26 tax rules,\nSection 87A rebate eligibility, and your declared inputs."
    ),
    18,
    summaryParagraphY,
    174,
    { fontSize: 10, maxLines: 6, lineGap: 5 }
  );

  // PAGE 3 — WHY THIS REGIME WORKS (1)
  doc.addPage();
  addPageFrame(doc);
  pageTitle(doc, safe(b.whyTitle || "WHY THIS WORKS FOR YOU"));

  const whyBullets = Array.isArray(b.whyBullets) ? b.whyBullets.filter(Boolean) : null;
  const defaultWhy = [
    section87A,
    `Standard Deduction advantage: ${standardDeduction}`.trim(),
    "Deduction utilization efficiency",
    "Marginal relief considerations (if applicable)",
  ];
  bullets(doc, whyBullets && whyBullets.length ? whyBullets : defaultWhy, 18, 52, 174, {
    fontSize: 11,
    maxLines: 14,
    lineGap: 6,
  });

  // PAGE 4 — WHY THIS REGIME WORKS (2)
  doc.addPage();
  addPageFrame(doc);
  pageTitle(doc, safe(b.whyTitle || "WHY THIS WORKS FOR YOU"));
  sectionLabel(doc, safe(b.keyInsightLabel || "Key Insight:"), 52);
  paragraph(
    doc,
    safe(
      b.keyInsightText || `At your income level, ${regime} regime minimizes\neffective tax without increasing compliance risk.`
    ),
    18,
    64,
    174,
    { fontSize: 12, maxLines: 6, lineGap: 6 }
  );

  // PAGE 5 — EXECUTION TIMELINE (APRIL + JUNE)
  doc.addPage();
  addPageFrame(doc);
  pageTitle(doc, safe(b.executionTitle || "EXECUTION TIMELINE"));
  sectionLabel(doc, "APRIL", 52);
  bullets(doc, executionPlan.APRIL || [], 22, 62, 170, { fontSize: 11, maxLines: 8, lineGap: 6 });
  sectionLabel(doc, "JUNE", 104);
  bullets(doc, executionPlan.JUNE || [], 22, 114, 170, { fontSize: 11, maxLines: 8, lineGap: 6 });

  // PAGE 6 — EXECUTION TIMELINE (SEPTEMBER)
  doc.addPage();
  addPageFrame(doc);
  pageTitle(doc, safe(b.executionTitle || "EXECUTION TIMELINE"));
  sectionLabel(doc, "SEPTEMBER", 52);
  bullets(doc, executionPlan.SEPTEMBER || [], 22, 62, 170, { fontSize: 11, maxLines: 12, lineGap: 6 });

  // PAGE 7 — EXECUTION TIMELINE (DECEMBER)
  doc.addPage();
  addPageFrame(doc);
  pageTitle(doc, safe(b.executionTitle || "EXECUTION TIMELINE"));
  sectionLabel(doc, "DECEMBER", 52);
  bullets(doc, executionPlan.DECEMBER || [], 22, 62, 170, { fontSize: 11, maxLines: 12, lineGap: 6 });

  // PAGE 8 — EXECUTION TIMELINE (MARCH)
  doc.addPage();
  addPageFrame(doc);
  pageTitle(doc, safe(b.executionTitle || "EXECUTION TIMELINE"));
  sectionLabel(doc, "MARCH", 52);
  bullets(doc, executionPlan.MARCH || [], 22, 62, 170, { fontSize: 11, maxLines: 12, lineGap: 6 });

  // PAGE 9 — CA CHECKLIST (1)
  doc.addPage();
  addPageFrame(doc);
  pageTitle(doc, safe(b.checklistTitle || "WHAT TO CONFIRM WITH YOUR CA"));
  checkboxList(doc, caChecklistA, 18, 52, 174, { fontSize: 11, maxLines: 12, lineGap: 7 });

  // PAGE 10 — CA CHECKLIST (2)
  doc.addPage();
  addPageFrame(doc);
  pageTitle(doc, safe(b.checklistTitle || "WHAT TO CONFIRM WITH YOUR CA"));
  checkboxList(doc, caChecklistB.length ? caChecklistB : caChecklistA, 18, 52, 174, { fontSize: 11, maxLines: 12, lineGap: 7 });

  // PAGE 11 — COMMON MISTAKES (1)
  doc.addPage();
  addPageFrame(doc);
  pageTitle(doc, safe(b.mistakesTitle || "COMMON TAX MISTAKES AT YOUR INCOME LEVEL"));
  bullets(doc, commonMistakes.slice(0, 2), 18, 52, 174, { fontSize: 11, maxLines: 10, lineGap: 7 });

  // PAGE 12 — COMMON MISTAKES (2)
  doc.addPage();
  addPageFrame(doc);
  pageTitle(doc, safe(b.mistakesTitle || "COMMON TAX MISTAKES AT YOUR INCOME LEVEL"));
  bullets(doc, commonMistakes.slice(2), 18, 52, 174, { fontSize: 11, maxLines: 10, lineGap: 7 });

  // PAGE 13 — NEXT WEALTH MOVE (1)
  doc.addPage();
  addPageFrame(doc);
  pageTitle(doc, safe(b.stepsTitle || "WHAT TO DO WITH TAX SAVINGS"));
  bullets(doc, savingsSteps.slice(0, 2), 18, 52, 174, { fontSize: 11, maxLines: 10, lineGap: 7 });

  // PAGE 14 — NEXT WEALTH MOVE (2)
  doc.addPage();
  addPageFrame(doc);
  pageTitle(doc, safe(b.stepsTitle || "WHAT TO DO WITH TAX SAVINGS"));
  bullets(doc, savingsSteps.slice(2), 18, 52, 174, { fontSize: 11, maxLines: 6, lineGap: 7 });
  paragraph(
    doc,
    safe(b.stepsNote || "Note:\nThis document does not recommend specific products."),
    18,
    110,
    174,
    { fontSize: 10, maxLines: 6, lineGap: 5 }
  );

  // PAGE 15 — DISCLAIMER & AUTHORITY
  doc.addPage();
  addPageFrame(doc);
  pageTitle(doc, safe(b.disclaimerTitle || "DISCLAIMER"));
  paragraph(
    doc,
    safe(
      b.disclaimerText ||
        "This document is a mathematical execution guide\nbased on declared inputs and prevailing tax rules.\n\nNot investment advice.\nNo product recommendations.\nARN 90008 | IRDAI 277925\nBM Wealth – Mumbai"
    ),
    18,
    52,
    174,
    { fontSize: 12, maxLines: 16, lineGap: 6 }
  );

  // Ensure exactly 15 pages.
  ensure15Pages(doc);

  // Stamp a subtle compliance footer on every page.
  stampFooterAllPages(doc, disclaimerFooter || footerLine);

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}

export function buildBmWealthTaxPayload({ lead, inputs, compare }) {
  const annualSalary = Number(inputs?.annualSalary || 0);

  const winner = compare?.winner || "tie";
  const bestKey = winner === "old" ? "old" : "new";
  const best = compare?.[bestKey];

  const regimeText = winner === "old" ? "Old" : "New";
  const taxAmount = best?.taxAmount;
  const savings = compare?.savings;

  const taxableIncome = Number(best?.taxableIncome || 0);
  const rebateThreshold = winner === "old" ? 5_00_000 : 12_00_000;
  const section87A =
    taxableIncome <= rebateThreshold
      ? "Your income qualifies for Section 87A"
      : "Your income does not qualify for Section 87A";

  const std = Number(best?.standardDeduction || 0);
  const stdText = std >= 75_000 ? "₹75K" : std >= 50_000 ? "₹50K" : formatMoneyCompactINR(std);

  return {
    variables: {
      userName: safe(lead?.name || ""),
      income: formatMoneyCompactINR(annualSalary),
      regime: regimeText,
      tax: formatMoneyCompactINR(taxAmount),
      savings: formatMoneyCompactINR(savings),
      generatedOn: new Date().toLocaleString("en-IN"),
      section87A,
      standardDeduction: stdText,
    },
    blocks: {},
  };
}
