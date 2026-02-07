import { supabaseAdmin } from '@/lib/supabaseAdmin';

const OVERRIDES_TABLE = 'community_post_image_overrides';

function getClientSafe() {
  try {
    return supabaseAdmin();
  } catch {
    return null;
  }
}

function isMissingTableError(error) {
  const msg = String(error?.message || '').toLowerCase();
  return msg.includes('does not exist') || msg.includes('relation') || msg.includes('schema cache');
}

export async function fetchCommunityImageOverridesByIds(postIds) {
  const ids = Array.isArray(postIds) ? postIds.map((x) => String(x || '').trim()).filter(Boolean) : [];
  if (!ids.length) return { success: true, overrides: new Map() };

  const sb = getClientSafe();
  if (!sb) return { success: false, error: 'Supabase not configured', overrides: new Map() };

  const { data, error } = await sb
    .from(OVERRIDES_TABLE)
    .select('post_id,image_url,image_keywords,image_source,updated_at')
    .in('post_id', ids);

  if (error) {
    const hint = isMissingTableError(error) ? `Missing table: ${OVERRIDES_TABLE}` : null;
    return { success: false, error: error.message, hint, overrides: new Map() };
  }

  const map = new Map();
  for (const row of Array.isArray(data) ? data : []) {
    const id = String(row?.post_id || '').trim();
    if (!id) continue;
    map.set(id, row);
  }
  return { success: true, overrides: map };
}

export async function upsertCommunityImageOverride({ postId, imageUrl, keywords, source }) {
  const post_id = String(postId || '').trim();
  const image_url = String(imageUrl || '').trim();
  if (!post_id || !image_url) return { success: false, error: 'postId and imageUrl required' };

  const sb = getClientSafe();
  if (!sb) return { success: false, error: 'Supabase not configured' };

  const payload = {
    post_id,
    image_url,
    image_keywords: Array.isArray(keywords) ? keywords.filter(Boolean).slice(0, 12) : [],
    image_source: String(source || 'manual'),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await sb
    .from(OVERRIDES_TABLE)
    .upsert(payload, { onConflict: 'post_id' })
    .select('*')
    .limit(1);

  if (error) {
    const hint = isMissingTableError(error) ? `Missing table: ${OVERRIDES_TABLE}` : null;
    return { success: false, error: error.message, hint };
  }

  return { success: true, row: Array.isArray(data) ? data[0] : null };
}
