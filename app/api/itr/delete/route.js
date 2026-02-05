export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

import { ensureSessionId } from '@/lib/itr/session';
import { downloadJson, metaKey, extractionKey, rawExtractionKey, removeKeys } from '@/lib/itr/remoteStore';

export async function POST(request) {
  try {
    const { sessionId, setCookie } = ensureSessionId(request);
    const body = await request.json();
    const fileId = body?.fileId;

    if (!fileId) {
      const resp = NextResponse.json({ error: 'Missing fileId' }, { status: 400 });
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

    await removeKeys([
      meta.storageKey,
      metaKey({ sessionId, fileId }),
      extractionKey({ sessionId, fileId }),
      rawExtractionKey({ sessionId, fileId }),
    ]);

    const resp = NextResponse.json({ ok: true }, { status: 200 });
    if (setCookie) resp.headers.set('Set-Cookie', setCookie);
    return resp;
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Delete failed',
        message: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
