export const runtime = 'nodejs';
export const maxDuration = 30;

import path from 'node:path';
import { pathToFileURL } from 'node:url';

async function extractPdfTextFromArrayBuffer(arrayBuffer) {
  const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
  const data = new Uint8Array(arrayBuffer);

  let standardFontDataUrl;
  try {
    standardFontDataUrl = pathToFileURL(path.join(process.cwd(), 'node_modules/pdfjs-dist/standard_fonts/')).href;
  } catch {
    standardFontDataUrl = undefined;
  }

  const loadingTask = pdfjs.getDocument({
    data,
    disableWorker: true,
    ...(standardFontDataUrl ? { standardFontDataUrl } : {}),
  });

  const doc = await loadingTask.promise;
  const pages = doc.numPages || 1;
  let text = '';

  for (let pageNumber = 1; pageNumber <= pages; pageNumber += 1) {
    const page = await doc.getPage(pageNumber);
    const content = await page.getTextContent();
    text += content.items.map((it) => it.str).join(' ') + '\n';
  }

  await doc.destroy();
  return { text: String(text || ''), pages };
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return Response.json({ success: false, error: 'No file' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const { text } = await extractPdfTextFromArrayBuffer(buffer);
    const rawTextPreview = text.substring(0, 2000);

    // Simple regex extraction (works for most Form16s)
    const fields = {
      grossSalary: 0,
      tds: 0,
      standardDeduction: 0,
      deductions80C: 0,
    };

    // Gross Salary
    const grossMatch = text.match(/gross\s*salary\b[^\d]{0,40}([\d,]{3,})/i) || text.match(/section\s+17.*?(\d{6,})/i);
    if (grossMatch) fields.grossSalary = parseInt(String(grossMatch[1]).replace(/,/g, ''), 10);

    // TDS
    const tdsMatch = text.match(/total\s*tds\b[^\d]{0,40}([\d,]{3,})/i) || text.match(/\btds\b[^\d]{0,40}([\d,]{3,})/i);
    if (tdsMatch) fields.tds = parseInt(String(tdsMatch[1]).replace(/,/g, ''), 10);

    // Standard Deduction
    const stdMatch = text.match(/standard\s*deduction\b[^\d]{0,40}([\d,]{3,})/i);
    if (stdMatch) fields.standardDeduction = parseInt(String(stdMatch[1]).replace(/,/g, ''), 10);

    // 80C
    const c80Match = text.match(/\b80c\b[^\d]{0,40}([\d,]{3,})/i);
    if (c80Match) fields.deductions80C = parseInt(String(c80Match[1]).replace(/,/g, ''), 10);

    const confidence = fields.grossSalary > 0 ? 0.85 : 0.6;

    return Response.json({
      success: true,
      fields,
      confidence,
      rawTextPreview,
    });
  } catch (error) {
    console.error(error);
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}
