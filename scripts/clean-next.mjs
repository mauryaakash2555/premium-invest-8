import fs from 'fs';
import path from 'path';

const root = process.cwd();

const targets = [
  '.next',
  path.join('node_modules', '.cache'),
  '.turbo',
];

function rm(target) {
  const full = path.join(root, target);
  if (!fs.existsSync(full)) return { target, removed: false };
  fs.rmSync(full, { recursive: true, force: true, maxRetries: 3 });
  return { target, removed: true };
}

const results = targets.map(rm);
for (const r of results) {
  process.stdout.write(`${r.removed ? 'removed' : 'skip'} ${r.target}\n`);
}
