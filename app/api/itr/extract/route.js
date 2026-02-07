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
  
  // Gross Salary - Multiple patterns
  const grossPatterns = [
    /salary.*?section\s+17.*?(\d[\d,]{5,})/i,
    /total.*?salary.*?(\d[\d,]{5,})/i,
    /gross.*?salary.*?(\d[\d,]{5,})/i,
    /(\d[\d,]{6,})\s*(?:\.00)?\s*total/i
  ];
  
  for (const pattern of grossPatterns) {
    const match = text.match(pattern);
    if (match) {
      const value = parseInt(match[1].replace(/,/g, '').replace(/\./g, ''));
      if (value > 100000 && value < 100000000) {
        fields.grossSalary = value;
        break;
      }
    }
  }
  
  // TDS - Look for total TDS
  const tdsPatterns = [
    /total.*?(?:rs\.?|₹)?\s*(\d[\d,]{5,})\s*(?:\.00)?\s*(?:\d[\d,]{5,})\s*(?:\.00)?\s*$/im,
    /amount.*?tax.*?deducted.*?(\d[\d,]{5,})/i,
    /tds.*?(\d[\d,]{5,})/i
  ];
  
  for (const pattern of tdsPatterns) {
    const match = text.match(pattern);
    if (match) {
      const value = parseInt(match[1].replace(/,/g, '').replace(/\./g, ''));
      if (value > 10000 && value < 10000000) {
        fields.tds = value;
        break;
      }
    }
  }
  
  // Standard Deduction - Section 16
  const stdMatch = text.match(/standard.*?deduction.*?section.*?16.*?(\d[\d,]{4,})/i);
  if (stdMatch) {
    const value = parseInt(stdMatch[1].replace(/,/g, ''));
    if (value >= 40000 && value <= 75000) {
      fields.standardDeduction = value;
    }
  }
  
  // 80C Deductions
  const deduction80CMatch = text.match(/total.*?deduction.*?section.*?80c.*?(\d[\d,]{5,})/i);
  if (deduction80CMatch) {
    const value = parseInt(deduction80CMatch[1].replace(/,/g, ''));
    if (value >= 0 && value <= 150000) {
      fields.deductions80C = value;
    }
  }
  
  return fields;
}
