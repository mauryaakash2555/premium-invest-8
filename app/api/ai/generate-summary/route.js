/**
 * AI Summary Generation API for Live Intelligence
 * 
 * Generates AI-powered market summaries using OpenAI.
 * Used for morning briefings and night summaries.
 * 
 * @file app/api/ai/generate-summary/route.js
 * @created January 13, 2026
 */

import { NextResponse } from 'next/server';

import { mistralChat } from '@/lib/ai/tiered';

// Cache for generated summaries (to avoid repeated calls)
const summaryCache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export const dynamic = 'force-dynamic';

/**
 * POST - Generate AI summary
 */
export async function POST(request) {
  try {
    const { type, prompt, context, systemPrompt } = await request.json();

    if (!type || !prompt) {
      return NextResponse.json(
        { error: 'Missing type or prompt' },
        { status: 400 }
      );
    }

    // Check cache
    const cacheKey = `${type}-${new Date().toDateString()}`;
    const cached = summaryCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data);
    }

    // Build context string
    let contextString = '';
    if (context) {
      if (context.marketData) {
        contextString += `\nCurrent Market Data:\n${JSON.stringify(context.marketData, null, 2)}`;
      }
      if (context.headlines) {
        contextString += `\nRecent Headlines:\n${context.headlines.map(h => `- ${h.headline}`).join('\n')}`;
      }
    }

    // Tier 2 — Shared Intelligence: Mistral (cache first, then generate)
    const fullPrompt = `${prompt}\n\nContext:\n${contextString}`;
    const res = await mistralChat({
      system: systemPrompt,
      prompt: fullPrompt,
      temperature: 0.7,
      maxTokens: 1100,
    });

    if (!res?.text) {
      return NextResponse.json(getFallback(type));
    }

    // Extract JSON from response (robust to minor formatting)
    const jsonMatch = String(res.text).match(/\{[\s\S]*\}/);
    if (!jsonMatch) return NextResponse.json(getFallback(type));

    const result = JSON.parse(jsonMatch[0]);

    // Cache result
    summaryCache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('AI summary generation failed:', error);

    // Return fallback based on type
    const type = (await request.json().catch(() => ({})))?.type || 'morning';
    return NextResponse.json(getFallback(type));
  }
}

/**
 * Get fallback summary when AI fails
 */
function getFallback(type) {
  const date = new Date().toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (type === 'morning') {
    return {
      title: `Morning Briefing - ${date}`,
      globalCues: [
        { text: 'US markets closed mixed', sentiment: 'neutral' },
        { text: 'Asian markets flat to positive', sentiment: 'neutral' },
      ],
      keyEvents: [
        { time: '9:15 AM', event: 'Market opens' },
      ],
      sectorWatch: [
        { sector: 'Banking', outlook: 'Range-bound expected' },
      ],
      riskFactors: ['Global cues remain key'],
      overallTone: 'neutral',
      isFallback: true,
    };
  }

  return {
    title: `What You Missed Today - ${date}`,
    marketSummary: {
      nifty: { close: '--', change: '--', changePercent: '--' },
      sensex: { close: '--', change: '--', changePercent: '--' },
      trend: 'neutral',
    },
    topHeadlines: [
      { headline: 'Markets traded in a range', impact: 'Neutral' },
    ],
    fiiDii: { fii: '--', dii: '--', trend: '--' },
    keyTakeaways: ['Awaiting fresh triggers'],
    tomorrowWatch: [],
    overallTone: 'neutral',
    isFallback: true,
  };
}
