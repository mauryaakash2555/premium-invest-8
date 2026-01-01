/**
 * Comprehensive Validation (pre-deploy)
 */

const fs = require('fs');
const path = require('path');

function isFalse(v) {
  return String(v || '').toLowerCase() === 'false';
}

function requireEnv(name, checks) {
  if (!process.env[name]) checks.push({ pass: false, message: `Missing: ${name}` });
}

async function main() {
  console.log('🔍 Running complete validation...\n');

  const checks = [];

  // 1) Environment variables (conditional on feature flags)
  console.log('1️⃣ Checking environment variables...');
  requireEnv('NEXT_PUBLIC_SUPABASE_URL', checks);
  requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', checks);
  requireEnv('SUPABASE_SERVICE_ROLE_KEY', checks);

  // AI providers are feature-flagged, default ON unless explicitly false
  if (!isFalse(process.env.NEXT_PUBLIC_FEATURE_USE_GEMINI)) requireEnv('GEMINI_API_KEY', checks);
  if (!isFalse(process.env.NEXT_PUBLIC_FEATURE_USE_GROQ)) requireEnv('GROQ_API_KEY', checks);
  if (!isFalse(process.env.NEXT_PUBLIC_FEATURE_USE_CLAUDE)) requireEnv('ANTHROPIC_API_KEY', checks);

  // Admin auth: recommend hash + session secret
  if (!process.env.SUPER_ADMIN_PASSWORD_HASH && !process.env.ADMIN_PASSWORD_HASH && !process.env.SUPER_ADMIN_PASSWORD && !process.env.ADMIN_PASSWORD) {
    checks.push({ pass: false, message: 'Missing: SUPER_ADMIN_PASSWORD_HASH (preferred) or ADMIN_PASSWORD_HASH (legacy) or SUPER_ADMIN_PASSWORD/ADMIN_PASSWORD (fallback)' });
  }
  if (!process.env.ADMIN_SESSION_SECRET) {
    checks.push({ pass: false, message: 'Missing: ADMIN_SESSION_SECRET (required for secure cookie signing)' });
  }

  // 2) File structure
  console.log('2️⃣ Checking file structure...');
  const requiredFiles = [
    'config/constants.js',
    'config/features.js',
    'components/user/AIChatFloat.jsx',
    'app/api/chat/route.js',
    'lib/ai/provider.js',
    'lib/auth/passwords.js',
    'scripts/security/scan-secrets.js',
  ];
  for (const f of requiredFiles) {
    if (!fs.existsSync(path.join(process.cwd(), f))) {
      checks.push({ pass: false, message: `Missing file: ${f}` });
    }
  }

  // 3) Secrets scan
  console.log('3️⃣ Scanning for exposed secrets...');
  const { status: scanStatus } = await run('npm', ['run', 'security:scan']);
  if (scanStatus !== 0) checks.push({ pass: false, message: 'Secrets scan failed (see output above)' });

  // 4) Chat validation (existing)
  console.log('4️⃣ Running chat validation...');
  const { status: chatStatus } = await run('npm', ['run', 'validate:chat']);
  if (chatStatus !== 0) checks.push({ pass: false, message: 'Chat validation failed (npm run validate:chat)' });

  // 5) Unit tests
  console.log('5️⃣ Running tests...');
  const { status: testStatus } = await run('npm', ['test']);
  if (testStatus !== 0) checks.push({ pass: false, message: 'Tests failed (npm test)' });

  // Summary
  console.log('\n📊 Validation Summary:');
  const failed = checks.filter((c) => !c.pass);

  if (failed.length > 0) {
    console.error('❌ VALIDATION FAILED!');
    failed.forEach((f) => console.error(`  - ${f.message}`));
    process.exit(1);
  }

  console.log('✅ ALL CHECKS PASSED!');
  console.log('Safe to deploy! 🚀');
}

function run(cmd, args) {
  return new Promise((resolve) => {
    const { spawn } = require('child_process');
    const p = spawn(cmd, args, { stdio: 'inherit', shell: true, env: process.env });
    p.on('close', (status) => resolve({ status }));
  });
}

main().catch((e) => {
  console.error('❌ validate-all crashed:', e);
  process.exit(1);
});

