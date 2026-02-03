import { NextResponse } from 'next/server';

function normalizeBackendOrigin(raw) {
  const s = String(raw || '').trim();
  if (!s) return '';
  const noTrailing = s.replace(/\/+$/, '');
  return noTrailing.endsWith('/api') ? noTrailing.slice(0, -4) : noTrailing;
}

function getBackendOrigin() {
  const candidates = [process.env.BACKEND_URL, process.env.NEXT_BACKEND_URL, process.env.NEXT_PUBLIC_BACKEND_URL];
  for (const c of candidates) {
    const origin = normalizeBackendOrigin(c);
    if (origin) return origin;
  }
  return 'https://bmwealth-backend.onrender.com';
}

export async function POST(req) {
  let payload;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ success: false, detail: 'Invalid JSON' }, { status: 400 });
  }

  try {
    const BACKEND_ORIGIN = getBackendOrigin();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    const upstream = await fetch(`${BACKEND_ORIGIN}/api/submit-post`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload ?? {}),
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    const contentType = upstream.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await upstream.json() : await upstream.text();

    if (!upstream.ok) {
      const detail = typeof data === 'object' && data && 'detail' in data ? data.detail : typeof data === 'string' && data ? data : 'Submit failed';
      return NextResponse.json({ success: false, detail }, { status: upstream.status || 502 });
    }

    return NextResponse.json(typeof data === 'object' && data ? { ...data, success: true } : { success: true }, {
      status: 200,
      headers: { 'Cache-Control': 'no-store' },
    });
  } catch (e) {
    const aborted = e && typeof e === 'object' && 'name' in e && e.name === 'AbortError';
    return NextResponse.json({ success: false, detail: aborted ? 'Upstream timeout' : 'Upstream error' }, { status: aborted ? 504 : 502 });
  }
}
