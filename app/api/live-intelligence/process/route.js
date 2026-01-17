/**
 * AI Processing Pipeline API Route
 * 
 * PIPELINE STAGES:
 * 1. Groq → dedupe, tag, classify (ALLOWED: Clean, dedupe, tag | FORBIDDEN: ❌ Opinions)
 * 2. Gemini → "What happened" + "Why it matters" (ALLOWED: Explain | FORBIDDEN: ❌ Future tense)
 * 3. Claude → sanitize language ONLY if flagged (ALLOWED: Rewrite | FORBIDDEN: ❌ Add insight)
 * 
 * HARD RULES:
 * - If compliance fails → auto-sanitize
 * - If still fails → DROP item
 * - No human approval
 * - No regeneration on page load
 * - Content is static once stored
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

// Groq API for classification
async function processWithGroq(item) {
  const groqApiKey = process.env.GROQ_API_KEY;
  if (!groqApiKey) {
    console.warn('GROQ_API_KEY not set, using fallback classification');
    return {
      category: item.category || 'market_update',
      urgency: 'medium',
      tags: [],
      isDuplicate: false,
    };
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [
          {
            role: 'system',
            content: `You are a financial news classifier for a NON-SEBI registered platform.

🔒 LEGAL COMPLIANCE (CRITICAL - NON-NEGOTIABLE):
We are NOT SEBI registered. You MUST NEVER generate:
- Buy/Sell/Hold recommendations
- "Should invest", "consider buying"
- Future predictions: "will go up", "expected to rise", "target price"
- Any investment advice whatsoever

Your ONLY job is to:
1. Classify the category (market_update, policy_change, economic_indicator, corporate_action, global_market, commodity, currency, regulatory)
2. Assess urgency (critical, high, medium, low)
3. Extract relevant tags

FORBIDDEN: Do NOT add opinions, interpretations, or recommendations.

Respond in JSON format only:
{
  "category": "string",
  "urgency": "string", 
  "tags": ["string"],
  "isDuplicate": false
}`
          },
          {
            role: 'user',
            content: `Classify this headline:\nTitle: ${item.block_what_happened}\nSource: ${item.source_name}`
          }
        ],
        temperature: 0.1,
        max_tokens: 200,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content || '{}';
    
    // Parse JSON response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return { category: item.category, urgency: 'medium', tags: [], isDuplicate: false };
  } catch (error) {
    console.error('Groq processing error:', error);
    return { category: item.category || 'market_update', urgency: 'medium', tags: [], isDuplicate: false };
  }
}

// Gemini API for explanation generation
async function processWithGemini(item, groqResult) {
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  if (!geminiApiKey) {
    console.warn('GEMINI_API_KEY not set, using placeholder content');
    return generateFallbackContent(item, groqResult);
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `You are a financial educator for BM Wealth, a NON-SEBI registered platform in India.

🔒 CRITICAL LEGAL COMPLIANCE (VIOLATION = LEGAL TROUBLE):
We are NOT a SEBI registered investment advisor. You MUST NEVER generate:
❌ "Buy", "Sell", "Hold", "Invest", "Avoid"
❌ "Should", "recommend", "suggest", "consider"
❌ "Will go up", "expected to rise", "likely to fall"
❌ "Target price", "forecast", "prediction"
❌ ANY future tense about market movements or returns
❌ ANY investment advice or recommendations

✅ ALLOWED (EDUCATIONAL ONLY):
✅ Past tense: "happened", "occurred", "moved", "changed"
✅ Present tense facts: "is trading at", "stands at"
✅ Educational explanations of concepts and mechanisms
✅ Historical context and factual data
✅ Persona identification (who may find this relevant)

RULES:
- FACTUAL and EDUCATIONAL only
- Each block must be 1-3 sentences
- If unsure, be MORE conservative

NEWS: ${item.block_what_happened}
SOURCE: ${item.source_name}
CATEGORY: ${groqResult.category}

Generate JSON with these exact fields:
{
  "what_happened": "Pure facts about what occurred. Past or present tense only.",
  "why_it_matters": "Educational explanation of the concept and mechanism. No advice.",
  "where_fits": "Affects: [list relevant areas like Mutual Funds, SIPs, FDs, Insurance, etc.]",
  "who_cares": "[List personas like Long-term investors, SIP investors, Conservative allocators, etc.]"
}

Respond with JSON only, no other text.`
            }]
          }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 500,
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    // Parse JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        block_what_happened: parsed.what_happened || item.block_what_happened,
        block_why_it_matters: parsed.why_it_matters || 'Educational context pending.',
        block_where_fits: parsed.where_fits || `Affects: ${getCategoryAreas(groqResult.category)}`,
        block_who_cares: parsed.who_cares || getDefaultPersonas(groqResult.category),
      };
    }

    return generateFallbackContent(item, groqResult);
  } catch (error) {
    console.error('Gemini processing error:', error);
    return generateFallbackContent(item, groqResult);
  }
}

// Claude API for compliance sanitization (only if flagged)
async function sanitizeWithClaude(item) {
  const claudeApiKey = process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY;
  if (!claudeApiKey) {
    console.warn('CLAUDE_API_KEY not set, skipping sanitization');
    return item;
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        messages: [{
          role: 'user',
          content: `🔒 CRITICAL: Sanitize this financial content for SEBI compliance.

BM Wealth is NOT a SEBI registered investment advisor. Any non-compliant content could cause LEGAL TROUBLE.

❌ MUST REMOVE/REWRITE (AUTO-REJECT TRIGGERS):
- "Buy", "Sell", "Hold", "Invest", "Avoid" (any form)
- "Should", "recommend", "suggest", "consider investing"
- "Will go up", "expected to rise", "likely to fall", "target price"
- "Forecast", "prediction", "outlook is positive/negative"
- ANY future tense about returns or market direction
- ANY investment advice or recommendations

✅ ALLOWED (KEEP UNCHANGED):
- Past tense facts: "rose", "fell", "announced", "changed"
- Present tense facts: "is trading at", "currently stands at"
- Educational explanations of mechanisms and concepts
- Historical data and context

INSTRUCTIONS:
1. If content is compliant → return unchanged, is_compliant: true
2. If content can be rewritten to be compliant → rewrite it, changes_made: true
3. If content CANNOT be made compliant (pure advice) → set should_drop: true

Content to check:
What happened: ${item.block_what_happened}
Why it matters: ${item.block_why_it_matters}

Return JSON:
{
  "what_happened": "sanitized or original text",
  "why_it_matters": "sanitized or original text",
  "is_compliant": true/false,
  "changes_made": true/false,
  "should_drop": true/false (set true ONLY if content cannot be made compliant)
}`
        }],
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        ...item,
        block_what_happened: parsed.what_happened || item.block_what_happened,
        block_why_it_matters: parsed.why_it_matters || item.block_why_it_matters,
        sanitized_by_claude: parsed.changes_made || false,
        compliance_flagged: !parsed.is_compliant,
      };
    }

    return item;
  } catch (error) {
    console.error('Claude sanitization error:', error);
    return item;
  }
}

// Fallback content generator
function generateFallbackContent(item, groqResult) {
  return {
    block_what_happened: item.block_what_happened,
    block_why_it_matters: 'This development relates to market activity and financial conditions. Check the source for detailed information.',
    block_where_fits: `Affects: ${getCategoryAreas(groqResult?.category || item.category)}`,
    block_who_cares: getDefaultPersonas(groqResult?.category || item.category),
  };
}

function getCategoryAreas(category) {
  const mapping = {
    'market_update': 'Equity portfolios, Mutual Funds, SIPs',
    'policy_change': 'All investment products, Tax planning',
    'economic_indicator': 'Long-term portfolios, Debt funds, FDs',
    'corporate_action': 'Stock portfolios, Sector funds',
    'global_market': 'International funds, Multi-asset portfolios',
    'commodity': 'Gold investments, Commodity funds',
    'currency': 'International investments, Import-export businesses',
    'regulatory': 'All financial products, Compliance',
  };
  return mapping[category] || 'General portfolios';
}

function getDefaultPersonas(category) {
  const mapping = {
    'market_update': 'Active investors, Traders, SIP investors',
    'policy_change': 'All investors, Tax planners, Advisors',
    'economic_indicator': 'Long-term investors, Conservative allocators',
    'corporate_action': 'Stock investors, Sector-focused investors',
    'global_market': 'Diversified investors, International fund holders',
    'commodity': 'Gold investors, Inflation hedgers',
    'currency': 'International investors, Importers/Exporters',
    'regulatory': 'All market participants',
  };
  return mapping[category] || 'General investors';
}

function getDefaultSignals(category, urgency) {
  const signals = [];
  
  if (urgency === 'low' || urgency === 'medium') {
    signals.push({ key: 'risk_unchanged', label: 'Risk score unchanged' });
    signals.push({ key: 'no_rebalancing', label: 'No rebalancing alerts' });
  }
  
  if (urgency === 'high' || urgency === 'critical') {
    signals.push({ key: 'volatility_high', label: 'Volatility elevated' });
  } else {
    signals.push({ key: 'volatility_moderate', label: 'Volatility moderate' });
  }

  return signals;
}

// Main processing endpoint
export async function POST(request) {
  try {
    const { itemId, processAll } = await request.json().catch(() => ({}));

    let itemsToProcess = [];

    if (itemId) {
      // Process specific item
      const { data } = await supabase
        .from('intelligence_items')
        .select('*')
        .eq('id', itemId)
        .single();
      
      if (data) itemsToProcess = [data];
    } else if (processAll) {
      // Process all pending items
      const { data } = await supabase
        .from('intelligence_items')
        .select('*')
        .eq('status', 'pending')
        .eq('processed_by_gemini', false)
        .order('created_at', { ascending: true })
        .limit(20);
      
      itemsToProcess = data || [];
    }

    if (!itemsToProcess.length) {
      return NextResponse.json({ success: true, message: 'No items to process', processed: 0 });
    }

    const results = { processed: 0, published: 0, dropped: 0, errors: [] };

    for (const item of itemsToProcess) {
      try {
        // Stage 1: Groq classification
        const groqResult = await processWithGroq(item);
        
        if (groqResult.isDuplicate) {
          await supabase
            .from('intelligence_items')
            .update({ status: 'dropped', compliance_notes: 'Duplicate detected' })
            .eq('id', item.id);
          results.dropped++;
          continue;
        }

        // Stage 2: Gemini explanation
        const geminiResult = await processWithGemini(item, groqResult);

        // Stage 3: Compliance check (auto-sanitize if needed)
        let finalContent = {
          ...item,
          ...geminiResult,
          category: groqResult.category,
          urgency: groqResult.urgency,
          block_signals: getDefaultSignals(groqResult.category, groqResult.urgency),
          processed_by_groq: true,
          processed_by_gemini: true,
        };

        // Check for compliance issues
        const hasAdvice = /should|recommend|buy|sell|invest now/i.test(
          `${finalContent.block_what_happened} ${finalContent.block_why_it_matters}`
        );
        const hasFuture = /will|would|could|might|may|going to/i.test(
          finalContent.block_why_it_matters
        );

        if (hasAdvice || hasFuture) {
          finalContent = await sanitizeWithClaude(finalContent);
          
          // If still non-compliant after sanitization, drop
          const stillBad = /should|recommend|buy|sell|invest now/i.test(
            `${finalContent.block_what_happened} ${finalContent.block_why_it_matters}`
          );
          
          if (stillBad) {
            await supabase
              .from('intelligence_items')
              .update({ 
                status: 'dropped', 
                compliance_notes: 'Failed compliance after sanitization',
                compliance_flagged: true,
              })
              .eq('id', item.id);
            results.dropped++;
            continue;
          }
        }

        // Publish the item
        const { error: updateError } = await supabase
          .from('intelligence_items')
          .update({
            ...finalContent,
            status: 'published',
            published_at: new Date().toISOString(),
          })
          .eq('id', item.id);

        if (updateError) {
          results.errors.push(`Update error for ${item.id}: ${updateError.message}`);
        } else {
          results.published++;
        }

        results.processed++;
      } catch (itemError) {
        results.errors.push(`Processing error for ${item.id}: ${itemError.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      ...results,
    });

  } catch (error) {
    console.error('Pipeline error:', error);
    return NextResponse.json(
      { error: 'Pipeline failed', details: error.message },
      { status: 500 }
    );
  }
}

// GET: Fetch published items OR trigger processing (for Vercel Cron)
export async function GET(request) {
  try {
    // Check if this is a cron request (has authorization header)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    // If cron request, trigger processing
    if (authHeader && cronSecret && authHeader === `Bearer ${cronSecret}`) {
      // Process all pending items (same as POST with processAll)
      const { data: itemsToProcess } = await supabase
        .from('intelligence_items')
        .select('*')
        .eq('status', 'pending')
        .eq('processed_by_gemini', false)
        .order('created_at', { ascending: true })
        .limit(20);
      
      if (!itemsToProcess?.length) {
        return NextResponse.json({ success: true, message: 'No items to process', processed: 0, cron: true });
      }
      
      const results = { processed: 0, published: 0, dropped: 0, errors: [] };
      
      for (const item of itemsToProcess) {
        try {
          const groqResult = await processWithGroq(item);
          if (groqResult.isDuplicate) { results.dropped++; continue; }
          
          const geminiResult = await processWithGemini(item, groqResult);
          const finalContent = await checkCompliance(item, geminiResult);
          
          if (!finalContent) { results.dropped++; continue; }
          
          await supabase
            .from('intelligence_items')
            .update({
              ...finalContent,
              category: groqResult.category,
              urgency: groqResult.urgency,
              tags: groqResult.tags,
              status: 'published',
              processed_by_groq: true,
              processed_by_gemini: true,
              published_at: new Date().toISOString(),
            })
            .eq('id', item.id);
          
          results.processed++;
          results.published++;
        } catch (err) {
          results.errors.push(err.message);
        }
      }
      
      return NextResponse.json({ success: true, ...results, cron: true });
    }
    
    // Regular GET: fetch published items
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    let query = supabase
      .from('intelligence_items')
      .select('*')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(limit);

    if (category && category !== 'all') {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      items: data || [],
      count: data?.length || 0,
    });

  } catch (error) {
    console.error('Fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch items', details: error.message },
      { status: 500 }
    );
  }
}
