import fs from 'node:fs';
import path from 'node:path';
import { jsPDF } from 'jspdf';

const outDir = path.join(process.cwd(), 'tests', 'fixtures');
fs.mkdirSync(outDir, { recursive: true });

function writePdf(filename, lines) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(12);
  let y = 60;
  for (const line of lines) {
    doc.text(String(line), 40, y);
    y += 18;
  }
  const bytes = doc.output('arraybuffer');
  fs.writeFileSync(path.join(outDir, filename), Buffer.from(bytes));
}

// Synthetic, for mapping tests only.
writePdf('form16_clean.pdf', [
  'FORM 16',
  'Certificate under section 203',
  'Gross Salary: 123456',
  'Standard Deduction: 50000',
  'Total TDS: 23456',
]);

writePdf('ais_sample.pdf', [
  'Annual Information Statement (AIS)',
  'Interest income: 1200',
  'Dividends: 300',
  'TDS: 100',
]);

writePdf('bank_interest.pdf', [
  'Bank Interest Certificate',
  'Total Interest: 1200',
  'TDS on Interest: 100',
]);

// Create a simple scanned-like JPEG (placeholder). If this repo runs OCR, it should treat this as OCR input.
// We store a minimal 1x1 jpeg; OCR worker should flag low confidence rather than guessing.
const tinyJpeg = Buffer.from(
  '/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQEBAQH/wAALCAABAAEBAREA/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAwT/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCkAAB//9k=',
  'base64'
);
fs.writeFileSync(path.join(outDir, 'form16_scanned.jpg'), tinyJpeg);

console.log('Fixtures generated in', outDir);
