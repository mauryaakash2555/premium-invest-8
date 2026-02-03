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

export async function POST(_req, { params }) {
  const id = (await params)?.id;
  try {
    const BACKEND_ORIGIN = getBackendOrigin();
    const upstream = await fetch(`${BACKEND_ORIGIN}/api/track-view/${encodeURIComponent(id)}`, {
      method: 'POST',
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    const contentType = upstream.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await upstream.json() : await upstream.text();
    return NextResponse.json(data, { status: upstream.ok ? 200 : upstream.status || 502, headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ success: false, detail: 'Upstream error' }, { status: 502 });
  }
}
