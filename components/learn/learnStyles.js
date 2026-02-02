export const LEARN_STYLES = [
  {
    id: 'simple',
    label: 'Explain simply',
    hint: 'Calm, plain language. No jargon.',
  },
  {
    id: 'story',
    label: 'Story / analogy',
    hint: 'A metaphor that makes it click.',
  },
  {
    id: 'visual',
    label: 'Visual thinker',
    hint: 'Diagrams-in-words, boxes, flows.',
  },
  {
    id: 'math',
    label: 'Math & mechanics',
    hint: 'Formulas, assumptions, step-by-step.',
  },
  {
    id: 'psych',
    label: 'Psychology & behavior',
    hint: 'Biases, emotions, decision design.',
  },
  {
    id: 'examples',
    label: 'Real-world examples',
    hint: 'Concrete scenarios and numbers.',
  },
  {
    id: 'mistakes',
    label: 'Common mistakes',
    hint: 'Pitfalls + how to avoid them.',
  },
  {
    id: 'socratic',
    label: 'Socratic (ask me questions)',
    hint: 'You answer. I guide gently.',
  },
  {
    id: 'fast',
    label: 'Fast clarity',
    hint: 'A crisp takeaway-first view.',
  },
  {
    id: 'deep',
    label: 'Deep mastery',
    hint: 'Go as deep as you want, stepwise.',
  },
];

export function styleById(id) {
  const key = String(id || '').trim();
  return LEARN_STYLES.find((s) => s.id === key) || null;
}
