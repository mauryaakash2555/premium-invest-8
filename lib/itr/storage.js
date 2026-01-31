import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { ensureDir, getItrStoreRoot, metaPathForFile } from './paths.js';

export function makeId(prefix) {
  return `${prefix}_${crypto.randomBytes(12).toString('hex')}`;
}

export function writeJsonAtomic(filePath, obj) {
  ensureDir(path.dirname(filePath));
  const tmp = `${filePath}.${crypto.randomBytes(6).toString('hex')}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(obj, null, 2), 'utf8');
  fs.renameSync(tmp, filePath);
}

export function readJsonIfExists(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function saveFileBytes(filePath, bytes) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, Buffer.from(bytes));
}

export function readFileBytes(filePath) {
  return fs.readFileSync(filePath);
}

export function saveFileMeta(fileId, meta) {
  const p = metaPathForFile(fileId);
  writeJsonAtomic(p, meta);
  return p;
}

export function getFileMeta(fileId) {
  return readJsonIfExists(metaPathForFile(fileId));
}

export function assertStoreRootExists() {
  ensureDir(getItrStoreRoot());
}
