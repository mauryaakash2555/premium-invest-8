import { extractText } from 'unpdf';
import tesseract from 'node-tesseract-ocr';
import sharp from 'sharp';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';

const execPromise = promisify(exec);

/**
 * PRODUCTION ITR EXTRACTOR API
 * POST /api/itr/extract-v2
 *
 * Handles:
 * - Digital PDFs (unpdf)
 * - Scanned PDFs (OCR)
 * - Images (JPG, PNG, HEIC)
 *
 * Returns extracted fields + confidence score
 */

async function convertPdfToImage(buffer) {
  const tempPdf = `/tmp/upload_${Date.now()}.pdf`;
  const outputPath = `/tmp/form16_${Date.now()}.png`;

  try {
    // Write buffer to temp file
    fs.writeFileSync(tempPdf, buffer);

    // Convert with pdftoppm (150 DPI for balance)
    await execPromise(`pdftoppm -png -f 1 -l 1 -r 150 "${tempPdf}" /tmp/form16_temp`);

    // Find generated file
    const files = fs.readdirSync('/tmp').filter(f => f.startsWith('form16_temp'));
    if (files.length > 0) {
      const generatedFile = `/tmp/${files[0]}`;
      fs.renameSync(generatedFile, outputPath);

      // Cleanup PDF
      fs.unlinkSync(tempPdf);
      return outputPath;
    }
  } catch (err) {
    console.error('PDF conversion error:', err);
    if (fs.existsSync(tempPdf)) fs.unlinkSync(tempPdf);
  }

  return null;
}

async function preprocessImage(imagePath) {
  const processedPath = `/tmp/processed_${Date.now()}.png`;

  try {
    const metadata = await sharp(imagePath).metadata();
    let transform = sharp(imagePath);

    // Resize if too large (Tesseract limit)
    if (metadata.width > 3000 || metadata.height > 3000) {
      transform = transform.resize(3000, 3000, { fit: 'inside' });
    }

    await transform
      .greyscale()
      .normalize()
      .sharpen()
      .toFile(processedPath);

    return processedPath;
  } catch (err) {
    console.error('Image preprocessing error:', err);
    return null;
  }
}

function extractFields(text) {
  const fields = {
    grossSalary: 0,
    tds: 0,
    standardDeduction: 0,
    deductions80C: 0
  };

  // Gross Salary - section 17(1)
  let match = text.match(/section\s+17\(1\).*?(\d{7})/i);
  if (match) fields.grossSalary = parseInt(match[1]);

  // TDS - Total (Rs.)
  match = text.match(/Total\s*\(Rs\.\)\s+(\d{6,7})/i);
  if (match) fields.tds = parseInt(match[1]);

  // Standard Deduction
  match = text.match(/Entertainment.*?(\d{5})\.00.*?Standard\s+deduction/is);
  if (!match) match = text.match(/Standard\s+deduction.*?(\d{5})/is);
  if (match) fields.standardDeduction = parseInt(match[1]);

  // 80C Deductions
  match = text.match(/deduction\s+under\s+section\s+80C.*?(\d{6})/i);
  if (!match) match = text.match(/80C.*?(\d{6})/i);
  if (match) fields.deductions80C = parseInt(match[1]);

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

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileType = file.type;
    const fileName = file.name.toLowerCase();

    let extractedText = '';
    let method = '';
    let processingCost = 0;

    // LAYER 1: Digital PDF Text Extraction (FREE)
    if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
      try {
        const { text } = await extractText(new Uint8Array(buffer), { mergePages: true });

        if (text.length > 1000) {
          extractedText = text;
          method = 'digital_pdf';
          processingCost = 0;
        }
      } catch (err) {
        console.log('Digital extraction failed, trying OCR');
      }
    }

    // LAYER 2: OCR for Scanned PDFs and Images (FREE but slower)
    if (!extractedText) {
      let imagePath = null;
      let tempFiles = [];

      try {
        // Convert PDF to image if needed
        if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
          imagePath = await convertPdfToImage(buffer);
          if (imagePath) tempFiles.push(imagePath);
        } else if (fileType.startsWith('image/')) {
          // Save image to temp file
          imagePath = `/tmp/upload_${Date.now()}.${fileType.split('/')[1]}`;
          fs.writeFileSync(imagePath, buffer);
          tempFiles.push(imagePath);
        }

        if (!imagePath) {
          throw new Error('Could not process file');
        }

        // Preprocess image
        const processedPath = await preprocessImage(imagePath);
        if (!processedPath) {
          throw new Error('Image preprocessing failed');
        }
        tempFiles.push(processedPath);

        // Run OCR
        extractedText = await tesseract.recognize(processedPath, {
          lang: 'eng',
          oem: 1,
          psm: 6
        });

        method = 'ocr_tesseract';
        processingCost = 0; // Still free!

      } catch (err) {
        console.error('OCR extraction error:', err);

        // Cleanup temp files
        tempFiles.forEach(f => {
          if (fs.existsSync(f)) fs.unlinkSync(f);
        });

        return Response.json({
          success: false,
          error: 'Failed to extract text from document. Please ensure the file is a valid Form 16.',
          details: err.message
        }, { status: 500 });
      }

      // Cleanup temp files
      tempFiles.forEach(f => {
        if (fs.existsSync(f)) fs.unlinkSync(f);
      });
    }

    // Extract fields using regex
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
      processingCost, // Always ₹0!
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
