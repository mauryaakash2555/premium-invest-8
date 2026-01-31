export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import path from 'node:path';
import { spawn } from 'node:child_process';

import { ensureSessionId } from '@/lib/itr/session';
import { getFileMeta, readFileBytes, writeJsonAtomic, saveFileMeta } from '@/lib/itr/storage';
import { rawPathForFile, ocrPathForFile, extractionPathForFile } from '@/lib/itr/paths';
import { detectDocTypeFromText } from '@/lib/itr/docDetection';
import { mapFieldsFromPdfPlumberRaw } from '@/lib/itr/mapping';

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

      if (meta.type === 'DIGITAL_PDF') {
        const raw = await runPdfPlumberExtract(bytes);
        writeJsonAtomic(rawPathForFile(fileId), raw);

        const allText = Array.isArray(raw?.pages) ? raw.pages.map((p) => p?.text || '').join('\n\n') : '';
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
        saveFileMeta(fileId, { ...meta, docType });

        outputs.push({ fileId, ok: true, kind: 'DIGITAL_PDF', docType, fields: extraction.fields });
        continue;
      }

      // SCANNED_PDF or image: run OCR worker and map using label matching (OCR mapping is basic in v1).
      const ocr = await runOcrWorker({ bytes, filename });
      writeJsonAtomic(ocrPathForFile(fileId), ocr);

      const docType = meta.docType || 'unknown';
      const extraction = {
        fileId,
        filename,
        kind: 'SCANNED_PDF',
        docType,
        fields: Array.isArray(ocr?.fields) ? ocr.fields : [],
        warnings: Array.isArray(ocr?.warnings) ? ocr.warnings : [],
        createdAt: new Date().toISOString(),
      };
      writeJsonAtomic(extractionPathForFile(fileId), extraction);

      outputs.push({ fileId, ok: true, kind: 'SCANNED_PDF', docType, fields: extraction.fields });
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
