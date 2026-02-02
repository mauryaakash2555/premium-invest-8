import { styleById } from './learnStyles';

export function normalizeCommand(raw) {
  return String(raw || '').trim();
}

export function detectFollowUpIntent(raw) {
  const text = normalizeCommand(raw).toLowerCase();
  if (!text) return { type: 'none' };

  // Depth control
  if (/(go\s*deeper|deepen|more\s*depth|deeper\s*please)/i.test(text)) {
    return { type: 'depth', direction: 'deeper' };
  }
  if (/(zoom\s*out|make\s*it\s*shorter|summarize|tl;dr)/i.test(text)) {
    return { type: 'depth', direction: 'shallower' };
  }

  // Style control
  if (/(explain\s*differently|change\s*style|switch\s*style)/i.test(text)) {
    return { type: 'style', action: 'pick' };
  }

  // Common helpers
  if (/(give\s*(an\s*)?example|more\s*examples)/i.test(text)) {
    return { type: 'style', action: 'set', styleId: 'examples' };
  }
  if (/(math|show\s*the\s*math|mechanics)/i.test(text)) {
    return { type: 'style', action: 'set', styleId: 'math' };
  }
  if (/(common\s*mistakes|pitfalls)/i.test(text)) {
    return { type: 'style', action: 'set', styleId: 'mistakes' };
  }
  if (/(story|analogy|metaphor)/i.test(text)) {
    return { type: 'style', action: 'set', styleId: 'story' };
  }
  if (/(simple|eli5|plain\s*english)/i.test(text)) {
    return { type: 'style', action: 'set', styleId: 'simple' };
  }
  if (/(challenge\s*me|quiz\s*me|test\s*me)/i.test(text)) {
    return { type: 'challenge' };
  }

  return { type: 'custom', text: normalizeCommand(raw) };
}

export function resolveStyleUpdate(intent, currentStyleId) {
  if (!intent || intent.type !== 'style') return { nextStyleId: currentStyleId, needsPicker: false };
  if (intent.action === 'pick') return { nextStyleId: currentStyleId, needsPicker: true };
  if (intent.action === 'set') {
    const s = styleById(intent.styleId);
    return { nextStyleId: s ? s.id : currentStyleId, needsPicker: false };
  }
  return { nextStyleId: currentStyleId, needsPicker: false };
}
