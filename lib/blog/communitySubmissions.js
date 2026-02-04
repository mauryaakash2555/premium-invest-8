import { supabaseAdmin } from '@/lib/supabaseAdmin';

const APPROVED_STATUS = 'APPROVED';
const COMMUNITY_EVENT_TYPES = ['submission_impact', 'submission_guest'];

const CACHE_TTL_MS = 30_000;
const listCache = new Map();

function normalizePillar(value) {
  return String(value || 'EDITORIAL').trim().toUpperCase();
}

function normalizeStatus(value) {
  return String(value || APPROVED_STATUS).trim().toUpperCase();
}

function eventTypeToPillar(eventType) {
  const t = String(eventType || '').trim().toLowerCase();
  if (t === 'submission_impact') return 'IMPACT';
  if (t === 'submission_guest') return 'GUEST';
  return 'EDITORIAL';
}

function excerptFrom(text, max = 220) {
  const s = String(text || '').replace(/\s+/g, ' ').trim();
  if (!s) return '';
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

function buildOriginalContent(data, eventType) {
  const t = String(eventType || '').trim().toLowerCase();
  if (t === 'submission_guest') return String(data?.article_content || '');

  // Impact: show narrative + impact result together.
  const what = String(data?.what_happened || data?.incident_description || '');
  const impact = String(data?.impact_result || '');
  if (what && impact) return `${what}\n\nImpact / Result:\n${impact}`;
  return what || impact;
}

function mapApprovedEventToPost(event) {
  const data = (event && typeof event === 'object' ? event.data : null) || {};
  const eventType = String(event?.event_type || '').trim();

  const contentOriginal = buildOriginalContent(data, eventType);
  const contentEnhanced = String(data?.content_enhanced || '').trim();
  const title = String(data?.title || '').trim();

  const locationTag = String(data?.location_tag || data?.visual_keywords || '').trim() || null;
  const createdAt = String(data?.received_at || event?.created_at || '').trim();

  const isAnonymous = Boolean(data?.anonymous || data?.publish_anonymously);
  const authorName = isAnonymous ? 'Anonymous' : String(data?.author_name || '').trim();

  return {
    _id: String(event?.id || ''),
    pillar: eventTypeToPillar(eventType),
    status: normalizeStatus(data?.status || APPROVED_STATUS),
    approved_at: String(data?.approved_at || '').trim(),
    created_at: createdAt,
    title,
    author_name: authorName,
    author_email: String(data?.author_email || '').trim(),

    // Detail page expects these keys.
    content_original: contentOriginal,
    content_enhanced: contentEnhanced,

    // Cards / metadata
    excerpt: excerptFrom(contentEnhanced || contentOriginal),
    image_url: String(data?.image_url || '').trim() || null,
    image: String(data?.image_url || '').trim() || null,

    sponsored_by: data?.sponsored_by ?? null,
    affiliate_link: data?.affiliate_link ?? null,
    location_tag: locationTag,
    tags: Array.isArray(data?.tags) ? data.tags : [],
    views: typeof data?.views === 'number' ? data.views : 0,
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
    .from('events')
    .select('id,event_type,data,created_at')
    .in('event_type', COMMUNITY_EVENT_TYPES)
    .contains('data', { status: APPROVED_STATUS })
    .order('created_at', { ascending: false })
    .limit(safeLimit);

  if (error || !Array.isArray(data)) return [];

  const mapped = data
    .map(mapApprovedEventToPost)
    .filter((p) => p && p._id && p.title && p.status === APPROVED_STATUS);

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

  const { data, error } = await sb
    .from('events')
    .select('id,event_type,data,created_at')
    .eq('id', safeId)
    .maybeSingle();

  if (error || !data) return null;
  if (!COMMUNITY_EVENT_TYPES.includes(String(data.event_type || ''))) return null;
  const status = normalizeStatus(data?.data?.status || '');
  if (status !== APPROVED_STATUS) return null;
  return mapApprovedEventToPost(data);
}
