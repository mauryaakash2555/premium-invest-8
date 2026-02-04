export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import crypto from 'node:crypto';

import { ensureSessionId } from '@/lib/itr/session';
import { getFileMeta, readJsonIfExists, writeJsonAtomic } from '@/lib/itr/storage';
import { extractionPathForFile, validationReportPath } from '@/lib/itr/paths';
import { parseInrNumber } from '@/lib/itr/numbers';

function jobId() {
  return `job_${crypto.randomBytes(10).toString('hex')}`;
}

function flag(fieldKey, message, sources = []) {
  return { fieldKey, message, sources };
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

    const job = jobId();
    const flags = [];
    const extractedByFile = [];

    for (const fileId of fileIds) {
      const meta = getFileMeta(fileId);
      if (!meta || meta.sessionId !== sessionId) continue;
      const extraction = readJsonIfExists(extractionPathForFile(fileId));
      if (extraction) extractedByFile.push(extraction);
    }

    // Layer 1: format checks
    for (const ex of extractedByFile) {
      for (const f of ex.fields || []) {
        if (!f?.valueText) {
          flags.push(flag(f?.key || 'unknown', `Missing value: ${f?.label || ''}`, [f?.source].filter(Boolean)));
          continue;
        }
        const n = parseInrNumber(f.valueText);
        if (n === null) {
          flags.push(flag(f.key, `Format check failed: ${f.label}`, [f?.source].filter(Boolean)));
        }
      }
    }

    // Layer 2: cross-doc checks (Form16 vs AIS vs Bank)
    // Non-negotiable rule: if mismatch > ₹1, FLAG and require manual confirmation.
    const CROSS_CHECK_KEYS = ['tds_total', 'interest_total'];

    for (const key of CROSS_CHECK_KEYS) {
      const seen = [];
      for (const ex of extractedByFile) {
        for (const f of ex.fields || []) {
          if (f?.key !== key) continue;
          const n = parseInrNumber(f.valueText);
          if (n === null) continue;
          seen.push({ f, n, docType: ex?.docType || 'unknown' });
        }
      }

      if (seen.length < 2) continue;

      const base = seen[0];
      for (let i = 1; i < seen.length; i++) {
        const cur = seen[i];
        const delta = Math.abs(cur.n - base.n);
        if (delta > 1) {
          const msg =
            key === 'tds_total'
              ? 'Mismatch detected: Form16 vs AIS (TDS). If mismatch > ₹1, confirm from highlighted sources.'
              : 'Mismatch detected: AIS vs Bank (Interest). If mismatch > ₹1, confirm from highlighted sources.';
          flags.push(flag(key, msg, [base.f.source, cur.f.source].filter(Boolean)));
        }
      }
    }

    // Layer 3: arithmetic checks (placeholder: sums/subtotals vary by document templates)

    const report = {
      ok: flags.length === 0,
      status: flags.length === 0 ? 'ok' : 'warning',
      jobId: job,
      sessionId,
      flags,
      createdAt: new Date().toISOString(),
    };

    writeJsonAtomic(validationReportPath({ sessionId, jobId: job }), report);

    const resp = NextResponse.json(report, { status: 200 });
    if (setCookie) resp.headers.set('Set-Cookie', setCookie);
    return resp;
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        status: 'failed',
        error: 'Validation failed',
        message: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
