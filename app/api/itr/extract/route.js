export const runtime = 'nodejs';

import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

let pdfjsLib = null;

export async function POST(request) {
  try {
    const formData = await request.formData();

    // Primary expected key: file
    let file = formData.get('file');
    // Backward-compat: accept files[] and use the first file.
    if (!file) {
      const files = formData.getAll('files');
      if (files && files.length > 0) file = files[0];
    }

    if (!file) {
      return Response.json({ success: false, error: 'Missing file' }, { status: 400 });
    }

    const filename = String(file?.name || 'upload.pdf');
    const isPdf = filename.toLowerCase().endsWith('.pdf') || String(file?.type || '').includes('pdf');
    if (!isPdf) {
      return Response.json({ success: false, error: 'Only PDF files are supported' }, { status: 400 });
    }

    // Convert to bytes - KEEP IN MEMORY, DON'T SAVE
    const arrayBuffer = await file.arrayBuffer();
    const bytes = new Uint8Array(arrayBuffer);

    // Extract text immediately
    const result = await extractFromPDF(bytes);

    // Return results - that's it
    return Response.json(
      {
        success: true,
        fileName: filename,
        extracted: result,
      },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    return Response.json(
      {
        success: false,
        error: error?.message || String(error),
      },
      { status: 500 }
    );
  }
}

async function getPdfjs() {
  if (pdfjsLib) return pdfjsLib;
  pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
  // Ensure worker module is present in the server bundle.
  await import('pdfjs-dist/legacy/build/pdf.worker.mjs');
  const require = createRequire(import.meta.url);
  const workerPath = require.resolve('pdfjs-dist/legacy/build/pdf.worker.mjs');
  pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).toString();
  return pdfjsLib;
}

async function extractFromPDF(bytes) {
  const pdfjs = await getPdfjs();
  // pdfjs-dist expects Uint8Array (not Node Buffer)
  const pdf = await pdfjs.getDocument({ data: bytes, disableWorker: true }).promise;
  const allText = [];

  // Get ALL text with positions
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    for (const item of content.items) {
      const text = String(item?.str || '').trim();
      if (!text) continue;

      const x = Number.isFinite(item?.transform?.[4]) ? Math.round(item.transform[4]) : null;
      const y = Number.isFinite(item?.transform?.[5]) ? Math.round(item.transform[5]) : null;

      allText.push({
        text,
        x,
        y,
        page: i,
      });
    }
  }

  // Find fields
  const fields = findFields(allText);

  return {
    totalPages: pdf.numPages,
    totalTextItems: allText.length,
    fields,
    rawText: allText,
  };
}

function parsePositiveIntegerish(text) {
  if (!text) return null;
  const cleaned = String(text).replace(/[,\s]/g, '');
  if (!/^\d+(?:\.\d+)?$/.test(cleaned)) return null;
  const num = Math.floor(Number(cleaned));
  if (!Number.isFinite(num)) return null;
  return num;
}

function extractFirstAmountFromText(text) {
  const t = String(text || '');
  // Matches 1,23,456 or 123456 or 1234.56
  const m = t.match(/\b\d{1,3}(?:,\d{2,3})*(?:\.\d+)?\b|\b\d+(?:\.\d+)?\b/);
  if (!m) return null;
  return parsePositiveIntegerish(m[0]);
}

function findFields(textItems) {
  const results = {};

  const lower = (s) => String(s || '').toLowerCase();

  for (let i = 0; i < textItems.length; i++) {
    const item = textItems[i];
    const t = lower(item.text);

    // Same-token extraction first (common in PDFs where label + value appear in one text item)
    if (!results.grossSalary && t.includes('gross') && t.includes('salary')) {
      const value = extractFirstAmountFromText(item.text);
      if (value !== null) {
        results.grossSalary = { value, raw: item.text, page: item.page, confidence: 1.0 };
        continue;
      }
    }
    if (!results.tds && (t.includes('tds') || t.includes('tax deducted'))) {
      const value = extractFirstAmountFromText(item.text);
      if (value !== null) {
        results.tds = { value, raw: item.text, page: item.page, confidence: 1.0 };
        continue;
      }
    }
    if (!results.netSalary && (t.includes('net salary') || t.includes('net pay'))) {
      const value = extractFirstAmountFromText(item.text);
      if (value !== null) {
        results.netSalary = { value, raw: item.text, page: item.page, confidence: 1.0 };
        continue;
      }
    }

    // 1) GROSS SALARY
    if (t.includes('gross') && lower(textItems[i + 1]?.text).includes('salary')) {
      for (let j = i + 1; j < i + 20 && j < textItems.length; j++) {
        if (textItems[j].page !== item.page) break;
        const value = parsePositiveIntegerish(textItems[j].text);
        if (value !== null && String(value).length >= 4) {
          results.grossSalary = {
            value,
            raw: textItems[j].text,
            page: textItems[j].page,
            confidence: 1.0,
          };
          break;
        }
      }
      continue;
    }

    // 2) TDS
    if (t === 'tds' || t.includes('tax deducted')) {
      for (let j = i + 1; j < i + 20 && j < textItems.length; j++) {
        if (textItems[j].page !== item.page) break;
        const value = parsePositiveIntegerish(textItems[j].text);
        if (value !== null && String(value).length >= 3) {
          results.tds = {
            value,
            raw: textItems[j].text,
            page: textItems[j].page,
            confidence: 1.0,
          };
          break;
        }
      }
      continue;
    }

    // 3) NET SALARY / NET PAY
    const next = lower(textItems[i + 1]?.text);
    const isNetSalaryLabel = (t.includes('net') && next.includes('salary')) || t.includes('net pay');
    if (isNetSalaryLabel) {
      for (let j = i + 1; j < i + 20 && j < textItems.length; j++) {
        if (textItems[j].page !== item.page) break;
        const value = parsePositiveIntegerish(textItems[j].text);
        if (value !== null && String(value).length >= 4) {
          results.netSalary = {
            value,
            raw: textItems[j].text,
            page: textItems[j].page,
            confidence: 1.0,
          };
          break;
        }
      }
    }
  }

  return results;
}
