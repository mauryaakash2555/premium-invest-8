export const runtime = 'nodejs';

import { PDFParse } from 'pdf-parse';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return Response.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const filename = String(file?.name || 'upload.pdf');
    const isPdf = filename.toLowerCase().endsWith('.pdf') || String(file?.type || '').includes('pdf');
    if (!isPdf) {
      return Response.json({ success: false, error: 'Only PDF files are supported' }, { status: 400 });
    }

    // Get buffer (in-memory only)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract using pdf-parse (v2+) - no storage, in-memory only
    const parser = new PDFParse({ data: buffer });
    let textResult;
    try {
      textResult = await parser.getText({
        lineEnforce: true,
      });
    } finally {
      try {
        await parser.destroy();
      } catch {
        // ignore cleanup failures
      }
    }

    const fullText = String(textResult?.text || '');

    if (fullText.length < 10) {
      return Response.json(
        {
          success: false,
          error: 'Could not extract text from PDF. It might be scanned/image-based.',
          debug: {
            pages: textResult?.total,
            textLength: fullText.length,
          },
        },
        { headers: { 'Cache-Control': 'no-store' } }
      );
    }

    const fields = extractFieldsFromText(fullText);

    return Response.json(
      {
        success: true,
        fileName: filename,
        extracted: {
          totalPages: textResult?.total,
          totalTextLength: fullText.length,
          fields,
          rawTextPreview: fullText.substring(0, 2000),
        },
      },
      { status: 200, headers: { 'Cache-Control': 'no-store' } }
    );
  } catch (error) {
    console.error('Extraction error:', error);
    return Response.json(
      {
        success: false,
        error: error?.message || String(error),
        stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      },
      { status: 500, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}

function extractFieldsFromText(text) {
  const fields = {};

  // Normalize (kept for future tuning)
  const normalizedText = String(text || '').replace(/\s+/g, ' ').toLowerCase();
  void normalizedText;

  const toInt = (raw) => {
    const clean = String(raw || '').replace(/,/g, '');
    const n = parseInt(clean, 10);
    return Number.isFinite(n) ? n : null;
  };

  const tryPatterns = (patterns, minDigits) => {
    for (const pattern of patterns) {
      const match = String(text || '').match(pattern);
      if (!match) continue;
      const raw = match[1];
      const cleanValue = String(raw || '').replace(/,/g, '');
      if (cleanValue.replace(/\D/g, '').length < minDigits) continue;
      const value = toInt(raw);
      if (value === null) continue;
      return { value, raw, confidence: 1.0 };
    }
    return null;
  };

  // Gross Salary / Total Income
  const gross = tryPatterns(
    [
      /gross\s+salary[:\s]+(?:rs\.?|₹)?\s*([\d,]+)/i,
      /gross\s+total\s+income[:\s]+(?:rs\.?|₹)?\s*([\d,]+)/i,
      /total\s+income[:\s]+(?:rs\.?|₹)?\s*([\d,]+)/i,
    ],
    4
  );
  if (gross) fields.grossSalary = gross;

  // TDS
  const tds = tryPatterns(
    [
      /tds[:\s]+(?:rs\.?|₹)?\s*([\d,]+)/i,
      /tax\s+deducted[:\s]+(?:rs\.?|₹)?\s*([\d,]+)/i,
      /total\s+tds[:\s]+(?:rs\.?|₹)?\s*([\d,]+)/i,
    ],
    3
  );
  if (tds) fields.tds = tds;

  // Net Salary / Take Home
  const net = tryPatterns(
    [
      /net\s+salary[:\s]+(?:rs\.?|₹)?\s*([\d,]+)/i,
      /net\s+pay[:\s]+(?:rs\.?|₹)?\s*([\d,]+)/i,
      /take\s+home[:\s]+(?:rs\.?|₹)?\s*([\d,]+)/i,
    ],
    4
  );
  if (net) fields.netSalary = net;

  // Standard Deduction
  const stdDeduction = tryPatterns(
    [
      /standard\s+deduction[:\s]+(?:rs\.?|₹)?\s*([\d,]+)/i,
      /deduction\s+u\/s\s+16\(ia\)[:\s]+(?:rs\.?|₹)?\s*([\d,]+)/i,
    ],
    3
  );
  if (stdDeduction) fields.standardDeduction = stdDeduction;

  return fields;
}
