import { extractText } from 'unpdf';
import { createWorker } from 'tesseract.js';

/**
 * VERCEL-COMPATIBLE ITR EXTRACTOR
 * Layer 1: unpdf (digital PDFs)
 * Layer 2: Tesseract.js (scanned PDFs/images) 
 * Layer 3: Claude API (fallback - to be added)
 */

function extractFieldsUniversal(text) {
  const fields = {
    grossSalary: 0,
    tds: 0,
    standardDeduction: 0,
    deductions80C: 0
  };
  
  let match = null;
  
  // GROSS SALARY - Multiple patterns for different Form16 templates
  match = text.match(/section\s+17\s*\(\s*1\s*\).*?(\d{6,8})/is);
  if (match) fields.grossSalary = parseInt(match[1]);
  
  if (!fields.grossSalary) {
    match = text.match(/Salary\s+as\s+per\s+provisions.*?(\d{6,8})/is);
    if (match) fields.grossSalary = parseInt(match[1]);
  }
  
  if (!fields.grossSalary) {
    match = text.match(/Gross\s+Salary.*?(\d{6,8})/is);
    if (match) fields.grossSalary = parseInt(match[1]);
  }
  
  // TDS - Multiple patterns
  match = text.match(/Total\s*\(?\s*Rs\.?\s*\)?\s+(\d{4,8})/i);
  if (match) fields.tds = parseInt(match[1]);
  
  if (!fields.tds) {
    match = text.match(/Amount\s+of\s+tax\s+deducted.*?(\d{4,8})/is);
    if (match) fields.tds = parseInt(match[1]);
  }
  
  if (!fields.tds) {
    match = text.match(/tax\s+deducted.*?source.*?(\d{4,8})/is);
    if (match) fields.tds = parseInt(match[1]);
  }
  
  // STANDARD DEDUCTION - Multiple patterns
  match = text.match(/Standard\s+deduction.*?(\d{5})/is);
  if (match) fields.standardDeduction = parseInt(match[1]);
  
  if (!fields.standardDeduction) {
    match = text.match(/(?:section|u\/s)\s+16\s*\(\s*ia\s*\).*?(\d{5})/is);
    if (match) fields.standardDeduction = parseInt(match[1]);
  }
  
  if (!fields.standardDeduction && text.match(/50000/)) {
    fields.standardDeduction = 50000; // Common value
  }
  
  // 80C DEDUCTIONS - Multiple patterns
  match = text.match(/80\s*C.*?(\d{5,7})/is);
  if (match) fields.deductions80C = parseInt(match[1]);
  
  if (!fields.deductions80C) {
    match = text.match(/(?:Life\s+Insurance|PPF|ELSS).*?(\d{5,7})/is);
    if (match) fields.deductions80C = parseInt(match[1]);
  }
  
  return fields;
}

async function extractWithOCR(buffer) {
  try {
    // Create Tesseract.js worker (works on Vercel)
    const worker = await createWorker('eng');
    
    // Convert buffer to base64 image
    const base64 = buffer.toString('base64');
    const imageData = `data:image/png;base64,${base64}`;
    
    // Run OCR
    const { data: { text } } = await worker.recognize(imageData);
    
    // Cleanup
    await worker.terminate();
    
    return text;
  } catch (error) {
    console.error('OCR error:', error);
    throw new Error('OCR extraction failed');
  }
}

export async function POST(request) {
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
    let processingCost = 0;
    
    // LAYER 1: Digital PDF Text Extraction (FREE, instant)
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      try {
        const { text } = await extractText(new Uint8Array(buffer), { mergePages: true });
        
        if (text.length > 1000) {
          extractedText = text;
          method = 'digital_pdf';
          processingCost = 0;
          console.log('✅ Digital PDF extraction successful');
        } else {
          console.log('⚠️ Low text content, switching to OCR');
        }
      } catch (err) {
        console.log('⚠️ Digital extraction failed, switching to OCR');
      }
    }
    
    // LAYER 2: OCR with Tesseract.js (FREE, slower ~10-15 sec)
    if (!extractedText) {
      console.log('🔍 Running Tesseract.js OCR...');
      
      try {
        // For images, use directly
        if (fileType.startsWith('image/')) {
          extractedText = await extractWithOCR(buffer);
          method = 'ocr_tesseractjs';
          processingCost = 0;
        } 
        // For PDFs, need to convert to image first
        else if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
          // For now, return error asking for image upload
          // In future, can add pdf-to-image conversion
          return Response.json({
            success: false,
            error: 'Scanned PDF detected. Please upload as JPG/PNG image instead.',
            hint: 'Take a screenshot of your Form16 or use "Print to JPG" to convert PDF to image.',
            extractedCount: '0/4'
          }, { status: 400 });
        }
        
        console.log(`✅ OCR completed - ${extractedText.length} chars`);
        
      } catch (ocrErr) {
        console.error('OCR extraction failed:', ocrErr);
        
        return Response.json({
          success: false,
          error: 'Could not extract text from document. Please ensure image is clear and readable.',
          extractedCount: '0/4'
        }, { status: 500 });
      }
    }
    
    // Extract fields using universal patterns
    const fields = extractFieldsUniversal(extractedText);
    
    // Calculate confidence
    const extractedCount = Object.values(fields).filter(v => v > 0).length;
    const confidence = extractedCount >= 3 ? 0.95 : extractedCount >= 2 ? 0.75 : 0.6;
    
    console.log(`📊 Extraction results: ${extractedCount}/4 fields`);
    
    return Response.json({
      success: extractedCount >= 2,
      fields,
      confidence,
      method,
      extractedCount: `${extractedCount}/4`,
      processingCost,
      message: extractedCount >= 2 
        ? 'Extraction successful. Please verify values before proceeding.'
        : extractedCount > 0
        ? 'Partial extraction. Please verify and manually enter missing values.'
        : 'Could not extract fields. Please check if this is a valid Form16 and try uploading as a clear image.'
    });
    
  } catch (error) {
    console.error('Extraction error:', error);
    return Response.json({
      success: false,
      error: 'An error occurred during extraction. Please try again.',
      details: error.message
    }, { status: 500 });
  }
}
