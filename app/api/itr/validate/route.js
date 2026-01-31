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

    // Layer 2: cross-doc checks (basic)
    const tds = [];
    const interest = [];

    for (const ex of extractedByFile) {
      for (const f of ex.fields || []) {
        if (f.key === 'tds_total') tds.push(f);
        if (f.key === 'interest_total') interest.push(f);
      }
    }

    if (tds.length >= 2) {
      const nums = tds.map((t) => ({ f: t, n: parseInrNumber(t.valueText) })).filter((x) => x.n !== null);
      if (nums.length >= 2) {
        const base = nums[0].n;
        for (let i = 1; i < nums.length; i++) {
          const delta = Math.abs(nums[i].n - base);
          if (delta > 1) {
            flags.push(
              flag(
                'tds_total',
                'Mismatch detected: [fieldA] vs [fieldB]. Please review highlighted source locations and confirm values.',
                [nums[0].f.source, nums[i].f.source].filter(Boolean)
              )
            );
          }
        }
      }
    }

    if (interest.length >= 2) {
      const nums = interest.map((t) => ({ f: t, n: parseInrNumber(t.valueText) })).filter((x) => x.n !== null);
      if (nums.length >= 2) {
        const base = nums[0].n;
        for (let i = 1; i < nums.length; i++) {
          const delta = Math.abs(nums[i].n - base);
          if (delta > 1) {
            flags.push(
              flag(
                'interest_total',
                'Mismatch detected: [fieldA] vs [fieldB]. Please review highlighted source locations and confirm values.',
                [nums[0].f.source, nums[i].f.source].filter(Boolean)
              )
            );
          }
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
