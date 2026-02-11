import { extractText } from 'unpdf';

/**
 * BULLETPROOF ITR EXTRACTOR
 * Layer 1: Digital PDF (unpdf)
 * Layer 2: OCR.space fallback
 * Layer 3: Never fails - always returns editable fields
 */

async function extractFields(text) {
  const fields = { grossSalary: 0, tds: 0, standardDeduction: 0, deductions80C: 0 };
  const cleanText = text.replace(/[, ]/g, '').toLowerCase();

  console.log('[BULLETPROOF] Extracting fields from', text.length, 'chars');

  // Gross Salary - specific to section 17(1)
  let match = cleanText.match(/section17\(1\).*?(\d{6,8})/);
  if (match) fields.grossSalary = parseInt(match[1]);
  else {
    match = cleanText.match(/17\(1\).*?(\d{6,8})/);
    if (match) fields.grossSalary = parseInt(match[1]);
  }

  // TDS - total tax deducted
  match = cleanText.match(/totaltaxdeducted.*?(\d{5,7})/);
  if (match) fields.tds = parseInt(match[1]);
  else {
    match = cleanText.match(/total\(rs\.?\).*?(\d{5,7})/);
    if (match) fields.tds = parseInt(match[1]);
  }

  // Standard Deduction - section 16(ia)
  match = cleanText.match(/standarddeduction.*?(\d{5,6})/);
  if (match) fields.standardDeduction = parseInt(match[1]);
  else if (cleanText.includes('16(ia)')) {
    match = cleanText.match(/16\(ia\).*?(\d{5,6})/);
    if (match) fields.standardDeduction = parseInt(match[1]);
  }
  // Default to 50000 if not found but text mentions standard deduction
  if (!fields.standardDeduction && cleanText.includes('standarddeduction')) {
    fields.standardDeduction = 50000;
  }

  // 80C - specific to 80C
  match = cleanText.match(/80c.*?(\d{5,7})/);
  if (match) fields.deductions80C = parseInt(match[1]);

  const count = Object.values(fields).filter(v => v > 0).length;
  const confidence = count >= 4 ? 0.95 : count >= 3 ? 0.85 : count >= 2 ? 0.75 : count >= 1 ? 0.6 : 0.3;

  console.log('[BULLETPROOF] Fields:', fields, 'Count:', count, 'Confidence:', confidence);
  return { fields, confidence, count };
}

async function extractWithOCR(buffer, mimeType = 'application/pdf') {
  console.log('[BULLETPROOF] Using OCR.space, mimeType:', mimeType);
  const formData = new URLSearchParams();
  formData.append('base64Image', `data:${mimeType};base64,${buffer.toString('base64')}`);
  formData.append('apikey', process.env.OCR_SPACE_API_KEY || 'K89008606188957');
  formData.append('language', 'eng');
  formData.append('OCREngine', '2');
  formData.append('detectOrientation', 'true');
  formData.append('scale', 'true');

  const response = await fetch('https://api.ocr.space/parse/image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString()
  });
  const data = await response.json();

  if (data.IsErroredOnProcessing) {
    console.error('[BULLETPROOF] OCR error:', data.ErrorMessage);
    throw new Error('OCR failed');
  }
  
  const text = data.ParsedResults?.[0]?.ParsedText || '';
  console.log('[BULLETPROOF] OCR extracted', text.length, 'chars');
  return text;
}

export async function POST(request) {
  const startTime = Date.now();
  console.log('[BULLETPROOF] === NEW REQUEST ===');

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return Response.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const pdfBase64 = buffer.toString('base64');
    const mimeType = file.type || 'application/pdf';
    const fileName = file.name || 'document';
    const isPDF = mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');
    let text = '';
    let method = 'unpdf';

    console.log('[BULLETPROOF] File:', fileName, 'Type:', mimeType, 'Size:', buffer.length, 'isPDF:', isPDF);

    // Layer 1: Try digital extraction (only for PDFs)
    if (isPDF) {
      try {
        const { text: extracted } = await extractText(new Uint8Array(buffer), { mergePages: true });
        console.log('[BULLETPROOF] Digital extracted:', extracted.length, 'chars');
        if (extracted.length > 200) text = extracted;
      } catch (e) {
        console.log('[BULLETPROOF] Digital failed:', e.message);
      }
    }

    // Layer 2: Fallback to OCR if low text OR if it's an image
    if (text.length < 200) {
      try {
        text = await extractWithOCR(buffer, mimeType);
        method = 'ocr';
      } catch (e) {
        console.log('[BULLETPROOF] OCR failed:', e.message);
        // Layer 3: Return manual entry form
        return Response.json({ 
          success: true, 
          fields: { grossSalary: 0, tds: 0, standardDeduction: 50000, deductions80C: 0 }, 
          confidence: 0, 
          method: 'manual',
          message: 'Could not read document. Please enter values manually.',
          pdfBase64,
          processingTime: `${((Date.now() - startTime) / 1000).toFixed(1)}s`
        });
      }
    }

    const { fields, confidence, count } = await extractFields(text);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);

    console.log('[BULLETPROOF] Done in', elapsed, 's, method:', method);

    return Response.json({ 
      success: true, 
      fields, 
      confidence, 
      method, 
      extractedCount: `${count}/4`,
      message: count === 4 ? 'Perfect extraction!' : count >= 2 ? 'Partial extraction - please verify' : 'Low confidence - please verify all fields',
      pdfBase64,
      processingTime: `${elapsed}s`
    });

  } catch (error) {
    console.error('[BULLETPROOF] Error:', error);
    return Response.json({
      success: true,
      fields: { grossSalary: 0, tds: 0, standardDeduction: 50000, deductions80C: 0 },
      confidence: 0,
      method: 'error_fallback',
      message: 'Processing error. Please enter values manually.',
      error: error.message
    });
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Allow': 'OPTIONS, POST',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS, POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}
