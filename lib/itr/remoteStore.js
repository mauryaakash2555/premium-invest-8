import { supabaseAdmin } from '@/lib/db/supabaseAdmin';

const DEFAULT_BUCKET = 'itr-documents';

function getBucket() {
  return process.env.ITR_STORAGE_BUCKET || DEFAULT_BUCKET;
}

function toBuffer(storageData) {
  // supabase-js storage download() returns a Blob in Node 18+
  if (!storageData) return null;
  if (Buffer.isBuffer(storageData)) return storageData;
  if (typeof storageData.arrayBuffer === 'function') {
    return storageData.arrayBuffer().then((ab) => Buffer.from(ab));
  }
  return null;
}

export function safeFilename(filename) {
  return String(filename || 'file').replace(/[^a-zA-Z0-9._-]+/g, '_');
}

export function metaKey({ sessionId, fileId }) {
  return `itr/meta/${sessionId}/${fileId}.json`;
}

export function extractionKey({ sessionId, fileId }) {
  return `itr/extractions/${sessionId}/${fileId}.json`;
}

export function rawExtractionKey({ sessionId, fileId }) {
  return `itr/extractions/${sessionId}/${fileId}.raw.json`;
}

export function auditKey({ sessionId }) {
  return `itr/audit/${sessionId}.jsonl`;
}

export function uploadKey({ sessionId, uploadId, fileId, filename }) {
  const safeName = safeFilename(filename);
  return `itr/uploads/${sessionId}/${uploadId}/${fileId}-${safeName}`;
}

export async function uploadBytes({ key, buffer, contentType }) {
  const supabase = supabaseAdmin();
  const bucket = getBucket();

  const { error } = await supabase.storage.from(bucket).upload(key, buffer, {
    contentType: contentType || 'application/octet-stream',
    upsert: false,
  });

  if (error) throw new Error(error.message || 'Supabase upload failed');
  return { bucket, key };
}

export async function uploadJson({ key, obj }) {
  const buffer = Buffer.from(JSON.stringify(obj, null, 2), 'utf8');
  return uploadBytes({ key, buffer, contentType: 'application/json' });
}

export async function downloadBytes({ key }) {
  const supabase = supabaseAdmin();
  const bucket = getBucket();

  const { data, error } = await supabase.storage.from(bucket).download(key);
  if (error) return { buffer: null, error };

  const buf = await toBuffer(data);
  return { buffer: buf, error: null };
}

export async function downloadJson({ key }) {
  const { buffer, error } = await downloadBytes({ key });
  if (error || !buffer) return { obj: null, error: error || new Error('Missing object') };

  try {
    return { obj: JSON.parse(buffer.toString('utf8')), error: null };
  } catch (e) {
    return { obj: null, error: e };
  }
}

export async function removeKeys(keys) {
  const supabase = supabaseAdmin();
  const bucket = getBucket();

  const clean = (keys || []).filter(Boolean);
  if (clean.length === 0) return;

  const { error } = await supabase.storage.from(bucket).remove(clean);
  if (error) throw new Error(error.message || 'Supabase delete failed');
}

export async function appendAuditEvents({ sessionId, events }) {
  const key = auditKey({ sessionId });
  const lines = (events || [])
    .filter(Boolean)
    .map((e) => JSON.stringify({ ...e, at: e?.at || new Date().toISOString() }))
    .join('\n');
  if (!lines) return;

  // Best-effort append: download -> append -> upload.
  // If concurrent writes happen, we may lose some audit lines; audit is non-critical.
  try {
    const existing = await downloadBytes({ key });
    const prev = existing?.buffer ? existing.buffer.toString('utf8') : '';
    const next = prev ? `${prev.replace(/\n+$/g, '')}\n${lines}\n` : `${lines}\n`;
    await uploadBytes({ key, buffer: Buffer.from(next, 'utf8'), contentType: 'text/plain' });
  } catch {
    // ignore
  }
}
