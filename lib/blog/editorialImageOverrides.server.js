import path from 'path';
import fs from 'fs/promises';

import { supabaseAdmin } from '@/lib/db/supabaseAdmin';

const STORAGE_BUCKET_FALLBACK = process.env.ITR_STORAGE_BUCKET || 'itr-documents';
const BLOG_IMAGES_STORAGE_BUCKET = process.env.BLOG_IMAGES_STORAGE_BUCKET || STORAGE_BUCKET_FALLBACK;

const REMOTE_EDITORIAL_OVERRIDES_KEY = 'admin/blog-images/editorial-overrides.json';
const LOCAL_EDITORIAL_OVERRIDES_PATH = path.join(process.cwd(), 'data', 'editorial-image-overrides.json');

async function safeParseJson(text) {
  try {
    const obj = JSON.parse(text);
    return obj && typeof obj === 'object' ? obj : {};
  } catch {
    return {};
  }
}

async function readLocalOverrides() {
  try {
    const txt = await fs.readFile(LOCAL_EDITORIAL_OVERRIDES_PATH, 'utf8');
    return safeParseJson(txt);
  } catch {
    return {};
  }
}

async function readSupabaseOverrides() {
  try {
    const sb = supabaseAdmin();
    const { data, error } = await sb.storage.from(BLOG_IMAGES_STORAGE_BUCKET).download(REMOTE_EDITORIAL_OVERRIDES_KEY);
    if (error || !data) return null;

    if (typeof data.text === 'function') {
      return safeParseJson(await data.text());
    }

    if (typeof data.arrayBuffer === 'function') {
      const ab = await data.arrayBuffer();
      return safeParseJson(Buffer.from(ab).toString('utf8'));
    }

    return null;
  } catch {
    return null;
  }
}

export async function getEditorialImageOverrides() {
  const remote = await readSupabaseOverrides();
  if (remote && typeof remote === 'object') return remote;
  return readLocalOverrides();
}
