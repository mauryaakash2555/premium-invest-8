import { jsPDF } from "jspdf";

function safe(v) {
  return String(v ?? "").trim();
}

function formatINR0(value) {
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

function setMeta(doc, { title, subject, keywords }) {
  try {
    doc.setProperties({
      title: safe(title),
      subject: safe(subject),
      keywords: safe(keywords),
      creator: "BM Wealth",
      author: "BM Wealth",
    });
  } catch {
    // best-effort
  }
}

function header(doc, { userName, income }) {
  doc.setTextColor(0, 0, 0);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("BM WEALTH", 16, 18);

  doc.setFontSize(16);
  doc.text("FY 2025–26 Personalized Tax Optimization Roadmap", 16, 30);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`${safe(userName)}${userName ? "" : ""} | Income Bracket: ${safe(income)}`.trim(), 16, 38);
  doc.setFontSize(9);
  doc.text(`Prepared on: ${new Date().toLocaleDateString("en-IN")}`, 16, 44);

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.2);
  doc.line(16, 48, 196, 48);
}

function footer(doc) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);

  const leftX = 16;
  let y = 286;
  doc.text("BM Wealth • bmwealth.co.in • +91 8850977259 • ARN 90008", leftX, y);
  y -= 5;
  doc.text("Disclaimer: Educational projection based on declared inputs and prevailing FY rules.", leftX, y);
  y -= 5;
  doc.text("Not investment/tax/legal advice. For execution support, consult BM Wealth.", leftX, y);
}

function stampPageNumbers(doc) {
  const total = doc.getNumberOfPages();
  const pageW = doc.internal.pageSize.getWidth();
  for (let i = 1; i <= total; i += 1) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`Page ${i} of ${total}`, pageW - 16, 292, { align: "right" });
  }
  doc.setTextColor(0, 0, 0);
}

function sectionTitle(doc, title, y) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(title, 16, y);
}

function bulletLines(doc, bullets, x, y, maxWidth, { fontSize = 10, maxLines = 12, lineGap = 5 } = {}) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(fontSize);

  const linesOut = [];
  for (const b of bullets || []) {
    const t = safe(b);
    if (!t) continue;
    const wrapped = doc.splitTextToSize(t, maxWidth - 6);
    for (let i = 0; i < wrapped.length; i++) {
      linesOut.push(i === 0 ? `• ${wrapped[i]}` : `  ${wrapped[i]}`);
    }
  }

  const clamped = linesOut.slice(0, Math.max(0, maxLines));
  if (linesOut.length > maxLines && clamped.length) {
    clamped[clamped.length - 1] = `${String(clamped[clamped.length - 1]).replace(/\s+$/, "")}…`;
  }

  doc.text(clamped, x, y);
  return y + clamped.length * lineGap;
}

export function generateBmWealthPremiumReportPdfBytes(payload) {
  const p = payload || {};
  const v = p.variables || {};

  const userName = safe(v.userName);
  const income = safe(v.income);
  const regime = safe(v.regime);
  const tax = safe(v.tax);
  const savings = safe(v.savings);
  const monthlyLiquidity = safe(v.monthlyLiquidity);

  const doc = new jsPDF({ unit: "mm", format: "a4" });

  setMeta(doc, {
    title: "BM Wealth | FY 2025–26 Personalized Tax Optimization Roadmap",
    subject: "Educational use only | ARN 90008",
    keywords: "BM Wealth, Tax Optimization, ARN 90008, FY 2025-26",
  });

  header(doc, { userName, income });

  // SECTION 1
  sectionTitle(doc, "SECTION 1: TAX COMPARISON SNAPSHOT", 62);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Potential tax leak avoided: ${savings}`, 16, 72);
  doc.text(`Recommended regime: ${regime}`, 16, 79);

  doc.setFont("helvetica", "italic");
  doc.text(
    `By switching to the ${regime}, you reclaim ${monthlyLiquidity} per month in liquidity.`,
    16,
    88
  );

  // SECTION 2
  sectionTitle(doc, "SECTION 2: PREMIUM EXECUTION CALENDAR (TAX & COMPLIANCE FOCUS)", 106);
  bulletLines(
    doc,
    [
      "April–June: HRA declarations (Mumbai Metro – 50% Basic logic)",
      "July: Section 24(b) review",
      "October: Capital gains harvesting check (₹1.25L LTCG limit)",
      "March: Final 80C / 80D actions",
    ],
    16,
    116,
    180,
    { fontSize: 10, maxLines: 10, lineGap: 5 }
  );

  // SECTION 3
  sectionTitle(doc, "SECTION 3: AUDIT-PROOF CHECKLIST", 154);
  bulletLines(
    doc,
    [
      "Rent receipts + PAN of landlord",
      "Health insurance receipts (self + parents)",
      "Capital gains tracking for FY 2025–26",
    ],
    16,
    164,
    180,
    { fontSize: 10, maxLines: 10, lineGap: 5 }
  );

  // Snapshot facts (deterministic; matches calculator output)
  sectionTitle(doc, "SUMMARY", 198);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Recommended tax regime: ${regime}`, 16, 208);
  doc.text(`Estimated tax liability: ${tax}`, 16, 215);
  doc.text(`Potential leak avoided: ${savings}`, 16, 222);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(
    "This recommendation is based on FY 2025–26 tax rules, Section 87A rebate eligibility, and your declared inputs.",
    16,
    234,
    { maxWidth: 180 }
  );

  footer(doc);

  // PAGE 2 — Glossary + action plan (keeps Page 1 uncluttered)
  doc.addPage();
  header(doc, { userName, income });

  sectionTitle(doc, "Glossary (simple definitions)", 62);
  bulletLines(
    doc,
    [
      "HRA: House Rent Allowance exemption (subject to rules and documentation).",
      "Section 80C/80D: Common deductions (investment/insurance/health insurance) within limits.",
      "Section 87A: Rebate that can reduce tax to zero below specified income thresholds.",
      "LTCG/STCG: Long/Short Term Capital Gains tax categories (rules vary by asset).",
    ],
    16,
    72,
    180,
    { fontSize: 10, maxLines: 16, lineGap: 5 }
  );

  sectionTitle(doc, "Action plan (what to do next)", 150);
  bulletLines(
    doc,
    [
      "Share this roadmap with your CA / payroll team and confirm the chosen regime for FY 2025–26.",
      "Collect and store proof documents monthly (rent receipts, insurance receipts, investment statements).",
      "Schedule a mid-year check (Sep/Oct) to avoid last-minute interest/penalties.",
    ],
    16,
    160,
    180,
    { fontSize: 10, maxLines: 14, lineGap: 5 }
  );

  footer(doc);

  stampPageNumbers(doc);

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}

// Deterministic builder for the tax calculator.
export function buildBmWealthTaxPremiumReportPayload({ lead, inputs, compare }) {
  const annualSalary = Number(inputs?.annualSalary || 0);

  const winner = compare?.winner || "tie";
  const bestKey = winner === "old" ? "old" : "new";
  const best = compare?.[bestKey];

  const regimeText = winner === "old" ? "Old Regime" : "New Regime";
  const savings = Number(compare?.savings || 0);
  const monthly = Math.round(savings / 12);

  return {
    variables: {
      userName: safe(lead?.name || ""),
      income: formatINR0(annualSalary),
      regime: regimeText,
      tax: formatINR0(best?.taxAmount),
      savings: formatINR0(savings),
      monthlyLiquidity: formatINR0(monthly),
    },
  };
}
