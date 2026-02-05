export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import path from 'node:path';
import fs from 'node:fs';

import { ensureSessionId } from '@/lib/itr/session';
import { getFileMeta, readFileBytes, writeJsonAtomic, saveFileMeta } from '@/lib/itr/storage';
import { rawPathForFile, extractionPathForFile, auditLogPath } from '@/lib/itr/paths';
import { detectDocTypeFromText } from '@/lib/itr/docDetection';
import { mapFieldsFromExtraction } from '@/lib/itr/mapping';
import { extractPdfText, detectPdfType, getAllText } from '@/lib/itr/pdfExtract';

function appendAuditLine(filePath, obj) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.appendFileSync(filePath, JSON.stringify(obj) + '\n', 'utf8');
}

export async function POST(request) {
  try {
    const { sessionId, setCookie } = ensureSessionId(request);
    const body = await request.json();
    const fileIds = Array.isArray(body?.fileIds) ? body.fileIds : [];

    if (fileIds.length === 0) {
      const resp = NextResponse.json({ error: 'Missing fileIds' }, { status: 400 });
      if (setCookie) resp.headers.set('Set-Cookie', setCookie);
      return resp;
    }

    const outputs = [];

    for (const fileId of fileIds) {
      const meta = getFileMeta(fileId);
      if (!meta || meta.sessionId !== sessionId) {
        outputs.push({ fileId, ok: false, error: 'NOT_FOUND' });
        continue;
      }

      const bytes = readFileBytes(meta.diskPath);
      const filename = meta.filename;
      const isPdf = String(filename || '').toLowerCase().endsWith('.pdf') || String(meta.contentType || '').includes('pdf');

      if (!isPdf) {
        // Non-PDF files require OCR which we don't support in the JS version
        outputs.push({ 
          fileId, 
          ok: false, 
          error: 'UNSUPPORTED_FORMAT',
          message: 'Only PDF files with selectable text are supported. Scanned documents require OCR.' 
        });
        continue;
      }

      try {
        // Extract text using pure JavaScript pdfjs-dist
        const extractionResult = await extractPdfText(bytes);
        const pdfKind = detectPdfType(extractionResult);
        const allText = getAllText(extractionResult);
        
        // Save raw extraction data
        writeJsonAtomic(rawPathForFile(fileId), extractionResult);

        if (pdfKind === 'SCANNED_PDF') {
          // Scanned PDF - create manual entry fields
          const docType = meta.docType && meta.docType !== 'unknown' ? meta.docType : detectDocTypeFromText(allText);
          const mapping = await loadMapping(docType);
          const fieldDefs = mapping?.fields || [];
          
          const manualFields = fieldDefs.map((def) => ({
            key: def.key,
            label: def.label,
            valueText: null,
            status: 'FLAGGED',
            reason: 'SCANNED_PDF_MANUAL_ENTRY_REQUIRED',
            source: {
              source_file: fileId,
              filename,
              page: 1,
              bbox: null,
              raw_text_token: null,
              raw_line_text: null,
              confidence: null,
            },
          }));

          const extraction = {
            fileId,
            filename,
            kind: 'SCANNED_PDF',
            docType,
            fields: manualFields,
            warnings: ['This PDF appears to be scanned. Please enter values manually while viewing the PDF.'],
            createdAt: new Date().toISOString(),
          };

          writeJsonAtomic(extractionPathForFile(fileId), extraction);
          saveFileMeta(fileId, { ...meta, type: 'SCANNED_PDF', docType });
          
          outputs.push({ fileId, ok: true, kind: 'SCANNED_PDF', docType, fields: extraction.fields, warnings: extraction.warnings });
          continue;
        }

        // Digital PDF with selectable text
        const docType = meta.docType && meta.docType !== 'unknown' ? meta.docType : detectDocTypeFromText(allText);
        const mapped = mapFieldsFromExtraction({ raw: extractionResult, fileId, filename, docType });

        const extraction = {
          fileId,
          filename,
          kind: 'DIGITAL_PDF',
          docType,
          fields: mapped.fields,
          warnings: mapped.warnings,
          createdAt: new Date().toISOString(),
        };

        writeJsonAtomic(extractionPathForFile(fileId), extraction);
        saveFileMeta(fileId, { ...meta, type: 'DIGITAL_PDF', docType });

        // Audit log
        for (const f of extraction.fields || []) {
          appendAuditLine(auditLogPath({ sessionId }), {
            type: 'extracted_field',
            method: 'pdfjs',
            sessionId,
            fileId,
            filename,
            fieldKey: f?.key,
            label: f?.label,
            valueText: f?.valueText ?? null,
            confidence: f?.source?.confidence ?? null,
            source: f?.source ?? null,
            status: f?.status,
            reason: f?.reason ?? null,
            at: new Date().toISOString(),
          });
        }

        outputs.push({ fileId, ok: true, kind: 'DIGITAL_PDF', docType, fields: extraction.fields });
      } catch (e) {
        appendAuditLine(auditLogPath({ sessionId }), {
          type: 'extraction_failed',
          sessionId,
          fileId,
          filename,
          at: new Date().toISOString(),
          message: e?.message || String(e),
        });
        outputs.push({ fileId, ok: false, error: 'EXTRACTION_FAILED', message: e?.message || String(e) });
      }
    }

    const resp = NextResponse.json({ ok: true, results: outputs }, { status: 200 });
    if (setCookie) resp.headers.set('Set-Cookie', setCookie);
    return resp;
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Extraction failed',
        message: err?.message || String(err),
        userMessage: 'We could not extract reliable values from this file. Please open the PDF and correct highlighted fields.',
      },
      { status: 500 }
    );
  }
}

async function loadMapping(docType) {
  const mappings = {
    form16: () => import('@/lib/mappings/form16.json'),
    ais: () => import('@/lib/mappings/ais.json'),
    bank: () => import('@/lib/mappings/bank.json'),
  };
  const loader = mappings[docType];
  if (!loader) return null;
  const mod = await loader();
  return mod.default || mod;
}
