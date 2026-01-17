/**
 * AI Explain API - Generate dynamic content for headline modals
 * @file app/api/live-intelligence/explain/route.js
 * 
 * ROLE: Generate educational, SEBI-safe explanations for any headline
 * Uses Gemini Flash for fast, cost-effective generation
 */

import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * POST - Generate AI explanation for a headline
 * Body: { headline, category, whyItMatters?, dataPoint?, source? }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { headline, category, whyItMatters, dataPoint, source } = body;

    if (!headline) {
      return NextResponse.json({ error: 'Headline required' }, { status: 400 });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;

    if (!geminiApiKey) {
      // Fallback: Generate basic content from available data
      return NextResponse.json({
        ok: true,
        source: 'fallback',
        content: generateFallbackContent(headline, category, whyItMatters, dataPoint),
      });
    }

    // Build AI prompt - designed to generate MEANINGFUL content, not generic fluff
    const categoryLabel = getCategoryLabel(category);
    const prompt = `You are a SEBI-compliant financial educator writing for educated Indian retail investors who want to UNDERSTAND news, not just read it.

HEADLINE: "${headline}"
CATEGORY: ${categoryLabel}
${whyItMatters ? `ADDITIONAL CONTEXT: ${whyItMatters}` : ''}
${dataPoint ? `KEY DATA: ${dataPoint}` : ''}
${source ? `SOURCE: ${source}` : ''}

Generate EXACTLY 5 sections. Each section must be SPECIFIC to this headline. NO generic advice.

CRITICAL RULES:
- NEVER repeat the headline text in any section
- NEVER use generic phrases like "stay informed" or "make informed decisions"
- Every sentence must ADD NEW INFORMATION
- Be specific to the news, not generic category advice

Return JSON with these 5 fields:

1. "whatHappened" - EXPLAIN what happened in 2-3 sentences. Add context the headline doesn't provide. What are the details? Who announced it? What changed? DO NOT just repeat the headline.

2. "whyItMatters" - Why should an Indian investor care? Be SPECIFIC: What sectors are affected? What does this mean for rates/valuations/earnings? 2-3 sentences with concrete implications.

3. "marketMood" - One line describing market sentiment. Examples: "Cautiously optimistic - domestic growth offsetting global concerns" or "Risk-off mode - investors moving to safety" or "Sector rotation underway - from IT to banking". Make it specific to this news.

4. "howItBenefits" - Bullet points (use • symbol) with SPECIFIC relevance to investor types:
   • For equity investors: [specific impact]
   • For debt/FD investors: [specific impact]
   • For SIP investors: [specific guidance]
   • Key takeaway: [one actionable insight]
   DO NOT write "understand this" or "stay informed" - those are useless.

5. "expertTip" - One CONCRETE tip that shows expertise. Examples:
   - "Monitor RBI's next policy meeting on [date] for rate direction"
   - "Banking sector typically moves +/- 2% on such announcements"
   - "This affects mid-cap funds more than large-cap"
   NOT just "consult an advisor" - give actual educational value.

Return ONLY valid JSON:
{
  "whatHappened": "...",
  "whyItMatters": "...",
  "marketMood": "...",
  "howItBenefits": "• For equity...\n• For debt...\n• For SIP...\n• Key takeaway...",
  "expertTip": "..."
}`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 800,
          },
        }),
      }
    );

    if (!response.ok) {
      console.error('[Explain API] Gemini error:', response.status);
      return NextResponse.json({
        ok: true,
        source: 'fallback',
        content: generateFallbackContent(headline, category, whyItMatters, dataPoint),
      });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return NextResponse.json({
        ok: true,
        source: 'fallback',
        content: generateFallbackContent(headline, category, whyItMatters, dataPoint),
      });
    }

    try {
      const content = JSON.parse(jsonMatch[0]);
      return NextResponse.json({
        ok: true,
        source: 'ai',
        content: {
          whatHappened: content.whatHappened || headline,
          whyItMatters: content.whyItMatters || whyItMatters || 'This development may impact related investments.',
          marketMood: content.marketMood || 'Market digesting this development',
          howItBenefits: content.howItBenefits || '• For equity investors: Monitor sector-specific impacts\n• For debt investors: Watch for rate implications\n• For SIP investors: Continue disciplined investing\n• Key takeaway: Assess your portfolio allocation',
          expertTip: content.expertTip || 'Review how this news affects your specific investment holdings.',
        },
      });
    } catch (parseError) {
      console.error('[Explain API] JSON parse error:', parseError);
      return NextResponse.json({
        ok: true,
        source: 'fallback',
        content: generateFallbackContent(headline, category, whyItMatters, dataPoint),
      });
    }
  } catch (error) {
    console.error('[Explain API] Error:', error);
    return NextResponse.json({ error: 'Failed to generate explanation' }, { status: 500 });
  }
}

function getCategoryLabel(category) {
  const labels = {
    mutual_funds: 'Mutual Funds',
    insurance: 'Insurance',
    sip: 'SIP',
    bonds: 'Bonds & Fixed Income',
    pms_aif: 'PMS/AIF',
    trading: 'Trading',
    fixed_income: 'Fixed Deposits',
    ipo: 'IPO',
    market: 'Markets',
    market_update: 'Market Update',
    regulatory: 'Regulatory',
    global: 'Global Markets',
    rbi: 'RBI Policy',
    sebi: 'SEBI Regulations',
    tax_insight: 'Tax Planning',
  };
  return labels[category] || 'Financial Markets';
}

function generateFallbackContent(headline, category, whyItMatters, dataPoint) {
  const categoryLabel = getCategoryLabel(category);
  
  // Generate meaningful fallback based on category
  const categoryTips = {
    mutual_funds: 'Check if this affects your fund\'s underlying holdings or sector allocation.',
    insurance: 'Review your insurance coverage in light of regulatory changes.',
    sip: 'SIP discipline helps navigate market volatility - continue your investments.',
    bonds: 'Bond yields may adjust based on interest rate expectations.',
    pms_aif: 'PMS strategies may rebalance based on market conditions.',
    trading: 'Short-term traders should watch for increased volatility.',
    fixed_income: 'FD rates follow RBI policy - monitor for changes.',
    ipo: 'IPO valuations depend on market sentiment and sector outlook.',
    market: 'Broader market direction affects all equity investments.',
    regulatory: 'Regulatory changes may require portfolio adjustments.',
    rbi: 'RBI policy affects interest rates across all fixed-income products.',
    sebi: 'SEBI rules impact how mutual funds and brokers operate.',
  };
  
  // Generate meaningful key takeaway (not source name)
  const keyTakeaways = {
    mutual_funds: 'Track NAV changes and fund performance',
    insurance: 'Review your coverage and premium payments',
    sip: 'Stick to your SIP schedule regardless of volatility',
    bonds: 'Compare yields before investing in bonds',
    pms_aif: 'Discuss rebalancing with your portfolio manager',
    trading: 'Set stop-losses to manage risk',
    fixed_income: 'Compare FD rates across banks',
    ipo: 'Assess risk before applying to new issues',
    market: 'Review your overall portfolio allocation',
    regulatory: 'Ensure investments comply with new rules',
    rbi: 'Monitor impact on loan EMIs and FD rates',
    sebi: 'Stay updated on regulatory changes',
  };
  
  const keyTakeaway = keyTakeaways[category] || 'Review your allocation to affected sectors';
  
  return {
    whatHappened: `${categoryLabel} Update: ${headline.split(' ').slice(0, 10).join(' ')}...`,
    whyItMatters: whyItMatters || `This ${categoryLabel.toLowerCase()} development affects investor decisions and market dynamics. Understanding the implications helps in portfolio management.`,
    marketMood: 'Neutral - Markets processing new information',
    howItBenefits: `• For equity investors: Assess sector exposure to ${categoryLabel.toLowerCase()}\n• For debt investors: Monitor yield movements\n• For SIP investors: Long-term discipline remains key\n• Key takeaway: ${keyTakeaway}`,
    expertTip: categoryTips[category] || `Review how ${categoryLabel.toLowerCase()} developments affect your specific holdings.`,
  };
}
