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

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// Fetch current market context
async function getMarketContext() {
  try {
    // Fetch from our market-data API
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bmwealth.co.in';
    const response = await fetch(`${baseUrl}/api/market-data`, {
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

// Generate mood with Gemini
async function generateMoodWithGemini(marketData) {
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  
  if (!geminiApiKey) {
    return generateFallbackMood(marketData);
  }

  try {
    const marketSummary = marketData?.data?.map(item => 
      `${item.name}: ${item.price} (${item.change >= 0 ? '+' : ''}${item.changePercent}%)`
    ).join(', ') || 'No market data available';

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

    return generateFallbackMood(marketData);
  } catch (error) {
    console.error('Gemini mood generation error:', error);
    return generateFallbackMood(marketData);
  }
}

// Determine mood type from market data
function determineMoodType(marketData) {
  if (!marketData?.data?.length) return 'neutral';

  const changes = marketData.data
    .filter(item => item.changePercent !== undefined)
    .map(item => parseFloat(item.changePercent) || 0);

  if (!changes.length) return 'neutral';

  const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
  const maxChange = Math.max(...changes.map(Math.abs));

  if (maxChange > 2) return 'volatile';
  if (avgChange > 0.5) return 'bullish';
  if (avgChange < -0.5) return 'bearish';
  if (changes.some(c => c > 0.3) && changes.some(c => c < -0.3)) return 'mixed';
  
  return 'neutral';
}

// Fallback mood generator
function generateFallbackMood(marketData) {
  const moodType = determineMoodType(marketData);
  
  const moodTexts = {
    bullish: 'Markets showing positive momentum. Investor sentiment upbeat.',
    bearish: 'Markets under pressure. Cautious sentiment prevails.',
    volatile: 'Markets experiencing heightened volatility. Mixed signals across sectors.',
    mixed: 'Markets trading mixed. Sectoral divergence observed.',
    neutral: 'Markets trading steady. Volatility remains contained.',
  };

  return {
    mood_text: moodTexts[moodType] || moodTexts.neutral,
    mood_type: moodType,
  };
}

// POST: Generate new mood text
export async function POST(request) {
  try {
    // Get current market context
    const marketData = await getMarketContext();

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
      });
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
        });
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      mood: data,
      stored: true,
    });

  } catch (error) {
    console.error('Mood generation error:', error);
    
    // Return fallback mood on error
    const fallback = generateFallbackMood(null);
    return NextResponse.json({
      success: true,
      mood: {
        ...fallback,
        generated_at: new Date().toISOString(),
      },
      stored: false,
      error: error.message,
    });
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
      const marketData = await getMarketContext();
      const { mood_text, mood_type } = await generateMoodWithGemini(marketData);

      if (!supabase) {
        return NextResponse.json({
          success: true,
          mood: { mood_text, mood_type, generated_at: new Date().toISOString() },
          cron: true,
          stored: false,
          warning: 'Supabase not configured',
        });
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
      
      return NextResponse.json({ success: true, mood: newMood || { mood_text, mood_type }, cron: true });
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
          });
        }
      }
    }

    // Generate fresh mood if none exists or expired
    const marketData = await getMarketContext();
    const { mood_text, mood_type } = await generateMoodWithGemini(marketData);

    return NextResponse.json({
      success: true,
      mood: {
        mood_text,
        mood_type,
        generated_at: new Date().toISOString(),
      },
      source: 'generated',
    });

  } catch (error) {
    console.error('Mood fetch error:', error);
    
    // Return fallback on error
    const fallback = generateFallbackMood(null);
    return NextResponse.json({
      success: true,
      mood: {
        ...fallback,
        generated_at: new Date().toISOString(),
      },
      source: 'fallback',
    });
  }
}
