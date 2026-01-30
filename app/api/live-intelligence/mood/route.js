/**
 * Live Mood Text Generation API
 * 
 * ROLE: AI-generated market mood summaries
 * ALLOWED: Short, factual, present-tense summaries
 * FORBIDDEN: ❌ Advice, ❌ Future language, ❌ Recommendations
 * 
 * Example output: "Markets steady amid mixed global cues. Volatility remains moderate."
 * 
 * Live Mood:
 * - Feeds overlay trigger
 * - Feeds homepage ticker
 * - Is regenerated automatically (time-based)
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, max-age=0',
};

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// Fetch current market context
async function getMarketContext(request) {
  try {
    // Fetch from our market-data API
    const baseUrl = request?.nextUrl?.origin || process.env.NEXT_PUBLIC_SITE_URL || 'https://bmwealth.co.in';
    const response = await fetch(`${baseUrl}/api/market-data?nocache=1`, {
      cache: 'no-store',
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  } catch {
    return null;
  }
}

function hasUsableMarketData(marketData) {
  const items = Array.isArray(marketData?.items) ? marketData.items : [];
  return items.some((x) => x?.live === true && x?.value !== '---' && x?.value != null);
}

function buildFallbackMood(reason) {
  return {
    mood_text: 'Markets steady. Live data temporarily unavailable.',
    mood_type: 'neutral',
    reason,
  };
}

function pickMarketItem(items, predicates) {
  for (const pred of predicates) {
    const found = items.find((x) => {
      try {
        return pred(x);
      } catch {
        return false;
      }
    });
    if (found) return found;
  }
  return null;
}

function formatPct(changePct) {
  if (typeof changePct !== 'number' || !Number.isFinite(changePct)) return null;
  const rounded = Math.round(changePct * 100) / 100;
  const sign = rounded > 0 ? '+' : '';
  return `${sign}${rounded}%`;
}

function trendWord(changePct) {
  if (typeof changePct !== 'number' || !Number.isFinite(changePct)) return 'steady';
  if (Math.abs(changePct) < 0.1) return 'flat';
  return changePct > 0 ? 'higher' : 'lower';
}

function generateMoodRuleBased(marketData) {
  if (!hasUsableMarketData(marketData)) return buildFallbackMood('Market data unavailable');

  const items = Array.isArray(marketData?.items) ? marketData.items : [];

  const nifty = pickMarketItem(items, [
    (x) => String(x?.id || '').toLowerCase().includes('nifty') && !String(x?.id || '').toLowerCase().includes('bank'),
    (x) => String(x?.name || '').toLowerCase().includes('nifty') && !String(x?.name || '').toLowerCase().includes('bank'),
  ]);

  const bankNifty = pickMarketItem(items, [
    (x) => String(x?.id || '').toLowerCase().includes('bank') && String(x?.id || '').toLowerCase().includes('nifty'),
    (x) => String(x?.name || '').toLowerCase().includes('bank') && String(x?.name || '').toLowerCase().includes('nifty'),
  ]);

  const sensex = pickMarketItem(items, [
    (x) => String(x?.id || '').toLowerCase().includes('sensex'),
    (x) => String(x?.name || '').toLowerCase().includes('sensex'),
  ]);

  const parts = [];
  if (nifty) {
    const pct = formatPct(nifty?.changePct);
    parts.push(`Nifty ${trendWord(nifty?.changePct)}${pct ? ` ${pct}` : ''}`.trim());
  }
  if (bankNifty) {
    const pct = formatPct(bankNifty?.changePct);
    parts.push(`Bank Nifty ${trendWord(bankNifty?.changePct)}${pct ? ` ${pct}` : ''}`.trim());
  } else if (sensex) {
    const pct = formatPct(sensex?.changePct);
    parts.push(`Sensex ${trendWord(sensex?.changePct)}${pct ? ` ${pct}` : ''}`.trim());
  }

  const mood_text = (parts.join('. ') + (parts.length ? '.' : '')).trim();
  const mood_type = determineMoodType(marketData);

  if (!mood_text) throw new Error('Market data unavailable');
  return { mood_text, mood_type };
}

// Generate mood with Gemini
async function generateMoodWithGemini(marketData) {
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;

  // If Gemini is not configured, fall back to a strictly live, rule-based mood.
  if (!geminiApiKey) {
    return generateMoodRuleBased(marketData);
  }
  if (!hasUsableMarketData(marketData)) return buildFallbackMood('Market data unavailable');

  try {
    const items = Array.isArray(marketData?.items) ? marketData.items : [];
    const marketSummary = items
      .filter((x) => x?.live === true)
      .slice(0, 12)
      .map((item) => {
        const name = String(item?.name || item?.id || '').trim();
        const value = item?.value;
        const pct = typeof item?.changePct === 'number' ? item.changePct : null;
        const pctText = pct == null ? '' : ` (${pct >= 0 ? '+' : ''}${pct}%)`;
        return `${name}: ${value}${pctText}`;
      })
      .filter(Boolean)
      .join(', ');

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Generate a SHORT market mood summary (max 15 words) based on this data:
${marketSummary}

RULES:
- Present tense ONLY
- NO advice or recommendations
- NO future predictions (no "will", "may", "could")
- NO "should" statements
- Factual and neutral tone
- Single sentence preferred

Examples of good output:
- "Markets steady amid mixed global cues. Volatility remains moderate."
- "Indian markets trading flat. Global sentiment cautious."
- "Nifty holds gains. Banking sector shows strength."

Return ONLY the mood text, nothing else.`
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 50,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    
    // Clean up any quotes or extra formatting
    const cleanText = text.replace(/^["']|["']$/g, '').trim();
    
    if (cleanText && cleanText.length > 10 && cleanText.length < 100) {
      return {
        mood_text: cleanText,
        mood_type: determineMoodType(marketData),
      };
    }
    throw new Error('Gemini returned unusable mood');
  } catch (error) {
    console.error('Gemini mood generation error:', error);
    throw error;
  }
}

// Determine mood type from market data
function determineMoodType(marketData) {
  const items = Array.isArray(marketData?.items) ? marketData.items : [];
  if (!items.length) return 'neutral';

  const changes = items
    .map((item) => (typeof item?.changePct === 'number' ? item.changePct : null))
    .filter((x) => typeof x === 'number' && Number.isFinite(x));

  if (!changes.length) return 'neutral';

  const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
  const maxChange = Math.max(...changes.map(Math.abs));

  if (maxChange > 2) return 'volatile';
  if (avgChange > 0.5) return 'bullish';
  if (avgChange < -0.5) return 'bearish';
  if (changes.some(c => c > 0.3) && changes.some(c => c < -0.3)) return 'mixed';
  
  return 'neutral';
}

// POST: Generate new mood text
export async function POST(request) {
  try {
    // Get current market context
    const marketData = await getMarketContext(request);

    // Generate mood text
    const { mood_text, mood_type } = await generateMoodWithGemini(marketData);

    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({
        success: true,
        mood: {
          mood_text,
          mood_type,
          generated_at: new Date().toISOString(),
        },
        stored: false,
        warning: 'Supabase not configured',
      }, { headers: NO_CACHE_HEADERS });
    }

    // Deactivate previous active moods
    await supabase
      .from('live_mood')
      .update({ is_active: false })
      .eq('is_active', true);

    // Insert new mood
    const { data, error } = await supabase
      .from('live_mood')
      .insert({
        mood_text,
        mood_type,
        generated_by: 'gemini',
        context_data: marketData,
        is_active: true,
        valid_until: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
      })
      .select()
      .single();

    if (error) {
      // If table doesn't exist, return the generated mood anyway
      if (error.message?.includes('does not exist')) {
        return NextResponse.json({
          success: true,
          mood: {
            mood_text,
            mood_type,
            generated_at: new Date().toISOString(),
          },
          stored: false,
        }, { headers: NO_CACHE_HEADERS });
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      mood: data,
      stored: true,

    }, { headers: NO_CACHE_HEADERS });
  } catch (error) {
    console.error('Mood generation error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Mood generation failed',
      },
      { status: 503, headers: NO_CACHE_HEADERS }
    );
  }
}

// GET: Fetch current active mood OR generate new (for Vercel Cron)
export async function GET(request) {
  try {
    const supabase = getSupabase();

    // Check if this is a cron request
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    const isVercelCron = request.headers.get('x-vercel-cron') === '1';
    const isAuthorizedCron = (authHeader && cronSecret && authHeader === `Bearer ${cronSecret}`) || isVercelCron;
    
    // If cron request, always generate fresh mood
    if (isAuthorizedCron) {
      const marketData = await getMarketContext(request);
      const { mood_text, mood_type } = await generateMoodWithGemini(marketData);

      if (!supabase) {
        return NextResponse.json({
          success: true,
          mood: { mood_text, mood_type, generated_at: new Date().toISOString() },
          cron: true,
          stored: false,
          warning: 'Supabase not configured',
        }, { headers: NO_CACHE_HEADERS });
      }
      
      // Deactivate old moods
      await supabase
        .from('live_mood')
        .update({ is_active: false })
        .eq('is_active', true);
      
      // Insert new mood
      const { data: newMood } = await supabase
        .from('live_mood')
        .insert({
          mood_text,
          mood_type,
          generated_by: 'gemini',
          context_data: marketData,
          is_active: true,
          valid_until: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        })
        .select()
        .single();
      
      return NextResponse.json(
        { success: true, mood: newMood || { mood_text, mood_type }, cron: true },
        { headers: NO_CACHE_HEADERS }
      );
    }
    
    // Regular GET: fetch active mood from database (if Supabase configured)
    if (supabase) {
      const { data, error } = await supabase
        .from('live_mood')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (data && !error) {
        // Check if mood is still valid
        if (data.valid_until && new Date(data.valid_until) > new Date()) {
          return NextResponse.json({
            success: true,
            mood: data,
            source: 'database',
          }, { headers: NO_CACHE_HEADERS });
        }
      }
    }

    // Generate fresh mood if none exists or expired
    const marketData = await getMarketContext(request);
    const { mood_text, mood_type } = await generateMoodWithGemini(marketData);

    return NextResponse.json(
      {
        success: true,
        mood: {
          mood_text,
          mood_type,
          generated_at: new Date().toISOString(),
        },
        source: 'generated',
      },
      { headers: NO_CACHE_HEADERS }
    );

  } catch (error) {
    console.error('Mood fetch error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Mood unavailable',
      },
      { status: 503, headers: NO_CACHE_HEADERS }
    );
  }
}
