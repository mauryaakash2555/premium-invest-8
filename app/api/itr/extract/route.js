import OpenAI from 'openai';
import { PDFParse } from 'pdf-parse';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return Response.json({ success: false, error: 'OPENAI_API_KEY not configured' }, { status: 500 });
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return Response.json({ success: false, error: 'No file' }, { status: 400 });
    }

    const buffer = await file.arrayBuffer();

    const parser = new PDFParse({ data: Buffer.from(buffer) });
    let textResult;
    try {
      textResult = await parser.getText({ lineEnforce: true });
    } finally {
      try {
        await parser.destroy();
      } catch {
        // ignore
      }
    }

    const fullText = String(textResult?.text || '').trim();

    if (!fullText) {
      return Response.json({ success: false, error: 'Could not extract text from PDF' }, { status: 422 });
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: `Extract Form16 fields. Return ONLY valid JSON.

Format:
{"grossSalary":0,"tds":0,"standardDeduction":0,"deductions80C":0}

Rules:
- grossSalary: Part A Total row, first number (2-10 crore)
- tds: Part A Total row, tax deducted column
- standardDeduction: Part B section 16(ia) (usually 50000)
- deductions80C: Part B section 80C total (0-150000)

Form16 text:
${fullText.substring(0, 12000)}`,
        },
      ],
      temperature: 0.1,
      response_format: { type: 'json_object' },
    });

    const content = completion?.choices?.[0]?.message?.content;
    if (!content) {
      return Response.json({ success: false, error: 'Empty response from AI' }, { status: 502 });
    }

    let fields;
    try {
      fields = JSON.parse(content);
    } catch (e) {
      return Response.json({ success: false, error: `Invalid JSON from AI: ${e?.message || 'parse_failed'}` }, { status: 502 });
    }

    const isValid = Number(fields?.grossSalary) > 100000 && Number(fields?.tds) >= 0;
    const confidence = isValid ? 0.93 : 0.7;

    return Response.json({ success: true, fields, confidence });
  } catch (error) {
    return Response.json({ success: false, error: error.message }, { status: 500 });
  }
}
