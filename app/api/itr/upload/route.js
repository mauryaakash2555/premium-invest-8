export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import crypto from 'node:crypto';
import path from 'node:path';
import { spawn } from 'node:child_process';

import { ensureSessionId } from '@/lib/itr/session';
import { assertStoreRootExists, makeId, saveFileBytes, saveFileMeta } from '@/lib/itr/storage';
import { filePathForUpload } from '@/lib/itr/paths';
import { detectPdfKind, detectDocTypeFromText } from '@/lib/itr/docDetection';

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

function keywordSummary(text) {
  const t = String(text || '').toLowerCase();
  return {
    hasForm16: t.includes('form 16') || t.includes('form no. 16'),
    hasAis: t.includes('annual information statement') || t.includes('ais'),
    hasTds: t.includes('tds') || t.includes('tax deducted at source'),
  };
}

export async function POST(request) {
  try {
    assertStoreRootExists();

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

    for (const f of files) {
      const filename = String(f?.name || 'upload.bin');
      const ext = filename.toLowerCase().split('.').pop();
      const isPdf = ext === 'pdf' || String(f?.type || '').includes('pdf');

      const bytes = new Uint8Array(await f.arrayBuffer());
      const fileId = makeId('itrfile');
      const diskPath = filePathForUpload({ sessionId, uploadId, filename });

      saveFileBytes(diskPath, bytes);

      let type = isPdf ? 'SCANNED_PDF' : 'SCANNED_PDF';
      let pages = 1;
      let detection = null;
      let detectedDocType = 'unknown';

      if (isPdf) {
        try {
          const extracted = await runPdfPlumberExtract(bytes);
          const allText = Array.isArray(extracted?.pages)
            ? extracted.pages.map((p) => p?.text || '').join('\n\n')
            : '';
          pages = Number(extracted?.totalPages || extracted?.pages?.length || 1) || 1;
          type = detectPdfKind({ extractedText: allText });
          detection = {
            method: 'pdfplumber',
            hasSelectableText: !!extracted?.hasSelectableText,
            keywords: keywordSummary(allText),
            extractedTextLength: String(allText || '').length,
          };
          detectedDocType = detectDocTypeFromText(allText);
        } catch (e) {
          // If pdfplumber is unavailable, we conservatively treat as scanned.
          detection = { method: 'pdfplumber', error: e?.message || String(e) };
          type = 'SCANNED_PDF';
          detectedDocType = 'unknown';
        }
      }

      const createdAt = new Date().toISOString();
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString();

      saveFileMeta(fileId, {
        fileId,
        sessionId,
        uploadId,
        filename,
        contentType: String(f?.type || ''),
        sizeBytes: bytes.length,
        diskPath,
        type,
        pages,
        docType: detectedDocType,
        detection,
        createdAt,
        expiresAt,
      });

      results.push({ fileId, filename, type, pages, docType: detectedDocType });
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
