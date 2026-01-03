import { jsPDF } from "jspdf";

const COLORS = {
  gold: [192, 160, 98],
  text: [20, 20, 20],
  muted: [90, 90, 90],
  light: [140, 140, 140],
};

const PAGE = {
  marginX: 14,
  marginTop: 18,
  headerH: 14,
  footerH: 18,
};

function safe(v) {
  return String(v || "").trim();
}

function setColor(doc, rgb) {
  doc.setTextColor(rgb[0], rgb[1], rgb[2]);
}

function addHeader(doc, { title, orgLine }) {
  const pageW = doc.internal.pageSize.getWidth();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  setColor(doc, COLORS.text);
  doc.text(title, PAGE.marginX, PAGE.marginTop);

  if (orgLine) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    setColor(doc, COLORS.muted);
    doc.text(orgLine, PAGE.marginX, PAGE.marginTop + 7);
  }

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(PAGE.marginX, PAGE.marginTop + 10, pageW - PAGE.marginX, PAGE.marginTop + 10);
}

function addFooter(doc, { disclaimer }) {
  const pageH = doc.internal.pageSize.getHeight();
  const pageW = doc.internal.pageSize.getWidth();
  const pageNumber = doc.getNumberOfPages();

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  setColor(doc, COLORS.muted);

  const d = safe(disclaimer);
  const maxW = pageW - PAGE.marginX * 2;
  const lines = d ? doc.splitTextToSize(d, maxW) : [];
  const lineHeight = 3.6;
  const startY = pageH - 10 - (lines.length - 1) * lineHeight;

  if (lines.length) {
    doc.text(lines, PAGE.marginX, startY);
  }

  // Page number
  setColor(doc, COLORS.light);
  doc.text(String(pageNumber), pageW - PAGE.marginX, pageH - 8, { align: "right" });
}

function addSectionTitle(doc, title, y) {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  setColor(doc, COLORS.text);
  doc.text(title, PAGE.marginX, y);

  doc.setDrawColor(COLORS.gold[0], COLORS.gold[1], COLORS.gold[2]);
  doc.setLineWidth(0.6);
  doc.line(PAGE.marginX, y + 2.5, PAGE.marginX + 34, y + 2.5);
}

function addKeyValueRows(doc, rows, yStart) {
  let y = yStart;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  for (const row of rows) {
    const label = safe(row.label);
    const value = safe(row.value);
    if (!label && !value) continue;

    setColor(doc, COLORS.muted);
    doc.text(label, PAGE.marginX, y);

    setColor(doc, COLORS.text);
    doc.text(value, 196, y, { align: "right" });

    y += 7;
  }

  return y;
}

function addBullets(doc, bullets, yStart, { fontSize = 10, lineGap = 5.2 } = {}) {
  let y = yStart;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(fontSize);
  setColor(doc, COLORS.text);

  const pageW = doc.internal.pageSize.getWidth();
  const maxW = pageW - PAGE.marginX * 2 - 5;

  for (const b of bullets || []) {
    const text = safe(b);
    if (!text) continue;
    const lines = doc.splitTextToSize(text, maxW);
    doc.text("•", PAGE.marginX, y);
    doc.text(lines, PAGE.marginX + 5, y);
    y += lines.length * lineGap;
  }
  return y;
}

function newPage(doc, meta) {
  doc.addPage();
  addHeader(doc, meta);
}

export function generateCalculatorBlueprintPdfBytes({
  lead,
  meta,
  pages,
}) {
  const title = safe(meta?.title) || "Blueprint";
  const orgLine = safe(meta?.orgLine) || "";
  const disclaimer = safe(meta?.disclaimer) || "";

  const doc = new jsPDF({ unit: "mm", format: "a4" });

  // COVER
  addHeader(doc, { title, orgLine });

  const name = safe(lead?.name) || "Client";
  const email = safe(lead?.email);
  const generatedAt = safe(meta?.generatedAt) || new Date().toLocaleString("en-IN");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  setColor(doc, COLORS.gold);
  doc.text(safe(meta?.coverHeadline) || "Personalised Blueprint", PAGE.marginX, 48);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  setColor(doc, COLORS.text);

  doc.text(`Prepared for: ${name}`, PAGE.marginX, 62);
  if (email) doc.text(`Email: ${email}`, PAGE.marginX, 69);
  doc.text(`Generated: ${generatedAt}`, PAGE.marginX, 76);

  addSectionTitle(doc, safe(meta?.coverSubheading) || "What’s inside", 92);

  addBullets(
    doc,
    meta?.coverBullets || [
      "A clear recommendation based on your inputs (illustrative estimates).",
      "Audit-view breakdown and key thresholds to watch.",
      "A practical action plan you can execute before deadlines.",
    ],
    104,
    { fontSize: 10 }
  );

  addFooter(doc, { disclaimer });

  // PAGES
  for (const page of pages || []) {
    const kind = page?.type;

    newPage(doc, { title, orgLine });

    if (kind === "summary") {
      addSectionTitle(doc, safe(page.title) || "Executive Summary", 42);
      const yAfter = addKeyValueRows(doc, page.keyValues || [], 56);
      if (page.note) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        setColor(doc, COLORS.muted);
        doc.text(doc.splitTextToSize(safe(page.note), 182), PAGE.marginX, yAfter + 6);
      }
      if (page.bullets?.length) {
        addSectionTitle(doc, safe(page.bulletsTitle) || "Key actions", (page.note ? yAfter + 22 : yAfter + 14));
        addBullets(doc, page.bullets, (page.note ? yAfter + 34 : yAfter + 26), { fontSize: 10 });
      }
    } else if (kind === "comparison") {
      addSectionTitle(doc, safe(page.title) || "Comparison", 42);

      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      setColor(doc, COLORS.text);
      doc.text(safe(page.leftTitle) || "Option A", PAGE.marginX, 56);
      doc.text(safe(page.rightTitle) || "Option B", 110, 56);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      let y = 68;
      for (const row of page.rows || []) {
        const label = safe(row.label);
        const left = safe(row.left);
        const right = safe(row.right);

        setColor(doc, COLORS.muted);
        doc.text(label, PAGE.marginX, y);
        setColor(doc, COLORS.text);
        doc.text(left, PAGE.marginX, y + 6);
        doc.text(right, 110, y + 6);
        y += 16;
      }

      if (page.note) {
        doc.setFontSize(9);
        setColor(doc, COLORS.muted);
        doc.text(doc.splitTextToSize(safe(page.note), 182), PAGE.marginX, 160);
      }
    } else if (kind === "plan") {
      addSectionTitle(doc, safe(page.title) || "Action Plan", 42);
      if (page.intro) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(10);
        setColor(doc, COLORS.muted);
        doc.text(doc.splitTextToSize(safe(page.intro), 182), PAGE.marginX, 54);
      }
      addBullets(doc, page.bullets || [], 70, { fontSize: 10 });
    } else if (kind === "timeline") {
      addSectionTitle(doc, safe(page.title) || "Timeline", 42);
      addBullets(doc, page.lines || [], 56, { fontSize: 10 });
    } else if (kind === "checklist") {
      addSectionTitle(doc, safe(page.title) || "Checklist", 42);
      addBullets(doc, page.items || [], 56, { fontSize: 10 });
    } else if (kind === "support") {
      addSectionTitle(doc, safe(page.title) || "Support", 42);
      addKeyValueRows(
        doc,
        page.keyValues || [
          { label: "Contact", value: safe(meta?.supportContact) || "" },
          { label: "Product", value: safe(meta?.supportProduct) || title },
        ],
        58
      );
      if (page.note) {
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        setColor(doc, COLORS.muted);
        doc.text(doc.splitTextToSize(safe(page.note), 182), PAGE.marginX, 86);
      }
    } else {
      // Fallback: a titled notes page
      addSectionTitle(doc, safe(page.title) || "Notes", 42);
      addBullets(doc, page.bullets || [], 56, { fontSize: 10 });
    }

    addFooter(doc, { disclaimer });
  }

  const arrayBuffer = doc.output("arraybuffer");
  return Buffer.from(arrayBuffer);
}
