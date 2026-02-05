import { supabaseAdmin } from '@/lib/supabaseAdmin';

const APPROVED_STATUS = 'APPROVED';

const CACHE_TTL_MS = 30_000;
const listCache = new Map();

function normalizePillar(value) {
  return String(value || 'EDITORIAL').trim().toUpperCase();
}

function normalizeStatus(value) {
  return String(value || APPROVED_STATUS).trim().toUpperCase();
}

function excerptFrom(text, max = 220) {
  const s = String(text || '').replace(/\s+/g, ' ').trim();
  if (!s) return '';
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

function pillarToType(pillar) {
  const p = normalizePillar(pillar);
  if (p === 'IMPACT') return 'impact';
  if (p === 'GUEST') return 'guest';
  if (p === 'DEV') return 'dev';
  return 'editorial';
}

function mapApprovedRowToPost(row) {
  const r = row && typeof row === 'object' ? row : {};

  const id = String(r.id || r._id || '').trim();
  const pillar = normalizePillar(r.pillar || r.type || r.category || 'EDITORIAL');
  const status = normalizeStatus(r.status || APPROVED_STATUS);

  const createdAt = String(r.created_at || r.submitted_at || r.received_at || '').trim();
  const approvedAt = String(r.approved_at || '').trim();

  const title = String(r.title || '').trim();

  const isAnonymous = Boolean(r.anonymous || r.publish_anonymously);
  const authorNameRaw = String(r.author_name || '').trim();
  const authorName = isAnonymous ? 'Anonymous' : authorNameRaw;

  const contentOriginal = String(r.content_original || r.article_content || r.incident_description || '').trim();
  const contentEnhanced = String(r.content_enhanced || r.enhanced_content || '').trim();

  const imageUrl = String(r.image_url || r.image || '').trim() || null;
  const tags = Array.isArray(r.tags) ? r.tags : [];

  return {
    _id: id,
    pillar,
    status,
    approved_at: approvedAt,
    created_at: createdAt,
    title,
    author_name: authorName,
    author_email: String(r.author_email || '').trim(),

    content_original: contentOriginal,
    content_enhanced: contentEnhanced,

    excerpt: excerptFrom(contentEnhanced || contentOriginal),
    image_url: imageUrl,
    image: imageUrl,

    sponsored_by: r.sponsored_by ?? null,
    affiliate_link: r.affiliate_link ?? null,
    location_tag: String(r.location_tag || r.visual_keywords || '').trim() || null,
    tags,
    views: typeof r.views === 'number' ? r.views : 0,

    // Helpful for callers that still expect a `type`.
    type: String(r.type || pillarToType(pillar)),
  };
}

function cacheKey({ pillar, status, limit }) {
  return `${normalizePillar(pillar)}:${normalizeStatus(status)}:${Number(limit) || 0}`;
}

export async function listApprovedCommunitySubmissions({ pillar = null, status = APPROVED_STATUS, limit = 100 } = {}) {
  const normalizedStatus = normalizeStatus(status);
  if (normalizedStatus !== APPROVED_STATUS) return [];

  const normalizedPillar = pillar ? normalizePillar(pillar) : null;
  const key = cacheKey({ pillar: normalizedPillar || 'ALL', status: normalizedStatus, limit });
  const cached = listCache.get(key);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) return cached.items;

  let sb;
  try {
    sb = supabaseAdmin();
  } catch {
    return [];
  }

  const safeLimit = Math.max(1, Math.min(250, Number(limit) || 100));

  const { data, error } = await sb
    .from('posts')
    .select('*')
    .eq('status', APPROVED_STATUS)
    .order('approved_at', { ascending: false, nullsFirst: false })
    .order('created_at', { ascending: false })
    .limit(safeLimit);

  if (error || !Array.isArray(data)) return [];

  const mapped = data.map(mapApprovedRowToPost).filter((p) => p && p._id && p.title && p.status === APPROVED_STATUS);
  const filtered = normalizedPillar ? mapped.filter((p) => normalizePillar(p.pillar) === normalizedPillar) : mapped;
  listCache.set(key, { at: Date.now(), items: filtered });
  return filtered;
}

export async function findApprovedCommunitySubmissionById(id) {
  const safeId = String(id || '').trim();
  if (!safeId) return null;

  let sb;
  try {
    sb = supabaseAdmin();
  } catch {
    return null;
  }

  const { data, error } = await sb.from('posts').select('*').eq('id', safeId).maybeSingle();
  if (error || !data) return null;
  const status = normalizeStatus(data?.status || '');
  if (status !== APPROVED_STATUS) return null;
  return mapApprovedRowToPost(data);
}
