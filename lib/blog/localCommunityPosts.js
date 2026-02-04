import { readFile } from 'fs/promises';
import { join } from 'path';

// Default fallback images per pillar type
const PILLAR_FALLBACK_IMAGES = {
  IMPACT: 'https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=800&h=500&fit=crop&auto=format&fm=webp&q=75',
  GUEST: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800&h=500&fit=crop&auto=format&fm=webp&q=75',
  DEV: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=500&fit=crop&auto=format&fm=webp&q=75',
  EDITORIAL: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&h=500&fit=crop&auto=format&fm=webp&q=75'
};

let cachedFull = null;
let cachedLite = null;

async function readTextIfExists(baseDir, filename) {
  const f = String(filename || '').trim();
  if (!f) return '';
  const full = join(baseDir, f);
  return await readFile(full, 'utf8');
}

export async function getLocalCommunityPosts(options = {}) {
  const { includeContent = true } = options || {};
  if (includeContent && cachedFull) return cachedFull;
  if (!includeContent && cachedLite) return cachedLite;

  const baseDir = join(process.cwd(), 'data', 'community_posts');
  const metaPath = join(baseDir, 'posts.json');

  const rawMeta = await readFile(metaPath, 'utf8');
  const meta = JSON.parse(rawMeta);

  const list = Array.isArray(meta) ? meta : [];

  const posts = await Promise.all(
    list.map(async (m) => {
      const content_original = includeContent ? await readTextIfExists(baseDir, m.content_original_file) : '';
      const content_enhanced = includeContent ? await readTextIfExists(baseDir, m.content_enhanced_file) : '';

      // Get image URL - use provided, or fallback based on pillar
      const pillar = String(m.pillar || 'EDITORIAL').toUpperCase();
      const image_url = m.image_url || PILLAR_FALLBACK_IMAGES[pillar] || PILLAR_FALLBACK_IMAGES.EDITORIAL;

      return {
        _id: String(m._id || ''),
        pillar: pillar,
        status: String(m.status || ''),
        approved_at: String(m.approved_at || ''),
        created_at: String(m.created_at || m.approved_at || ''),
        author_name: String(m.author_name || ''),
        title: String(m.title || ''),
        content_original,
        content_enhanced,
        sponsored_by: m.sponsored_by ?? null,
        affiliate_link: m.affiliate_link ?? null,
        location_tag: m.location_tag ?? null,
        views: typeof m.views === 'number' ? m.views : 0,
        // Image fields
        image_url: image_url,
        image: image_url, // alias for compatibility
        image_keywords: Array.isArray(m.image_keywords) ? m.image_keywords : [],
        image_source: m.image_source || 'fallback',
        image_updated_at: m.image_updated_at || null,
      };
    })
  );

  const filtered = posts.filter((p) => p && p._id && p.pillar);
  if (includeContent) cachedFull = filtered;
  else cachedLite = filtered;
  return filtered;
}

export async function findLocalCommunityPostById(id) {
  const safe = String(id || '').trim();
  if (!safe) return null;
  const posts = await getLocalCommunityPosts({ includeContent: true });
  return posts.find((p) => String(p._id) === safe) || null;
}

// Clear cache (useful for admin updates)
export function clearLocalCommunityPostsCache() {
  cachedFull = null;
  cachedLite = null;
}
