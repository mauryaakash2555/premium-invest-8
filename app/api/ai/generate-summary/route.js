/**
 * AI Summary Generation API for Live Intelligence
 *
 * Generates AI-powered market summaries.
 * Provider order: Groq → Gemini → deterministic fallback.
 *
 * @file app/api/ai/generate-summary/route.js
 * @created January 13, 2026
 */

import { NextResponse } from 'next/server';
import { getAIEnvSafe } from '@/config/env';
import { getAIResponse } from '@/lib/ai/provider';

// Cache for generated summaries (to avoid repeated calls)
const summaryCache = new Map();
const CACHE_TTL = 30 * 60 * 1000; // 30 minutes

export const dynamic = 'force-dynamic';

function extractJsonObject(text) {
  const jsonMatch = String(text || '').match(/\{[\s\S]*\}/);
  if (!jsonMatch) return null;
  try {
    return JSON.parse(jsonMatch[0]);
  } catch {
    return null;
  }
}

/**
 * POST - Generate AI summary
 */
export async function POST(request) {
  let payload;
  try {
    payload = await request.json();
    const { type, prompt, context, systemPrompt } = payload || {};

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

    const fullPrompt = `${prompt}\n\nContext:\n${contextString}`;

    const env = getAIEnvSafe();
    const ai = await getAIResponse({
      message: fullPrompt,
      conversationHistory: [],
      system: String(systemPrompt || ''),
      context: null,
      userType: 'public',
      keys: {
        GROQ_API_KEY: env?.GROQ_API_KEY,
        GEMINI_API_KEY: env?.GEMINI_API_KEY,
        ANTHROPIC_API_KEY: env?.ANTHROPIC_API_KEY,
      },
      groq: { maxTokens: 900, temperature: 0.6 },
      gemini: { maxTokens: 1200, temperature: 0.6 },
    });

    const provider = ai?.provider || null;
    const rawText = ai?.reply ? String(ai.reply) : '';

    const result = extractJsonObject(rawText);
    if (!result) {
      return NextResponse.json(getFallback(type), {
        headers: { 'x-ai-provider': provider || 'fallback' },
      });
    }

    // Cache result
    summaryCache.set(cacheKey, {
      data: result,
      timestamp: Date.now(),
    });

    return NextResponse.json(result, {
      headers: { 'x-ai-provider': provider || 'unknown' },
    });
  } catch (error) {
    console.error('AI summary generation failed:', error);

    // Return fallback based on type
    const type = payload?.type || 'morning';
    return NextResponse.json(getFallback(type), {
      headers: { 'x-ai-provider': 'fallback' },
    });
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
