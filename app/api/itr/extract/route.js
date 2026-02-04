export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import path from 'node:path';
import { spawn } from 'node:child_process';

import { ensureSessionId } from '@/lib/itr/session';
import { getFileMeta, readFileBytes, writeJsonAtomic, saveFileMeta } from '@/lib/itr/storage';
import { rawPathForFile, ocrPathForFile, extractionPathForFile } from '@/lib/itr/paths';
import { detectDocTypeFromText, detectPdfKind } from '@/lib/itr/docDetection';
import { mapFieldsFromPdfPlumberRaw, mapFieldsFromOcrPages } from '@/lib/itr/mapping';
import { auditLogPath } from '@/lib/itr/paths';
import fs from 'node:fs';

async function runPdfPlumberExtract(pdfBytes) {
  const scriptPath = path.join(process.cwd(), 'scripts', 'pdfplumber_extract.py');
  const input = Buffer.from(pdfBytes).toString('base64');

  const trySpawn = (command, args) =>
    new Promise((resolve, reject) => {
      const child = spawn(command, args, { stdio: ['pipe', 'pipe', 'pipe'] });
      let stdout = '';
      let stderr = '';
      child.stdout.on('data', (d) => (stdout += d.toString()));
      child.stderr.on('data', (d) => (stderr += d.toString()));
      child.on('error', reject);
      child.on('close', (code) => {
        if (code !== 0) return reject(new Error(stderr || `pdfplumber exited with ${code}`));
        resolve(stdout);
      });
      child.stdin.write(input);
      child.stdin.end();
    });

  const candidates = [
    { cmd: process.env.PDFPLUMBER_PYTHON || 'python', args: [scriptPath] },
    { cmd: 'py', args: ['-3', scriptPath] },
  ];

  let lastErr;
  for (const c of candidates) {
    try {
      const out = await trySpawn(c.cmd, c.args);
      return JSON.parse(out);
    } catch (e) {
      lastErr = e;
    }
  }

  throw lastErr || new Error('pdfplumber unavailable');
}

function appendAuditLine(filePath, obj) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.appendFileSync(filePath, JSON.stringify(obj) + '\n', 'utf8');
}

async function runOcrWorker({ bytes, filename }) {
  // Preferred: call an OCR worker HTTP service if configured.
  const workerUrl = process.env.OCR_WORKER_URL;
  if (workerUrl) {
    const resp = await fetch(`${String(workerUrl).replace(/\/$/, '')}/extract`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ base64: Buffer.from(bytes).toString('base64'), filename }),
    });
    if (!resp.ok) {
      const txt = await resp.text();
      throw new Error(`OCR worker failed: ${resp.status} ${txt}`);
    }
    return await resp.json();
  }

  // Fallback: spawn python worker in CLI mode.
  const scriptPath = path.join(process.cwd(), 'scripts', 'ocr_worker.py');
  const input = JSON.stringify({ base64: Buffer.from(bytes).toString('base64'), filename });

  const trySpawn = (command, args) =>
    new Promise((resolve, reject) => {
      const child = spawn(command, args, { stdio: ['pipe', 'pipe', 'pipe'] });
      let stdout = '';
      let stderr = '';
      child.stdout.on('data', (d) => (stdout += d.toString()));
      child.stderr.on('data', (d) => (stderr += d.toString()));
      child.on('error', reject);
      child.on('close', (code) => {
        if (code !== 0) return reject(new Error(stderr || `ocr_worker exited with ${code}`));
        resolve(stdout);
      });
      child.stdin.write(input);
      child.stdin.end();
    });

  const candidates = [
    { cmd: process.env.OCR_PYTHON || 'python', args: [scriptPath, '--stdin-json'] },
    { cmd: 'py', args: ['-3', scriptPath, '--stdin-json'] },
  ];

  let lastErr;
  for (const c of candidates) {
    try {
      const out = await trySpawn(c.cmd, c.args);
      return JSON.parse(out);
    } catch (e) {
      lastErr = e;
    }
  }

  throw lastErr || new Error('ocr worker unavailable');
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

      // Always perform PDF type detection BEFORE any OCR.
      // If selectable text exists -> DIGITAL_PDF, else -> SCANNED_PDF.
      let pdfPlumberRaw = null;
      let pdfHasSelectableText = null;
      let extractedAllText = '';
      let detectedKind = meta.type;

      if (isPdf) {
        try {
          pdfPlumberRaw = await runPdfPlumberExtract(bytes);
          extractedAllText = Array.isArray(pdfPlumberRaw?.pages)
            ? pdfPlumberRaw.pages.map((p) => p?.text || '').join('\n\n')
            : '';
          pdfHasSelectableText = !!pdfPlumberRaw?.hasSelectableText;
          detectedKind = detectPdfKind({ hasSelectableText: pdfHasSelectableText, extractedText: extractedAllText });
        } catch (e) {
          // If pdfplumber is unavailable we conservatively treat as scanned.
          pdfPlumberRaw = null;
          extractedAllText = '';
          pdfHasSelectableText = null;
          detectedKind = 'SCANNED_PDF';
          appendAuditLine(auditLogPath({ sessionId }), {
            type: 'pdf_type_detection_failed',
            sessionId,
            fileId,
            filename,
            at: new Date().toISOString(),
            message: e?.message || String(e),
          });
        }
      }

      if (isPdf && detectedKind === 'DIGITAL_PDF') {
        const raw = pdfPlumberRaw || (await runPdfPlumberExtract(bytes));
        writeJsonAtomic(rawPathForFile(fileId), raw);

        const allText = extractedAllText || (Array.isArray(raw?.pages) ? raw.pages.map((p) => p?.text || '').join('\n\n') : '');
        const docType = meta.docType && meta.docType !== 'unknown' ? meta.docType : detectDocTypeFromText(allText);

        const mapped = mapFieldsFromPdfPlumberRaw({ raw, fileId, filename, docType });

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

        for (const f of extraction.fields || []) {
          appendAuditLine(auditLogPath({ sessionId }), {
            type: 'extracted_field',
            method: 'pdfplumber',
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
        continue;
      }

      // SCANNED_PDF or image: run OCR worker (fallback-only). Never guess.
      // If OCR worker is unavailable, provide manual entry fields.
      let ocr = null;
      let ocrError = null;
      try {
        ocr = await runOcrWorker({ bytes, filename });
        writeJsonAtomic(ocrPathForFile(fileId), ocr);
      } catch (e) {
        ocrError = e?.message || String(e);
        appendAuditLine(auditLogPath({ sessionId }), {
          type: 'ocr_worker_failed',
          sessionId,
          fileId,
          filename,
          at: new Date().toISOString(),
          message: ocrError,
        });
      }

      const docType = meta.docType && meta.docType !== 'unknown' ? meta.docType : detectDocTypeFromText(extractedAllText || '');
      
      // If OCR failed, create placeholder fields for manual entry
      let mapped;
      if (ocr) {
        mapped = mapFieldsFromOcrPages({ ocr, fileId, filename, docType, minConfidence: 0.85 });
      } else {
        // Create manual entry fields from mapping
        const mapping = { form16: await import('@/lib/mappings/form16.json'), ais: await import('@/lib/mappings/ais.json'), bank: await import('@/lib/mappings/bank.json') }[docType]?.default || null;
        const fieldDefs = mapping?.fields || [];
        const manualFields = fieldDefs.map((def) => ({
          key: def.key,
          label: def.label,
          valueText: null,
          status: 'FLAGGED',
          reason: 'OCR_UNAVAILABLE_MANUAL_ENTRY_REQUIRED',
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
        mapped = { docType, fields: manualFields, warnings: ['OCR unavailable - please enter values manually while viewing the PDF'] };
      }

      const extraction = {
        fileId,
        filename,
        kind: 'SCANNED_PDF',
        docType,
        fields: mapped.fields,
        warnings: [...(ocrError ? [`OCR failed: ${ocrError}`] : []), ...(Array.isArray(ocr?.warnings) ? ocr.warnings : []), ...(Array.isArray(mapped?.warnings) ? mapped.warnings : [])],
        createdAt: new Date().toISOString(),
        ocrMeta: {
          method: ocr?.method || 'manual_fallback',
          overallConfidence: typeof ocr?.overallConfidence === 'number' ? ocr.overallConfidence : null,
          ocrError: ocrError || null,
        },
      };
      writeJsonAtomic(extractionPathForFile(fileId), extraction);
      saveFileMeta(fileId, { ...meta, type: 'SCANNED_PDF', docType });

      for (const f of extraction.fields || []) {
        appendAuditLine(auditLogPath({ sessionId }), {
          type: 'extracted_field',
          method: ocr?.method || 'manual_fallback',
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

      outputs.push({ fileId, ok: true, kind: 'SCANNED_PDF', docType, fields: extraction.fields, warnings: extraction.warnings });
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
        userMessage:
          'We could not extract reliable values from this file. Please open the PDF and correct highlighted fields. (No automatic guesses were made.)',
      },
      { status: 500 }
    );
  }
}
