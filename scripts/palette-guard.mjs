import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

const SCAN_EXTS = new Set([
  '.js',
  '.jsx',
  '.ts',
  '.tsx',
  '.css',
  '.mjs',
  '.cjs',
  '.html',
]);

const IGNORE_DIRS = new Set([
  'node_modules',
  '.next',
  '.git',
  '.vercel',
  '.swc',
  '.turbo',
  '.worktrees',
  '.audit',
  '.tools',
  'coverage',
  'dist',
  'build',
  'trees',
  'backup',
  '.safety-backups',
  'database_backup',
  'playwright-report',
  'test-results',
]);

// Explicit exceptions required by current product constraints:
// - Mobile dock styling/colors must not be changed.
// - Live Intelligence mode colors must not be changed.
const ALLOWLIST_FILES = new Set([
  path.normalize('components/user/LuxuryMobileDock.jsx'),
  path.normalize('frontend/src/components/LuxuryMobileDock.js'),
  path.normalize('lib/live-intelligence/modes.js'),
  path.normalize('components/home/LiveIntelligenceHero.module.css'),
  // Canonical accent source-of-truth.
  path.normalize('app/globals.css'),
  // Email-safe derived accent.
  path.normalize('lib/email/accent.js'),
  // Guard scripts necessarily contain forbidden literals.
  path.normalize('scripts/palette-guard.mjs'),
  path.normalize('scripts/palette-fix.mjs'),
]);

// Forbidden legacy accents (alternate golds / muddy browns).
// Keep this list tight to reduce false positives.
const FORBIDDEN = [
  // Hex variants (case-insensitive)
  { name: '#DAA520 (gold)', re: /#DAA520/gi },
  { name: '#B8860B (darkgoldenrod)', re: /#B8860B/gi },
  { name: '#C0A062 (alt gold)', re: /#C0A062/gi },
  { name: '#C6A15B (email/alt gold)', re: /#C6A15B/gi },
  { name: '#D4AF37 (alt gold)', re: /#D4AF37/gi },
  { name: '#E0C98A (alt gold)', re: /#E0C98A/gi },

  { name: 'rgba(218,165,32,*)', re: /rgba\(\s*218\s*,\s*165\s*,\s*32\s*,\s*[0-9]*\.?[0-9]+\s*\)/gi },
  { name: 'rgba(184,134,11,*)', re: /rgba\(\s*184\s*,\s*134\s*,\s*11\s*,\s*[0-9]*\.?[0-9]+\s*\)/gi },
  { name: 'rgba(192,160,98,*)', re: /rgba\(\s*192\s*,\s*160\s*,\s*98\s*,\s*[0-9]*\.?[0-9]+\s*\)/gi },
  // Known "muddy brown" offenders (extend only when observed)
  { name: 'rgb(139,111,71) (muddy brown)', re: /rgb\(\s*139\s*,\s*111\s*,\s*71\s*\)/gi },
];

function shouldIgnoreDir(dirName) {
  if (!dirName) return false;
  if (IGNORE_DIRS.has(dirName)) return true;
  if (dirName.startsWith('.tmp')) return true;
  return false;
}

function walk(dirRel, out) {
  const dirAbs = path.join(ROOT, dirRel);
  const entries = fs.readdirSync(dirAbs, { withFileTypes: true });

  for (const ent of entries) {
    const rel = path.join(dirRel, ent.name);

    if (ent.isDirectory()) {
      if (shouldIgnoreDir(ent.name)) continue;
      walk(rel, out);
      continue;
    }

    const ext = path.extname(ent.name);
    if (!SCAN_EXTS.has(ext)) continue;

    const relNorm = path.normalize(rel);
    if (ALLOWLIST_FILES.has(relNorm)) continue;

    out.push(relNorm);
  }
}

function scanFile(relPath) {
  const abs = path.join(ROOT, relPath);
  let text;
  try {
    text = fs.readFileSync(abs, 'utf8');
  } catch {
    return [];
  }

  const hits = [];
  for (const rule of FORBIDDEN) {
    rule.re.lastIndex = 0;
    if (rule.re.test(text)) {
      hits.push(rule.name);
    }
  }

  return hits;
}

function main() {
  const files = [];
  walk('', files);

  const violations = [];
  for (const f of files) {
    const hits = scanFile(f);
    if (hits.length) {
      violations.push({ file: f, hits });
    }
  }

  if (!violations.length) {
    console.log('✅ Palette guard: no forbidden legacy golds/browns found.');
    return;
  }

  console.error('❌ Palette guard failed. Forbidden legacy gold/brown colors detected:');
  for (const v of violations) {
    console.error(`- ${v.file}: ${Array.from(new Set(v.hits)).join(', ')}`);
  }

  console.error('\nFix guidance: use var(--lux-accent) or color-mix(in oklab, var(--lux-accent) …, transparent).');
  console.error('Allowlisted exceptions (do not edit per constraints):');
  for (const f of ALLOWLIST_FILES) console.error(`- ${f}`);

  process.exit(1);
}

main();
