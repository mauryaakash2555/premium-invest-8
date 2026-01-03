import { jsPDF } from "jspdf";

function safe(v) {
  return String(v ?? "").trim();
}

function formatMoneyCompactINR(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "₹0";
  // Print-friendly: no decimals.
  return n.toLocaleString("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });
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

  const userName = safe(v.userName || "");
  const income = safe(v.income || "");
  const regime = safe(v.regime || "");
  const tax = safe(v.tax || "");
  const savings = safe(v.savings || "");

  const section87A = safe(v.section87A || "");
  const standardDeduction = safe(v.standardDeduction || "");

  const generatedOn = safe(v.generatedOn || new Date().toLocaleString("en-IN"));

  const executionPlan = p.blocks?.executionPlan || {
    APRIL: ["Declare correct regime with employer", "Update investment declarations"],
    JUNE: ["Align actual investments with declaration", "Avoid excess 80C locking"],
    SEPTEMBER: ["Mid-year tax check", "Correct under/over-declaration"],
    DECEMBER: ["Final optimization window", "NPS / insurance decisions (if applicable)"],
    MARCH: ["Final tax proof submission", "Avoid last-minute penalties"],
  };

  const caChecklist = p.blocks?.caChecklist || [
    "Regime selection confirmation",
    "87A rebate eligibility",
    "Deduction caps not exceeded",
    "No unnecessary tax-saving products",
    "Proper documentation maintained",
  ];

  const checklistSplit = Math.max(1, Math.ceil(caChecklist.length / 2));
  const caChecklistA = caChecklist.slice(0, checklistSplit);
  const caChecklistB = caChecklist.slice(checklistSplit);

  const commonMistakes = p.blocks?.commonMistakes || [
    "Staying in old regime out of habit",
    "Over-investing in 80C without need",
    "Missing rebate eligibility",
    "Late corrections causing interest",
  ];

  const savingsSteps = p.blocks?.savingsSteps || [
    "Build emergency fund",
    "Align investments with goals",
    "Avoid forced tax-driven purchases",
  ];

  const doc = new jsPDF({ unit: "mm", format: "a4" });

  // PAGE 1 — COVER
  addPageFrame(doc);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("BM WEALTH", 18, 32);

  doc.setFontSize(22);
  doc.text("Personal Tax Execution Blueprint", 18, 52);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(14);
  doc.text("FY 2025–26", 18, 64);

  doc.setFontSize(12);
  doc.text(`Prepared for: ${userName || ""}`.trim(), 18, 92);
  doc.text(`Annual Income: ${income}`.trim(), 18, 104);
  doc.text(`Generated on: ${generatedOn}`.trim(), 18, 116);

  footer(doc, "ARN 90008 | Educational use only");

  // PAGE 2 — EXECUTIVE SNAPSHOT
  doc.addPage();
  addPageFrame(doc);
  pageTitle(doc, "SUMMARY");

  sectionLabel(doc, `Recommended Tax Regime: ${regime}`.trim(), 52);
  sectionLabel(doc, `Your Estimated Tax Liability: ${tax}`.trim(), 66);
  sectionLabel(doc, `Potential Tax Leak Avoided: ${savings}`.trim(), 80);

  paragraph(
    doc,
    "This recommendation is based on FY 2025–26 tax rules,\nSection 87A rebate eligibility, and your declared inputs.",
    18,
    104,
    174,
    { fontSize: 10, maxLines: 6, lineGap: 5 }
  );

  // PAGE 3 — WHY THIS REGIME WORKS (1)
  doc.addPage();
  addPageFrame(doc);
  pageTitle(doc, "WHY THIS WORKS FOR YOU");
  bullets(
    doc,
    [
      section87A,
      `Standard Deduction advantage: ${standardDeduction}`.trim(),
      "Deduction utilization efficiency",
      "Marginal relief considerations (if applicable)",
    ],
    18,
    52,
    174,
    { fontSize: 11, maxLines: 14, lineGap: 6 }
  );

  // PAGE 4 — WHY THIS REGIME WORKS (2)
  doc.addPage();
  addPageFrame(doc);
  pageTitle(doc, "WHY THIS WORKS FOR YOU");
  sectionLabel(doc, "Key Insight:", 52);
  paragraph(
    doc,
    `At your income level, ${regime} regime minimizes\neffective tax without increasing compliance risk.`,
    18,
    64,
    174,
    { fontSize: 12, maxLines: 6, lineGap: 6 }
  );

  // PAGE 5 — EXECUTION TIMELINE (APRIL + JUNE)
  doc.addPage();
  addPageFrame(doc);
  pageTitle(doc, "EXECUTION TIMELINE");
  sectionLabel(doc, "APRIL", 52);
  bullets(doc, executionPlan.APRIL || [], 22, 62, 170, { fontSize: 11, maxLines: 8, lineGap: 6 });
  sectionLabel(doc, "JUNE", 104);
  bullets(doc, executionPlan.JUNE || [], 22, 114, 170, { fontSize: 11, maxLines: 8, lineGap: 6 });

  // PAGE 6 — EXECUTION TIMELINE (SEPTEMBER)
  doc.addPage();
  addPageFrame(doc);
  pageTitle(doc, "EXECUTION TIMELINE");
  sectionLabel(doc, "SEPTEMBER", 52);
  bullets(doc, executionPlan.SEPTEMBER || [], 22, 62, 170, { fontSize: 11, maxLines: 12, lineGap: 6 });

  // PAGE 7 — EXECUTION TIMELINE (DECEMBER)
  doc.addPage();
  addPageFrame(doc);
  pageTitle(doc, "EXECUTION TIMELINE");
  sectionLabel(doc, "DECEMBER", 52);
  bullets(doc, executionPlan.DECEMBER || [], 22, 62, 170, { fontSize: 11, maxLines: 12, lineGap: 6 });

  // PAGE 8 — EXECUTION TIMELINE (MARCH)
  doc.addPage();
  addPageFrame(doc);
  pageTitle(doc, "EXECUTION TIMELINE");
  sectionLabel(doc, "MARCH", 52);
  bullets(doc, executionPlan.MARCH || [], 22, 62, 170, { fontSize: 11, maxLines: 12, lineGap: 6 });

  // PAGE 9 — CA CHECKLIST (1)
  doc.addPage();
  addPageFrame(doc);
  pageTitle(doc, "WHAT TO CONFIRM WITH YOUR CA");
  checkboxList(doc, caChecklistA, 18, 52, 174, { fontSize: 11, maxLines: 12, lineGap: 7 });

  // PAGE 10 — CA CHECKLIST (2)
  doc.addPage();
  addPageFrame(doc);
  pageTitle(doc, "WHAT TO CONFIRM WITH YOUR CA");
  checkboxList(doc, caChecklistB.length ? caChecklistB : caChecklistA, 18, 52, 174, { fontSize: 11, maxLines: 12, lineGap: 7 });

  // PAGE 11 — COMMON MISTAKES (1)
  doc.addPage();
  addPageFrame(doc);
  pageTitle(doc, "COMMON TAX MISTAKES AT YOUR INCOME LEVEL");
  bullets(doc, commonMistakes.slice(0, 2), 18, 52, 174, { fontSize: 11, maxLines: 10, lineGap: 7 });

  // PAGE 12 — COMMON MISTAKES (2)
  doc.addPage();
  addPageFrame(doc);
  pageTitle(doc, "COMMON TAX MISTAKES AT YOUR INCOME LEVEL");
  bullets(doc, commonMistakes.slice(2), 18, 52, 174, { fontSize: 11, maxLines: 10, lineGap: 7 });

  // PAGE 13 — NEXT WEALTH MOVE (1)
  doc.addPage();
  addPageFrame(doc);
  pageTitle(doc, "WHAT TO DO WITH TAX SAVINGS");
  bullets(doc, savingsSteps.slice(0, 2), 18, 52, 174, { fontSize: 11, maxLines: 10, lineGap: 7 });

  // PAGE 14 — NEXT WEALTH MOVE (2)
  doc.addPage();
  addPageFrame(doc);
  pageTitle(doc, "WHAT TO DO WITH TAX SAVINGS");
  bullets(doc, savingsSteps.slice(2), 18, 52, 174, { fontSize: 11, maxLines: 6, lineGap: 7 });
  paragraph(doc, "Note:\nThis document does not recommend specific products.", 18, 110, 174, { fontSize: 10, maxLines: 4, lineGap: 5 });

  // PAGE 15 — DISCLAIMER & AUTHORITY
  doc.addPage();
  addPageFrame(doc);
  pageTitle(doc, "DISCLAIMER");
  paragraph(
    doc,
    "This document is a mathematical execution guide\nbased on declared inputs and prevailing tax rules.\n\nNot investment advice.\nNo product recommendations.\nARN 90008 | IRDAI 277925\nBM Wealth – Mumbai",
    18,
    52,
    174,
    { fontSize: 12, maxLines: 16, lineGap: 6 }
  );

  // Ensure exactly 15 pages.
  ensure15Pages(doc);

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
