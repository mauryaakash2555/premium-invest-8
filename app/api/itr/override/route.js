export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

import { ensureSessionId } from '@/lib/itr/session';
import { downloadJson, uploadJson, metaKey, extractionKey, appendAuditEvents } from '@/lib/itr/remoteStore';

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

    const metaResp = await downloadJson({ key: metaKey({ sessionId, fileId }) });
    const meta = metaResp?.obj;
    if (!meta || meta.sessionId !== sessionId) {
      const resp = NextResponse.json({ error: 'Not found' }, { status: 404 });
      if (setCookie) resp.headers.set('Set-Cookie', setCookie);
      return resp;
    }

    const extractionResp = await downloadJson({ key: extractionKey({ sessionId, fileId }) });
    const extraction = extractionResp?.obj;
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
    await uploadJson({ key: extractionKey({ sessionId, fileId }), obj: updated });

    await appendAuditEvents({
      sessionId,
      events: [
        {
          type: 'manual_override',
          sessionId,
          fileId,
          fieldKey,
          old_value: oldValueText,
          new_value: String(newValueText ?? ''),
        },
      ],
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
