import { extractText } from 'unpdf';

/**
 * PRODUCTION ITR EXTRACTOR WITH OCR.SPACE
 * 
 * Layer 1: Digital PDF (unpdf) - Free, instant
 * Layer 2: OCR.space API - ₹0.4 per scanned PDF
 * 
 * Cost: ₹400 for 5000 users (0.13% of revenue)
 */

function extractFieldsUniversal(text) {
  const fields = {
    grossSalary: 0,
    tds: 0,
    standardDeduction: 0,
    deductions80C: 0
  };
  
  // Clean text for better matching
  const cleanText = text.replace(/\s+/g, ' ');
  
  // GROSS SALARY - Multiple aggressive patterns
  const salaryPatterns = [
    /section\s*17\s*\(\s*1\s*\)[^\d]{0,100}(\d{6,8})/is,
    /gross\s*salary[^\d]{0,100}(\d{6,8})/is,
    /salary\s*as\s*per\s*provisions[^\d]{0,150}(\d{6,8})/is,
    /17\s*\(\s*1\s*\)[^\d]{0,100}(\d{6,8})/is,
  ];
  
  for (const pattern of salaryPatterns) {
    const match = text.match(pattern);
    if (match) {
      const value = parseInt(match[1]);
      if (value >= 100000 && value <= 99999999) {
        fields.grossSalary = value;
        break;
      }
    }
  }
  
  // TDS - Multiple patterns
  const tdsPatterns = [
    /total\s*\(\s*rs\.?\s*\)\s*(\d{5,8})/is,
    /amount\s*of\s*tax\s*deducted[^\d]{0,100}(\d{5,8})/is,
    /tax\s*deducted\s*at\s*source[^\d]{0,100}(\d{5,8})/is,
    /tds[^\d]{0,50}(\d{5,8})/is,
  ];
  
  for (const pattern of tdsPatterns) {
    const match = text.match(pattern);
    if (match) {
      const value = parseInt(match[1]);
      if (value >= 1000 && value <= 10000000) {
        fields.tds = value;
        break;
      }
    }
  }
  
  // STANDARD DEDUCTION
  const stdDeductionPatterns = [
    /standard\s*deduction[^\d]{0,100}(\d{5})/is,
    /16\s*\(\s*ia\s*\)[^\d]{0,100}(\d{5})/is,
    /section\s*16\s*\(\s*ia\s*\)[^\d]{0,100}(\d{5})/is,
  ];
  
  for (const pattern of stdDeductionPatterns) {
    const match = text.match(pattern);
    if (match) {
      fields.standardDeduction = parseInt(match[1]);
      break;
    }
  }
  
  // Fallback: 50000 is common value
  if (!fields.standardDeduction && text.match(/50000/)) {
    fields.standardDeduction = 50000;
  }
  
  // 80C DEDUCTIONS
  const deduction80CPatterns = [
    /80\s*c[^\d]{0,150}(\d{5,7})/is,
    /section\s*80\s*c[^\d]{0,150}(\d{5,7})/is,
    /life\s*insurance\s*premia[^\d]{0,100}(\d{5,7})/is,
    /ppf[^\d]{0,100}(\d{5,7})/is,
  ];
  
  for (const pattern of deduction80CPatterns) {
    const match = text.match(pattern);
    if (match) {
      const value = parseInt(match[1]);
      if (value >= 1000 && value <= 150000) {
        fields.deductions80C = value;
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
    
    // OCR.space API
    const formData = new URLSearchParams();
    formData.append('base64Image', base64Image);
    formData.append('apikey', process.env.OCR_SPACE_API_KEY || 'K87899142388957'); // Free tier key for testing
    formData.append('language', 'eng');
    formData.append('isOverlayRequired', 'false');
    formData.append('detectOrientation', 'true');
    formData.append('scale', 'true');
    formData.append('OCREngine', '2'); // Engine 2 is better for documents
    
    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString()
    });
    
    const data = await response.json();
    
    if (data.IsErroredOnProcessing) {
      throw new Error(data.ErrorMessage?.[0] || 'OCR processing failed');
    }
    
    if (!data.ParsedResults || data.ParsedResults.length === 0) {
      throw new Error('No text found in document');
    }
    
    const extractedText = data.ParsedResults[0].ParsedText;
    
    // DEBUG: Log what OCR.space actually returned
    console.log('=== OCR EXTRACTED TEXT (first 2000 chars) ===');
    console.log(extractedText ? extractedText.substring(0, 2000) : '[NO TEXT]');
    console.log('=== END OCR TEXT ===');
    console.log('Total OCR text length:', extractedText?.length || 0);
    
    if (!extractedText || extractedText.length < 100) {
      throw new Error('Insufficient text extracted from document');
    }
    
    return extractedText;
    
  } catch (error) {
    console.error('OCR.space error:', error);
    console.error('OCR FAILED - Full error:', error);
    console.error('OCR FAILED - Stack:', error.stack);
    throw error;
  }
}

export async function POST(request) {
  const startTime = Date.now();
  console.log('🚀 [extract-v2] POST request received at', new Date().toISOString());
  
  try {
    console.log('OCR API Key exists:', !!process.env.OCR_SPACE_API_KEY);
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
    
    console.log(`📄 Processing: ${fileName} (${fileType}, ${buffer.length} bytes)`);
    
    let extractedText = '';
    let method = '';
    let processingCost = 0;
    
    // ═══════════════════════════════════════════════════════
    // LAYER 1: Digital PDF Text Extraction (FREE)
    // ═══════════════════════════════════════════════════════
    
    if (fileType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf')) {
      console.log('⏳ Layer 1: Attempting digital extraction...');
      
      try {
        const { text } = await extractText(new Uint8Array(buffer), { 
          mergePages: true 
        });
        
        if (text.length > 500) {
          extractedText = text;
          method = 'digital_pdf';
          processingCost = 0;
          console.log(`✅ Digital extraction successful: ${text.length} chars`);
        } else {
          console.log(`⚠️ Low text content (${text.length} chars), switching to OCR...`);
        }
      } catch (err) {
        console.log('⚠️ Digital extraction failed, switching to OCR...');
      }
    }
    
    // ═══════════════════════════════════════════════════════
    // LAYER 2: OCR.space API (₹0.4 per request)
    // ═══════════════════════════════════════════════════════
    
    if (!extractedText) {
      console.log('⏳ Layer 2: Running OCR.space extraction...');
      console.log('API Key available:', !!process.env.OCR_SPACE_API_KEY);
      console.log('File type:', fileType);
      console.log('Buffer size:', buffer.length);
      
      try {
        extractedText = await extractWithOCRSpace(buffer, fileType);
        method = 'ocr_space';
        processingCost = 0.4; // ₹0.4 per scanned PDF
        console.log(`✅ OCR extraction successful: ${extractedText.length} chars`);
      } catch (ocrError) {
        console.error('❌ OCR extraction failed:', ocrError.message);
        
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
    
    // ═══════════════════════════════════════════════════════
    // EXTRACT FIELDS
    // ═══════════════════════════════════════════════════════
    
    console.log('🔍 Extracting fields from text...');
    const fields = extractFieldsUniversal(extractedText);
    
    const extractedCount = Object.values(fields).filter(v => v > 0).length;
    const confidence = extractedCount >= 3 ? 0.95 : extractedCount >= 2 ? 0.75 : extractedCount >= 1 ? 0.60 : 0.3;
    const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(`📊 Results: ${extractedCount}/4 fields in ${processingTime}s`);
    
    return Response.json({
      success: extractedCount >= 0,  // Changed from >= 1 to show partial results
      fields,
      confidence,
      method,
      rawTextSample: extractedText.substring(0, 500),  // Include sample for debugging
      extractedCount: `${extractedCount}/4`,
      processingTime: `${processingTime}s`,
      processingCost,
      message: extractedCount >= 3
        ? 'Successfully extracted! Please verify the values before proceeding.'
        : extractedCount >= 1
        ? 'Partial extraction successful. Please verify and manually correct any missing values.'
        : 'Could not extract fields automatically. Please enter values manually using your Form 16.',
      textLength: extractedText.length
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
