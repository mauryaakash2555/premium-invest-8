export const runtime = 'nodejs';

import { spawn } from 'node:child_process';
import path from 'node:path';

function groupItemsIntoLines(items) {
  // PDF.js text items include a transform matrix; transform[4] is x, transform[5] is y.
  // We'll bucket by y (rounded) to preserve line order.
  const byY = new Map();
  for (const item of items || []) {
    const str = String(item?.str || '').trim();
    if (!str) continue;
    const t = item?.transform;
    const x = Array.isArray(t) ? Number(t[4] || 0) : 0;
    const y = Array.isArray(t) ? Number(t[5] || 0) : 0;
    const key = Math.round(y);
    const row = byY.get(key) || [];
    row.push({ x, str });
    byY.set(key, row);
  }

  // Higher y is usually higher on the page.
  const ys = Array.from(byY.keys()).sort((a, b) => b - a);
  const lines = ys.map((y) => {
    const row = byY.get(y) || [];
    row.sort((a, b) => a.x - b.x);
    return row.map((r) => r.str).join(' ').replace(/\s{2,}/g, ' ').trim();
  });

  return lines.filter(Boolean);
}

function stripCommonHeaderFooter(pagesLines) {
  if (!Array.isArray(pagesLines) || pagesLines.length < 2) return pagesLines;

  const prefixCandidates = new Map();
  const suffixCandidates = new Map();

  for (const lines of pagesLines) {
    const prefix = (lines || []).slice(0, 3).map((s) => s.toLowerCase());
    const suffix = (lines || []).slice(-3).map((s) => s.toLowerCase());

    for (const p of prefix) {
      if (!p || p.length < 8) continue;
      prefixCandidates.set(p, (prefixCandidates.get(p) || 0) + 1);
    }
    for (const s of suffix) {
      if (!s || s.length < 8) continue;
      suffixCandidates.set(s, (suffixCandidates.get(s) || 0) + 1);
    }
  }

  const minCount = Math.max(2, Math.ceil(pagesLines.length * 0.6));
  const commonHeader = new Set(
    Array.from(prefixCandidates.entries())
      .filter(([, c]) => c >= minCount)
      .map(([t]) => t)
  );
  const commonFooter = new Set(
    Array.from(suffixCandidates.entries())
      .filter(([, c]) => c >= minCount)
      .map(([t]) => t)
  );

  return pagesLines.map((lines) => {
    const clean = [];
    for (const line of lines || []) {
      const low = String(line).toLowerCase();
      if (commonHeader.has(low) || commonFooter.has(low)) continue;
      clean.push(line);
    }
    return clean;
  });
}

async function runPdfPlumber(pdfBytes) {
  // Prefer a python script (pdfplumber) when available. This keeps extraction
  // highly accurate for selectable-text PDFs.
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
        if (code !== 0) {
          return reject(new Error(stderr || `pdfplumber exited with ${code}`));
        }
        resolve(stdout);
      });
      child.stdin.write(input);
      child.stdin.end();
    });

  // Try python runners in common order.
  const candidates = [
    { cmd: process.env.PDFPLUMBER_PYTHON || 'python', args: [scriptPath] },
    { cmd: 'py', args: ['-3', scriptPath] },
  ];

  let lastErr;
  for (const c of candidates) {
    try {
      const out = await trySpawn(c.cmd, c.args);
      const parsed = JSON.parse(out);
      if (parsed && parsed.method === 'pdfplumber') return parsed;
      // If script printed an error JSON, treat as failure.
      throw new Error(parsed?.message || 'pdfplumber returned invalid output');
    } catch (e) {
      lastErr = e;
    }
  }

  throw lastErr || new Error('pdfplumber unavailable');
}

async function tryBackendPdfPlumber(pdfBytes) {
  const backend = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL;
  if (!backend) return null;

  const base = String(backend).replace(/\/$/, '');
  const url = `${base}/api/itr/extract-text`;

  const controller = new AbortController();
  const t = setTimeout(() => controller.abort(), 8000);
  try {
    const resp = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/pdf' },
      body: Buffer.from(pdfBytes),
      signal: controller.signal,
    });
    if (!resp.ok) return null;
    const json = await resp.json();
    if (json?.method === 'pdfplumber') return json;
    return null;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

export async function POST(request) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let pdfBytes;

    if (contentType.includes('application/pdf')) {
      const buf = await request.arrayBuffer();
      pdfBytes = new Uint8Array(buf);
    } else {
      const body = await request.json();
      if (!body?.base64) {
        return Response.json({ error: 'Missing base64 PDF data' }, { status: 400 });
      }
      const bin = Buffer.from(String(body.base64), 'base64');
      pdfBytes = new Uint8Array(bin);
    }

    // Strict rule: selectable-text extraction must use pdfplumber.
    // We do NOT fall back to PDF.js here to avoid violating the locked spec.
    const backend = await tryBackendPdfPlumber(pdfBytes);
    if (backend) return Response.json(backend);

    const plumber = await runPdfPlumber(pdfBytes);
    return Response.json(plumber);
  } catch (err) {
    return Response.json(
      {
        error: 'Text extraction unavailable',
        message: err?.message || String(err),
      },
      { status: 503 }
    );
  }
}
