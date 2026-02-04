// NON-NEGOTIABLE: PDF type detection MUST be based on text-layer presence.
// If selectable text exists -> DIGITAL_PDF, else -> SCANNED_PDF.
//
// Back-compat: if hasSelectableText is not provided (older callers), we fall back
// to a conservative heuristic on extractedText length only.
export function detectPdfKind({ hasSelectableText, extractedText } = {}) {
  if (typeof hasSelectableText === 'boolean') return hasSelectableText ? 'DIGITAL_PDF' : 'SCANNED_PDF';

  const text = String(extractedText || '');
  const signal = text.replace(/\s/g, '');
  // Conservative: require meaningful text signal, but do NOT use keywords.
  return signal.length >= 80 ? 'DIGITAL_PDF' : 'SCANNED_PDF';
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
