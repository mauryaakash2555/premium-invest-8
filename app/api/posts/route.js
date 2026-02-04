import { NextResponse } from 'next/server';
import { getLocalCommunityPosts } from '@/lib/blog/localCommunityPosts';
import { listApprovedCommunitySubmissions } from '@/lib/blog/communitySubmissions';

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

function typeToPillar(type) {
  const t = String(type || '').toLowerCase();
  if (t === 'impact') return 'IMPACT';
  if (t === 'guest') return 'GUEST';
  if (t === 'dev') return 'DEV';
  if (t === 'editorial') return 'EDITORIAL';
  return null;
}

function normalizePillar(value) {
  return String(value || 'EDITORIAL').trim().toUpperCase();
}

function normalizeStatus(value) {
  return String(value || 'APPROVED').trim().toUpperCase();
}

function mergeUniqueById(primary, secondary) {
  const a = Array.isArray(primary) ? primary : [];
  const b = Array.isArray(secondary) ? secondary : [];
  const seen = new Set(a.map((p) => String(p?._id || '')).filter(Boolean));
  const out = [...a];
  for (const p of b) {
    const id = String(p?._id || '');
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(p);
  }
  return out;
}

export async function GET(req) {
  const type = req.nextUrl.searchParams.get('type');
  const pillar = req.nextUrl.searchParams.get('pillar');
  const status = req.nextUrl.searchParams.get('status') || 'APPROVED';

  const hostname = String(req?.nextUrl?.hostname || '').toLowerCase();
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

  const resolvedPillar = normalizePillar(pillar || (type ? typeToPillar(type) : null) || 'EDITORIAL');
  const resolvedStatus = normalizeStatus(status);

  const localAll = await getLocalCommunityPosts({ includeContent: false }).catch(() => []);
  const local = (Array.isArray(localAll) ? localAll : []).filter(
    (p) => normalizePillar(p?.pillar) === resolvedPillar && normalizeStatus(p?.status) === resolvedStatus
  );

  const submissions = await listApprovedCommunitySubmissions({ pillar: resolvedPillar, status: resolvedStatus, limit: 120 }).catch(() => []);
  const localPlus = submissions.length ? mergeUniqueById(local, submissions) : local;

  // Local dev: never wait on upstream (keeps filters instant).
  if (isLocalhost) return NextResponse.json(localPlus, { status: 200, headers: { 'Cache-Control': 'no-store' } });

  try {
    const BACKEND_ORIGIN = getBackendOrigin();
    const controller = new AbortController();
    const timeoutMs = local.length ? 1800 : 8000;
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    const upstream = await fetch(
      `${BACKEND_ORIGIN}/api/posts?pillar=${encodeURIComponent(resolvedPillar)}&status=${encodeURIComponent(status)}`,
      {
        method: 'GET',
        headers: { Accept: 'application/json' },
        cache: 'no-store',
        signal: controller.signal,
      }
    ).finally(() => clearTimeout(timeout));

    const contentType = upstream.headers.get('content-type') || '';
    const data = contentType.includes('application/json') ? await upstream.json() : await upstream.text();

    if (!upstream.ok) {
      const detail = typeof data === 'object' && data && 'detail' in data ? data.detail : typeof data === 'string' && data ? data : 'Posts request failed';
      if (localPlus.length) return NextResponse.json(localPlus, { status: 200, headers: { 'Cache-Control': 'no-store' } });
      return NextResponse.json({ success: false, detail }, { status: upstream.status || 502 });
    }

    if (Array.isArray(data) && localPlus.length) {
      return NextResponse.json(mergeUniqueById(data, localPlus), { status: 200, headers: { 'Cache-Control': 'no-store' } });
    }

    if (Array.isArray(data)) return NextResponse.json(data, { status: 200, headers: { 'Cache-Control': 'no-store' } });
    if (localPlus.length) return NextResponse.json(localPlus, { status: 200, headers: { 'Cache-Control': 'no-store' } });
    return NextResponse.json([], { status: 200, headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    const aborted = e && typeof e === 'object' && 'name' in e && e.name === 'AbortError';
    if (localPlus.length) return NextResponse.json(localPlus, { status: 200, headers: { 'Cache-Control': 'no-store' } });
    return NextResponse.json({ success: false, detail: aborted ? 'Upstream timeout' : 'Upstream error' }, { status: aborted ? 504 : 502 });
  }
}
