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

function shouldRequireEnv() {
  // Local deploy scripts (like update-staging.ps1) run on developer machines where
  // Vercel/CI secrets usually aren't present. Keep strict enforcement for CI.
  if (String(process.env.VALIDATE_ALL_STRICT_ENV || '').toLowerCase() === 'true') return true;
  if (String(process.env.CI || '').toLowerCase() === 'true') return true;
  if (String(process.env.VERCEL || '').toLowerCase() === 'true') return true;
  return false;
}

async function main() {
  console.log('🔍 Running complete validation...\n');

  const checks = [];
  const strictEnv = shouldRequireEnv();

  // 1) Environment variables (conditional on feature flags)
  console.log('1️⃣ Checking environment variables...');
  if (strictEnv) {
    requireEnv('NEXT_PUBLIC_SUPABASE_URL', checks);
    requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', checks);
    requireEnv('SUPABASE_SERVICE_ROLE_KEY', checks);
  } else {
    const missing = ['NEXT_PUBLIC_SUPABASE_URL', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'].filter(
      (k) => !process.env[k]
    );
    if (missing.length) {
      console.warn(`⚠️  Skipping strict env enforcement locally. Missing: ${missing.join(', ')}`);
      console.warn('   Set VALIDATE_ALL_STRICT_ENV=true to enforce env vars.');
    }
  }

  // AI providers are feature-flagged, default ON unless explicitly false
  if (strictEnv) {
    if (!isFalse(process.env.NEXT_PUBLIC_FEATURE_USE_GEMINI)) requireEnv('GEMINI_API_KEY', checks);
    if (!isFalse(process.env.NEXT_PUBLIC_FEATURE_USE_GROQ)) requireEnv('GROQ_API_KEY', checks);
    if (!isFalse(process.env.NEXT_PUBLIC_FEATURE_USE_CLAUDE)) requireEnv('ANTHROPIC_API_KEY', checks);
  }

  // Admin auth: recommend hash + session secret
  if (strictEnv) {
    if (!process.env.SUPER_ADMIN_PASSWORD_HASH && !process.env.ADMIN_PASSWORD_HASH && !process.env.SUPER_ADMIN_PASSWORD && !process.env.ADMIN_PASSWORD) {
      checks.push({
        pass: false,
        message:
          'Missing: SUPER_ADMIN_PASSWORD_HASH (preferred) or ADMIN_PASSWORD_HASH (legacy) or SUPER_ADMIN_PASSWORD/ADMIN_PASSWORD (fallback)',
      });
    }
    if (!process.env.ADMIN_SESSION_SECRET) {
      checks.push({ pass: false, message: 'Missing: ADMIN_SESSION_SECRET (required for secure cookie signing)' });
    }
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

  // 4) Palette guard (brand integrity)
  console.log('4️⃣ Enforcing premium palette lock...');
  const { status: paletteStatus } = await run('npm', ['run', 'lint:palette']);
  if (paletteStatus !== 0) checks.push({ pass: false, message: 'Palette guard failed (npm run lint:palette)' });

  // 5) Chat validation (existing)
  console.log('5️⃣ Running chat validation...');
  const { status: chatStatus } = await run('npm', ['run', 'validate:chat']);
  if (chatStatus !== 0) checks.push({ pass: false, message: 'Chat validation failed (npm run validate:chat)' });

  // 6) Unit tests
  console.log('6️⃣ Running tests...');
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

