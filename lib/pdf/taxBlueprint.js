import { jsPDF } from "jspdf";

import { compareRegimesFY2526, formatINR } from "@/lib/tax-formulas";

function safe(v) {
  return String(v || "").trim();
}

function addHeader(doc, title) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(title, 14, 18);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("BM Wealth · ARN 90008 | IRDAI 277925", 14, 26);
  doc.setDrawColor(0);
  doc.setLineWidth(0.3);
  doc.line(14, 30, 196, 30);
}

function addFooter(doc) {
  const pageH = doc.internal.pageSize.getHeight();
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(80);
  const disclaimer =
    "Disclaimer: For education and information only; estimates depend on your inputs and prevailing tax rules. For personalised investment advice, consult a SEBI-registered investment adviser.";
  const lines = doc.splitTextToSize(disclaimer, 182);
  const lineHeight = 4;
  const startY = pageH - 14 - (lines.length - 1) * lineHeight;
  doc.text(lines, 14, startY);
}

export function generateTaxBlueprintPdfBytes({ lead, inputs }) {
  const name = safe(lead?.name) || "Client";
  const email = safe(lead?.email);

  const cmp = compareRegimesFY2526(inputs || {});
  const best = cmp.winner === "old" ? "Old Regime" : cmp.winner === "new" ? "New Regime" : "Tie";

  const doc = new jsPDF({ unit: "mm", format: "a4" });

  // Page 1 - Cover
  addHeader(doc, "Personal Tax Optimization Blueprint FY 2025-26");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(20);
  doc.text(`Prepared for: ${name}`, 14, 48);
  if (email) doc.text(`Email: ${email}`, 14, 56);
  doc.text(`Generated: ${new Date().toLocaleString("en-IN")}`, 14, 64);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("Premium Analysis", 14, 82);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(
    [
      "This blueprint summarizes estimated tax under both regimes,",
      "highlights potential savings, and provides an action checklist.",
    ],
    14,
    92
  );
  addFooter(doc);

  // Page 2 - Executive Summary
  doc.addPage();
  addHeader(doc, "Executive Summary");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(20);
  doc.text(`Your current tax (Old): ${formatINR(cmp.old.taxAmount)}`, 14, 44);
  doc.text(`Your current tax (New): ${formatINR(cmp.new.taxAmount)}`, 14, 52);
  doc.text(`Optimal regime: ${best}`, 14, 60);
  doc.text(`Potential savings: ${formatINR(cmp.savings)}`, 14, 68);

  doc.setFont("helvetica", "bold");
  doc.text("Key recommendations", 14, 86);
  doc.setFont("helvetica", "normal");
  doc.text(
    [
      "• Validate HRA exemption with rent receipts and salary breakup.",
      "• Maximize eligible deductions under the chosen regime.",
      "• Plan tax-saving investments early (avoid March rush).",
      "• Review health insurance coverage and 80D eligibility.",
      "• Consider an annual review to switch regime if needed.",
    ],
    14,
    96
  );
  addFooter(doc);

  // Page 3 - Regime Comparison
  doc.addPage();
  addHeader(doc, "Regime Comparison");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Old Regime", 14, 44);
  doc.text("New Regime", 110, 44);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  const rows = [
    ["Gross Income", formatINR(cmp.old.grossIncome), formatINR(cmp.new.grossIncome)],
    ["Total Deductions", formatINR(cmp.old.totalDeductions), formatINR(cmp.new.totalDeductions)],
    ["Taxable Income", formatINR(cmp.old.taxableIncome), formatINR(cmp.new.taxableIncome)],
    ["Tax (incl. cess)", formatINR(cmp.old.taxAmount), formatINR(cmp.new.taxAmount)],
    ["Effective Rate", `${(cmp.old.effectiveRate * 100).toFixed(2)}%`, `${(cmp.new.effectiveRate * 100).toFixed(2)}%`],
  ];

  let y = 56;
  for (const [k, a, b] of rows) {
    doc.setTextColor(20);
    doc.text(k, 14, y);
    doc.setTextColor(0);
    doc.text(a, 14, y + 6);
    doc.text(b, 110, y + 6);
    y += 18;
  }

  doc.setTextColor(20);
  doc.text("Note: Calculations include 4% cess and apply 87A rebate thresholds.", 14, 150);
  addFooter(doc);

  // Page 4 - 3-Year Planning (simple)
  doc.addPage();
  addHeader(doc, "3-Year Planning Snapshot");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(20);
  doc.text(
    [
      "Year 1: Clean documentation (HRA, proofs), lock deductions early.",
      "Year 2: Review insurance + investment mix for tax efficiency.",
      "Year 3: Re-evaluate regime choice based on income changes.",
    ],
    14,
    44
  );
  addFooter(doc);

  // Page 5 - Month-by-month calendar (compact)
  doc.addPage();
  addHeader(doc, "Month-by-Month Tax Calendar");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(20);
  doc.text(
    [
      "Apr–Jun: Confirm salary structure & proofs; set monthly SIPs.",
      "Jul–Sep: Review HRA documentation; mid-year checkup.",
      "Oct–Dec: Top-up 80C/80D if behind; collect receipts.",
      "Jan–Mar: Final proofs, declarations, and last-mile optimization.",
    ],
    14,
    44
  );
  addFooter(doc);

  // Page 6 - Checklist
  doc.addPage();
  addHeader(doc, "Tax-Saving Checklist");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(20);
  doc.text(
    [
      "Before March 31:",
      "• Submit investment proofs and insurance receipts.",
      "• Confirm HRA rent receipts and agreement where applicable.",
      "• Ensure deductions are within eligible limits.",
      "",
      "Monthly recurring:",
      "• Track tax-saving contributions and keep receipts.",
      "• Review expense proofs for reimbursement/HRA documentation.",
    ],
    14,
    44
  );
  addFooter(doc);

  // Page 7 - Contact/Footer
  doc.addPage();
  addHeader(doc, "BM Wealth Support");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(20);
  doc.text("Contact: mauryaakash2555@gmail.com | +91 8850977259", 14, 44);
  doc.text("Generated by BM Wealth Tax Optimizer", 14, 54);
  doc.text("ARN 90008 | IRDAI 277925", 14, 64);
  addFooter(doc);

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}
