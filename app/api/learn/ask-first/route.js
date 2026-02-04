import { NextResponse } from 'next/server';
import { z } from 'zod';

import { createSession, step as engineStep } from '@/lib/learning/learningEngine';

export const dynamic = 'force-dynamic';

function clamp(n, min, max) {
  const v = Number(n);
  if (!Number.isFinite(v)) return min;
  return Math.max(min, Math.min(max, v));
}

function stripControlChars(s) {
  return String(s || '').replace(/[\u0000-\u001F\u007F]/g, '');
}

function safeTopic(topic) {
  // Topic integrity: never normalize/rewrite beyond removing control chars.
  return stripControlChars(topic);
}

function stableHash(input) {
  const s = String(input || '');
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}

function enforceOneSlice({ slice, question }) {
  let s = stripControlChars(String(slice || '')).trim();
  let q = stripControlChars(String(question || '')).trim();

  const MAX_CHARS = 980;
  if (s.length > MAX_CHARS) s = s.slice(0, MAX_CHARS).trimEnd() + '…';

  s = s.replace(/\b(in conclusion|to conclude|overall|in summary|that\'s it|you\'re done|fully covered)\b/gi, '').trim();

  if (!q) q = 'How do you want to continue?';
  if (!/[?؟]$/.test(q)) q = q.replace(/[.!]+$/g, '').trim() + '?';

  return { slice: s, question: q };
}

const kernelSchema = z
  .object({
    topic: z.string().min(1).max(400),
    curiosityGraph: z.array(z.any()).optional(),
    currentNodeId: z.string().optional(),
    learningStyle: z.string().nullable().optional(),
    depth: z.number().int().min(0).max(500),
    rewards: z
      .object({
        insightMoments: z.number().int().min(0).max(999).optional(),
        depthUnlocked: z.number().int().min(0).max(999).optional(),
        masterySignals: z.array(z.string()).max(200).optional(),
      })
      .passthrough()
      .optional(),
    userSignals: z
      .object({
        boredom: z.boolean().optional(),
        confusion: z.boolean().optional(),
        excitement: z.boolean().optional(),
      })
      .passthrough()
      .optional(),
    history: z.array(z.any()).max(500).optional(),
  })
  .passthrough();

const reqSchema = z.object({
  action: z.enum(['options', 'step']),
  kernel: kernelSchema,
  choice: z
    .object({
      id: z.string().min(1).max(80),
      title: z.string().max(120).optional(),
    })
    .optional()
    .nullable(),
  command: z.string().max(60).optional().nullable(),
});

const optionsResponseSchema = z.object({
  question: z.string().min(1).max(260),
  options: z
    .array(
      z.object({
        id: z.string().min(1).max(80),
        title: z.string().min(1).max(90),
        subtitle: z.string().max(140).optional(),
      })
    )
    .min(3)
    .max(12),
});

const sliceResponseSchema = z.object({
  slice: z.string().min(1),
  question: z.string().min(1),
  rewardLine: z.string().optional(),
  kernelPatch: z.object({}).passthrough().optional(),
});

function parseStrictJson(text) {
  const raw = String(text || '').trim();
  try {
    return JSON.parse(raw);
  } catch {}

  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start >= 0 && end > start) {
    const maybe = raw.slice(start, end + 1);
    try {
      return JSON.parse(maybe);
    } catch {}
  }
  return null;
}

function buildOptionsFallback(topic) {
  const t = safeTopic(topic);
  const seed = stableHash(t).slice(0, 8);

  // Not a fixed modes list: synthesize titles via topic-derived phrases.
  const words = t
    .split(/\s+/g)
    .map((w) => w.replace(/[^a-zA-Z0-9]/g, ''))
    .filter(Boolean);
  const key = words.length ? words[0] : 'core';
  const key2 = words.length > 1 ? words[1] : 'signal';

  const make = (suffix, subtitle) => {
    const id = stableHash(`${seed}:${suffix}`).slice(0, 10);
    return { id: `s_${id}`, title: `${suffix}`, subtitle };
  };

  const opts = [
    make(`Start with the ${key} idea`, `One definition + one link to ${key2}`),
    make(`Work backwards from an outcome`, `Pick a result; trace one cause`),
    make(`Build a tiny mental model`, `Two parts + one interaction`),
    make(`Spot the common confusion`, `One misconception, corrected tightly`),
    make(`Use a concrete example`, `One realistic case; one variable changes`),
    make(`Challenge me gently`, `One question + how to self-check`),
    make(`Decision lens`, `One tradeoff + a rule of thumb`),
  ];

  return {
    question: `Pick a style for “${t}” (we’ll do one slice at a time):`,
    options: opts.slice(0, 8),
  };
}

function buildOptionsSystemPrompt() {
  return [
    'You generate learning style options dynamically for the exact topic.',
    'Rules:',
    '- Do NOT output a fixed list of known modes.',
    '- Create 6-8 distinct styles tailored to the topic.',
    '- Each option must be usable repeatedly to generate infinite depth.',
    '- Titles must be short; subtitles are optional.',
    '- Do not rewrite the topic.',
    '',
    'Output format (STRICT JSON):',
    '{"question":"...","options":[{"id":"...","title":"...","subtitle":"..."}]}',
  ].join('\n');
}

function buildOptionsUserMessage(topic) {
  const t = safeTopic(topic);
  return [`TOPIC (exact, do not rewrite): ${t}`, '', 'Generate options now.'].join('\n');
}

function buildStepSystemPrompt({ topic, learningStyle, depth, command }) {
  const t = safeTopic(topic);
  const d = clamp(depth, 1, 500);
  const style = stripControlChars(String(learningStyle || '')).slice(0, 120);
  const cmd = stripControlChars(String(command || 'step')).slice(0, 60);

  return [
    'You are an ASK-FIRST, INFINITE learning engine.',
    'You MUST output exactly ONE small slice and ONE follow-up question.',
    'You MUST NOT complete the topic in one response.',
    'You MUST keep topic integrity: never rename the topic.',
    '',
    'Hard rules:',
    '- No syllabus, no modules, no course structure, no progress-complete language.',
    '- No long essays. Keep the slice short and scannable.',
    '- Never say the topic is fully covered.',
    '- End with a continuation question (not rhetorical).',
    '',
    `TOPIC: ${t}`,
    `LEARNING_STYLE: ${style}`,
    `DEPTH: ${d}`,
    `COMMAND: ${cmd}`,
    '',
    'Command meanings:',
    '- start: first slice in this style',
    '- go_deeper: one layer deeper than last slice',
    '- branch_sideways: a related sibling idea, still tied to topic',
    '- challenge_me: one challenge + how to self-check',
    '- summarize_so_far: a tight 4-6 line recap + next question',
    '',
    'Output format (STRICT JSON):',
    '{"slice":"...","question":"..."}',
  ].join('\n');
}

function buildStepUserMessage({ topic, learningStyle, depth, command }) {
  const t = safeTopic(topic);
  const style = stripControlChars(String(learningStyle || '')).slice(0, 120);
  const d = clamp(depth, 1, 500);
  const cmd = stripControlChars(String(command || 'step')).slice(0, 60);
  return [
    `TOPIC (exact): ${t}`,
    `STYLE (exact): ${style}`,
    `DEPTH: ${d}`,
    `COMMAND: ${cmd}`,
    '',
    'Now generate the NEXT slice only.',
  ].join('\n');
}

function stepFallback({ topic, learningStyle, depth, command }) {
  const t = safeTopic(topic);
  const d = clamp(depth, 1, 500);
  const style = stripControlChars(String(learningStyle || 'style'));
  const cmd = stripControlChars(String(command || 'step'));

  let slice = '';
  let question = '';

  if (cmd === 'challenge_me') {
    slice = [
      `Topic: ${t}`,
      `Style: ${style}`,
      '',
      'Challenge (one slice):',
      '- In one sentence, explain the *first* thing that changes when the main driver changes.',
      '',
      'Self-check:',
      '- Your sentence names the driver, first effect, and direction.',
    ].join('\n');
    question = 'Want the answer key, or a harder challenge?';
    return enforceOneSlice({ slice, question });
  }

  if (cmd === 'summarize_so_far') {
    slice = [
      `Topic: ${t}`,
      `Style: ${style}`,
      `Depth: ${d}`,
      '',
      'Recap (tight):',
      '- One key definition.',
      '- One cause → effect link.',
      '- One practical check.',
      '- One pitfall to avoid.',
    ].join('\n');
    question = 'Go deeper, branch sideways, or challenge you?';
    return enforceOneSlice({ slice, question });
  }

  slice = [
    `Topic: ${t}`,
    `Style: ${style}`,
    `Depth: ${d}`,
    '',
    'One slice:',
    '- Define one term (1 sentence).',
    '- Connect it to one other idea (1 sentence).',
    '- Add one “watch for” check (1 line).',
  ].join('\n');

  if (cmd === 'branch_sideways') question = 'Want to connect this to a sibling idea, or go deeper on this one?';
  else question = 'Do you want to go deeper, branch sideways, or get a challenge?';

  return enforceOneSlice({ slice, question });
}

function computeRewardLine({ prevRewards, depth }) {
  const insightMoments = clamp(prevRewards?.insightMoments || 0, 0, 999);
  const depthUnlocked = clamp(prevRewards?.depthUnlocked || 0, 0, 999);
  const masterySignals = Array.isArray(prevRewards?.masterySignals) ? prevRewards.masterySignals.slice(0, 200) : [];

  const gainedInsight = depth % 3 === 0 ? 1 : 0;
  const nextInsight = insightMoments + gainedInsight;

  const nextUnlock = Math.max(depthUnlocked, Math.floor(depth / 5));
  const rewardLineParts = [];
  if (gainedInsight) rewardLineParts.push('+1 insight moment');
  if (nextUnlock > depthUnlocked) rewardLineParts.push(`depth unlock: ${nextUnlock}`);
  if (!rewardLineParts.length) rewardLineParts.push('keep going');

  return {
    rewardLine: `Reward: ${rewardLineParts.join(' • ')}`,
    rewards: { insightMoments: nextInsight, depthUnlocked: nextUnlock, masterySignals },
  };
}

export async function POST(request) {
  try {
    const json = await request.json().catch(() => null);
    const parsed = reqSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ ok: false, error: 'invalid_request' }, { status: 400 });
    }

    const { action } = parsed.data;
    const kernel = parsed.data.kernel;
    const topic = safeTopic(kernel.topic);
    const depth = clamp(kernel.depth, 0, 500);
    const learningStyle = kernel.learningStyle == null ? null : stripControlChars(String(kernel.learningStyle));
    const command = stripControlChars(String(parsed.data.command || 'step'));
    const choice = parsed.data.choice || null;

    if (action === 'options') {
      const out = buildOptionsFallback(topic);
      return NextResponse.json({ ok: true, kind: 'options', ...out, provider: null, fallback: true });
    }

    // action === 'step'
    const style = learningStyle || (choice && choice.id ? stripControlChars(String(choice.id)) : null);
    if (!style) {
      return NextResponse.json({ ok: false, error: 'style_required' }, { status: 400 });
    }

    const incomingSession = kernel && typeof kernel === 'object' ? kernel.engineSession : null;
    const baseSession = incomingSession && typeof incomingSession === 'object' ? incomingSession : null;

    // Seed (or re-seed) the engine session if missing or topic changes.
    let session = baseSession && String(baseSession.topic || '') === String(topic) ? baseSession : createSession(topic);

    // On style selection (start), set the initial angle to the chosen style label.
    if (command === 'start') {
      const styleLabel = choice && (choice.title || choice.id) ? stripControlChars(String(choice.title || choice.id)) : style;
      session = { ...session, angle: styleLabel || String(session.angle || 'baseline') };
    }

    const mapCommandToAction = (cmd) => {
      switch (cmd) {
        case 'start':
          return 'DEEPER';
        case 'go_deeper':
          return 'DEEPER';
        case 'branch_sideways':
          return 'DIFFERENT_ANGLE';
        case 'challenge_me':
          return 'CHALLENGE';
        case 'summarize_so_far':
          return 'SUMMARY';
        default:
          return 'DEEPER';
      }
    };

    const engineAction = mapCommandToAction(command);

    let angleOpt = undefined;
    if (engineAction === 'DIFFERENT_ANGLE') {
      const seed = stableHash(`${topic}:${style}:${String(session.id || '')}:${Number(session.covered?.length || 0)}`).slice(0, 6);
      angleOpt = `${stripControlChars(String(style))} / sideways-${seed}`;
    }

    const out = engineStep(session, engineAction, angleOpt ? { angle: angleOpt } : undefined);

    const nextDepth = clamp(out.session.depth, 0, 500);
    const nodeId = `n_${nextDepth}_${stableHash(`${topic}:${style}:${String(out.response.newConcept || '')}`).slice(0, 10)}`;
    const prevGraph = Array.isArray(kernel.curiosityGraph) ? kernel.curiosityGraph : [];
    const prevNodeId = kernel.currentNodeId ? stripControlChars(String(kernel.currentNodeId)) : '';

    const nextGraph = [
      ...prevGraph,
      {
        id: nodeId,
        parentId: prevNodeId || null,
        depth: nextDepth,
        style,
        createdAt: new Date().toISOString(),
      },
    ].slice(-1200);

    const { rewardLine, rewards } = computeRewardLine({ prevRewards: kernel.rewards, depth: nextDepth });
    const kernelPatch = {
      topic,
      learningStyle: style,
      depth: nextDepth,
      currentNodeId: nodeId,
      curiosityGraph: nextGraph,
      rewards,
      engineSession: out.session,
    };

    const slice = String(out.response.content || '').trim();
    const question = 'How do you want to continue—go deeper, branch sideways, challenge, summarize, or switch style?';
    const one = enforceOneSlice({ slice, question });

    return NextResponse.json({ ok: true, kind: 'slice', ...one, rewardLine, kernelPatch, provider: null, fallback: true });
  } catch {
    return NextResponse.json({ ok: false, error: 'server_error' }, { status: 500 });
  }
}
