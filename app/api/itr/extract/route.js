import { DocumentProcessorServiceClient } from '@google-cloud/documentai';

const client = new DocumentProcessorServiceClient({
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)
});

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    
    if (!file) {
      return Response.json({ success: false, error: 'No file uploaded' }, { status: 400 });
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

    // USE FORM FIELDS from Document AI (not raw text)
    const document = result.document;
    const formFields = {};
    
    // Document AI returns key-value pairs for forms
    if (document.pages) {
      for (const page of document.pages) {
        if (page.formFields) {
          for (const field of page.formFields) {
            const fieldName = getFieldText(field.fieldName, document);
            const fieldValue = getFieldText(field.fieldValue, document);
            
            // Store all form fields
            formFields[fieldName.toLowerCase().trim()] = fieldValue.trim();
          }
        }
      }
    }
    
    // Also get tables (for Part A summary)
    const tables = [];
    if (document.pages) {
      for (const page of document.pages) {
        if (page.tables) {
          for (const table of page.tables) {
            const tableData = extractTable(table, document);
            tables.push(tableData);
          }
        }
      }
    }
    
    // Extract known fields using both form fields and tables
    const fields = extractKnownFields(formFields, tables, document.text);
    
    // Calculate confidence based on how many fields found
    const confidence = Object.keys(fields).length >= 2 ? 0.9 : 0.7;

    return Response.json({
      success: true,
      fields,
      confidence,
      rawFormFields: formFields, // For debugging
      rawTextPreview: document.text.substring(0, 1000)
    });

  } catch (error) {
    console.error('Extraction error:', error);
    return Response.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

// Helper: Get text from Document AI text segments
function getFieldText(field, document) {
  if (!field || !field.textAnchor || !field.textAnchor.textSegments) {
    return '';
  }
  
  let text = '';
  for (const segment of field.textAnchor.textSegments) {
    const startIndex = parseInt(segment.startIndex) || 0;
    const endIndex = parseInt(segment.endIndex);
    text += document.text.substring(startIndex, endIndex);
  }
  
  return text;
}

// Helper: Extract table data
function extractTable(table, document) {
  const rows = [];
  
  if (table.headerRows) {
    for (const row of table.headerRows) {
      const cells = row.cells.map(cell => getFieldText(cell.layout, document));
      rows.push(cells);
    }
  }
  
  if (table.bodyRows) {
    for (const row of table.bodyRows) {
      const cells = row.cells.map(cell => getFieldText(cell.layout, document));
      rows.push(cells);
    }
  }
  
  return rows;
}

// Helper: Extract known ITR fields
function extractKnownFields(formFields, tables, fullText) {
  const fields = {};
  
  // Try to find fields from form key-value pairs first
  for (const [key, value] of Object.entries(formFields)) {
    const cleanValue = value.replace(/[^0-9]/g, '');
    const numValue = parseInt(cleanValue);
    
    if (isNaN(numValue)) continue;
    
    // Gross Salary
    if (key.includes('salary') && key.includes('section') && key.includes('17')) {
      if (numValue > 100000 && numValue < 100000000) {
        fields.grossSalary = numValue;
      }
    }
    
    // Standard Deduction
    if (key.includes('standard') && key.includes('deduction')) {
      if (numValue >= 40000 && numValue <= 75000) {
        fields.standardDeduction = numValue;
      }
    }
    
    // 80C
    if (key.includes('80c')) {
      if (numValue <= 150000) {
        fields.deductions80C = numValue;
      }
    }
  }
  
  // Try to find from tables (Part A summary)
  for (const table of tables) {
    for (let i = 0; i < table.length; i++) {
      const row = table[i];
      const rowText = row.join(' ').toLowerCase();
      
      // Look for "Total" row with 3 numbers
      if (rowText.includes('total')) {
        const numbers = row
          .map(cell => parseInt(cell.replace(/[^0-9]/g, '')))
          .filter(n => !isNaN(n) && n > 10000);
        
        if (numbers.length >= 2) {
          // First large number is usually gross salary
          if (!fields.grossSalary && numbers[0] > 100000) {
            fields.grossSalary = numbers[0];
          }
          // Second/third is TDS
          if (!fields.tds && numbers[1] > 10000 && numbers[1] < 10000000) {
            fields.tds = numbers[1];
          }
        }
      }
    }
  }
  
  // Fallback: Use regex on full text (last resort)
  if (!fields.grossSalary) {
    const grossMatch = fullText.match(/section\s+17.*?(\d{7,})/i);
    if (grossMatch) {
      fields.grossSalary = parseInt(grossMatch[1]);
    }
  }
  
  if (!fields.tds) {
    const tdsMatch = fullText.match(/Total.*?(\d{7,}).*?(\d{6,}).*?(\d{6,})/i);
    if (tdsMatch) {
      fields.tds = parseInt(tdsMatch[2]);
    }
  }
  
  if (!fields.standardDeduction) {
    const stdMatch = fullText.match(/standard.*?deduction.*?(\d{5})/i);
    if (stdMatch) {
      const val = parseInt(stdMatch[1]);
      if (val >= 40000 && val <= 75000) {
        fields.standardDeduction = val;
      }
    }
  }
  
  if (!fields.deductions80C) {
    const deduction80CMatch = fullText.match(/80c.*?(\d{6})/i);
    if (deduction80CMatch) {
      const val = parseInt(deduction80CMatch[1]);
      if (val <= 150000) {
        fields.deductions80C = val;
      }
    }
  }
  
  return fields;
}
