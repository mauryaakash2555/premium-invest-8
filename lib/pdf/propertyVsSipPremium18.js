import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

function safe(v) {
  return String(v ?? "").trim();
}

function clampNumber(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}

function parseINR(value) {
  const raw = String(value ?? "");
  const cleaned = raw.replace(/[^0-9\-\.]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

function formatCurrency(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "Rs. 0";
  // Use custom Indian number formatting (lakh/crore system) for PDF compatibility
  // Avoids Unicode rupee symbol issues in jsPDF default fonts
  const absVal = Math.abs(Math.round(x));
  const sign = x < 0 ? "-" : "";
  const str = String(absVal);
  let formatted;
  if (str.length > 3) {
    // Indian format: XX,XX,XX,XXX (groups of 2 after first 3 from right)
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

function formatCr(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return "0";
  const cr = x / 1e7;
  const v = Math.round(cr * 10) / 10;
  return String(v);
}

function pickFromCoverLines(lines, prefix) {
  const arr = Array.isArray(lines) ? lines : [];
  const hit = arr.find((l) => String(l || "").toLowerCase().startsWith(String(prefix).toLowerCase()));
  if (!hit) return "";
  const parts = String(hit).split(":");
  return parts.length >= 2 ? parts.slice(1).join(":").trim() : "";
}

function inferInputsFromPayload(pdfPayload) {
  const coverLines = pdfPayload?.blocks?.coverLines || [];

  const propertyPrice = parseINR(pickFromCoverLines(coverLines, "Property Price")) || parseINR(pdfPayload?.variables?.income);
  const monthlySip = parseINR(pickFromCoverLines(coverLines, "Monthly SIP")) || 0;
  const years = parseInt(pickFromCoverLines(coverLines, "Years"), 10);

  return {
    propertyPrice: Math.max(0, propertyPrice),
    monthlySip: Math.max(0, monthlySip),
    years: clampNumber(Number.isFinite(years) ? years : 15, 1, 30),
  };
}

function inferValuesFromPayload(pdfPayload, { propertyPrice, years }) {
  // Best-effort: extract the key outputs from summary lines; fall back to payload variables.
  const summary = pdfPayload?.blocks?.summaryLines || [];
  const sipLine = summary.find((l) => String(l || "").toLowerCase().includes("sip value")) || "";
  const propLine = summary.find((l) => String(l || "").toLowerCase().includes("property value")) || "";
  const gapLine = summary.find((l) => String(l || "").toLowerCase().includes("wealth gap")) || "";

  const sipValue = parseINR(String(sipLine).split(":").slice(1).join(":").trim()) || parseINR(pdfPayload?.variables?.tax);
  const propValue = parseINR(String(propLine).split(":").slice(1).join(":").trim()) || 0;

  // In the legacy payload, variables.savings holds wealthGap; it may be signed.
  const wealthGap =
    parseINR(String(gapLine).split(":").slice(1).join(":").trim()) ||
    parseINR(String(pdfPayload?.variables?.savings || "").replace(/−/g, "-")) ||
    (Number.isFinite(sipValue) && Number.isFinite(propValue) ? sipValue - propValue : 0);

  // If propValue isn't present, approximate from assumptions (4% CAGR) for narrative pages.
  const approxProp = propertyPrice > 0 ? propertyPrice * Math.pow(1.04, years) : 0;
  const finalPropValue = propValue > 0 ? propValue : approxProp;

  // If sipValue isn't present, approximate from assumptions (14.5% CAGR) for narrative pages.
  const approxSip = propertyPrice > 0 ? propertyPrice * Math.pow(1.145, years) : 0;
  const finalSipValue = sipValue > 0 ? sipValue : approxSip;

  const finalGap = Number.isFinite(wealthGap) && wealthGap !== 0 ? wealthGap : finalSipValue - finalPropValue;
  return {
    sipValue: finalSipValue,
    propValue: finalPropValue,
    wealthGap: finalGap,
  };
}

function theme() {
  return {
    bg: [10, 10, 12],
    panel: [18, 18, 22],
    text: [245, 245, 245],
    muted: [200, 200, 200],
    gold: [198, 161, 91],
    gold2: [224, 201, 138],
    line: [45, 45, 55],
  };
}

function fillBackground(doc) {
  const t = theme();
  doc.setFillColor(...t.bg);
  doc.rect(0, 0, 210, 297, "F");
}

function applyBranding(doc, { page, total, subtitle = "Premium Report" } = {}) {
  const t = theme();
  fillBackground(doc);

  doc.setTextColor(...t.gold2);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("BM WEALTH", 16, 16);

  doc.setTextColor(...t.muted);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(safe(subtitle), 16, 22);

  doc.setDrawColor(...t.line);
  doc.setLineWidth(0.3);
  doc.line(16, 26, 194, 26);

  // Footer
  doc.setDrawColor(...t.line);
  doc.line(16, 284, 194, 284);

  doc.setTextColor(...t.muted);
  doc.setFontSize(8);
  doc.text("BM Wealth | bmwealth.co.in | +91 8850977259 | ARN 90008 | IRDAI 277925", 16, 290);
  doc.text(`${page}/${total}`, 194, 290, { align: "right" });
}

function title(doc, text, y) {
  const t = theme();
  doc.setTextColor(...t.gold2);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text(String(text), 16, y);
}

function subTitle(doc, text, y) {
  const t = theme();
  doc.setTextColor(...t.text);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(String(text), 16, y);
}

function paragraph(doc, text, y, { maxWidth = 178, fontSize = 11, color = null, lineGap = 6 } = {}) {
  const t = theme();
  doc.setTextColor(...(color || t.text));
  doc.setFont("helvetica", "normal");
  doc.setFontSize(fontSize);
  const lines = doc.splitTextToSize(String(text || ""), maxWidth);
  doc.text(lines, 16, y);
  return y + lines.length * lineGap;
}

function bulletList(doc, bullets, y, { maxWidth = 178, fontSize = 11, lineGap = 6 } = {}) {
  const t = theme();
  doc.setTextColor(...t.text);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(fontSize);

  let yy = y;
  for (const b of bullets || []) {
    const lines = doc.splitTextToSize(String(b || ""), maxWidth - 8);
    if (!lines.length) continue;
    doc.text("•", 16, yy);
    doc.text(lines, 22, yy);
    yy += lines.length * lineGap;
  }
  return yy;
}

function infoPanel(doc, { y, lines }) {
  const t = theme();
  // Calculate dynamic height based on number of lines
  const headerHeight = 14;
  const lineHeight = 8;
  const padding = 10;
  const numLines = (lines || []).length;
  const panelHeight = headerHeight + (numLines * lineHeight) + padding;
  
  doc.setFillColor(...t.panel);
  doc.roundedRect(16, y, 178, panelHeight, 3, 3, "F");
  doc.setDrawColor(...t.line);
  doc.roundedRect(16, y, 178, panelHeight, 3, 3, "S");

  doc.setTextColor(...t.gold2);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("CLIENT SNAPSHOT", 20, y + 12);

  doc.setTextColor(...t.text);
  doc.setFont("courier", "normal");
  doc.setFontSize(10);

  let yy = y + 22;
  for (const l of lines || []) {
    doc.text(String(l), 24, yy);
    yy += lineHeight;
  }
}

function yearByYearTable(doc, { startY, years, propertyPrice, monthlySip }) {
  const t = theme();
  const Y = Math.round(clampNumber(years, 1, 30));
  const rP = 0.04;
  const rS = 0.145;

  const rows = [];
  for (let y = 1; y <= Y; y++) {
    const prop = propertyPrice * Math.pow(1 + rP, y);
    const sipLump = propertyPrice * Math.pow(1 + rS, y);
    const months = y * 12;
    const rM = rS / 12;
    const sipMonthly = rM > 0 ? monthlySip * (((Math.pow(1 + rM, months) - 1) / rM) * (1 + rM)) : monthlySip * months;
    const sip = sipLump + sipMonthly;
    rows.push([String(y), formatCurrency(Math.round(prop)), formatCurrency(Math.round(sip)), formatCurrency(Math.round(sip - prop))]);
  }

  autoTable(doc, {
    startY,
    head: [["Year", "Property Value (4%)", "Equity Value (14.5%)", "Gap"]],
    body: rows,
    styles: {
      font: "helvetica",
      fontSize: 8,
      textColor: t.text,
      cellPadding: 2,
      overflow: "linebreak",
    },
    headStyles: {
      fillColor: t.panel,
      textColor: t.gold2,
      lineColor: t.line,
      lineWidth: 0.2,
    },
    bodyStyles: {
      fillColor: t.bg,
      lineColor: t.line,
      lineWidth: 0.2,
    },
    alternateRowStyles: {
      fillColor: [14, 14, 18],
    },
    margin: { left: 16, right: 16 },
    tableLineColor: t.line,
    tableLineWidth: 0.2,
  });
}

export function generatePropertyVsSipPremium18PdfBytes(pdfPayload) {
  const p = pdfPayload || {};
  const leadName = safe(p?.variables?.userName || "");

  const inputs = inferInputsFromPayload(p);
  const values = inferValuesFromPayload(p, inputs);

  const propertyPrice = inputs.propertyPrice;
  const monthlySip = inputs.monthlySip;
  const years = inputs.years;
  const sipValue = values.sipValue;
  const propValue = values.propValue;
  const wealthGap = values.wealthGap;

  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const TOTAL = 18;

  // Page 1: Cover
  applyBranding(doc, { page: 1, total: TOTAL, subtitle: "Property vs SIP | Premium Exit Plan" });
  title(doc, "PROPERTY EXIT PLAN", 54);
  subTitle(doc, "Mumbai HNI Wealth Gap Analysis", 66);
  paragraph(
    doc,
    `Prepared for ${leadName || "Valued Client"}. This report compares Mumbai property appreciation (4% CAGR assumption) versus disciplined equity deployment (14.5% CAGR assumption) and highlights liquidity, cost, and execution considerations.`,
    80,
    { fontSize: 11 }
  );

  infoPanel(doc, {
    y: 118,
    lines: [
      `Property Price: ${formatCurrency(propertyPrice)}`,
      `Monthly SIP: ${formatCurrency(monthlySip)}`,
      `Horizon: ${years} years`,
      `Projected Wealth Gap: ${formatCurrency(wealthGap)}`,
    ],
  });

  paragraph(
    doc,
    "Disclaimer: Educational projection only. Not investment advice. Assumptions materially impact outcomes.",
    170,
    { fontSize: 9, color: theme().muted }
  );

  // Page 2: Summary snapshot + year-by-year table
  doc.addPage();
  applyBranding(doc, { page: 2, total: TOTAL, subtitle: "Snapshot + Year-by-Year" });
  title(doc, "YOUR WEALTH GAP", 42);
  paragraph(
    doc,
    `If you deploy ₹${formatCurrency(propertyPrice)} with equity discipline and maintain a ₹${formatCurrency(monthlySip)} SIP, the model projects equity could reach ₹${formatCurrency(sipValue)} in ${years} years versus property at ₹${formatCurrency(propValue)}.`,
    58,
    { fontSize: 11 }
  );
  subTitle(doc, "Year-by-Year Comparison (Illustrative)", 84);
  yearByYearTable(doc, { startY: 92, years, propertyPrice, monthlySip });

  // Page 3
  doc.addPage();
  applyBranding(doc, { page: 3, total: TOTAL, subtitle: "The Property Reality" });
  title(doc, "THE PROPERTY REALITY", 42);
  subTitle(doc, "THE 4% CAGR REALITY: MUMBAI PROPERTY APPRECIATION", 56);
  let y = 72;
  y = paragraph(
    doc,
    "Mumbai real estate has averaged ~4% annual appreciation over 2015–2025 (market-level estimate).",
    y,
    { fontSize: 11 }
  );
  y = paragraph(
    doc,
    "This sounds stable. But consider:",
    y + 4,
    { fontSize: 11 }
  );
  y = bulletList(doc, [
    "Inflation: ~6% annually",
    "Real return: NEGATIVE ~2%",
    "Maintenance: ~0.5% of property value/year",
    "Property tax: ₹35,000–75,000/year",
    "Society charges: ₹10,000–20,000/month",
  ], y + 6);
  y = paragraph(
    doc,
    `Your ₹${formatCurrency(propertyPrice)} property can become a liability, not an asset, if costs and liquidity constraints dominate.`,
    y + 8,
    { fontSize: 11 }
  );

  // Page 4
  doc.addPage();
  applyBranding(doc, { page: 4, total: TOTAL, subtitle: "The SIP Reality" });
  title(doc, "THE SIP REALITY", 42);
  subTitle(doc, "THE 14.5% CAGR POWER: DISCIPLINED EQUITY DEPLOYMENT", 56);
  y = 72;
  y = paragraph(doc, "Nifty 50 has delivered ~14.5% CAGR over long periods (historical).", y);
  y = paragraph(doc, "This isn't speculation. This is:", y + 4);
  y = bulletList(doc, [
    "Diversification across many companies",
    "Index rebalancing",
    "Tax-efficient deployment",
    "High liquidity",
  ], y + 6);
  y = paragraph(
    doc,
    `Your ₹${formatCurrency(propertyPrice)} deployed in equity grows to ~₹${formatCurrency(sipValue)} in ${years} years (model projection).`,
    y + 8
  );

  // Page 5
  doc.addPage();
  applyBranding(doc, { page: 5, total: TOTAL, subtitle: "Hidden Costs" });
  title(doc, "THE MAINTENANCE DRAIN", 42);
  subTitle(doc, "THE HIDDEN COSTS NOBODY TALKS ABOUT", 56);

  const annualSociety = 120000;
  const annualTax = 50000;
  const repairCycleCost = 300000;
  const repairCycles = Math.floor(years / 5);
  const totalCost = (annualSociety + annualTax) * years + repairCycleCost * repairCycles;

  y = 74;
  y = bulletList(doc, [
    `Annual society charges: ${formatCurrency(annualSociety)}`,
    `Property tax: ${formatCurrency(annualTax)}`,
    `Repairs (5-year cycle): ${formatCurrency(repairCycleCost)}`,
    `Total ${years}-year cost (illustrative): ${formatCurrency(totalCost)}`,
  ], y);
  y = paragraph(doc, "This is money that NEVER returns. In equity, every rupee compounds.", y + 10);

  // Page 6
  doc.addPage();
  applyBranding(doc, { page: 6, total: TOTAL, subtitle: "Rental Yield" });
  title(doc, "THE RENTAL YIELD TRAP", 42);
  subTitle(doc, "2.5% RENTAL YIELD = NEGATIVE REAL RETURN", 56);
  y = 74;
  y = paragraph(doc, "Illustrative math (Mumbai typical ranges):", y);
  const grossYield = 0.025;
  const maintenance = 0.005;
  const vacancy = 0.002;
  const tdsOnRent = 0.30;
  const netYield = Math.max(0, (grossYield - maintenance - vacancy) * (1 - tdsOnRent));
  const inflation = 0.06;
  const real = netYield - inflation;
  y = bulletList(doc, [
    `Rental income: ${(grossYield * 100).toFixed(1)}% of property value`,
    `Minus maintenance: ${(maintenance * 100).toFixed(1)}%`,
    `Minus vacancy: ${(vacancy * 100).toFixed(1)}%`,
    `Minus TDS/Tax drag (illustrative): ${(tdsOnRent * 100).toFixed(0)}% of rent`,
    `NET YIELD: ${(netYield * 100).toFixed(1)}%`,
    `REAL RETURN (after ~6% inflation): ${(real * 100).toFixed(1)}%`,
  ], y + 6);
  y = paragraph(doc, "You're often PAYING (in real terms) to own property in Mumbai.", y + 10);

  // Page 7
  doc.addPage();
  applyBranding(doc, { page: 7, total: TOTAL, subtitle: "Liquidity Stress Test" });
  title(doc, "LIQUIDITY STRESS TEST", 42);
  subTitle(doc, "TIME TO EXIT: PROPERTY vs EQUITY", 56);
  y = 74;
  subTitle(doc, "Property", y);
  y = bulletList(doc, [
    "Find buyer: 3–6 months",
    "Price negotiation: 2–3 months",
    "Legal clearance: 1–2 months",
    "Total: 6–11 months",
    "Price discount: 10–15% below market (often)",
  ], y + 8);
  y += 6;
  subTitle(doc, "Equity", y + 8);
  y = bulletList(doc, [
    "Sell units: 1–3 days",
    "No negotiation",
    "No legal hassle",
    "Total: ~3 business days",
    "Price: current NAV (market)",
  ], y + 16);
  y = paragraph(doc, "Emergency liquidity = Financial freedom.", 250, { fontSize: 12 });

  // Page 8
  doc.addPage();
  applyBranding(doc, { page: 8, total: TOTAL, subtitle: "Tax Angle" });
  title(doc, "THE 12.5% LTCG ADVANTAGE", 42);
  subTitle(doc, `TAX HARVESTING FOR YOUR ${formatCurrency(propertyPrice)} SCENARIO`, 56);
  y = 74;
  const sale = propValue;
  const assumedIndexationFactor = 1.0; // keep neutral; rules vary
  const indexedCost = propertyPrice * assumedIndexationFactor;
  const taxableGain = Math.max(0, sale - indexedCost);
  const taxRate = 0.125;
  const tax = taxableGain * taxRate;
  y = paragraph(doc, "Illustrative property LTCG math (actual tax depends on law and facts):", y);
  y = bulletList(doc, [
    `Purchase: ${formatCurrency(propertyPrice)}`,
    `Sale after ${years} years: ${formatCurrency(sale)}`,
    `Indexed cost: ${formatCurrency(indexedCost)} (varies by CII / rules)`,
    `Taxable gain: ${formatCurrency(taxableGain)}`,
    `Tax @12.5%: ${formatCurrency(tax)}`,
  ], y + 6);
  y = paragraph(doc, "Equity offers harvesting and staged exits; planning can materially reduce tax drag.", y + 10);

  // Page 9
  doc.addPage();
  applyBranding(doc, { page: 9, total: TOTAL, subtitle: "Micro-Market" });
  title(doc, "MICRO-MARKET ANALYSIS", 42);
  subTitle(doc, "MUMBAI PROPERTY REALITY: 2015–2025", 56);
  y = 74;
  y = bulletList(doc, [
    "Worli: ~3.8% CAGR",
    "Bandra West: ~4.2% CAGR",
    "Andheri: ~3.5% CAGR",
    "Thane: ~4.8% CAGR",
    "Navi Mumbai: ~5.1% CAGR",
    "Nifty 50: ~14.5% CAGR",
  ], y);
  y = paragraph(doc, "Even the 'best' localities often underperform diversified equity over long horizons.", y + 10);

  // Page 10 (keep as a strong pivot page)
  doc.addPage();
  applyBranding(doc, { page: 10, total: TOTAL, subtitle: "The Pivot" });
  title(doc, "THE DECISION", 52);
  paragraph(
    doc,
    `In this scenario, the model shows a projected gap of ₹${formatCurrency(wealthGap)} (≈ ${formatCr(wealthGap)} Cr). The question is not "property vs markets" — it is liquidity, cost discipline, and compounding math.`,
    72,
    { fontSize: 12 }
  );
  paragraph(doc, "Next: execution roadmap.", 118, { fontSize: 12, color: theme().gold2 });

  // Page 11
  doc.addPage();
  applyBranding(doc, { page: 11, total: TOTAL, subtitle: "Under-Construction" });
  title(doc, "THE PRE-EMI RISK", 42);
  subTitle(doc, "UNDER-CONSTRUCTION TRAP", 56);
  y = 74;
  y = bulletList(doc, [
    "Delayed possession: 2–5 years common",
    "Pre-EMI paid: no usable asset",
    "Opportunity cost: compounding lost",
    "Builder default risk",
  ], y);
  y = paragraph(doc, "Don't pay EMI for an asset you can't sell.", y + 10);

  // Page 12
  doc.addPage();
  applyBranding(doc, { page: 12, total: TOTAL, subtitle: "Transition Roadmap" });
  title(doc, "3-YEAR TRANSITION ROADMAP", 42);
  subTitle(doc, "YOUR PERSONALIZED EXIT STRATEGY", 56);
  y = 74;
  subTitle(doc, "YEAR 1", y);
  y = bulletList(doc, [
    "Month 1–3: Property valuation, market analysis",
    "Month 4–6: Find buyers, initial negotiations",
    "Month 7–9: Legal clearances, documentation",
    "Month 10–12: Sale completion, capital deployment",
  ], y + 8);
  subTitle(doc, "YEAR 2", y + 10);
  y = bulletList(doc, [
    "Equity portfolio setup",
    "SIP automation",
    "Tax optimization",
    "Rebalancing schedule",
  ], y + 18);
  subTitle(doc, "YEAR 3", y + 10);
  y = bulletList(doc, [
    "Review performance",
    "Optimize allocation",
    "Scale SIP contributions",
    "Achieve financial freedom",
  ], y + 18);

  // Page 13
  doc.addPage();
  applyBranding(doc, { page: 13, total: TOTAL, subtitle: "Risk Management" });
  title(doc, "RISK MANAGEMENT", 42);
  subTitle(doc, "WHAT IF EQUITY CRASHES 40%?", 56);
  y = 74;
  y = bulletList(doc, [
    "Property: illiquid; may still require 10–15% discount to exit",
    "Equity: can exit in days; can rebalance; can deploy at lower valuations",
  ], y);
  y = paragraph(doc, "Liquidity = Risk management.", y + 10, { fontSize: 12 });

  // Page 14
  doc.addPage();
  applyBranding(doc, { page: 14, total: TOTAL, subtitle: "Allocation" });
  title(doc, "ASSET ALLOCATION", 42);
  subTitle(doc, `WHERE YOUR ${formatCurrency(propertyPrice)} SHOULD GO`, 56);
  y = 74;
  const alloc = [
    { k: "Large Cap Index", p: 0.4 },
    { k: "Flexi Cap Active", p: 0.3 },
    { k: "Mid Cap", p: 0.2 },
    { k: "Small Cap", p: 0.1 },
  ];
  y = bulletList(
    doc,
    alloc.map((a) => `${a.k}: ${(a.p * 100).toFixed(0)}% (${formatCurrency(Math.round(propertyPrice * a.p))})`),
    y
  );
  y = paragraph(doc, "Allocation is illustrative; actual strategy depends on risk profile and goals.", y + 10);

  // Page 15
  doc.addPage();
  applyBranding(doc, { page: 15, total: TOTAL, subtitle: "Case Study" });
  title(doc, "CASE STUDY", 42);
  subTitle(doc, "REAL MUMBAI FAMILY: HOW THEY SAVED ₹5CR", 56);
  y = 74;
  y = paragraph(
    doc,
    "Illustrative example (not a guarantee):",
    y,
    { fontSize: 11, color: theme().muted }
  );
  y = bulletList(doc, [
    "Sharma family, Andheri West",
    "Had: ₹3Cr flat (2017)",
    "Exited: 2020 for ₹3.8Cr",
    "Deployed in equity: ₹3.8Cr + ₹1L/month SIP",
    "2025 value: ₹9.2Cr",
    "Saved vs staying in property: ₹5.1Cr",
  ], y + 8);

  // Page 16
  doc.addPage();
  applyBranding(doc, { page: 16, total: TOTAL, subtitle: "About" });
  title(doc, "ABOUT BM WEALTH", 42);
  subTitle(doc, "WHO WE ARE", 56);
  y = 74;
  y = paragraph(
    doc,
    "BM Wealth\nMumbai's Premier Wealth Architecture Firm\n\nCredentials: ARN 90008 | IRDAI 277925\nExpertise: Liquid wealth deployment for Mumbai HNIs\n\nWe don't sell products. We show you the math. You decide. We execute.",
    y
  );

  // Page 17
  doc.addPage();
  applyBranding(doc, { page: 17, total: TOTAL, subtitle: "Offer" });
  title(doc, "EXCLUSIVE OFFER", 42);
  subTitle(doc, "YOUR ₹5,000 CONSULTATION VOUCHER", 56);
  y = 74;
  y = paragraph(doc, "As a Premium Report holder, you get:", y);
  y = bulletList(doc, [
    "FREE 1-on-1 Portfolio Review (Worth ₹5,000)",
    "60-minute consultation",
    "Personalized wealth architecture",
    "Tax optimization strategies",
    "Portfolio audit",
  ], y + 8);
  y = paragraph(doc, "Book now: WhatsApp +91 8850977259", y + 10, { fontSize: 12, color: theme().gold2 });
  y = paragraph(doc, "Quote code: EXITPLAN2026", y + 8, { fontSize: 12, color: theme().gold2 });

  // Page 18
  doc.addPage();
  applyBranding(doc, { page: 18, total: TOTAL, subtitle: "Final" });
  title(doc, "NEXT ACTION", 52);
  paragraph(
    doc,
    "If you want the fastest path from illiquid wealth to liquid compounding, the only lever that matters is execution.\n\nReply on WhatsApp with your preferred time window, and we'll map the transition step-by-step.",
    78,
    { fontSize: 12 }
  );
  paragraph(doc, "WhatsApp: +91 8850977259", 132, { fontSize: 14, color: theme().gold2 });
  paragraph(doc, "Email: support@bmwealth.co.in", 146, { fontSize: 11, color: theme().muted });

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}
