/**
 * Scans code for accidentally committed secrets
 * Run: npm run security:scan
 */

const fs = require('fs');
const path = require('path');

const DANGEROUS_PATTERNS = [
  /sk-ant-api\w+/gi, // Anthropic keys
  /AIzaSy[\w-]{33}/gi, // Google API keys
  /gsk_[\w-]+/gi, // Groq keys
  /eyJ[\w-]+\.eyJ[\w-]+/gi, // JWT-ish
  /SUPABASE_SERVICE_ROLE_KEY\s*=\s*[^\s"']+/gi,
  /ANTHROPIC_API_KEY\s*=\s*[^\s"']+/gi,
  /GEMINI_API_KEY\s*=\s*[^\s"']+/gi,
  /GROQ_API_KEY\s*=\s*[^\s"']+/gi,
];

const IGNORE_DIRS = new Set(['node_modules', '.git', '.next', 'out', 'coverage', '.vercel', 'DELETE_ME']);
const ALLOW_EXT = new Set(['.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs', '.json', '.md', '.yml', '.yaml']);

function walk(dir, findings) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const it of items) {
    const full = path.join(dir, it.name);
    if (it.isDirectory()) {
      if (IGNORE_DIRS.has(it.name)) continue;
      walk(full, findings);
    } else {
      const ext = path.extname(it.name).toLowerCase();
      if (!ALLOW_EXT.has(ext)) continue;
      const text = fs.readFileSync(full, 'utf8');
      for (const pattern of DANGEROUS_PATTERNS) {
        const matches = text.match(pattern);
        if (matches && matches.length) {
          findings.push({ file: full, pattern: String(pattern), matches: Array.from(new Set(matches)).slice(0, 5) });
        }
      }
    }
  }
}

console.log('🔍 Scanning for exposed secrets...');
const findings = [];
walk(process.cwd(), findings);

if (findings.length > 0) {
  console.error('\n❌ SECRETS FOUND! Remove them before committing/deploying!\n');
  for (const f of findings) {
    console.error('File:', f.file);
    console.error('Pattern:', f.pattern);
    console.error('Matches:', f.matches);
    console.error('---');
  }
  process.exit(1);
} else {
  console.log('✅ No secrets found');
}
