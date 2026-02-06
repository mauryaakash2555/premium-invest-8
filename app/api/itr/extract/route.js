import { DocumentProcessorServiceClient } from '@google-cloud/documentai';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getCredentials() {
  const raw = String(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || '').trim();
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function extractFieldsFromText(text) {
  const fields = {};

  // Gross Salary
  const grossPatterns = [
    /gross\s+salary[:\s]+(?:rs\.?|₹)?\s*([\d,]+)/i,
    /gross\s+total\s+income[:\s]+(?:rs\.?|₹)?\s*([\d,]+)/i,
  ];
  for (const pattern of grossPatterns) {
    const match = text.match(pattern);
    if (match) {
      fields.grossSalary = parseInt(String(match[1]).replace(/,/g, ''), 10);
      break;
    }
  }

  // TDS
  const tdsPatterns = [
    /total\s+tds[:\s]+(?:rs\.?|₹)?\s*([\d,]+)/i,
    /tax\s+deducted[:\s]+(?:rs\.?|₹)?\s*([\d,]+)/i,
  ];
  for (const pattern of tdsPatterns) {
    const match = text.match(pattern);
    if (match) {
      fields.tds = parseInt(String(match[1]).replace(/,/g, ''), 10);
      break;
    }
  }

  // Standard Deduction
  const stdDeductionMatch = text.match(/standard\s+deduction[:\s]+(?:rs\.?|₹)?\s*([\d,]+)/i);
  if (stdDeductionMatch) {
    fields.standardDeduction = parseInt(String(stdDeductionMatch[1]).replace(/,/g, ''), 10);
  }

  // 80C Deductions
  const deduction80CMatch = text.match(/(?:deduction\s+)?80c[:\s]+(?:rs\.?|₹)?\s*([\d,]+)/i);
  if (deduction80CMatch) {
    fields.deductions80C = parseInt(String(deduction80CMatch[1]).replace(/,/g, ''), 10);
  }

  // Convenience alias used by the UI calculation flow
  if (typeof fields.deductions !== 'number') {
    const from80c = typeof fields.deductions80C === 'number' ? fields.deductions80C : 0;
    fields.deductions = from80c;
  }

  return fields;
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return Response.json({ success: false, error: 'No file' }, { status: 400 });
    }

    const credentials = getCredentials();
    if (!credentials) {
      return Response.json(
        { success: false, error: 'Google credentials not configured' },
        { status: 500 }
      );
    }

    const projectId = String(process.env.GOOGLE_CLOUD_PROJECT_ID || '').trim();
    const processorId = String(process.env.DOCUMENT_AI_PROCESSOR_ID || '').trim();
    if (!projectId || !processorId) {
      return Response.json(
        { success: false, error: 'Google Document AI processor not configured' },
        { status: 500 }
      );
    }

    const client = new DocumentProcessorServiceClient({ credentials });

    const buffer = await file.arrayBuffer();

    // Call Google Document AI
    const processorName = `projects/${projectId}/locations/us/processors/${processorId}`;

    const [result] = await client.processDocument({
      name: processorName,
      rawDocument: {
        content: Buffer.from(buffer).toString('base64'),
        mimeType: 'application/pdf',
      },
    });

    const text = result?.document?.text || '';

    if (!text || text.length < 100) {
      return Response.json({
        success: false,
        error: 'Could not extract text from PDF',
      });
    }

    // Extract fields
    const fields = extractFieldsFromText(text);

    // Calculate confidence
    const confidence = Object.keys(fields).length >= 3 ? 0.95 : 0.7;

    return Response.json({
      success: true,
      fields,
      confidence,
      rawText: text.substring(0, 1000),
    });
  } catch (error) {
    console.error('Extraction error:', error);
    return Response.json(
      { success: false, error: error?.message || 'Extraction failed' },
      { status: 500 }
    );
  }
}
