import { extractText } from 'unpdf';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return Response.json({ success: false, error: 'No file' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const { text } = await extractText(new Uint8Array(buffer), { mergePages: true });

    // Simple regex extraction (works for most Form16s)
    const fields = {
      grossSalary: 0,
      tds: 0,
      standardDeduction: 0,
      deductions80C: 0,
    };

    // Gross Salary - section 17(1) (fallback to common "Gross Salary" label)
    const grossMatch =
      text.match(/section\s+17.*?(\d{7})/i) ||
      text.match(/gross\s*salary\b[^\d]{0,40}([\d,]{3,})/i);
    if (grossMatch) fields.grossSalary = parseInt(String(grossMatch[1]).replace(/,/g, ''), 10);

    // TDS - Total row (fallback to common "Total TDS")
    const tdsMatch =
      text.match(/Total.*?(\d{7}).*?(\d{6})/i) ||
      text.match(/total\s*tds\b[^\d]{0,40}([\d,]{3,})/i);
    if (tdsMatch) fields.tds = parseInt(String(tdsMatch[2] ?? tdsMatch[1]).replace(/,/g, ''), 10);

    // Standard Deduction - 50000
    const stdMatch = text.match(/standard.*?deduction.*?(\d{5})/i);
    if (stdMatch) fields.standardDeduction = parseInt(String(stdMatch[1]).replace(/,/g, ''), 10);

    // 80C
    const c80Match = text.match(/80c.*?(\d{6})/i);
    if (c80Match) fields.deductions80C = parseInt(String(c80Match[1]).replace(/,/g, ''), 10);

    const confidence = fields.grossSalary > 0 ? 0.85 : 0.6;

    return Response.json({
      success: true,
      fields,
      confidence,
      rawTextPreview: String(text || '').substring(0, 2000),
    });
  } catch (error) {
    console.error(error);
    return Response.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
