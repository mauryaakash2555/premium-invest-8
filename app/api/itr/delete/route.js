export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import fs from 'node:fs';

import { ensureSessionId } from '@/lib/itr/session';
import { getFileMeta } from '@/lib/itr/storage';
import {
  metaPathForFile,
  extractionPathForFile,
  rawPathForFile,
  ocrPathForFile,
  getItrStoreRoot,
} from '@/lib/itr/paths';

function safeUnlink(p) {
  try {
    if (p && fs.existsSync(p)) fs.unlinkSync(p);
  } catch {
    // ignore
  }
}

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

    const meta = getFileMeta(fileId);
    if (!meta || meta.sessionId !== sessionId) {
      const resp = NextResponse.json({ error: 'Not found' }, { status: 404 });
      if (setCookie) resp.headers.set('Set-Cookie', setCookie);
      return resp;
    }

    // Delete on-disk artifacts
    safeUnlink(meta.diskPath);
    safeUnlink(metaPathForFile(fileId));
    safeUnlink(extractionPathForFile(fileId));
    safeUnlink(rawPathForFile(fileId));
    safeUnlink(ocrPathForFile(fileId));

    // Best-effort: clean empty dirs is optional; keep store root stable.
    const resp = NextResponse.json({ ok: true, storeRoot: getItrStoreRoot() }, { status: 200 });
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
