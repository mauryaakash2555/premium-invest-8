export function getBodyTextPaletteStyles({
  scopeSelector = '.bp-body',
  title = '#FFFFFF',
  body = 'rgba(255,255,255,0.78)',
  muted = 'rgba(255,255,255,0.62)',
} = {}) {
  return `
${scopeSelector} { color: ${title}; }

${scopeSelector} h2,
${scopeSelector} h3,
${scopeSelector} h4,
${scopeSelector} h5,
${scopeSelector} h6 { color: ${title} !important; }

${scopeSelector} p,
${scopeSelector} li,
${scopeSelector} label { color: ${body} !important; }

${scopeSelector} small,
${scopeSelector} .muted,
${scopeSelector} .text-muted { color: ${muted} !important; }

${scopeSelector} a { color: inherit; }
`;
}
