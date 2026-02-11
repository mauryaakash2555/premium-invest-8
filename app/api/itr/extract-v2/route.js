import { extractText } from 'unpdf';
import { createWorker } from 'tesseract.js';

/**
 * DEBUG VERSION - LOGS EVERYTHING
 * Use this to see what Tesseract extracts and fix regex
 */

function extractFieldsAccurate(text) {
  const fields = { grossSalary: 0, tds: 0, standardDeduction: 0, deductions80C: 0 };
  
  console.log('\n========================================');
  console.log('FULL OCR TEXT START');
  console.log('========================================');
  console.log(text);
  console.log('========================================');
  console.log('FULL OCR TEXT END');
  console.log('========================================\n');
  
  const normalized = text.replace(/\s+/g, ' ');
  
  console.log('=== EXTRACTION DEBUG ===');
  
  // GROSS SALARY - Search for it
  console.log('\n1. SEARCHING FOR GROSS SALARY:');
  const salaryContext = normalized.match(/(?:section\s+17\s*\(\s*1\s*\)|gross\s+salary)(.{0,300})/is);
  if (salaryContext) {
    console.log('Found context:', salaryContext[0].substring(0, 200));
    const numbers = salaryContext[1].match(/\d{6,8}/g);
    console.log('Numbers found:', numbers);
    if (numbers) {
      for (const num of numbers) {
        const val = parseInt(num);
        if (val >= 1000000 && val <= 99999999) {
          fields.grossSalary = val;
          console.log('✓ SELECTED Gross Salary:', val);
          break;
        }
      }
    }
  } else {
    console.log('No gross salary context found');
  }
  
  // TDS - Search for it
  console.log('\n2. SEARCHING FOR TDS:');
  const tdsMatches = [...normalized.matchAll(/total[^\d]{0,50}(\d{5,7})/gis)];
  console.log('Found', tdsMatches.length, 'matches for "Total"');
  tdsMatches.forEach((m, i) => {
    console.log(`  Match ${i + 1}: ${m[0].substring(0, 50)} -> ${m[1]}`);
  });
  
  if (tdsMatches.length > 0) {
    const lastMatch = tdsMatches[tdsMatches.length - 1];
    const val = parseInt(lastMatch[1]);
    if (val >= 10000 && val <= 5000000) {
      fields.tds = val;
      console.log('✓ SELECTED TDS:', val, '(last Total match)');
    }
  } else {
    console.log('No TDS found, trying "tax deducted"');
    const match = normalized.match(/tax\s+deducted\s+at\s+source[^\d]{0,100}(\d{5,7})/is);
    if (match) {
      const val = parseInt(match[1]);
      if (val >= 10000 && val <= 5000000) {
        fields.tds = val;
        console.log('✓ SELECTED TDS:', val, '(from "tax deducted at source")');
      }
    }
  }
  
  // STANDARD DEDUCTION
  console.log('\n3. SEARCHING FOR STANDARD DEDUCTION:');
  if (normalized.match(/(?:standard\s+deduction|16\s*\(\s*ia\s*\))/is)) {
    console.log('Found "standard deduction" or "16(ia)"');
    if (text.includes('50000')) {
      fields.standardDeduction = 50000;
      console.log('✓ SELECTED Standard Deduction: 50000');
    } else {
      const match = normalized.match(/(?:standard\s+deduction|16\s*\(\s*ia\s*\))[^\d]{0,100}(\d{5})/is);
      if (match) {
        fields.standardDeduction = parseInt(match[1]);
        console.log('✓ SELECTED Standard Deduction:', match[1]);
      }
    }
  } else {
    console.log('No standard deduction found');
  }
  
  // 80C
  console.log('\n4. SEARCHING FOR 80C:');
  const c80Context = normalized.match(/(?:section\s+)?80\s*c(.{0,200})/is);
  if (c80Context) {
    console.log('Found 80C context:', c80Context[0].substring(0, 150));
    const numbers = c80Context[1].match(/\d{5,7}/g);
    console.log('Numbers after 80C:', numbers);
    if (numbers) {
      for (const num of numbers) {
        const val = parseInt(num);
        if (val >= 10000 && val <= 150000) {
          fields.deductions80C = val;
          console.log('✓ SELECTED 80C:', val);
          break;
        }
      }
    }
  } else {
    console.log('No 80C context found');
  }
  
  console.log('\n=== END EXTRACTION DEBUG ===\n');
  
  return fields;
}

async function extractWithTesseract(buffer, isImage = false) {
  const worker = await createWorker('eng');
  
  try {
    console.log('⚙️ Configuring Tesseract...');
    await worker.setParameters({
      tessedit_pageseg_mode: '1',
      tessedit_ocr_engine_mode: '2',
    });
    
    console.log('🔍 Running OCR...');
    const { data: { text, confidence } } = await worker.recognize(buffer);
    
    console.log(`✅ OCR completed: ${text.length} chars, ${confidence.toFixed(1)}% confidence`);
    
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
    
    console.log(`\n📄 Processing: ${fileName} (${(buffer.length / 1024).toFixed(0)}KB)`);
    
    let text = '';
    let method = '';
    
    // LAYER 1: Digital PDF
    if (fileType === 'application/pdf') {
      console.log('⏳ Layer 1: Digital PDF...');
      try {
        const result = await extractText(new Uint8Array(buffer), { mergePages: true });
        if (result.text.length > 500) {
          text = result.text;
          method = 'digital_pdf';
          console.log(`✅ Digital: ${text.length} chars`);
        } else {
          console.log('⚠️ Low text, using OCR');
        }
      } catch (err) {
        console.log('⚠️ Digital failed:', err.message);
      }
    }
    
    // LAYER 2: Tesseract OCR
    if (!text) {
      console.log('⏳ Layer 2: Tesseract OCR...');
      
      try {
        const isImage = fileType.startsWith('image/');
        text = await extractWithTesseract(buffer, isImage);
        method = 'tesseract_ocr';
        console.log(`✅ OCR extracted ${text.length} chars`);
        
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
    
    // EXTRACT FIELDS with full logging
    const fields = extractFieldsAccurate(text);
    
    const count = Object.values(fields).filter(v => v > 0).length;
    const time = ((Date.now() - start) / 1000).toFixed(1);
    
    console.log(`\n📊 FINAL RESULTS:`);
    console.log(`   Extracted: ${count}/4 fields`);
    console.log(`   Time: ${time}s`);
    console.log(`   Method: ${method}`);
    console.log(`   Gross Salary: ${fields.grossSalary || 0}`);
    console.log(`   TDS: ${fields.tds || 0}`);
    console.log(`   Standard Deduction: ${fields.standardDeduction || 0}`);
    console.log(`   80C: ${fields.deductions80C || 0}`);
    
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
    console.error('Stack:', error.stack);
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
