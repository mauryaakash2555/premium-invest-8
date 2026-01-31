import path from 'node:path';
import fs from 'node:fs';

export function getItrStoreRoot() {
  const root = process.env.OCR_TEMP_DIR || path.join(process.cwd(), '.itr_store');
  return root;
}

export function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

export function filePathForUpload({ sessionId, uploadId, filename }) {
  const safeName = String(filename || 'file').replace(/[^a-zA-Z0-9._-]+/g, '_');
  return path.join(getItrStoreRoot(), 'uploads', sessionId, uploadId, safeName);
}

export function metaPathForFile(fileId) {
  return path.join(getItrStoreRoot(), 'meta', `${fileId}.json`);
}

export function extractionPathForFile(fileId) {
  return path.join(getItrStoreRoot(), 'extractions', `${fileId}.json`);
}

export function rawPathForFile(fileId) {
  return path.join(getItrStoreRoot(), 'extractions', `${fileId}.raw.json`);
}

export function ocrPathForFile(fileId) {
  return path.join(getItrStoreRoot(), 'extractions', `${fileId}.ocr.json`);
}

export function validationReportPath({ sessionId, jobId }) {
  return path.join(getItrStoreRoot(), 'validation', sessionId, `${jobId}.report.json`);
}

export function auditLogPath({ sessionId }) {
  return path.join(getItrStoreRoot(), 'audit', sessionId, 'audit.jsonl');
}
