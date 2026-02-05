export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

import { ensureSessionId } from '@/lib/itr/session';
import { downloadBytes, auditKey } from '@/lib/itr/remoteStore';

export async function GET(request) {
  try {
    const { sessionId, setCookie } = ensureSessionId(request);
    const auditResp = await downloadBytes({ key: auditKey({ sessionId }) });
    const raw = auditResp?.buffer ? auditResp.buffer.toString('utf8') : '';
    if (!raw) {
      const resp = NextResponse.json({ ok: true, events: [] }, { status: 200 });
      if (setCookie) resp.headers.set('Set-Cookie', setCookie);
      return resp;
    }
    const lines = raw.split(/\n+/).filter(Boolean);
    const tail = lines.slice(-200).map((l) => {
      try {
        return JSON.parse(l);
      } catch {
        return { type: 'parse_error', raw: l };
      }
    });

    const resp = NextResponse.json({ ok: true, events: tail }, { status: 200 });
    if (setCookie) resp.headers.set('Set-Cookie', setCookie);
    return resp;
  } catch (err) {
    return NextResponse.json(
      {
        ok: false,
        error: 'Audit fetch failed',
        message: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
