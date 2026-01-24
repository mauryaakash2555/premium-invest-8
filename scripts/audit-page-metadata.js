/*
  Audit page-level metadata coverage.

  Goal:
  - Find App Router pages under app/(any)/page.(js|jsx|ts|tsx)
  - Flag pages whose directory does NOT have a layout exporting metadata/generateMetadata
    AND the page file itself does NOT export metadata/generateMetadata.

  Notes:
  - This is a pragmatic heuristic; root app/layout.js returns homepage metadata by default,
    so missing per-route metadata is still a problem for SEO.

  Usage:
    node scripts/audit-page-metadata.js
*/

const fs = require('fs');
const path = require('path');

const repoRoot = process.cwd();
const appRoot = path.join(repoRoot, 'app');

const PAGE_RE = /^page\.(js|jsx|ts|tsx)$/;
const LAYOUT_FILES = ['layout.js', 'layout.jsx', 'layout.ts', 'layout.tsx'];

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function hasMetadataInText(text) {
  return /export\s+const\s+metadata\b/.test(text) || /\bgenerateMetadata\b/.test(text);
}

function dirHasMetadataLayout(dirPath) {
  for (const name of LAYOUT_FILES) {
    const full = path.join(dirPath, name);
    if (!fs.existsSync(full)) continue;
    const text = readText(full);
    if (hasMetadataInText(text)) return { file: full };
  }
  return null;
}

function walk(dirPath, out) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dirPath, ent.name);
    if (ent.isDirectory()) {
      // Skip Next.js API routes (not SEO pages)
      if (ent.name === 'api') continue;
      walk(full, out);
      continue;
    }
    if (!PAGE_RE.test(ent.name)) continue;
    out.push(full);
  }
}

function main() {
  if (!fs.existsSync(appRoot)) {
    console.error('ERROR: app/ directory not found.');
    process.exit(1);
  }

  const pages = [];
  walk(appRoot, pages);

  const missing = [];

  for (const pageFile of pages) {
    const relPage = path.relative(repoRoot, pageFile).replace(/\\/g, '/');
    // Homepage is intentionally covered by app/layout.js + app/metadata.js defaults.
    if (relPage === 'app/(public)/page.jsx' || relPage === 'app/(public)/page.js' || relPage === 'app/(public)/page.tsx' || relPage === 'app/(public)/page.ts') {
      continue;
    }

    const dir = path.dirname(pageFile);
    const pageText = readText(pageFile);
    const pageHas = hasMetadataInText(pageText);
    const layout = dirHasMetadataLayout(dir);

    if (!pageHas && !layout) {
      missing.push({
        page: relPage,
      });
    }
  }

  missing.sort((a, b) => a.page.localeCompare(b.page));

  console.log(
    JSON.stringify(
      {
        pagesScanned: pages.length,
        pagesMissingLocalMetadata: missing.length,
        missingPages: missing,
      },
      null,
      2
    )
  );
}

main();
