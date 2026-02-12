import { extractText } from 'unpdf';

const SAFE_FIELDS = { grossSalary: 0, tds: 0, standardDeduction: 50000, deductions80C: 0 };
const PREVIEW_LIMIT_BYTES = 1_000_000;

function coerceNonNegativeInt(value) {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return 0;
  if (n <= 0) return 0;
  return Math.floor(n);
}

async function parseWithGPT(text) {
  const safeText = String(text || '');
  console.log('=== GPT INPUT TEXT LENGTH ===', safeText.length);
  console.log('=== FIRST 1500 CHARS ===', safeText.substring(0, 1500));

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      temperature: 0,
      messages: [
        {
          role: 'user',
          content: `Extract exactly these 4 numbers from the Form16 text. 
Look specifically for:
- Gross Salary near "section 17(1)" or "salary as per provisions"
- TDS near "tax deducted at source" or "total tax deducted" or "amount of tax deducted"
- Standard Deduction near "section 16(ia)" or "standard deduction"
- 80C Deductions near "section 80C" or "deduction under section 80C"

Return ONLY valid JSON, no explanation:
{"grossSalary": number, "tds": number, "standardDeduction": number, "deductions80C": number}

Text:
${safeText.substring(0, 7000)}`,
        },
      ],
    }),
  });

  const data = await response.json();
  console.log('=== GPT RAW RESPONSE ===', JSON.stringify(data, null, 2));

  try {
    const parsed = JSON.parse(data?.choices?.[0]?.message?.content || '');
    console.log('=== GPT PARSED FIELDS ===', parsed);
    return {
      grossSalary: coerceNonNegativeInt(parsed?.grossSalary),
      tds: coerceNonNegativeInt(parsed?.tds),
      standardDeduction: coerceNonNegativeInt(parsed?.standardDeduction) || 50000,
      deductions80C: coerceNonNegativeInt(parsed?.deductions80C),
    };
  } catch (e) {
    console.error('GPT parse failed', e);
    return { ...SAFE_FIELDS };
  }
}

async function extractWithOCR(buffer, mimeType = 'application/pdf') {
  const formData = new URLSearchParams();
  formData.append('base64Image', `data:${mimeType};base64,${buffer.toString('base64')}`);
  formData.append('apikey', process.env.OCR_SPACE_API_KEY || 'K89008606188957');
  formData.append('language', 'eng');
  formData.append('OCREngine', '2');

  const res = await fetch('https://api.ocr.space/parse/image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString(),
  });
  const data = await res.json();
  if (data?.IsErroredOnProcessing) throw new Error('OCR failed');
  return data?.ParsedResults?.[0]?.ParsedText || '';
}

export async function POST(request) {
  const startTime = Date.now();

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file) {
      return Response.json(
        {
          success: false,
          error: 'No file',
          fields: { ...SAFE_FIELDS },
          confidence: 0,
          method: 'manual',
          extractedCount: '0/4',
          message: 'No file. Please enter values manually.',
          rawTextPreview: '',
          pdfBase64: null,
          previewMimeType: 'application/pdf',
          pdfTooLarge: false,
          processingTime: `${((Date.now() - startTime) / 1000).toFixed(1)}s`,
        },
        { status: 200 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || 'application/pdf';
    const fileName = file.name || 'document';
    const isPDF = mimeType === 'application/pdf' || String(fileName).toLowerCase().endsWith('.pdf');

    const pdfTooLarge = buffer.length >= PREVIEW_LIMIT_BYTES;
    const previewMimeType = mimeType || (isPDF ? 'application/pdf' : 'application/octet-stream');
    const pdfBase64 = pdfTooLarge ? null : buffer.toString('base64');

    let text = '';
    let method = isPDF ? 'unpdf' : 'upload';

    // Digital PDF
    if (isPDF) {
      try {
        const { text: t } = await extractText(new Uint8Array(buffer), { mergePages: true });
        if (String(t || '').length > 300) text = t;
      } catch {
        // ignore
      }
    }

    // Scanned / image fallback
    if (String(text || '').length < 300) {
      try {
        text = await extractWithOCR(buffer, mimeType);
        method = 'ocr_space';
      } catch {
        const elapsed = `${((Date.now() - startTime) / 1000).toFixed(1)}s`;
        return Response.json({
          success: true,
          fields: { ...SAFE_FIELDS },
          confidence: 0,
          method: 'manual',
          extractedCount: '0/4',
          message: 'Please enter values manually',
          rawTextPreview: '',
          pdfBase64,
          previewMimeType,
          pdfTooLarge,
          processingTime: elapsed,
        });
      }
    }

    const rawTextPreview = String(text || '').substring(0, 1200);

    if (!process.env.OPENAI_API_KEY) {
      const elapsed = `${((Date.now() - startTime) / 1000).toFixed(1)}s`;
      return Response.json(
        {
          success: false,
          error: 'OPENAI_API_KEY not configured',
          fields: { ...SAFE_FIELDS },
          confidence: 0,
          method: 'manual',
          extractedCount: '0/4',
          message: 'AI parsing is not configured. Please enter values manually.',
          rawTextPreview,
          pdfBase64,
          previewMimeType,
          pdfTooLarge,
          processingTime: elapsed,
        },
        { status: 200 }
      );
    }

    const fields = await parseWithGPT(text);
    const count = Object.values(fields).filter((v) => coerceNonNegativeInt(v) > 0).length;

    const confidence = count === 4 ? 0.98 : count === 3 ? 0.85 : 0.6;
    const message =
      count === 4
        ? 'Perfect extraction – please verify'
        : count === 3
        ? 'Partial extraction – please check'
        : 'Low confidence – please verify all fields';

    const elapsed = `${((Date.now() - startTime) / 1000).toFixed(1)}s`;
    return Response.json({
      success: true,
      fields,
      confidence,
      method: `${method}+gpt`,
      extractedCount: `${count}/4`,
      usedGPT: true,
      message,
      rawTextPreview,
      pdfBase64,
      previewMimeType,
      pdfTooLarge,
      processingTime: elapsed,
    });
  } catch (error) {
    return Response.json({
      success: false,
      fields: { ...SAFE_FIELDS },
      confidence: 0,
      method: 'error_fallback',
      extractedCount: '0/4',
      message: 'Processing error. Please enter values manually.',
      error: String(error?.message || error),
      pdfBase64: null,
      previewMimeType: 'application/pdf',
      pdfTooLarge: true,
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Allow': 'OPTIONS, POST',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS, POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
