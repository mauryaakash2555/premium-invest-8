export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import fs from 'node:fs';

import { ensureSessionId } from '@/lib/itr/session';
import { getFileMeta } from '@/lib/itr/storage';

export async function GET(request) {
  try {
    const { sessionId, setCookie } = ensureSessionId(request);
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('fileId');

    if (!fileId) {
      const resp = NextResponse.json({ error: 'Missing fileId' }, { status: 400 });
      if (setCookie) resp.headers.set('Set-Cookie', setCookie);
      return resp;
    }

    const meta = getFileMeta(fileId);
    if (!meta || meta.sessionId !== sessionId) {
      const resp = NextResponse.json({ error: 'Not found' }, { status: 404 });
      if (setCookie) resp.headers.set('Set-Cookie', setCookie);
      return resp;
    }

    const buf = fs.readFileSync(meta.diskPath);
    const contentType = meta.contentType || (meta.filename?.toLowerCase().endsWith('.pdf') ? 'application/pdf' : 'application/octet-stream');

    const resp = new NextResponse(buf, {
      status: 200,
      headers: {
        'content-type': contentType,
        'content-disposition': `inline; filename="${meta.filename || 'document'}"`,
        'cache-control': 'no-store',
      },
    });
    if (setCookie) resp.headers.set('Set-Cookie', setCookie);
    return resp;
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: 'File fetch failed',
        message: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
