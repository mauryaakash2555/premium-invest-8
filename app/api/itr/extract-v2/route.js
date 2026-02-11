import { extractText } from 'unpdf';

/**
 * ACCURATE ITR EXTRACTOR (PRODUCTION)
 * Layer 1: Digital PDF (unpdf)
 * Layer 2: OCR.space (fast, reliable in serverless)
 *
 * Uses context-aware regex so we don't pick random numbers.
 */

function extractFieldsAccurate(text) {
  const fields = { grossSalary: 0, tds: 0, standardDeduction: 0, deductions80C: 0 };

  const normalized = text.replace(/\s+/g, ' ');

  console.log('\n=== EXTRACTION DEBUG ===');

  // GROSS SALARY - Must be near "section 17(1)" or "gross salary"
  const salaryContext = normalized.match(/(?:section\s+17\s*\(\s*1\s*\)|gross\s+salary)(.{0,200})/is);
  if (salaryContext) {
    const numbers = salaryContext[1].match(/\d{6,8}/g);
    if (numbers) {
      for (const num of numbers) {
        const val = parseInt(num, 10);
        if (val >= 100000 && val <= 99999999) {
          fields.grossSalary = val;
          console.log('✓ Gross Salary:', val, '(context match)');
          break;
        }
      }
    }
  }

  // TDS - Prefer "Total" row (take last occurrence)
  const tdsMatches = [...normalized.matchAll(/total[^\d]{0,50}(\d{5,7})/gis)];
  if (tdsMatches.length > 0) {
    const lastMatch = tdsMatches[tdsMatches.length - 1];
    const val = parseInt(lastMatch[1], 10);
    if (val >= 1000 && val <= 10000000) {
      fields.tds = val;
      console.log('✓ TDS:', val, '(total row)');
    }
  }

  // Fallback TDS
  if (!fields.tds) {
    const match = normalized.match(/tax\s+deducted\s+at\s+source[^\d]{0,100}(\d{5,7})/is);
    if (match) {
      const val = parseInt(match[1], 10);
      if (val >= 1000 && val <= 10000000) {
        fields.tds = val;
        console.log('✓ TDS:', val, '(tax deducted at source)');
      }
    }
  }

  // STANDARD DEDUCTION - usually 50000, but only if near the right keywords
  if (normalized.match(/(?:standard\s+deduction|16\s*\(\s*ia\s*\))/is)) {
    if (text.includes('50000')) {
      fields.standardDeduction = 50000;
      console.log('✓ Standard Deduction: 50000');
    } else {
      const match = normalized.match(/(?:standard\s+deduction|16\s*\(\s*ia\s*\))[^\d]{0,100}(\d{5})/is);
      if (match) {
        fields.standardDeduction = parseInt(match[1], 10);
        console.log('✓ Standard Deduction:', fields.standardDeduction);
      }
    }
  }

  // 80C - Must be near "80C"
  const c80Context = normalized.match(/(?:section\s+)?80\s*c(.{0,150})/is);
  if (c80Context) {
    const numbers = c80Context[1].match(/\d{5,7}/g);
    if (numbers) {
      for (const num of numbers) {
        const val = parseInt(num, 10);
        if (val >= 1000 && val <= 150000) {
          fields.deductions80C = val;
          console.log('✓ 80C:', val);
          break;
        }
      }
    }
  }

  console.log('=== END DEBUG ===\n');

  return fields;
}

async function extractWithOCRSpace(buffer, fileType) {
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

  console.log('Calling OCR.space API...');

  const response = await fetch('https://api.ocr.space/parse/image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: formData.toString()
  });

  const data = await response.json();

  if (data.IsErroredOnProcessing) {
    const error = data.ErrorMessage?.[0] || 'OCR processing failed';
    console.error('OCR Error:', error);
    throw new Error(error);
  }

  if (!data.ParsedResults || data.ParsedResults.length === 0) {
    throw new Error('No text found in document');
  }

  const extractedText = data.ParsedResults[0].ParsedText || '';

  console.log('OCR extracted length:', extractedText.length);
  console.log('OCR sample (first 1000 chars):', extractedText.substring(0, 1000));

  if (extractedText.length < 50) {
    throw new Error('Insufficient text extracted - document may be unreadable');
  }

  return extractedText;
}

export async function POST(request) {
  const start = Date.now();

  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return Response.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileType = file.type || 'application/pdf';
    const fileName = file.name || 'upload.pdf';

    console.log(`\n📄 Processing: ${fileName} (${fileType}, ${(buffer.length / 1024).toFixed(0)}KB)`);

    let text = '';
    let method = '';
    let processingCost = 0;

    // Layer 1: Digital PDF
    if (fileType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
      console.log('⏳ Layer 1: Digital PDF extraction...');
      try {
        const result = await extractText(new Uint8Array(buffer), { mergePages: true });
        console.log('Digital extracted length:', result.text?.length || 0);

        if ((result.text || '').length > 50) {
          text = result.text;
          method = 'digital_pdf';
          processingCost = 0;
          console.log('✅ Digital PDF extraction used');
        } else {
          console.log('⚠️ Low/empty digital text, switching to OCR');
        }
      } catch (err) {
        console.log('⚠️ Digital extraction failed, switching to OCR');
      }
    }

    // Layer 2: OCR.space
    if (!text) {
      console.log('⏳ Layer 2: OCR.space...');
      text = await extractWithOCRSpace(buffer, fileType);
      method = 'ocr_space';
      processingCost = 0.4;
      console.log('✅ OCR.space extraction used');
    }

    // Extract fields
    console.log('🔍 Extracting fields (context-aware)...');
    const fields = extractFieldsAccurate(text);

    const count = Object.values(fields).filter(v => v > 0).length;
    const time = ((Date.now() - start) / 1000).toFixed(2);

    console.log(`📊 Extracted ${count}/4 fields in ${time}s via ${method}`);

    return Response.json({
      success: true, // Always true if we got text (lets UI proceed)
      fields,
      confidence: count >= 3 ? 0.95 : count >= 2 ? 0.75 : count >= 1 ? 0.6 : 0.3,
      extractedCount: `${count}/4`,
      method,
      processingTime: `${time}s`,
      processingCost,
      requiresManualEntry: count === 0,
      textLength: text.length,
      message: count >= 3
        ? 'Extracted successfully! Please verify values.'
        : count >= 1
        ? 'Partial extraction. Verify and fill missing values.'
        : 'Could not auto-extract fields. Please enter values manually.'
    });
  } catch (error) {
    console.error('💥 Fatal error:', error);

    return Response.json({
      success: false,
      error: 'Processing failed',
      details: error.message,
      fields: { grossSalary: 0, tds: 0, standardDeduction: 0, deductions80C: 0 },
      confidence: 0,
      extractedCount: '0/4'
    }, { status: 500 });
  }
}
