import { DocumentProcessorServiceClient } from '@google-cloud/documentai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

let client = null;
try {
  const raw = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;
  if (raw) {
    client = new DocumentProcessorServiceClient({
      credentials: JSON.parse(raw),
    });
  }
} catch {
  client = null;
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return Response.json({ success: false, error: 'No file uploaded' }, { status: 400 });
    }

    if (!client) {
      return Response.json(
        { success: false, error: 'Google Document AI is not configured' },
        { status: 500 }
      );
    }

    const buffer = await file.arrayBuffer();

    const name = `projects/${process.env.GOOGLE_CLOUD_PROJECT_ID}/locations/us/processors/${process.env.DOCUMENT_AI_PROCESSOR_ID}`;

    const [result] = await client.processDocument({
      name,
      rawDocument: {
        content: Buffer.from(buffer).toString('base64'),
        mimeType: 'application/pdf',
      },
    });

    const text = result.document.text;

    if (!text || text.length < 100) {
      return Response.json({
        success: false,
        error: 'Could not extract text from PDF. It may be corrupt or empty.',
      });
    }

    const fields = extractFields(text);
    const confidence = Object.keys(fields).length >= 3 ? 0.95 : 0.75;

    return Response.json({
      success: true,
      fields,
      confidence,
      rawTextPreview: text.substring(0, 1000),
    });
  } catch (error) {
    console.error('Extraction error:', error);
    return Response.json(
      {
        success: false,
        error: error.message,
      },
      { status: 500 }
    );
  }
}

function extractFields(text) {
  const fields = {};

  // Gross Salary
  const grossPatterns = [
    /gross\s+salary[:\s]+(?:rs\.?|₹)?\s*([\d,]+)/i,
    /total\s+amount\s+of\s+salary[:\s]+(?:rs\.?|₹)?\s*([\d,]+)/i,
    /salary\s+as\s+per.*?section.*?17.*?([\d,]+)/i,
  ];
  for (const pattern of grossPatterns) {
    const match = text.match(pattern);
    if (match) {
      const value = parseInt(match[1].replace(/,/g, ''));
      if (value > 10000) {
        fields.grossSalary = value;
        break;
      }
    }
  }

  // TDS
  const tdsPatterns = [
    /total.*?tds[:\s]+(?:rs\.?|₹)?\s*([\d,]+)/i,
    /amount\s+of\s+tax\s+deducted[:\s]+(?:rs\.?|₹)?\s*([\d,]+)/i,
    /tax\s+deducted.*?source[:\s]+(?:rs\.?|₹)?\s*([\d,]+)/i,
  ];
  for (const pattern of tdsPatterns) {
    const match = text.match(pattern);
    if (match) {
      const value = parseInt(match[1].replace(/,/g, ''));
      if (value > 1000) {
        fields.tds = value;
        break;
      }
    }
  }

  // Standard Deduction
  const stdMatch = text.match(/standard\s+deduction[:\s]+(?:rs\.?|₹)?\s*([\d,]+)/i);
  if (stdMatch) {
    fields.standardDeduction = parseInt(stdMatch[1].replace(/,/g, ''));
  }

  // 80C
  const deduction80CMatch = text.match(/(?:deduction.*?)?80c[:\s]+(?:rs\.?|₹)?\s*([\d,]+)/i);
  if (deduction80CMatch) {
    fields.deductions80C = parseInt(deduction80CMatch[1].replace(/,/g, ''));
  }

  return fields;
}
