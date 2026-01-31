export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import fs from 'node:fs';

import { ensureSessionId } from '@/lib/itr/session';
import { auditLogPath } from '@/lib/itr/paths';

export async function GET(request) {
  try {
    const { sessionId, setCookie } = ensureSessionId(request);
    const p = auditLogPath({ sessionId });
    if (!fs.existsSync(p)) {
      const resp = NextResponse.json({ ok: true, events: [] }, { status: 200 });
      if (setCookie) resp.headers.set('Set-Cookie', setCookie);
      return resp;
    }

    const raw = fs.readFileSync(p, 'utf8');
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
