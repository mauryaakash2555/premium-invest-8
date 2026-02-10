import { extractText } from 'unpdf';

/**
 * ITR EXTRACTOR API v2
 * POST /api/itr/extract-v2
 *
 * Enhanced extraction with universal regex patterns for multiple Form16 templates.
 * Works with digital PDFs. For scanned PDFs, users should use a scanning app
 * to convert to searchable PDF first.
 *
 * Returns extracted fields + confidence score + method
 */

function extractFields(text) {
  const fields = {
    grossSalary: 0,
    tds: 0,
    standardDeduction: 0,
    deductions80C: 0
  };

  let match = null;

  // GROSS SALARY - Multiple patterns for different templates
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

  if (!fields.standardDeduction) {
    match = text.match(/Entertainment.*?(\d{5})\.00.*?Standard/is);
    if (match) fields.standardDeduction = parseInt(match[1]);
  }

  if (!fields.standardDeduction && text.match(/50000/)) {
    fields.standardDeduction = 50000; // Common default value
  }

  // 80C DEDUCTIONS - Multiple patterns
  match = text.match(/80\s*C.*?(\d{5,7})/is);
  if (match) fields.deductions80C = parseInt(match[1]);

  if (!fields.deductions80C) {
    match = text.match(/deduction\s+under\s+section\s+80C.*?(\d{5,7})/i);
    if (match) fields.deductions80C = parseInt(match[1]);
  }

  if (!fields.deductions80C) {
    match = text.match(/(?:Life\s+Insurance|PPF|ELSS).*?(\d{5,7})/is);
    if (match) fields.deductions80C = parseInt(match[1]);
  }

  return fields;
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

    const buffer = await file.arrayBuffer();
    const fileName = file.name.toLowerCase();

    // Only support PDF files
    if (!fileName.endsWith('.pdf')) {
      return Response.json({
        success: false,
        error: 'Please upload a PDF file. For scanned documents, use a scanning app to convert to searchable PDF first.'
      }, { status: 400 });
    }

    let extractedText = '';
    const method = 'digital_pdf';

    try {
      const { text } = await extractText(new Uint8Array(buffer), { mergePages: true });
      extractedText = text;
    } catch (err) {
      console.error('PDF text extraction failed:', err);
      return Response.json({
        success: false,
        error: 'Could not extract text from PDF. Please ensure it is a digital (not scanned) Form 16.',
        details: err.message
      }, { status: 500 });
    }

    if (extractedText.length < 500) {
      return Response.json({
        success: false,
        error: 'PDF appears to be scanned or image-based. Please use a scanning app to convert to searchable PDF first.',
        textLength: extractedText.length
      }, { status: 400 });
    }

    // Extract fields using universal regex patterns
    const fields = extractFields(extractedText);

    // Calculate confidence
    const extractedCount = Object.values(fields).filter(v => v > 0).length;
    const confidence = extractedCount >= 3 ? 0.95 : extractedCount >= 2 ? 0.75 : 0.6;

    return Response.json({
      success: extractedCount >= 2,
      fields,
      confidence,
      method,
      extractedCount: `${extractedCount}/4`,
      processingCost: 0, // Always FREE
      message: extractedCount >= 2
        ? 'Extraction successful'
        : 'Low confidence extraction. Please verify values manually.'
    });

  } catch (error) {
    console.error('Extraction error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
