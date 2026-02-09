import { extractText } from 'unpdf';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return Response.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();
    const { text } = await extractText(new Uint8Array(buffer), { mergePages: true });
    
    const fields = {
      grossSalary: 0,
      tds: 0,
      standardDeduction: 0,
      deductions80C: 0
    };
    
    // 1. Gross Salary - section 17(1)
    let match = text.match(/section\s+17\(1\).*?(\d{7})/i);
    if (match) fields.grossSalary = parseInt(match[1]);
    
    // 2. TDS - Total (Rs.)
    match = text.match(/Total\s*\(Rs\.\)\s+(\d{6,7})/i);
    if (match) fields.tds = parseInt(match[1]);
    
    // 3. Standard Deduction - Entertainment allowance ... XXXXX.00 ... Standard deduction
    match = text.match(/Entertainment.*?(\d{5})\.00.*?Standard\s+deduction/is);
    if (match) fields.standardDeduction = parseInt(match[1]);
    
    // 4. 80C Deductions
    match = text.match(/deduction\s+under\s+section\s+80C.*?(\d{6})/i);
    if (match) fields.deductions80C = parseInt(match[1]);
    
    const confidence = fields.grossSalary > 0 ? 0.95 : 0.6;

    return Response.json({
      success: true,
      fields,
      confidence
    });

  } catch (error) {
    console.error('Extraction error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
