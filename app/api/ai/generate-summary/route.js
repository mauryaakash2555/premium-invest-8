/**
 * AI Summary Generation API for Live Intelligence
 *
 * Generates AI-powered market summaries.
 * Primary: Mistral (tiered AI). Fallback: Gemini (if configured). Last fallback: deterministic JSON.
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

function getGeminiApiKey() {
  const k = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY;
  return k && String(k).trim() ? String(k).trim() : null;
}

async function geminiGenerateText({ apiKey, systemPrompt, userPrompt, maxOutputTokens = 1200 }) {
  const model = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
  const url =
    'https://generativelanguage.googleapis.com/v1beta/models/' +
    encodeURIComponent(model) +
    ':generateContent?key=' +
    encodeURIComponent(apiKey);

  const body = {
    systemInstruction: systemPrompt
      ? { role: 'system', parts: [{ text: String(systemPrompt) }] }
      : undefined,
    contents: [{ role: 'user', parts: [{ text: String(userPrompt || '') }] }],
    generationConfig: {
      temperature: 0.6,
      maxOutputTokens: Number(maxOutputTokens) || 1200,
    },
  };

  const r = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!r.ok) {
    const t = await r.text().catch(() => '');
    throw new Error(`Gemini error: ${r.status} ${t}`);
  }

  const json = await r.json();
  const text =
    json?.candidates?.[0]?.content?.parts?.map((p) => p?.text).filter(Boolean).join('') || '';
  return String(text || '').trim();
}

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

    let provider = null;
    let rawText = res?.text ? String(res.text) : '';
    if (rawText) provider = 'mistral';

    // Fallback to Gemini if Mistral isn't configured/available.
    if (!rawText) {
      const geminiKey = getGeminiApiKey();
      if (geminiKey) {
        try {
          rawText = await geminiGenerateText({ apiKey: geminiKey, systemPrompt, userPrompt: fullPrompt });
          if (rawText) provider = 'gemini';
        } catch (e) {
          console.error('[api/ai/generate-summary] Gemini fallback failed:', e);
        }
      }
    }

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
    const type = (await request.json().catch(() => ({})))?.type || 'morning';
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
