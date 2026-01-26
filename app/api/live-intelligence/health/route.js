/**
 * Live Intelligence Health API
 *
 * Quick readiness checklist for production:
 * - Supabase connectivity
 * - AI provider keys presence (does not expose secrets)
 *
 * NOTE: This is a lightweight diagnostic endpoint; it does not run ingestion.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function presentEnvBool(name, value) {
  return { name, present: Boolean(value && String(value).trim()) };
}

async function checkSupabase() {
  const supabase = getSupabase();
  if (!supabase) {
    return {
      present: false,
      ok: false,
      error: 'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY',
    };
  }

  try {
    // Cheap query against a likely table; still safe if table doesn't exist.
    const { error } = await supabase.from('headlines').select('id', { head: true, count: 'exact' }).limit(1);
    if (error) {
      return {
        present: true,
        ok: false,
        error: `Supabase query failed: ${error.message}`,
      };
    }
    return { present: true, ok: true };
  } catch (e) {
    return {
      present: true,
      ok: false,
      error: `Supabase exception: ${e?.message || String(e)}`,
    };
  }
}

export async function GET() {
  const supabase = await checkSupabase();

  const strictAi = process.env.LIVE_INTELLIGENCE_STRICT_AI === '1' || process.env.NODE_ENV === 'production';
  const allowCuratedFallback =
    process.env.LIVE_INTELLIGENCE_ALLOW_CURATED_FALLBACK === '1' ||
    (process.env.NODE_ENV !== 'production' && process.env.LIVE_INTELLIGENCE_ALLOW_CURATED_FALLBACK !== '0');

  const ai = {
    gemini: presentEnvBool('GEMINI_API_KEY or GOOGLE_AI_API_KEY', process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY),
    groq: presentEnvBool('GROQ_API_KEY', process.env.GROQ_API_KEY),
    claude: presentEnvBool('ANTHROPIC_API_KEY or CLAUDE_API_KEY', process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY),
  };

  const ready = supabase.ok && (!strictAi || (ai.gemini.present && ai.groq.present));

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    supabase,
    ai,
    strictAi,
    allowCuratedFallback,
    ready,
    notes: [
      'This endpoint checks configuration presence/connectivity only.',
      strictAi
        ? 'Strict AI mode is enabled: missing AI keys will cause processing to fail (no placeholder content).'
        : 'Non-strict AI mode: pipeline may use conservative fallback blocks if AI keys are missing.',
      allowCuratedFallback
        ? 'Curated feed fallback is enabled (primarily for development).'
        : 'Curated feed fallback is disabled: feed expects live database headlines.',
    ],
  });
}
