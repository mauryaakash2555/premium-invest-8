import { extractText } from 'unpdf';
import { createWorker } from 'tesseract.js';

/**
 * ITR EXTRACTION PIPELINE
 * 
 * Layer 1: Digital PDF (unpdf) - instant, free
 * Layer 2: Direct Image OCR (Tesseract.js) - for JPG/PNG uploads
 * 
 * For scanned PDFs: Ask user to take photo with phone
 * (PDF-to-image requires canvas which isn't available on Vercel serverless)
 */

function extractFieldsUniversal(text) {
  const fields = {
    grossSalary: 0,
    tds: 0,
    standardDeduction: 0,
    deductions80C: 0
  };
  
  let match = null;
  
  // GROSS SALARY - Aggressive pattern matching
  const salaryPatterns = [
    /section\s+17\s*\(\s*1\s*\).*?(\d{6,8})/is,
    /Salary\s+as\s+per\s+provisions.*?(\d{6,8})/is,
    /Gross\s+Salary[:\s]*(\d{6,8})/is,
    /17\s*\(\s*1\s*\)[^\d]*(\d{6,8})/is,
    /Details\s+of\s+Salary.*?(\d{6,8})/is,
    /Income\s+from\s+Salary[:\s]*(\d{6,8})/is,
    /Total\s+Salary[:\s]*(\d{6,8})/is
  ];
  
  for (const pattern of salaryPatterns) {
    match = text.match(pattern);
    if (match) {
      fields.grossSalary = parseInt(match[1]);
      break;
    }
  }
  
  // TDS - Aggressive pattern matching
  const tdsPatterns = [
    /Total\s*\(?\s*Rs\.?\s*\)?\s+(\d{4,8})/i,
    /Amount\s+of\s+tax\s+deducted[:\s]*(\d{4,8})/is,
    /tax\s+deducted.*?source[:\s]*(\d{4,8})/is,
    /TDS[:\s]*(\d{4,8})/i,
    /deducted[:\s]*(\d{4,8})/i,
    /Tax\s+Deducted\s+at\s+Source[:\s]*(\d{4,8})/is
  ];
  
  for (const pattern of tdsPatterns) {
    match = text.match(pattern);
    if (match) {
      const value = parseInt(match[1]);
      // TDS is usually between 10K and 10L
      if (value >= 1000 && value <= 10000000) {
        fields.tds = value;
        break;
      }
    }
  }
  
  // STANDARD DEDUCTION - Known value or pattern
  const stdDeductionPatterns = [
    /Standard\s+deduction[:\s]*(\d{5})/is,
    /(?:section|u\/s)\s+16\s*\(\s*ia\s*\)[:\s]*(\d{5})/is,
    /16\s*\(\s*ia\s*\)[^\d]*(\d{5})/is
  ];
  
  for (const pattern of stdDeductionPatterns) {
    match = text.match(pattern);
    if (match) {
      fields.standardDeduction = parseInt(match[1]);
      break;
    }
  }
  
  // Common value fallback
  if (!fields.standardDeduction && text.match(/50000/)) {
    fields.standardDeduction = 50000;
  }
  
  // 80C DEDUCTIONS - Aggressive matching
  const deduction80CPatterns = [
    /80\s*C[:\s]*(\d{5,7})/is,
    /section\s+80\s*C[:\s]*(\d{5,7})/is,
    /Life\s+Insurance[:\s]*(\d{5,7})/is,
    /PPF[:\s]*(\d{5,7})/is,
    /ELSS[:\s]*(\d{5,7})/is,
    /Chapter\s+VI-?A.*?80\s*C[:\s]*(\d{5,7})/is,
    /Deduction\s+under\s+Chapter[:\s]*(\d{5,7})/is
  ];
  
  for (const pattern of deduction80CPatterns) {
    match = text.match(pattern);
    if (match) {
      const value = parseInt(match[1]);
      // 80C is capped at 1.5L
      if (value >= 10000 && value <= 150000) {
        fields.deductions80C = value;
        break;
      }
    }
  }
  
  return fields;
}

async function extractWithOCR(imageData) {
  try {
    const worker = await createWorker('eng', 1, {
      logger: () => {} // Suppress logs
    });
    
    await worker.setParameters({
      tessedit_pageseg_mode: '1', // Auto page segmentation
      tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz .,()-/:'
    });
    
    const { data: { text } } = await worker.recognize(imageData);
    
    await worker.terminate();
    
    return text;
  } catch (error) {
    console.error('OCR error:', error);
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
    const fileName = file.name.toLowerCase();
    
    let extractedText = '';
    let method = '';
    
    console.log(`📄 Processing: ${fileName} (${fileType})`);
    
    // ═══════════════════════════════════════════════════════
    // LAYER 1: Digital PDF Text Extraction (fastest)
    // ═══════════════════════════════════════════════════════
    
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      console.log('⏳ Layer 1: Attempting digital text extraction...');
      
      try {
        const { text } = await extractText(new Uint8Array(buffer), { 
          mergePages: true 
        });
        
        // Check if we got meaningful text
        const hasNumbers = /\d{5,}/.test(text); // Must have 5+ digit numbers
        
        if (text.length > 300 && hasNumbers) {
          extractedText = text;
          method = 'digital_pdf';
          console.log(`✅ Digital extraction: ${text.length} chars`);
        } else {
          console.log(`⚠️ Low quality text (${text.length} chars, hasNumbers: ${hasNumbers})`);
          // This is likely a scanned PDF
          return Response.json({
            success: false,
            error: 'This appears to be a scanned PDF. Please take a clear photo of your Form 16 with your phone camera and upload the image (JPG/PNG) instead.',
            isScannedPdf: true,
            extractedCount: '0/4',
            hint: 'Tip: Use good lighting and ensure all text is clearly visible in the photo.'
          }, { status: 400 });
        }
      } catch (err) {
        console.log('⚠️ PDF parsing error:', err.message);
        return Response.json({
          success: false,
          error: 'Could not read PDF. Please take a photo of your Form 16 and upload the image instead.',
          isScannedPdf: true,
          extractedCount: '0/4'
        }, { status: 400 });
      }
    }
    
    // ═══════════════════════════════════════════════════════
    // LAYER 2: Direct Image OCR (for JPG/PNG uploads)
    // ═══════════════════════════════════════════════════════
    
    if (!extractedText && fileType.startsWith('image/')) {
      console.log('⏳ Layer 2: Running OCR on image...');
      
      try {
        const base64 = buffer.toString('base64');
        const imageData = `data:${fileType};base64,${base64}`;
        
        extractedText = await extractWithOCR(imageData);
        method = 'image_ocr';
        
        console.log(`✅ Image OCR completed: ${extractedText.length} chars`);
        
      } catch (err) {
        console.error('❌ Image OCR failed:', err.message);
        
        return Response.json({
          success: false,
          error: 'Could not extract text from image. Please ensure the image is clear, well-lit, and the text is readable.',
          extractedCount: '0/4'
        }, { status: 500 });
      }
    }
    
    // ═══════════════════════════════════════════════════════
    // UNSUPPORTED FILE TYPE
    // ═══════════════════════════════════════════════════════
    
    if (!extractedText) {
      return Response.json({
        success: false,
        error: 'Unsupported file format. Please upload a PDF, JPG, or PNG file.',
        extractedCount: '0/4'
      }, { status: 400 });
    }
    
    // ═══════════════════════════════════════════════════════
    // EXTRACT FIELDS
    // ═══════════════════════════════════════════════════════
    
    console.log('🔍 Extracting fields from text...');
    const fields = extractFieldsUniversal(extractedText);
    
    // Calculate success metrics
    const extractedCount = Object.values(fields).filter(v => v > 0).length;
    const confidence = extractedCount >= 3 ? 0.95 : extractedCount >= 2 ? 0.75 : extractedCount >= 1 ? 0.60 : 0.3;
    const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);
    
    console.log(`📊 Results: ${extractedCount}/4 fields in ${processingTime}s`);
    
    return Response.json({
      success: extractedCount >= 1,
      fields,
      confidence,
      method,
      extractedCount: `${extractedCount}/4`,
      processingTime: `${processingTime}s`,
      processingCost: 0, // Always free!
      message: extractedCount >= 3
        ? 'Extraction successful! Please verify values before proceeding.'
        : extractedCount >= 1
        ? 'Partial extraction successful. Please verify and manually enter missing values.'
        : 'Could not extract fields automatically. Please enter values manually.',
      textLength: extractedText.length
    });
    
  } catch (error) {
    console.error('💥 Fatal error:', error);
    
    return Response.json({
      success: false,
      error: 'An unexpected error occurred. Please try again or contact support.',
      details: error.message,
      extractedCount: '0/4'
    }, { status: 500 });
  }
}
