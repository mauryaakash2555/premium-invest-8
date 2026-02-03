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

export async function GET(req) {
  // Optional protection: if ADMIN_TOKEN is configured, require x-admin-token header.
  const required = String(process.env.ADMIN_TOKEN || '').trim();
  if (required) {
    const got = String(req.headers.get('x-admin-token') || '').trim();
    if (!got || got !== required) {
      return NextResponse.json({ success: false, detail: 'Unauthorized' }, { status: 401 });
    }
  }

  const got = String(req.headers.get('x-admin-token') || '').trim();

  try {
    const BACKEND_ORIGIN = getBackendOrigin();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const upstream = await fetch(`${BACKEND_ORIGIN}/api/admin/stats`, {
      method: 'GET',
      headers: { Accept: 'application/json', ...(got ? { 'x-admin-token': got } : {}) },
      cache: 'no-store',
      signal: controller.signal,
    }).finally(() => clearTimeout(timeout));

    const contentType = upstream.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await upstream.json() : await upstream.text();
    if (!upstream.ok) {
      const detail = typeof data === 'object' && data && 'detail' in data ? data.detail : typeof data === 'string' && data ? data : 'Stats failed';
      return NextResponse.json({ success: false, detail }, { status: upstream.status || 502 });
    }
    return NextResponse.json(data, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    const aborted = e && typeof e === 'object' && 'name' in e && e.name === 'AbortError';
    return NextResponse.json({ success: false, detail: aborted ? 'Upstream timeout' : 'Upstream error' }, { status: aborted ? 504 : 502 });
  }
}
