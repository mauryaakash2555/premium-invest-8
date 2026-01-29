const fs = require('fs');

const path = process.argv[2] || 'public/spline/r4x/scene.splinecode';
const b = fs.readFileSync(path);
console.log('FILE', path);
console.log('BYTES', b.length);

// Decode as UTF-8 for string scanning (this is heuristic; .splinecode is binary).
const s = b.toString('utf8');

const patterns = [
  'assets',
  'http',
  'https',
  '.png',
  '.jpg',
  '.jpeg',
  '.webp',
  '.ktx',
  '.ktx2',
  '.glb',
  '.gltf',
  '.bin',
  '.json',
  '.mp3',
  '.wav',
];

const reportLines = [];
reportLines.push(`FILE ${path}`);
reportLines.push(`BYTES ${b.length}`);

for (const p of patterns) {
  const count = s.split(p).length - 1;
  reportLines.push(`${p} matches=${count}`);
}

// Heuristic: try to locate readable-looking asset paths embedded in the binary.
// Keep output bounded; binary regex matches can be extremely long.
const candidateRe = /(?:assets\/[^\u0000\s"']+|\/spline\/r4x\/[^\u0000\s"']+|https?:\/\/[^\u0000\s"']+)/g;
const candidates = (s.match(candidateRe) || [])
  .map((m) => m.trim())
  .filter((m) => m.length >= 5 && m.length <= 240)
  .filter((m) => /\.(png|jpe?g|webp|ktx2?|glb|gltf|bin|json|mp3|wav)(\?|$)/i.test(m));

const unique = [...new Set(candidates)];
reportLines.push(`CANDIDATE_ASSET_URLS_COUNT ${unique.length}`);
unique.slice(0, 50).forEach((u) => reportLines.push(u));

// Extra: show a few short snippets around the word "assets" if present.
const assetHits = [];
let idx = s.indexOf('assets');
while (idx !== -1 && assetHits.length < 10) {
  const start = Math.max(0, idx - 40);
  const end = Math.min(s.length, idx + 140);
  assetHits.push(s.slice(start, end).replace(/[\u0000-\u001f]/g, ' '));
  idx = s.indexOf('assets', idx + 6);
}
if (assetHits.length) {
  reportLines.push('ASSETS_SNIPPETS');
  assetHits.forEach((h) => reportLines.push(h));
}

const httpHits = [];
idx = s.indexOf('http');
while (idx !== -1 && httpHits.length < 10) {
  const start = Math.max(0, idx - 40);
  const end = Math.min(s.length, idx + 200);
  httpHits.push(s.slice(start, end).replace(/[\u0000-\u001f]/g, ' '));
  idx = s.indexOf('http', idx + 4);
}
if (httpHits.length) {
  reportLines.push('HTTP_SNIPPETS');
  httpHits.forEach((h) => reportLines.push(h));
}

const outPath = '.tmp_spline_scan.txt';
fs.writeFileSync(outPath, reportLines.join('\n') + '\n', 'utf8');

console.log('WROTE', outPath);
console.log('CANDIDATE_ASSET_URLS_COUNT', unique.length);
console.log('SAMPLE_URLS');
unique.slice(0, 5).forEach((u) => console.log(u));
