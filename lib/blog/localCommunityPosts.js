import { readFile } from 'fs/promises';
import { join } from 'path';

let cached = null;

async function readTextIfExists(baseDir, filename) {
  const f = String(filename || '').trim();
  if (!f) return '';
  const full = join(baseDir, f);
  return await readFile(full, 'utf8');
}

export async function getLocalCommunityPosts() {
  if (cached) return cached;

  const baseDir = join(process.cwd(), 'data', 'community_posts');
  const metaPath = join(baseDir, 'posts.json');

  const rawMeta = await readFile(metaPath, 'utf8');
  const meta = JSON.parse(rawMeta);

  const list = Array.isArray(meta) ? meta : [];

  const posts = await Promise.all(
    list.map(async (m) => {
      const content_original = await readTextIfExists(baseDir, m.content_original_file);
      const content_enhanced = await readTextIfExists(baseDir, m.content_enhanced_file);

      return {
        _id: String(m._id || ''),
        pillar: String(m.pillar || ''),
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
      };
    })
  );

  cached = posts.filter((p) => p && p._id && p.pillar);
  return cached;
}

export async function findLocalCommunityPostById(id) {
  const safe = String(id || '').trim();
  if (!safe) return null;
  const posts = await getLocalCommunityPosts();
  return posts.find((p) => String(p._id) === safe) || null;
}
