/*
  Lightweight metadata audit (App Router)
  - Scans top-level route directories under /app (excluding /api)
  - Reports which have a layout file that exports `metadata` or `generateMetadata`

  Usage:
    node scripts/audit-metadata.js
*/

const fs = require('fs');
const path = require('path');

const repoRoot = process.cwd();
const appRoot = path.join(repoRoot, 'app');

const LAYOUT_FILES = ['layout.js', 'layout.jsx', 'layout.ts', 'layout.tsx'];

function safeRead(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function findLayoutInfo(dirPath) {
  for (const filename of LAYOUT_FILES) {
    const fullPath = path.join(dirPath, filename);
    if (!fs.existsSync(fullPath)) continue;

    const text = safeRead(fullPath);
    const hasMetadataExport = /export\s+const\s+metadata\b/.test(text);
    const hasGenerateMetadata = /\bgenerateMetadata\b/.test(text);

    return {
      fullPath,
      hasMetadata: hasMetadataExport || hasGenerateMetadata,
    };
  }
  return null;
}

function main() {
  if (!fs.existsSync(appRoot)) {
    console.error('ERROR: app/ directory not found.');
    process.exit(1);
  }

  const topLevelDirs = fs
    .readdirSync(appRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .filter((name) => name !== 'api');

  const withMetadata = [];
  const layoutNoMetadata = [];
  const missingLayout = [];

  for (const dirName of topLevelDirs) {
    const dirPath = path.join(appRoot, dirName);
    const layout = findLayoutInfo(dirPath);

    if (!layout) {
      missingLayout.push(dirName);
      continue;
    }

    if (layout.hasMetadata) withMetadata.push({ dirName, file: layout.fullPath });
    else layoutNoMetadata.push({ dirName, file: layout.fullPath });
  }

  const result = {
    scannedTopLevelDirs: topLevelDirs.length,
    withMetadataLayout: withMetadata.length,
    layoutWithoutMetadata: layoutNoMetadata.length,
    missingLayout: missingLayout.length,
    missingLayoutDirs: missingLayout,
    layoutWithoutMetadataDirs: layoutNoMetadata.map((x) => ({ dir: x.dirName, file: path.relative(repoRoot, x.file) })),
  };

  console.log(JSON.stringify(result, null, 2));
}

main();
