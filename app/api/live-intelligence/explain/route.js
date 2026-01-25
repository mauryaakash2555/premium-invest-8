/**
 * AI Explain API - Generate dynamic content for headline modals
 * @file app/api/live-intelligence/explain/route.js
 * 
 * ROLE: Generate educational, SEBI-safe explanations for any headline
 * Uses Gemini Flash for fast, cost-effective generation
 */

import { NextResponse } from 'next/server';

import { mistralChat } from '@/lib/ai/tiered';

export const dynamic = 'force-dynamic';

/**
 * POST - Generate AI explanation for a headline
 * Body: { headline, category, whyItMatters?, dataPoint?, source?, url?, trustLabel?, trustScore?, opportunityScore?, riskLevel?, userContext? }
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const {
      headline,
      category,
      whyItMatters,
      dataPoint,
      source,
      url,
      trustLabel,
      trustScore,
      opportunityScore,
      riskLevel,
      userContext,
    } = body;

    if (!headline) {
      return NextResponse.json({ error: 'Headline required' }, { status: 400 });
    }

    // Tier 2 — Shared Intelligence: Mistral (cached where appropriate)
    // If key isn't configured, fall back to deterministic content.

    // Build AI prompt - designed to generate MEANINGFUL content, not generic fluff
    const categoryLabel = getCategoryLabel(category);
    const prompt = `You are a SEBI-compliant financial educator writing for educated Indian retail investors who want to UNDERSTAND news, not just read it.

HEADLINE: "${headline}"
CATEGORY: ${categoryLabel}
${whyItMatters ? `ADDITIONAL CONTEXT: ${whyItMatters}` : ''}
${dataPoint ? `KEY DATA: ${dataPoint}` : ''}
${source ? `SOURCE: ${source}` : ''}
${url ? `SOURCE URL: ${url}` : ''}
${trustLabel ? `SOURCE TRUST LABEL: ${trustLabel}` : ''}
${typeof trustScore === 'number' ? `SOURCE TRUST SCORE: ${trustScore}` : ''}
${typeof opportunityScore === 'number' ? `OPPORTUNITY SCORE (heuristic): ${opportunityScore}` : ''}
${riskLevel ? `RISK LEVEL (heuristic): ${riskLevel}` : ''}
${userContext ? `USER CONTEXT (non-PII): ${JSON.stringify(userContext).slice(0, 900)}` : ''}

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

    const res = await mistralChat({
      prompt,
      temperature: 0.3,
      maxTokens: 900,
    });

    const whyThisMattersToYou = generateWhyThisMattersToYou({
      headline,
      category,
      userContext,
      opportunityScore,
      riskLevel,
      trustLabel,
      trustScore,
      url,
    });

    if (!res?.text) {
      return NextResponse.json({
        ok: true,
        source: 'fallback',
        content: {
          ...generateFallbackContent(headline, category, whyItMatters, dataPoint),
          whyThisMattersToYou,
        },
      });
    }

    const text = res.text;

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
        provider: res.provider,
        content: {
          whatHappened: content.whatHappened || headline,
          whyItMatters: content.whyItMatters || whyItMatters || 'This development may impact related investments.',
          marketMood: content.marketMood || 'Market digesting this development',
          howItBenefits: content.howItBenefits || '• For equity investors: Monitor sector-specific impacts\n• For debt investors: Watch for rate implications\n• For SIP investors: Continue disciplined investing\n• Key takeaway: Assess your portfolio allocation',
          expertTip: content.expertTip || 'Review how this news affects your specific investment holdings.',
          whyThisMattersToYou,
        },
      });
    } catch (parseError) {
      console.error('[Explain API] JSON parse error:', parseError);
      return NextResponse.json({
        ok: true,
        source: 'fallback',
        content: {
          ...generateFallbackContent(headline, category, whyItMatters, dataPoint),
          whyThisMattersToYou,
        },
      });
    }
  } catch (error) {
    console.error('[Explain API] Error:', error);
    return NextResponse.json({ error: 'Failed to generate explanation' }, { status: 500 });
  }
}

function generateWhyThisMattersToYou({ headline, category, userContext, opportunityScore, riskLevel, trustLabel, trustScore, url }) {
  const title = String(headline || '').toLowerCase();
  const cat = String(category || '').toLowerCase();
  const uc = userContext && typeof userContext === 'object' ? userContext : null;

  const portfolio = uc?.portfolio && typeof uc.portfolio === 'object' ? uc.portfolio : null;
  const tickers = Array.isArray(portfolio?.tickers) ? portfolio.tickers : [];
  const sectors = Array.isArray(portfolio?.sectors) ? portfolio.sectors : [];
  const style = String(portfolio?.style || '').trim().toLowerCase();

  const matchedTickers = tickers
    .filter((t) => t && title.includes(String(t).toLowerCase()))
    .slice(0, 3);
  const matchedSectors = sectors
    .filter((s) => s && title.includes(String(s).toLowerCase()))
    .slice(0, 2);

  const topCats = Array.isArray(uc?.topCategories) ? uc.topCategories : [];
  const savedCats = Array.isArray(uc?.savedCategories) ? uc.savedCategories : [];
  const followsThis = (cat && topCats.includes(cat)) || (cat && savedCats.includes(cat));

  const risk = String(riskLevel || '').toLowerCase();
  const opp = typeof opportunityScore === 'number' ? opportunityScore : null;

  const trust = String(trustLabel || '').toLowerCase();
  const trustLine =
    trust === 'official'
      ? 'This is from an official source.'
      : trust === 'reputable'
        ? 'This is from a reputable source.'
        : trust === 'community'
          ? 'This is circulating via community/social sources — treat as unconfirmed until verified.'
          : typeof trustScore === 'number'
            ? `Source trust signal: ${trustScore}/100.`
            : null;

  let core = null;
  if (matchedTickers.length) {
    core = `Because you may hold or track ${matchedTickers.join(', ')}, this update can influence price action, sentiment, or near-term volatility for those names.`;
  } else if (matchedSectors.length) {
    core = `Because you have exposure/interest in ${matchedSectors.join(' & ')}, this can matter for sector sentiment and near-term positioning.`;
  } else if (style) {
    core = style.includes('sip')
      ? 'If you are primarily a SIP investor, the key is whether this changes your conviction or asset allocation — not one-day price moves.'
      : style.includes('trader')
        ? 'If you trade actively, this can change intraday volatility and the risk/reward of short-term setups.'
        : style.includes('income')
          ? 'If you prefer income-focused allocations, watch whether this impacts rates, yields, and credit spreads.'
          : null;
  }

  if (!core && followsThis) {
    core = `You’ve been following ${cat || 'this'} updates, so this is likely relevant to your usual watchlist and decision-making cadence.`;
  }

  if (!core) {
    const byCategory = {
      mutual_funds: 'If you hold mutual funds, the key is whether this changes sector leadership or fund performance drivers over the next few quarters.',
      sip: 'If you do SIPs, the key is whether this affects long-term return expectations or requires rebalancing — not short-term noise.',
      fixed_income: 'If you use FDs/debt funds, this matters via rate expectations and how quickly banks reprice deposits and loans.',
      bonds: 'If you hold bonds/debt funds, this matters via yields and duration sensitivity (prices move opposite to yields).',
      rbi: 'RBI moves can quickly impact loan EMIs, FD rates, and bond fund NAVs — it’s directly portfolio-relevant.',
      sebi: 'SEBI changes can affect product rules, broker practices, and risk disclosures — relevant to how you execute investments.',
      insurance: 'Insurance updates matter if they change premiums, claim rules, or product features affecting your coverage plan.',
      market: 'This matters if it changes market breadth/leadership and your risk exposure in equities.',
      global: 'This matters if it spills over into INR, crude, global risk sentiment, and therefore Indian equity/debt positioning.',
    };
    core = byCategory[cat] || 'This matters if it changes expected returns, risk, or execution rules for your portfolio.';
  }

  const action =
    risk === 'high'
      ? 'Given the elevated risk signal, consider de-risking exposures, tightening stop-losses, or avoiding leverage until clarity improves.'
      : opp != null && opp >= 70
        ? 'Given the opportunity signal, consider adding this theme to your watchlist and checking your exposure before acting.'
        : null;

  const sourceHint = url ? 'You can verify quickly via the source link.' : null;

  return [core, action, trustLine, sourceHint].filter(Boolean).join(' ');
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
