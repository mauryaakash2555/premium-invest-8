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

// OpenAI client - initialized lazily to avoid build errors if package not installed
let openai = null;

async function getOpenAI() {
  if (!openai && process.env.OPENAI_API_KEY) {
    try {
      const { default: OpenAI } = await import('openai');
      openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    } catch (e) {
      console.warn('OpenAI package not available');
    }
  }
  return openai;
}

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

    // Generate with OpenAI (if available)
    const client = await getOpenAI();
    if (!client) {
      // Return fallback if OpenAI not configured
      return NextResponse.json(getFallback(type));
    }

    const completion = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `${prompt}\n\nContext:\n${contextString}` },
      ],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in response');
    }

    const result = JSON.parse(content);

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
