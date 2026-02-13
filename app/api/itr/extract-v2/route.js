import { extractText } from 'unpdf';

function extractFields(text) {
  const f = { grossSalary: 0, tds: 0, standardDeduction: 0, deductions80C: 0 };

  // 1. GROSS SALARY - "section 17(1)" then number
  let m = text.match(/section\s+17\s*\(\s*1\s*\)[^\d\n]{0,80}([\d,]+\.?\d*)/i);
  if (m) f.grossSalary = Math.round(parseFloat(m[1].replace(/,/g, '')));

  // 2. TDS - Last "Total (Rs.)" row, 3rd number = tax deposited
  const tots = [...text.matchAll(/Total\s*\(\s*Rs\.?\s*\)\s+([\d,.]+)\s+([\d,.]+)\s+([\d,.]+)/gi)];
  if (tots.length > 0) f.tds = Math.round(parseFloat(tots[tots.length - 1][3].replace(/,/g, '')));

  // 3. STANDARD DEDUCTION - "section 16(ia)" then number
  m = text.match(/16\s*\(\s*i\s*a\s*\)\s+([\d,]+\.?\d*)/i);
  if (m) f.standardDeduction = Math.round(parseFloat(m[1].replace(/,/g, '')));
  if (!f.standardDeduction && text.includes('50000')) f.standardDeduction = 50000;

  // 4. 80C - "Total deduction under section 80C..." then 2 numbers, take 2nd
  m = text.match(/Total deduction under section 80\s*C[,\s\w\d()]+?\s+([\d]+\.?\d*)\s+([\d]+\.?\d*)/i);
  if (m) {
    const deductible = Math.round(parseFloat(m[2]));
    if (deductible > 0 && deductible <= 150000) f.deductions80C = deductible;
    else f.deductions80C = Math.round(parseFloat(m[1]));
  }

  console.log('EXTRACTED:', JSON.stringify(f));
  return f;
}

async function ocrSpace(buffer, fileType) {
  const params = new URLSearchParams();
  params.append('base64Image', `data:${fileType};base64,${buffer.toString('base64')}`);
  params.append('apikey', process.env.OCR_SPACE_API_KEY);
  params.append('language', 'eng');
  params.append('OCREngine', '2');
  params.append('scale', 'true');
  params.append('detectOrientation', 'true');

  const res = await fetch('https://api.ocr.space/parse/image', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString()
  });

  const data = await res.json();
  console.log('OCR status:', data.IsErroredOnProcessing ? 'ERROR' : 'OK');
  console.log('OCR response:', JSON.stringify(data).substring(0, 300));

  if (data.IsErroredOnProcessing) throw new Error(data.ErrorMessage?.[0] || 'OCR failed');
  
  const text = data.ParsedResults?.[0]?.ParsedText || '';
  console.log('OCR text length:', text.length);
  console.log('OCR sample:', text.substring(0, 500));
  
  if (text.length < 100) throw new Error('No text extracted');
  return text;
}

export async function POST(request) {
  const start = Date.now();
  try {
    const fd = await request.formData();
    const file = fd.get('file');
    if (!file) return Response.json({ success: false, error: 'No file' }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileType = file.type;
    console.log(`Processing: ${file.name} (${(buffer.length/1024).toFixed(0)}KB, ${fileType})`);

    let text = '';
    let method = '';

    // LAYER 1: Digital PDF (free, instant)
    if (fileType === 'application/pdf') {
      try {
        const { text: t } = await extractText(new Uint8Array(buffer), { mergePages: true });
        if (t && t.length > 500) {
          text = t;
          method = 'digital_pdf';
          console.log('Digital PDF:', text.length, 'chars');
        }
      } catch (e) {
        console.log('Digital failed:', e.message);
      }
    }

    // LAYER 2: OCR.space (for scanned/image PDFs)
    if (!text) {
      try {
        text = await ocrSpace(buffer, fileType);
        method = 'ocr_space';
        console.log('OCR.space:', text.length, 'chars');
      } catch (e) {
        console.error('OCR failed:', e.message);
        return Response.json({
          success: false,
          error: 'Could not extract text. Please enter values manually.',
          fields: { grossSalary: 0, tds: 0, standardDeduction: 0, deductions80C: 0 },
          confidence: 0, extractedCount: '0/4'
        }, { status: 500 });
      }
    }

    console.log('OCR_OUTPUT:', text.substring(0, 2000));

    const fields = extractFields(text);
    console.log('FIELDS_FOUND:', JSON.stringify(fields));
    const count = Object.values(fields).filter(v => v > 0).length;
    const time = ((Date.now() - start) / 1000).toFixed(1);

    console.log(`Done: ${count}/4 fields, ${time}s, ${method}`);

    return Response.json({
      success: true,
      fields,
      confidence: count >= 3 ? 0.95 : count >= 2 ? 0.75 : count >= 1 ? 0.6 : 0.3,
      extractedCount: `${count}/4`,
      method,
      processingTime: `${time}s`,
      message: count >= 3 ? 'Extracted! Please verify.' : count >= 1 ? 'Partial. Fill missing values.' : 'Enter values manually.'
    });

  } catch (err) {
    console.error('Fatal:', err.message);
    return Response.json({
      success: false, error: 'Processing failed', details: err.message,
      fields: { grossSalary: 0, tds: 0, standardDeduction: 0, deductions80C: 0 },
      confidence: 0, extractedCount: '0/4'
    }, { status: 500 });
  }
}
