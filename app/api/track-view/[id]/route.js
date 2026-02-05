import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { getAdminEnvSafe } from '@/config/env';

function getClientIp(req) {
  const forwardedFor = req.headers.get('x-forwarded-for') || '';
  const ip = forwardedFor.split(',')[0]?.trim();
  return ip || '';
}

function sha256Hex(s) {
  return crypto.createHash('sha256').update(String(s || '')).digest('hex');
}

export async function POST(req, { params }) {
  const id = (await params)?.id;
  const trackId = String(id || '').trim();
  if (!trackId) return NextResponse.json({ success: false, detail: 'Missing id' }, { status: 400, headers: { 'Cache-Control': 'no-store' } });

  let body;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  let sb;
  try {
    sb = supabaseAdmin();
  } catch {
    // If Supabase isn't configured, never break page rendering.
    return NextResponse.json({ success: true, counted: false }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  }

  const ip = getClientIp(req);
  const ua = String(body?.userAgent || req.headers.get('user-agent') || '');
  const salt = getAdminEnvSafe()?.ANALYTICS_SALT || '';
  const visitorHash = sha256Hex(`${salt}|${ip}|${ua}`);

  let canonicalPostId = trackId;
  let canonicalSlug = null;
  try {
    const { data: rows } = await sb
      .from('posts')
      .select('id,slug')
      .or(`id.eq.${trackId},slug.eq.${trackId}`)
      .limit(1);
    const row = Array.isArray(rows) ? rows[0] : null;
    if (row?.id) canonicalPostId = String(row.id);
    if (row?.slug) canonicalSlug = String(row.slug);
  } catch {
    // ignore
  }

  let counted = false;
  try {
    const { error } = await sb
      .from('post_views')
      .insert({
        post_id: canonicalPostId,
        visitor_hash: visitorHash,
        slug: String(body?.slug || '').trim() || canonicalSlug || null,
      })
      .select('post_id')
      .maybeSingle();

    if (!error) counted = true;
    // Unique violation (already counted) should not error the caller.
    if (error && String(error.code || '') === '23505') counted = false;
  } catch {
    // ignore
  }

  if (counted) {
    try {
      const { data: rows } = await sb.from('posts').select('id,views').eq('id', canonicalPostId).limit(1);
      const row = Array.isArray(rows) ? rows[0] : null;
      if (row?.id) {
        const nextViews = (typeof row.views === 'number' ? row.views : 0) + 1;
        await sb.from('posts').update({ views: nextViews }).eq('id', row.id);
      }
    } catch {
      // ignore
    }
  }

  return NextResponse.json({ success: true, counted }, { status: 200, headers: { 'Cache-Control': 'no-store' } });
}
