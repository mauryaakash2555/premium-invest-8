import { extractText } from 'unpdf';

/**
 * FINAL WORKING ITR EXTRACTOR
 * Handles digital PDFs + OCR for scanned PDFs
 * Uses OCR.space API with improved regex patterns
 */

function extractFieldsUniversal(text) {
  const fields = {
    grossSalary: 0,
    tds: 0,
    standardDeduction: 0,
    deductions80C: 0
  };
  
  // Normalize text - remove extra spaces, make searching easier
  const normalized = text.replace(/\s+/g, ' ').toLowerCase();
  const original = text.replace(/\s+/g, ' ');
  
  // GROSS SALARY - Very loose patterns
  // Look for any 6-8 digit number near "gross" or "salary" or "17(1)"
  const salaryPatterns = [
    /(?:gross.*?salary|salary.*?gross).*?(\d{6,8})/is,
    /section.*?17.*?\(.*?1.*?\).*?(\d{6,8})/is,
    /17.*?\(.*?1.*?\).*?(\d{6,8})/is,
    /salary.*?as.*?per.*?provision.*?(\d{6,8})/is,
    /total.*?income.*?salary.*?(\d{6,8})/is,
  ];
  
  for (const pattern of salaryPatterns) {
    const match = original.match(pattern);
    if (match) {
      const value = parseInt(match[1]);
      if (value >= 100000 && value <= 99999999) {
        fields.grossSalary = value;
        console.log('✓ Found Gross Salary:', value);
        break;
      }
    }
  }
  
  // TDS - Look for tax deducted
  const tdsPatterns = [
    /(?:total|tax).*?(?:deducted|tds).*?(\d{5,8})/is,
    /tds.*?(\d{5,8})/is,
    /tax.*?source.*?(\d{5,8})/is,
    /amount.*?tax.*?deducted.*?(\d{5,8})/is,
    /total.*?\(.*?rs.*?\).*?(\d{5,8})/is,
  ];
  
  for (const pattern of tdsPatterns) {
    const match = original.match(pattern);
    if (match) {
      const value = parseInt(match[1]);
      if (value >= 1000 && value <= 10000000) {
        fields.tds = value;
        console.log('✓ Found TDS:', value);
        break;
      }
    }
  }
  
  // STANDARD DEDUCTION - Usually 50000
  const stdPatterns = [
    /standard.*?deduction.*?(\d{5})/is,
    /16.*?\(.*?ia.*?\).*?(\d{5})/is,
    /deduction.*?standard.*?(\d{5})/is,
  ];
  
  for (const pattern of stdPatterns) {
    const match = original.match(pattern);
    if (match) {
      fields.standardDeduction = parseInt(match[1]);
      console.log('✓ Found Standard Deduction:', fields.standardDeduction);
      break;
    }
  }
  
  // Fallback: If text contains 50000, assume it's standard deduction
  if (!fields.standardDeduction && text.includes('50000')) {
    fields.standardDeduction = 50000;
    console.log('✓ Found Standard Deduction (fallback):', 50000);
  }
  
  // 80C DEDUCTIONS
  const deduction80CPatterns = [
    /80.*?c.*?(\d{5,7})/is,
    /section.*?80.*?c.*?(\d{5,7})/is,
    /life.*?insurance.*?(\d{5,7})/is,
    /ppf.*?(\d{5,7})/is,
    /deduction.*?chapter.*?vi.*?(\d{5,7})/is,
  ];
  
  for (const pattern of deduction80CPatterns) {
    const match = original.match(pattern);
    if (match) {
      const value = parseInt(match[1]);
      if (value >= 1000 && value <= 150000) {
        fields.deductions80C = value;
        console.log('✓ Found 80C:', value);
        break;
      }
    }
  }
  
  return fields;
}

async function extractWithOCRSpace(buffer, fileType) {
  try {
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
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    });
    
    const data = await response.json();
    
    console.log('OCR Response status:', data.IsErroredOnProcessing ? 'ERROR' : 'SUCCESS');
    
    if (data.IsErroredOnProcessing) {
      const error = data.ErrorMessage?.[0] || 'Unknown OCR error';
      console.error('OCR Error:', error);
      throw new Error(error);
    }
    
    if (!data.ParsedResults || data.ParsedResults.length === 0) {
      throw new Error('No text found in document');
    }
    
    const extractedText = data.ParsedResults[0].ParsedText;
    console.log('OCR extracted:', extractedText.length, 'characters');
    
    // Log first 1000 chars for debugging
    console.log('First 1000 chars:', extractedText.substring(0, 1000));
    
    if (!extractedText || extractedText.length < 50) {
      throw new Error('Insufficient text extracted - document may be blank or unreadable');
    }
    
    return extractedText;
    
  } catch (error) {
    console.error('OCR.space error:', error.message);
    throw error;
  }
}

export async function POST(request) {
  const startTime = Date.now();
  
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return Response.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }
    
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileType = file.type;
    const fileName = file.name;
    
    console.log(`\n📄 Processing: ${fileName} (${fileType}, ${buffer.length} bytes)`);
    
    let extractedText = '';
    let method = '';
    let processingCost = 0;
    
    // LAYER 1: Digital PDF
    if (fileType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
      console.log('⏳ LAYER 1: Trying digital PDF extraction...');
      
      try {
        const { text } = await extractText(new Uint8Array(buffer), { mergePages: true });
        
        console.log(`Digital extraction: ${text.length} chars`);
        
        if (text.length > 500) {
          extractedText = text;
          method = 'digital_pdf';
          processingCost = 0;
          console.log('✅ Digital PDF extraction successful');
        } else {
          console.log('⚠️ Low text content, switching to OCR');
        }
      } catch (err) {
        console.log('⚠️ Digital extraction failed:', err.message);
      }
    }
    
    // LAYER 2: OCR.space
    if (!extractedText) {
      console.log('⏳ LAYER 2: Running OCR.space...');
      
      try {
        extractedText = await extractWithOCRSpace(buffer, fileType);
        method = 'ocr_space';
        processingCost = 0.4;
        console.log('✅ OCR extraction successful');
      } catch (ocrError) {
        console.error('❌ OCR failed:', ocrError.message);
        
        // Return friendly error
        return Response.json({
          success: false,
          error: 'Could not extract text from document. Please ensure the file is a clear, readable Form 16.',
          details: ocrError.message,
          fields: { grossSalary: 0, tds: 0, standardDeduction: 0, deductions80C: 0 },
          confidence: 0,
          extractedCount: '0/4',
          method: 'failed'
        }, { status: 500 });
      }
    }
    
    // EXTRACT FIELDS
    console.log('🔍 Extracting fields...');
    const fields = extractFieldsUniversal(extractedText);
    
    const extractedCount = Object.values(fields).filter(v => v > 0).length;
    const confidence = extractedCount >= 3 ? 0.95 : extractedCount >= 2 ? 0.75 : extractedCount >= 1 ? 0.60 : 0.3;
    const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(`\n📊 RESULTS:`);
    console.log(`   Extracted: ${extractedCount}/4 fields`);
    console.log(`   Time: ${processingTime}s`);
    console.log(`   Method: ${method}`);
    console.log(`   Cost: ₹${processingCost}\n`);
    
    // ALWAYS RETURN SUCCESS IF WE GOT TEXT
    // Even if 0 fields extracted, let user see what we got
    return Response.json({
      success: true, // Changed to always true if OCR worked
      fields,
      confidence,
      method,
      extractedCount: `${extractedCount}/4`,
      processingTime: `${processingTime}s`,
      processingCost,
      textLength: extractedText.length,
      message: extractedCount >= 3
        ? 'Successfully extracted! Please verify the values before proceeding.'
        : extractedCount >= 1
        ? 'Partial extraction successful. Please verify and manually fill missing values.'
        : 'Could not automatically extract all fields. Please manually enter values from your Form 16.'
    });
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
    
    return Response.json({
      success: false,
      error: 'An unexpected error occurred during extraction.',
      details: error.message,
      fields: { grossSalary: 0, tds: 0, standardDeduction: 0, deductions80C: 0 },
      confidence: 0,
      extractedCount: '0/4'
    }, { status: 500 });
  }
}
