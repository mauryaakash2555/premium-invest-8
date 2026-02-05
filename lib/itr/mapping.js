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
              raw_line_text: line,
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
            raw_line_text: line,
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
          raw_line_text: null,
          confidence: null,
        },
      };
    }

    fields.push(found);
  }

  return { docType, fields, warnings: [] };
}

function groupBlocksIntoLines(blocks) {
  // blocks: [{text, confidence, bbox:{x0,y0,x1,y1}}] where y is top-origin pixels
  const byY = new Map();
  for (const b of blocks || []) {
    const text = String(b?.text || '').trim();
    if (!text) continue;
    const bb = b?.bbox || {};
    const y = Number(bb?.y0 ?? bb?.top ?? 0);
    const key = Math.round(y / 4) * 4; // 4px buckets
    const row = byY.get(key) || [];
    row.push(b);
    byY.set(key, row);
  }

  const ys = Array.from(byY.keys()).sort((a, b) => a - b);
  return ys.map((y) => {
    const row = byY.get(y) || [];
    row.sort((a, b) => Number(a?.bbox?.x0 || 0) - Number(b?.bbox?.x0 || 0));
    const lineText = row.map((r) => String(r?.text || '').trim()).filter(Boolean).join(' ').replace(/\s{2,}/g, ' ').trim();
    return { y, blocks: row, lineText };
  });
}

function pdfBboxFromPixelBbox({ pixelBbox, pageWidth, pageHeight, renderWidthPx, renderHeightPx }) {
  const x0 = Number(pixelBbox?.x0 ?? 0);
  const y0 = Number(pixelBbox?.y0 ?? 0);
  const x1 = Number(pixelBbox?.x1 ?? 0);
  const y1 = Number(pixelBbox?.y1 ?? 0);

  const pw = Number(pageWidth || 0);
  const ph = Number(pageHeight || 0);
  const rw = Number(renderWidthPx || 0);
  const rh = Number(renderHeightPx || 0);
  if (!pw || !ph || !rw || !rh) return null;

  return {
    x0: (x0 * pw) / rw,
    x1: (x1 * pw) / rw,
    top: (y0 * ph) / rh,
    bottom: (y1 * ph) / rh,
  };
}

export function mapFieldsFromOcrPages({ ocr, fileId, filename, docType, minConfidence = 0.85 }) {
  const mapping = MAPPINGS[docType] || null;
  if (!mapping) {
    return { docType: docType || 'unknown', fields: [], warnings: ['Unsupported document type'] };
  }

  const pages = Array.isArray(ocr?.pages) ? ocr.pages : [];
  const overall = typeof ocr?.overallConfidence === 'number' ? ocr.overallConfidence : null;
  const lowOverall = overall === null || overall < minConfidence;

  const fields = [];
  for (const def of mapping.fields || []) {
    if (lowOverall) {
      fields.push({
        key: def.key,
        label: def.label,
        valueText: null,
        status: 'FLAGGED',
        reason: 'LOW_OCR_CONFIDENCE',
        source: {
          source_file: fileId,
          filename,
          page: null,
          bbox: null,
          raw_text_token: null,
          raw_line_text: null,
          confidence: overall,
        },
      });
      continue;
    }

    const synonyms = Array.isArray(def.synonyms) ? def.synonyms : [];
    let found = null;

    for (const p of pages) {
      const pageNumber = Number(p?.pageNumber || 0) || null;
      const pageWidth = Number(p?.pageWidth || 0) || null;
      const pageHeight = Number(p?.pageHeight || 0) || null;
      const renderWidthPx = Number(p?.renderWidthPx || 0) || null;
      const renderHeightPx = Number(p?.renderHeightPx || 0) || null;
      const blocks = Array.isArray(p?.blocks) ? p.blocks : [];

      const lines = groupBlocksIntoLines(blocks);
      for (const ln of lines) {
        const labelMatch = findLabelMatch(ln.lineText, synonyms);
        if (!labelMatch) continue;

        // Prefer a numeric token to the right of the label-ish token.
        // Approximate label anchor x by the first occurrence token in the line.
        const labelWord = normalize(labelMatch.match).split(' ')[0];
        const labelBlock = (ln.blocks || []).find((b) => normalize(b?.text) === labelWord) || (ln.blocks || [])[0] || null;
        const labelX = labelBlock ? Number(labelBlock?.bbox?.x0 || 0) : 0;

        const candidates = (ln.blocks || [])
          .filter((b) => isLikelyNumberToken(b?.text))
          .map((b) => ({ b, x0: Number(b?.bbox?.x0 || 0), conf: b?.confidence }))
          .filter((x) => typeof x.conf === 'number' && x.conf >= minConfidence);

        let picked = candidates.find((c) => c.x0 >= labelX) || candidates[0] || null;
        if (!picked) {
          found = {
            key: def.key,
            label: def.label,
            valueText: null,
            status: 'FLAGGED',
            reason: 'NO_HIGH_CONF_NUMERIC_TOKEN_FOUND',
            source: {
              source_file: fileId,
              filename,
              page: pageNumber,
              pageWidth,
              pageHeight,
              bbox: null,
              raw_text_token: null,
              raw_line_text: ln.lineText,
              confidence: overall,
            },
          };
          break;
        }

        const pdfBbox = pdfBboxFromPixelBbox({
          pixelBbox: picked.b?.bbox,
          pageWidth,
          pageHeight,
          renderWidthPx,
          renderHeightPx,
        });

        found = {
          key: def.key,
          label: def.label,
          valueText: String(picked.b.text),
          status: 'OK',
          reason: null,
          source: {
            source_file: fileId,
            filename,
            page: pageNumber,
            pageWidth,
            pageHeight,
            bbox: pdfBbox,
            raw_text_token: String(picked.b.text),
            raw_line_text: ln.lineText,
            confidence: Number(picked.conf),
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
          raw_line_text: null,
          confidence: overall,
        },
      };
    }

    fields.push(found);
  }

  const warnings = [];
  if (lowOverall) warnings.push('LOW_OCR_CONFIDENCE');
  return { docType, fields, warnings };
}

/**
 * Map fields from JavaScript pdfjs-dist extraction result
 * Works with the format from lib/itr/pdfExtract.js
 */
export function mapFieldsFromExtraction({ raw, fileId, filename, docType }) {
  const mapping = MAPPINGS[docType] || null;
  if (!mapping) {
    return { docType: docType || 'unknown', fields: [], warnings: ['Unsupported document type'] };
  }

  const fields = [];
  const pages = Array.isArray(raw?.pages) ? raw.pages : [];

  for (const def of mapping.fields || []) {
    const synonyms = Array.isArray(def.synonyms) ? def.synonyms : [];
    let found = null;

    for (const p of pages) {
      const pageNumber = p?.pageNumber;
      const pageWidth = Number(p?.width || 0) || null;
      const pageHeight = Number(p?.height || 0) || null;
      const words = Array.isArray(p?.words) ? p.words : [];
      const lines = Array.isArray(p?.lines) ? p.lines : (p?.text || '').split(/\n+/).map(l => l.trim()).filter(Boolean);

      for (const line of lines) {
        const labelMatch = findLabelMatch(line, synonyms);
        if (!labelMatch) continue;

        // Find words on this line for bbox calculation
        const normalizedLine = normalize(line);
        const lineWords = words.filter((w) => normalizedLine.includes(normalize(w.text)));
        
        if (lineWords.length === 0) {
          // No word coordinates, but we found the label
          found = {
            key: def.key,
            label: def.label,
            valueText: null,
            status: 'FLAGGED',
            reason: 'NO_VALUE_COORDINATES',
            source: {
              source_file: fileId,
              filename,
              page: pageNumber,
              pageWidth,
              pageHeight,
              bbox: null,
              raw_text_token: null,
              raw_line_text: line,
              confidence: null,
            },
          };
          break;
        }

        // Find the numeric token on this line
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
              raw_line_text: line,
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
            raw_line_text: line,
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
          raw_line_text: null,
          confidence: null,
        },
      };
    }

    fields.push(found);
  }

  return { docType, fields, warnings: [] };
}
