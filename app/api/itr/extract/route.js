import { extractText } from 'unpdf';

/**
 * ⛔⛔⛔ BANNED COLORS - See BANNED_COLORS.md ⛔⛔⛔
 * 
 * ROCKSOLID ITR EXTRACTOR - Swiss Bank Level Reliability
 * 
 * Layer 1: Digital PDF extraction (unpdf) - instant, free
 * Layer 2: OCR.space API - fast, ~₹0.08 per call
 * Layer 3: GPT-3.5-turbo validation - ~₹0.50 per call (only for low confidence)
 * Layer 4: Never fails - always returns editable fields
 * 
 * PDF Preview: Sends base64 only if <1MB to avoid Vercel response limits
 */

// ═══════════════════════════════════════════════════════════════════════════════
// FIELD EXTRACTION - Flexible regex patterns
// ═══════════════════════════════════════════════════════════════════════════════

async function extractFields(text) {
  const fields = { grossSalary: 0, tds: 0, standardDeduction: 0, deductions80C: 0 };
  const cleanText = text.replace(/[, ]/g, '').toLowerCase();

  console.log('[ROCKSOLID] Extracting fields from', text.length, 'chars');

  // Flexible Gross Salary - multiple patterns
  let match = cleanText.match(/(section17\(1\)|grosssalary|salaryaspersection17\(1\)|17\(1\)).*?(\d{6,8})/);
  if (match) fields.grossSalary = parseInt(match[2]);

  // Flexible TDS - multiple patterns
  match = cleanText.match(/(totaltaxdeducted|amountoftaxdeducted|tds|totalrs|total\(rs\.\??\)).*?(\d{5,7})/);
  if (match) fields.tds = parseInt(match[2]);

  // Flexible Standard Deduction - multiple patterns
  match = cleanText.match(/(standarddeduction|section16\(ia\)|standarddeductionundersection16|16\(ia\)).*?(\d{5,6})/);
  if (match) fields.standardDeduction = parseInt(match[2]);
  else if (cleanText.includes('50000')) fields.standardDeduction = 50000;

  // Flexible 80C - multiple patterns
  match = cleanText.match(/(80c|section80c|deductionunder80c).*?(\d{5,7})/);
  if (match) fields.deductions80C = parseInt(match[2]);

  const count = Object.values(fields).filter(v => v > 0).length;
  const confidence = count >= 4 ? 0.95 : count >= 3 ? 0.85 : count >= 2 ? 0.70 : count >= 1 ? 0.50 : 0.20;

  console.log('[ROCKSOLID] Fields:', fields, 'Count:', count, 'Confidence:', confidence);
  return { fields, confidence, count };
}

// ═══════════════════════════════════════════════════════════════════════════════
// GPT VALIDATION - For low confidence cases
// ═══════════════════════════════════════════════════════════════════════════════

async function validateWithGPT(text) {
  console.log('[ROCKSOLID] Using GPT-3.5-turbo for validation...');
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [{
        role: 'system',
        content: 'You are a Form 16 data extractor. Extract financial values from Indian Form 16 tax documents. Return ONLY valid JSON, no explanation.'
      }, {
        role: 'user',
        content: `Extract these fields from this Form 16 text. Return ONLY JSON:
{"grossSalary": number, "tds": number, "standardDeduction": number, "deductions80C": number}

If you cannot find a field, use 0. For standardDeduction, use 50000 if mentioned but no value found.

Text:
${text.substring(0, 4000)}`
      }],
      temperature: 0,
      max_tokens: 200
    })
  });

  const data = await response.json();
  
  if (data.error) {
    console.error('[ROCKSOLID] GPT error:', data.error);
    throw new Error(data.error.message);
  }

  const content = data.choices?.[0]?.message?.content || '{}';
  console.log('[ROCKSOLID] GPT response:', content);
  
  // Parse JSON from response
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('No JSON in GPT response');
  
  const parsed = JSON.parse(jsonMatch[0]);
  return {
    grossSalary: parseInt(parsed.grossSalary) || 0,
    tds: parseInt(parsed.tds) || 0,
    standardDeduction: parseInt(parsed.standardDeduction) || 0,
    deductions80C: parseInt(parsed.deductions80C) || 0
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// OCR.SPACE EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════════

async function extractWithOCR(buffer, mimeType = 'application/pdf') {
  console.log('[ROCKSOLID] Using OCR.space, mimeType:', mimeType);
  
  const formData = new URLSearchParams();
  formData.append('base64Image', `data:${mimeType};base64,${buffer.toString('base64')}`);
  formData.append('apikey', process.env.OCR_SPACE_API_KEY || 'K89008606188957');
  formData.append('language', 'eng');
  formData.append('OCREngine', '2');
  formData.append('detectOrientation', 'true');
  formData.append('scale', 'true');
  formData.append('isOverlayRequired', 'false');

  const response = await fetch('https://api.ocr.space/parse/image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString()
  });
  const data = await response.json();

  if (data.IsErroredOnProcessing) {
    console.error('[ROCKSOLID] OCR error:', data.ErrorMessage);
    throw new Error('OCR failed');
  }
  
  const text = data.ParsedResults?.[0]?.ParsedText || '';
  console.log('[ROCKSOLID] OCR extracted', text.length, 'chars');
  return text;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════════════════════

export async function POST(request) {
  const startTime = Date.now();
  console.log('[ROCKSOLID] === NEW REQUEST ===');

  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return Response.json({
        success: true,
        fields: { grossSalary: 0, tds: 0, standardDeduction: 50000, deductions80C: 0 },
        confidence: 0,
        method: 'manual',
        message: 'No file provided. Please enter values from your Form 16.',
        pdfBase64: null,
        previewMimeType: 'application/pdf',
        pdfTooLarge: false,
        processingTime: `${((Date.now() - startTime) / 1000).toFixed(1)}s`
      });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || 'application/pdf';
    const fileName = file.name || 'document';
    const isPDF = mimeType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');
    
    // PDF Preview: Only send base64 if <1MB to avoid Vercel response limits
    const pdfTooLarge = buffer.length >= 1000000;
    const previewMimeType = mimeType || (isPDF ? 'application/pdf' : 'application/octet-stream');
    const pdfBase64 = pdfTooLarge ? null : buffer.toString('base64');
    
    let text = '';
    let method = 'unpdf';
    let usedGPT = false;

    console.log('[ROCKSOLID] File:', fileName, 'Type:', mimeType, 'Size:', buffer.length, 'isPDF:', isPDF, 'tooLarge:', pdfTooLarge);

    // ═══════════════════════════════════════════════════════════════
    // LAYER 1: Digital PDF extraction
    // ═══════════════════════════════════════════════════════════════
    if (isPDF) {
      try {
        const { text: extracted } = await extractText(new Uint8Array(buffer), { mergePages: true });
        console.log('[ROCKSOLID] Digital extracted:', extracted.length, 'chars');
        if (extracted.length > 200) text = extracted;
      } catch (e) {
        console.log('[ROCKSOLID] Digital failed:', e.message);
      }
    }

    // ═══════════════════════════════════════════════════════════════
    // LAYER 2: OCR.space fallback
    // ═══════════════════════════════════════════════════════════════
    if (text.length < 200) {
      try {
        text = await extractWithOCR(buffer, mimeType);
        method = 'ocr';
      } catch (e) {
        console.log('[ROCKSOLID] OCR failed:', e.message);
        // Return manual entry form
        return Response.json({ 
          success: true, 
          fields: { grossSalary: 0, tds: 0, standardDeduction: 50000, deductions80C: 0 }, 
          confidence: 0, 
          method: 'manual',
          message: 'Could not read document. Please enter values from your Form 16.',
          pdfBase64,
          previewMimeType,
          pdfTooLarge,
          processingTime: `${((Date.now() - startTime) / 1000).toFixed(1)}s`
        });
      }
    }

    // Extract fields with regex
    let { fields, confidence, count } = await extractFields(text);

    // ═══════════════════════════════════════════════════════════════
    // LAYER 3: GPT validation for low confidence
    // ═══════════════════════════════════════════════════════════════
    if (count < 3 && process.env.OPENAI_API_KEY) {
      try {
        console.log('[ROCKSOLID] Low confidence, trying GPT...');
        const gptFields = await validateWithGPT(text);
        
        // Merge GPT results (prefer GPT values if we had 0)
        if (gptFields.grossSalary > 0 && fields.grossSalary === 0) fields.grossSalary = gptFields.grossSalary;
        if (gptFields.tds > 0 && fields.tds === 0) fields.tds = gptFields.tds;
        if (gptFields.standardDeduction > 0 && fields.standardDeduction === 0) fields.standardDeduction = gptFields.standardDeduction;
        if (gptFields.deductions80C > 0 && fields.deductions80C === 0) fields.deductions80C = gptFields.deductions80C;
        
        method += '+gpt';
        usedGPT = true;
        
        // Recalculate count and confidence after GPT
        const newCount = Object.values(fields).filter(v => v > 0).length;
        confidence = newCount >= 4 ? 0.92 : newCount >= 3 ? 0.85 : newCount >= 2 ? 0.70 : 0.50;
        count = newCount;
        
        console.log('[ROCKSOLID] After GPT:', fields, 'Count:', count);
      } catch (e) {
        console.log('[ROCKSOLID] GPT failed:', e.message);
        // Continue without GPT
      }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('[ROCKSOLID] Done in', elapsed, 's, method:', method, 'fields:', count);

    return Response.json({ 
      success: true, 
      fields, 
      confidence, 
      method, 
      extractedCount: `${count}/4`,
      usedGPT,
      message: count >= 4 
        ? 'Perfect extraction! Please verify.' 
        : count >= 3 
        ? 'Good extraction - please verify.' 
        : count >= 2
        ? 'Partial extraction - please verify and complete.'
        : 'Low confidence - please review all fields.',
      pdfBase64,
      previewMimeType,
      pdfTooLarge,
      processingTime: `${elapsed}s`
    });

  } catch (error) {
    console.error('[ROCKSOLID] Error:', error);
    return Response.json({
      success: true,
      fields: { grossSalary: 0, tds: 0, standardDeduction: 50000, deductions80C: 0 },
      confidence: 0,
      method: 'error_fallback',
      message: 'Processing error. Please enter values from your Form 16.',
      error: error.message,
      pdfBase64: null,
      previewMimeType: 'application/pdf',
      pdfTooLarge: true
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
