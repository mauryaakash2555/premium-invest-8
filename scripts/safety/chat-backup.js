/**
 * FILE: scripts/safety/chat-backup.js
 * PURPOSE: Backup helpful chat files (docs + prompts) into a timestamped folder.
 * CATEGORY: script
 *
 * SIMPLE EXPLANATION:
 * This script copies important files into a backup folder so we can restore them.
 */

import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const ts = new Date().toISOString().replace(/[:.]/g, '-');
const outDir = path.join(ROOT, 'scripts', 'safety', 'backups', ts);

const FILES = [
  'app/api/chat/route.js',
  'docs/ARCHITECTURE.md',
  'docs/API.md',
  'docs/COMPONENTS.md',
  'docs/DATABASE.md',
  'docs/ENV.md',
];

fs.mkdirSync(outDir, { recursive: true });

for (const rel of FILES) {
  const src = path.join(ROOT, rel);
  if (!fs.existsSync(src)) continue;
  const dst = path.join(outDir, rel.replace(/\//g, '__'));
  fs.copyFileSync(src, dst);
}

console.log('Backup created at:', outDir);
