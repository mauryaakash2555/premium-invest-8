import { extractText } from 'unpdf';
import { createWorker } from 'tesseract.js';

/**
 * FIXED - ACCURATE FIELD EXTRACTION
 * Works with garbage PDFs but gets CORRECT values
 */

function extractFieldsAccurate(text) {
  const fields = { grossSalary: 0, tds: 0, standardDeduction: 0, deductions80C: 0 };
  
  // Normalize text
  const normalized = text.replace(/\s+/g, ' ');
  const lines = text.split('\n').map(l => l.trim());
  
  console.log('\n=== EXTRACTION DEBUG ===');
  
  // GROSS SALARY - Must be near "section 17(1)" or "Gross Salary"
  // Look within 100 chars of keywords
  const salaryContext = normalized.match(/(?:section\s+17\s*\(\s*1\s*\)|gross\s+salary)(.{0,200})/is);
  if (salaryContext) {
    const numbers = salaryContext[1].match(/\d{6,8}/g);
    if (numbers) {
      // Take the FIRST 7-8 digit number after the keyword
      for (const num of numbers) {
        const val = parseInt(num);
        if (val >= 1000000 && val <= 99999999) {
          fields.grossSalary = val;
          console.log('✓ Gross Salary:', val, '(found after "section 17(1)")');
          break;
        }
      }
    }
  }
  
  // TDS - Must be in "Total" row of tax deduction table
  // Look for "Total" followed by numbers, take the LAST occurrence
  const tdsMatches = [...normalized.matchAll(/total[^\d]{0,50}(\d{5,7})/gis)];
  if (tdsMatches.length > 0) {
    // Take LAST match (usually the total row)
    const lastMatch = tdsMatches[tdsMatches.length - 1];
    const val = parseInt(lastMatch[1]);
    if (val >= 10000 && val <= 5000000) {
      fields.tds = val;
      console.log('✓ TDS:', val, '(found in Total row)');
    }
  }
  
  // If no TDS found, try "tax deducted at source"
  if (!fields.tds) {
    const match = normalized.match(/tax\s+deducted\s+at\s+source[^\d]{0,100}(\d{5,7})/is);
    if (match) {
      const val = parseInt(match[1]);
      if (val >= 10000 && val <= 5000000) {
        fields.tds = val;
        console.log('✓ TDS:', val, '(found after "tax deducted at source")');
      }
    }
  }
  
  // STANDARD DEDUCTION - Usually exactly 50000
  // Look for 50000 near "standard deduction" or "16(ia)"
  if (normalized.match(/(?:standard\s+deduction|16\s*\(\s*ia\s*\))/is)) {
    if (text.includes('50000')) {
      fields.standardDeduction = 50000;
      console.log('✓ Standard Deduction: 50000 (common value found)');
    } else {
      // Look for other 5-digit numbers near "standard deduction"
      const match = normalized.match(/(?:standard\s+deduction|16\s*\(\s*ia\s*\))[^\d]{0,100}(\d{5})/is);
      if (match) {
        fields.standardDeduction = parseInt(match[1]);
        console.log('✓ Standard Deduction:', match[1]);
      }
    }
  }
  
  // 80C - Must be near "80C" or "section 80C"
  const c80Context = normalized.match(/(?:section\s+)?80\s*c(.{0,150})/is);
  if (c80Context) {
    const numbers = c80Context[1].match(/\d{5,7}/g);
    if (numbers) {
      // Take FIRST number after "80C" that's <= 150000
      for (const num of numbers) {
        const val = parseInt(num);
        if (val >= 10000 && val <= 150000) {
          fields.deductions80C = val;
          console.log('✓ 80C:', val, '(found after "80C")');
          break;
        }
      }
    }
  }
  
  console.log('=== END DEBUG ===\n');
  
  return fields;
}

async function extractWithTesseract(buffer, isImage = false) {
  const worker = await createWorker('eng');
  
  try {
    console.log('Configuring Tesseract...');
    await worker.setParameters({
      tessedit_pageseg_mode: '1',
      tessedit_ocr_engine_mode: '2',
    });
    
    console.log('Running OCR...');
    const { data: { text, confidence } } = await worker.recognize(buffer);
    
    console.log(`OCR completed: ${text.length} chars, ${confidence.toFixed(1)}% confidence`);
    
    // Log sample for debugging
    console.log('Sample (first 1000 chars):', text.substring(0, 1000));
    
    return text;
    
  } finally {
    await worker.terminate();
  }
}

export async function POST(request) {
  const start = Date.now();
  
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file) return Response.json({ success: false, error: 'No file' }, { status: 400 });
    
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileType = file.type;
    const fileName = file.name;
    
    console.log(`\n📄 Processing: ${fileName} (${(buffer.length/1024).toFixed(0)}KB)`);
    
    let text = '';
    let method = '';
    
    // LAYER 1: Digital PDF
    if (fileType === 'application/pdf') {
      console.log('⏳ Layer 1: Digital PDF...');
      try {
        const result = await extractText(new Uint8Array(buffer), { mergePages: true });
        // Use a much lower threshold: some valid digital PDFs have <500 chars,
        // and we should avoid slow OCR when digital text exists.
        if (result.text.length > 50) {
          text = result.text;
          method = 'digital_pdf';
          console.log(`✅ Digital: ${text.length} chars`);
        } else {
          console.log('⚠️ Low text, using OCR');
        }
      } catch (err) {
        console.log('⚠️ Digital failed, using OCR');
      }
    }
    
    // LAYER 2: Tesseract OCR
    if (!text) {
      console.log('⏳ Layer 2: Tesseract OCR...');
      
      try {
        const isImage = fileType.startsWith('image/');
        text = await extractWithTesseract(buffer, isImage);
        method = 'tesseract_ocr';
        console.log(`✅ OCR: ${text.length} chars`);
        
      } catch (err) {
        console.error('❌ OCR failed:', err.message);
        
        return Response.json({
          success: false,
          requiresManualEntry: true,
          error: 'Could not read document. Please enter values manually.',
          fields: { grossSalary: 0, tds: 0, standardDeduction: 0, deductions80C: 0 },
          confidence: 0,
          extractedCount: '0/4'
        }, { status: 500 });
      }
    }
    
    // EXTRACT FIELDS with accurate regex
    console.log('🔍 Extracting fields with context-aware patterns...');
    const fields = extractFieldsAccurate(text);
    
    const count = Object.values(fields).filter(v => v > 0).length;
    const time = ((Date.now() - start) / 1000).toFixed(1);
    
    console.log(`\n📊 FINAL RESULTS:`);
    console.log(`   Extracted: ${count}/4 fields`);
    console.log(`   Time: ${time}s`);
    console.log(`   Method: ${method}`);
    if (fields.grossSalary) console.log(`   Gross Salary: ₹${fields.grossSalary.toLocaleString('en-IN')}`);
    if (fields.tds) console.log(`   TDS: ₹${fields.tds.toLocaleString('en-IN')}`);
    if (fields.standardDeduction) console.log(`   Standard Deduction: ₹${fields.standardDeduction.toLocaleString('en-IN')}`);
    if (fields.deductions80C) console.log(`   80C: ₹${fields.deductions80C.toLocaleString('en-IN')}`);
    
    return Response.json({
      success: count >= 1,
      fields,
      confidence: count >= 3 ? 0.95 : count >= 2 ? 0.75 : count >= 1 ? 0.6 : 0.3,
      extractedCount: `${count}/4`,
      method,
      processingTime: `${time}s`,
      processingCost: 0,
      requiresManualEntry: count === 0,
      message: count >= 3
        ? 'Extracted successfully! Please verify values.'
        : count >= 1
        ? 'Partial extraction. Verify and fill missing values.'
        : 'Please enter values manually.'
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
