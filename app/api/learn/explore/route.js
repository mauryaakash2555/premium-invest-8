import { NextResponse } from 'next/server';
import { z } from 'zod';

import { getAIEnvSafe } from '@/config/env';
import { getAIResponse } from '@/lib/ai/provider';
import { sanitizeInput } from '@/lib/utils/validator';

const reqSchema = z.object({
  topic: z.string().min(1),
  styleId: z.string().min(1).optional(),
  followUp: z.string().optional(),
  depthHint: z.number().int().min(0).max(50).optional(),
});

function styleLabel(styleId) {
  const id = String(styleId || 'simple');
  if (id === 'simple') return 'Explain simply';
  if (id === 'story') return 'Story / analogy';
  if (id === 'visual') return 'Visual thinker';
  if (id === 'math') return 'Math & mechanics';
  if (id === 'psych') return 'Psychology & behavior';
  if (id === 'examples') return 'Real-world examples';
  if (id === 'mistakes') return 'Common mistakes';
  if (id === 'socratic') return 'Socratic';
  if (id === 'fast') return 'Fast clarity';
  if (id === 'deep') return 'Deep mastery';
  return id;
}

function buildFallbackText({ topic, styleId, followUp, depthHint }) {
  const t = String(topic || '').trim();
  const f = String(followUp || '').trim();
  const depth = Number.isFinite(depthHint) ? Math.max(0, Math.min(50, depthHint)) : 0;
  const style = String(styleId || 'simple');

  const orientation = `Let’s explore: ${t} (mode: ${styleLabel(style)}).`;

  if (style === 'socratic') {
    return (
      `${orientation}\n\n` +
      `Answer these in one line each:\n` +
      `- What do you think is the main "moving part" here (price, rates, time, risk)?\n` +
      `- What would you expect to happen in a calm market vs a stressed one?\n` +
      `- What would make your view change?\n\n` +
      `Would you like to go deeper, see an example, or switch styles?`
    );
  }

  if (style === 'math') {
    return (
      `${orientation}\n\n` +
      `A compact mechanics lens:\n` +
      `- Identify inputs (rates, price, time, volatility, cashflows).\n` +
      `- Map sensitivity: "if X ↑ then Y tends to …"\n` +
      `- Sanity-check extremes (best/worst-case).\n` +
      `- Depth hint: ${depth} (we can add detail step-by-step).\n\n` +
      `Would you like to go deeper, see an example, or switch styles?`
    );
  }

  if (style === 'examples') {
    return (
      `${orientation}\n\n` +
      `One concrete example pattern:\n` +
      `- Start with a simple number setup (₹1,00,000; 1 year; one key rate/price move).\n` +
      `- Walk through the "before" and "after" in 2-3 steps.\n` +
      `- Note what you’d watch in real life (fees, taxes, liquidity, risk).\n\n` +
      `Would you like to go deeper, see an example, or switch styles?`
    );
  }

  if (style === 'mistakes') {
    return (
      `${orientation}\n\n` +
      `Common mistakes to watch for:\n` +
      `- Confusing "risk" with "temporary price movement."\n` +
      `- Ignoring the time horizon (weeks vs years changes the answer).\n` +
      `- Overfitting to one recent market regime.\n` +
      `- Skipping the simplest explanation first.\n\n` +
      `Would you like to go deeper, see an example, or switch styles?`
    );
  }

  if (style === 'story') {
    return (
      `${orientation}\n\n` +
      `Analogy:\n` +
      `- Think of it like adjusting a "knob" in a room: small turns change comfort slowly, big turns change it fast.\n` +
      `- Markets often move on expectations of the next knob turn, not just the turn itself.\n\n` +
      `Would you like to go deeper, see an example, or switch styles?`
    );
  }

  if (style === 'fast') {
    return (
      `${orientation}\n\n` +
      `Takeaway-first:\n` +
      `- Name the single most important driver.\n` +
      `- List the 2 biggest risks to that driver.\n` +
      `- Decide what evidence would confirm/deny your view.\n\n` +
      `Would you like to go deeper, see an example, or switch styles?`
    );
  }

  if (style === 'deep') {
    const extra = depth >= 2 ? `\n- Add the next layer: constraints, incentives, second-order effects.` : '';
    return (
      `${orientation}\n\n` +
      `Deep mastery, stepwise:\n` +
      `- First: define the object clearly (instrument/strategy/decision).\n` +
      `- Next: identify the key trade-off (return vs risk vs time).\n` +
      `- Then: test with one scenario (good) + one scenario (bad).` +
      `${extra}\n\n` +
      `Would you like to go deeper, see an example, or switch styles?`
    );
  }

  // simple / visual / psych / unknown
  const follow = f ? `\n\nYou said: "${f}"` : '';
  return (
    `${orientation}\n\n` +
    `A calm starting map:\n` +
    `- What it is (in one sentence).\n` +
    `- Why it moves (the main driver).\n` +
    `- What can surprise you (one risk).\n` +
    `- One practical check (what to look up / measure).` +
    `${follow}\n\n` +
    `Would you like to go deeper, see an example, or switch styles?`
  );
}

function buildSystemPrompt({ styleId, depthHint }) {
  const style = String(styleId || 'simple');
  const depth = Number.isFinite(depthHint) ? depthHint : 0;

  return (
    `You are BM Wealth's learning sanctuary.\n` +
    `This is NOT a course, NOT a syllabus, NOT a chatbot transcript.\n` +
    `The user asked a topic; you respond gently in the requested style.\n\n` +
    `Hard rules:\n` +
    `- No predefined topic lists.\n` +
    `- No learning paths, modules, progress, levels, completion language.\n` +
    `- No pressure language.\n` +
    `- No walls of text: keep it tight, calm, and scannable.\n` +
    `- Progressive reveal: provide only the next useful slice.\n` +
    `- Always include ONE gentle follow-up question at the end.\n\n` +
    `Style: ${style}\n` +
    `Depth hint: ${depth} (0 = overview, higher = more depth, but still concise)\n\n` +
    `Output format:\n` +
    `- Start with a 1-sentence orientation.\n` +
    `- Then 3-6 short bullets or micro-sections (1-3 lines each).\n` +
    `- End with: "Would you like to go deeper, see an example, or switch styles?"`);
}

function buildUserMessage({ topic, followUp }) {
  const t = String(topic || '').trim();
  const f = String(followUp || '').trim();
  if (!f) return `Topic: ${t}`;
  return `Topic: ${t}\n\nFollow-up command: ${f}`;
}

export async function POST(request) {
  try {
    const json = await request.json().catch(() => null);
    const parsed = reqSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'invalid_request' }, { status: 400 });
    }

    const topic = sanitizeInput(String(parsed.data.topic || ''));
    const followUp = sanitizeInput(String(parsed.data.followUp || ''));
    const styleId = String(parsed.data.styleId || 'simple');
    const depthHint = Number.isFinite(parsed.data.depthHint) ? parsed.data.depthHint : 0;

    const aiEnv = getAIEnvSafe();
    if (!aiEnv) {
      const isProd = process.env.NODE_ENV === 'production';
      if (isProd) {
        return NextResponse.json(
          {
            ok: false,
            error: 'ai_unavailable',
          },
          { status: 503 }
        );
      }

      const text = buildFallbackText({ topic, styleId, followUp, depthHint });
      return NextResponse.json({ ok: true, text, provider: null, fallback: true });
    }

    const system = buildSystemPrompt({ styleId, depthHint });
    const message = buildUserMessage({ topic, followUp });

    const res = await getAIResponse({
      message,
      conversationHistory: [],
      system,
      userType: 'public',
      keys: aiEnv,
      groq: { maxTokens: 700, temperature: 0.45 },
      gemini: { maxTokens: 700, temperature: 0.45 },
    });

    if (res?.error) {
      return NextResponse.json({ ok: false, error: res.error }, { status: 502 });
    }

    const text = String(res?.reply || '').trim();
    return NextResponse.json({ ok: true, text, provider: res.provider || null });
  } catch (e) {
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
