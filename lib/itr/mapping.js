import form16 from '@/lib/mappings/form16.json';
import ais from '@/lib/mappings/ais.json';
import bank from '@/lib/mappings/bank.json';
import { isLikelyNumberToken } from './numbers.js';

const MAPPINGS = {
  form16,
  ais,
  bank,
};

function normalize(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/\u00a0/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function levenshtein(a, b) {
  const s = String(a || '');
  const t = String(b || '');
  const m = s.length;
  const n = t.length;
  if (!m) return n;
  if (!n) return m;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s[i - 1] === t[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + cost);
    }
  }
  return dp[m][n];
}

function findLabelMatch(lineText, synonyms) {
  const line = normalize(lineText);
  if (!line) return null;

  for (const syn of synonyms) {
    const s = normalize(syn);
    if (!s) continue;
    if (line.includes(s)) return { match: syn, method: 'exact' };
  }

  // Fuzzy match ONLY for label strings.
  const words = line.split(' ').filter(Boolean);
  const joined = words.join(' ');
  for (const syn of synonyms) {
    const s = normalize(syn);
    if (!s) continue;
    if (levenshtein(joined, s) <= 2) return { match: syn, method: 'fuzzy' };
  }

  return null;
}

function bboxFromWords(words) {
  const xs0 = words.map((w) => Number(w.x0 || 0));
  const xs1 = words.map((w) => Number(w.x1 || 0));
  const ys0 = words.map((w) => Number(w.top || 0));
  const ys1 = words.map((w) => Number(w.bottom || 0));
  return {
    x0: Math.min(...xs0),
    x1: Math.max(...xs1),
    top: Math.min(...ys0),
    bottom: Math.max(...ys1),
  };
}

function pickNumericTokenSameLine(words, labelIndex) {
  // Strategy: look to the right of the label token first.
  const right = words.slice(labelIndex + 1).find((w) => isLikelyNumberToken(w.text));
  if (right) return right;
  // fallback: any numeric token on line
  return words.find((w) => isLikelyNumberToken(w.text)) || null;
}

export function mapFieldsFromPdfPlumberRaw({ raw, fileId, filename, docType }) {
  const mapping = MAPPINGS[docType] || null;
  if (!mapping) {
    return { docType: docType || 'unknown', fields: [], warnings: ['Unsupported document type'] };
  }

  const fields = [];

  // We rely on words+bboxes and line text; we never fabricate values.
  const pages = Array.isArray(raw?.pages) ? raw.pages : [];

  for (const def of mapping.fields || []) {
    const synonyms = Array.isArray(def.synonyms) ? def.synonyms : [];

    let found = null;

    for (const p of pages) {
      const pageNumber = p?.pageNumber;
      const pageWidth = Number(p?.width || 0) || null;
      const pageHeight = Number(p?.height || 0) || null;
      const words = Array.isArray(p?.words) ? p.words : [];
      const text = String(p?.text || '');
      const lines = text.split(/\n+/).map((l) => l.trim()).filter(Boolean);

      // Fast line-based search to find the best matching line.
      for (const line of lines) {
        const labelMatch = findLabelMatch(line, synonyms);
        if (!labelMatch) continue;

        // Now attempt to find a numeric token on the same visual row using words.
        // We approximate by taking words that appear in this line text.
        const normalizedLine = normalize(line);
        const lineWords = words.filter((w) => normalizedLine.includes(normalize(w.text)));
        if (lineWords.length === 0) continue;

        // Find index of label-ish token.
        const labelIdx = Math.max(0, lineWords.findIndex((w) => normalize(w.text) === normalize(labelMatch.match).split(' ')[0]));
        const numToken = pickNumericTokenSameLine(lineWords, labelIdx);
        if (!numToken) {
          found = {
            key: def.key,
            label: def.label,
            valueText: null,
            status: 'FLAGGED',
            reason: 'NO_NUMERIC_TOKEN_FOUND',
            source: {
              source_file: fileId,
              filename,
              page: pageNumber,
              pageWidth,
              pageHeight,
              bbox: bboxFromWords(lineWords),
              raw_text_token: null,
              confidence: null,
            },
          };
          break;
        }

        found = {
          key: def.key,
          label: def.label,
          valueText: String(numToken.text),
          status: 'OK',
          reason: null,
          source: {
            source_file: fileId,
            filename,
            page: pageNumber,
            pageWidth,
            pageHeight,
            bbox: {
              x0: Number(numToken.x0 || 0),
              x1: Number(numToken.x1 || 0),
              top: Number(numToken.top || 0),
              bottom: Number(numToken.bottom || 0),
            },
            raw_text_token: String(numToken.text),
            confidence: 1,
          },
        };
        break;
      }
      if (found) break;
    }

    if (!found) {
      found = {
        key: def.key,
        label: def.label,
        valueText: null,
        status: 'FLAGGED',
        reason: 'LABEL_NOT_FOUND',
        source: {
          source_file: fileId,
          filename,
          page: null,
          bbox: null,
          raw_text_token: null,
          confidence: null,
        },
      };
    }

    fields.push(found);
  }

  return { docType, fields, warnings: [] };
}
