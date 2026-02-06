export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import crypto from 'node:crypto';

import { parseInrNumber } from '@/lib/itr/numbers';

function jobId() {
  return `job_${crypto.randomBytes(10).toString('hex')}`;
}

function flag(fieldKey, message, sources = []) {
  return { fieldKey, message, sources };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const extractedByFile = Array.isArray(body?.extractedByFile) ? body.extractedByFile : [];

    if (extractedByFile.length === 0) {
      return NextResponse.json({ error: 'Missing extractedByFile' }, { status: 400 });
    }

    const job = jobId();
    const flags = [];

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
      flags,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(report, { status: 200, headers: { 'Cache-Control': 'no-store' } });
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
