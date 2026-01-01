/**
 * Seed dummy affiliate links
 * Replace with real links when available
 *
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/seed-affiliates.js
 */

const { createClient } = require('@supabase/supabase-js');

const dummyAffiliates = [
  {
    platform: 'Zerodha',
    category: 'trading',
    affiliate_url: 'https://zerodha.com?ref=PLACEHOLDER',
    commission_rate: 500,
    commission_type: 'per_signup',
    placeholder: true,
    description: 'Zero brokerage equity delivery',
  },
  {
    platform: 'Groww',
    category: 'trading',
    affiliate_url: 'https://groww.in?ref=PLACEHOLDER',
    commission_rate: 300,
    commission_type: 'per_signup',
    placeholder: true,
    description: 'User-friendly investing app',
  },
  {
    platform: 'Angel One',
    category: 'trading',
    affiliate_url: 'https://angelone.in?ref=PLACEHOLDER',
    commission_rate: 400,
    commission_type: 'per_signup',
    placeholder: true,
    description: 'Advanced trading platform',
  },
  {
    platform: 'HDFC Life',
    category: 'insurance',
    affiliate_url: 'https://hdfclife.com?ref=PLACEHOLDER',
    commission_rate: 5000,
    commission_type: 'per_policy',
    placeholder: true,
    description: 'Life insurance plans',
  },
  {
    platform: 'Smallcase',
    category: 'mutual_fund',
    affiliate_url: 'https://smallcase.com?ref=PLACEHOLDER',
    commission_rate: 200,
    commission_type: 'per_signup',
    placeholder: true,
    description: 'Thematic investing portfolios',
  },
];

function env(name) {
  return String(process.env[name] || '').trim();
}

async function main() {
  const url = env('NEXT_PUBLIC_SUPABASE_URL');
  const key = env('SUPABASE_SERVICE_ROLE_KEY');

  if (!url || !key) {
    console.error('Missing env. Need NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }

  const sb = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let inserted = 0;
  let updated = 0;

  for (const a of dummyAffiliates) {
    // Best-effort upsert by platform (without requiring a unique constraint).
    const { data: existing, error: findErr } = await sb
      .from('affiliate_links')
      .select('id,platform')
      .ilike('platform', a.platform)
      .maybeSingle();

    if (findErr) {
      console.error('Lookup failed:', a.platform, findErr.message);
      process.exit(1);
    }

    const payload = {
      platform: a.platform,
      category: a.category,
      affiliate_url: a.affiliate_url,
      commission_rate: a.commission_rate,
      commission_type: a.commission_type,
      placeholder: Boolean(a.placeholder),
      is_active: true,
    };

    if (existing?.id) {
      const { error: updErr } = await sb.from('affiliate_links').update(payload).eq('id', existing.id);
      if (updErr) {
        console.error('Update failed:', a.platform, updErr.message);
        process.exit(1);
      }
      updated += 1;
    } else {
      const { error: insErr } = await sb.from('affiliate_links').insert(payload);
      if (insErr) {
        console.error('Insert failed:', a.platform, insErr.message);
        process.exit(1);
      }
      inserted += 1;
    }
  }

  console.log(`Done. Inserted: ${inserted}, Updated: ${updated}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
