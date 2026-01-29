/*
 * Extracts printable strings from a .splinecode and highlights likely background/floor objects.
 */

const fs = require('fs');

const filePath = process.argv[2] || 'public/spline/r4x/scene.splinecode';
const outPath = process.argv[3] || '.tmp_spline_strings_hits.txt';

const buf = fs.readFileSync(filePath);

function isPrintable(byte) {
  // ASCII printable + common whitespace
  return (byte >= 0x20 && byte <= 0x7e) || byte === 0x09;
}

const strings = [];
let cur = [];
for (let i = 0; i < buf.length; i++) {
  const b = buf[i];
  if (isPrintable(b)) {
    cur.push(b);
  } else {
    if (cur.length >= 4) strings.push(Buffer.from(cur).toString('utf8'));
    cur = [];
  }
}
if (cur.length >= 4) strings.push(Buffer.from(cur).toString('utf8'));

const patterns = [
  /floor/i,
  /ground/i,
  /plane/i,
  /wall/i,
  /background/i,
  /shadow/i,
  /env/i,
  /sky/i,
  /light/i,
  /camera/i,
];

const hits = new Set();
for (const s of strings) {
  for (const p of patterns) {
    if (p.test(s)) {
      // avoid super long junk
      if (s.length <= 120) hits.add(s);
      break;
    }
  }
}

const topAll = Array.from(new Set(strings.filter((s) => s.length <= 80))).slice(0, 300);

const out = [];
out.push(`FILE=${filePath}`);
out.push(`TOTAL_STRINGS=${strings.length}`);
out.push(`HIT_COUNT=${hits.size}`);

// Heuristic extraction of object names: many splinecode encodings contain repeated "name" keys.
const names = new Set();
for (let i = 0; i < strings.length - 1; i++) {
  if (strings[i] === 'name') {
    const v = strings[i + 1];
    if (typeof v === 'string' && v.length > 0 && v.length <= 80) {
      // filter obvious schema keys
      if (!['timelineAnimations', 'position', 'rotation', 'scale', 'geometry', 'material'].includes(v)) {
        names.add(v);
      }
    }
  }
}

const nameHits = Array.from(names).filter((n) => patterns.some((p) => p.test(n)));
out.push('');
out.push('HITS:');
for (const s of Array.from(hits).sort((a, b) => a.localeCompare(b))) out.push(s);

out.push('');
out.push(`NAME_COUNT=${names.size}`);
out.push(`NAME_HIT_COUNT=${nameHits.length}`);
out.push('NAME_HITS:');
for (const n of nameHits.sort((a, b) => a.localeCompare(b))) out.push(n);

out.push('');
out.push('NAMES_SAMPLE_FIRST_120:');
for (const n of Array.from(names).slice(0, 120)) out.push(n);
out.push('');
out.push('SAMPLE_ALL_STRINGS_FIRST_300:');
for (const s of topAll) out.push(s);

fs.writeFileSync(outPath, out.join('\n'), 'utf8');
console.log(`WROTE ${outPath} (hits=${hits.size})`);
