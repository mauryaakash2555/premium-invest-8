export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';

import { ensureSessionId } from '@/lib/itr/session';
import { getFileMeta, readJsonIfExists, writeJsonAtomic } from '@/lib/itr/storage';
import { auditLogPath, extractionPathForFile } from '@/lib/itr/paths';

function appendAuditLine(filePath, obj) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.appendFileSync(filePath, JSON.stringify(obj) + '\n', 'utf8');
}

export async function POST(request) {
  try {
    const { sessionId, setCookie } = ensureSessionId(request);
    const body = await request.json();
    const fileId = body?.fileId;
    const fieldKey = body?.fieldKey;
    const newValueText = body?.newValueText;

    if (!fileId || !fieldKey) {
      const resp = NextResponse.json({ error: 'Missing fileId or fieldKey' }, { status: 400 });
      if (setCookie) resp.headers.set('Set-Cookie', setCookie);
      return resp;
    }

    const meta = getFileMeta(fileId);
    if (!meta || meta.sessionId !== sessionId) {
      const resp = NextResponse.json({ error: 'Not found' }, { status: 404 });
      if (setCookie) resp.headers.set('Set-Cookie', setCookie);
      return resp;
    }

    const extraction = readJsonIfExists(extractionPathForFile(fileId));
    if (!extraction) {
      const resp = NextResponse.json({ error: 'No extraction for file' }, { status: 400 });
      if (setCookie) resp.headers.set('Set-Cookie', setCookie);
      return resp;
    }

    const fields = Array.isArray(extraction.fields) ? extraction.fields : [];
    const idx = fields.findIndex((f) => f?.key === fieldKey);
    if (idx < 0) {
      const resp = NextResponse.json({ error: 'Field not found' }, { status: 404 });
      if (setCookie) resp.headers.set('Set-Cookie', setCookie);
      return resp;
    }

    const oldValueText = fields[idx]?.valueText ?? null;
    fields[idx] = {
      ...fields[idx],
      valueText: String(newValueText ?? ''),
      manual_override: true,
      old_value: oldValueText,
      new_value: String(newValueText ?? ''),
      override_at: new Date().toISOString(),
    };

    const updated = { ...extraction, fields, updatedAt: new Date().toISOString() };
    writeJsonAtomic(extractionPathForFile(fileId), updated);

    appendAuditLine(auditLogPath({ sessionId }), {
      type: 'manual_override',
      sessionId,
      fileId,
      fieldKey,
      old_value: oldValueText,
      new_value: String(newValueText ?? ''),
      at: new Date().toISOString(),
    });

    const resp = NextResponse.json({ ok: true }, { status: 200 });
    if (setCookie) resp.headers.set('Set-Cookie', setCookie);
    return resp;
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Override failed',
        message: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
