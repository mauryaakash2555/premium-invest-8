import fs from 'node:fs/promises';
import fsSync from 'node:fs';
import path from 'node:path';

function loadEnvFile(filePath) {
  if (!fsSync.existsSync(filePath)) return;
  const content = fsSync.readFileSync(filePath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx <= 0) continue;
    const key = line.slice(0, idx).trim();
    let value = line.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadEnvFile(path.join(process.cwd(), '.env.local'));
loadEnvFile(path.join(process.cwd(), '.env'));

const { buildMumbaiPropertyVsSipPdfPayload } = await import('../lib/property-vs-sip.js');
const { generateBmWealthBlueprint15PdfBytes } = await import('../lib/pdf/bmWealthBlueprint15.js');

async function main() {
  const outPath = process.env.TEST_PDF_OUT || path.join(process.cwd(), 'tmp', 'property-vs-sip-test.pdf');

  const lead = {
    name: 'Akash',
    email: 'mauryaaksh2555@gmail.com',
    phone: '9999999999',
    city: 'Mumbai',
  };

  const inputs = {
    propertyCost: 20000000, // 2 Cr
    sipMonthly: 50000,
    years: 15,
    inflation: 0.06,
    propertyAppreciation: 0.06,
    sipCagr: 0.12,
  };

  const pdfPayload = buildMumbaiPropertyVsSipPdfPayload({ lead, inputs });
  const bytes = await generateBmWealthBlueprint15PdfBytes(pdfPayload);

  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, Buffer.from(bytes));

  console.log('Wrote PDF:', outPath);
  console.log('Bytes:', bytes?.length ?? 0);
  console.log('Filename meta:', pdfPayload?.meta?.filename ?? null);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
