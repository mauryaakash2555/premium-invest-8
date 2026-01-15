/**
 * RSS Ingest API Route
 * 
 * ROLE: Server-side RSS fetching ONLY
 * ALLOWED: Fetch raw headlines
 * FORBIDDEN: ❌ Interpretation, ❌ Opinions
 * 
 * This is part of the fully automated pipeline:
 * RSS → Groq → Gemini → Claude → Supabase → UI
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

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
    // Optional: restrict to cron/internal calls
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // In production, verify the cron secret
    if (process.env.NODE_ENV === 'production' && cronSecret) {
      if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    // Get active RSS sources
    const { data: sources, error: sourcesError } = await supabase
      .from('rss_sources')
      .select('*')
      .eq('is_active', true);

    if (sourcesError) {
      console.error('Failed to fetch RSS sources:', sourcesError);
      // Use default sources as fallback
    }

    const activeSources = sources?.length ? sources : [
      { name: 'Moneycontrol Markets', feed_url: 'https://www.moneycontrol.com/rss/marketreports.xml', category: 'market_update' },
      { name: 'Economic Times Markets', feed_url: 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms', category: 'market_update' },
      { name: 'LiveMint Markets', feed_url: 'https://www.livemint.com/rss/markets', category: 'market_update' },
    ];

    const results = {
      fetched: 0,
      newItems: 0,
      duplicates: 0,
      errors: [],
    };

    for (const source of activeSources) {
      try {
        const items = await fetchRSSFeed(source.feed_url);
        results.fetched += items.length;

        for (const item of items) {
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
              source_name: source.name,
              source_url: item.link,
              source_hash: sourceHash,
              category: source.category,
              urgency: 'low', // Will be updated by Groq
              
              // Placeholder blocks (will be filled by Gemini)
              block_what_happened: item.title,
              block_why_it_matters: 'Processing...',
              block_where_fits: 'Processing...',
              block_who_cares: 'Processing...',
              block_signals: [],
              block_source_timestamp: `Source: ${source.name} | ${new Date(item.pubDate).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`,
              
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

        // Update last polled timestamp
        await supabase
          .from('rss_sources')
          .update({ 
            last_polled_at: new Date().toISOString(),
            error_count: 0,
            last_error: null,
          })
          .eq('id', source.id);

      } catch (sourceError) {
        results.errors.push(`${source.name}: ${sourceError.message}`);
        
        // Update error count
        if (source.id) {
          await supabase
            .from('rss_sources')
            .update({ 
              error_count: (source.error_count || 0) + 1,
              last_error: sourceError.message,
            })
            .eq('id', source.id);
        }
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
