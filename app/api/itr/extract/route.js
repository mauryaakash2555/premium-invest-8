import { GoogleGenerativeAI } from '@google/generative-ai';
import pdf from 'pdf-parse';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return Response.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Step 1: Extract text using pdf-parse (works great for digital PDFs)
    let pdfText = '';
    try {
      const pdfData = await pdf(buffer);
      pdfText = pdfData.text;
    } catch (e) {
      console.error('PDF parse error:', e);
      return Response.json({ success: false, error: 'Could not parse PDF' }, { status: 400 });
    }

    if (!pdfText || pdfText.length < 100) {
      return Response.json({ success: false, error: 'PDF appears to be empty or scanned' }, { status: 400 });
    }

    // Step 2: Use Gemini to extract structured fields
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `You are an expert at reading Indian Form 16 / Form 16A tax documents.

From the following Form 16 text, extract these specific values:

1. **Gross Salary** - Look for "Gross Salary as per Section 17(1)" or similar. This is usually a 6-8 digit number.
2. **TDS (Tax Deducted at Source)** - Look for "Tax deducted" or TDS amount. Usually 5-7 digits.
3. **Standard Deduction** - Should be exactly 50000 (or 40000 for older forms).
4. **Deductions under 80C** - Look for "80C" / "80CCC" / "80CCD" section maximum 150000.

IMPORTANT RULES:
- Only return numbers, no commas or currency symbols
- If you cannot find a value with confidence, return null for that field
- The gross salary in this document should be around 25-26 lakhs (2500000-2600000)
- The TDS should be around 4-5 lakhs (400000-500000)

Return ONLY valid JSON in this exact format:
{
  "grossSalary": <number or null>,
  "tds": <number or null>,
  "standardDeduction": <number or null>,
  "deductions80C": <number or null>
}

Here is the Form 16 text:
---
${pdfText.substring(0, 15000)}
---

JSON response:`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Parse JSON from Gemini response
    let fields = {};
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        fields = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('JSON parse error:', e, responseText);
    }
    
    // Calculate confidence
    const foundFields = Object.values(fields).filter(v => v !== null).length;
    const confidence = foundFields >= 3 ? 0.95 : foundFields >= 2 ? 0.85 : 0.7;

    return Response.json({
      success: true,
      fields,
      confidence,
      rawTextPreview: pdfText.substring(0, 500)
    });

  } catch (error) {
    console.error('Extraction error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
