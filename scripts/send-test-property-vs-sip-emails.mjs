import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;
  const content = fs.readFileSync(filePath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

// Load local env if present (do not print values).
loadEnvFile(path.join(process.cwd(), '.env.local'));
loadEnvFile(path.join(process.cwd(), '.env'));

async function getCandidateSecretsFromEnv() {
  const candidates = [
    process.env.ADMIN_SESSION_SECRET,
    process.env.SUPER_ADMIN_PASSWORD_HASH,
    process.env.ADMIN_PASSWORD_HASH,
    process.env.SUPER_ADMIN_PASSWORD,
    process.env.ADMIN_PASSWORD,
  ]
    .map((v) => String(v || '').trim())
    .filter(Boolean);

  // If env is missing, Next.js code falls back to config/constants.js.
  // Importing it here avoids Next's path aliases and lets this script work locally.
  try {
    const { CONSTANTS } = await import('../config/constants.js');
    const fb = [
      CONSTANTS?.AUTH?.SUPER_ADMIN_PASSWORD_HASH_FALLBACK,
      CONSTANTS?.AUTH?.ADMIN_PASSWORD_HASH_FALLBACK,
      CONSTANTS?.AUTH?.SUPER_ADMIN_PASSWORD_PLAIN_FALLBACK,
    ]
      .map((v) => String(v || '').trim())
      .filter(Boolean);
    candidates.push(...fb);
  } catch {
    // ignore
  }

  // De-dup while preserving order
  return Array.from(new Set(candidates));
}

function base64url(input) {
  return Buffer.from(input, 'utf8')
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '');
}

function hmacSha256Base64url(secret, bodyBase64url) {
  const sig = crypto.createHmac('sha256', secret).update(bodyBase64url).digest('base64');
  return sig.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function issueSuperAdminTokenValue(secret) {
  if (!secret) throw new Error('Missing signing secret');

  const maxAgeSeconds = Number(process.env.ADMIN_COOKIE_MAX_AGE_SECONDS || '') || 60 * 30;
  const payload = { exp: Date.now() + maxAgeSeconds * 1000, role: 'super' };
  const body = base64url(JSON.stringify(payload));
  const sig = hmacSha256Base64url(secret, body);
  return `${body}.${sig}`;
}

const baseUrl = process.env.TEST_BASE_URL || 'http://localhost:3000';
const to = process.env.TEST_TO_EMAIL || 'mauryaaksh2555@gmail.com';

async function main() {
  const candidates = await getCandidateSecretsFromEnv();
  if (!candidates.length) {
    console.error('No admin signing secret found in env (.env.local). Need ADMIN_SESSION_SECRET or SUPER_ADMIN_PASSWORD_HASH or ADMIN_PASSWORD_HASH or SUPER_ADMIN_PASSWORD/ADMIN_PASSWORD.');
    process.exitCode = 1;
    return;
  }

  let res;
  let json;
  let authed = false;

  for (const secret of candidates) {
    const token = issueSuperAdminTokenValue(secret);
    res = await fetch(`${baseUrl}/api/admin/test-property-vs-sip-emails`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-bm-admin-token': token,
      },
      body: JSON.stringify({ to }),
    });

    json = await res.json().catch(() => null);
    if (res.status !== 401) {
      authed = Boolean(res.ok);
      break;
    }
  }

  if (!authed) {
    console.error('Request failed:', res?.status, json);
    process.exitCode = 1;
    return;
  }

  const free = json?.free;
  const paid = json?.paid;

  console.log('OK:', { to: json?.to });
  console.log('Free email:', free?.ok ? 'sent' : free?.skipped ? `skipped (${free?.reason || 'unknown'})` : 'failed');
  console.log('Paid email:', paid?.ok ? 'sent' : paid?.skipped ? `skipped (${paid?.reason || 'unknown'})` : 'failed');
  if (json?.note) console.log('Note:', json.note);

  if (free?.error || paid?.error) {
    console.log('Errors present (see JSON below).');
    console.log(JSON.stringify({ freeError: free?.error ?? null, paidError: paid?.error ?? null }, null, 2));
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err);
  process.exitCode = 1;
});
