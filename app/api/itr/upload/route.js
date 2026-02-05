export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import crypto from 'node:crypto';

import { ensureSessionId } from '@/lib/itr/session';
import { detectDocTypeFromText } from '@/lib/itr/docDetection';
import { extractPdfText, detectPdfType, getAllText } from '@/lib/itr/pdfExtract';
import { uploadBytes, uploadJson, metaKey, uploadKey } from '@/lib/itr/remoteStore';
import { supabaseAdmin } from '@/lib/db/supabaseAdmin';

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
    const { sessionId, setCookie } = ensureSessionId(request);
    const uploadId = makeId('upload');

    const form = await request.formData();
    const files = form.getAll('files');

    if (!files || files.length === 0) {
      const resp = NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
      if (setCookie) resp.headers.set('Set-Cookie', setCookie);
      return resp;
    }

    const results = [];
    const bucket = process.env.ITR_STORAGE_BUCKET || 'itr-documents';
    const supabase = supabaseAdmin();

    for (const f of files) {
      const filename = String(f?.name || 'upload.bin');
      const ext = filename.toLowerCase().split('.').pop();
      const isPdf = ext === 'pdf' || String(f?.type || '').includes('pdf');

      const bytes = new Uint8Array(await f.arrayBuffer());
      const buffer = Buffer.from(bytes);
      const fileId = makeId('itrfile');
      const storageKey = uploadKey({ sessionId, uploadId, fileId, filename });

      await uploadBytes({
        key: storageKey,
        buffer,
        contentType: String(f?.type || '') || 'application/octet-stream',
      });

      let type = isPdf ? 'SCANNED_PDF' : 'SCANNED_PDF';
      let pages = 1;
      let detection = null;
      let detectedDocType = 'unknown';
      let extractedPreview = null;

      if (isPdf) {
        try {
          const extracted = await extractPdfText(bytes);
          const pdfKind = detectPdfType(extracted);
          const allText = getAllText(extracted);
          pages = Number(extracted?.numPages || 1) || 1;
          type = pdfKind;
          detection = {
            method: 'pdfjs',
            hasSelectableText: !!extracted?.hasSelectableText,
            extractedTextLength: String(allText || '').length,
          };
          detectedDocType = detectDocTypeFromText(allText);

          extractedPreview = {
            type: pdfKind === 'DIGITAL_PDF' ? 'DIGITAL' : 'SCANNED',
            pages,
            fields: extractFieldsFromText(allText),
            rawTextCount: String(allText || '').length,
          };
        } catch (e) {
          detection = { method: 'pdfjs', error: e?.message || String(e) };
          type = 'SCANNED_PDF';
          detectedDocType = 'unknown';
        }
      }

      const createdAt = new Date().toISOString();
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();

      const meta = {
        fileId,
        sessionId,
        uploadId,
        filename,
        contentType: String(f?.type || ''),
        sizeBytes: bytes.length,
        storageKey,
        type,
        pages,
        docType: detectedDocType,
        detection,
        createdAt,
        expiresAt,
      };

      await uploadJson({ key: metaKey({ sessionId, fileId }), obj: meta });

      const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(storageKey);

      results.push({
        fileId,
        filename,
        type,
        pages,
        docType: detectedDocType,
        fileUrl: urlData?.publicUrl || null,
        extracted: extractedPreview,
      });
    }

    const resp = NextResponse.json({ ok: true, uploadId, files: results }, { status: 200 });
    if (setCookie) resp.headers.set('Set-Cookie', setCookie);
    return resp;
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
