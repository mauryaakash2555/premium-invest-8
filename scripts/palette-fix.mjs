import fs from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();

const FIX_EXTS = new Set(['.js', '.jsx', '.ts', '.tsx', '.css', '.mjs', '.cjs', '.html']);

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

const SKIP_FILES = new Set([
  path.normalize('components/user/LuxuryMobileDock.jsx'),
  path.normalize('frontend/src/components/LuxuryMobileDock.js'),
  path.normalize('lib/live-intelligence/modes.js'),
  path.normalize('components/home/LiveIntelligenceHero.module.css'),
  // Canonical accent source-of-truth.
  path.normalize('app/globals.css'),
  // Email-safe derived accent.
  path.normalize('lib/email/accent.js'),
  // Fixer scripts necessarily contain legacy literals.
  path.normalize('scripts/palette-guard.mjs'),
  path.normalize('scripts/palette-fix.mjs'),
]);

function shouldIgnoreDir(dirName) {
  if (!dirName) return false;
  if (IGNORE_DIRS.has(dirName)) return true;
  if (dirName.startsWith('.tmp')) return true;
  return false;
}

function clamp01(n) {
  const x = Number(n);
  if (!Number.isFinite(x)) return 0;
  return Math.min(1, Math.max(0, x));
}

function rgbaToAccentColorMix(_full, a) {
  const alpha = clamp01(a);
  const pct = Math.round(alpha * 100);
  return `color-mix(in oklab, var(--lux-accent) ${pct}%, transparent)`;
}

function fixText(input) {
  let s = input;

  // Hex variants -> canonical accent
  s = s.replace(/#DAA520/gi, 'var(--lux-accent)');
  s = s.replace(/#B8860B/gi, 'var(--lux-accent)');
  s = s.replace(/#C0A062/gi, 'var(--lux-accent)');
  s = s.replace(/#C6A15B/gi, 'var(--lux-accent)');
  s = s.replace(/#D4AF37/gi, 'var(--lux-accent)');
  s = s.replace(/#E0C98A/gi, 'var(--lux-accent)');

  // Explicit OKLCH literal -> canonical variable (source files only; globals/accent.js are skipped)
  s = s.replace(/oklch\(\s*0\.78\s+0\.08\s+65\s*\)/gi, 'var(--lux-accent)');

  // RGB/A variants
  s = s.replace(/rgba\(\s*218\s*,\s*165\s*,\s*32\s*,\s*([0-9]*\.?[0-9]+)\s*\)/gi, rgbaToAccentColorMix);
  s = s.replace(/rgba\(\s*184\s*,\s*134\s*,\s*11\s*,\s*([0-9]*\.?[0-9]+)\s*\)/gi, rgbaToAccentColorMix);
  s = s.replace(/rgba\(\s*192\s*,\s*160\s*,\s*98\s*,\s*([0-9]*\.?[0-9]+)\s*\)/gi, rgbaToAccentColorMix);

  // Muddy browns (known offender) -> neutralized, still tied to accent
  s = s.replace(/rgb\(\s*139\s*,\s*111\s*,\s*71\s*\)/gi, 'color-mix(in oklab, var(--lux-accent) 18%, transparent)');

  return s;
}

function walk(dirRel, files) {
  const dirAbs = path.join(ROOT, dirRel);
  const entries = fs.readdirSync(dirAbs, { withFileTypes: true });

  for (const ent of entries) {
    const rel = path.join(dirRel, ent.name);

    if (ent.isDirectory()) {
      if (shouldIgnoreDir(ent.name)) continue;
      walk(rel, files);
      continue;
    }

    const ext = path.extname(ent.name);
    if (!FIX_EXTS.has(ext)) continue;

    const relNorm = path.normalize(rel);
    if (SKIP_FILES.has(relNorm)) continue;

    files.push(relNorm);
  }
}

function main() {
  const files = [];
  walk('', files);

  let changedCount = 0;

  for (const rel of files) {
    const abs = path.join(ROOT, rel);
    let before;
    try {
      before = fs.readFileSync(abs, 'utf8');
    } catch {
      continue;
    }

    const after = fixText(before);
    if (after !== before) {
      fs.writeFileSync(abs, after, 'utf8');
      changedCount += 1;
      console.log(`fixed: ${rel}`);
    }
  }

  console.log(`\nDone. Files updated: ${changedCount}`);
}

main();
