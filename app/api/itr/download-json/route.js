export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

import { ensureSessionId } from '@/lib/itr/session';
import { downloadJson, metaKey, extractionKey } from '@/lib/itr/remoteStore';

export async function GET(request) {
  try {
    const { sessionId, setCookie } = ensureSessionId(request);
    const { searchParams } = new URL(request.url);
    const fileIds = String(searchParams.get('fileIds') || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    if (fileIds.length === 0) {
      const resp = NextResponse.json({ error: 'Missing fileIds' }, { status: 400 });
      if (setCookie) resp.headers.set('Set-Cookie', setCookie);
      return resp;
    }

    const out = [];
    for (const fileId of fileIds) {
      const metaResp = await downloadJson({ key: metaKey({ sessionId, fileId }) });
      const meta = metaResp?.obj;
      if (!meta || meta.sessionId !== sessionId) continue;

      const extractionResp = await downloadJson({ key: extractionKey({ sessionId, fileId }) });
      const extraction = extractionResp?.obj || null;
      out.push({ meta, extraction });
    }

    const resp = NextResponse.json({ ok: true, files: out }, { status: 200 });
    if (setCookie) resp.headers.set('Set-Cookie', setCookie);
    return resp;
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Download failed',
        message: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
