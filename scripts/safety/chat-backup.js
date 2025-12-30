const fs = require('fs');
const path = require('path');
const os = require('os');

const ROOT = process.cwd();
// Store backups OUTSIDE the repo so git checkout/stash can't delete them
const BACKUP_DIR = path.join(os.homedir(), '.bmwealth-safety-backups', 'chat');
const KEEP = 3;

const TARGETS = [
  'components/AIChatFloat.jsx',
  'components/AIChatFloat.module.css',
  'components/WhatsAppFloat.jsx',
  'components/ChatErrorBoundary.jsx',
  'app/api/events/route.js',
  'app/api/admin/summary/route.js',
  'app/api/health/route.js',
];

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function nowStamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return (
    d.getFullYear() +
    pad(d.getMonth() + 1) +
    pad(d.getDate()) +
    '-' +
    pad(d.getHours()) +
    pad(d.getMinutes()) +
    pad(d.getSeconds())
  );
}

function copyFile(src, dest) {
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

function listBackups() {
  if (!fs.existsSync(BACKUP_DIR)) return [];
  return fs
    .readdirSync(BACKUP_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
}

function prune() {
  const dirs = listBackups();
  const extra = dirs.length - KEEP;
  if (extra <= 0) return;
  for (const name of dirs.slice(0, extra)) {
    fs.rmSync(path.join(BACKUP_DIR, name), { recursive: true, force: true });
  }
}

function backup() {
  const stamp = nowStamp();
  const outDir = path.join(BACKUP_DIR, stamp);
  ensureDir(outDir);

  const meta = {
    created_at: new Date().toISOString(),
    stamp,
    targets: TARGETS,
  };

  for (const rel of TARGETS) {
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) continue;
    copyFile(abs, path.join(outDir, rel));
  }

  fs.writeFileSync(path.join(outDir, 'meta.json'), JSON.stringify(meta, null, 2));
  prune();
  console.log('OK backup created:', outDir);
}

function restoreLatest() {
  const dirs = listBackups();
  if (!dirs.length) {
    console.error('No backups found at', BACKUP_DIR);
    process.exit(1);
  }
  const latest = dirs[dirs.length - 1];
  const fromDir = path.join(BACKUP_DIR, latest);

  for (const rel of TARGETS) {
    const src = path.join(fromDir, rel);
    if (!fs.existsSync(src)) continue;
    copyFile(src, path.join(ROOT, rel));
  }

  console.log('OK restored from:', fromDir);
}

const cmd = process.argv[2];
if (cmd === 'backup') backup();
else if (cmd === 'restore-latest') restoreLatest();
else {
  console.log('Usage: node scripts/safety/chat-backup.js backup|restore-latest');
  process.exit(1);
}


