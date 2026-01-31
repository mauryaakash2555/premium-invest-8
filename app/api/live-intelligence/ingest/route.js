/**
 * RSS Ingest API Route
 * 
 * ROLE: Server-side RSS fetching with AI relevance filtering
 * ALLOWED: Fetch raw headlines, filter for relevance
 * FORBIDDEN: ❌ Interpretation, ❌ Opinions
 * 
 * This is part of the fully automated pipeline:
 * RSS → Gemini (relevance filter) → Supabase → Groq → Gemini → Claude → UI
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// RSS parsing helper
function parseRSSItem(item) {
  // Extract text content from potential CDATA or HTML
  const getText = (node) => {
    if (!node) return '';
    return node.replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1').replace(/<[^>]+>/g, '').trim();
  };

  return {
    title: getText(item.title),
    description: getText(item.description || item.summary || ''),
    link: item.link || item.url || '',
    pubDate: item.pubDate || item.published || item.date || new Date().toISOString(),
    guid: item.guid || item.id || item.link || '',
  };
}

// Generate hash for deduplication
function generateHash(url, title) {
  return crypto.createHash('sha256').update(`${url}|${title}`).digest('hex').substring(0, 32);
}

// AI Relevance Filtering - Score headlines for relevance to Indian retail investors
async function filterRelevantHeadlines(rawHeadlines) {
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  
  if (!geminiApiKey || rawHeadlines.length === 0) {
    console.log('[Ingest] No API key or no headlines, returning all');
    return rawHeadlines;
  }

  // Create scoring prompt
  const headlinesList = rawHeadlines
    .slice(0, 30) // Limit to 30 for API efficiency
    .map((h, i) => `${i + 1}. ${h.title}`)
    .join('\n');

  const prompt = `You are a financial news relevance filter for Indian retail investors.

Score each headline 0-10 for relevance to mutual fund, SIP, insurance, bonds, PMS, or trading investors in India:
- 10 = Critical (RBI policy changes, market crashes, major SEBI regulations, budget announcements)
- 8-9 = High (FII/DII flows, major sector news, economic data releases, large IPOs)
- 6-7 = Medium (individual stock news, mutual fund NFOs, insurance launches)
- 4-5 = Low (minor corporate news, small company updates)
- 0-3 = Irrelevant (celebrity news, sports, entertainment, politics unrelated to markets)

ONLY return headlines with score ≥ 6 (filter out low relevance junk).

Headlines:
${headlinesList}

Return ONLY valid JSON array with no other text:
[{"index": 1, "score": 8}, {"index": 2, "score": 6}, ...]

Important: Return ONLY the JSON array. No markdown, no explanations.`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.1,
            maxOutputTokens: 1000,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error('[Ingest] Gemini API error:', response.status);
      return rawHeadlines.slice(0, 15); // Return first 15 as fallback
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Extract JSON array from response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      console.error('[Ingest] No valid JSON in Gemini response');
      return rawHeadlines.slice(0, 15);
    }

    const scores = JSON.parse(jsonMatch[0]);

    // Filter: Keep only score >= 6
    const filtered = rawHeadlines.filter((h, i) => {
      if (i >= 30) return false; // Skip items beyond what we scored
      const scoreEntry = scores.find((s) => s.index === i + 1);
      return scoreEntry && scoreEntry.score >= 6;
    });

    console.log(`[Ingest] Filtered ${rawHeadlines.length} → ${filtered.length} relevant headlines`);
    return filtered;
  } catch (error) {
    console.error('[Ingest] Relevance filtering error:', error);
    return rawHeadlines.slice(0, 15); // Fallback on error
  }
}

// Fetch and parse RSS feed
async function fetchRSSFeed(feedUrl) {
  try {
    const response = await fetch(feedUrl, {
      headers: {
        'User-Agent': 'BMWealth-LiveIntelligence/1.0',
        'Accept': 'application/rss+xml, application/xml, text/xml',
      },
      next: { revalidate: 0 }, // No cache
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();
    
    // Simple XML parsing for RSS items
    const items = [];
    const itemRegex = /<item[^>]*>([\s\S]*?)<\/item>/gi;
    let match;

    while ((match = itemRegex.exec(text)) !== null) {
      const itemXml = match[1];
      
      const getTag = (tag) => {
        const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
        const m = itemXml.match(regex);
        return m ? m[1] : '';
      };

      items.push({
        title: getTag('title'),
        description: getTag('description'),
        link: getTag('link'),
        pubDate: getTag('pubDate'),
        guid: getTag('guid') || getTag('link'),
      });
    }

    return items.map(parseRSSItem);
  } catch (error) {
    console.error(`RSS fetch error for ${feedUrl}:`, error);
    return [];
  }
}

export async function GET(request) {
  try {
    const supabase = getSupabase();

    // Optional: restrict to cron/internal calls
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    const isVercelCron = request.headers.get('x-vercel-cron') === '1';
    
    // In production, verify the cron secret
    if (process.env.NODE_ENV === 'production' && cronSecret) {
      if (!isVercelCron && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Get active RSS sources (fallback if Supabase not configured)
    let sources = null;
    let sourcesError = null;
    if (supabase) {
      const res = await supabase
        .from('rss_sources')
        .select('*')
        .eq('is_active', true);
      sources = res.data;
      sourcesError = res.error;
      if (sourcesError) {
        console.error('Failed to fetch RSS sources:', sourcesError);
      }
    }

    const activeSources = sources?.length ? sources : [
      { name: 'Moneycontrol Markets', feed_url: 'https://www.moneycontrol.com/rss/marketreports.xml', category: 'market_update' },
      { name: 'Economic Times Markets', feed_url: 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms', category: 'market_update' },
      { name: 'LiveMint Markets', feed_url: 'https://www.livemint.com/rss/markets', category: 'market_update' },
    ];

    const results = {
      fetched: 0,
      filtered: 0,
      newItems: 0,
      duplicates: 0,
      errors: [],
    };

    // Collect all raw headlines from all sources
    let allItems = [];
    for (const source of activeSources) {
      try {
        const items = await fetchRSSFeed(source.feed_url);
        results.fetched += items.length;
        
        // Tag each item with its source
        allItems = allItems.concat(items.map(item => ({
          ...item,
          sourceName: source.name,
          sourceCategory: source.category,
          sourceId: source.id,
        })));
        
      } catch (sourceError) {
        results.errors.push(`${source.name}: ${sourceError.message}`);
      }
    }

    // Filter for relevance using AI (only keep score >= 6)
    const relevantItems = await filterRelevantHeadlines(allItems);
    results.filtered = relevantItems.length;

    // Now insert only the relevant items
    for (const item of relevantItems) {
      if (!item.title || !item.link) continue;

      const sourceHash = generateHash(item.link, item.title);

      // Check for duplicates
      const { data: existing } = await supabase
        .from('intelligence_items')
        .select('id')
        .eq('source_hash', sourceHash)
        .single();

      if (existing) {
        results.duplicates++;
        continue;
      }

      // Insert raw item (pending AI processing)
      const { error: insertError } = await supabase
        .from('intelligence_items')
        .insert({
          source_name: item.sourceName,
          source_url: item.link,
          source_hash: sourceHash,
          category: item.sourceCategory,
          urgency: 'low', // Will be updated by Groq
          
          // Blocks (will be filled by Gemini)
          block_what_happened: item.title,
          block_why_it_matters: '',
          block_where_fits: '',
          block_who_cares: '',
          block_signals: [],
          block_source_timestamp: `Source: ${item.sourceName} | ${new Date(item.pubDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
          
          status: 'pending',
          processed_by_groq: false,
          processed_by_gemini: false,
        });

      if (insertError) {
        if (!insertError.message?.includes('duplicate')) {
          results.errors.push(`Insert error: ${insertError.message}`);
        }
      } else {
        results.newItems++;
      }
    }

    // Update last polled timestamps for all sources
    for (const source of activeSources) {
      if (source.id) {
        await supabase
          .from('rss_sources')
          .update({ 
            last_polled_at: new Date().toISOString(),
            error_count: 0,
            last_error: null,
          })
          .eq('id', source.id);
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...results,
    });

  } catch (error) {
    console.error('RSS ingest error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

// POST: Trigger AI processing for pending items
export async function POST(request) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 503 }
      );
    }

    // Get pending items
    const { data: pendingItems, error } = await supabase
      .from('intelligence_items')
      .select('*')
      .eq('status', 'pending')
      .eq('processed_by_gemini', false)
      .order('created_at', { ascending: true })
      .limit(10);

    if (error) {
      throw new Error(`Failed to fetch pending items: ${error.message}`);
    }

    if (!pendingItems?.length) {
      return NextResponse.json({ success: true, message: 'No pending items', processed: 0 });
    }

    // Queue items for AI processing
    const queueInserts = pendingItems.map(item => ({
      item_id: item.id,
      stage: item.processed_by_groq ? 'gemini_explain' : 'groq_parse',
      status: 'pending',
    }));

    await supabase.from('intelligence_queue').insert(queueInserts);

    return NextResponse.json({
      success: true,
      queued: pendingItems.length,
      message: `Queued ${pendingItems.length} items for AI processing`,
    });

  } catch (error) {
    console.error('Queue error:', error);
    return NextResponse.json(
      { error: 'Failed to queue items', details: error.message },
      { status: 500 }
    );
  }
}
