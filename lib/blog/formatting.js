// Shared formatting helpers for BM Wealth blog/community content.
// Goal: keep display premium and consistent, even if raw content includes markdown artifacts.

export function removeSharePlaceholders(input) {
  const s = String(input || '');
  return s
    .replace(/\[\s*Share\s+This[^\]]*\]/gi, '')
    .replace(/\[\s*Share\s+This\s+Story[^\]]*\]/gi, '')
    .trim();
}

export function stripMarkdownForExcerpt(input) {
  const raw = removeSharePlaceholders(input);
  if (!raw) return '';

  // Remove headings markers, bold markers, and common list prefixes.
  // Keep wording intact as much as possible.
  return raw
    .replace(/(^|\n)\s*#{1,6}\s+/g, ' ')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/(^|\n)\s*[-*]\s+/g, ' ')
    .replace(/(^|\n)\s*\d+\.\s+/g, ' ')
    .replace(/`{1,3}([^`]+)`{1,3}/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeCommunityMarkdown(input) {
  // Used before rendering with react-markdown.
  // We intentionally do NOT allow raw HTML parsing in the renderer.
  const raw = removeSharePlaceholders(input);
  return raw;
}
