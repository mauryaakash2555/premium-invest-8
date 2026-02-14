import { extractText } from 'unpdf';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file) return Response.json({ success: false, error: 'No file' }, { status: 400 });

    const buffer = await file.arrayBuffer();
    let text = '';

    try {
      const result = await extractText(new Uint8Array(buffer), { mergePages: true });
      text = result.text || '';
    } catch (e) {
      text = '';
    }

    const isScanned = text.trim().length < 100;

    if (isScanned) {
      return Response.json({
        success: true,
        isScanned: true,
        fields: { grossSalary: 0, tds: 0, standardDeduction: 0, deductions80C: 0 },
        confidence: 0,
        message: 'Scanned PDF detected — please enter values manually while viewing your document'
      });
    }

    const fields = { grossSalary: 0, tds: 0, standardDeduction: 0, deductions80C: 0 };

    let m = text.match(/section\s+17\s*\(\s*1\s*\)[^\d]{0,80}([\d,]{5,})/i);
    if (m) fields.grossSalary = parseInt(m[1].replace(/,/g, ''));

    m = text.match(/Total\s*\(Rs\.\)\s+([\d,]+)/i);
    if (m) fields.tds = parseInt(m[1].replace(/,/g, ''));

    // Standard Deduction — try multiple patterns
    const stdPatterns = [
      /standard\s+deduction\s+under\s+section\s+16\s*\(\s*ia\s*\)[^\d]{0,80}([\d,]{4,})/i,
      /standard\s+deduction[^\d]{0,50}([\d,]{4,})/i,
      /16\s*\(\s*ia\s*\)[^\d]{0,80}([\d,]{4,})/i,
      /Entertainment[^\d]{0,80}(50000)/i
    ];
    for (const p of stdPatterns) {
      const m2 = text.match(p);
      if (m2) {
        const v = parseInt(m2[1].replace(/,/g, ''));
        if (v >= 40000 && v <= 75000) { fields.standardDeduction = v; break; }
      }
    }
    if (!fields.standardDeduction) fields.standardDeduction = 50000; // statutory default FY25-26

    // 80C — try multiple patterns
    const c80Patterns = [
      /80C, 80CCC and 80CCD\(1\)[^\d]{0,20}([\d,]+)/i,
      /total\s+deduction\s+under\s+section\s+80C[^\d]{0,100}([\d,]{5,})/i,
      /provident fund etc\. under section 80C[^\d]{0,50}([\d,]{5,})/i,
      /80C[^\d]{0,50}(1[45][0-9]{4})/i
    ];
    for (const p of c80Patterns) {
      const m2 = text.match(p);
      if (m2) {
        const v = parseInt(m2[1].replace(/,/g, ''));
        if (v > 0 && v <= 150000) { fields.deductions80C = v; break; }
      }
    }

    const found = Object.values(fields).filter(v => v > 0).length;
    const confidence = found >= 3 ? 0.95 : found >= 1 ? 0.75 : 0.5;

    return Response.json({ success: true, isScanned: false, fields, confidence });

  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
