import { extractText } from 'unpdf';

/**
 * PRODUCTION ITR EXTRACTOR - SIMPLIFIED FOR SERVERLESS
 * 
 * NO TESSERACT - Too slow for Vercel serverless timeouts
 * 
 * Layer 1: Digital PDF extraction (unpdf) - instant, free
 * Layer 2: OCR.space API - fast, reliable for serverless
 * Layer 3: Intelligent context-aware field detection
 * Layer 4: Always returns editable fields (never fails)
 * 
 * NO Tesseract (too slow for serverless)
 */

// ═══════════════════════════════════════════════════════════════════════════════
// INTELLIGENT FIELD DETECTION
// ═══════════════════════════════════════════════════════════════════════════════

function extractFieldsIntelligent(text) {
  const fields = { grossSalary: 0, tds: 0, standardDeduction: 0, deductions80C: 0 };
  
  const normalized = text.replace(/\s+/g, ' ');
  
  console.log('\n═══════════════════════════════════════════');
  console.log('FIELD EXTRACTION');
  console.log('═══════════════════════════════════════════');
  console.log('Text length:', text.length);
  
  // ─────────────────────────────────────────────────────
  // GROSS SALARY
  // ─────────────────────────────────────────────────────
  console.log('\n[1] GROSS SALARY:');
  const salaryPatterns = [
    /(?:section\s*)?17\s*\(\s*1\s*\)[^\d]{0,100}(\d[\d,]*)/gi,
    /gross\s+salary[^\d]{0,100}(\d[\d,]*)/gi,
    /salary\s+as\s+per[^\d]{0,100}(\d[\d,]*)/gi,
    /income\s+(?:from|under)\s+salary[^\d]{0,100}(\d[\d,]*)/gi,
  ];
  
  for (const pattern of salaryPatterns) {
    const matches = [...normalized.matchAll(pattern)];
    for (const m of matches) {
      const val = parseInt(m[1].replace(/,/g, ''), 10);
      if (val >= 100000 && val <= 99999999) {
        fields.grossSalary = val;
        console.log(`  ✓ Found: ${val}`);
        break;
      }
    }
    if (fields.grossSalary) break;
  }
  if (!fields.grossSalary) console.log('  ✗ Not found');
  
  // ─────────────────────────────────────────────────────
  // TDS
  // ─────────────────────────────────────────────────────
  console.log('\n[2] TDS:');
  const tdsPatterns = [
    /total\s*\(\s*rs\.?\s*\)[^\d]{0,50}(\d[\d,]*)/gi,
    /tax\s+deducted[^\d]{0,100}(\d[\d,]*)/gi,
    /amount\s+of\s+tax[^\d]{0,100}(\d[\d,]*)/gi,
    /tds[^\d]{0,50}(\d[\d,]*)/gi,
    /total[^\d]{0,30}(\d[\d,]*)/gi,
  ];
  
  let tdsMatches = [];
  for (const pattern of tdsPatterns) {
    const matches = [...normalized.matchAll(pattern)];
    for (const m of matches) {
      const val = parseInt(m[1].replace(/,/g, ''), 10);
      if (val >= 1000 && val <= 5000000) {
        tdsMatches.push(val);
      }
    }
  }
  if (tdsMatches.length > 0) {
    fields.tds = tdsMatches[tdsMatches.length - 1]; // Last match (usually the total)
    console.log(`  ✓ Found: ${fields.tds} (from ${tdsMatches.length} candidates)`);
  } else {
    console.log('  ✗ Not found');
  }
  
  // ─────────────────────────────────────────────────────
  // STANDARD DEDUCTION
  // ─────────────────────────────────────────────────────
  console.log('\n[3] STANDARD DEDUCTION:');
  const stdPatterns = [
    /standard\s+deduction[^\d]{0,100}(\d[\d,]*)/gi,
    /16\s*\(\s*ia\s*\)[^\d]{0,100}(\d[\d,]*)/gi,
    /u\/s\s+16[^\d]{0,100}(\d[\d,]*)/gi,
  ];
  
  for (const pattern of stdPatterns) {
    const matches = [...normalized.matchAll(pattern)];
    for (const m of matches) {
      const val = parseInt(m[1].replace(/,/g, ''), 10);
      if (val >= 10000 && val <= 75000) {
        fields.standardDeduction = val;
        console.log(`  ✓ Found: ${val}`);
        break;
      }
    }
    if (fields.standardDeduction) break;
  }
  if (!fields.standardDeduction) console.log('  ✗ Not found');
  
  // ─────────────────────────────────────────────────────
  // 80C DEDUCTION
  // ─────────────────────────────────────────────────────
  console.log('\n[4] 80C DEDUCTION:');
  const c80Patterns = [
    /(?:section\s+)?80\s*c[^\d]{0,150}(\d[\d,]*)/gi,
    /chapter\s+vi[^\d]{0,150}(\d[\d,]*)/gi,
    /deduction.*?80[^\d]{0,100}(\d[\d,]*)/gi,
  ];
  
  for (const pattern of c80Patterns) {
    const matches = [...normalized.matchAll(pattern)];
    for (const m of matches) {
      const val = parseInt(m[1].replace(/,/g, ''), 10);
      if (val >= 1000 && val <= 150000) {
        fields.deductions80C = val;
        console.log(`  ✓ Found: ${val}`);
        break;
      }
    }
    if (fields.deductions80C) break;
  }
  if (!fields.deductions80C) console.log('  ✗ Not found');
  
  const count = Object.values(fields).filter(v => v > 0).length;
  const confidence = count >= 3 ? 95 : count >= 2 ? 75 : count >= 1 ? 50 : 20;
  
  console.log('\n═══════════════════════════════════════════');
  console.log(`RESULT: ${count}/4 fields, ${confidence}% confidence`);
  console.log('═══════════════════════════════════════════\n');
  
  return { fields, confidence, count };
}

// ═══════════════════════════════════════════════════════════════════════════════
// OCR.SPACE EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════════

async function extractWithOCRSpace(buffer, fileType) {
  console.log('\n═══════════════════════════════════════════');
  console.log('OCR.SPACE API');
  console.log('═══════════════════════════════════════════');
  
  const base64Data = buffer.toString('base64');
  const base64Image = `data:${fileType};base64,${base64Data}`;
  
  const formData = new URLSearchParams();
  formData.append('base64Image', base64Image);
  formData.append('apikey', process.env.OCR_SPACE_API_KEY || 'K89008606188957');
  formData.append('language', 'eng');
  formData.append('isOverlayRequired', 'false');
  formData.append('detectOrientation', 'true');
  formData.append('scale', 'true');
  formData.append('OCREngine', '2');
  
  console.log('Calling OCR.space...');
  const start = Date.now();
  
  const response = await fetch('https://api.ocr.space/parse/image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString()
  });
  
  const data = await response.json();
  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  
  console.log(`Response in ${elapsed}s`);
  
  if (data.IsErroredOnProcessing) {
    throw new Error(data.ErrorMessage?.[0] || 'OCR failed');
  }
  
  if (!data.ParsedResults?.length) {
    throw new Error('No text found');
  }
  
  const text = data.ParsedResults[0].ParsedText || '';
  console.log(`Extracted: ${text.length} chars`);
  
  // Log sample
  console.log('\n─── OCR SAMPLE (first 1000 chars) ───');
  console.log(text.substring(0, 1000));
  console.log('─── END SAMPLE ───\n');
  
  return text;
}

// ═══════════════════════════════════════════════════════════════════════════════
// DIGITAL PDF EXTRACTION
// ═══════════════════════════════════════════════════════════════════════════════

async function extractDigitalPDF(buffer) {
  console.log('\n═══════════════════════════════════════════');
  console.log('DIGITAL PDF EXTRACTION');
  console.log('═══════════════════════════════════════════');
  
  try {
    const { text } = await extractText(new Uint8Array(buffer), { mergePages: true });
    console.log(`Extracted: ${text.length} chars`);
    
    if (text.length > 500) {
      console.log('✓ Sufficient text');
      console.log('\n─── SAMPLE (first 1000 chars) ───');
      console.log(text.substring(0, 1000));
      console.log('─── END SAMPLE ───\n');
      return { text, success: true };
    } else {
      console.log('✗ Insufficient text (scanned PDF?)');
      return { text: '', success: false };
    }
  } catch (err) {
    console.log('✗ Extraction failed:', err.message);
    return { text: '', success: false };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════════════════════

export async function POST(request) {
  const startTime = Date.now();
  
  console.log('\n╔═══════════════════════════════════════════╗');
  console.log('║  ITR EXTRACTOR - REQUEST                  ║');
  console.log('╚═══════════════════════════════════════════╝');
  console.log('Time:', new Date().toISOString());
  
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return Response.json({ 
        success: true,
        requiresManualEntry: true,
        fields: { grossSalary: 0, tds: 0, standardDeduction: 0, deductions80C: 0 },
        message: 'No file provided. Please enter values manually.'
      });
    }
    
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileType = file.type || 'application/pdf';
    const fileName = file.name || 'document.pdf';
    
    console.log(`📄 ${fileName} (${fileType}, ${(buffer.length / 1024).toFixed(1)}KB)`);
    
    let extractedText = '';
    let method = '';
    
    // ═══════════════════════════════════════════════════════
    // LAYER 1: Digital PDF
    // ═══════════════════════════════════════════════════════
    
    if (fileType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
      const result = await extractDigitalPDF(buffer);
      if (result.success) {
        extractedText = result.text;
        method = 'digital_pdf';
      }
    }
    
    // ═══════════════════════════════════════════════════════
    // LAYER 2: OCR.space
    // ═══════════════════════════════════════════════════════
    
    if (!extractedText) {
      console.log('\n⚠️ Digital failed, using OCR.space...');
      try {
        extractedText = await extractWithOCRSpace(buffer, fileType);
        method = 'ocr_space';
      } catch (err) {
        console.error('❌ OCR.space error:', err.message);
        
        // Return editable empty fields
        return Response.json({
          success: true,
          requiresManualEntry: true,
          fields: { grossSalary: 0, tds: 0, standardDeduction: 0, deductions80C: 0 },
          confidence: 0,
          extractedCount: '0/4',
          method: 'manual',
          processingTime: `${((Date.now() - startTime) / 1000).toFixed(1)}s`,
          message: 'Could not read document. Please enter values from your Form 16.'
        });
      }
    }
    
    // ═══════════════════════════════════════════════════════
    // LAYER 3: Field extraction
    // ═══════════════════════════════════════════════════════
    
    const { fields, confidence, count } = extractFieldsIntelligent(extractedText);
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    
    console.log('╔═══════════════════════════════════════════╗');
    console.log('║  RESPONSE                                 ║');
    console.log('╚═══════════════════════════════════════════╝');
    console.log(`Method: ${method}`);
    console.log(`Time: ${elapsed}s`);
    console.log(`Fields: ${count}/4`);
    console.log(`Confidence: ${confidence}%`);
    
    return Response.json({
      success: true,
      fields,
      confidence: confidence / 100,
      extractedCount: `${count}/4`,
      method,
      processingTime: `${elapsed}s`,
      processingCost: method === 'ocr_space' ? 0.4 : 0,
      requiresManualEntry: count === 0,
      textLength: extractedText.length,
      message: count >= 3
        ? 'Extracted successfully! Please verify values.'
        : count >= 1
        ? 'Partial extraction. Please verify and fill missing values.'
        : 'Could not auto-extract. Please enter values from your Form 16.'
    });
    
  } catch (error) {
    console.error('💥 Error:', error.message);
    
    return Response.json({
      success: true,
      requiresManualEntry: true,
      fields: { grossSalary: 0, tds: 0, standardDeduction: 0, deductions80C: 0 },
      confidence: 0,
      extractedCount: '0/4',
      method: 'error_fallback',
      processingTime: `${((Date.now() - startTime) / 1000).toFixed(1)}s`,
      message: 'Processing error. Please enter values from your Form 16.',
      error: error.message
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// OPTIONS HANDLER (CORS)
// ═══════════════════════════════════════════════════════════════════════════════

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
