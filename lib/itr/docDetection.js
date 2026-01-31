export function detectPdfKind({ extractedText }) {
  const text = String(extractedText || '');
  const compact = text.replace(/\s+/g, ' ').trim();
  const lower = compact.toLowerCase();

  const hasEnoughText = compact.length >= 50;
  const keywordHit =
    lower.includes('form 16') ||
    lower.includes('form no. 16') ||
    lower.includes('tds') ||
    lower.includes('certificate under section 203') ||
    lower.includes('annual information statement') ||
    lower.includes('ais');

  if (hasEnoughText && keywordHit) return 'DIGITAL_PDF';
  return 'SCANNED_PDF';
}

export function detectDocTypeFromText(text) {
  const lowerText = String(text || '').toLowerCase();

  if (
    lowerText.includes('form no. 16') ||
    lowerText.includes('form 16') ||
    lowerText.includes('certificate under section 203') ||
    (lowerText.includes('part a') && lowerText.includes('part b')) ||
    lowerText.includes('salary as per provisions')
  ) {
    return 'form16';
  }

  if (
    lowerText.includes('annual information statement') ||
    (lowerText.includes('ais') && (lowerText.includes('tds') || lowerText.includes('tcs'))) ||
    lowerText.includes('information relating to')
  ) {
    return 'ais';
  }

  if (
    lowerText.includes('interest certificate') ||
    lowerText.includes('interest paid') ||
    lowerText.includes('tds on interest') ||
    (lowerText.includes('bank') && lowerText.includes('interest')) ||
    lowerText.includes('form 16a')
  ) {
    return 'bank';
  }

  return 'unknown';
}
