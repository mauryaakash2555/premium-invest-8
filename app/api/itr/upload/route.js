export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import crypto from 'node:crypto';

import { PDFParse } from 'pdf-parse';

function makeId(prefix) {
  return `${prefix}_${crypto.randomBytes(12).toString('hex')}`;
}

function extractFieldsFromText(allText) {
  const text = String(allText || '');
  const fields = {};

  const readNumber = (s) => {
    const cleaned = String(s || '').replace(/[^\d,]/g, '');
    if (!cleaned) return null;
    const n = Number.parseInt(cleaned.replace(/,/g, ''), 10);
    return Number.isFinite(n) ? n : null;
  };

  // Gross Salary
  {
    const m = text.match(/gross\s+salary[^\d]{0,40}([\d,]{3,})/i);
    const raw = m?.[1] || null;
    const value = raw ? readNumber(raw) : null;
    if (value !== null) {
      fields.gross_salary = {
        value,
        raw,
        confidence: 1.0,
        source: { page: null, x: null, y: null },
      };
    }
  }

  // TDS
  {
    const m = text.match(/(?:\btds\b|tax\s+deducted)[^\d]{0,40}([\d,]{3,})/i);
    const raw = m?.[1] || null;
    const value = raw ? readNumber(raw) : null;
    if (value !== null) {
      fields.tds = {
        value,
        raw,
        confidence: 1.0,
        source: { page: null, x: null, y: null },
      };
    }
  }

  return fields;
}

export async function POST(request) {
  try {
    const form = await request.formData();
    const files = form.getAll('files');

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    const results = [];

    for (const f of files) {
      const filename = String(f?.name || 'upload.bin');
      const ext = filename.toLowerCase().split('.').pop();
      const isPdf = ext === 'pdf' || String(f?.type || '').includes('pdf');

      const bytes = new Uint8Array(await f.arrayBuffer());
      const fileId = makeId('itrfile');

      let type = isPdf ? 'SCANNED_PDF' : 'SCANNED_PDF';
      let pages = 1;
      let detection = null;
      let detectedDocType = 'unknown';
      let extractedPreview = null;

      if (isPdf) {
        try {
          const parser = new PDFParse({ data: Buffer.from(bytes) });
          let textResult;
          try {
            textResult = await parser.getText({ lineEnforce: true });
          } finally {
            try {
              await parser.destroy();
            } catch {
              // ignore
            }
          }

          const allText = String(textResult?.text || '');
          pages = Number(textResult?.total || 1) || 1;
          type = allText.trim().length >= 10 ? 'DIGITAL_PDF' : 'SCANNED_PDF';
          detection = {
            method: 'pdf-parse',
            extractedTextLength: allText.length,
          };
          detectedDocType = 'unknown';

          extractedPreview = {
            type: type === 'DIGITAL_PDF' ? 'DIGITAL' : 'SCANNED',
            pages,
            fields: extractFieldsFromText(allText),
            rawTextCount: allText.length,
          };
        } catch (e) {
          detection = { method: 'pdf-parse', error: e?.message || String(e) };
          type = 'SCANNED_PDF';
          detectedDocType = 'unknown';
        }
      }

      results.push({
        fileId,
        filename,
        type,
        pages,
        docType: detectedDocType,
        fileUrl: null,
        extracted: extractedPreview,
      });
    }

    return NextResponse.json({ ok: true, files: results }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Upload failed',
        message: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
