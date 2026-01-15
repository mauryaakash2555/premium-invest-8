import { jsPDF } from "jspdf";

function safe(v) {
  return String(v ?? "").trim();
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

function header(doc, { title, subtitle }) {
  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(safe(title) || "BM Wealth", 16, 20);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  if (safe(subtitle)) {
    doc.text(safe(subtitle), 16, 28);
  }

  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.2);
  doc.line(16, 32, 196, 32);
}

function sectionTitle(doc, title, y) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(0, 0, 0);
  doc.text(safe(title), 16, y);
}

function bulletLines(doc, bullets, x, y, maxWidth, { fontSize = 10, maxLines = 32, lineGap = 5 } = {}) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(fontSize);
  doc.setTextColor(0, 0, 0);

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

function footer(doc) {
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(0, 0, 0);

  const leftX = 16;
  let y = 285;
  doc.text("BM Wealth | brahmdeomaurya.com / bmwealth.co.in", leftX, y);
  y -= 5;
  doc.text(
    "BM Wealth is not a SEBI registered investment advisor. This content is for educational and informational purposes only.",
    leftX,
    y
  );
  y -= 5;
  doc.text(
    "Investments are subject to market risks. Read all scheme-related documents carefully. Past performance is not indicative of future results.",
    leftX,
    y
  );
}

export function generateServiceBrochurePdfBytes(payload) {
  const p = payload || {};
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  setMeta(doc, {
    title: safe(p.meta?.title) || "BM Wealth | Service Brochure",
    subject: safe(p.meta?.subject) || "BM Wealth Service Brochure",
    keywords: safe(p.meta?.keywords) || "BM Wealth, brochure",
  });

  header(doc, { title: p.title || "BM Wealth", subtitle: p.subtitle || "Service brochure" });

  let y = 46;
  sectionTitle(doc, "Overview", y);
  y += 8;
  y = bulletLines(doc, p.overviewBullets || [], 16, y, 180, { maxLines: 18 });

  y += 6;
  sectionTitle(doc, "How BM Wealth Helps", y);
  y += 8;
  y = bulletLines(doc, p.howWeHelpBullets || [], 16, y, 180, { maxLines: 18 });

  y += 6;
  sectionTitle(doc, "Next Steps", y);
  y += 8;
  bulletLines(doc, p.nextStepsBullets || [], 16, y, 180, { maxLines: 10 });

  footer(doc);

  return doc.output("arraybuffer");
}
