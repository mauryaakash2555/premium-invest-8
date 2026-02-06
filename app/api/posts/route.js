import { NextResponse } from 'next/server';
import { getLocalCommunityPosts } from '@/lib/blog/localCommunityPosts';
import { generateImageForPost } from '@/lib/blog/communityImageService';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

const COMMUNITY_IMAGE_CACHE_KEY = '__bm_community_image_cache_v1';
const COMMUNITY_IMAGE_CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24h

function getCommunityImageCache() {
  const g = globalThis;
  if (!g[COMMUNITY_IMAGE_CACHE_KEY]) g[COMMUNITY_IMAGE_CACHE_KEY] = new Map();
  return g[COMMUNITY_IMAGE_CACHE_KEY];
}

function hasRealUnsplashKey() {
  const k = String(process.env.UNSPLASH_ACCESS_KEY || '').trim();
  return Boolean(k) && k.toLowerCase() !== 'demo';
}

async function maybeAutoResolveCommunityImage(post) {
  const p = post && typeof post === 'object' ? post : null;
  if (!p?._id) return p;

  // Only auto-resolve for local/community posts to avoid heavy work.
  const isCommunity = Boolean(p.image_source) || String(p._id).startsWith('local-');
  if (!isCommunity) return p;
  if (!hasRealUnsplashKey()) return p;

  // Respect explicitly manual images.
  const src = String(p.image_source || '').toLowerCase();
  const isManual = src === 'manual' || src === 'editorial' || src === 'uploaded';
  if (isManual) return p;

  const shouldRefresh = !p.image_url || src === 'fallback' || src === 'curated' || src === 'rotated';
  if (!shouldRefresh) return p;

  const keywords = Array.isArray(p.image_keywords) ? p.image_keywords.filter(Boolean).slice(0, 6) : [];
  const key = `${p._id}|${keywords.join(',')}`;
  const cache = getCommunityImageCache();
  const cached = cache.get(key);
  if (cached && Date.now() - cached.ts < COMMUNITY_IMAGE_CACHE_TTL_MS) {
    return { ...p, image_url: cached.url, image: cached.url, image_source: cached.source || p.image_source };
  }

  try {
    const result = await generateImageForPost(
      { ...p, image_url: null },
      { forceRefresh: true, useFallback: true }
    );

    const url = String(result?.url || '').trim();
    if (url) {
      cache.set(key, { url, source: result.source || 'unsplash', ts: Date.now() });
      return {
        ...p,
        image_url: url,
        image: url,
        image_keywords: keywords.length ? keywords : result.keywords || p.image_keywords,
        image_source: result.source || p.image_source,
      };
    }
  } catch {
    // Ignore and fall back to existing image.
  }

  return p;
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

function excerptFrom(text, max = 220) {
  const s = String(text || '').replace(/\s+/g, ' ').trim();
  if (!s) return '';
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

function mapRowToPost(row) {
  const r = row && typeof row === 'object' ? row : {};
  const id = String(r.id || r._id || '').trim();
  const contentOriginal = String(r.content_original || r.article_content || r.incident_description || '').trim();
  const contentEnhanced = String(r.content_enhanced || r.enhanced_content || '').trim();
  const imageUrl = String(r.image_url || r.image || '').trim() || null;
  return {
    _id: id,
    pillar: normalizePillar(r.pillar || r.type || r.category || 'EDITORIAL'),
    status: normalizeStatus(r.status || 'APPROVED'),
    approved_at: String(r.approved_at || '').trim(),
    created_at: String(r.created_at || r.submitted_at || r.received_at || '').trim(),
    title: String(r.title || '').trim(),
    author_name: String(r.author_name || '').trim(),
    author_email: String(r.author_email || '').trim(),
    content_original: contentOriginal,
    content_enhanced: contentEnhanced,
    excerpt: String(r.excerpt || '').trim() || excerptFrom(contentEnhanced || contentOriginal),
    image_url: imageUrl,
    image: imageUrl,
    sponsored_by: r.sponsored_by ?? null,
    affiliate_link: r.affiliate_link ?? null,
    location_tag: String(r.location_tag || r.visual_keywords || '').trim() || null,
    tags: Array.isArray(r.tags) ? r.tags : [],
    views: typeof r.views === 'number' ? r.views : 0,
    type: String(r.type || '').trim() || null,
  };
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

  const localWithImages = await Promise.all(local.map(maybeAutoResolveCommunityImage));

  // Local dev: keep list instant even if Supabase isn't configured.
  if (isLocalhost) return NextResponse.json(localWithImages, { status: 200, headers: { 'Cache-Control': 'no-store' } });

  let sb;
  try {
    sb = supabaseAdmin();
  } catch {
    return NextResponse.json(localWithImages, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  }

  const safeLimit = 200;
  const { data, error } = await sb
    .from('posts')
    .select('*')
    .eq('pillar', resolvedPillar)
    .eq('status', resolvedStatus)
    .order('approved_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(safeLimit);

  if (error || !Array.isArray(data)) {
    return NextResponse.json(localWithImages, { status: 200, headers: { 'Cache-Control': 'no-store' } });
  }

  const remote = data.map(mapRowToPost).filter((p) => p && p._id && p.title);
  const merged = localWithImages.length ? mergeUniqueById(remote, localWithImages) : remote;
  return NextResponse.json(merged, { status: 200, headers: { 'Cache-Control': 'no-store' } });
}
