/**
 * Pure JavaScript PDF text extraction using pdfjs-dist
 * Replaces Python pdfplumber dependency for Vercel compatibility
 */

import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';

// Dynamic import to avoid bundling issues
let pdfjsLib = null;

async function getDocument(data) {
  if (!pdfjsLib) {
    pdfjsLib = await import('pdfjs-dist/legacy/build/pdf.mjs');
    // Ensure the worker module is present in Next's server bundle.
    // pdfjs-dist may try to import it when running in Node "fake worker" mode.
    await import('pdfjs-dist/legacy/build/pdf.worker.mjs');
    // pdfjs-dist uses a "fake worker" in Node; it still needs a resolvable workerSrc.
    // Point it at the actual file inside node_modules.
    const require = createRequire(import.meta.url);
    const workerPath = require.resolve('pdfjs-dist/legacy/build/pdf.worker.mjs');
    pdfjsLib.GlobalWorkerOptions.workerSrc = pathToFileURL(workerPath).toString();
  }
  
  return pdfjsLib.getDocument({
    data,
    disableWorker: true,
    useSystemFonts: true,
    disableFontFace: true,
    isEvalSupported: false,
  }).promise;
}

/**
 * Extract text and structure from a PDF buffer
 * @param {Buffer|Uint8Array} pdfBytes - The PDF file as bytes
 * @returns {Promise<Object>} Extracted pages with text, words, and metadata
 */
export async function extractPdfText(pdfBytes) {
  const data = new Uint8Array(pdfBytes);
  const pdf = await getDocument(data);
  
  const numPages = pdf.numPages;
  const pages = [];
  let hasSelectableText = false;
  
  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.0 });
    const textContent = await page.getTextContent();
    
    const words = [];
    const lines = [];
    let currentLine = [];
    let lastY = null;
    
    for (const item of textContent.items) {
      if (!item.str || item.str.trim() === '') continue;
      
      hasSelectableText = true;
      
      // Get transform matrix for position
      const tx = item.transform[4];
      const ty = item.transform[5];
      const width = item.width || 0;
      const height = item.height || item.transform[0] || 12;
      
      const word = {
        text: item.str.trim(),
        x0: tx,
        x1: tx + width,
        top: viewport.height - ty - height,
        bottom: viewport.height - ty,
        width,
        height,
      };
      
      words.push(word);
      
      // Group into lines based on Y position
      if (lastY === null || Math.abs(ty - lastY) < 5) {
        currentLine.push(item.str);
      } else {
        if (currentLine.length > 0) {
          lines.push(currentLine.join(' '));
        }
        currentLine = [item.str];
      }
      lastY = ty;
    }
    
    // Push final line
    if (currentLine.length > 0) {
      lines.push(currentLine.join(' '));
    }
    
    const pageText = lines.join('\n');
    
    pages.push({
      pageNumber: pageNum,
      width: viewport.width,
      height: viewport.height,
      text: pageText,
      words,
      lines,
    });
  }
  
  return {
    numPages,
    pages,
    hasSelectableText,
    method: 'pdfjs',
  };
}

/**
 * Detect if PDF is digital (has selectable text) or scanned
 * @param {Object} extractionResult - Result from extractPdfText
 * @returns {'DIGITAL_PDF'|'SCANNED_PDF'}
 */
export function detectPdfType(extractionResult) {
  if (!extractionResult || !extractionResult.hasSelectableText) {
    return 'SCANNED_PDF';
  }
  
  // Check if there's meaningful text
  const totalText = extractionResult.pages.map(p => p.text).join('').trim();
  if (totalText.length < 50) {
    return 'SCANNED_PDF';
  }
  
  return 'DIGITAL_PDF';
}

/**
 * Extract all text from PDF for document type detection
 * @param {Object} extractionResult - Result from extractPdfText
 * @returns {string}
 */
export function getAllText(extractionResult) {
  if (!extractionResult?.pages) return '';
  return extractionResult.pages.map(p => p.text || '').join('\n\n');
}
