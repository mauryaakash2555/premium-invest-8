import { extractText } from 'unpdf';
import { createWorker } from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

/**
 * AUTOMATIC ITR EXTRACTION PIPELINE
 * User uploads file → We handle EVERYTHING → Return extracted data
 * 
 * Layer 1: Digital PDF (unpdf) - instant, free
 * Layer 2: PDF to Image + OCR (PDF.js + Canvas + Tesseract.js) - automatic for scanned PDFs
 * Layer 3: Direct Image OCR (Tesseract.js) - for JPG/PNG uploads
 * 
 * NO USER INTERVENTION REQUIRED
 */

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'pdfjs-dist/legacy/build/pdf.worker.mjs';

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
    /Total\s+Salary[:\s]*(\d{6,8})/is,
    /Gross\s+total\s+income[:\s]*(\d{6,8})/is
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
    /Tax\s+Deducted\s+at\s+Source[:\s]*(\d{4,8})/is,
    /Total\s+Tax\s+Deducted[:\s]*(\d{4,8})/is
  ];
  
  for (const pattern of tdsPatterns) {
    match = text.match(pattern);
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
  
  if (!fields.standardDeduction && text.match(/50000/)) {
    fields.standardDeduction = 50000;
  }
  
  // 80C DEDUCTIONS
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
      if (value >= 10000 && value <= 150000) {
        fields.deductions80C = value;
        break;
      }
    }
  }
  
  return fields;
}

/**
 * Convert PDF page to PNG image using node-canvas
 */
async function renderPDFPageToImage(pdfBuffer, pageNum = 1) {
  // Dynamic import of canvas to avoid issues if not installed
  const { createCanvas } = await import('canvas');
  
  const loadingTask = pdfjsLib.getDocument({ data: pdfBuffer });
  const pdf = await loadingTask.promise;
  
  const page = await pdf.getPage(pageNum);
  
  // Render at 2x scale for better OCR accuracy
  const scale = 2.0;
  const viewport = page.getViewport({ scale });
  
  // Create canvas
  const canvas = createCanvas(viewport.width, viewport.height);
  const context = canvas.getContext('2d');
  
  // Fill white background
  context.fillStyle = 'white';
  context.fillRect(0, 0, viewport.width, viewport.height);
  
  // Render PDF page to canvas
  await page.render({
    canvasContext: context,
    viewport: viewport
  }).promise;
  
  // Convert to PNG buffer
  const pngBuffer = canvas.toBuffer('image/png');
  
  return pngBuffer;
}

/**
 * Run OCR on image
 */
async function extractWithOCR(imageData) {
  const worker = await createWorker('eng', 1, {
    logger: () => {}
  });
  
  await worker.setParameters({
    tessedit_pageseg_mode: '1',
    tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz .,()-/:'
  });
  
  const { data: { text } } = await worker.recognize(imageData);
  
  await worker.terminate();
  
  return text;
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
        
        const hasNumbers = /\d{5,}/.test(text);
        
        if (text.length > 300 && hasNumbers) {
          extractedText = text;
          method = 'digital_pdf';
          console.log(`✅ Digital extraction: ${text.length} chars`);
        } else {
          console.log(`⚠️ Low text (${text.length} chars), will try OCR...`);
        }
      } catch (err) {
        console.log('⚠️ Digital extraction failed, will try OCR...');
      }
    }
    
    // ═══════════════════════════════════════════════════════
    // LAYER 2: PDF to Image + OCR (AUTOMATIC for scanned PDFs)
    // ═══════════════════════════════════════════════════════
    
    if (!extractedText && (fileType === 'application/pdf' || fileName.endsWith('.pdf'))) {
      console.log('⏳ Layer 2: Converting PDF to image + OCR (automatic)...');
      
      try {
        // Render first page to image
        const pngBuffer = await renderPDFPageToImage(buffer, 1);
        console.log('✅ PDF page rendered to image');
        
        // Run OCR on the image
        extractedText = await extractWithOCR(pngBuffer);
        method = 'pdf_ocr_automatic';
        
        console.log(`✅ OCR completed: ${extractedText.length} chars`);
        
        // If first page didn't have enough data, try page 2
        if (extractedText.length < 200) {
          console.log('⚠️ Page 1 low text, trying page 2...');
          try {
            const pngBuffer2 = await renderPDFPageToImage(buffer, 2);
            const text2 = await extractWithOCR(pngBuffer2);
            extractedText += '\n' + text2;
            console.log(`✅ Added page 2: +${text2.length} chars`);
          } catch (e) {
            console.log('Page 2 not available');
          }
        }
        
      } catch (err) {
        console.error('❌ PDF OCR failed:', err.message);
        
        return Response.json({
          success: false,
          error: 'Could not process PDF. Please ensure it is a valid Form 16 document.',
          details: err.message,
          extractedCount: '0/4'
        }, { status: 500 });
      }
    }
    
    // ═══════════════════════════════════════════════════════
    // LAYER 3: Direct Image OCR (for JPG/PNG uploads)
    // ═══════════════════════════════════════════════════════
    
    if (!extractedText && fileType.startsWith('image/')) {
      console.log('⏳ Layer 3: Running OCR on image...');
      
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
          error: 'Could not extract text from image. Please ensure the image is clear and readable.',
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
      processingCost: 0,
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

// Increase function timeout for OCR processing
export const config = {
  maxDuration: 60 // 60 seconds for OCR processing
};
