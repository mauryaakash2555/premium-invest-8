import { GoogleGenerativeAI } from '@google/generative-ai';

// Force Node.js runtime
export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request) {
  try {
    // Check API key first
    if (!process.env.GEMINI_API_KEY) {
      return Response.json({ success: false, error: 'GEMINI_API_KEY not configured' }, { status: 500 });
    }
    
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return Response.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const base64Pdf = buffer.toString('base64');
    
    // Use Gemini 1.5 Flash with native PDF support
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `You are an expert at reading Indian Form 16 / Form 16A tax documents.

Analyze this Form 16 PDF and extract these specific values:

1. **Gross Salary** - Look for "Gross Salary as per Section 17(1)" or "Gross amount of salary". Usually a 6-8 digit number.
2. **TDS (Tax Deducted at Source)** - Look for "Tax deducted at source" or "Total tax deducted". Usually 5-7 digits.
3. **Standard Deduction** - Look for "Standard deduction u/s 16(ia)". Should be 50000 (or 40000 for older forms).
4. **Deductions under 80C** - Look for section 80C/80CCC/80CCD deductions, maximum 150000.

IMPORTANT RULES:
- Only return numbers as integers, no commas or currency symbols
- If you cannot find a value with high confidence, return null for that field
- Look carefully at Part B of Form 16 for salary details

Return ONLY valid JSON in this exact format (no markdown, no explanation, no text before or after):
{"grossSalary": 2557983, "tds": 483740, "standardDeduction": 50000, "deductions80C": 150000}`;

    let responseText = '';
    try {
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            mimeType: 'application/pdf',
            data: base64Pdf
          }
        }
      ]);
      responseText = result.response.text();
    } catch (e) {
      console.error('Gemini API error:', e);
      return Response.json({ success: false, error: 'Gemini API error: ' + e.message }, { status: 500 });
    }
    
    // Parse JSON from Gemini response
    let fields = {};
    try {
      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = responseText.match(/\{[\s\S]*?\}/);
      if (jsonMatch) {
        fields = JSON.parse(jsonMatch[0]);
      } else {
        console.error('No JSON found in response:', responseText);
        return Response.json({ 
          success: false, 
          error: 'Could not parse AI response',
          debug: responseText.substring(0, 500)
        }, { status: 500 });
      }
    } catch (e) {
      console.error('JSON parse error:', e, responseText);
      return Response.json({ 
        success: false, 
        error: 'Invalid JSON from AI: ' + e.message,
        debug: responseText.substring(0, 500)
      }, { status: 500 });
    }
    
    // Calculate confidence
    const foundFields = Object.values(fields).filter(v => v !== null).length;
    const confidence = foundFields >= 3 ? 0.95 : foundFields >= 2 ? 0.85 : 0.7;

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
