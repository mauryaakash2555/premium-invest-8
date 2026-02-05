import { NextResponse } from 'next/server';
import { findLocalCommunityPostById } from '@/lib/blog/localCommunityPosts';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export async function GET(_req, { params }) {
  const id = (await params)?.id;
  const safeId = String(id || '').trim();
  if (!safeId) return NextResponse.json({ success: false, detail: 'Missing id' }, { status: 400 });

  const local = await findLocalCommunityPostById(safeId).catch(() => null);
  if (local) {
    return NextResponse.json(local, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  }

  let sb;
  try {
    sb = supabaseAdmin();
  } catch {
    return NextResponse.json({ success: false, detail: 'Not configured' }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }

  const { data: rows, error } = await sb
    .from('posts')
    .select('*')
    .or(`id.eq.${safeId},slug.eq.${safeId}`)
    .limit(1);

  const data = Array.isArray(rows) ? rows[0] : null;
  if (error || !data) {
    return NextResponse.json({ success: false, detail: 'Not found' }, { status: 404, headers: { 'Cache-Control': 'no-store' } });
  }

  const status = String(data.status || '').trim().toUpperCase();
  if (status !== 'APPROVED') {
    return NextResponse.json({ success: false, detail: 'Not found' }, { status: 404, headers: { 'Cache-Control': 'no-store' } });
  }

  return NextResponse.json(data, { status: 200, headers: { 'Cache-Control': 'no-store' } });
}
